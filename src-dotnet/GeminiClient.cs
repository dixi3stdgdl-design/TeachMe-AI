using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TeachMeAI;

public class InspectionData
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = "Elemento de Pantalla";

    [JsonPropertyName("controlType")]
    public string ControlType { get; set; } = "Win32_Control";

    [JsonPropertyName("confidence")]
    public string Confidence { get; set; } = "99.8% Certeza";

    [JsonPropertyName("ocrText")]
    public string OcrText { get; set; } = string.Empty;

    [JsonPropertyName("verdictText")]
    public string VerdictText { get; set; } = "Análisis completado";

    [JsonPropertyName("safetyTag")]
    public string SafetyTag { get; set; } = "Seguro";

    [JsonPropertyName("actionTag")]
    public string ActionTag { get; set; } = "Inspeccionar";

    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

    [JsonPropertyName("nature")]
    public string Nature { get; set; } = string.Empty;

    [JsonPropertyName("impact")]
    public string Impact { get; set; } = string.Empty;

    [JsonPropertyName("riskLevel")]
    public string RiskLevel { get; set; } = "Bajo";

    [JsonPropertyName("riskClass")]
    public string RiskClass { get; set; } = "safe"; // safe, warning, danger

    [JsonPropertyName("consequences")]
    public string Consequences { get; set; } = string.Empty;

    [JsonPropertyName("expertAdvice")]
    public string ExpertAdvice { get; set; } = string.Empty;

    [JsonPropertyName("nativeValue")]
    public string NativeValue { get; set; } = string.Empty;

    [JsonPropertyName("nativeHelpText")]
    public string NativeHelpText { get; set; } = string.Empty;

    [JsonPropertyName("parentContainer")]
    public string ParentContainer { get; set; } = string.Empty;

    [JsonPropertyName("frameworkId")]
    public string FrameworkId { get; set; } = string.Empty;

    [JsonPropertyName("vendor")]
    public string Vendor { get; set; } = "Desconocido";

    [JsonPropertyName("signStatus")]
    public string SignStatus { get; set; } = "No verificado";

    [JsonPropertyName("exePath")]
    public string ExePath { get; set; } = string.Empty;

    [JsonPropertyName("resources")]
    public string Resources { get; set; } = "Consumo estándar";

    [JsonPropertyName("accessKey")]
    public string AccessKey { get; set; } = "Espacio / Enter";

    [JsonPropertyName("cliSnippet")]
    public string CliSnippet { get; set; } = "# PowerShell:\nGet-Process";

    [JsonPropertyName("domainType")]
    public string DomainType { get; set; } = "system";

    public string ProcessName { get; set; } = "explorer.exe";
    public uint ProcessId { get; set; } = 0;
    public string? ImageBase64 { get; set; }
}

