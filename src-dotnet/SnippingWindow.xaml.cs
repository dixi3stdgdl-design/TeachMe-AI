using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Point = System.Windows.Point;

namespace TeachMeAI;

public partial class SnippingWindow : Window
{
    private Point _startPoint;
    private bool _isDragging = false;

    public event Action<byte[], InspectionData, int, int>? OnSnipCompleted;

    public SnippingWindow()
    {
        InitializeComponent();

        this.Left = SystemParameters.VirtualScreenLeft;
        this.Top = SystemParameters.VirtualScreenTop;
        this.Width = SystemParameters.VirtualScreenWidth;
        this.Height = SystemParameters.VirtualScreenHeight;
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        this.Activate();
        this.Focus();
    }

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Escape)
        {
            this.Close();
        }
    }

    private void Window_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (e.LeftButton == MouseButtonState.Pressed)
        {
            _startPoint = e.GetPosition(OverlayCanvas);
            _isDragging = true;

            Canvas.SetLeft(SelectionRect, _startPoint.X);
            Canvas.SetTop(SelectionRect, _startPoint.Y);
            SelectionRect.Width = 0;
            SelectionRect.Height = 0;
            SelectionRect.Visibility = Visibility.Visible;

            DimensionTag.Visibility = Visibility.Visible;
            OverlayCanvas.CaptureMouse();
        }
    }

    private void Window_MouseMove(object sender, MouseEventArgs e)
    {
        if (!_isDragging) return;

        Point currentPoint = e.GetPosition(OverlayCanvas);

        double x = Math.Min(_startPoint.X, currentPoint.X);
        double y = Math.Min(_startPoint.Y, currentPoint.Y);
        double width = Math.Abs(currentPoint.X - _startPoint.X);
        double height = Math.Abs(currentPoint.Y - _startPoint.Y);

        Canvas.SetLeft(SelectionRect, x);
        Canvas.SetTop(SelectionRect, y);
        SelectionRect.Width = width;
        SelectionRect.Height = height;

        DimensionText.Text = $"{(int)width} x {(int)height} px";
        Canvas.SetLeft(DimensionTag, x);
        Canvas.SetTop(DimensionTag, y + height + 6);
    }

    private void Window_MouseUp(object sender, MouseButtonEventArgs e)
    {
        if (!_isDragging) return;

        _isDragging = false;
        OverlayCanvas.ReleaseMouseCapture();

        double x = Canvas.GetLeft(SelectionRect);
        double y = Canvas.GetTop(SelectionRect);
        double width = SelectionRect.Width;
        double height = SelectionRect.Height;

        this.Hide();

        if (width > 20 && height > 20)
        {
            try
            {
                // Capture pixels
                byte[] imageBytes = CaptureScreenArea((int)x, (int)y, (int)width, (int)height);

                // Query window beneath center
                int centerX = (int)(x + width / 2);
                int centerY = (int)(y + height / 2);
                var winInfo = NativeKernelEngine.InspectWindowAtPoint(centerX, centerY);

                var data = new InspectionData
                {
                    Name = winInfo.Title,
                    ProcessName = winInfo.ProcessName,
                    ProcessId = winInfo.ProcessId,
                    ControlType = winInfo.ClassName,
                    OcrText = $"[HWND: 0x{winInfo.Hwnd.ToInt64():X}] {winInfo.Title} | Clase: {winInfo.ClassName}",
                    VerdictText = $"Proceso: {winInfo.ProcessName}.exe • Clase: {winInfo.ClassName}",
                    Summary = $"Ventana activa: '{winInfo.Title}' perteneciente al proceso {winInfo.ProcessName} (PID: {winInfo.ProcessId}) usando el control nativo '{winInfo.ClassName}'.",
                    ExePath = winInfo.ExePath,
                    CliSnippet = $"Get-Process -Id {winInfo.ProcessId} | Select-Object Id, ProcessName, Path, CPU, WorkingSet64"
                };

                OnSnipCompleted?.Invoke(imageBytes, data, (int)(x + width + 14), (int)y);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al capturar pantalla: {ex.Message}", "TeachMe AI", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        this.Close();
    }

    private byte[] CaptureScreenArea(int x, int y, int width, int height)
    {
        using var bmp = new Bitmap(width, height);
        using var g = Graphics.FromImage(bmp);
        g.CopyFromScreen(x, y, 0, 0, new System.Drawing.Size(width, height), CopyPixelOperation.SourceCopy);

        using var ms = new MemoryStream();
        bmp.Save(ms, ImageFormat.Png);
        return ms.ToArray();
    }
}
