using System.Globalization;
using System.Resources;

namespace TeachMeAI;

/// <summary>UI strings. English is the native product language; follows Windows UI culture when es/de/… is available.</summary>
public static class Loc
{
    private static readonly ResourceManager Rm = new("TeachMeAI.Strings", typeof(Loc).Assembly);

    public static CultureInfo Culture { get; private set; } = CultureInfo.GetCultureInfo("en-US");

    public static void ApplySystemCulture()
    {
        try
        {
            var ui = CultureInfo.CurrentUICulture;
            var name = ui.TwoLetterISOLanguageName;
            Culture = name switch
            {
                "es" => CultureInfo.GetCultureInfo("es-ES"),
                "de" => CultureInfo.GetCultureInfo("de-DE"),
                "fr" => CultureInfo.GetCultureInfo("fr-FR"),
                "pt" => CultureInfo.GetCultureInfo("pt-BR"),
                "ja" => CultureInfo.GetCultureInfo("ja-JP"),
                "zh" => CultureInfo.GetCultureInfo("zh-CN"),
                "th" => CultureInfo.GetCultureInfo("th-TH"),
                _ => CultureInfo.GetCultureInfo("en-US")
            };
        }
        catch
        {
            Culture = CultureInfo.GetCultureInfo("en-US");
        }

        CultureInfo.DefaultThreadCurrentUICulture = Culture;
        CultureInfo.DefaultThreadCurrentCulture = Culture;
    }

    public static string T(string key)
    {
        try
        {
            return Rm.GetString(key, Culture) ?? Rm.GetString(key, CultureInfo.InvariantCulture) ?? key;
        }
        catch
        {
            return key;
        }
    }

    public static string T(string key, params object[] args)
    {
        var fmt = T(key);
        try { return string.Format(Culture, fmt, args); }
        catch { return fmt; }
    }
}
