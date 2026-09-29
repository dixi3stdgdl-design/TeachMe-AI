using System;
using System.Collections.Generic;

namespace TeachMeAI;

public static class AiProviderCatalog
{
    public const string Gemini = "Gemini";
    public const string OpenAI = "OpenAI";
    public const string AzureOpenAI = "Azure OpenAI";
    public const string OpenRouter = "OpenRouter";
    public const string Claude = "Claude";

    public static IReadOnlyList<string> Providers { get; } = new[]
    {
        Gemini, OpenAI, AzureOpenAI, OpenRouter, Claude
    };

    public static IReadOnlyList<string> GetModels(string provider) => provider switch
    {
        OpenAI => new[] { "gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini" },
        AzureOpenAI => new[] { "gpt-4o", "gpt-4o-mini", "gpt-4.1" },
        OpenRouter => new[]
        {
            "google/gemini-2.0-flash-001",
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "anthropic/claude-3.5-sonnet",
            "anthropic/claude-3.5-haiku"
        },
        Claude => new[]
        {
            "claude-sonnet-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022"
        },
        _ => new[] { "gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro" }
    };

    public static string DefaultModel(string provider) =>
        provider switch
        {
            OpenAI => "gpt-4o",
            AzureOpenAI => "gpt-4o",
            OpenRouter => "google/gemini-2.0-flash-001",
            Claude => "claude-3-5-sonnet-20241022",
            _ => GeminiClient.DefaultModel
        };

    public static string Normalize(string? provider)
    {
        if (string.IsNullOrWhiteSpace(provider)) return Gemini;
        string p = provider.Trim();
        foreach (var known in Providers)
        {
            if (string.Equals(known, p, StringComparison.OrdinalIgnoreCase)) return known;
        }
        if (p.Contains("azure", StringComparison.OrdinalIgnoreCase)) return AzureOpenAI;
        if (p.Contains("openrouter", StringComparison.OrdinalIgnoreCase)) return OpenRouter;
        if (p.Contains("openai", StringComparison.OrdinalIgnoreCase)) return OpenAI;
        if (p.Contains("claude", StringComparison.OrdinalIgnoreCase) || p.Contains("anthropic", StringComparison.OrdinalIgnoreCase)) return Claude;
        if (p.Contains("gemini", StringComparison.OrdinalIgnoreCase) || p.Contains("google", StringComparison.OrdinalIgnoreCase)) return Gemini;
        return Gemini;
    }

    public static string NormalizeModel(string provider, string? model)
    {
        provider = Normalize(provider);
        if (string.IsNullOrWhiteSpace(model)) return DefaultModel(provider);
        string m = model.Trim();

        var catalog = GetModels(provider);
        foreach (var candidate in catalog)
        {
            if (string.Equals(candidate, m, StringComparison.OrdinalIgnoreCase)) return candidate;
        }

        return provider switch
        {
            OpenAI => m.StartsWith("gpt-", StringComparison.OrdinalIgnoreCase) ? m : DefaultModel(OpenAI),
            AzureOpenAI => m.StartsWith("gpt-", StringComparison.OrdinalIgnoreCase) ? m : DefaultModel(AzureOpenAI),
            Claude => m.StartsWith("claude", StringComparison.OrdinalIgnoreCase) ? m : DefaultModel(Claude),
            OpenRouter => m.Contains('/') ? m : DefaultModel(OpenRouter),
            _ => GeminiClient.NormalizeModel(m)
        };
    }

    public static string GetSignUpUrl(string provider) => provider switch
    {
        OpenAI => "https://platform.openai.com/api-keys",
        AzureOpenAI => "https://portal.azure.com/",
        OpenRouter => "https://openrouter.ai/keys",
        Claude => "https://console.anthropic.com/settings/keys",
        _ => "https://aistudio.google.com/app/apikey"
    };
}

public sealed class AiCredentials
{
    public string Provider { get; set; } = AiProviderCatalog.Gemini;
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = AiProviderCatalog.DefaultModel(AiProviderCatalog.Gemini);
    /// <summary>Azure OpenAI endpoint base, p. ej. https://xxx.openai.azure.com</summary>
    public string AzureEndpoint { get; set; } = string.Empty;
    /// <summary>Nombre del deployment en Azure OpenAI.</summary>
    public string AzureDeployment { get; set; } = string.Empty;

    public bool HasKey => !string.IsNullOrWhiteSpace(ApiKey);
    public string NormalizedProvider => AiProviderCatalog.Normalize(Provider);
    public string NormalizedModel => AiProviderCatalog.NormalizeModel(NormalizedProvider, Model);
}
