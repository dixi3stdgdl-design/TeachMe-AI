using System;
using System.IO;
using System.Threading;
using System.Windows;

namespace TeachMeAI;

public partial class App : System.Windows.Application
{
    private static readonly string LogFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
        "TeachMeAI", 
        "run.log");

    private const string MutexName = @"Local\TeachMeAI_SingleInstance_Mutex_Dixi3";
    private const string EventName = @"Local\TeachMeAI_BringToFront_Event_Dixi3";

    private static Mutex? _singleInstanceMutex;
    private static EventWaitHandle? _bringToFrontEvent;
    private static Thread? _signalListenerThread;
    private static volatile bool _isRunning = true;

    public static void SafeLog(string message)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(LogFile)!);
            using var fs = new FileStream(LogFile, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
            using var sw = new StreamWriter(fs);
            sw.Write(message);
        }
        catch { }
    }

    protected override void OnStartup(StartupEventArgs e)
    {
        SafeLog($"[ToolTip AI] OnStartup iniciado a las {DateTime.Now} (PID {Environment.ProcessId})\n");

        AppDomain.CurrentDomain.UnhandledException += (s, args) =>
        {
            SafeLog($"[Unhandled] {args.ExceptionObject}\n");
        };

        DispatcherUnhandledException += (s, args) =>
        {
            SafeLog($"[DispatcherUnhandled] {args.Exception}\n");
        };

        // --- GESTIÓN DE INSTANCIA ÚNICA Y ACTUALIZACIÓN LIMPIA ---
        // Si el usuario abre TeachMe AI (por acceso directo, script o actualización) y ya existía
        // una instancia anterior (o proceso en segundo plano), la cerramos limpiamente para que la
        // versión actualizada tome el control de inmediato y nunca se cancele ni se congele.
        int currentPid = Environment.ProcessId;
        try
        {
            foreach (var p in System.Diagnostics.Process.GetProcessesByName("TeachMeAI"))
            {
                if (p.Id != currentPid)
                {
                    try
                    {
                        SafeLog($"[ToolTip AI] Proceso previo detectado (PID {p.Id}). Reemplazando con la versión más reciente...\n");
                        p.Kill();
                        p.WaitForExit(1000);
                    }
                    catch { }
                }
            }
        }
        catch { }

        try
        {
            _singleInstanceMutex = new Mutex(true, MutexName, out _);
        }
        catch (Exception ex)
        {
            SafeLog($"[ToolTip AI] Mutex notice: {ex.Message}\n");
        }

        // --- INSTANCIA PRIMARIA: Iniciar escucha de peticiones secundarias ---
        try
        {
            _bringToFrontEvent = new EventWaitHandle(false, EventResetMode.AutoReset, EventName, out _);
            _signalListenerThread = new Thread(() =>
            {
                while (_isRunning)
                {
                    try
                    {
                        if (_bringToFrontEvent?.WaitOne() == true)
                        {
                            if (!_isRunning) break;
                            SafeLog("[ToolTip AI] Solicitud recibida de instancia secundaria. Restaurando ventana al frente...\n");
                            Current?.Dispatcher?.BeginInvoke(new Action(() =>
                            {
                                try
                                {
                                    TeachMeAI.MainWindow.Instance?.RestoreWindow();
                                }
                                catch (Exception ex)
                                {
                                    SafeLog($"[ToolTip AI] Error al restaurar MainWindow: {ex.Message}\n");
                                }
                            }));
                        }
                    }
                    catch (ThreadAbortException) { break; }
                    catch (Exception ex)
                    {
                        SafeLog($"[ToolTip AI] Error en hilo de escucha: {ex.Message}\n");
                    }
                }
            })
            {
                IsBackground = true,
                Name = "TeachMeAI_SignalListenerThread"
            };
            _signalListenerThread.Start();
        }
        catch (Exception ex)
        {
            SafeLog($"[ToolTip AI] Error al crear EventWaitHandle: {ex.Message}\n");
        }

        try
        {
            this.ShutdownMode = ShutdownMode.OnExplicitShutdown;
            base.OnStartup(e);
            SafeLog("[ToolTip AI] base.OnStartup ejecutado como Instancia Primaria.\n");
        }
        catch (Exception ex)
        {
            SafeLog($"[ToolTip AI] Error fatal en inicio: {ex}\n");
        }
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _isRunning = false;
        try
        {
            _bringToFrontEvent?.Set();
            _bringToFrontEvent?.Dispose();
            _bringToFrontEvent = null;
        }
        catch { }

        if (_singleInstanceMutex != null)
        {
            try
            {
                _singleInstanceMutex.ReleaseMutex();
            }
            catch { }
            _singleInstanceMutex.Dispose();
            _singleInstanceMutex = null;
        }

        SafeLog($"[ToolTip AI] OnExit con código {e.ApplicationExitCode}. Stack:\n{Environment.StackTrace}\n");

        base.OnExit(e);
    }
}

