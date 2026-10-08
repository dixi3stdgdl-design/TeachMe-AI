using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media.Animation;

namespace ToolTipAI;

public partial class CursorBeamOverlayWindow : Window
{
    private const int GWL_EXSTYLE = -20;
    private const int WS_EX_TRANSPARENT = 0x00000020;
    private const int WS_EX_TOOLWINDOW = 0x00000080;
    private const int WS_EX_NOACTIVATE = 0x08000000;

    // Exclusión total de la ventana de captura de pantalla DWM
    private const uint WDA_EXCLUDEFROMCAPTURE = 0x00000011;

    [DllImport("user32.dll")]
    private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll")]
    private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    private static extern bool SetWindowDisplayAffinity(IntPtr hWnd, uint dwAffinity);

    private static CursorBeamOverlayWindow? _instance;
    public static CursorBeamOverlayWindow Instance => _instance ??= new CursorBeamOverlayWindow();

    private readonly Storyboard? _heartbeatAnim;

    public CursorBeamOverlayWindow()
    {
        InitializeComponent();
        _instance = this;

        _heartbeatAnim = TryFindResource("HeartbeatAnim") as Storyboard;
        _heartbeatAnim?.Begin();
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        try
        {
            var hwnd = new WindowInteropHelper(this).Handle;
            int style = GetWindowLong(hwnd, GWL_EXSTYLE);
            SetWindowLong(hwnd, GWL_EXSTYLE, style | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE);
            SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);
        }
        catch { }
    }

    public void UpdatePosition(int cursorX, int cursorY)
    {
        var dpi = System.Windows.Media.VisualTreeHelper.GetDpi(this);
        double dpiX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
        double dpiY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

        double dipX = cursorX / dpiX;
        double dipY = cursorY / dpiY;

        double workW = SystemParameters.WorkArea.Width;
        double workH = SystemParameters.WorkArea.Height;
        double workLeft = SystemParameters.WorkArea.Left;
        double workTop = SystemParameters.WorkArea.Top;

        double targetX = dipX - (this.Width / 2.0);
        double targetY = dipY + 14.0;

        if (targetX + this.Width > workLeft + workW - 8) targetX = workLeft + workW - this.Width - 8;
        if (targetX < workLeft + 8) targetX = workLeft + 8;
        if (targetY + this.Height > workTop + workH - 8) targetY = workTop + workH - this.Height - 8;
        if (targetY < workTop + 8) targetY = workTop + 8;

        this.Left = targetX;
        this.Top = targetY;

        if (!this.IsVisible)
        {
            this.Show();
        }
    }

    /// <summary>
    /// Desvanece o ilumina el latido de la nada según el progreso de detección
    /// </summary>
    public void SetDwellProgress(double progress)
    {
        Dispatcher.Invoke(() =>
        {
            if (progress <= 0.02)
            {
                // En movimiento: desvanecer a la nada
                if (this.Opacity > 0.0)
                {
                    var fadeOut = new DoubleAnimation(this.Opacity, 0.0, TimeSpan.FromMilliseconds(150));
                    this.BeginAnimation(OpacityProperty, fadeOut);
                }
                ProgressGlowPath.Opacity = 0.0;
            }
            else
            {
                // Reposo: emerger de la nada con latido sutil y translúcido
                double targetOpacity = 0.25 + (progress * 0.55); // de 0.25 a 0.80
                this.BeginAnimation(OpacityProperty, null);
                this.Opacity = targetOpacity;

                ProgressGlowPath.Opacity = Math.Clamp(progress * 1.1, 0.0, 1.0);
            }
        });
    }

    /// <summary>
    /// Destello suave de confirmación de latido y desvanecimiento final a la nada
    /// </summary>
    public void TriggerCaptureLock()
    {
        Dispatcher.Invoke(() =>
        {
            ProgressGlowPath.Opacity = 1.0;
            var bloomAndDissolve = new DoubleAnimation(this.Opacity, 0.0, TimeSpan.FromMilliseconds(320))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };
            this.BeginAnimation(OpacityProperty, bloomAndDissolve);
        });
    }

    public void SetCaptureSafe(bool isCapturing)
    {
        Dispatcher.Invoke(() =>
        {
            this.Opacity = isCapturing ? 0.0 : 0.65;
        });
    }
}
