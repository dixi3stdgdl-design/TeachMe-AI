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
    private DateTime _restStartTime;
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
        _restStartTime = DateTime.UtcNow;
        if (_isDwelling)
        {
            _indicator.Hide();
            _isDwelling = false;
        }
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        if (!IsEnabled) return;

        GetCursorPos(out POINT currentPos);

        // Check if cursor is over TeachMe AI itself (so typing or clicking in app is never interrupted)
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

        if (dx > 12 || dy > 12)
        {
            // Cursor moved
            _lastPos = currentPos;
            _restStartTime = DateTime.UtcNow;
            if (_isDwelling)
            {
                _indicator.Hide();
                _isDwelling = false;
            }
        }
        else
        {
            // Cursor is resting
            var elapsed = (DateTime.UtcNow - _restStartTime).TotalSeconds;

            // Start showing indicator after 0.6s of rest
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
        _restStartTime = DateTime.UtcNow.AddSeconds(5); // Cooldown to avoid re-triggering immediately

        try
        {
            var winInfo = RustNativeBridge.InspectWindowAtPoint(x, y);

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

            var data = new InspectionData
            {
                Name = winInfo.Title,
                ProcessName = winInfo.ProcessName,
                ProcessId = winInfo.ProcessId,
                OcrText = $"[HWND: 0x{winInfo.Hwnd.ToInt64():X}] {winInfo.Title}",
                VerdictText = $"Proceso: {winInfo.ProcessName}.exe • PID: {winInfo.ProcessId}",
                Summary = $"Elemento detectado bajo reposo de cursor en la ventana '{winInfo.Title}' ({winInfo.ProcessName}).",
                ExePath = $"C:\\Windows\\System32\\{winInfo.ProcessName}.exe",
                CliSnippet = $"Get-Process -Id {winInfo.ProcessId} | Select-Object Id, ProcessName, Path, CPU, WorkingSet64"
            };

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
