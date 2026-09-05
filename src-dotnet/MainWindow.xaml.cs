using System;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media.Imaging;

namespace TeachMeAI;

public partial class MainWindow : Window
{
    private GlobalHotKey? _globalHotKey;
    private DwellEngine? _dwellEngine;
    private SystemTrayManager? _trayManager;
    private bool _isExplicitExit = false;

    public MainWindow()
    {
        InitializeComponent();

        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");

        this.Closed += (s, e) =>
        {
            try { File.AppendAllText(logFile, $"[TeachMe AI] MainWindow Closed event fired. Stack:\n{Environment.StackTrace}\n"); } catch { }
        };

        this.Deactivated += (s, e) =>
        {
            try { File.AppendAllText(logFile, $"[TeachMe AI] MainWindow Deactivated event fired.\n"); } catch { }
        };
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[TeachMe AI] Window_Loaded entered at {DateTime.Now}\n"); } catch { }

        try
        {
            IntPtr hwnd = new WindowInteropHelper(this).Handle;
            try { File.AppendAllText(logFile, $"[TeachMe AI] HWND acquired: {hwnd}\n"); } catch { }

            // 1. Global HotKeys (Ctrl+A para recorte, Ctrl+D para radar, Ctrl+Shift+C para ajustes)
            try
            {
                _globalHotKey = new GlobalHotKey();
                _globalHotKey.RegisterWindow(hwnd);
                _globalHotKey.OnSnipTriggered += HandleSnipShortcut;
                _globalHotKey.OnSettingsTriggered += HandleSettingsShortcut;
                _globalHotKey.OnToggleRadarTriggered += HandleToggleRadarShortcut;
                _globalHotKey.OnUserKeyboardActivity += () => _dwellEngine?.NotifyUserActivity();
                try { File.AppendAllText(logFile, "[TeachMe AI] GlobalHotKey initialized with Ctrl+A, Ctrl+D, Ctrl+Shift+C.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[TeachMe AI] HotKey setup error: {ex.Message}\n"); } catch { }
            }

            // 2. Native Mouse Dwell Radar (Controlado con Ctrl + D o botón)
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
                try { File.AppendAllText(logFile, "[TeachMe AI] DwellEngine creado (apagado por defecto, activable con Ctrl+D).\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[TeachMe AI] DwellEngine setup error: {ex.Message}\n"); } catch { }
            }

            // 3. Connect HUD callbacks
            try
            {
                HudWindow.Instance.OnRequestSnipping += StartSnipping;
                try { File.AppendAllText(logFile, "[TeachMe AI] HUD callback connected.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[TeachMe AI] HUD setup error: {ex.Message}\n"); } catch { }
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
                try { File.AppendAllText(logFile, "[TeachMe AI] SystemTrayManager inicializado correctamente.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[TeachMe AI] Tray setup error: {ex.Message}\n"); } catch { }
            }

            // 5. Gestión de Primera Apertura vs Siguientes Ejecuciones
            bool isFirstRun = StartupManager.CheckAndHandleFirstRun();

            if (!isFirstRun)
            {
                // En todas las aperturas posteriores, se aloja directamente en la barra de tareas / bandeja
                this.WindowState = WindowState.Minimized;
                this.Hide();
                _trayManager?.ShowNotification(
                    "TeachMe AI Activo",
                    "Alojado en la barra de tareas • Pulsa Ctrl + A para recortar o haz clic en el icono para abrir."
                );
            }
            else
            {
                // Primera apertura: se muestra la ventana en pantalla para el usuario y se notifica que está listo
                _trayManager?.ShowNotification(
                    "TeachMe AI Preparado",
                    "¡Programa inicializado! En las próximas aperturas TeachMe AI se alojará directo en la barra de tareas."
                );
            }
        }
        catch (Exception ex)
        {
            try { File.AppendAllText(logFile, $"[TeachMe AI] Window_Loaded fatal: {ex}\n"); } catch { }
        }
    }

    private void RestoreWindow()
    {
        Dispatcher.Invoke(() =>
        {
            this.Show();
            this.WindowState = WindowState.Normal;
            this.Activate();
            this.Focus();
        });
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
            RadarDot.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0)); // Green
            RadarStatusLabel.Text = "Radar Automático: ENCENDIDO";
            RadarStatusLabel.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0));
            BtnToggleRadarBorder.BorderBrush = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0));
        }
        else
        {
            _dwellEngine.Stop();
            RadarDot.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x64, 0x74, 0x8B)); // Slate gray
            RadarStatusLabel.Text = "Radar Automático: APAGADO";
            RadarStatusLabel.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x94, 0xA3, 0xB8));
            BtnToggleRadarBorder.BorderBrush = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF));
        }
    }

    private void StartSnipping()
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[TeachMe AI] StartSnipping invoked at {DateTime.Now}\n"); } catch { }

        var snipWin = new SnippingWindow();
        snipWin.OnSnipCompleted += (bytes, data, x, y) =>
        {
            Dispatcher.Invoke(() =>
            {
                try { File.AppendAllText(logFile, $"[TeachMe AI] OnSnipCompleted: {data.Name} ({data.ProcessName}), Showing HUD.\n"); } catch { }
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
            MessageBox.Show($"Error al capturar pantalla completa: {ex.Message}", "TeachMe AI", MessageBoxButton.OK, MessageBoxImage.Warning);
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

            MessageBox.Show("El portapapeles está vacío o no contiene una imagen ni texto válido.", "TeachMe AI", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error al leer portapapeles: {ex.Message}", "TeachMe AI", MessageBoxButton.OK, MessageBoxImage.Warning);
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

    private void BtnSendToTray_Click(object sender, RoutedEventArgs e)
    {
        this.Hide();
        _trayManager?.ShowNotification("TeachMe AI", "Alojado en la barra de tareas. Pulsa Ctrl + A para recortar.");
    }

    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ClickCount == 2)
        {
            BtnMaximize_Click(sender, e);
            return;
        }

        if (e.LeftButton == MouseButtonState.Pressed)
        {
            if (this.WindowState == WindowState.Maximized)
            {
                var mousePos = PointToScreen(e.GetPosition(this));
                BtnMaximize_Click(sender, e);
                this.Left = Math.Max(10, mousePos.X - (this.Width / 2));
                this.Top = Math.Max(10, mousePos.Y - 14);
            }
            try
            {
                this.DragMove();
            }
            catch { }
        }
    }

    private void BtnStartSnip_Click(object sender, RoutedEventArgs e)
    {
        StartSnipping();
    }

    private void BtnOpenHud_Click(object sender, RoutedEventArgs e)
    {
        var dummyData = new InspectionData
        {
            Name = "TeachMe AI Inspector",
            ProcessName = "TeachMeAI.exe",
            ProcessId = (uint)System.Diagnostics.Process.GetCurrentProcess().Id,
            Summary = "Panel principal de TeachMe AI activo. Pulsa 'Ctrl + A' para seleccionar cualquier área de tu escritorio.",
            VerdictText = "Sistema Activo • Listo para Recortar",
            SafetyTag = "Seguro",
            ActionTag = "Recortar"
        };
        HudWindow.Instance.ShowInspection(dummyData, null, (int)(this.Left + this.Width + 10), (int)this.Top);
    }

    private void BtnMinimize_Click(object sender, RoutedEventArgs e)
    {
        this.Hide();
        _trayManager?.ShowNotification("TeachMe AI", "Alojado en la barra de tareas. Pulsa Ctrl + A para recortar.");
    }

    private void BtnMaximize_Click(object sender, RoutedEventArgs e)
    {
        if (this.WindowState == WindowState.Maximized)
        {
            this.WindowState = WindowState.Normal;
            BtnMaximize.Content = "🗖";
            BtnMaximize.ToolTip = "Maximizar";
            MainBorder.CornerRadius = new CornerRadius(14);
            MainBorder.Margin = new Thickness(6);
        }
        else
        {
            this.WindowState = WindowState.Maximized;
            BtnMaximize.Content = "🗗";
            BtnMaximize.ToolTip = "Restaurar";
            MainBorder.CornerRadius = new CornerRadius(0);
            MainBorder.Margin = new Thickness(0);
        }
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        this.Hide();
        _trayManager?.ShowNotification("TeachMe AI", "Alojado en la barra de tareas. Pulsa Ctrl + A para recortar.");
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

    private void BtnQuit_Click(object sender, RoutedEventArgs e)
    {
        QuitApplication();
    }

    private void Window_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        string logFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TeachMeAI", "run.log");
        try { File.AppendAllText(logFile, $"[TeachMe AI] Window_Closing triggered. ExplicitExit: {_isExplicitExit}. Cancel: {!_isExplicitExit}\n"); } catch { }

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