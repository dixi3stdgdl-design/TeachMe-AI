using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;

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

    public MainWindow()
    {
        Instance = this;
        InitializeComponent();

        _dockingEngine.OnDockModeChanged += HandleDockModeChanged;

        // Establecer dimensiones y posición inicial inmediata de la cápsula
        this.Width = 500;
        this.Height = 46;
        this.Left = Math.Max(10, (SystemParameters.PrimaryScreenWidth - 500) / 2);
        this.Top = 8;

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
            if (mode == DockMode.RightSidebar || mode == DockMode.LeftSidebar)
            {
                HorizontalCapsuleContainer.Visibility = Visibility.Collapsed;
                VerticalSidebarContainer.Visibility = Visibility.Visible;
                MainBorder.CornerRadius = new CornerRadius(27);
            }
            else
            {
                HorizontalCapsuleContainer.Visibility = Visibility.Visible;
                VerticalSidebarContainer.Visibility = Visibility.Collapsed;
                MainBorder.CornerRadius = new CornerRadius(23);
            }
        });
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[ToolTip AI] Window_Loaded entered at {DateTime.Now}\n"); } catch { }

        try
        {
            // Ubicación inicial: Cápsula dinámica superior en el centro
            this.Width = 500;
            this.Height = 46;
            this.Left = Math.Max(10, (SystemParameters.PrimaryScreenWidth - 500) / 2);
            this.Top = 8;
            this.WindowState = WindowState.Normal;
            this.Visibility = Visibility.Visible;
            this.Topmost = true;
            this.LostMouseCapture += (s, e) => EndDirectDrag();

            IntPtr hwnd = new WindowInteropHelper(this).Handle;
            try { File.AppendAllText(logFile, $"[ToolTip AI] HWND acquired: {hwnd}\n"); } catch { }

            // 1. Global HotKeys: Ctrl+Shift+A (snip), Ctrl+Shift+D (radar), Ctrl+Shift+C (settings)
            try
            {
                _globalHotKey = new GlobalHotKey();
                _globalHotKey.RegisterWindow(hwnd);
                _globalHotKey.OnSnipTriggered += HandleSnipShortcut;
                _globalHotKey.OnSettingsTriggered += HandleSettingsShortcut;
                _globalHotKey.OnToggleRadarTriggered += HandleToggleRadarShortcut;
                _globalHotKey.OnUserKeyboardActivity += () => _dwellEngine?.NotifyUserActivity();
                try { File.AppendAllText(logFile, $"[ToolTip AI] GlobalHotKey initialized: {GlobalHotKey.SnipDisplay}, {GlobalHotKey.RadarDisplay}, {GlobalHotKey.SettingsDisplay}.\n"); } catch { }
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

            // 3. Connect HUD callbacks
            try
            {
                HudWindow.Instance.OnRequestSnipping += StartSnipping;
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
                $"Panel listo • {GlobalHotKey.SnipDisplay} recortar • {GlobalHotKey.RadarDisplay} radar."
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
        if (_dwellEngine == null) return;

        bool newState = forceState ?? !_dwellEngine.IsEnabled;
        _dwellEngine.IsEnabled = newState;

        if (newState)
        {
            _dwellEngine.Start();
            RadarDot.Background = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0)); // Green
            if (RadarDotV != null) RadarDotV.Background = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
            RadarStatusLabel.Text = "Radar: ON";
            RadarStatusLabel.Foreground = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
            BtnToggleRadarBorder.BorderBrush = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
            if (BtnToggleRadarBorderV != null) BtnToggleRadarBorderV.BorderBrush = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
        }
        else
        {
            _dwellEngine.Stop();
            RadarDot.Background = new SolidColorBrush(Color.FromRgb(0x64, 0x74, 0x8B)); // Slate gray
            if (RadarDotV != null) RadarDotV.Background = new SolidColorBrush(Color.FromRgb(0x64, 0x74, 0x8B));
            RadarStatusLabel.Text = "Radar: OFF";
            RadarStatusLabel.Foreground = new SolidColorBrush(Color.FromRgb(0x94, 0xA3, 0xB8));
            BtnToggleRadarBorder.BorderBrush = new SolidColorBrush(Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF));
            if (BtnToggleRadarBorderV != null) BtnToggleRadarBorderV.BorderBrush = new SolidColorBrush(Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF));
        }
    }

    public void UpdateActiveDomain(string domain)
    {
        Dispatcher.Invoke(() =>
        {
            SolidColorBrush brush;
            string icon;
            string label;
            switch (domain?.ToLowerInvariant())
            {
                case "gaming":
                    brush = new SolidColorBrush(Color.FromRgb(0xA8, 0x55, 0xF7));
                    icon = "🎮";
                    label = "Gamer";
                    break;
                case "audio":
                    brush = new SolidColorBrush(Color.FromRgb(0xF5, 0x9E, 0x0B));
                    icon = "🎛️";
                    label = "Audio";
                    break;
                case "dev":
                    brush = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
                    icon = "💻";
                    label = "Código";
                    break;
                case "web":
                    brush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));
                    icon = "🌐";
                    label = "Web";
                    break;
                default:
                    brush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8));
                    icon = "🧠";
                    label = "Windows";
                    break;
            }

            CapsuleDomainPill.BorderBrush = brush;
            CapsuleDomainPill.Background = new SolidColorBrush(Color.FromArgb(0x25, brush.Color.R, brush.Color.G, brush.Color.B));
            CapsuleDomainIcon.Text = icon;
            CapsuleDomainLabel.Text = label;
            CapsuleDomainLabel.Foreground = brush;

            if (CapsuleDomainIconV != null) CapsuleDomainIconV.Text = icon;
            if (CapsuleDomainPillV != null)
            {
                CapsuleDomainPillV.BorderBrush = brush;
                CapsuleDomainPillV.Background = new SolidColorBrush(Color.FromArgb(0x25, brush.Color.R, brush.Color.G, brush.Color.B));
            }

            MainBorder.BorderBrush = brush;
        });
    }

    #region Expand / Pin / Drag Dynamics

    private bool _isDirectDragging = false;
    private DockingEngine.POINT _dragStartCursor;
    private double _dragStartWindowLeft;
    private double _dragStartWindowTop;

    private static T? FindVisualParent<T>(DependencyObject? child) where T : DependencyObject
    {
        while (child != null)
        {
            if (child is T parent) return parent;
            child = VisualTreeHelper.GetParent(child);
        }
        return null;
    }

    private void Capsule_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        // Si se hace clic en botones o controles interactivos, no iniciar arrastre
        if (e.OriginalSource is DependencyObject dep)
        {
            if (FindVisualParent<System.Windows.Controls.Button>(dep) != null ||
                FindVisualParent<System.Windows.Controls.TextBox>(dep) != null ||
                FindVisualParent<System.Windows.Controls.PasswordBox>(dep) != null)
            {
                return;
            }
        }

        if (e.LeftButton == MouseButtonState.Pressed)
        {
            if (DockingEngine.GetCursorPos(out _dragStartCursor))
            {
                _isDirectDragging = true;
                _dragStartWindowLeft = this.Left;
                _dragStartWindowTop = this.Top;

                // Si está expandido y sin fijar, contraer suavemente para que el arrastre sea ultra-ágil
                if (_isExpanded && !_isPinned)
                {
                    SetExpandedState(false);
                }

                // Sutil feedback de sujeción física
                MainBorder.Opacity = 0.92;

                this.CaptureMouse();
                e.Handled = true;
            }
        }
    }

    private void Window_MouseMove(object sender, MouseEventArgs e)
    {
        if (_isDirectDragging && e.LeftButton == MouseButtonState.Pressed)
        {
            if (DockingEngine.GetCursorPos(out var cur))
            {
                var dpi = VisualTreeHelper.GetDpi(this);
                double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
                double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

                double deltaX = (cur.X - _dragStartCursor.X) / scaleX;
                double deltaY = (cur.Y - _dragStartCursor.Y) / scaleY;

                this.Left = _dragStartWindowLeft + deltaX;
                this.Top = _dragStartWindowTop + deltaY;
            }
        }
        else if (_isDirectDragging && e.LeftButton != MouseButtonState.Pressed)
        {
            EndDirectDrag();
        }
    }

    private void Window_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
    {
        if (_isDirectDragging)
        {
            EndDirectDrag();
            e.Handled = true;
        }
    }

    private void EndDirectDrag()
    {
        if (!_isDirectDragging) return;
        _isDirectDragging = false;
        try { this.ReleaseMouseCapture(); } catch { }

        MainBorder.Opacity = 1.0;
        _dockingEngine.EvaluateAndSnap(this, isCapsule: true);
    }

    private void Window_MouseEnter(object sender, MouseEventArgs e)
    {
        if (_isDirectDragging) return;
        if (_dockingEngine.CurrentMode == DockMode.RightSidebar || _dockingEngine.CurrentMode == DockMode.LeftSidebar) return;
        if (!_isPinned && !_isExpanded)
        {
            SetExpandedState(true);
        }
    }

    private void Window_MouseLeave(object sender, MouseEventArgs e)
    {
        if (_isDirectDragging) return;
        if (!_isPinned && _isExpanded)
        {
            System.Windows.Point p = e.GetPosition(this);
            if (p.X < -10 || p.X > this.ActualWidth + 10 || p.Y < -10 || p.Y > this.ActualHeight + 10)
            {
                SetExpandedState(false);
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
            if (BtnPinV != null) BtnPinV.Foreground = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0));
            BtnPin.ToolTip = "Cápsula Fijada Expandida (Clic para permitir auto-colapso)";
            SetExpandedState(true);
        }
        else
        {
            BtnPin.Foreground = new SolidColorBrush(Color.FromRgb(0x64, 0x74, 0x8B));
            if (BtnPinV != null) BtnPinV.Foreground = new SolidColorBrush(Color.FromRgb(0x64, 0x74, 0x8B));
            BtnPin.ToolTip = "Fijar Cápsula Expandida";
            SetExpandedState(false);
        }
    }

    private void SetExpandedState(bool expand)
    {
        _isExpanded = expand;
        if (expand)
        {
            MainBorder.CornerRadius = new CornerRadius(16);
            DrawerGrid.Visibility = Visibility.Visible;
            DrawerGrid.Opacity = 1.0;
            this.Height = 130;
            BtnExpandToggle.Content = "▴";
            BtnExpandToggle.ToolTip = "Ocultar Herramientas";
        }
        else
        {
            DrawerGrid.Visibility = Visibility.Collapsed;
            DrawerGrid.Opacity = 0.0;
            MainBorder.CornerRadius = new CornerRadius(23);
            this.Height = 46;
            BtnExpandToggle.Content = "▾";
            BtnExpandToggle.ToolTip = "Mostrar Herramientas";
        }
    }

    #endregion

    private void BtnStartSnip_Click(object sender, RoutedEventArgs e)
    {
        StartSnipping();
    }

    private void StartSnipping()
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[ToolTip AI] StartSnipping invoked at {DateTime.Now}\n"); } catch { }

        var snipWin = new SnippingWindow();
        snipWin.OnSnipCompleted += (bytes, data, x, y) =>
        {
            Dispatcher.Invoke(() =>
            {
                try { File.AppendAllText(logFile, $"[ToolTip AI] OnSnipCompleted: {data.Name} ({data.ProcessName}), Showing HUD.\n"); } catch { }
                HudWindow.Instance.ShowInspection(data, bytes, x, y);
            });
        };
        snipWin.Show();
    }

    /// <summary>
    /// Herramienta: Captura la pantalla completa y la analiza de inmediato con el Tutor IA.
    /// </summary>
    private void CaptureFullScreen()
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

            var inspectionData = new InspectionData
            {
                Name = "Pantalla Completa",
                ProcessName = "Desktop",
                Summary = "Captura global de todo el escritorio lista para análisis didáctico con IA.",
                VerdictText = "Captura de Pantalla Completa",
                SafetyTag = "Seguro",
                ActionTag = "Pantalla Completa"
            };

            HudWindow.Instance.ShowInspection(
                inspectionData,
                imageBytes,
                (int)(SystemParameters.PrimaryScreenWidth / 2 - 200),
                80,
                triggerAiAnalysis: true
            );
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error al capturar pantalla completa: {ex.Message}", "ToolTip AI", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    /// <summary>
    /// Herramienta: Analiza lo que el usuario tenga copiado en el portapapeles (imagen o texto).
    /// </summary>
    private void AnalyzeClipboardContent()
    {
        try
        {
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

                    var inspectionData = new InspectionData
                    {
                        Name = "Imagen del Portapapeles",
                        ProcessName = "Clipboard",
                        Summary = "Imagen obtenida directamente desde el portapapeles de Windows.",
                        VerdictText = "Análisis de Portapapeles",
                        SafetyTag = "Seguro",
                        ActionTag = "Portapapeles"
                    };

                    HudWindow.Instance.ShowInspection(
                        inspectionData,
                        imageBytes,
                        (int)(SystemParameters.PrimaryScreenWidth / 2 - 200),
                        80,
                        triggerAiAnalysis: true
                    );
                    return;
                }
            }

            if (System.Windows.Clipboard.ContainsText())
            {
                string text = System.Windows.Clipboard.GetText();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    var inspectionData = new InspectionData
                    {
                        Name = "Texto del Portapapeles",
                        ProcessName = "Clipboard",
                        Summary = text.Length > 250 ? text.Substring(0, 250) + "..." : text,
                        OcrText = text,
                        VerdictText = "Texto de Portapapeles",
                        SafetyTag = "Informativo",
                        ActionTag = "Texto"
                    };

                    HudWindow.Instance.ShowInspection(
                        inspectionData,
                        null,
                        (int)(SystemParameters.PrimaryScreenWidth / 2 - 200),
                        80,
                        triggerAiAnalysis: false
                    );
                    return;
                }
            }

            MessageBox.Show("El portapapeles está vacío o no contiene una imagen ni texto válido.", "ToolTip AI", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error al leer portapapeles: {ex.Message}", "ToolTip AI", MessageBoxButton.OK, MessageBoxImage.Warning);
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