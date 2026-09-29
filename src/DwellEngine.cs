using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Threading;

namespace TeachMeAI;

public class DwellEngine
{
    public event Action<InspectionData, byte[], int, int>? OnDwellTriggered;

    private readonly DispatcherTimer _timer;
    private readonly DwellIndicatorWindow _indicator;
    private POINT _lastPos;
    private POINT _lastTriggeredPos;
    private bool _hasActivePanel = false;
    private DateTime _restStartTime;
    private DateTime _typingCooldownUntil = DateTime.MinValue;
    private bool _isDwelling = false;

    public bool IsEnabled { get; set; } = true;
    public double DwellDurationSeconds { get; set; } = 3.0;

    public DwellEngine()
    {
        _indicator = new DwellIndicatorWindow();
        _timer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(80)
        };
        _timer.Tick += Timer_Tick;
    }

    public void Start()
    {
        GetCursorPos(out _lastPos);
        _restStartTime = DateTime.UtcNow;
        _timer.Start();
    }

    public void Stop()
    {
        _timer.Stop();
        _indicator.Hide();
        _isDwelling = false;
        _hasActivePanel = false;
    }

    public void TriggerImmediate()
    {
        if (_isDwelling)
        {
            ExecuteDwellAction(_lastPos.X, _lastPos.Y);
        }
    }

    public void NotifyUserActivity()
    {
        // Se detectó pulsación de tecla: otorgar 2.0 segundos de gracia y silencio al radar
        _typingCooldownUntil = DateTime.UtcNow.AddSeconds(2.0);
        _restStartTime = DateTime.UtcNow;

        if (_isDwelling)
        {
            _indicator.Hide();
            _isDwelling = false;
        }

        // Si el usuario empieza a escribir en una app externa (IDE, chat, documento, etc.):
        // Desvanecer el panel activo inmediatamente para que no tape lo que está escribiendo
        if (_hasActivePanel)
        {
            bool isTypingInHud = false;
            try
            {
                isTypingInHud = HudWindow.Instance.Dispatcher.Invoke(() => HudWindow.Instance.IsInteractingWithHud());
            }
            catch { }

            if (!isTypingInHud)
            {
                HudWindow.Instance.FadeOutAndHide(150);
                _hasActivePanel = false;
            }
        }
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        if (!IsEnabled) return;

        // 0. Si el usuario está escribiendo o recién terminó de escribir, mantener el radar en reposo
        if (DateTime.UtcNow < _typingCooldownUntil)
        {
            _restStartTime = DateTime.UtcNow;
            if (_isDwelling)
            {
                _indicator.Hide();
                _isDwelling = false;
            }
            return;
        }

        GetCursorPos(out POINT currentPos);

        // 1. Si el cursor está sobre la ventana HUD de TeachMe AI (usuario interactuando con las pestañas o chat)
        if (HudWindow.Instance.IsMouseOverHud(currentPos.X, currentPos.Y))
        {
            _restStartTime = DateTime.UtcNow;
            if (_isDwelling)
            {
                _indicator.Hide();
                _isDwelling = false;
            }
            return;
        }

        // 2. Si el cursor está sobre la ventana principal de TeachMe AI
        try
        {
            IntPtr hwndAtCursor = RustNativeBridge.WindowFromPoint(new RustNativeBridge.POINT { X = currentPos.X, Y = currentPos.Y });
            RustNativeBridge.GetWindowThreadProcessId(hwndAtCursor, out uint pidUnderCursor);
            if (pidUnderCursor == (uint)System.Diagnostics.Process.GetCurrentProcess().Id)
            {
                _restStartTime = DateTime.UtcNow;
                if (_isDwelling)
                {
                    _indicator.Hide();
                    _isDwelling = false;
                }
                return;
            }
        }
        catch { }

        int dx = Math.Abs(currentPos.X - _lastPos.X);
        int dy = Math.Abs(currentPos.Y - _lastPos.Y);

        // Se requiere un desplazamiento real (> 10px) para no reaccionar al micro-temblor de mano
        bool hasMovedSignificantly = dx > 10 || dy > 10;

        if (hasMovedSignificantly)
        {
            _lastPos = currentPos;
            _restStartTime = DateTime.UtcNow;
            if (_isDwelling)
            {
                _indicator.Hide();
                _isDwelling = false;
            }

            // Si hay un panel activo y el usuario alejó el cursor del elemento inspeccionado (> 32px)
            if (_hasActivePanel)
            {
                int distFromTriggered = Math.Max(Math.Abs(currentPos.X - _lastTriggeredPos.X), Math.Abs(currentPos.Y - _lastTriggeredPos.Y));
                if (distFromTriggered > 32)
                {
                    // Desvanecer el panel suavemente
                    HudWindow.Instance.FadeOutAndHide();
                    _hasActivePanel = false;
                }
            }
        }
        else
        {
            // El cursor está en reposo
            // REGLA CRÍTICA: Si ya se generó el panel en este mismo control y el ratón no se ha movido, NO recargar
            if (_hasActivePanel)
            {
                int distFromTriggered = Math.Max(Math.Abs(currentPos.X - _lastTriggeredPos.X), Math.Abs(currentPos.Y - _lastTriggeredPos.Y));
                if (distFromTriggered <= 32)
                {
                    // El usuario sigue en el mismo control; no volver a cargar
                    return;
                }
            }

            var elapsed = (DateTime.UtcNow - _restStartTime).TotalSeconds;

            // Iniciar indicador después de 0.6s de reposo
            if (elapsed >= 0.6)
            {
                _isDwelling = true;
                double remaining = Math.Max(0, DwellDurationSeconds - elapsed);

                string phase = "🔍 Fijando HWND...";
                if (elapsed > 1.0) phase = "🧠 Extrayendo OCR...";
                if (elapsed > 2.0) phase = "✨ Analizando IA...";

                _indicator.Left = currentPos.X + 18;
                _indicator.Top = currentPos.Y - 24;
                _indicator.UpdateProgress(remaining, phase);

                if (!_indicator.IsVisible)
                {
                    _indicator.Show();
                }

                if (elapsed >= DwellDurationSeconds)
                {
                    ExecuteDwellAction(currentPos.X, currentPos.Y);
                }
            }
        }
    }

    private void ExecuteDwellAction(int x, int y)
    {
        _indicator.Hide();
        _isDwelling = false;
        _lastTriggeredPos = new POINT { X = x, Y = y };
        _hasActivePanel = true;

        try
        {
            var winInfo = RustNativeBridge.InspectWindowAtPoint(x, y);
            var nativeInfo = UiAutomationInspector.InspectElementAt(x, y);

            // Capture 160x100 area around cursor
            int capW = 160;
            int capH = 100;
            int capX = Math.Max(0, x - capW / 2);
            int capY = Math.Max(0, y - capH / 2);

            byte[] imageBytes;
            using (var bmp = new Bitmap(capW, capH))
            {
                using var g = Graphics.FromImage(bmp);
                g.CopyFromScreen(capX, capY, 0, 0, new System.Drawing.Size(capW, capH), CopyPixelOperation.SourceCopy);
                using var ms = new MemoryStream();
                bmp.Save(ms, ImageFormat.Png);
                imageBytes = ms.ToArray();
            }

            var data = GeminiClient.GenerateFallbackData(winInfo.Title, winInfo.ProcessName, winInfo.ProcessId, nativeInfo);
            data.ExePath = $"C:\\Windows\\System32\\{winInfo.ProcessName}.exe";
            data.CliSnippet = $"Get-Process -Id {winInfo.ProcessId} | Select-Object Id, ProcessName, Path, CPU, WorkingSet64";

            OnDwellTriggered?.Invoke(data, imageBytes, x + 24, y - 24);
        }
        catch { }
    }

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;
    }
}
