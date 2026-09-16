using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TeachMeAI;

/// <summary>
/// Puente de APIs multi-proveedor para visión multimodal y chat didáctico.
/// Compatible con Gemini, OpenAI, Azure OpenAI, OpenRouter y Claude (Anthropic).
/// </summary>
public static class AiBridge
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(45) };

    public static async Task<InspectionData> AnalyzeImageAsync(
        AiCredentials creds,
        byte[] imageBytes,
        string windowTitle,
        string processName,
        uint pid,
        NativeElementInfo nativeInfo = default)
    {
        if (creds is null || !creds.HasKey || imageBytes is null || imageBytes.Length == 0)
        {
            return GeminiClient.GenerateFallbackData(windowTitle, processName, pid, nativeInfo);
        }

        string prompt = BuildInspectionPrompt(windowTitle, processName, pid, nativeInfo);
        string provider = creds.NormalizedProvider;

        string raw = provider switch
        {
            AiProviderCatalog.Gemini => await GeminiClient.CompleteAsync(
                creds.ApiKey, creds.NormalizedModel, prompt, imageBytes).ConfigureAwait(false),
            AiProviderCatalog.Claude => await CompleteClaudeAsync(
                creds.ApiKey, creds.NormalizedModel, prompt, imageBytes).ConfigureAwait(false),
            _ => await CompleteOpenAiCompatibleAsync(creds, prompt, imageBytes).ConfigureAwait(false)
        };

        return GeminiClient.ParseInspectionJson(raw)
               ?? GeminiClient.GenerateFallbackData(windowTitle, processName, pid, nativeInfo);
    }

    public static async Task<string> AskQuestionAsync(
        AiCredentials creds,
        string question,
        InspectionData context,
        byte[]? imageBytes)
    {
        context ??= new InspectionData();
        if (creds is null || !creds.HasKey)
        {
            return "[Modo Local] Sin proveedor de IA configurado. Abre Ajustes (Ctrl+Shift+C) y elige Gemini, OpenAI, Azure OpenAI, OpenRouter o Claude.";
        }

        string prompt =
            $"Eres ToolTip AI, asesor didáctico de Windows 11.\n" +
            $"Elemento: '{context.Name}' ({context.ProcessName}, PID {context.ProcessId}).\n" +
            $"Resumen: {context.Summary}\n" +
            $"Consejo previsto: {context.ExpertAdvice}\n\n" +
            $"Pregunta del usuario: {question}\n\n" +
            $"Responde en español, conciso y accionable.";

        string provider = creds.NormalizedProvider;
        return provider switch
        {
            AiProviderCatalog.Gemini => await GeminiClient.CompleteAsync(
                creds.ApiKey, creds.NormalizedModel, prompt, imageBytes).ConfigureAwait(false),
            AiProviderCatalog.Claude => await CompleteClaudeAsync(
                creds.ApiKey, creds.NormalizedModel, prompt, imageBytes).ConfigureAwait(false),
            _ => await CompleteOpenAiCompatibleAsync(creds, prompt, imageBytes).ConfigureAwait(false)
        };
    }

    private static string BuildInspectionPrompt(
        string windowTitle,
        string processName,
        uint pid,
        NativeElementInfo nativeInfo)
    {
        var native = new StringBuilder();
        if (nativeInfo.HasNativeData)
        {
            native.AppendLine("METADATOS UI AUTOMATION:");
            if (!string.IsNullOrWhiteSpace(nativeInfo.Name)) native.AppendLine($"- Control: '{nativeInfo.Name}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.ControlType)) native.AppendLine($"- Tipo: '{nativeInfo.ControlType}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.Value)) native.AppendLine($"- Valor: '{nativeInfo.Value}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.HelpText)) native.AppendLine($"- Ayuda: '{nativeInfo.HelpText}'");
            if (!string.IsNullOrWhiteSpace(nativeInfo.AcceleratorKey)) native.AppendLine($"- Atajo: '{nativeInfo.AcceleratorKey}'");
        }
        else
        {
            native.AppendLine("Sin UIA: usa la visión de la imagen para identificar el control.");
        }

        string name = string.IsNullOrWhiteSpace(nativeInfo.Name) ? windowTitle : nativeInfo.Name;
        string controlType = string.IsNullOrWhiteSpace(nativeInfo.ControlType) ? "UIElement" : nativeInfo.ControlType;

        return $@"Eres ToolTip AI. Analiza la captura y responde SOLO con JSON válido:
{{
  ""name"": ""{Escape(name)}"",
  ""controlType"": ""{Escape(controlType)}"",
  ""confidence"": ""alta"",
  ""ocrText"": ""texto legible en la imagen"",
  ""verdictText"": ""veredicto en 1 línea"",
  ""safetyTag"": ""Seguro | Alerta | Precaución | Crítico"",
  ""actionTag"": ""acción recomendada"",
  ""summary"": ""explicación en 2 frases"",
  ""expertAdvice"": ""consejo práctico y accionable"",
  ""nature"": ""qué hace el control"",
  ""impact"": ""impacto si se cambia"",
  ""riskLevel"": ""Bajo | Medio | Alto"",
  ""riskClass"": ""safe | warning | danger"",
  ""consequences"": ""qué pasa al usarlo"",
  ""vendor"": ""fabricante"",
  ""signStatus"": ""binario verificado"",
  ""exePath"": ""C:\\\\...\\\\{processName}.exe"",
  ""resources"": ""consumo"",
  ""accessKey"": ""atajo"",
  ""cliSnippet"": ""# PowerShell""
}}

