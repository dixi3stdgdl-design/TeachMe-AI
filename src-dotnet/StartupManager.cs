using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Win32;

namespace TeachMeAI;

public static class StartupManager
{
    private const string RunKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
    private const string AppName = "TeachMeAI";

    private static string GetConfigPath()
    {
        string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        string folder = Path.Combine(appData, "TeachMeAI");
        Directory.CreateDirectory(folder);
        return Path.Combine(folder, "config.json");
    }

    /// <summary>
    /// Remueve cualquier entrada de autoarranque con Windows para asegurar que NUNCA inicie solo al prender la PC.
    /// </summary>
    public static void EnsureNoWindowsStartup()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, true);
            key?.DeleteValue(AppName, false);
        }
        catch { }
    }

    /// <summary>
    /// Comprueba si es la primera vez que se abre la aplicación:
    /// - La primera vez: Muestra la pantalla principal en el escritorio ("programa de inicio").
    /// - A partir de la segunda vez: Se aloja directamente en la barra de tareas / bandeja del sistema.
    /// NO inicia automáticamente con Windows bajo ninguna circunstancia.
    /// </summary>
    public static bool CheckAndHandleFirstRun()
    {
        // Garantizar que no esté en el arranque de Windows
        EnsureNoWindowsStartup();

        string path = GetConfigPath();
        bool isFirstRun = true;

        try
        {
            if (File.Exists(path))
            {
                string json = File.ReadAllText(path);
                var node = JsonNode.Parse(json);
                if (node != null && node["HasCompletedInitialSetup"] != null)
                {
                    isFirstRun = !node["HasCompletedInitialSetup"]!.GetValue<bool>();
                }
            }
        }
        catch { }

        if (isFirstRun)
        {
            // Guardar que la primera apertura ya fue vista para que las siguientes vayan a la barra de tareas
            try
            {
                JsonObject obj;
                if (File.Exists(path))
                {
                    var parsed = JsonNode.Parse(File.ReadAllText(path)) as JsonObject;
                    obj = parsed ?? new JsonObject();
                }
                else
                {
                    obj = new JsonObject();
                }

                obj["HasCompletedInitialSetup"] = true;
                obj.Remove("StartWithWindows");
                File.WriteAllText(path, obj.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));
            }
            catch { }
        }

        return isFirstRun;
    }
}
