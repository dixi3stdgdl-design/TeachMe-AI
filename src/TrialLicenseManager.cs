using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Win32;

namespace ToolTipAI;

/// <summary>
/// Gestiona el periodo de evaluación de 24 horas y la protección anti-reinstalación de ToolTip AI.
/// Utiliza anclaje cruzado en Registro de Windows (HKCU), LocalAppData y DPAPI.
/// </summary>
public static class TrialLicenseManager
{
    public const int TrialDurationHours = 24;

    private const string RegSubKey = @"Software\Dixi3Lqbs\ToolTipAI";
    private const string RegValueFirstRun = "FirstRunAnchor";
    private const string RegValueLastSeen = "LastActiveAnchor";
    private const string RegValueLicense = "LicenseStatus";

    private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("Dixi3Lqbs.ToolTipAI.TrialAnchor.2026");

    public record EvaluationStatus(
        bool IsLicensed,
        bool IsExpired,
        TimeSpan TimeRemaining,
        DateTime FirstRunUtc,
        string StatusMessage
    );

    /// <summary>
    /// Evalúa el estado actual de la prueba o licencia del usuario en este equipo.
    /// </summary>
    public static EvaluationStatus CheckStatus()
    {
        try
        {
            // 1. Verificar si existe licencia completa / permanente
            if (HasActiveLicense())
            {
                return new EvaluationStatus(
                    IsLicensed: true,
                    IsExpired: false,
                    TimeRemaining: TimeSpan.MaxValue,
                    FirstRunUtc: DateTime.UtcNow,
                    StatusMessage: "Licencia activa de por vida"
                );
            }

            DateTime now = DateTime.UtcNow;

            // 2. Recuperar el primer inicio desde anclajes cruzados (Registro + Disco Local)
            DateTime? anchor = GetCrossAnchoredFirstRun();

            if (!anchor.HasValue)
            {
                // Primera ejecución absoluta en este equipo
                anchor = now;
                SaveCrossAnchoredFirstRun(anchor.Value);
                SaveLastSeen(anchor.Value);

                return new EvaluationStatus(
                    IsLicensed: false,
                    IsExpired: false,
                    TimeRemaining: TimeSpan.FromHours(TrialDurationHours),
                    FirstRunUtc: anchor.Value,
                    StatusMessage: $"Prueba de 24 horas iniciada. Restan {TrialDurationHours} horas."
                );
            }

            // 3. Protección contra retraso manual del reloj de Windows (Anti-Clock Rollback)
            DateTime? lastSeen = GetLastSeen();
            if (lastSeen.HasValue && now < (lastSeen.Value - TimeSpan.FromMinutes(15)))
            {
                // El usuario atrasó el reloj del sistema para engañar la prueba
                return new EvaluationStatus(
                    IsLicensed: false,
                    IsExpired: true,
                    TimeRemaining: TimeSpan.Zero,
                    FirstRunUtc: anchor.Value,
                    StatusMessage: "El reloj del sistema fue modificado. Periodo de prueba finalizado."
                );
            }

            // Actualizar última actividad
            SaveLastSeen(now);

            // 4. Calcular tiempo transcurrido
            TimeSpan elapsed = now - anchor.Value;

            if (elapsed.TotalHours >= TrialDurationHours)
            {
                return new EvaluationStatus(
                    IsLicensed: false,
                    IsExpired: true,
                    TimeRemaining: TimeSpan.Zero,
                    FirstRunUtc: anchor.Value,
                    StatusMessage: "Periodo de prueba de 24 horas finalizado."
                );
            }

            TimeSpan remaining = TimeSpan.FromHours(TrialDurationHours) - elapsed;
            return new EvaluationStatus(
                IsLicensed: false,
                IsExpired: false,
                TimeRemaining: remaining,
                FirstRunUtc: anchor.Value,
                StatusMessage: $"Prueba activa: quedan {remaining.Hours}h {remaining.Minutes}m"
            );
        }
        catch
        {
            // Fallback seguro: en caso de error de lectura de bajo nivel, permitir uso sin tirar la app
            return new EvaluationStatus(
                IsLicensed: false,
                IsExpired: false,
                TimeRemaining: TimeSpan.FromHours(TrialDurationHours),
                FirstRunUtc: DateTime.UtcNow,
                StatusMessage: "Prueba activa"
            );
        }
    }