PROCESO: {processName}.exe (PID {pid})
VENTANA: {windowTitle}
{native}";
    }

    private static string Escape(string s) =>
        (s ?? string.Empty).Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", " ").Replace("\r", " ");

    internal static async Task<string> CompleteOpenAiCompatibleAsync(
        AiCredentials creds,
        string prompt,
        byte[]? imageBytes,
        bool preferJson = true)
    {
        string endpoint;
        if (creds.NormalizedProvider == AiProviderCatalog.AzureOpenAI)
        {
            if (string.IsNullOrWhiteSpace(creds.AzureEndpoint) || string.IsNullOrWhiteSpace(creds.AzureDeployment))
            {
                throw new InvalidOperationException("Azure OpenAI requiere Endpoint y Deployment en Ajustes.");
            }
            string azureRoot = creds.AzureEndpoint.TrimEnd('/');
            if (!azureRoot.Contains("/openai", StringComparison.OrdinalIgnoreCase))
            {
                endpoint = $"{azureRoot}/openai/deployments/{Uri.EscapeDataString(creds.AzureDeployment)}/chat/completions?api-version=2024-06-01";
            }
            else
            {
                endpoint = $"{azureRoot}/deployments/{Uri.EscapeDataString(creds.AzureDeployment)}/chat/completions?api-version=2024-06-01";
            }
        }
        else if (creds.NormalizedProvider == AiProviderCatalog.OpenRouter)
        {
            endpoint = "https://openrouter.ai/api/v1/chat/completions";
        }
        else
        {
            endpoint = "https://api.openai.com/v1/chat/completions";
        }

        using var req = new HttpRequestMessage(HttpMethod.Post, endpoint);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", creds.ApiKey);
        if (creds.NormalizedProvider == AiProviderCatalog.OpenRouter)
        {
            req.Headers.TryAddWithoutValidation("HTTP-Referer", "https://dixi3-lqbs.app");
            req.Headers.TryAddWithoutValidation("X-Title", "ToolTip AI");
        }

        var contentParts = new List<object> { new { type = "text", text = prompt } };
        if (imageBytes is { Length: > 0 })
        {
            string b64 = Convert.ToBase64String(imageBytes);
            contentParts.Add(new
            {
                type = "image_url",
                image_url = new { url = $"data:image/png;base64,{b64}" }
            });
        }

        var body = new
        {
            model = creds.NormalizedModel,
            temperature = 0.2,
            max_tokens = 1200,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "Eres ToolTip AI. Respondes en español con JSON estricto cuando se pida."
                },
                new { role = "user", content = contentParts.ToArray() }
            }
        };

        if (preferJson)
        {
            // Best-effort; algunos modelos no aceptan response_format.
        }

        string json = JsonSerializer.Serialize(body);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        req.Content = content;

        using var resp = await Http.SendAsync(req).ConfigureAwait(false);
        string text = await resp.Content.ReadAsStringAsync().ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"HTTP {(int)resp.StatusCode}: {Truncate(text, 240)}");
        }

        using var doc = JsonDocument.Parse(text);
        var root = doc.RootElement;
        if (!root.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
        {
            throw new InvalidOperationException("Respuesta sin choices.");
        }
        var message = choices[0].GetProperty("message");
        if (!message.TryGetProperty("content", out var contentProp))
        {
            throw new InvalidOperationException("Respuesta sin content.");
        }
        return contentProp.GetString() ?? string.Empty;
    }

    private static async Task<string> CompleteClaudeAsync(
        string apiKey,
        string model,
        string prompt,
        byte[]? imageBytes)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        req.Headers.TryAddWithoutValidation("x-api-key", apiKey);
        req.Headers.TryAddWithoutValidation("anthropic-version", "2023-06-01");

        var blocks = new List<object>
        {
            new { type = "text", text = prompt }
        };
        if (imageBytes is { Length: > 0 })
        {
            string b64 = Convert.ToBase64String(imageBytes);
            blocks.Add(new
            {
                type = "image",
                source = new { type = "base64", media_type = "image/png", data = b64 }
            });
        }

        var body = new
        {
            model,
            max_tokens = 1200,
            temperature = 0.2,
            system = "Eres ToolTip AI. Respondes en español.",
            messages = new object[]
            {
                new { role = "user", content = blocks.ToArray() }
            }
        };

        string json = JsonSerializer.Serialize(body);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        req.Content = content;

        using var resp = await Http.SendAsync(req).ConfigureAwait(false);
        string text = await resp.Content.ReadAsStringAsync().ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"HTTP {(int)resp.StatusCode}: {Truncate(text, 240)}");
        }

        using var doc = JsonDocument.Parse(text);
        var c = doc.RootElement.GetProperty("content");
        var sb = new StringBuilder();
        foreach (var item in c.EnumerateArray())
        {
            if (item.TryGetProperty("type", out var t) &&
                string.Equals(t.GetString(), "text", StringComparison.OrdinalIgnoreCase) &&
                item.TryGetProperty("text", out var tx))
            {
                sb.Append(tx.GetString());
            }
        }
        return sb.ToString();
    }

    private static string Truncate(string s, int max) =>
        string.IsNullOrEmpty(s) || s.Length <= max ? s : s[..max] + "…";
}
