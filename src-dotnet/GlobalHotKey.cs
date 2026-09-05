using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Interop;

namespace TeachMeAI;

/// <summary>
/// Robust Dual-Engine Windows Global HotKey Manager.
/// Combines Win32 RegisterHotKey (message pump level) with WH_KEYBOARD_LL low-level fallback
/// to guarantee 100% reliable invocation across Windows 11 under any focused application.
/// </summary>
public class GlobalHotKey : IDisposable
{
    public event Action? OnSnipTriggered;
    public event Action? OnSettingsTriggered;
    public event Action? OnUserKeyboardActivity;

    private IntPtr _windowHandle = IntPtr.Zero;
    private HwndSource? _hwndSource;
    private IntPtr _hookId = IntPtr.Zero;
    private LowLevelKeyboardProc? _proc;

    // Win32 Constants
    private const int WM_HOTKEY = 0x0312;
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_SYSKEYDOWN = 0x0104;

    private const uint MOD_ALT = 0x0001;
    private const uint MOD_CONTROL = 0x0002;
    private const uint MOD_SHIFT = 0x0004;
    private const uint MOD_NOREPEAT = 0x4000;

    private const int VK_A = 0x41;
    private const int VK_C = 0x43;
    private const int VK_SHIFT = 0x10;
    private const int VK_CONTROL = 0x11;
    private const int VK_MENU = 0x12;

    private const int HOTKEY_ID_SHIFT_A = 9001;
    private const int HOTKEY_ID_CTRL_SHIFT_A = 9002;
    private const int HOTKEY_ID_ALT_A = 9003;

    private const int HOTKEY_ID_SHIFT_C = 9004;
    private const int HOTKEY_ID_CTRL_SHIFT_C = 9005;
    private const int HOTKEY_ID_ALT_C = 9006;

    [UnmanagedFunctionPointer(CallingConvention.StdCall)]
    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    public GlobalHotKey()
    {
    }

    private DateTime _lastTriggerTime = DateTime.MinValue;
    private DateTime _lastSettingsTime = DateTime.MinValue;

    /// <summary>
    /// Binds Win32 RegisterHotKey and WH_KEYBOARD_LL to guarantee hotkey detection.
    /// </summary>
    public void RegisterWindow(IntPtr hWnd)
    {
        string logFile = System.IO.Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
            "TeachMeAI", 
            "run.log");

        _windowHandle = hWnd;
        _hwndSource = HwndSource.FromHwnd(hWnd);
        _hwndSource?.AddHook(HwndHook);

        // 1. Win32 RegisterHotKey: Shift+A (Snip), Shift+C (Settings)
        bool ok1 = RegisterHotKey(_windowHandle, HOTKEY_ID_SHIFT_A, MOD_SHIFT, VK_A);
        bool ok2 = RegisterHotKey(_windowHandle, HOTKEY_ID_CTRL_SHIFT_A, MOD_CONTROL | MOD_SHIFT, VK_A);
        bool ok3 = RegisterHotKey(_windowHandle, HOTKEY_ID_ALT_A, MOD_ALT, VK_A);

        bool ok4 = RegisterHotKey(_windowHandle, HOTKEY_ID_SHIFT_C, MOD_SHIFT, VK_C);
        bool ok5 = RegisterHotKey(_windowHandle, HOTKEY_ID_CTRL_SHIFT_C, MOD_CONTROL | MOD_SHIFT, VK_C);
        bool ok6 = RegisterHotKey(_windowHandle, HOTKEY_ID_ALT_C, MOD_ALT, VK_C);

        try { System.IO.File.AppendAllText(logFile, $"[TeachMe AI] RegisterHotKey Shift+A: {ok1}, Shift+C: {ok4}\n"); } catch { }

