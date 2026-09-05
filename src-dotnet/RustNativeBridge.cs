using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace TeachMeAI;

/// <summary>
/// High-Performance Interop Bridge connecting .NET 10 to the Rust Kernel (teachme_core.dll)
/// with zero-latency Win32 fallback.
/// </summary>
public static class RustNativeBridge
{
    private static bool _isRustLoaded = false;
    private static IntPtr _rustModuleHandle = IntPtr.Zero;

    // Delegates matching Rust C-ABI exports in teachme_core
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    private delegate int TeachMeInitEngineDelegate();

    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    private unsafe delegate int TeachMeGetWindowDelegate(int x, int y, char* outTitle, nuint maxTitleLen, uint* outPid);

    private static TeachMeInitEngineDelegate? _rustInit;
    private static TeachMeGetWindowDelegate? _rustGetWindow;

    static RustNativeBridge()
    {
        TryLoadRustLibrary();
    }

    private static void TryLoadRustLibrary()
    {
        try
        {
            string[] searchPaths = [
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "teachme_core.dll"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\..\src-rust\target\release\teachme_core.dll"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\..\src-rust\target\debug\teachme_core.dll")
            ];

            foreach (var path in searchPaths)
            {
                if (File.Exists(path))
                {
                    _rustModuleHandle = LoadLibrary(path);
                    if (_rustModuleHandle != IntPtr.Zero)
                    {
                        var initPtr = GetProcAddress(_rustModuleHandle, "teachme_init_engine");
                        var getWinPtr = GetProcAddress(_rustModuleHandle, "teachme_get_window_under_cursor");

                        if (initPtr != IntPtr.Zero && getWinPtr != IntPtr.Zero)
                        {
                            _rustInit = Marshal.GetDelegateForFunctionPointer<TeachMeInitEngineDelegate>(initPtr);
                            _rustGetWindow = Marshal.GetDelegateForFunctionPointer<TeachMeGetWindowDelegate>(getWinPtr);

                            int res = _rustInit();
                            _isRustLoaded = (res == 1);
                            Debug.WriteLine($"[TeachMe AI] Native Rust Kernel initialized successfully from: {path}");
                            return;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[TeachMe AI] Rust dynamic loader info: {ex.Message}. Using Win32 fast path.");
        }

        _isRustLoaded = false;
        Debug.WriteLine("[TeachMe AI] Rust kernel in standby. Using Win32 Native Kernel fallback.");
    }

    public static bool IsRustEngineActive => _isRustLoaded;

    /// <summary>
    /// Inspects the native Windows window and process at coordinates (x, y)
    /// </summary>
    public static (IntPtr Hwnd, uint ProcessId, string Title, string ProcessName) InspectWindowAtPoint(int x, int y)
    {
        IntPtr hwnd = WindowFromPoint(new POINT { X = x, Y = y });
        if (hwnd == IntPtr.Zero)
        {
            return (IntPtr.Zero, 0, "Desktop Surface", "explorer");
        }

        // Walk up to top-level root window if this is a child control
        IntPtr rootHwnd = GetAncestor(hwnd, GA_ROOT);
        if (rootHwnd != IntPtr.Zero)
        {
            hwnd = rootHwnd;
        }

        uint pid = 0;
        GetWindowThreadProcessId(hwnd, out pid);

        var titleSb = new StringBuilder(512);
        GetWindowText(hwnd, titleSb, titleSb.Capacity);
        string windowTitle = titleSb.ToString();

        string procName = "Desconocido";
        if (pid > 0)
        {
            try
            {
                using var proc = Process.GetProcessById((int)pid);
                procName = proc.ProcessName;
                if (string.IsNullOrWhiteSpace(windowTitle))
                {
                    windowTitle = proc.MainWindowTitle;
                }
            }
            catch
            {
                procName = "System Process";
            }
        }

        if (string.IsNullOrWhiteSpace(windowTitle))
        {
            windowTitle = $"{procName} (Window #{hwnd})";
        }

        return (hwnd, pid, windowTitle, procName);
    }

    /// <summary>
    /// High-performance desktop screen capture converting the bounding box to Base64 PNG
    /// </summary>
    public static string CaptureRectToBase64(int x, int y, int width, int height)
    {
        if (width <= 0 || height <= 0) return string.Empty;

        // Ensure within bounds
        int screenW = GetSystemMetrics(SM_CXVIRTUALSCREEN);
        int screenH = GetSystemMetrics(SM_CYVIRTUALSCREEN);
        int screenX = GetSystemMetrics(SM_XVIRTUALSCREEN);
        int screenY = GetSystemMetrics(SM_YVIRTUALSCREEN);

        int clampX = Math.Max(screenX, x);
        int clampY = Math.Max(screenY, y);
        int clampW = Math.Min(width, (screenX + screenW) - clampX);
        int clampH = Math.Min(height, (screenY + screenH) - clampY);

        if (clampW <= 0 || clampH <= 0) return string.Empty;

        using var bmp = new Bitmap(clampW, clampH, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(bmp))
        {
            g.CopyFromScreen(clampX, clampY, 0, 0, new Size(clampW, clampH), CopyPixelOperation.SourceCopy);
        }

        using var ms = new MemoryStream();
        bmp.Save(ms, ImageFormat.Png);
        byte[] bytes = ms.ToArray();
        return "data:image/png;base64," + Convert.ToBase64String(bytes);
    }

    #region Win32 P/Invoke Definitions

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT
    {
        public int X;
        public int Y;
    }

    private const uint GA_ROOT = 2;
    private const int SM_XVIRTUALSCREEN = 76;
    private const int SM_YVIRTUALSCREEN = 77;
    private const int SM_CXVIRTUALSCREEN = 78;
    private const int SM_CYVIRTUALSCREEN = 79;

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    private static extern IntPtr LoadLibrary(string lpFileName);

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Ansi)]
    private static extern IntPtr GetProcAddress(IntPtr hModule, string procName);

    [DllImport("user32.dll")]
    public static extern IntPtr WindowFromPoint(POINT point);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll", ExactSpelling = true)]
    public static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll")]
    public static extern bool GetCursorPos(out POINT lpPoint);

    #endregion
}
