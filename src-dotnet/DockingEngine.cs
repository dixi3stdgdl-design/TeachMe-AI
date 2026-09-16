using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace TeachMeAI;

public enum DockMode
{
    Floating,
    RightSidebar,
    LeftSidebar,
    BottomRibbon,
    TopCapsule
}

public class DockingEngine
{
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetCursorPos(out POINT lpPoint);

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT
    {
        public int X;
        public int Y;
    }

    public DockMode CurrentMode { get; private set; } = DockMode.Floating;

    public event Action<DockMode>? OnDockModeChanged;

    private const double SnapThreshold = 110.0;
    private const double AnimationDurationMs = 160.0;

    /// <summary>
    /// Evalúa la posición actual de la ventana y cursor respecto a los bordes de la pantalla y la acopla magnéticamente con animación.
    /// </summary>
    public DockMode EvaluateAndSnap(Window window, bool isCapsule = false)
    {
        double screenW = SystemParameters.WorkArea.Width;
        double screenH = SystemParameters.WorkArea.Height;
        double workLeft = SystemParameters.WorkArea.Left;
        double workTop = SystemParameters.WorkArea.Top;

        double winLeft = window.Left;
        double winTop = window.Top;
        double winW = window.ActualWidth > 0 ? window.ActualWidth : window.Width;
        double winH = window.ActualHeight > 0 ? window.ActualHeight : window.Height;

        POINT mouse = new POINT();
        bool hasMouse = GetCursorPos(out mouse);
        var dpi = VisualTreeHelper.GetDpi(window);
        double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
        double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

        double mouseDpiX = hasMouse ? (mouse.X / scaleX) : (winLeft + winW / 2);
        double mouseDpiY = hasMouse ? (mouse.Y / scaleY) : (winTop + winH / 2);

        // Detección híbrida: analiza tanto los bordes de la ventana como la posición del ratón normalizada en DIPs
        bool isNearRight = (hasMouse && mouseDpiX >= (workLeft + screenW - SnapThreshold)) ||
                           ((winLeft + winW) >= (workLeft + screenW - SnapThreshold));

        bool isNearLeft = (hasMouse && mouseDpiX <= (workLeft + SnapThreshold)) ||
                          (winLeft <= (workLeft + SnapThreshold));

        bool isNearTop = (hasMouse && mouseDpiY <= (workTop + SnapThreshold)) ||
                         (winTop <= (workTop + SnapThreshold));

        bool isNearBottom = (hasMouse && mouseDpiY >= (workTop + screenH - SnapThreshold)) ||
                            ((winTop + winH) >= (workTop + screenH - SnapThreshold));

        DockMode targetMode;
        double targetLeft;
        double targetTop;
        double targetWidth;
        double targetHeight;

        // 1. Prioridad Bordes Laterales (Morfismo Vertical)
        if (isNearRight)
        {
            targetMode = DockMode.RightSidebar;
            targetWidth = isCapsule ? 58 : 325;
            targetHeight = isCapsule ? 285 : Math.Min(580, screenH - 80);
            targetLeft = workLeft + screenW - targetWidth - 8;
            double preferredY = hasMouse ? (mouseDpiY - targetHeight / 2.0) : winTop;
            targetTop = workTop + Math.Max(20, Math.Min(preferredY, screenH - targetHeight - 20));
        }
        else if (isNearLeft)
        {
            targetMode = DockMode.LeftSidebar;
            targetWidth = isCapsule ? 58 : 325;
            targetHeight = isCapsule ? 285 : Math.Min(580, screenH - 80);
            targetLeft = workLeft + 8;
            double preferredY = hasMouse ? (mouseDpiY - targetHeight / 2.0) : winTop;
            targetTop = workTop + Math.Max(20, Math.Min(preferredY, screenH - targetHeight - 20));
        }
        // 2. Borde Superior (Cápsula o Ribbon Horizontal)
        else if (isNearTop)
        {
            if (isCapsule)
            {
                targetMode = DockMode.TopCapsule;
                targetWidth = 500;
                targetHeight = 46;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2);
                targetTop = workTop + 8;
            }
            else
            {
                // Para el HUD, borde superior se acopla como Ribbon panorámico superior
                targetMode = DockMode.BottomRibbon;
                targetWidth = Math.Min(780, screenW - 40);
                targetHeight = 118;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2);
                targetTop = workTop + 8;
            }
        }
        // 3. Borde Inferior (Cápsula o Ribbon Horizontal)
        else if (isNearBottom)
        {
            if (isCapsule)
            {
                targetMode = DockMode.BottomRibbon;
                targetWidth = 500;
                targetHeight = 46;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2);
                targetTop = workTop + screenH - targetHeight - 8;
            }
            else
            {
                targetMode = DockMode.BottomRibbon;
                targetWidth = Math.Min(780, screenW - 40);
                targetHeight = 118;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2);
                targetTop = workTop + screenH - targetHeight - 8;
            }
        }
        // 4. Libre Flotante
        else
        {
            targetMode = DockMode.Floating;
            targetWidth = isCapsule ? 500 : 325;
            targetHeight = isCapsule ? 46 : 435;
            targetLeft = Math.Max(workLeft + 10, Math.Min(winLeft, workLeft + screenW - targetWidth - 10));
            targetTop = Math.Max(workTop + 10, Math.Min(winTop, workTop + screenH - targetHeight - 10));
        }

        AnimateWindowGeometry(window, targetLeft, targetTop, targetWidth, targetHeight);

        CurrentMode = targetMode;
        OnDockModeChanged?.Invoke(targetMode);

        return targetMode;
    }

    /// <summary>
    /// Alterna manualmente entre vista vertical (flotante/sidebar) y vista horizontal (ribbon panorámico).
    /// </summary>
    public void ToggleOrientation(Window window, bool isCapsule = false)
    {
        if (isCapsule) return;

        double screenW = SystemParameters.WorkArea.Width;
        double screenH = SystemParameters.WorkArea.Height;
        double workLeft = SystemParameters.WorkArea.Left;
        double workTop = SystemParameters.WorkArea.Top;

        if (CurrentMode == DockMode.BottomRibbon)
        {
            // Switch to Vertical
            double targetW = 325;
            double targetH = 435;
            double targetL = Math.Max(workLeft + 10, Math.Min(window.Left, workLeft + screenW - targetW - 10));
            double targetT = Math.Max(workTop + 10, Math.Min(window.Top, workTop + screenH - targetH - 10));

            CurrentMode = DockMode.Floating;
            OnDockModeChanged?.Invoke(CurrentMode);
            AnimateWindowGeometry(window, targetL, targetT, targetW, targetH);
        }
        else
        {
            // Switch to Horizontal Ribbon
            double targetW = Math.Min(780, screenW - 40);
            double targetH = 118;
            double targetL = workLeft + Math.Max(10, (screenW - targetW) / 2);
            double targetT = workTop + screenH - targetH - 8;

            CurrentMode = DockMode.BottomRibbon;
            OnDockModeChanged?.Invoke(CurrentMode);
            AnimateWindowGeometry(window, targetL, targetT, targetW, targetH);
        }
    }

    /// <summary>
    /// Desplaza y redimensiona suavemente la ventana usando interpolación CubicEase acelerada.
    /// </summary>
    private void AnimateWindowGeometry(Window window, double targetLeft, double targetTop, double targetWidth, double targetHeight)
    {
        var ease = new CubicEase { EasingMode = EasingMode.EaseOut };
        var duration = TimeSpan.FromMilliseconds(AnimationDurationMs);

        // Animación Left
        var animLeft = new DoubleAnimation(window.Left, targetLeft, duration) { EasingFunction = ease };
        animLeft.Completed += (s, e) =>
        {
            window.BeginAnimation(Window.LeftProperty, null);
            window.Left = targetLeft;
        };

        // Animación Top
        var animTop = new DoubleAnimation(window.Top, targetTop, duration) { EasingFunction = ease };
        animTop.Completed += (s, e) =>
        {
            window.BeginAnimation(Window.TopProperty, null);
            window.Top = targetTop;
        };

        // Animación Width
        var animWidth = new DoubleAnimation(window.Width, targetWidth, duration) { EasingFunction = ease };
        animWidth.Completed += (s, e) =>
        {
            window.BeginAnimation(FrameworkElement.WidthProperty, null);
            window.Width = targetWidth;
        };

        // Animación Height
        var animHeight = new DoubleAnimation(window.Height, targetHeight, duration) { EasingFunction = ease };
        animHeight.Completed += (s, e) =>
        {
            window.BeginAnimation(FrameworkElement.HeightProperty, null);
            window.Height = targetHeight;
        };

        window.BeginAnimation(Window.LeftProperty, animLeft);
        window.BeginAnimation(Window.TopProperty, animTop);
        window.BeginAnimation(FrameworkElement.WidthProperty, animWidth);
        window.BeginAnimation(FrameworkElement.HeightProperty, animHeight);
    }
}
