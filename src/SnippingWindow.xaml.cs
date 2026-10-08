using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Point = System.Windows.Point;

namespace ToolTipAI;

public partial class SnippingWindow : Window
{
    private Point _startPoint;
    private bool _isDragging = false;

    public event Action<byte[], InspectionData, int, int>? OnSnipCompleted;

    public SnippingWindow()
    {
        InitializeComponent();

        this.Left   = SystemParameters.VirtualScreenLeft;
        this.Top    = SystemParameters.VirtualScreenTop;
        this.Width  = SystemParameters.VirtualScreenWidth;
        this.Height = SystemParameters.VirtualScreenHeight;

        // StrokeDashArray se asigna por código porque x:Array en XAML inline puede fallar
        SelectionRect.StrokeDashArray = new DoubleCollection([5, 3]);
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        this.Activate();
        this.Focus();

        // Arranca el latido del banner de instrucción
        var heartbeat = (Storyboard)Resources["BannerHeartbeat"];
        heartbeat.Begin(this, true);
    }

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Escape)
            this.Close();
    }

    private void Window_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (e.LeftButton != MouseButtonState.Pressed) return;

        _startPoint = e.GetPosition(OverlayCanvas);
        _isDragging = true;

        Canvas.SetLeft(SelectionRect, _startPoint.X);
        Canvas.SetTop(SelectionRect, _startPoint.Y);
        SelectionRect.Width      = 0;
        SelectionRect.Height     = 0;
        SelectionRect.Visibility = Visibility.Visible;
        DimensionTag.Visibility  = Visibility.Visible;

        OverlayCanvas.CaptureMouse();
    }

    private void Window_MouseMove(object sender, MouseEventArgs e)
    {
        if (!_isDragging) return;

        Point current = e.GetPosition(OverlayCanvas);

        double x      = Math.Min(_startPoint.X, current.X);
        double y      = Math.Min(_startPoint.Y, current.Y);
        double width  = Math.Abs(current.X - _startPoint.X);
        double height = Math.Abs(current.Y - _startPoint.Y);

        Canvas.SetLeft(SelectionRect, x);
        Canvas.SetTop(SelectionRect, y);
        SelectionRect.Width  = width;
        SelectionRect.Height = height;

        DimensionText.Text = $"{(int)width} × {(int)height} px";
        Canvas.SetLeft(DimensionTag, x);
        Canvas.SetTop(DimensionTag, y + height + 8);
    }

    private void Window_MouseUp(object sender, MouseButtonEventArgs e)
    {
        if (!_isDragging) return;

        _isDragging = false;
        OverlayCanvas.ReleaseMouseCapture();

        double x      = Canvas.GetLeft(SelectionRect);
        double y      = Canvas.GetTop(SelectionRect);
        double width  = SelectionRect.Width;
        double height = SelectionRect.Height;

        this.Hide();

        if (width > 20 && height > 20)
        {
            try
            {
                var dpi = VisualTreeHelper.GetDpi(this);
                double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
                double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

                int physX = (int)Math.Round(x * scaleX);
                int physY = (int)Math.Round(y * scaleY);
                int physW = (int)Math.Round(width * scaleX);
                int physH = (int)Math.Round(height * scaleY);

                byte[] imageBytes = CaptureScreenArea(physX, physY, physW, physH);

                int centerPhysX = (int)Math.Round((x + width / 2.0) * scaleX);
                int centerPhysY = (int)Math.Round((y + height / 2.0) * scaleY);
                var winInfo    = NativeKernelEngine.InspectWindowAtPoint(centerPhysX, centerPhysY);
                var nativeInfo = UiAutomationInspector.InspectElementAt(centerPhysX, centerPhysY);

                var data = GeminiClient.GenerateFallbackData(
                    winInfo.Title, winInfo.ProcessName, winInfo.ProcessId, nativeInfo);
                data.ExePath    = winInfo.ExePath;
                data.CliSnippet = $"Get-Process -Id {winInfo.ProcessId} | Select-Object Id, ProcessName, Path, CPU, WorkingSet64";

                OnSnipCompleted?.Invoke(imageBytes, data, (int)(x + width + 14), (int)y);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error al capturar pantalla: {ex.Message}",
                    "ToolTip AI", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        this.Close();
    }

    private byte[] CaptureScreenArea(int x, int y, int width, int height)
    {
        using var bmp = new Bitmap(width, height);
        using var g   = Graphics.FromImage(bmp);
        g.CopyFromScreen(x, y, 0, 0,
            new System.Drawing.Size(width, height), CopyPixelOperation.SourceCopy);

        using var ms = new MemoryStream();
        bmp.Save(ms, ImageFormat.Png);
        return ms.ToArray();
    }
}
