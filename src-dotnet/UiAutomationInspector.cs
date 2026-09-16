using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Automation;

namespace TeachMeAI;

/// <summary>
/// Información de accesibilidad nativa y UI Automation extraída en microsegundos desde Windows.
/// </summary>
public record struct NativeElementInfo(
    string Name,
    string ControlType,
    string LocalizedControlType,
    string HelpText,
    string Value,
    string ItemStatus,
    string ItemType,
    string AcceleratorKey,
    string AccessKey,
    string FrameworkId,
    string ClassName,
    string ParentContainerName,
    bool HasNativeData
);

/// <summary>
/// Motor de inspección nativa de Windows (UI Automation + Win32 Tooltip).
/// Extrae la metadata que las aplicaciones (Reason, Ableton, VS Code, Chrome, etc.)
/// registran en el subsistema de accesibilidad de Windows 11 sin latencia.
/// </summary>
public static class UiAutomationInspector
{
    private const int TimeoutMs = 120; // Límite estricto para no bloquear jamás el hilo del cursor

    public static NativeElementInfo InspectElementAt(int x, int y)
    {
        // Ejecutar en hilo de fondo con timeout estricto para evitar bloqueos por aplicaciones colgadas
        try
        {
            var task = Task.Run(() => InspectInternal(x, y));
            if (task.Wait(TimeoutMs))
            {
                return task.Result;
            }
        }
        catch { }

        return FallbackWin32Tooltip(x, y);
    }

    private static NativeElementInfo InspectInternal(int x, int y)
    {
        string name = string.Empty;
        string controlType = string.Empty;
        string localizedControlType = string.Empty;
        string helpText = string.Empty;
        string value = string.Empty;
        string itemStatus = string.Empty;
        string itemType = string.Empty;
        string acceleratorKey = string.Empty;
        string accessKey = string.Empty;
        string frameworkId = string.Empty;
        string className = string.Empty;
        string parentContainer = string.Empty;
        bool hasData = false;

        // 1. Revisar si hay un Tooltip Win32 nativo activo en las coordenadas
        var tooltipInfo = FallbackWin32Tooltip(x, y);
        if (tooltipInfo.HasNativeData)
        {
            helpText = tooltipInfo.HelpText;
            hasData = true;
        }

        try
        {
            var pt = new System.Windows.Point(x, y);
            var element = AutomationElement.FromPoint(pt);

            if (element != null)
            {
                try { name = element.Current.Name ?? string.Empty; } catch { }
                try { controlType = element.Current.ControlType?.ProgrammaticName?.Replace("ControlType.", "") ?? string.Empty; } catch { }
                try { localizedControlType = element.Current.LocalizedControlType ?? string.Empty; } catch { }
                try 
                { 
                    string ht = element.Current.HelpText ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(ht))
                    {
                        helpText = string.IsNullOrWhiteSpace(helpText) ? ht : $"{helpText} • {ht}";
                    }
                } 
                catch { }

                try { itemStatus = element.Current.ItemStatus ?? string.Empty; } catch { }
                try { itemType = element.Current.ItemType ?? string.Empty; } catch { }
                try { acceleratorKey = element.Current.AcceleratorKey ?? string.Empty; } catch { }
                try { accessKey = element.Current.AccessKey ?? string.Empty; } catch { }
                try { frameworkId = element.Current.FrameworkId ?? string.Empty; } catch { }
                try { className = element.Current.ClassName ?? string.Empty; } catch { }

                // Extraer valor de RangeValuePattern (ej. perillas de volumen/frecuencia, faders)
                try
                {
                    if (element.TryGetCurrentPattern(RangeValuePattern.Pattern, out object? rangeObj) && rangeObj is RangeValuePattern rangePattern)
                    {
                        var rCur = rangePattern.Current;
                        value = $"{rCur.Value:0.##} (Min: {rCur.Minimum:0.##}, Max: {rCur.Maximum:0.##})";
                    }
                }
                catch { }

                // Extraer valor de ValuePattern (cajas de texto, selectores)
                if (string.IsNullOrWhiteSpace(value))
                {
                    try
                    {
                        if (element.TryGetCurrentPattern(ValuePattern.Pattern, out object? valObj) && valObj is ValuePattern valPattern)
                        {
                            value = valPattern.Current.Value ?? string.Empty;
                        }
                    }
                    catch { }
                }

                // Extraer valor de TogglePattern (botones de encendido, switches, Mute, Solo)
                if (string.IsNullOrWhiteSpace(value))
                {
                    try
                    {
                        if (element.TryGetCurrentPattern(TogglePattern.Pattern, out object? toggleObj) && toggleObj is TogglePattern togglePattern)
                        {
                            value = togglePattern.Current.ToggleState switch
                            {
                                ToggleState.On => "Activado (ON)",
                                ToggleState.Off => "Desactivado (OFF)",
                                _ => "Indeterminado"
                            };
                        }
                    }
                    catch { }
                }

                // Subir 1 o 2 niveles en el árbol para capturar el contenedor padre (ej. "Master Section", "Kong Drum Designer", "Toolbar")
                try
                {
                    var parent = TreeWalker.ControlViewWalker.GetParent(element);
                    if (parent != null)
                    {
                        string pName = parent.Current.Name ?? string.Empty;
                        if (!string.IsNullOrWhiteSpace(pName) && pName != name)
                        {
                            parentContainer = pName;
                        }
                        else
                        {
                            var grandParent = TreeWalker.ControlViewWalker.GetParent(parent);
                            if (grandParent != null)
                            {
                                string gpName = grandParent.Current.Name ?? string.Empty;
                                if (!string.IsNullOrWhiteSpace(gpName) && gpName != name)
                                {
                                    parentContainer = gpName;
                                }
                            }
                        }
                    }
                }
                catch { }

                if (!string.IsNullOrWhiteSpace(name) || !string.IsNullOrWhiteSpace(value) || !string.IsNullOrWhiteSpace(helpText))
                {
                    hasData = true;
                }
            }
        }
        catch { }

