using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Interop;

namespace TeachMeAI;

/// <summary>
/// Global hotkeys for ToolTip AI.
/// Uses RegisterHotKey as the primary path and a low-level keyboard hook only as a
/// fallback that matches the exact product combos (never Ctrl+A / Ctrl+D alone).
/// </summary>
public class GlobalHotKey : IDisposable
{
    public const string SnipDisplay = "Ctrl+Shift+A";
    public const string RadarDisplay = "Ctrl+Shift+D";
    public const string SettingsDisplay = "Ctrl+Shift+C";

    public event Action? OnSnipTriggered;
    public event Action? OnSettingsTriggered;
    public event Action? OnToggleRadarTriggered;
    public event Action? OnUserKeyboardActivity;

    private IntPtr _windowHandle = IntPtr.Zero;
    private HwndSource? _hwndSource;
    private IntPtr _hookId = IntPtr.Zero;
    private LowLevelKeyboardProc? _proc;

    private const int WM_HOTKEY = 0x0312;
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_SYSKEYDOWN = 0x0104;

    private const uint MOD_CONTROL = 0x0002;
    private const uint MOD_SHIFT = 0x0004;
    private const uint MOD_NOREPEAT = 0x4000;

    private const int VK_A = 0x41;
    private const int VK_C = 0x43;
    private const int VK_D = 0x44;
    private const int VK_SHIFT = 0x10;
    private const int VK_CONTROL = 0x11;

    private const int HOTKEY_ID_SNIP = 9002;       // Ctrl+Shift+A
    private const int HOTKEY_ID_SETTINGS = 9005;   // Ctrl+Shift+C
    private const int HOTKEY_ID_RADAR = 9009;      // Ctrl+Shift+D

    [UnmanagedFunctionPointer(CallingConvention.StdCall)]
    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    private DateTime _lastTriggerTime = DateTime.MinValue;
    private DateTime _lastSettingsTime = DateTime.MinValue;
    private DateTime _lastRadarTime = DateTime.MinValue;

    public void RegisterWindow(IntPtr hWnd)
    {
        string logFile = System.IO.Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "TeachMeAI",
            "run.log");

        _windowHandle = hWnd;
        _hwndSource = HwndSource.FromHwnd(hWnd);
        _hwndSource?.AddHook(HwndHook);

        // Primary combos only — avoid Select All (Ctrl+A) and bookmark-like Ctrl+D.
        RegisterHotKey(_windowHandle, HOTKEY_ID_SNIP, MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT, VK_A);
        RegisterHotKey(_windowHandle, HOTKEY_ID_SETTINGS, MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT, VK_C);
        RegisterHotKey(_windowHandle, HOTKEY_ID_RADAR, MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT, VK_D);

        try
        {
            System.IO.File.AppendAllText(
                logFile,
                $"[ToolTip AI] Hotkeys registered: {SnipDisplay}, {RadarDisplay}, {SettingsDisplay}.\n");
        }
        catch { }

        try
        {
            _proc = HookCallback;
            using var curProcess = Process.GetCurrentProcess();
            using var curModule = curProcess.MainModule;
            IntPtr modHandle = GetModuleHandle(curModule?.ModuleName ?? "");
            _hookId = SetWindowsHookEx(WH_KEYBOARD_LL, _proc, modHandle, 0);
            try
            {
                System.IO.File.AppendAllText(
                    logFile,
                    $"[ToolTip AI] WH_KEYBOARD_LL fallback installed (exact Ctrl+Shift combos only). HookId: {_hookId}\n");
            }
            catch { }
        }
        catch (Exception ex)
        {
            try
            {
                System.IO.File.AppendAllText(logFile, $"[ToolTip AI] Hook installation error: {ex.Message}\n");
            }
            catch { }
        }
    }

    private void TriggerSnipWithDebounce(string source)
    {
        if ((DateTime.UtcNow - _lastTriggerTime).TotalMilliseconds < 600) return;
        _lastTriggerTime = DateTime.UtcNow;
        Log($"Snip via {source}");
        OnSnipTriggered?.Invoke();
    }

    private void TriggerSettingsWithDebounce(string source)
    {
        if ((DateTime.UtcNow - _lastSettingsTime).TotalMilliseconds < 600) return;
        _lastSettingsTime = DateTime.UtcNow;
        Log($"Settings via {source}");
        OnSettingsTriggered?.Invoke();
    }

    private void TriggerToggleRadarWithDebounce(string source)
    {
        if ((DateTime.UtcNow - _lastRadarTime).TotalMilliseconds < 600) return;
        _lastRadarTime = DateTime.UtcNow;
        Log($"Radar via {source}");
        OnToggleRadarTriggered?.Invoke();
    }

    private static void Log(string message)
    {
        try
        {
            string logFile = System.IO.Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "TeachMeAI",
                "run.log");
            System.IO.File.AppendAllText(logFile, $"[ToolTip AI] {message} at {DateTime.Now}\n");
        }
        catch { }
    }

    private IntPtr HwndHook(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WM_HOTKEY)
        {
            int id = wParam.ToInt32();
            if (id == HOTKEY_ID_SNIP)
            {
                TriggerSnipWithDebounce($"WM_HOTKEY (ID: {id})");
                handled = true;
            }
            else if (id == HOTKEY_ID_SETTINGS)
            {
                TriggerSettingsWithDebounce($"WM_HOTKEY (ID: {id})");
                handled = true;
            }
            else if (id == HOTKEY_ID_RADAR)
            {
                TriggerToggleRadarWithDebounce($"WM_HOTKEY (ID: {id})");
                handled = true;
            }
        }
        return IntPtr.Zero;
    }

    private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN))
        {
            // Any typing resets dwell so the radar never fights the keyboard.
            OnUserKeyboardActivity?.Invoke();

            int vkCode = Marshal.ReadInt32(lParam);
            bool shiftDown = (GetKeyState(VK_SHIFT) & 0x8000) != 0;
            bool ctrlDown = (GetKeyState(VK_CONTROL) & 0x8000) != 0;

            // Fallback only for the exact product combos (Ctrl+Shift + letter).
            if (ctrlDown && shiftDown)
            {
                if (vkCode == VK_A)
                    TriggerSnipWithDebounce("LowLevelKeyboardHook");
                else if (vkCode == VK_C)
                    TriggerSettingsWithDebounce("LowLevelKeyboardHook");
                else if (vkCode == VK_D)
                    TriggerToggleRadarWithDebounce("LowLevelKeyboardHook");
            }
        }

        return CallNextHookEx(_hookId, nCode, wParam, lParam);
    }

    public void Dispose()
    {
        if (_windowHandle != IntPtr.Zero)
        {
            UnregisterHotKey(_windowHandle, HOTKEY_ID_SNIP);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_SETTINGS);
            UnregisterHotKey(_windowHandle, HOTKEY_ID_RADAR);
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
