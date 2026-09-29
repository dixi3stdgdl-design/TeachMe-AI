using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace TeachMeAI;

/// <summary>
/// Motor Nativo de Ultra-Alto Rendimiento en C# Moderno (Unsafe, Stackalloc, Zero-Allocation).
/// Reemplaza la necesidad de binarios externos con llamadas directas al kernel Win32 a velocidad C/Rust.
/// </summary>
public static unsafe class NativeKernelEngine
{
    [StructLayout(LayoutKind.Sequential)]
    public struct POINT
    {
        public int X;
        public int Y;
    }

    public record struct WindowInspectionData(
        IntPtr Hwnd,
        uint ProcessId,
        string Title,
        string ProcessName,
        string ClassName,
        string ExePath,
        bool IsElevated
    );

    /// <summary>
    /// Inspecciona la ventana, control UI, jerarquía de ventanas y proceso en las coordenadas (x, y)
    /// utilizando stackalloc para evitar trabajo al Garbage Collector.
    /// </summary>
    public static WindowInspectionData InspectWindowAtPoint(int x, int y)
    {
        var pt = new POINT { X = x, Y = y };
        IntPtr hwnd = WindowFromPoint(pt);

        if (hwnd == IntPtr.Zero)
        {
            return new WindowInspectionData(IntPtr.Zero, 0, "Escritorio de Windows", "explorer", "Progman", "C:\\Windows\\explorer.exe", false);
        }

        // 1. Extraer ClassName del control hijo exacto donde está el cursor (Stackalloc)
        char* pClassBuf = stackalloc char[256];
        int classLen = GetClassNameW(hwnd, pClassBuf, 256);
        string className = classLen > 0 ? new string(pClassBuf, 0, classLen) : "UnknownClass";

        // 2. Subir a la ventana raíz para el contexto global de la aplicación
        IntPtr rootHwnd = GetAncestor(hwnd, GA_ROOT);
        IntPtr targetHwnd = rootHwnd != IntPtr.Zero ? rootHwnd : hwnd;

        // 3. Extraer ProcessId
        uint pid = 0;
        GetWindowThreadProcessId(targetHwnd, &pid);

        // 4. Extraer Título de la ventana en Stackalloc
        char* pTitleBuf = stackalloc char[512];
        int titleLen = GetWindowTextW(targetHwnd, pTitleBuf, 512);
        string title = titleLen > 0 ? new string(pTitleBuf, 0, titleLen) : string.Empty;

        // 5. Extraer Proceso, Ruta real del ejecutable y Permisos
        string procName = "Desconocido";
        string exePath = string.Empty;
        bool isElevated = false;

        if (pid > 0)
        {
            // Intentar leer ruta completa vía API de Kernel Win32
            IntPtr hProc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);
            if (hProc != IntPtr.Zero)
            {
                try
                {
                    char* pPathBuf = stackalloc char[1024];
                    uint pathSize = 1024;
                    if (QueryFullProcessImageNameW(hProc, 0, pPathBuf, &pathSize))
                    {
                        exePath = new string(pPathBuf, 0, (int)pathSize);
                        procName = Path.GetFileNameWithoutExtension(exePath);
                    }
                }
                finally
                {
                    CloseHandle(hProc);
                }
            }

            // Fallback con Process si no se obtuvo la ruta
            if (string.IsNullOrEmpty(exePath))
            {
                try
                {
                    using var p = Process.GetProcessById((int)pid);
                    procName = p.ProcessName;
                    if (string.IsNullOrWhiteSpace(title))
                    {
                        title = p.MainWindowTitle;
                    }
                }
                catch
                {
                    isElevated = true;
                    procName = "Proceso de Sistema / Elevado";
                }
            }
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            title = $"{procName} [{className}]";
        }

        if (string.IsNullOrEmpty(exePath))
        {
            exePath = $"C:\\Windows\\System32\\{procName}.exe";
        }