        return new NativeElementInfo(
            Name: name,
            ControlType: !string.IsNullOrWhiteSpace(localizedControlType) ? localizedControlType : controlType,
            LocalizedControlType: localizedControlType,
            HelpText: helpText,
            Value: value,
            ItemStatus: itemStatus,
            ItemType: itemType,
            AcceleratorKey: acceleratorKey,
            AccessKey: accessKey,
            FrameworkId: frameworkId,
            ClassName: className,
            ParentContainerName: parentContainer,
            HasNativeData: hasData
        );
    }

    /// <summary>
    /// Fallback Win32 para tooltips clásicos (tooltips_class32)
    /// </summary>
    private static NativeElementInfo FallbackWin32Tooltip(int x, int y)
    {
        try
        {
            var pt = new NativeKernelEngine.POINT { X = x, Y = y };
            IntPtr hwnd = NativeKernelEngine.WindowFromPoint(pt);
            if (hwnd != IntPtr.Zero)
            {
                var sbClass = new StringBuilder(256);
                GetClassName(hwnd, sbClass, 256);
                string cls = sbClass.ToString();

                if (cls.IndexOf("tooltip", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    var sbText = new StringBuilder(512);
                    GetWindowText(hwnd, sbText, 512);
                    string txt = sbText.ToString();
                    if (!string.IsNullOrWhiteSpace(txt))
                    {
                        return new NativeElementInfo(
                            Name: txt,
                            ControlType: "Tooltip Win32",
                            LocalizedControlType: "Tooltip Flotante",
                            HelpText: txt,
                            Value: string.Empty,
                            ItemStatus: string.Empty,
                            ItemType: string.Empty,
                            AcceleratorKey: string.Empty,
                            AccessKey: string.Empty,
                            FrameworkId: "Win32",
                            ClassName: cls,
                            ParentContainerName: string.Empty,
                            HasNativeData: true
                        );
                    }
                }
            }
        }
        catch { }

        return default;
    }

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
}
