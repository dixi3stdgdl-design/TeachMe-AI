using System;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;

namespace TeachMeAI;

public partial class MainWindow : Window
{
    private GlobalHotKey? _globalHotKey;
    private DwellEngine? _dwellEngine;

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

            // 1. Global HotKeys
            try
            {
                _globalHotKey = new GlobalHotKey();
                _globalHotKey.RegisterWindow(hwnd);
                _globalHotKey.OnSnipTriggered += HandleSnipShortcut;
                _globalHotKey.OnSettingsTriggered += HandleSettingsShortcut;
                _globalHotKey.OnUserKeyboardActivity += () => _dwellEngine?.NotifyUserActivity();
                try { File.AppendAllText(logFile, "[TeachMe AI] GlobalHotKey initialized with Shift+A and Shift+C.\n"); } catch { }
            }
            catch (Exception ex)
            {
                try { File.AppendAllText(logFile, $"[TeachMe AI] HotKey setup error: {ex.Message}\n"); } catch { }
            }

            // 2. Native Mouse Dwell Radar
            try
            {
                _dwellEngine = new DwellEngine();
                _dwellEngine.OnDwellTriggered += (data, bytes, x, y) =>
                {
                    Dispatcher.Invoke(() =>
                    {
                        HudWindow.Instance.ShowInspection(data, bytes, x, y);
                    });
                };
                _dwellEngine.Start();
                try { File.AppendAllText(logFile, "[TeachMe AI] DwellEngine initialized and started.\n"); } catch { }
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
        }
        catch (Exception ex)
        {
            try { File.AppendAllText(logFile, $"[TeachMe AI] Window_Loaded fatal: {ex}\n"); } catch { }
        }
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

    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.LeftButton == MouseButtonState.Pressed)
        {
            this.DragMove();
        }
    }

    private void BtnTriggerSnipping_Click(object sender, RoutedEventArgs e)
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
            Summary = "Panel principal de TeachMe AI activo. Pulsa 'Shift + A' para seleccionar cualquier área de tu escritorio.",
            VerdictText = "Sistema Activo • Listo para Recortar",
            SafetyTag = "Seguro",
            ActionTag = "Recortar"
        };
        HudWindow.Instance.ShowInspection(dummyData, null, (int)(this.Left + this.Width + 10), (int)this.Top);
    }

    private void BtnMinimize_Click(object sender, RoutedEventArgs e)
    {
        this.WindowState = WindowState.Minimized;
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        this.Hide();
    }

    private bool _isExplicitExit = false;

    private void BtnQuit_Click(object sender, RoutedEventArgs e)
    {
        _isExplicitExit = true;
        Application.Current.Shutdown();
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

        _dwellEngine?.Stop();
        _globalHotKey?.Dispose();
    }
}