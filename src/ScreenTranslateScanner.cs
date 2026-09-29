using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace TeachMeAI;

/// <summary>
/// Escáner Cuántico de Traducción Visual de Pantalla.
/// Sigue el movimiento del mouse, proyecta el haz de luz del cursor
/// y al pasar sobre cualquier texto (juegos, PDFs, ventanas de Windows)
/// extrae los glifos con Direct3D/WinRT OCR y despliega el HUD holográfico.
/// </summary>
public class ScreenTranslateScanner
{
    private static readonly Lazy<ScreenTranslateScanner> _instance = new(() => new ScreenTranslateScanner());
    public static ScreenTranslateScanner Instance => _instance.Value;

    private readonly DispatcherTimer _timer;
    private POINT _lastPos;
    private POINT _lastTriggeredPos;
    private DateTime _restStartTime;
    private bool _isScanning = false;
    private bool _hasActiveTranslation = false;
    private string? _lastTranslatedWord;

    public bool IsEnabled { get; private set; } = false;
    public int DwellDelayMs { get; set; } = 3000;
    public bool AutoPronounceOnScan { get; set; } = false;
    public event Action<bool>? OnStateChanged;

    public ScreenTranslateScanner()
    {
        _timer = new DispatcherTimer(DispatcherPriority.Background)
        {
            Interval = TimeSpan.FromMilliseconds(50)
        };
        _timer.Tick += Timer_Tick;
    }

    public void Toggle()
    {
        if (IsEnabled)
        {
            Stop();
        }
        else
        {
            Start();
        }
    }

    public void Start()
    {
        IsEnabled = true;
        GetCursorPos(out _lastPos);
        _restStartTime = DateTime.UtcNow;
        _timer.Start();

        CursorBeamOverlayWindow.Instance.UpdatePosition(_lastPos.X, _lastPos.Y);
        CursorBeamOverlayWindow.Instance.SetDwellProgress(0.0);
        OnStateChanged?.Invoke(true);
    }

    public void Stop()
    {
        IsEnabled = false;
        _timer.Stop();
        CursorBeamOverlayWindow.Instance.SetDwellProgress(0.0);
        CursorBeamOverlayWindow.Instance.Hide();
        TranslateOverlayWindow.Instance.FadeOutAndHide(100);
        _hasActiveTranslation = false;
        _lastTranslatedWord = null;
        OnStateChanged?.Invoke(false);
    }

    private async void Timer_Tick(object? sender, EventArgs e)
    {
        try
        {
            if (!IsEnabled) return;

            GetCursorPos(out POINT currentPos);
            CursorBeamOverlayWindow.Instance.UpdatePosition(currentPos.X, currentPos.Y);

            int delta = Math.Max(Math.Abs(currentPos.X - _lastPos.X), Math.Abs(currentPos.Y - _lastPos.Y));

            if (delta > 8)
            {
                _lastPos = currentPos;
                _restStartTime = DateTime.UtcNow;

                // Al mover el mouse, reiniciar la barra progresiva de 3s
                CursorBeamOverlayWindow.Instance.SetDwellProgress(0.0);

                // Si se aleja del área de la frase activa
                if (_hasActiveTranslation)
                {
                    int distX = Math.Abs(currentPos.X - _lastTriggeredPos.X);
                    int distY = Math.Abs(currentPos.Y - _lastTriggeredPos.Y);
                    if (distX > 240 || distY > 50)
                    {
                        TranslateOverlayWindow.Instance.FadeOutAndHide(160);
                        _hasActiveTranslation = false;
                    }
                }
            }
            else
            {
                // El cursor reposa intencionalmente sobre una frase o palabra
                var elapsedMs = (DateTime.UtcNow - _restStartTime).TotalMilliseconds;

                // Actualizar barra de carga óptica suave (0.0 a 1.0 durante los 3 segundos)
                double progress = Math.Clamp(elapsedMs / (double)DwellDelayMs, 0.0, 1.0);
                CursorBeamOverlayWindow.Instance.SetDwellProgress(progress);

                // Delay de 3 segundos cumplido para completar la captura y soltar la traducción
                if (elapsedMs >= DwellDelayMs && !_isScanning)
                {
                    // Si ya está mostrada esta misma posición o área, evitar recalcular
                    if (_hasActiveTranslation)
                    {
                        int distX = Math.Abs(currentPos.X - _lastTriggeredPos.X);
                        int distY = Math.Abs(currentPos.Y - _lastTriggeredPos.Y);
                        if (distX <= 120 && distY <= 24) return;
                    }

                    _isScanning = true;
                    try
                    {
                        await PerformScanAsync(currentPos.X, currentPos.Y);
                    }
                    finally
                    {
                        _isScanning = false;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            App.SafeLog($"[ScreenTranslateScanner] Timer_Tick notice: {ex.Message}\n");
        }
    }

    private async Task PerformScanAsync(int x, int y)
    {
        try
        {
            var result = await TranslateEngine.Instance.ScanAndTranslateAtPointAsync(x, y, TranslateEngine.Instance.CurrentTargetLanguage);
            if (result != null && !string.IsNullOrWhiteSpace(result.TranslatedText))
            {
                // Evitar re-animar si es exactamente la misma palabra
                if (result.OriginalText.Equals(_lastTranslatedWord, StringComparison.OrdinalIgnoreCase) && _hasActiveTranslation)
                {
                    return;
                }

                _lastTranslatedWord = result.OriginalText;
                _lastTriggeredPos = new POINT { X = x, Y = y };
                _hasActiveTranslation = true;

                // 1. Destello cuántico de bloqueo y lectura completada en la barra de detección
                CursorBeamOverlayWindow.Instance.TriggerCaptureLock();

                // 2. Despliegue de la traducción con barrido láser vertical de izquierda a derecha
                TranslateOverlayWindow.Instance.ShowTranslation(result, x, y);
            }
            else
            {
                CursorBeamOverlayWindow.Instance.SetDwellProgress(0.0);
            }
        }
        catch (Exception ex)
        {
            CursorBeamOverlayWindow.Instance.SetDwellProgress(0.0);
            App.SafeLog($"[ScreenTranslateScanner] PerformScanAsync notice: {ex.Message}\n");
        }
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