    /// <summary>
    /// Desbloquea la suite completa de forma permanente.
    /// </summary>
    public static void ActivateLicense(string licenseKey)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(licenseKey)) return;
            string encrypted = EncryptString("LICENSED_PERPETUAL:" + licenseKey.Trim());

            // Guardar en registro
            using var key = Registry.CurrentUser.CreateSubKey(RegSubKey);
            key?.SetValue(RegValueLicense, encrypted, RegistryValueKind.String);

            // Guardar en disco persistente
            string path = GetLocalTokenPath();
            File.WriteAllText(path, encrypted);
        }
        catch { }
    }

    private static bool HasActiveLicense()
    {
        try
        {
            // Revisar en registro
            using var key = Registry.CurrentUser.OpenSubKey(RegSubKey);
            string? regVal = key?.GetValue(RegValueLicense) as string;
            if (!string.IsNullOrEmpty(regVal))
            {
                string? dec = DecryptString(regVal);
                if (dec != null && dec.StartsWith("LICENSED_PERPETUAL:")) return true;
            }

            // Revisar en archivo local
            string path = GetLocalTokenPath();
            if (File.Exists(path))
            {
                string text = File.ReadAllText(path);
                string? dec = DecryptString(text);
                if (dec != null && dec.StartsWith("LICENSED_PERPETUAL:")) return true;
            }
        }
        catch { }
        return false;
    }

    private static DateTime? GetCrossAnchoredFirstRun()
    {
        DateTime? regDate = null;
        DateTime? fileDate = null;

        // Ancla 1: Registro de Windows (sobrevive a desinstalación y borrado de AppData)
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(RegSubKey);
            string? raw = key?.GetValue(RegValueFirstRun) as string;
            if (!string.IsNullOrEmpty(raw))
            {
                string? dec = DecryptString(raw);
                if (long.TryParse(dec, out long ticks))
                {
                    regDate = new DateTime(ticks, DateTimeKind.Utc);
                }
            }
        }
        catch { }

        // Ancla 2: LocalAppData oculto
        try
        {
            string path = GetLocalTokenAnchorPath();
            if (File.Exists(path))
            {
                string raw = File.ReadAllText(path);
                string? dec = DecryptString(raw);
                if (long.TryParse(dec, out long ticks))
                {
                    fileDate = new DateTime(ticks, DateTimeKind.Utc);
                }
            }
        }
        catch { }

        // Si existe en ambos o en alguno, tomamos la fecha MÁS ANTIGUA para evitar reseteos
        if (regDate.HasValue && fileDate.HasValue)
        {
            return regDate.Value < fileDate.Value ? regDate.Value : fileDate.Value;
        }

        return regDate ?? fileDate;
    }

    private static void SaveCrossAnchoredFirstRun(DateTime timestamp)
    {
        string encrypted = EncryptString(timestamp.Ticks.ToString());

        // Guardar en Registro
        try
        {
            using var key = Registry.CurrentUser.CreateSubKey(RegSubKey);
            key?.SetValue(RegValueFirstRun, encrypted, RegistryValueKind.String);
        }
        catch { }

        // Guardar en archivo oculto LocalAppData
        try
        {
            string path = GetLocalTokenAnchorPath();
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            File.WriteAllText(path, encrypted);
            File.SetAttributes(path, FileAttributes.Hidden | FileAttributes.System);
        }
        catch { }
    }

    private static DateTime? GetLastSeen()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(RegSubKey);
            string? raw = key?.GetValue(RegValueLastSeen) as string;
            if (!string.IsNullOrEmpty(raw))
            {
                string? dec = DecryptString(raw);
                if (long.TryParse(dec, out long ticks))
                {
                    return new DateTime(ticks, DateTimeKind.Utc);
                }
            }
        }
        catch { }
        return null;
    }

    private static void SaveLastSeen(DateTime timestamp)
    {
        try
        {
            string encrypted = EncryptString(timestamp.Ticks.ToString());
            using var key = Registry.CurrentUser.CreateSubKey(RegSubKey);
            key?.SetValue(RegValueLastSeen, encrypted, RegistryValueKind.String);
        }
        catch { }
    }

    private static string GetLocalTokenPath()
    {
        string local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        return Path.Combine(local, "ToolTipAI", "lic.dat");
    }

    private static string GetLocalTokenAnchorPath()
    {
        string local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        return Path.Combine(local, "Microsoft", "WindowsApps", "ttai_anchor.sys");
    }

    private static string EncryptString(string plain)
    {
        try
        {
            byte[] bytes = Encoding.UTF8.GetBytes(plain);
            byte[] enc = ProtectedData.Protect(bytes, Entropy, DataProtectionScope.CurrentUser);
            return Convert.ToBase64String(enc);
        }
        catch { return string.Empty; }
    }

    private static string? DecryptString(string cipher)
    {
        try
        {
            byte[] bytes = Convert.FromBase64String(cipher);
            byte[] dec = ProtectedData.Unprotect(bytes, Entropy, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(dec);
        }
        catch { return null; }
    }
}