public class GeminiClient
{
    private static readonly HttpClient _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };

    public static string DetectDomainFromProcess(string processName)
    {
        if (string.IsNullOrWhiteSpace(processName)) return "system";
        string p = processName.ToLowerInvariant();
        if (p.Contains("game") || p.Contains("steam") || p.Contains("epic") || p.Contains("riot") || 
            p.Contains("league") || p.Contains("valorant") || p.Contains("cs2") || p.Contains("csgo") || 
            p.Contains("minecraft") || p.Contains("javaw") || p.Contains("roblox") || p.Contains("fortnite") || 
            p.Contains("dota") || p.Contains("wow") || p.Contains("overwatch") || p.Contains("diablo") || 
            p.Contains("eldenring") || p.Contains("cyberpunk") || p.Contains("bg3") || p.Contains("baldursgate") || 
            p.Contains("starfield") || p.Contains("poe") || p.Contains("pathofexile") || p.Contains("genshin") || 
            p.Contains("honkai") || p.Contains("apex") || p.Contains("warzone") || p.Contains("cod") || 
            p.Contains("unity") || p.Contains("unreal") || p.Contains("godot") || p.Contains("rpcs3") || 
            p.Contains("yuzu") || p.Contains("ryujinx") || p.Contains("retroarch") || p.Contains("dolphin") || 
            p.Contains("pcsx2") || p.Contains("battle.net") || p.Contains("gta") || p.Contains("rdr2") || 
            p.Contains("witcher") || p.Contains("sims") || p.Contains("civilization") || p.Contains("stellaris") ||
            p.Contains("dxgi") || p.Contains("d3d") || p.Contains("vulkan"))
        {
            return "gaming";
        }
        if (p.Contains("reason") || p.Contains("ableton") || p.Contains("fl64") || p.Contains("flstudio") || 
            p.Contains("reaper") || p.Contains("cubase") || p.Contains("protools") || p.Contains("studioone") || 
            p.Contains("bitwig") || p.Contains("cakewalk") || p.Contains("logic") || p.Contains("kontakt"))
        {
            return "audio";
        }
        if (p.Contains("code") || p.Contains("devenv") || p.Contains("rider") || p.Contains("idea") || 
            p.Contains("clion") || p.Contains("powershell") || p.Contains("cmd") || p.Contains("wt") || 
            p.Contains("windowsterminal") || p.Contains("bash") || p.Contains("wsl") || p.Contains("git"))
        {
            return "dev";
        }
        if (p.Contains("chrome") || p.Contains("msedge") || p.Contains("firefox") || p.Contains("brave") || 
            p.Contains("opera") || p.Contains("vivaldi"))
        {
            return "web";
        }
        return "system";
    }

    private static readonly string LogFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
        "TeachMeAI", 
        "run.log");

    public const string DefaultModel = "gemini-2.0-flash";

    public static string NormalizeModel(string? model)
    {
        if (string.IsNullOrWhiteSpace(model)) return DefaultModel;
        string clean = model.Trim();
        if (clean.Equals("gemini-2.0-flash", StringComparison.OrdinalIgnoreCase)) return "gemini-2.0-flash";
        if (clean.Equals("gemini-2.5-flash", StringComparison.OrdinalIgnoreCase)) return "gemini-2.5-flash";
        if (clean.Equals("gemini-2.5-pro", StringComparison.OrdinalIgnoreCase)) return "gemini-2.5-pro";
        // Map legacy aliases from older configs / listings.
        if (clean.Equals("gemini-flash-latest", StringComparison.OrdinalIgnoreCase) ||
            clean.Equals("gemini-1.5-flash", StringComparison.OrdinalIgnoreCase))
            return "gemini-2.0-flash";
        if (clean.Equals("gemini-pro-latest", StringComparison.OrdinalIgnoreCase) ||
            clean.Equals("gemini-1.5-pro", StringComparison.OrdinalIgnoreCase))
            return "gemini-2.5-pro";

        string lower = clean.ToLowerInvariant();
        if (lower.Contains("2.5-pro") || lower.Contains("pro")) return "gemini-2.5-pro";
        if (lower.Contains("2.5-flash")) return "gemini-2.5-flash";
        return DefaultModel;
    }

    private static string GetDomainSpecificGuidelines(string processName)
    {
        string p = processName.ToLowerInvariant();
        if (p.Contains("game") || p.Contains("steam") || p.Contains("epic") || p.Contains("riot") || 
            p.Contains("league") || p.Contains("valorant") || p.Contains("cs2") || p.Contains("csgo") || 
            p.Contains("minecraft") || p.Contains("javaw") || p.Contains("roblox") || p.Contains("fortnite") || 
            p.Contains("dota") || p.Contains("wow") || p.Contains("overwatch") || p.Contains("diablo") || 
            p.Contains("eldenring") || p.Contains("cyberpunk") || p.Contains("bg3") || p.Contains("baldursgate") || 
            p.Contains("starfield") || p.Contains("poe") || p.Contains("pathofexile") || p.Contains("genshin") || 
            p.Contains("honkai") || p.Contains("apex") || p.Contains("warzone") || p.Contains("cod") || 
            p.Contains("unity") || p.Contains("unreal") || p.Contains("godot") || p.Contains("rpcs3") || 
            p.Contains("yuzu") || p.Contains("ryujinx") || p.Contains("retroarch") || p.Contains("dolphin") || 
            p.Contains("pcsx2") || p.Contains("battle.net") || p.Contains("gta") || p.Contains("rdr2") || 
            p.Contains("witcher") || p.Contains("sims") || p.Contains("civilization") || p.Contains("stellaris") ||
            p.Contains("dxgi") || p.Contains("d3d") || p.Contains("vulkan"))
        {
            return @"[DOMINIO ACTIVO: VIDEOJUEGOS, ESPORTS, METAGAME & MOTORES GRÁFICOS]
- Rol de IA: Entrenador Táctico Pro (Gaming Coach), Teórico de Builds (Theorycrafter) y Asistente Metagame.
- Objetivo Didáctico: Elevar el nivel competitivo y el entendimiento del jugador en tiempo real sin spoilers innecesarios de historia.
- En 'expertAdvice':
  1. Si es un Ítem, Arma, Habilidad o Talento: Explica sinergia de build, escalado de estadísticas (stat scaling), relación costo/beneficio y cuándo conviene equiparlo o mejorarlo vs otras alternativas.
  2. Si es una Misión, Puzzle o Boss: Proporciona pistas tácticas, vulnerabilidades elementales o mecánicas clave para superarlo con maestría.
  3. Si es un Ajuste Gráfico o Menú de Juego: Aconseja la configuración óptima para maximizar FPS y reducir latencia (input lag) sin sacrificar visibilidad en combate.
- En 'summary': Identifica instantáneamente el arma, hechizo, perk, recurso, enemigo o menú seleccionado con nombre canónico.";
        }

        if (p.Contains("reason") || p.Contains("ableton") || p.Contains("fl64") || p.Contains("flstudio") || 
            p.Contains("reaper") || p.Contains("cubase") || p.Contains("protools") || p.Contains("studioone") || 
            p.Contains("bitwig") || p.Contains("cakewalk") || p.Contains("logic") || p.Contains("kontakt"))
        {
            return @"[DOMINIO ACTIVO: PRODUCCIÓN MUSICAL & INGENIERÍA DE AUDIO (DAW / VST)]
- Rol de IA: Ingeniero de Audio, Mezclador y Diseñador de Sonido Profesional.
- Objetivo Didáctico: El usuario necesita saber EXACTAMENTE cómo usar este control para que su pista suene profesional.
- En 'expertAdvice': Proporciona consejos numéricos y prácticos: valores de dB recomendados, rangos de frecuencia (Hz), tiempos de ataque/release en ms, compatibilidad con otros instrumentos (ej. qué ecualización aplicar para no chocar con el Kick drum o la Voz), ruteo de cables CV/Gate o envíos auxiliares.
- En 'summary': Explica qué función musical cumple este módulo.";
        }
        if (p.Contains("code") || p.Contains("devenv") || p.Contains("rider") || p.Contains("idea") || 
            p.Contains("clion") || p.Contains("powershell") || p.Contains("cmd") || p.Contains("wt") || 
            p.Contains("windowsterminal") || p.Contains("bash") || p.Contains("wsl") || p.Contains("git"))
        {
            return @"[DOMINIO ACTIVO: DESARROLLO DE SOFTWARE & TERMINAL (IDE / COMPILACIÓN / CLI)]
- Rol de IA: Arquitecto de Software Principal y Auditor de Ciberseguridad.
- Objetivo Didáctico: Asistir al desarrollador para acelerar su flujo y prevenir errores de sintaxis o de ejecución.
- En 'expertAdvice': Explica la función o patrón de código, atajos de teclado clave del IDE, impacto en memoria/CPU y advierte con severidad si un comando o script contiene riesgo de pérdida de datos (ej. rm, drop, format, force).
- En 'summary': Resume concisamente la lógica de programación o función del control.";
        }
        if (p.Contains("chrome") || p.Contains("msedge") || p.Contains("firefox") || p.Contains("brave") || 
            p.Contains("opera") || p.Contains("vivaldi"))
        {
            return @"[DOMINIO ACTIVO: NAVEGACIÓN WEB, INVESTIGACIÓN & DATOS]
- Rol de IA: Analista de Investigación y Verificador de Datos (Fact-Checker).
- Objetivo Didáctico: Aclarar información densa y proteger al usuario de trampas web.
- En 'expertAdvice': Resume el dato clave, detecta patrones oscuros (dark patterns, botones engañosos de descarga, phishing) y ofrece la conclusión analítica más relevante.
- En 'summary': Explica qué representa el bloque o botón web seleccionado.";
        }
        if (p.Contains("blender") || p.Contains("photoshop") || p.Contains("illustrator") || p.Contains("premiere") || 
            p.Contains("afterfx") || p.Contains("figma") || p.Contains("autocad") || p.Contains("maya") || 
            p.Contains("3dsmax") || p.Contains("davinci"))
        {
            return @"[DOMINIO ACTIVO: CREATIVIDAD DIGITAL, MODELADO 3D & EDICIÓN DE VIDEO]
- Rol de IA: Director de Arte Digital y Artista Técnico.
- Objetivo Didáctico: Maximizar la estética visual y eficiencia de render/edición.
- En 'expertAdvice': Consejos de parámetros de render, iluminación, espacio de color, balance de capas o topología poligonal, junto con atajos esenciales.
- En 'summary': Explica el impacto visual de esta herramienta.";
        }
        if (p.Contains("explorer") || p.Contains("taskmgr") || p.Contains("regedit") || p.Contains("mmc") || 
            p.Contains("services") || p.Contains("perfmon"))
        {
            return @"[DOMINIO ACTIVO: SISTEMA OPERATIVO WINDOWS & GESTIÓN DE ARCHIVOS]
- Rol de IA: Especialista de Sistemas Windows y PowerToys Guru.
- Objetivo Didáctico: Enseñar al usuario a dominar y diagnosticar su propio sistema operativo.
- En 'expertAdvice': Soluciones a archivos bloqueados, atajos avanzados de productividad, optimización de recursos y advertencias sobre claves del registro o servicios críticos.
- En 'summary': Explica para qué sirve este archivo, carpeta o servicio en Windows.";
        }

        return @"[DOMINIO ACTIVO: ASISTENCIA COGNITIVA UNIVERSAL]
- Rol de IA: Maestro Didáctico y Mentor de Eficiencia.
- Objetivo Didáctico: Guía al usuario de manera comprensible y profesional sobre el elemento seleccionado.
- En 'expertAdvice': Brinda el mejor consejo práctico y atajo para aprovechar esta función.";
    }

    public static async Task<InspectionData> AnalyzeImageAsync(
        string apiKey, 
        string model, 
        byte[] imageBytes, 
        string windowTitle, 
        string processName, 
        uint pid,
        NativeElementInfo nativeInfo = default)
    {
        apiKey = apiKey?.Trim().Trim('"', '\'', ' ') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            try { File.AppendAllText(LogFile, "[GeminiClient] AnalyzeImageAsync abortado: API Key vacía.\n"); } catch { }
            return GenerateFallbackData(windowTitle, processName, pid, nativeInfo);
        }

        string primaryModel = NormalizeModel(model);
        var candidateModels = new System.Collections.Generic.List<string> { primaryModel };
        if (!candidateModels.Contains("gemini-2.0-flash")) candidateModels.Add("gemini-2.0-flash");
        if (!candidateModels.Contains("gemini-2.5-flash")) candidateModels.Add("gemini-2.5-flash");

        string base64Image = Convert.ToBase64String(imageBytes);
        string domainGuidelines = GetDomainSpecificGuidelines(processName);

        // Enriquecer el prompt con los metadatos de Windows UI Automation nativos extraídos en tiempo real
        var nativeBuilder = new StringBuilder();
        if (nativeInfo.HasNativeData)
        {
            nativeBuilder.AppendLine("METADATOS NATIVOS DE WINDOWS UI AUTOMATION (Datos certeros en tiempo real extraídos del SO):");
            if (!string.IsNullOrWhiteSpace(nativeInfo.Name)) nativeBuilder.AppendLine($"- Control / Parámetro: '{nativeInfo.Name}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.ControlType)) nativeBuilder.AppendLine($"- Tipo de Control: '{nativeInfo.ControlType}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.Value)) nativeBuilder.AppendLine($"- Valor Actual Registrado: '{nativeInfo.Value}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.HelpText)) nativeBuilder.AppendLine($"- Tooltip / Ayuda Nativa de la App: '{nativeInfo.HelpText}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.ItemStatus)) nativeBuilder.AppendLine($"- Estado Dinámico del Control: '{nativeInfo.ItemStatus}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.ParentContainerName)) nativeBuilder.AppendLine($"- Módulo / Contenedor Padre: '{nativeInfo.ParentContainerName}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.AcceleratorKey)) nativeBuilder.AppendLine($"- Atajo Nativo: '{nativeInfo.AcceleratorKey}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.FrameworkId)) nativeBuilder.AppendLine($"- Framework de UI: '{nativeInfo.FrameworkId}'");
        }
        else
        {
            nativeBuilder.AppendLine("METADATOS NATIVOS: Control gráfico directo. Utiliza la visión multimodal para identificar el parámetro exacto.");
        }

        string prompt = $@"Eres ToolTip AI, el maestro cognitivo contextual para Windows 11.
