using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace TeachMeAI;

/// <summary>
/// TeachMe AI Main WPF Window Host
/// Bridges Windows 11 Native APIs & Rust Engine with WebView2 Transparent Acrylic HUD
/// </summary>
public partial class MainWindow : Window
{
    private GlobalHotKey? _globalHotKey;

    public MainWindow()
    {
        InitializeComponent();

        // Position across virtual desktop (supporting multi-monitor configurations)
        this.Left = SystemParameters.VirtualScreenLeft;
        this.Top = SystemParameters.VirtualScreenTop;
        this.Width = SystemParameters.VirtualScreenWidth;
        this.Height = SystemParameters.VirtualScreenHeight;
    }

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            // Initialize WebView2 with 100% transparent composition
            var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Path.GetTempPath(), "TeachMeAI_WebView2Profile"));
            await WebViewControl.EnsureCoreWebView2Async(env);

            WebViewControl.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            WebViewControl.CoreWebView2.Settings.IsStatusBarEnabled = false;
            WebViewControl.CoreWebView2.Settings.AreDevToolsEnabled = true;

            // Wire IPC Message handling
            WebViewControl.CoreWebView2.WebMessageReceived += OnWebMessageReceived;

            // Navigate to local wwwroot UI
            string localHtmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "index.html");
            if (File.Exists(localHtmlPath))
            {
                WebViewControl.CoreWebView2.Navigate(new Uri(localHtmlPath).AbsoluteUri);
            }
            else
            {
                // Fallback to project root if running from bin
                string fallbackPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\wwwroot\index.html"));
                if (File.Exists(fallbackPath))
                {
                    WebViewControl.CoreWebView2.Navigate(new Uri(fallbackPath).AbsoluteUri);
                }
            }

            // Register global low-level Windows keyboard hook for Shift + A / Ctrl + Shift + A / Alt + A
            _globalHotKey = new GlobalHotKey();
            _globalHotKey.OnSnipTriggered += HandleGlobalSnipShortcut;

            Debug.WriteLine("[TeachMe AI] Host initialized successfully with Rust/Win32 Interop.");
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error inicializando TeachMe AI Engine: {ex.Message}", "TeachMe AI Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void HandleGlobalSnipShortcut()
    {
        Dispatcher.Invoke(() =>
        {
            this.Show();
            this.Activate();
            this.Topmost = true;

            // Dispatch command to WebView2 frontend
            var msg = new { action = "trigger_snipping" };
            WebViewControl.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(msg));
        });
    }

    private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            string rawJson = e.WebMessageAsJson;
            using var doc = JsonDocument.Parse(rawJson);
            var root = doc.RootElement;

            if (root.TryGetProperty("action", out var actionProp))
            {
                string action = actionProp.GetString() ?? string.Empty;

                switch (action)
                {
                    case "snip_completed":
                        HandleSnipCompleted(root);
                        break;

                    case "query_window_under_cursor":
                        HandleQueryWindow(root);
                        break;

                    case "close_app":
                        this.Close();
                        break;

                    case "hide_overlay":
                        this.Hide();
                        break;

                    case "minimize_app":
                        this.WindowState = WindowState.Minimized;
                        break;
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[TeachMe AI] WebMessage error: {ex.Message}");
        }
    }

    private void HandleSnipCompleted(JsonElement root)
    {
        int x = root.GetProperty("x").GetInt32();
        int y = root.GetProperty("y").GetInt32();
        int width = root.GetProperty("width").GetInt32();
        int height = root.GetProperty("height").GetInt32();

        // 1. Capture real pixels from Windows desktop
        string base64Image = RustNativeBridge.CaptureRectToBase64(x, y, width, height);

        // 2. Query target window beneath center of snip
        int centerX = x + (width / 2);
        int centerY = y + (height / 2);
        var winInfo = RustNativeBridge.InspectWindowAtPoint(centerX, centerY);

        // 3. Send rich result back to WebView2 UI
        var response = new
        {
            action = "snip_result",
            x = x,
            y = y,
            width = width,
            height = height,
            title = winInfo.Title,
            process = winInfo.ProcessName,
            pid = winInfo.ProcessId,
            hwnd = winInfo.Hwnd.ToInt64(),
            image = base64Image,
            isRustEngine = RustNativeBridge.IsRustEngineActive
        };

        string json = JsonSerializer.Serialize(response);
        WebViewControl.CoreWebView2.PostWebMessageAsJson(json);
    }

    private void HandleQueryWindow(JsonElement root)
    {
        int x = root.GetProperty("x").GetInt32();
        int y = root.GetProperty("y").GetInt32();

        var winInfo = RustNativeBridge.InspectWindowAtPoint(x, y);

        var response = new
        {
            action = "window_inspection_result",
            x = x,
            y = y,
            title = winInfo.Title,
            process = winInfo.ProcessName,
            pid = winInfo.ProcessId,
            hwnd = winInfo.Hwnd.ToInt64(),
            isRustEngine = RustNativeBridge.IsRustEngineActive
        };

        string json = JsonSerializer.Serialize(response);
        WebViewControl.CoreWebView2.PostWebMessageAsJson(json);
    }

    private void Window_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        _globalHotKey?.Dispose();
        _globalHotKey = null;
    }
}