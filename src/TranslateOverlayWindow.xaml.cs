using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Animation;
using Windows.Media.SpeechSynthesis;

namespace TeachMeAI;

public partial class TranslateOverlayWindow : Window
{
    private const int GWL_EXSTYLE = -20;
    private const int WS_EX_TOOLWINDOW = 0x00000080;
    private const int WS_EX_NOACTIVATE = 0x08000000;

    [DllImport("user32.dll")]
    private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll")]
    private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    private static TranslateOverlayWindow? _instance;
    public static TranslateOverlayWindow Instance => _instance ??= new TranslateOverlayWindow();

    private bool _isPinned = false;
    private TranslationResult? _currentResult;
    private readonly Storyboard? _laserAnim;

    public TranslateOverlayWindow()
    {
        InitializeComponent();
        _instance = this;

        _laserAnim = TryFindResource("LaserSweepAnim") as Storyboard;
        _laserAnim?.Begin();
    }

    private const uint WDA_EXCLUDEFROMCAPTURE = 0x00000011;

    [DllImport("user32.dll")]
    private static extern bool SetWindowDisplayAffinity(IntPtr hWnd, uint dwAffinity);

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        try
        {
            var hwnd = new WindowInteropHelper(this).Handle;
            int style = GetWindowLong(hwnd, GWL_EXSTYLE);
            SetWindowLong(hwnd, GWL_EXSTYLE, style | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE);

            // Excluir de capturas de pantalla para que el OCR jamás capture el popup
            SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);
        }
        catch { }
    }

    public void ShowTranslation(TranslationResult result, int screenX, int screenY)
    {
        _currentResult = result;
        TranslateEngine.Instance.RecordHistory(result);

        // 1. Asignar textos
        OriginalTextDisplay.Text = $"「{result.OriginalText}」";
        SourceLangPill.Text = result.SourceLanguage.ToUpperInvariant();

        if (!string.IsNullOrWhiteSpace(result.Phonetic))
        {
            PhoneticDisplay.Text = $"[{result.Phonetic}]";
            PhoneticDisplay.Visibility = Visibility.Visible;
        }
        else
        {
            PhoneticDisplay.Visibility = Visibility.Collapsed;
        }

        TranslatedTextDisplay.Text = result.TranslatedText;

        if (!string.IsNullOrWhiteSpace(result.Etymology))
        {
            TokenText.Text = $"💡 {result.Etymology}";
            TokenBorder.Visibility = Visibility.Visible;
        }
        else
        {
            TokenBorder.Visibility = Visibility.Collapsed;
        }

        BadgeText.Text = $"⚡ D3D · {Math.Max(1, (int)result.LatencyMs)}ms";

        // 2. Calibración DPI precisa (físico a DIPs)
        var dpi = System.Windows.Media.VisualTreeHelper.GetDpi(this);
        double dpiX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
        double dpiY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

        double dipX = screenX / dpiX;
        double dipY = screenY / dpiY;

        // Posicionamiento inteligente en el monitor correspondiente
        var currentScreen = System.Windows.Forms.Screen.FromPoint(new System.Drawing.Point(screenX, screenY))
                            ?? System.Windows.Forms.Screen.PrimaryScreen 
                            ?? System.Windows.Forms.Screen.AllScreens[0];

        double workLeft = currentScreen.WorkingArea.Left / dpiX;
        double workTop = currentScreen.WorkingArea.Top / dpiY;
        double workW = currentScreen.WorkingArea.Width / dpiX;
        double workH = currentScreen.WorkingArea.Height / dpiY;

        // Medir dimensiones reales según el contenido dinámico del texto
        this.UpdateLayout();
        double curW = Math.Max(120, this.ActualWidth > 0 ? this.ActualWidth : 260);
        double curH = Math.Max(28, this.ActualHeight > 0 ? this.ActualHeight : 45);

        double targetX = dipX - (curW / 2.0);
        // Posicionar prioritariamente en la PARTE SUPERIOR del cursor (no inferior) para no tapar el texto subsiguiente
        double targetY = dipY - curH - 14.0;

        // Si se sale por el borde superior de la pantalla, fallback a la parte inferior
        if (targetY < workTop + 10)
        {
            targetY = dipY + 22.0;
        }

        // Asegurar límites dentro del monitor de trabajo
        if (targetX + curW > workLeft + workW - 10) targetX = workLeft + workW - curW - 10;
        if (targetX < workLeft + 10) targetX = workLeft + 10;
        if (targetY + curH > workTop + workH - 10) targetY = workTop + workH - curH - 10;
        if (targetY < workTop + 10) targetY = workTop + 10;

        this.Left = targetX;
        this.Top = targetY;

        // 3. Mostrar con suave animación de escala y desvanecimiento
        if (!this.IsVisible)
        {
            this.Opacity = 0.0;
            this.Show();
            var fadeIn = new DoubleAnimation(0.0, 1.0, TimeSpan.FromMilliseconds(160));
            this.BeginAnimation(OpacityProperty, fadeIn);
        }
        else
        {
            this.Opacity = 1.0;
        }

        // 4. Efecto de transición cuántica: el láser vertical barre de izquierda a derecha revelando la traducción
        TriggerLaserRevealSweep();
    }

    /// <summary>
    /// Ejecuta el barrido holográfico con línea láser vertical y bead '↔' que revela el texto traducido progresivamente
    /// </summary>
    private void TriggerLaserRevealSweep()
    {
        try
        {
            double targetW = Math.Max(160, this.ActualWidth > 0 ? this.ActualWidth : 340);
            double targetH = Math.Max(40, this.ActualHeight > 0 ? this.ActualHeight : 100);

            LaserRevealCanvas.Visibility = Visibility.Visible;
            LaserRevealCarriage.Opacity = 1.0;

            // 1. Barrido de la luz sutil vertical de izquierda a derecha (2150ms)
            var sweepAnim = new DoubleAnimation(-25.0, targetW + 25.0, TimeSpan.FromMilliseconds(2150))
            {
                EasingFunction = new SineEase { EasingMode = EasingMode.EaseInOut }
            };

            // 2. Revelado progresivo del texto en perfecta sincronía con el haz de luz (2150ms)
            var clipAnim = new RectAnimation(
                new Rect(0, 0, 0, targetH + 80),
                new Rect(0, 0, targetW + 40, targetH + 80),
                TimeSpan.FromMilliseconds(2150))
            {
                EasingFunction = new SineEase { EasingMode = EasingMode.EaseInOut }
            };

            sweepAnim.Completed += (s, e) =>
            {
                var fadeOut = new DoubleAnimation(1.0, 0.0, TimeSpan.FromMilliseconds(160));
                fadeOut.Completed += (s2, e2) =>
                {
                    LaserRevealCanvas.Visibility = Visibility.Collapsed;
                    TextRevealClip.BeginAnimation(RectangleGeometry.RectProperty, null);
                    TextRevealClip.Rect = new Rect(0, 0, 2000, 2000);
                };
                LaserRevealCarriage.BeginAnimation(OpacityProperty, fadeOut);
            };

            LaserRevealCarriage.BeginAnimation(System.Windows.Controls.Canvas.LeftProperty, sweepAnim);
            TextRevealClip.BeginAnimation(RectangleGeometry.RectProperty, clipAnim);
        }
        catch
        {
            TextRevealClip.Rect = new Rect(0, 0, 2000, 2000);
            LaserRevealCanvas.Visibility = Visibility.Collapsed;
        }
    }

    public void FadeOutAndHide(double durationMs = 180)
    {
        if (_isPinned || !this.IsVisible) return;

        Dispatcher.Invoke(() =>
        {
            if (_isPinned || !this.IsVisible) return;
            var fadeOut = new DoubleAnimation(this.Opacity, 0.0, TimeSpan.FromMilliseconds(durationMs));
            fadeOut.Completed += (s, e) =>
            {
                if (!_isPinned)
                {
                    this.Hide();
                    this.Opacity = 1.0;
                    this.BeginAnimation(OpacityProperty, null);
                }
            };
            this.BeginAnimation(OpacityProperty, fadeOut);
        });
    }

    private void BtnPin_Click(object sender, RoutedEventArgs e)
    {
        _isPinned = !_isPinned;
        BtnPin.Foreground = _isPinned ? System.Windows.Media.Brushes.LightGreen : new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x64, 0x74, 0x8B));
        MainHudBorder.BorderBrush = _isPinned ? new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0)) : new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(0x38, 0x00, 0xF5, 0xA0));
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        _isPinned = false;
        FadeOutAndHide(100);
    }

    private void BtnCopy_Click(object sender, RoutedEventArgs e)
    {
        if (_currentResult != null && !string.IsNullOrWhiteSpace(_currentResult.TranslatedText))
        {
            try
            {
                Clipboard.SetText(_currentResult.TranslatedText);
                CopyIcon.Text = "✓";
                CopyIcon.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0));
                System.Threading.Tasks.Task.Delay(1400).ContinueWith(_ => Dispatcher.Invoke(() =>
                {
                    CopyIcon.Text = "📋";
                    CopyIcon.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x94, 0xA3, 0xB8));
                }));
            }
            catch { }
        }
    }

    private async void BtnSpeak_Click(object sender, RoutedEventArgs e)
    {
        if (_currentResult == null || string.IsNullOrWhiteSpace(_currentResult.TranslatedText)) return;

        try
        {
            using var synth = new SpeechSynthesizer();
            var stream = await synth.SynthesizeTextToStreamAsync(_currentResult.TranslatedText);

            using var memStream = new MemoryStream();
            using var readStream = stream.AsStreamForRead();
            await readStream.CopyToAsync(memStream);
            memStream.Position = 0;

            using var player = new System.Media.SoundPlayer(memStream);
            player.Play();
        }
        catch { }
    }
}
