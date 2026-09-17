using System.Globalization;
using System.Resources;

namespace TeachMeAI;

/// <summary>UI strings. Culture follows Windows UI language (es-ES default product language, en-US fallback).</summary>
public static class Loc
{
    private static readonly ResourceManager Rm = new("TeachMeAI.Strings", typeof(Loc).Assembly);

    public static CultureInfo Culture { get; private set; } = CultureInfo.GetCultureInfo("es-ES");

    public static void ApplySystemCulture()
    {
        try
        {
            var ui = CultureInfo.CurrentUICulture;
            var name = ui.TwoLetterISOLanguageName;
            Culture = name.Equals("es", StringComparison.OrdinalIgnoreCase)
                ? CultureInfo.GetCultureInfo("es-ES")
                : CultureInfo.GetCultureInfo("en-US");
        }
        catch
        {
            Culture = CultureInfo.GetCultureInfo("es-ES");
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