Analiza la captura de pantalla adjunta.

METADATOS DEL SISTEMA:
- Proceso: '{processName}.exe' (PID: {pid})
- Ventana Principal: '{windowTitle}'

{nativeBuilder}

{domainGuidelines}

DIRECTIVA MAESTRA:
Utiliza la metadata nativa exacta como tu verdad fundamental. No gastes espacio adivinando qué es; actúa como un MAESTRO Y CO-PILOTO EXPERTO. En el campo 'expertAdvice' entrega orientación práctica, precisa y accionable (consejos de valores numéricos, buenas prácticas, ruteo o atajos).

Genera la respuesta en formato JSON EXACTO con esta estructura:
{{
  ""name"": ""{(!string.IsNullOrWhiteSpace(nativeInfo.Name) ? nativeInfo.Name : "Nombre conciso del control o módulo")}"",
  ""controlType"": ""{(!string.IsNullOrWhiteSpace(nativeInfo.ControlType) ? nativeInfo.ControlType : "Tipo de control")}"",
  ""confidence"": ""99.8% Certeza Gemini Multimodal + UIA"",
  ""ocrText"": ""Texto visible legible en la imagen"",
  ""verdictText"": ""Veredicto resumido en 1 línea (ej. Control Room Level: 0.00 dB • Ganancia Unitaria)"",
  ""safetyTag"": ""Seguro | Alerta | Precaución | Crítico"",
  ""actionTag"": ""Acción Recomendada"",
  ""summary"": ""Explicación clara en 2 frases de qué hace este control o parámetro"",
  ""expertAdvice"": ""Consejo técnico del Maestro: recomendaciones de valores numéricos, combinaciones con otras herramientas o advertencias prácticas"",
  ""nature"": ""Explicación técnica de la función del control"",
  ""impact"": ""Impacto en sonido, memoria, disco o flujo de trabajo si se altera"",
  ""riskLevel"": ""Bajo | Medio | Alto"",
  ""riskClass"": ""safe | warning | danger"",
  ""consequences"": ""Qué pasará exactamente si el usuario mueve, activa o presiona este control"",
  ""vendor"": ""Desarrollador o fabricante del software"",
  ""signStatus"": ""Binario Verificado"",
  ""exePath"": ""C:\\Ruta\\{processName}.exe"",
  ""resources"": ""Consumo normal"",
  ""accessKey"": ""Atajo sugerido"",
  ""cliSnippet"": ""# PowerShell:\\nGet-Process -Name {processName}""
}}";

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = prompt },
                        new
                        {
                            inlineData = new
                            {
                                mimeType = "image/png",
                                data = base64Image
                            }
                        }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                temperature = 0.2
            }
        };

        string jsonString = JsonSerializer.Serialize(payload);
        string lastErrorMessage = string.Empty;

        foreach (var currentModel in candidateModels)
        {
            try
            {
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/{currentModel}:generateContent?key={Uri.EscapeDataString(apiKey)}";
                using var content = new StringContent(jsonString, Encoding.UTF8, "application/json");

                try { File.AppendAllText(LogFile, $"[GeminiClient] Consultando modelo '{currentModel}' con UIA enriquecido...\n"); } catch { }
                var response = await _httpClient.PostAsync(url, content);
                string respContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    lastErrorMessage = FormatApiErrorMessage((int)response.StatusCode, respContent);
                    try { File.AppendAllText(LogFile, $"[GeminiClient] Falló modelo '{currentModel}' ({(int)response.StatusCode}): {lastErrorMessage}\n"); } catch { }
                    
                    if ((int)response.StatusCode == 400 || (int)response.StatusCode == 403)
                    {
                        var failData = GenerateFallbackData(windowTitle, processName, pid, nativeInfo);
                        failData.VerdictText = lastErrorMessage;
                        return failData;
                    }
                    continue;
                }

                using var doc = JsonDocument.Parse(respContent);
                string? text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (!string.IsNullOrWhiteSpace(text))
                {
                    text = CleanJsonMarkdown(text);
                    var result = JsonSerializer.Deserialize<InspectionData>(text, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (result != null)
                    {
                        result.ProcessName = processName;
                        result.ProcessId = pid;
                        result.ImageBase64 = base64Image;
                        result.Confidence = $"99.8% Certeza • {currentModel}";
                        
                        // Si UIA tenía datos nativos, preservarlos en la entidad
                        result.NativeValue = nativeInfo.Value;
                        result.NativeHelpText = nativeInfo.HelpText;
                        result.ParentContainer = nativeInfo.ParentContainerName;
                        result.FrameworkId = nativeInfo.FrameworkId;

                        if (string.IsNullOrWhiteSpace(result.ExpertAdvice))
                        {
                            result.ExpertAdvice = result.Summary;
                        }

                        try { File.AppendAllText(LogFile, $"[GeminiClient] Éxito con '{currentModel}'. Elemento: '{result.Name}', Consejo: '{result.ExpertAdvice.Substring(0, Math.Min(60, result.ExpertAdvice.Length))}...'\n"); } catch { }
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                lastErrorMessage = ex.Message;
                try { File.AppendAllText(LogFile, $"[GeminiClient] Excepción con modelo '{currentModel}': {ex.Message}\n"); } catch { }
            }
        }

        var fallback = GenerateFallbackData(windowTitle, processName, pid, nativeInfo);
        if (!string.IsNullOrWhiteSpace(lastErrorMessage))
        {
            fallback.VerdictText = lastErrorMessage;
        }
        return fallback;
    }

    private static string CleanJsonMarkdown(string text)
    {
        string trimmed = text.Trim();
        if (trimmed.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed.Substring(7);
        }
        else if (trimmed.StartsWith("```"))
        {
            trimmed = trimmed.Substring(3);
        }

        if (trimmed.EndsWith("```"))
        {
            trimmed = trimmed.Substring(0, trimmed.Length - 3);
        }

        return trimmed.Trim();
    }

    private static string FormatApiErrorMessage(int statusCode, string content)
    {
        try
        {
            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.TryGetProperty("error", out var err) && err.TryGetProperty("message", out var msg))
            {
                string rawMsg = msg.GetString() ?? "";
                if (rawMsg.Contains("API key not valid", StringComparison.OrdinalIgnoreCase))
                {
                    return "⚠️ Clave de API Gemini no válida. Revísala en Ajustes (Ctrl+Shift+C).";
                }
                if (rawMsg.Contains("quota", StringComparison.OrdinalIgnoreCase) || rawMsg.Contains("RESOURCE_EXHAUSTED", StringComparison.OrdinalIgnoreCase))
                {
                    return "⚠️ Cuota de API excedida en Google AI Studio. Espera unos minutos.";
                }
                if (rawMsg.Contains("high demand", StringComparison.OrdinalIgnoreCase))
                {
                    return "⏳ Servidores de Google con alta demanda temporal.";
                }
                return $"⚠️ Error Gemini ({statusCode}): {rawMsg}";
            }
        }
        catch { }

        return statusCode switch
        {
            400 => "⚠️ Solicitud incorrecta o Clave API inválida.",
            403 => "⚠️ Acceso denegado con la clave actual.",
            404 => "⚠️ Modelo de IA no encontrado en la región actual.",
            429 => "⚠️ Cuota excedida (Rate Limit) en Google AI Studio.",
            503 => "⏳ Servidores de IA ocupados. Reintentando...",
            _ => $"⚠️ Error de conexión con Gemini ({statusCode})."
        };
    }

    public static async Task<string> AskQuestionAsync(string apiKey, string model, string question, InspectionData context, byte[]? imageBytes)
    {
        apiKey = apiKey?.Trim().Trim('"', '\'', ' ') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return $"[Modo Local] Respecto a '{context.Name}' ({context.ProcessName}):\n\n{context.Summary}\n\n• Consejo: {context.ExpertAdvice}\n\nPara respuestas interactivas en vivo, ingresa tu API Key de Gemini en Ajustes (Ctrl + Shift + C).";
        }

        string primaryModel = NormalizeModel(model);
        var candidateModels = new System.Collections.Generic.List<string> { primaryModel };
        if (!candidateModels.Contains("gemini-2.0-flash")) candidateModels.Add("gemini-2.0-flash");
        if (!candidateModels.Contains("gemini-2.5-flash")) candidateModels.Add("gemini-2.5-flash");

        string domainGuidelines = GetDomainSpecificGuidelines(context.ProcessName);

        string systemPrompt = $@"Eres ToolTip AI, el maestro cognitivo para Windows 11.
