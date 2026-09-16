using System;
using System.Drawing;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Forms;
using ContextMenu = System.Windows.Controls.ContextMenu;
using MenuItem = System.Windows.Controls.MenuItem;

namespace TeachMeAI;

public class SystemTrayManager : IDisposable
{
    private static readonly string LogFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
        "TeachMeAI", 
        "run.log");

    private NotifyIcon? _notifyIcon;
    private ContextMenu? _trayContextMenu;

    public event Action? OnRestoreRequested;
    public event Action? OnSnipRequested;
    public event Action? OnFullScreenCaptureRequested;
    public event Action? OnClipboardAnalyzeRequested;
    public event Action? OnToggleRadarRequested;
    public event Action? OnSettingsRequested;
    public event Action? OnExitRequested;

    public void Initialize(Window window)
    {
        BuildContextMenu();
        CreateNotifyIcon();
    }

    private void CreateNotifyIcon()
    {
        try
        {
            _notifyIcon = new NotifyIcon();

            // Cargar icono oficial de la aplicación
            Icon? icon = null;
            string icoPath = Path.Combine(AppContext.BaseDirectory, "app.ico");
            if (File.Exists(icoPath))
            {
                try
                {
                    icon = new Icon(icoPath, 32, 32);
                    File.AppendAllText(LogFile, $"[SystemTrayManager] Icono cargado desde {icoPath}\n");
                }
                catch { }
            }

            if (icon == null)
            {
                try
                {
                    string? exePath = Environment.ProcessPath;
                    if (!string.IsNullOrEmpty(exePath) && File.Exists(exePath))
                    {
                        icon = Icon.ExtractAssociatedIcon(exePath);
                        File.AppendAllText(LogFile, $"[SystemTrayManager] Icono extraído de {exePath}\n");
                    }
                }
                catch { }
            }

            _notifyIcon.Icon = icon ?? SystemIcons.Application;
            _notifyIcon.Text = "ToolTip AI • Menú rápido (Ctrl+Shift+A)";
            _notifyIcon.Visible = true;

            // Manejo de clicks en el icono de la bandeja
            _notifyIcon.MouseClick += (s, e) =>
            {
                if (e.Button == MouseButtons.Left)
                {
                    Application.Current?.Dispatcher?.Invoke(() =>
                    {
                        OnRestoreRequested?.Invoke();
                    });
                }
                else if (e.Button == MouseButtons.Right)
                {
                    Application.Current?.Dispatcher?.Invoke(() =>
                    {
                        ShowContextMenu();
                    });
                }
            };

            _notifyIcon.DoubleClick += (s, e) =>
            {
                Application.Current?.Dispatcher?.Invoke(() =>
                {
                    OnRestoreRequested?.Invoke();
                });
            };

            _notifyIcon.BalloonTipClicked += (s, e) =>
            {
                Application.Current?.Dispatcher?.Invoke(() =>
                {
                    OnRestoreRequested?.Invoke();
                });
            };

            File.AppendAllText(LogFile, $"[SystemTrayManager] NotifyIcon inicializado con éxito. Visible: {_notifyIcon.Visible}\n");
        }
        catch (Exception ex)
        {
            try { File.AppendAllText(LogFile, $"[SystemTrayManager] Error creando NotifyIcon: {ex.Message}\n"); } catch { }
        }
    }

    public void ShowNotification(string title, string message)
    {
        try
        {
            if (_notifyIcon != null && _notifyIcon.Visible)
            {
                _notifyIcon.ShowBalloonTip(3000, title, message, ToolTipIcon.Info);
            }
        }
        catch { }
    }

    private void BuildContextMenu()
    {
        _trayContextMenu = new ContextMenu
        {
            Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x0A, 0x0E, 0x18)),
            BorderBrush = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x1C, 0x26, 0x38)),
            BorderThickness = new Thickness(1),
            Placement = PlacementMode.MousePoint
        };

        // Header
        var headerItem = new MenuItem
        {
            Header = "ToolTip AI • Menú rápido",
            IsEnabled = false,
            FontWeight = FontWeights.Bold,
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0))
        };
        _trayContextMenu.Items.Add(headerItem);
        _trayContextMenu.Items.Add(new Separator());

        // 1. Recortar
        var snipItem = new MenuItem
        {
            Header = "⚡ Recortar Área (Ctrl+Shift+A)",
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0xFF, 0xFF, 0xFF))
        };
        snipItem.Click += (s, e) => OnSnipRequested?.Invoke();
        _trayContextMenu.Items.Add(snipItem);

        // 2. Pantalla Completa
        var fullScreenItem = new MenuItem
        {
            Header = "📸 Capturar Pantalla Completa",
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x38, 0xBD, 0xF8))
        };
        fullScreenItem.Click += (s, e) => OnFullScreenCaptureRequested?.Invoke();
        _trayContextMenu.Items.Add(fullScreenItem);

        // 3. Portapapeles
        var clipItem = new MenuItem
        {
            Header = "📋 Analizar Portapapeles",
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0xCB, 0xD5, 0xE1))
        };
        clipItem.Click += (s, e) => OnClipboardAnalyzeRequested?.Invoke();
        _trayContextMenu.Items.Add(clipItem);

        // 4. Radar Toggle
        var radarItem = new MenuItem
        {
            Header = "📡 Alternar Radar Automático (Ctrl+Shift+D)",
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x94, 0xA3, 0xB8))
        };
        radarItem.Click += (s, e) => OnToggleRadarRequested?.Invoke();
        _trayContextMenu.Items.Add(radarItem);

        _trayContextMenu.Items.Add(new Separator());

        // 5. Abrir Panel
        var openItem = new MenuItem
        {
            Header = "🪟 Abrir Panel Principal",
            FontWeight = FontWeights.SemiBold,
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0xFF, 0xFF, 0xFF))
        };
        openItem.Click += (s, e) => OnRestoreRequested?.Invoke();
        _trayContextMenu.Items.Add(openItem);

        // 6. Ajustes
        var settingsItem = new MenuItem
        {
            Header = "⚙️ Ajustes & Modelos (Ctrl + Shift + C)",
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x94, 0xA3, 0xB8))
        };
        settingsItem.Click += (s, e) => OnSettingsRequested?.Invoke();
        _trayContextMenu.Items.Add(settingsItem);

        _trayContextMenu.Items.Add(new Separator());

        // 7. Salir
        var exitItem = new MenuItem
        {
            Header = "❌ Salir de ToolTip AI",
            Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0xF4, 0x3F, 0x5E))
        };
        exitItem.Click += (s, e) => OnExitRequested?.Invoke();
        _trayContextMenu.Items.Add(exitItem);
    }

    private void ShowContextMenu()
    {
        if (_trayContextMenu != null)
        {
            _trayContextMenu.IsOpen = true;
        }
    }

    public void Dispose()
    {
        if (_notifyIcon != null)
        {
            _notifyIcon.Visible = false;
            _notifyIcon.Dispose();
            _notifyIcon = null;
        }
    }
}
