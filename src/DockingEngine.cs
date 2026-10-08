using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace ToolTipAI;

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
    public double TargetLeft { get; private set; } = 0;
    public double TargetTop { get; private set; } = 0;

    public event Action<DockMode>? OnDockModeChanged;

    private const double SnapThreshold = 110.0;
    private const double AnimationDurationMs = 160.0;

    /// <summary>
    /// Evalúa la posición actual de la ventana y cursor respecto a los bordes del monitor actual y la acopla magnéticamente con animación.
    /// Soporta configuraciones multimonitor de cualquier resolución y factor de escala DPI.
    /// </summary>
    public DockMode EvaluateAndSnap(Window window, bool isCapsule = false)
    {
        POINT mouse = new POINT();
        bool hasMouse = GetCursorPos(out mouse);

        // 1. Identificar el monitor físico en el que está el cursor o la ventana
        System.Drawing.Point refPoint = hasMouse 
            ? new System.Drawing.Point(mouse.X, mouse.Y)
            : new System.Drawing.Point((int)Math.Round(window.Left), (int)Math.Round(window.Top));

        var screens = System.Windows.Forms.Screen.AllScreens;
        var currentScreen = System.Windows.Forms.Screen.FromPoint(refPoint) 
                            ?? System.Windows.Forms.Screen.PrimaryScreen 
                            ?? (screens is { Length: > 0 } ? screens[0] : null);

        var dpi = VisualTreeHelper.GetDpi(window);
        double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
        double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

        // Área de trabajo del monitor actual convertida a DIPs
        double workLeft, workTop, screenW, screenH;
        if (currentScreen == null || currentScreen.Primary)
        {
            workLeft = SystemParameters.WorkArea.Left;
            workTop = SystemParameters.WorkArea.Top;
            screenW = SystemParameters.WorkArea.Width;
            screenH = SystemParameters.WorkArea.Height;
        }
        else
        {
            workLeft = currentScreen.WorkingArea.Left / scaleX;
            workTop = currentScreen.WorkingArea.Top / scaleY;
            screenW = currentScreen.WorkingArea.Width / scaleX;
            screenH = currentScreen.WorkingArea.Height / scaleY;
        }

        double winLeft = window.Left;
        double winTop = window.Top;
        double winW = window.ActualWidth > 0 ? window.ActualWidth : window.Width;
        double winH = window.ActualHeight > 0 ? window.ActualHeight : window.Height;

        double mouseDpiX = hasMouse ? (mouse.X / scaleX) : (winLeft + winW / 2.0);
        double mouseDpiY = hasMouse ? (mouse.Y / scaleY) : (winTop + winH / 2.0);

        // Distancias euclidianas a los 4 bordes del monitor actual
        double distLeft = Math.Abs(mouseDpiX - workLeft);
        double distRight = Math.Abs((workLeft + screenW) - mouseDpiX);
        double distTop = Math.Abs(mouseDpiY - workTop);
        double distBottom = Math.Abs((workTop + screenH) - mouseDpiY);

        // Umbral de acoplamiento magnético (120 DIPs)
        const double snapMargin = 120.0;

        DockMode targetMode;
        double targetLeft;
        double targetTop;
        double targetWidth;
        double targetHeight;

        // 1. Prioridad Bordes Laterales (Panel Sidebar Vertical)
        if (distLeft <= snapMargin && distLeft < distTop && distLeft < distBottom)
        {
            targetMode = DockMode.LeftSidebar;
            targetWidth = isCapsule ? 58 : 325;
            targetHeight = isCapsule ? 330 : Math.Min(580, screenH - 80);
            targetLeft = workLeft + 8;
            double preferredY = hasMouse ? (mouseDpiY - targetHeight / 2.0) : winTop;
            targetTop = Math.Max(workTop + 20, Math.Min(preferredY, workTop + screenH - targetHeight - 20));
        }
        else if (distRight <= snapMargin && distRight < distTop && distRight < distBottom)
        {
            targetMode = DockMode.RightSidebar;
            targetWidth = isCapsule ? 58 : 325;
            targetHeight = isCapsule ? 330 : Math.Min(580, screenH - 80);
            targetLeft = workLeft + screenW - targetWidth - 8;
            double preferredY = hasMouse ? (mouseDpiY - targetHeight / 2.0) : winTop;
            targetTop = Math.Max(workTop + 20, Math.Min(preferredY, workTop + screenH - targetHeight - 20));
        }
        // 2. Borde Superior (Cápsula Horizontal o Ribbon)
        else if (distTop <= snapMargin)
        {
            if (isCapsule)
            {
                targetMode = DockMode.TopCapsule;
                targetWidth = Math.Min(680, screenW - 20);
                targetHeight = 48;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2.0);
                targetTop = workTop + 8;
            }
            else
            {
                targetMode = DockMode.BottomRibbon;
                targetWidth = Math.Min(780, screenW - 40);
                targetHeight = 118;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2.0);
                targetTop = workTop + 8;
            }
        }
        // 3. Borde Inferior (Cápsula Horizontal o Ribbon)
        else if (distBottom <= snapMargin)
        {
            if (isCapsule)
            {
                targetMode = DockMode.BottomRibbon;
                targetWidth = Math.Min(680, screenW - 20);
                targetHeight = 48;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2.0);
                targetTop = workTop + screenH - targetHeight - 8;
            }
            else
            {
                targetMode = DockMode.BottomRibbon;
                targetWidth = Math.Min(780, screenW - 40);
                targetHeight = 118;
                targetLeft = workLeft + Math.Max(10, (screenW - targetWidth) / 2.0);
                targetTop = workTop + screenH - targetHeight - 8;
            }
        }
        // 4. Libre Flotante
        else
        {
            targetMode = DockMode.Floating;
            targetWidth = isCapsule ? Math.Min(680, screenW - 20) : 325;
            targetHeight = isCapsule ? 48 : Math.Min(435, screenH - 40);
            targetLeft = Math.Max(workLeft + 10, Math.Min(winLeft, workLeft + screenW - targetWidth - 10));
            targetTop = Math.Max(workTop + 10, Math.Min(winTop, workTop + screenH - targetHeight - 10));
        }

        AnimateWindowGeometry(window, targetLeft, targetTop, targetWidth, targetHeight);

        TargetLeft = targetLeft;
        TargetTop = targetTop;
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

        POINT mouse = new POINT();
        bool hasMouse = GetCursorPos(out mouse);
        System.Drawing.Point refPoint = hasMouse 
            ? new System.Drawing.Point(mouse.X, mouse.Y)
            : new System.Drawing.Point((int)Math.Round(window.Left), (int)Math.Round(window.Top));

        var screens = System.Windows.Forms.Screen.AllScreens;
        var currentScreen = System.Windows.Forms.Screen.FromPoint(refPoint) 
                            ?? System.Windows.Forms.Screen.PrimaryScreen 
                            ?? (screens is { Length: > 0 } ? screens[0] : null);

        var dpi = VisualTreeHelper.GetDpi(window);
        double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
        double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

        double workLeft, workTop, screenW, screenH;
        if (currentScreen == null || currentScreen.Primary)
        {
            workLeft = SystemParameters.WorkArea.Left;
            workTop = SystemParameters.WorkArea.Top;
            screenW = SystemParameters.WorkArea.Width;
            screenH = SystemParameters.WorkArea.Height;
        }
        else
        {
            workLeft = currentScreen.WorkingArea.Left / scaleX;
            workTop = currentScreen.WorkingArea.Top / scaleY;
            screenW = currentScreen.WorkingArea.Width / scaleX;
            screenH = currentScreen.WorkingArea.Height / scaleY;
        }

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
            double targetL = workLeft + Math.Max(10, (screenW - targetW) / 2.0);
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