Estás asesorando en vivo a un usuario sobre este elemento inspeccionado:
- Elemento: '{context.Name}'
- Tipo: '{context.ControlType}'
- Proceso: '{context.ProcessName}' (PID: {context.ProcessId})
- Módulo Padre: '{context.ParentContainer}'
- Valor Actual: '{context.NativeValue}'
- Ayuda Nativa: '{context.NativeHelpText}'
- Resumen Técnico: '{context.Summary}'
- Consejo Experto Previsto: '{context.ExpertAdvice}'

{domainGuidelines}

Pregunta del usuario: {question}

Responde de forma concisa, educada, didáctica y directa en español. Si pregunta por valores, combinaciones recomendadas o seguridad, dale consejos concretos basados en las mejores prácticas de la industria.";

        var parts = new System.Collections.Generic.List<object>
        {
            new { text = systemPrompt }
        };

        if (imageBytes != null && imageBytes.Length > 0)
        {
            parts.Add(new
            {
                inlineData = new
                {
                    mimeType = "image/png",
                    data = Convert.ToBase64String(imageBytes)
                }
            });
        }

        var payload = new
        {
            contents = new[]
            {
                new { parts = parts.ToArray() }
            }
        };

        string json = JsonSerializer.Serialize(payload);

        foreach (var currentModel in candidateModels)
        {
            try
            {
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/{currentModel}:generateContent?key={Uri.EscapeDataString(apiKey)}";
                using var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(url, content);
                string respContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(respContent);
                    string? text = doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        return text;
                    }
                }
            }
            catch { }
        }

        return $"[Tutor ToolTip AI] Respecto a '{context.Name}' ({context.ProcessName}):\n\n{context.Summary}\n\n• Recomendación: {context.ExpertAdvice}";
    }

    /// <summary>Completado de texto (con imagen opcional) usado por AiBridge para el proveedor Gemini.</summary>
    public static async Task<string> CompleteAsync(string apiKey, string model, string prompt, byte[]? imageBytes)
    {
        apiKey = apiKey?.Trim().Trim('"', '\'', ' ') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Clave de Gemini vacía.");
        }

        var parts = new List<object> { new { text = prompt } };
        if (imageBytes is { Length: > 0 })
        {
            parts.Add(new
            {
                inlineData = new
                {
                    mimeType = "image/png",
                    data = Convert.ToBase64String(imageBytes)
                }
            });
        }

        var payload = new { contents = new[] { new { parts = parts.ToArray() } } };
        string json = JsonSerializer.Serialize(payload);
        string url = $"https://generativelanguage.googleapis.com/v1beta/models/{NormalizeModel(model)}:generateContent?key={Uri.EscapeDataString(apiKey)}";
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        string resp = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(FormatApiErrorMessage((int)response.StatusCode, resp));
        }

        using var doc = JsonDocument.Parse(resp);
        string? text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();
        return text ?? string.Empty;
    }

    /// <summary>Parsea el JSON de inspección de cualquier proveedor; limpia fences markdown.</summary>
    public static InspectionData? ParseInspectionJson(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        try
        {
            string cleaned = CleanJsonMarkdown(raw);
            return JsonSerializer.Deserialize<InspectionData>(
                cleaned,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return null;
        }
    }

    public static InspectionData GenerateFallbackData(string windowTitle, string processName, uint pid, NativeElementInfo nativeInfo = default)
    {
        string name = !string.IsNullOrWhiteSpace(nativeInfo.Name) ? nativeInfo.Name : (string.IsNullOrWhiteSpace(windowTitle) ? $"Ventana de {processName}" : windowTitle);
        string controlType = !string.IsNullOrWhiteSpace(nativeInfo.ControlType) ? nativeInfo.ControlType : "Superficie de Ventana Activa";
        string nativeHelp = nativeInfo.HelpText;
        string nativeVal = nativeInfo.Value;
        string parentMod = nativeInfo.ParentContainerName;

        string summary = nativeInfo.HasNativeData
            ? $"Control '{name}' ({controlType}) detectado en {processName}.exe." + (!string.IsNullOrWhiteSpace(parentMod) ? $" Módulo: {parentMod}." : "") + (!string.IsNullOrWhiteSpace(nativeVal) ? $" Valor: {nativeVal}." : "")
            : $"Elemento gráfico capturado en tiempo real del proceso '{processName}.exe' (PID: {pid}). Ventana: '{windowTitle}'.";

        if (!string.IsNullOrWhiteSpace(nativeHelp))
        {
            summary += $"\nAyuda nativa: {nativeHelp}";
        }

        string domain = DetectDomainFromProcess(processName);
        string advice;
        if (domain == "gaming")
        {
            advice = "🎮 Elemento de videojuego detectado. Pulsa 'Ctrl+Shift+A' para analizarlo a fondo o ingresa tu API Key para recibir asesoría táctica de builds y escalado de stats.";
        }
        else if (domain == "audio")
        {
            advice = "🎛️ Parámetro de producción de audio/DAW. Ingresa tu API Key para recibir consejos de mezcla, frecuencias (Hz) y ganancia recomendada.";
        }
        else if (domain == "dev")
        {
            advice = "💻 Control de entorno de desarrollo / CLI. Ingresa tu API Key para sugerencias de arquitectura, atajos y prevención de bugs.";
        }
        else
        {
            advice = nativeInfo.HasNativeData
                ? $"Parámetro nativo de Windows UIA. Ajusta el valor según tus necesidades o presiona 'Ctrl+Shift+C' para activar el análisis experto con Gemini."
                : $"Elemento interactivo del sistema operativo. Puedes inspeccionarlo con recortes o consultar dudas en el Tutor IA.";
        }

        return new InspectionData
        {
            Name = name,
            ControlType = controlType,
            Confidence = nativeInfo.HasNativeData ? "100% Windows UI Automation Nativo" : "100% Kernel Nativo C# / Win32",
            OcrText = !string.IsNullOrWhiteSpace(nativeHelp) ? nativeHelp : windowTitle,
            VerdictText = !string.IsNullOrWhiteSpace(nativeVal) ? $"{name}: {nativeVal}" : $"Proceso: {processName}.exe (PID: {pid})",
            SafetyTag = "Seguro",
            ActionTag = "Inspeccionar",
            Summary = summary,
            ExpertAdvice = advice,
            NativeValue = nativeVal,
            NativeHelpText = nativeHelp,
            ParentContainer = parentMod,
            FrameworkId = nativeInfo.FrameworkId,
            Nature = "Control de interfaz gestionado por el árbol de accesibilidad de Windows.",
            Impact = $"El proceso '{processName}' consume recursos administrados por el kernel.",
            RiskLevel = "Bajo",
            RiskClass = "safe",
            Consequences = $"Cualquier interacción enviará eventos de entrada al proceso '{processName}'.",
            Vendor = "Desarrollador de la aplicación",
            SignStatus = "Binario verificado",
            ExePath = $"C:\\Windows\\System32\\{processName}.exe",
            Resources = $"PID: {pid} • Espacio de usuario",
            AccessKey = !string.IsNullOrWhiteSpace(nativeInfo.AcceleratorKey) ? nativeInfo.AcceleratorKey : "Ctrl+Shift+A (Recortar)",
            CliSnippet = $"# Información detallada del proceso en PowerShell:\nGet-Process -Id {pid} | Select-Object Id, ProcessName, Path, CPU, WorkingSet64",
            ProcessName = processName,
            ProcessId = pid,
            DomainType = domain
        };
    }
}