        return new WindowInspectionData(targetHwnd, pid, title, procName, className, exePath, isElevated);
    }

    /// <summary>
    /// Captura directa de pantalla de alto rendimiento
    /// </summary>
    public static byte[] CaptureScreenArea(int x, int y, int width, int height)
    {
        if (width <= 0 || height <= 0) return Array.Empty<byte>();

        int screenW = GetSystemMetrics(SM_CXVIRTUALSCREEN);
        int screenH = GetSystemMetrics(SM_CYVIRTUALSCREEN);
        int screenX = GetSystemMetrics(SM_XVIRTUALSCREEN);
        int screenY = GetSystemMetrics(SM_YVIRTUALSCREEN);

        int clampX = Math.Max(screenX, x);
        int clampY = Math.Max(screenY, y);
        int clampW = Math.Min(width, (screenX + screenW) - clampX);
        int clampH = Math.Min(height, (screenY + screenH) - clampY);

        if (clampW <= 0 || clampH <= 0) return Array.Empty<byte>();

        using var bmp = new Bitmap(clampW, clampH, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(bmp))
        {
            g.CopyFromScreen(clampX, clampY, 0, 0, new Size(clampW, clampH), CopyPixelOperation.SourceCopy);
        }

        using var ms = new MemoryStream();
        bmp.Save(ms, ImageFormat.Png);
        return ms.ToArray();
    }

    public static string CaptureRectToBase64(int x, int y, int width, int height)
    {
        byte[] bytes = CaptureScreenArea(x, y, width, height);
        if (bytes.Length == 0) return string.Empty;
        return "data:image/png;base64," + Convert.ToBase64String(bytes);
    }

    #region Win32 Kernel P/Invokes de Ultra-Baja Latencia

    private const uint GA_ROOT = 2;
    private const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
    private const int SM_XVIRTUALSCREEN = 76;
    private const int SM_YVIRTUALSCREEN = 77;
    private const int SM_CXVIRTUALSCREEN = 78;
    private const int SM_CYVIRTUALSCREEN = 79;

    [DllImport("user32.dll", ExactSpelling = true)]
    public static extern IntPtr WindowFromPoint(POINT point);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    public static extern int GetWindowTextW(IntPtr hWnd, char* lpString, int nMaxCount);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    public static extern int GetClassNameW(IntPtr hWnd, char* lpClassName, int nMaxCount);

    [DllImport("user32.dll", ExactSpelling = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, uint* lpdwProcessId);

    [DllImport("user32.dll", ExactSpelling = true)]
    public static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);

    [DllImport("user32.dll", ExactSpelling = true)]
    public static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll", ExactSpelling = true)]
    public static extern bool GetCursorPos(POINT* lpPoint);

    [DllImport("kernel32.dll", ExactSpelling = true)]
    private static extern IntPtr OpenProcess(uint processAccess, bool bInheritHandle, uint processId);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern bool QueryFullProcessImageNameW(IntPtr hProcess, uint dwFlags, char* lpExeName, uint* lpdwSize);

    [DllImport("kernel32.dll", ExactSpelling = true)]
    private static extern bool CloseHandle(IntPtr hObject);

    #endregion
}

/// <summary>
/// Redirige de forma transparente y compatible las llamadas antiguas de RustNativeBridge
/// hacia el nuevo NativeKernelEngine de C# puro.
/// </summary>
public static class RustNativeBridge
{
    public static bool IsRustEngineActive => false; // Motor nativo C# 100% integrado

    public static (IntPtr Hwnd, uint ProcessId, string Title, string ProcessName) InspectWindowAtPoint(int x, int y)
    {
        var data = NativeKernelEngine.InspectWindowAtPoint(x, y);
        return (data.Hwnd, data.ProcessId, data.Title, data.ProcessName);
    }

    public static string CaptureRectToBase64(int x, int y, int width, int height)
    {
        return NativeKernelEngine.CaptureRectToBase64(x, y, width, height);
    }

    public static IntPtr WindowFromPoint(NativeKernelEngine.POINT point)
    {
        return NativeKernelEngine.WindowFromPoint(point);
    }

    public static unsafe uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId)
    {
        uint pid = 0;
        uint res = NativeKernelEngine.GetWindowThreadProcessId(hWnd, &pid);
        lpdwProcessId = pid;
        return res;
    }

    public struct POINT
    {
        public int X;
        public int Y;
        public static implicit operator NativeKernelEngine.POINT(POINT p) => new() { X = p.X, Y = p.Y };
    }
}
