using System;
using System.IO;
using System.Windows;

namespace TeachMeAI;

public partial class App : Application
{
    private static readonly string LogFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
        "TeachMeAI", 
        "run.log");

    protected override void OnStartup(StartupEventArgs e)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(LogFile)!);
            File.WriteAllText(LogFile, $"[TeachMe AI] OnStartup entered at {DateTime.Now}\n");
        }
        catch { }

        AppDomain.CurrentDomain.UnhandledException += (s, args) =>
        {
            try { File.AppendAllText(LogFile, $"[Unhandled] {args.ExceptionObject}\n"); } catch { }
        };

        DispatcherUnhandledException += (s, args) =>
        {
            try { File.AppendAllText(LogFile, $"[DispatcherUnhandled] {args.Exception}\n"); } catch { }
        };

        try
        {
            this.ShutdownMode = ShutdownMode.OnExplicitShutdown;
            base.OnStartup(e);
            File.AppendAllText(LogFile, $"[TeachMe AI] base.OnStartup executed with ShutdownMode.OnExplicitShutdown.\n");
        }
        catch (Exception ex)
        {
            try { File.AppendAllText(LogFile, $"[TeachMe AI] Fatal startup error: {ex}\n"); } catch { }
        }
    }

    protected override void OnExit(ExitEventArgs e)
    {
        try 
        { 
            File.AppendAllText(LogFile, $"[TeachMe AI] OnExit with code {e.ApplicationExitCode}. Call stack:\n{Environment.StackTrace}\n"); 
        } 
        catch { }
        base.OnExit(e);
    }
}
