using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Windows.Media.SpeechSynthesis;

namespace TeachMeAI;

public partial class MainWindow : Window
{
    public static MainWindow? Instance { get; private set; }

    private GlobalHotKey? _globalHotKey;
    private DwellEngine? _dwellEngine;
    private SystemTrayManager? _trayManager;
    private bool _isExplicitExit = false;
    private DockingEngine _dockingEngine = new DockingEngine();

    private bool _isExpanded = false;
    private bool _isPinned = false;
    private bool _isDragging = false;
    private bool _isAutoHidden = false;
    private double _unfoldedLeft = 0;
    private double _unfoldedTop = 0;
    private DockMode _currentDockMode = DockMode.TopCapsule;
    private readonly DispatcherTimer _autoHideTimer;
    private const uint WDA_EXCLUDEFROMCAPTURE = 0x00000011;

    [DllImport("user32.dll")]
    private static extern bool SetWindowDisplayAffinity(IntPtr hWnd, uint dwAffinity);

    public MainWindow()
    {
        Instance = this;
        InitializeComponent();

        _dockingEngine.OnDockModeChanged += HandleDockModeChanged;

        _autoHideTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(1400)
        };
        _autoHideTimer.Tick += (s, e) =>
        {
            _autoHideTimer.Stop();
            AutoHideWindow();
        };

        // Establecer dimensiones y posición inicial inmediata de la cápsula
        this.Width = 500;
        this.Height = 46;
        this.Left = Math.Max(10, (SystemParameters.PrimaryScreenWidth - 500) / 2);
        this.Top = 8;
        _unfoldedLeft = this.Left;
        _unfoldedTop = this.Top;

        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");

        this.Closed += (s, e) =>
        {
            try { File.AppendAllText(logFile, $"[ToolTip AI] MainWindow Closed event fired. Stack:\n{Environment.StackTrace}\n"); } catch { }
        };