        // 2. Install WH_KEYBOARD_LL hook for guaranteed interception
        try
        {
            _proc = HookCallback;
            using var curProcess = Process.GetCurrentProcess();
            using var curModule = curProcess.MainModule;
            IntPtr modHandle = GetModuleHandle(curModule?.ModuleName ?? "");
            _hookId = SetWindowsHookEx(WH_KEYBOARD_LL, _proc, modHandle, 0);
            try { System.IO.File.AppendAllText(logFile, $"[TeachMe AI] SetWindowsHookEx WH_KEYBOARD_LL installed. HookId: {_hookId}\n"); } catch { }
        }
        catch (Exception ex)
        {
            try { System.IO.File.AppendAllText(logFile, $"[TeachMe AI] Hook installation error: {ex.Message}\n"); } catch { }
        }
    }

    private void TriggerSnipWithDebounce(string source)
    {
        if ((DateTime.UtcNow - _lastTriggerTime).TotalMilliseconds < 600) return;
        _lastTriggerTime = DateTime.UtcNow;

        string logFile = System.IO.Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
            "TeachMeAI", 
            "run.log");

        try { System.IO.File.AppendAllText(logFile, $"[TeachMe AI] Snip HotKey triggered via {source} at {DateTime.Now}\n"); } catch { }
        OnSnipTriggered?.Invoke();
    }

    private void TriggerSettingsWithDebounce(string source)
    {
        if ((DateTime.UtcNow - _lastSettingsTime).TotalMilliseconds < 600) return;
        _lastSettingsTime = DateTime.UtcNow;

        string logFile = System.IO.Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
            "TeachMeAI", 
            "run.log");

        try { System.IO.File.AppendAllText(logFile, $"[TeachMe AI] Settings HotKey (Shift+C) triggered via {source} at {DateTime.Now}\n"); } catch { }
        OnSettingsTriggered?.Invoke();
    }

    private IntPtr HwndHook(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WM_HOTKEY)
        {
            int id = wParam.ToInt32();
            if (id == HOTKEY_ID_SHIFT_A || id == HOTKEY_ID_CTRL_SHIFT_A || id == HOTKEY_ID_ALT_A)
            {
                TriggerSnipWithDebounce($"WM_HOTKEY (ID: {id})");
                handled = true;
            }
            else if (id == HOTKEY_ID_SHIFT_C || id == HOTKEY_ID_CTRL_SHIFT_C || id == HOTKEY_ID_ALT_C)
            {
                TriggerSettingsWithDebounce($"WM_HOTKEY (ID: {id})");
                handled = true;
            }
        }
        return IntPtr.Zero;
    }

    private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN))
        {
            // Reset dwell timer whenever ANY key is typed anywhere so typing is NEVER interrupted
            OnUserKeyboardActivity?.Invoke();

            int vkCode = Marshal.ReadInt32(lParam);

            bool shiftDown = (GetKeyState(VK_SHIFT) & 0x8000) != 0;
            bool ctrlDown = (GetKeyState(VK_CONTROL) & 0x8000) != 0;
            bool altDown = (GetKeyState(VK_MENU) & 0x8000) != 0;

            if (vkCode == VK_A)
            {
                if (shiftDown || (ctrlDown && shiftDown) || altDown)
                {
                    TriggerSnipWithDebounce("LowLevelKeyboardHook");
                }
            }
            else if (vkCode == VK_C)
            {
                if (shiftDown || (ctrlDown && shiftDown) || altDown)
                {
                    TriggerSettingsWithDebounce("LowLevelKeyboardHook");
                }
            }
        }

        return CallNextHookEx(_hookId, nCode, wParam, lParam);
    }

    public void Dispose()
    {
        if (_windowHandle != IntPtr.Zero)
        {
            UnregisterHotKey(_windowHandle, HOTKEY_ID_SHIFT_A);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_CTRL_SHIFT_A);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_ALT_A);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_SHIFT_C);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_CTRL_SHIFT_C);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_ALT_C);
            _windowHandle = IntPtr.Zero;
        }

        if (_hwndSource != null)
        {
            _hwndSource.RemoveHook(HwndHook);
            _hwndSource = null;
        }

        if (_hookId != IntPtr.Zero)
        {
            UnhookWindowsHookEx(_hookId);
            _hookId = IntPtr.Zero;
        }
    }

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll")]
    private static extern short GetKeyState(int nVirtKey);
}
