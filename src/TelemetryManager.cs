using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ToolTipAI;

/// <summary>
/// Motor de telemetría ligero y seguro para Azure Application Insights.
/// Funciona de forma no bloqueante (fire-and-forget), sin dependencias externas
/// y totalmente seguro contra fallos de red.
/// </summary>
public static class TelemetryManager
{
    private const string InstrumentationKey = "680724c1-2840-4ce4-9780-e9ccd5062f9d";
    private const string IngestionEndpoint = "https://mexicocentral-0.in.applicationinsights.azure.com/v2/track";

    private static readonly HttpClient _httpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(3)
    };

    private static readonly string _appVersion = typeof(TelemetryManager).Assembly.GetName().Version?.ToString() ?? "1.1.8.0";
    private static readonly string _osVersion = Environment.OSVersion.VersionString;

    /// <summary>
    /// Registra un evento de telemetría en Application Insights (ej. App_Startup, Snip_Executed, etc.).
    /// </summary>
    public static void TrackEvent(string eventName, Dictionary<string, string>? properties = null, Dictionary<string, double>? metrics = null)
    {
        Task.Run(async () =>
        {
            try
            {
                var props = properties ?? new Dictionary<string, string>();
                props.TryAdd("AppVersion", _appVersion);
                props.TryAdd("OS", _osVersion);
                props.TryAdd("Is64Bit", Environment.Is64BitOperatingSystem ? "true" : "false");

                var payload = new
                {
                    name = "Microsoft.ApplicationInsights.Event",
                    time = DateTime.UtcNow.ToString("o"),
                    iKey = InstrumentationKey,
                    data = new
                    {
                        baseType = "EventData",
                        baseData = new
                        {
                            ver = 2,
                            name = eventName,
                            properties = props,
                            measurements = metrics ?? new Dictionary<string, double>()
                        }
                    }
                };

                string json = JsonSerializer.Serialize(payload);
                using var content = new StringContent(json, Encoding.UTF8, "application/json");
                await _httpClient.PostAsync(IngestionEndpoint, content);
            }
            catch
            {
                // Telemetría nunca debe interrumpir el flujo ni lanzar excepciones no controladas
            }
        });
    }

    /// <summary>
    /// Registra una excepción o error capturado para diagnóstico en Azure.
    /// </summary>
    public static void TrackException(Exception ex, string? context = null)
    {
        Task.Run(async () =>
        {
            try
            {
                var props = new Dictionary<string, string>
                {
                    ["ExceptionType"] = ex.GetType().FullName ?? "Unknown",
                    ["Message"] = ex.Message,
                    ["StackTrace"] = ex.StackTrace?.Substring(0, Math.Min(ex.StackTrace.Length, 1024)) ?? string.Empty,
                    ["Context"] = context ?? "General",
                    ["AppVersion"] = _appVersion
                };

                var payload = new
                {
                    name = "Microsoft.ApplicationInsights.Exception",
                    time = DateTime.UtcNow.ToString("o"),
                    iKey = InstrumentationKey,
                    data = new
                    {
                        baseType = "ExceptionData",
                        baseData = new
                        {
                            ver = 2,
                            exceptions = new[]
                            {
                                new
                                {
                                    typeName = ex.GetType().FullName,
                                    message = ex.Message,
                                    hasFullStack = true,
                                    stack = ex.StackTrace
                                }
                            },
                            properties = props
                        }
                    }
                };

                string json = JsonSerializer.Serialize(payload);
                using var content = new StringContent(json, Encoding.UTF8, "application/json");
                await _httpClient.PostAsync(IngestionEndpoint, content);
            }
            catch
            {
                // Silencioso
            }
        });
    }
}