        this.Deactivated += (s, e) =>
        {
            try { File.AppendAllText(logFile, $"[ToolTip AI] MainWindow Deactivated event fired.\n"); } catch { }
        };
    }

    private void HandleDockModeChanged(DockMode mode)
    {
        Dispatcher.Invoke(() =>
        {
            _currentDockMode = mode;
            if (mode == DockMode.RightSidebar || mode == DockMode.LeftSidebar)
            {
                HorizontalCapsuleContainer.Visibility = Visibility.Collapsed;
                VerticalSidebarContainer.Visibility = Visibility.Visible;
                MainBorder.CornerRadius = new CornerRadius(26);
            }
            else
            {
                HorizontalCapsuleContainer.Visibility = Visibility.Visible;
                VerticalSidebarContainer.Visibility = Visibility.Collapsed;
                MainBorder.CornerRadius = new CornerRadius(23);
            }

            _unfoldedLeft = _dockingEngine.TargetLeft > 0 ? _dockingEngine.TargetLeft : this.Left;
            _unfoldedTop = _dockingEngine.TargetTop > 0 ? _dockingEngine.TargetTop : this.Top;

            if (!_isPinned && !_isExpanded && !_isDragging)
            {
                _autoHideTimer.Stop();
                _autoHideTimer.Start();
            }
        });
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[ToolTip AI] Window_Loaded entered at {DateTime.Now}\n"); } catch { }

        try
        {
            // Ubicación inicial: Cápsula dinámica superior en el centro de la pantalla principal
            var primary = System.Windows.Forms.Screen.PrimaryScreen ?? System.Windows.Forms.Screen.AllScreens[0];
            var dpi = VisualTreeHelper.GetDpi(this);
            double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
            double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;
            double workLeft = primary.WorkingArea.Left / scaleX;
            double workTop = primary.WorkingArea.Top / scaleY;
            double screenW = primary.WorkingArea.Width / scaleX;

            this.Width = 680;
            this.Height = 48;
            this.Left = workLeft + Math.Max(10, (screenW - 680) / 2.0);
            this.Top = workTop + 8;
            _unfoldedLeft = this.Left;
            _unfoldedTop = this.Top;

            this.WindowState = WindowState.Normal;
            this.Visibility = Visibility.Visible;
            this.Topmost = true;

            _autoHideTimer.Start();

            if (ListHistoryItems != null)
            {
                ListHistoryItems.ItemsSource = TranslateEngine.TranslationHistory;
            }

            IntPtr hwnd = new WindowInteropHelper(this).Handle;
            try { File.AppendAllText(logFile, $"[ToolTip AI] HWND acquired: {hwnd}\n"); } catch { }
            try { SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE); } catch { }

            // 1. Global HotKeys: Ctrl+Shift+A (snip), Ctrl+Shift+D (radar), Ctrl+Shift+C (settings)
            try
            {
                _globalHotKey = new GlobalHotKey();
                _globalHotKey.RegisterWindow(hwnd);
                _globalHotKey.OnSnipTriggered += HandleSnipShortcut;
                _globalHotKey.OnSettingsTriggered += HandleSettingsShortcut;
                _globalHotKey.OnToggleRadarTriggered += HandleToggleRadarShortcut;
                _globalHotKey.OnToggleTranslateTriggered += HandleToggleTranslateShortcut;
                _globalHotKey.OnUserKeyboardActivity += () => _dwellEngine?.NotifyUserActivity();
                try { File.AppendAllText(logFile, $"[ToolTip AI] GlobalHotKey initialized: {GlobalHotKey.SnipDisplay}, {GlobalHotKey.RadarDisplay}, {GlobalHotKey.SettingsDisplay}, {GlobalHotKey.TranslateDisplay}.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[ToolTip AI] HotKey setup error: {ex.Message}\n"); } catch { }
            }

            // 2. Native Mouse Dwell Radar (Ctrl+Shift+D o botón)
            try
            {
                _dwellEngine = new DwellEngine();
                _dwellEngine.IsEnabled = false;
                _dwellEngine.OnDwellTriggered += (data, bytes, x, y) =>
                {
                    if (_dwellEngine?.IsEnabled != true) return;
                    Dispatcher.Invoke(() =>
                    {
                        // Diagnóstico local instantáneo y seguro sin quemar cuota
                        HudWindow.Instance.ShowInspection(data, bytes, x, y, triggerAiAnalysis: false);
                    });
                };
                try { File.AppendAllText(logFile, $"[ToolTip AI] DwellEngine creado (off por defecto, activable con {GlobalHotKey.RadarDisplay}).\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[ToolTip AI] DwellEngine setup error: {ex.Message}\n"); } catch { }
            }

            // 2b. Escáner de Traducción en Pantalla (Ctrl+Shift+T o botón)
            try
            {
                ScreenTranslateScanner.Instance.OnStateChanged += isEnabled =>
                {
                    Dispatcher.Invoke(() =>
                    {
                        var emerald = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
                        var gray = new SolidColorBrush(Color.FromRgb(0x64, 0x74, 0x8B));
                        var textGray = new SolidColorBrush(Color.FromRgb(0x94, 0xA3, 0xB8));

                        if (TranslateDot != null) TranslateDot.Background = isEnabled ? emerald : gray;
                        if (TranslateStatusLabel != null)
                        {
                            TranslateStatusLabel.Text = isEnabled ? "Láser: ON" : "Láser: OFF";
                            TranslateStatusLabel.Foreground = isEnabled ? emerald : textGray;
                        }
                        if (BtnToggleTranslateBorder != null)
                        {
                            BtnToggleTranslateBorder.BorderBrush = isEnabled ? emerald : new SolidColorBrush(Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF));
                        }

                        if (TranslateDotV != null) TranslateDotV.Background = isEnabled ? emerald : gray;
                        if (BtnToggleTranslateBorderV != null) BtnToggleTranslateBorderV.BorderBrush = isEnabled ? emerald : new SolidColorBrush(Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF));
                    });
                };

                // Iniciar automáticamente el escáner de traducción en pantalla
                ScreenTranslateScanner.Instance.Start();
                try { File.AppendAllText(logFile, "[ToolTip AI] ScreenTranslateScanner iniciado automáticamente.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[ToolTip AI] TranslateScanner setup error: {ex.Message}\n"); } catch { }
            }

            // 3. Connect HUD callbacks
            try
            {
                Dispatcher.Invoke(() =>
                {
                    HudWindow.Instance.OnRequestSnipping += StartSnipping;
                });
                try { File.AppendAllText(logFile, "[ToolTip AI] HUD callback connected.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[ToolTip AI] HUD setup error: {ex.Message}\n"); } catch { }
            }

            // 4. System Tray Manager (Bandeja del sistema / barra de tareas)
            try
            {
                _trayManager = new SystemTrayManager();
                _trayManager.Initialize(this);
                _trayManager.OnRestoreRequested += RestoreWindow;
                _trayManager.OnSnipRequested += StartSnipping;
                _trayManager.OnFullScreenCaptureRequested += CaptureFullScreen;
                _trayManager.OnClipboardAnalyzeRequested += AnalyzeClipboardContent;
                _trayManager.OnToggleRadarRequested += () => ToggleRadarState();
                _trayManager.OnToggleTranslateRequested += () => ToggleTranslateState();
                _trayManager.OnSettingsRequested += HandleSettingsShortcut;
                _trayManager.OnExitRequested += QuitApplication;
                try { File.AppendAllText(logFile, "[ToolTip AI] SystemTrayManager inicializado correctamente.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[ToolTip AI] Tray setup error: {ex.Message}\n"); } catch { }
            }

            // 5. Verificación de configuración inicial y registro
            StartupManager.EnsureNoWindowsStartup();
            StartupManager.CheckAndHandleFirstRun();

            // Mostrar notificación amigable de bienvenida y presencia
            _trayManager?.ShowNotification(
                "ToolTip AI • Cápsula superior activa",
                $"Panel listo • {GlobalHotKey.SnipDisplay} recortar • {GlobalHotKey.TranslateDisplay} traducir."
            );
        }
        catch (Exception ex)
        {
            try { File.AppendAllText(logFile, $"[ToolTip AI] Window_Loaded fatal: {ex}\n"); } catch { }
        }
    }

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    public void RestoreWindow()
    {
        Action act = () =>
        {
            this.Visibility = Visibility.Visible;
            this.Show();
            this.WindowState = WindowState.Normal;
            this.Topmost = true;
            this.Activate();
            this.Focus();

            try
            {
                IntPtr hwnd = new WindowInteropHelper(this).Handle;
                if (hwnd != IntPtr.Zero)
                {
                    ShowWindow(hwnd, 9); // SW_RESTORE
                    SetForegroundWindow(hwnd);
                }
            }
            catch { }
        };

        if (Dispatcher.CheckAccess()) act();
        else Dispatcher.Invoke(act);
    }

    private void HandleSnipShortcut()
    {
        Dispatcher.Invoke(() =>
        {
            StartSnipping();
        });
    }

    private void HandleSettingsShortcut()
    {
        Dispatcher.Invoke(() =>
        {
            HudWindow.Instance.ShowSettingsOrAdjustments();
        });
    }

    private void HandleToggleRadarShortcut()
    {
        Dispatcher.Invoke(() =>
        {
            ToggleRadarState();
        });
    }

    private void BtnToggleRadar_MouseDown(object sender, MouseButtonEventArgs e)
    {
        ToggleRadarState();
        e.Handled = true;
    }

    private void BtnToggleRadar_Click(object sender, RoutedEventArgs e)
    {
        ToggleRadarState();
    }

    private void ToggleRadarState(bool? forceState = null)
    {
        ToggleTranslateState(forceState);
    }

    private void HandleToggleTranslateShortcut()
    {
        Dispatcher.Invoke(() =>
        {
            ToggleTranslateState();
        });
    }

    private void BtnToggleTranslate_MouseDown(object sender, MouseButtonEventArgs e)
    {
        ToggleTranslateState();
        e.Handled = true;
    }

    private void ToggleTranslateState(bool? forceState = null)
    {
        bool currentState = ScreenTranslateScanner.Instance.IsEnabled;
        bool newState = forceState ?? !currentState;

        if (newState)
        {
            ScreenTranslateScanner.Instance.Start();
        }
        else
        {
            ScreenTranslateScanner.Instance.Stop();
        }
    }

    public void UpdateActiveDomain(string domain)
    {
        // En ToolTip AI Translate mantenemos la estética unificada de traducción
    }

    #region Expand / Pin / Drag Dynamics

    private static bool IsInteractiveControl(DependencyObject? dep)
    {
        while (dep != null && dep is not Window)
        {
            if (dep is System.Windows.Controls.Button ||
                dep is System.Windows.Controls.TextBox ||
                dep is System.Windows.Controls.PasswordBox ||
                dep is System.Windows.Controls.Primitives.ToggleButton)
            {
                return true;
            }

            if (dep is FrameworkElement fe)
            {
                if (fe.Name == "BtnToggleRadarBorder" ||
                    fe.Name == "BtnToggleRadarBorderV" ||
                    fe.Name == "BtnToggleTranslateBorder" ||
                    fe.Name == "BtnToggleTranslateBorderV" ||
                    fe.Name == "BtnStartSnip" ||
                    fe.Name == "BtnStartSnipV")
                {
                    return true;
                }
            }

            dep = VisualTreeHelper.GetParent(dep);
        }
        return false;
    }

    private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.LeftButton != MouseButtonState.Pressed) return;
        if (e.OriginalSource is DependencyObject dep && IsInteractiveControl(dep)) return;

        _autoHideTimer.Stop();
        _isDragging = true;
        RevealWindow();

        if (_isExpanded && !_isPinned)
        {
            SetExpandedState(false);
        }

        try
        {
            MainBorder.Opacity = 0.92;
            this.DragMove();
        }
        catch { }
        finally
        {
            _isDragging = false;
            MainBorder.Opacity = 1.0;
        }

        // Al terminar el arrastre en cualquier monitor, acopla magnéticamente con detección multimonitor
        var mode = _dockingEngine.EvaluateAndSnap(this, isCapsule: true);
        _currentDockMode = mode;
        _unfoldedLeft = _dockingEngine.TargetLeft > 0 ? _dockingEngine.TargetLeft : this.Left;
        _unfoldedTop = _dockingEngine.TargetTop > 0 ? _dockingEngine.TargetTop : this.Top;

        _autoHideTimer.Stop();
        _autoHideTimer.Start();
    }

    private void Window_MouseEnter(object sender, MouseEventArgs e)
    {
        RevealWindow();
    }

    private void Window_MouseLeave(object sender, MouseEventArgs e)
    {
        if (!_isPinned && _isExpanded)
        {
            System.Windows.Point p = e.GetPosition(this);
            if (p.X < -40 || p.X > this.ActualWidth + 40 || p.Y < -40 || p.Y > this.ActualHeight + 40)
            {
                SetExpandedState(false);
            }
        }

        if (!_isPinned && !_isExpanded && !_isDragging)
        {
            _autoHideTimer.Stop();
            _autoHideTimer.Start();
        }
    }

    /// <summary>
    /// Atenúa 4 tonos la barra (opacidad 0.20) y la auto-oculta contra el borde de la pantalla dejando un sleek peek tab
    /// </summary>
    private void AutoHideWindow()
    {
        if (_isPinned || _isExpanded || _isDragging || _isAutoHidden) return;
        _isAutoHidden = true;

        var ease = new CubicEase { EasingMode = EasingMode.EaseInOut };
        var duration = TimeSpan.FromMilliseconds(240);

        // 1. Reducir 4 tonos de opacidad (a 0.20) para total discreción visual
        var animOpacity = new DoubleAnimation(this.Opacity, 0.20, duration) { EasingFunction = ease };
        this.BeginAnimation(OpacityProperty, animOpacity);

        // 2. Auto-ocultamiento deslizante contra los bordes de la pantalla
        try
        {
            var screen = System.Windows.Forms.Screen.FromPoint(new System.Drawing.Point((int)Math.Round(this.Left), (int)Math.Round(this.Top)))
                          ?? System.Windows.Forms.Screen.PrimaryScreen
                          ?? System.Windows.Forms.Screen.AllScreens[0];
            var dpi = VisualTreeHelper.GetDpi(this);
            double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
            double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;
            double workLeft = screen.WorkingArea.Left / scaleX;
            double workTop = screen.WorkingArea.Top / scaleY;
            double workW = screen.WorkingArea.Width / scaleX;

            if (_currentDockMode == DockMode.RightSidebar)
            {
                double hideX = workLeft + workW - 14.0;
                var animLeft = new DoubleAnimation(this.Left, hideX, duration) { EasingFunction = ease };
                this.BeginAnimation(LeftProperty, animLeft);
            }
            else if (_currentDockMode == DockMode.LeftSidebar)
            {
                double hideX = workLeft - this.Width + 14.0;
                var animLeft = new DoubleAnimation(this.Left, hideX, duration) { EasingFunction = ease };
                this.BeginAnimation(LeftProperty, animLeft);
            }
            else if (_currentDockMode == DockMode.TopCapsule)
            {
                double hideY = workTop - this.Height + 10.0;
                var animTop = new DoubleAnimation(this.Top, hideY, duration) { EasingFunction = ease };
                this.BeginAnimation(TopProperty, animTop);
            }
        }
        catch { }
    }

    /// <summary>
    /// Restaura la ventana al 100% de nitidez y la despliega suavemente desde el borde
    /// </summary>
    private void RevealWindow()
    {
        _autoHideTimer.Stop();
        if (!_isAutoHidden && Math.Abs(this.Opacity - 1.0) < 0.05) return;
        _isAutoHidden = false;

        var ease = new CubicEase { EasingMode = EasingMode.EaseOut };
        var duration = TimeSpan.FromMilliseconds(180);

        // 1. Restaurar 100% nitidez y opacidad
        var animOpacity = new DoubleAnimation(this.Opacity, 1.0, duration) { EasingFunction = ease };
        this.BeginAnimation(OpacityProperty, animOpacity);

        // 2. Deslizar de regreso a la posición original
        double targetX = _dockingEngine.TargetLeft > 0 ? _dockingEngine.TargetLeft : _unfoldedLeft;
        double targetY = _dockingEngine.TargetTop > 0 ? _dockingEngine.TargetTop : _unfoldedTop;

        if (_currentDockMode == DockMode.RightSidebar || _currentDockMode == DockMode.LeftSidebar)
        {
            if (targetX > 0)
            {
                var animLeft = new DoubleAnimation(this.Left, targetX, duration) { EasingFunction = ease };
                this.BeginAnimation(LeftProperty, animLeft);
            }
        }
        else if (_currentDockMode == DockMode.TopCapsule)
        {
            if (targetY > 0)
            {
                var animTop = new DoubleAnimation(this.Top, targetY, duration) { EasingFunction = ease };
                this.BeginAnimation(TopProperty, animTop);
            }
        }
    }

    private void BtnExpandToggle_Click(object sender, RoutedEventArgs e)
    {
        SetExpandedState(!_isExpanded);
    }

    private void BtnPin_Click(object sender, RoutedEventArgs e)
    {
        _isPinned = !_isPinned;
        if (_isPinned)
        {
            BtnPin.Foreground = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
            BtnPin.ToolTip = "Cápsula y Dashboard Fijados (Clic para permitir auto-colapso)";
            SetExpandedState(true);
        }
        else
        {
            BtnPin.Foreground = new SolidColorBrush(Color.FromRgb(0x64, 0x74, 0x8B));
            BtnPin.ToolTip = "Fijar Dashboard";
        }
    }

    private void SetExpandedState(bool expand)
    {
        _isExpanded = expand;
        if (expand)
        {
            MainBorder.CornerRadius = new CornerRadius(18);
            DrawerGrid.Visibility = Visibility.Visible;
            DrawerGrid.Opacity = 1.0;
            this.Height = 440;
            if (TxtExpandChevron != null) TxtExpandChevron.Text = "▴";
            BtnExpandToggle.ToolTip = "Ocultar Consola de Traducción";

            if (ListHistoryItems != null && ListHistoryItems.ItemsSource == null)
            {
                ListHistoryItems.ItemsSource = TranslateEngine.TranslationHistory;
            }
            if (TxtStatCount != null) TxtStatCount.Text = TranslateEngine.Instance.TotalTranslationsCount.ToString();
            if (TxtStatLatency != null) TxtStatLatency.Text = $"{TranslateEngine.Instance.AverageLatencyMs:F0} ms";
        }
        else
        {
            DrawerGrid.Visibility = Visibility.Collapsed;
            DrawerGrid.Opacity = 0.0;
            MainBorder.CornerRadius = new CornerRadius(24);
            this.Height = 48;
            if (TxtExpandChevron != null) TxtExpandChevron.Text = "▾";
            BtnExpandToggle.ToolTip = "Abrir Consola de Traducción";
        }
    }

    #endregion

    #region Language Selection

    private void CmbTargetLang_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
    {
        if (CmbTargetLang?.SelectedItem is System.Windows.Controls.ComboBoxItem item && item.Tag is string tag)
        {
            TranslateEngine.Instance.CurrentTargetLanguage = tag;
        }
    }

    #endregion

    #region Interactive Translation Console

    private void TxtSourceInput_GotFocus(object sender, RoutedEventArgs e)
    {
        if (TxtSourceInput.Text.StartsWith("Enter or paste"))
        {
            TxtSourceInput.Text = "";
        }
    }

    private void BtnPasteInput_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            if (Clipboard.ContainsText())
            {
                TxtSourceInput.Text = Clipboard.GetText();
            }
        }
        catch { }
    }

    private void BtnClearInput_Click(object sender, RoutedEventArgs e)
    {
        TxtSourceInput.Text = "";
        TxtTranslatedOutput.Text = "La traducción instantánea aparecerá aquí con máximo contraste y fidelidad.";
        TxtManualLatency.Text = "⚡ 0ms";
    }

    private async void BtnTranslateManual_Click(object sender, RoutedEventArgs e)
    {
        string text = TxtSourceInput.Text?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(text) || text.StartsWith("Enter or paste")) return;

        try
        {
            BtnTranslateManual.IsEnabled = false;
            string targetLang = TranslateEngine.Instance.CurrentTargetLanguage;
            var res = await TranslateEngine.Instance.TranslateTextAsync(text, System.Drawing.Rectangle.Empty, targetLang);

            TxtTranslatedOutput.Text = res.TranslatedText;
            TxtManualLatency.Text = $"⚡ {res.LatencyMs:F0}ms";
            TxtDetectedInfo.Text = $"🔍 Detectado: {res.SourceLanguage.ToUpperInvariant()} ➔ {res.TargetLanguage.ToUpperInvariant()}";
            TranslateEngine.Instance.RecordHistory(res);

            if (TxtStatCount != null) TxtStatCount.Text = TranslateEngine.Instance.TotalTranslationsCount.ToString();
            if (TxtStatLatency != null) TxtStatLatency.Text = $"{TranslateEngine.Instance.AverageLatencyMs:F0} ms";
        }
        catch (Exception ex)
        {
            TxtTranslatedOutput.Text = $"Error al traducir: {ex.Message}";
        }
        finally
        {
            BtnTranslateManual.IsEnabled = true;
        }
    }

    private void BtnCopyManual_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            string t = TxtTranslatedOutput.Text;
            if (!string.IsNullOrWhiteSpace(t)) Clipboard.SetText(t);
        }
        catch { }
    }

    private async void BtnSpeakManual_Click(object sender, RoutedEventArgs e)
    {
        string text = TxtTranslatedOutput.Text;
        if (string.IsNullOrWhiteSpace(text)) return;

        try
        {
            using var synth = new Windows.Media.SpeechSynthesis.SpeechSynthesizer();
            var stream = await synth.SynthesizeTextToStreamAsync(text);
            using var memStream = new MemoryStream();
            using var readStream = stream.AsStreamForRead();
            await readStream.CopyToAsync(memStream);
            memStream.Position = 0;
            using var player = new System.Media.SoundPlayer(memStream);
            player.Play();
        }
        catch { }
    }

    #endregion

    #region History Feed Actions

    private void BtnClearHistory_Click(object sender, RoutedEventArgs e)
    {
        TranslateEngine.TranslationHistory.Clear();
    }

    private async void BtnHistorySpeak_Click(object sender, RoutedEventArgs e)
    {
        if (sender is FrameworkElement fe && fe.DataContext is HistoryItem item && !string.IsNullOrWhiteSpace(item.Translated))
        {
            try
            {
                using var synth = new Windows.Media.SpeechSynthesis.SpeechSynthesizer();
                var stream = await synth.SynthesizeTextToStreamAsync(item.Translated);
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

    private void BtnHistoryCopy_Click(object sender, RoutedEventArgs e)
    {
        if (sender is FrameworkElement fe && fe.DataContext is HistoryItem item && !string.IsNullOrWhiteSpace(item.Translated))
        {
            try { Clipboard.SetText(item.Translated); } catch { }
        }
    }

    #endregion

    #region Operational Settings Actions

    private void BtnDelay1000_Click(object sender, RoutedEventArgs e)
    {
        ScreenTranslateScanner.Instance.DwellDelayMs = 1000;
        BtnDelay1000.Background = new SolidColorBrush(Color.FromArgb(0x25, 0x38, 0xBD, 0xF8));
        BtnDelay1000.BorderBrush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));
        BtnDelay1000.Foreground = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));

        BtnDelay2000.Background = new SolidColorBrush(Color.FromRgb(0x18, 0x22, 0x34));
        BtnDelay2000.BorderBrush = new SolidColorBrush(Color.FromArgb(0x25, 0xFF, 0xFF, 0xFF));
        BtnDelay2000.Foreground = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));

        BtnDelay3000.Background = new SolidColorBrush(Color.FromRgb(0x18, 0x22, 0x34));
        BtnDelay3000.BorderBrush = new SolidColorBrush(Color.FromArgb(0x25, 0xFF, 0xFF, 0xFF));
        BtnDelay3000.Foreground = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));
    }

    private void BtnDelay2000_Click(object sender, RoutedEventArgs e)
    {
        ScreenTranslateScanner.Instance.DwellDelayMs = 2000;
        BtnDelay2000.Background = new SolidColorBrush(Color.FromArgb(0x25, 0x38, 0xBD, 0xF8));
        BtnDelay2000.BorderBrush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));
        BtnDelay2000.Foreground = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));

        BtnDelay1000.Background = new SolidColorBrush(Color.FromRgb(0x18, 0x22, 0x34));
        BtnDelay1000.BorderBrush = new SolidColorBrush(Color.FromArgb(0x25, 0xFF, 0xFF, 0xFF));
        BtnDelay1000.Foreground = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));

        BtnDelay3000.Background = new SolidColorBrush(Color.FromRgb(0x18, 0x22, 0x34));
        BtnDelay3000.BorderBrush = new SolidColorBrush(Color.FromArgb(0x25, 0xFF, 0xFF, 0xFF));
        BtnDelay3000.Foreground = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));
    }

    private void BtnDelay3000_Click(object sender, RoutedEventArgs e)
    {
        ScreenTranslateScanner.Instance.DwellDelayMs = 3000;
        BtnDelay3000.Background = new SolidColorBrush(Color.FromArgb(0x25, 0x38, 0xBD, 0xF8));
        BtnDelay3000.BorderBrush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));
        BtnDelay3000.Foreground = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));

        BtnDelay1000.Background = new SolidColorBrush(Color.FromRgb(0x18, 0x22, 0x34));
        BtnDelay1000.BorderBrush = new SolidColorBrush(Color.FromArgb(0x25, 0xFF, 0xFF, 0xFF));
        BtnDelay1000.Foreground = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));

        BtnDelay2000.Background = new SolidColorBrush(Color.FromRgb(0x18, 0x22, 0x34));
        BtnDelay2000.BorderBrush = new SolidColorBrush(Color.FromArgb(0x25, 0xFF, 0xFF, 0xFF));
        BtnDelay2000.Foreground = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));
    }

    private void ChkAutoSpeak_Changed(object sender, RoutedEventArgs e)
    {
        ScreenTranslateScanner.Instance.AutoPronounceOnScan = ChkAutoSpeak.IsChecked == true;
    }

    #endregion

    private void BtnStartSnip_Click(object sender, RoutedEventArgs e)
    {
        StartSnipping();
    }

    private void StartSnipping()
    {
        var snipWin = new SnippingWindow();
        snipWin.OnSnipCompleted += async (bytes, data, x, y) =>
        {
            var res = await TranslateEngine.Instance.TranslateImageBytesAsync(bytes, x, y);
            Dispatcher.Invoke(() =>
            {
                if (res != null && !string.IsNullOrWhiteSpace(res.TranslatedText))
                {
                    TranslateOverlayWindow.Instance.ShowTranslation(res, x, y);
                }
            });
        };
        snipWin.Show();
    }

    /// <summary>
    /// Herramienta: Captura la pantalla completa y la traduce de inmediato.
    /// </summary>
    private async void CaptureFullScreen()
    {
        try
        {
            int screenLeft = (int)SystemParameters.VirtualScreenLeft;
            int screenTop = (int)SystemParameters.VirtualScreenTop;
            int screenWidth = (int)SystemParameters.VirtualScreenWidth;
            int screenHeight = (int)SystemParameters.VirtualScreenHeight;

            using var bitmap = new System.Drawing.Bitmap(screenWidth, screenHeight);
            using (var g = System.Drawing.Graphics.FromImage(bitmap))
            {
                g.CopyFromScreen(screenLeft, screenTop, 0, 0, bitmap.Size);
            }

            using var ms = new MemoryStream();
            bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            byte[] imageBytes = ms.ToArray();

            var res = await TranslateEngine.Instance.TranslateImageBytesAsync(imageBytes, (int)(SystemParameters.PrimaryScreenWidth / 2), 80);
            if (res != null && !string.IsNullOrWhiteSpace(res.TranslatedText))
            {
                TranslateOverlayWindow.Instance.ShowTranslation(res, (int)(SystemParameters.PrimaryScreenWidth / 2), 80);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error al traducir pantalla: {ex.Message}", "ToolTip AI Translate", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    /// <summary>
    /// Herramienta: Analiza lo que el usuario tenga copiado en el portapapeles y lo traduce de inmediato.
    /// </summary>
    private async void AnalyzeClipboardContent()
    {
        try
        {
            if (System.Windows.Clipboard.ContainsText())
            {
                string text = System.Windows.Clipboard.GetText();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    var res = await TranslateEngine.Instance.TranslateTextAsync(text, new System.Drawing.Rectangle(100, 100, 200, 50));
                    TranslateOverlayWindow.Instance.ShowTranslation(res, (int)(this.Left + this.Width / 2), (int)(this.Top + this.Height + 10));
                    return;
                }
            }

            if (System.Windows.Clipboard.ContainsImage())
            {
                var imageSource = System.Windows.Clipboard.GetImage();
                if (imageSource != null)
                {
                    var encoder = new PngBitmapEncoder();
                    encoder.Frames.Add(BitmapFrame.Create(imageSource));
                    using var ms = new MemoryStream();
                    encoder.Save(ms);
                    byte[] imageBytes = ms.ToArray();

                    var res = await TranslateEngine.Instance.TranslateImageBytesAsync(imageBytes, (int)(this.Left + this.Width / 2), (int)(this.Top + this.Height + 10));
                    if (res != null && !string.IsNullOrWhiteSpace(res.TranslatedText))
                    {
                        TranslateOverlayWindow.Instance.ShowTranslation(res, (int)(this.Left + this.Width / 2), (int)(this.Top + this.Height + 10));
                        return;
                    }
                }
            }

            MessageBox.Show("El portapapeles no contiene texto ni imagen para traducir.", "ToolTip AI Translate", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error al traducir portapapeles: {ex.Message}", "ToolTip AI Translate", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void BtnSettingsQuick_Click(object sender, RoutedEventArgs e)
    {
        HudWindow.Instance.ShowSettingsOrAdjustments();
    }

    private void BtnFullScreen_Click(object sender, RoutedEventArgs e)
    {
        CaptureFullScreen();
    }

    private void BtnClipboard_Click(object sender, RoutedEventArgs e)
    {
        AnalyzeClipboardContent();
    }

    private void BtnOpenHud_Click(object sender, RoutedEventArgs e)
    {
        var dummyData = new InspectionData
        {
            Name = "ToolTip AI Inspector",
            ProcessName = "TeachMeAI.exe",
            ProcessId = (uint)System.Diagnostics.Process.GetCurrentProcess().Id,
            Summary = $"Panel de ToolTip AI activo. Pulsa '{GlobalHotKey.SnipDisplay}' para recortar o '{GlobalHotKey.RadarDisplay}' para el radar.",
            VerdictText = "Sistema Activo • Cápsula Superior",
            SafetyTag = "Seguro",
            ActionTag = "Recortar"
        };
        HudWindow.Instance.ShowInspection(dummyData, null, (int)(this.Left + 50), (int)(this.Top + this.Height + 10));
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        this.Hide();
        _trayManager?.ShowNotification("ToolTip AI", $"Alojado en bandeja. {GlobalHotKey.SnipDisplay} para recortar o clic en el icono para abrir el panel.");
    }

    private void QuitApplication()
    {
        Dispatcher.Invoke(() =>
        {
            _isExplicitExit = true;
            _trayManager?.Dispose();
            _dwellEngine?.Stop();
            _globalHotKey?.Dispose();
            Application.Current.Shutdown();
        });
    }

    private void Window_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[ToolTip AI] Window_Closing triggered. ExplicitExit: {_isExplicitExit}. Cancel: {!_isExplicitExit}\n"); } catch { }

        if (!_isExplicitExit)
        {
            e.Cancel = true;
            this.Hide();
            return;
        }

        _trayManager?.Dispose();
        _dwellEngine?.Stop();
        _globalHotKey?.Dispose();
    }
}