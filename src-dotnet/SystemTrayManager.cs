using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Interop;
using System.Windows.Media;

namespace TeachMeAI;

public class SystemTrayManager : IDisposable
{
    private const uint WM_USER = 0x0400;
    public const uint WM_TRAYICON = WM_USER + 101;

    private const uint NIM_ADD = 0x00000000;
    private const uint NIM_MODIFY = 0x00000001;
    private const uint NIM_DELETE = 0x00000002;

    private const uint NIF_MESSAGE = 0x00000001;
    private const uint NIF_ICON = 0x00000002;
    private const uint NIF_TIP = 0x00000004;
    private const uint NIF_INFO = 0x00000010;

    private const uint NIIF_INFO = 0x00000001;

    private const int WM_LBUTTONUP = 0x0202;
    private const int WM_LBUTTONDBLCLK = 0x0203;
    private const int WM_RBUTTONUP = 0x0205;
    private const int NIN_BALLOONUSERCLICK = 0x0405;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private struct NOTIFYICONDATA
    {
        public uint cbSize;
        public IntPtr hWnd;
        public uint uID;
        public uint uFlags;
        public uint uCallbackMessage;
        public IntPtr hIcon;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string szTip;
        public uint dwState;
        public uint dwStateMask;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
        public string szInfo;
        public uint uTimeoutOrVersion;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)]
        public string szInfoTitle;
        public uint dwInfoFlags;
        public Guid guidItem;
        public IntPtr hBalloonIcon;
    }

    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    private static extern bool Shell_NotifyIcon(uint dwMessage, ref NOTIFYICONDATA lpdata);

    private IntPtr _hwnd;
    private bool _isAdded = false;
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
        var helper = new WindowInteropHelper(window);
        _hwnd = helper.Handle;

        var source = HwndSource.FromHwnd(_hwnd);
        source?.AddHook(HwndHook);

        AddTrayIcon();
        BuildContextMenu();
    }

    private void AddTrayIcon()
    {
        try
        {
            IntPtr hIcon = IntPtr.Zero;
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string icoPath = Path.Combine(baseDir, "app.ico");
                if (File.Exists(icoPath))
                {
                    using var fileIcon = new System.Drawing.Icon(icoPath);
                    hIcon = fileIcon.Handle;
                }
                else
                {
                    string? exePath = Environment.ProcessPath;
                    if (!string.IsNullOrEmpty(exePath))
                    {
                        using var sysIcon = System.Drawing.Icon.ExtractAssociatedIcon(exePath);
                        if (sysIcon != null) hIcon = sysIcon.Handle;
                    }
                }
            }
            catch { }

            if (hIcon == IntPtr.Zero)
            {
                hIcon = SystemIcons.Application.Handle;
            }

            var nid = new NOTIFYICONDATA
            {
                cbSize = (uint)Marshal.SizeOf<NOTIFYICONDATA>(),
                hWnd = _hwnd,
                uID = 1001,
                uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP,
                uCallbackMessage = WM_TRAYICON,
                hIcon = hIcon,
                szTip = "TeachMe AI - Activo (Ctrl+A)"
            };

            _isAdded = Shell_NotifyIcon(NIM_ADD, ref nid);
        }
        catch { }
    }

    public void ShowNotification(string title, string message)
    {
        if (!_isAdded) return;
        try
        {
            var nid = new NOTIFYICONDATA
            {
                cbSize = (uint)Marshal.SizeOf<NOTIFYICONDATA>(),
                hWnd = _hwnd,
                uID = 1001,
                uFlags = NIF_INFO,
                szInfoTitle = title,
                szInfo = message,
                dwInfoFlags = NIIF_INFO
            };
            Shell_NotifyIcon(NIM_MODIFY, ref nid);
        }
        catch { }
    }

    private IntPtr HwndHook(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WM_TRAYICON)
        {
            int eventId = lParam.ToInt32();
            switch (eventId)
            {
                case WM_LBUTTONUP:
                case WM_LBUTTONDBLCLK:
                case NIN_BALLOONUSERCLICK:
                    OnRestoreRequested?.Invoke();
                    handled = true;
                    break;

                case WM_RBUTTONUP:
                    ShowContextMenu();
                    handled = true;
                    break;
            }
        }
        return IntPtr.Zero;
    }

    private void BuildContextMenu()
    {
        _trayContextMenu = new ContextMenu
        {
            Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0x0A, 0x0E, 0x18)),
            BorderBrush = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0x1C, 0x26, 0x38)),
            BorderThickness = new Thickness(1),
            Placement = PlacementMode.MousePoint
        };

        // Header
        var headerItem = new MenuItem
        {
            Header = "TeachMe AI • Menú Rápido",
            IsEnabled = false,
            FontWeight = FontWeights.Bold,
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0x00, 0xF5, 0xA0))
        };
        _trayContextMenu.Items.Add(headerItem);
        _trayContextMenu.Items.Add(new Separator());

        // 1. Recortar
        var snipItem = new MenuItem
        {
            Header = "⚡ Recortar Área (Ctrl + A)",
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0xFF, 0xFF, 0xFF))
        };
        snipItem.Click += (s, e) => OnSnipRequested?.Invoke();
        _trayContextMenu.Items.Add(snipItem);

        // 2. Pantalla Completa
        var fullScreenItem = new MenuItem
        {
            Header = "📸 Capturar Pantalla Completa",
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0x38, 0xBD, 0xF8))
        };
        fullScreenItem.Click += (s, e) => OnFullScreenCaptureRequested?.Invoke();
        _trayContextMenu.Items.Add(fullScreenItem);

        // 3. Portapapeles
        var clipItem = new MenuItem
        {
            Header = "📋 Analizar Portapapeles",
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0xCB, 0xD5, 0xE1))
        };
        clipItem.Click += (s, e) => OnClipboardAnalyzeRequested?.Invoke();
        _trayContextMenu.Items.Add(clipItem);

        // 4. Radar Toggle
        var radarItem = new MenuItem
        {
            Header = "📡 Alternar Radar Automático (Ctrl + D)",
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0x94, 0xA3, 0xB8))
        };
        radarItem.Click += (s, e) => OnToggleRadarRequested?.Invoke();
        _trayContextMenu.Items.Add(radarItem);

        _trayContextMenu.Items.Add(new Separator());

        // 5. Abrir Panel
        var openItem = new MenuItem
        {
            Header = "🪟 Abrir Panel Principal",
            FontWeight = FontWeights.SemiBold,
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0xFF, 0xFF, 0xFF))
        };
        openItem.Click += (s, e) => OnRestoreRequested?.Invoke();
        _trayContextMenu.Items.Add(openItem);

        // 6. Ajustes
        var settingsItem = new MenuItem
        {
            Header = "⚙️ Ajustes & Modelos (Ctrl + Shift + C)",
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0x94, 0xA3, 0xB8))
        };
        settingsItem.Click += (s, e) => OnSettingsRequested?.Invoke();
        _trayContextMenu.Items.Add(settingsItem);

        _trayContextMenu.Items.Add(new Separator());

        // 7. Salir
        var exitItem = new MenuItem
        {
            Header = "❌ Salir de TeachMe AI",
            Foreground = new SolidColorBrush(System.Windows.Media.Color.FromRgb(0xF4, 0x3F, 0x5E))
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
        if (_isAdded && _hwnd != IntPtr.Zero)
        {
            var nid = new NOTIFYICONDATA
            {
                cbSize = (uint)Marshal.SizeOf<NOTIFYICONDATA>(),
                hWnd = _hwnd,
                uID = 1001
            };
            Shell_NotifyIcon(NIM_DELETE, ref nid);
            _isAdded = false;
        }
    }
}
