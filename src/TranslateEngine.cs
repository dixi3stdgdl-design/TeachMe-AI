using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage.Streams;

namespace ToolTipAI;

/// <summary>
/// Reporte estructurado de traducción contextual obtenido por OCR nativo Direct3D/WinRT
/// </summary>
public record TranslationResult(
    string OriginalText,
    string TranslatedText,
    string? Phonetic,
    string? Etymology,
    string SourceLanguage,
    string TargetLanguage,
    double LatencyMs,
    Rectangle ScreenBounds
);

public record HistoryItem(
    string Original,
    string Translated,
    string SourceLang,
    string TargetLang,
    string TimeString,
    double LatencyMs
);

/// <summary>
/// Motor de Traducción Visual de Pantalla en Tiempo Real de ToolTip AI.
/// Utiliza Windows.Media.Ocr acelerado por hardware para extraer glifos de cualquier
/// videojuego, PDF protegido o software extranjero sin inyectar DLLs ni activar anti-cheats.
/// </summary>
public class TranslateEngine
{
    private static readonly Lazy<TranslateEngine> _instance = new(() => new TranslateEngine());
    public static TranslateEngine Instance => _instance.Value;

    public static System.Collections.ObjectModel.ObservableCollection<HistoryItem> TranslationHistory { get; } = new();
    public int TotalTranslationsCount { get; private set; } = 0;
    public double AverageLatencyMs { get; private set; } = 12.0;
    private double _latencySum = 0;

    public string CurrentTargetLanguage { get; set; } = "es";
    public string CurrentSourceLanguage { get; set; } = "auto";

    public void RecordHistory(TranslationResult result)
    {
        if (result == null || string.IsNullOrWhiteSpace(result.TranslatedText)) return;

        System.Windows.Application.Current?.Dispatcher?.Invoke(() =>
        {
            TotalTranslationsCount++;
            _latencySum += result.LatencyMs;
            AverageLatencyMs = Math.Round(_latencySum / TotalTranslationsCount, 1);

            TranslationHistory.Insert(0, new HistoryItem(
                result.OriginalText,
                result.TranslatedText,
                (result.SourceLanguage ?? "AUTO").ToUpperInvariant(),
                (result.TargetLanguage ?? "ES").ToUpperInvariant(),
                DateTime.Now.ToString("HH:mm:ss"),
                result.LatencyMs
            ));

            while (TranslationHistory.Count > 60)
            {
                TranslationHistory.RemoveAt(TranslationHistory.Count - 1);
            }
        });
    }

    private readonly ConcurrentDictionary<string, TranslationResult> _cache = new();
    private OcrEngine? _primaryOcrEngine;
    private readonly List<OcrEngine> _allOcrEngines = new();
    private readonly HttpClient _httpClient = new() { Timeout = TimeSpan.FromSeconds(3) };

    // Diccionario de traducción pura directa (< 1ms)
    private static readonly Dictionary<string, (string Tr, string Lang)> LocalDictionary = new(StringComparer.OrdinalIgnoreCase)
    {
        // Gaming / RPG en Japonés
        ["魔女"] = ("Bruja", "ja"),
        ["運命"] = ("Destino", "ja"),
        ["暗き月"] = ("Luna Sombría", "ja"),
        ["大剣"] = ("Gran Espadón", "ja"),
        ["記憶"] = ("Recuerdo", "ja"),
        ["祝福"] = ("Gracia", "ja"),
        ["ルーン"] = ("Runa", "ja"),
        ["騎士"] = ("Caballero", "ja"),
        ["太陽"] = ("Sol", "ja"),

        // Desarrollo / Motor Gráfico / Gaming en Inglés
        ["inventory"] = ("Inventario", "en"),
        ["cooldown"] = ("Tiempo de Recarga", "en"),
        ["buff"] = ("Mejora", "en"),
        ["nerf"] = ("Reducción", "en"),
        ["pipeline"] = ("Flujo de Procesamiento", "en"),
        ["shader"] = ("Sombreador", "en"),
        ["latency"] = ("Latencia", "en"),
        ["anti-cheat"] = ("Anti-Trampas", "en"),
        ["viewport"] = ("Área de Visualización", "en"),
        ["render"] = ("Renderizado", "en"),

        // Alemán Técnico
        ["speicher"] = ("Memoria", "de"),
        ["werkzeug"] = ("Herramienta", "de"),
        ["abbrechen"] = ("Cancelar", "de"),
        ["einstellungen"] = ("Configuración", "de")
    };

    public TranslateEngine()
    {
        InitializeOcrEngines();
    }

    private void InitializeOcrEngines()
    {
        try
        {
            var userEngine = OcrEngine.TryCreateFromUserProfileLanguages();
            if (userEngine != null)
            {
                _primaryOcrEngine = userEngine;
                _allOcrEngines.Add(userEngine);
            }

            foreach (var lang in OcrEngine.AvailableRecognizerLanguages)
            {
                try
                {
                    var eng = OcrEngine.TryCreateFromLanguage(lang);
                    if (eng != null && !_allOcrEngines.Any(e => e.RecognizerLanguage.LanguageTag == lang.LanguageTag))
                    {
                        _allOcrEngines.Add(eng);
                    }
                }
                catch { }
            }
        }
        catch { }
    }

    /// <summary>
    /// Escanea un área de la pantalla con calibración física exacta multimonitor y 2x súper-resolución para OCR impecable
    /// </summary>
    public async Task<TranslationResult?> ScanAndTranslateAtPointAsync(int cursorX, int cursorY, string targetLanguage = "es")
    {
        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            // 0. CAPTURA NATIVA MULTILENGUAJE ACCESSIBILITY (UI Automation):
            // Extrae chino (中文), japonés (日本語), coreano (한국어), cirílico (русский), etc. directamente de la memoria de la aplicación
            try
            {
                var nativeInfo = UiAutomationInspector.InspectElementAt(cursorX, cursorY);
                string candidate = string.Empty;

                if (!string.IsNullOrWhiteSpace(nativeInfo.Name) && 
                    nativeInfo.Name.Length > 1 && 
                    !nativeInfo.Name.StartsWith("ToolTip AI", StringComparison.OrdinalIgnoreCase))
                {
                    candidate = nativeInfo.Name.Trim();
                }
                else if (!string.IsNullOrWhiteSpace(nativeInfo.HelpText) && nativeInfo.HelpText.Length > 1)
                {
                    candidate = nativeInfo.HelpText.Trim();
                }
                else if (!string.IsNullOrWhiteSpace(nativeInfo.Value) && nativeInfo.Value.Length > 1)
                {
                    candidate = nativeInfo.Value.Trim();
                }

                if (!string.IsNullOrWhiteSpace(candidate) && candidate.Length >= 2)
                {
                    sw.Stop();
                    var rect = new Rectangle(cursorX - 100, cursorY - 20, 200, 40);
                    return await TranslateTextAsync(candidate, rect, targetLanguage, sw.Elapsed.TotalMilliseconds);
                }
            }
            catch { }

            // 1. Identificar monitor físico correspondiente mediante coordenadas físicas
            var screens = System.Windows.Forms.Screen.AllScreens;
            var currentScreen = System.Windows.Forms.Screen.FromPoint(new Point(cursorX, cursorY))
                                ?? System.Windows.Forms.Screen.PrimaryScreen
                                ?? (screens is { Length: > 0 } ? screens[0] : null);

            int screenLeft = currentScreen != null ? currentScreen.Bounds.Left : 0;
            int screenTop = currentScreen != null ? currentScreen.Bounds.Top : 0;
            int screenWidth = currentScreen != null ? currentScreen.Bounds.Width : (int)System.Windows.SystemParameters.PrimaryScreenWidth;
            int screenHeight = currentScreen != null ? currentScreen.Bounds.Height : (int)System.Windows.SystemParameters.PrimaryScreenHeight;

            // Ventana amplia de captura (760x150 físico) centrada en el cursor
            int capW = 760;
            int capH = 150;

            int capX = Math.Max(screenLeft, cursorX - capW / 2);
            int capY = Math.Max(screenTop, cursorY - capH / 2);

            if (capX + capW > screenLeft + screenWidth) capW = (screenLeft + screenWidth) - capX;
            if (capY + capH > screenTop + screenHeight) capH = (screenTop + screenHeight) - capY;

            if (capW <= 20 || capH <= 20) return null;

            // 2. Captura física de pantalla 100% limpia (protección total contra captura de la barra de detección)
            CursorBeamOverlayWindow.Instance.SetCaptureSafe(true);
            using var srcBmp = new Bitmap(capW, capH, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(srcBmp))
            {
                g.CopyFromScreen(capX, capY, 0, 0, new System.Drawing.Size(capW, capH), CopyPixelOperation.SourceCopy);
            }
            CursorBeamOverlayWindow.Instance.SetCaptureSafe(false);

            // 3. Súper-Resolución 2x Bicúbica: imprescindible para que el OCR no se coma letras ni confunda glifos en fuentes pequeñas (9-14px)
            const int ocrScale = 2;
            int upW = capW * ocrScale;
            int upH = capH * ocrScale;
            using var ocrBmp = new Bitmap(upW, upH, PixelFormat.Format32bppArgb);
            using (var gUp = Graphics.FromImage(ocrBmp))
            {
                gUp.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                gUp.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                gUp.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                gUp.DrawImage(srcBmp, 0, 0, upW, upH);
            }

            // 4. Convertir a SoftwareBitmap WinRT
            SoftwareBitmap? softwareBitmap = null;
            try
            {
                using var ms = new MemoryStream();
                ocrBmp.Save(ms, ImageFormat.Bmp);
                ms.Position = 0;

                using var memStream = new InMemoryRandomAccessStream();
                using (var dw = new DataWriter(memStream.GetOutputStreamAt(0)))
                {
                    dw.WriteBytes(ms.ToArray());
                    await dw.StoreAsync();
                    await dw.FlushAsync();
                }

                var decoder = await BitmapDecoder.CreateAsync(memStream);
                softwareBitmap = await decoder.GetSoftwareBitmapAsync();
            }
            catch
            {
                return null;
            }

            if (softwareBitmap == null) return null;

            // 5. Ejecutar OCR nativo Direct3D/WinRT multilingüe
            OcrResult? ocrResult = null;
            if (_primaryOcrEngine != null)
            {
                try { ocrResult = await _primaryOcrEngine.RecognizeAsync(softwareBitmap); } catch { }
            }

            foreach (var altEngine in _allOcrEngines)
            {
                if (altEngine == _primaryOcrEngine) continue;
                if (ocrResult == null || ocrResult.Lines.Count == 0 || ocrResult.Text.Length < 3)
                {
                    try
                    {
                        var altRes = await altEngine.RecognizeAsync(softwareBitmap);
                        if (altRes != null && altRes.Lines.Count > 0 && (ocrResult == null || altRes.Text.Length > ocrResult.Text.Length))
                        {
                            ocrResult = altRes;
                        }
                    }
                    catch { }
                }
            }

            if (ocrResult == null || ocrResult.Lines.Count == 0) return null;

            // 6. Localizar con precisión la palabra o cláusula bajo el cursor
            double relCursorX = (cursorX - capX) * ocrScale;
            double relCursorY = (cursorY - capY) * ocrScale;

            OcrWord? closestWord = null;
            OcrLine? parentLine = null;
            double minWordDist = double.MaxValue;

            foreach (var line in ocrResult.Lines)
            {
                foreach (var word in line.Words)
                {
                    var r = word.BoundingRect;
                    double dx = Math.Max(0, Math.Max(r.X - relCursorX, relCursorX - (r.X + r.Width)));
                    double dy = Math.Max(0, Math.Max(r.Y - relCursorY, relCursorY - (r.Y + r.Height)));
                    double dist = Math.Sqrt(dx * dx + dy * dy);

                    if (dist < minWordDist)
                    {
                        minWordDist = dist;
                        closestWord = word;
                        parentLine = line;
                    }
                }
            }

            // Si el cursor está demasiado lejos de cualquier glifo de texto (> 45px reales), no traducir basura
            if (closestWord == null || parentLine == null || minWordDist > (45.0 * ocrScale))
            {
                return null;
            }

            // 7. Extraer cláusula gramatical coherente sin tragarse ni omitir palabras
            var words = parentLine.Words.ToList();
            int targetIndex = words.IndexOf(closestWord);
            if (targetIndex < 0) return null;

            // Expandir a la izquierda (respetando separaciones de columna > 38px y puntuación terminal)
            int startIdx = targetIndex;
            while (startIdx > 0)
            {
                var prev = words[startIdx - 1];
                var curr = words[startIdx];
                double gap = curr.BoundingRect.X - (prev.BoundingRect.X + prev.BoundingRect.Width);
                if (gap > (38.0 * ocrScale) || prev.Text.EndsWith('.') || prev.Text.EndsWith('!') || prev.Text.EndsWith('?') || prev.Text.EndsWith(';') || prev.Text.EndsWith(':') || prev.Text.EndsWith('|'))
                {
                    break;
                }
                startIdx--;
                if (targetIndex - startIdx >= 9) break;
            }

            // Expandir a la derecha (respetando separaciones de columna y puntuación terminal)
            int endIdx = targetIndex;
            while (endIdx < words.Count - 1)
            {
                var curr = words[endIdx];
                var next = words[endIdx + 1];
                double gap = next.BoundingRect.X - (curr.BoundingRect.X + curr.BoundingRect.Width);
                if (curr.Text.EndsWith('.') || curr.Text.EndsWith('!') || curr.Text.EndsWith('?') || curr.Text.EndsWith(';') || curr.Text.EndsWith(':') || curr.Text.EndsWith('|') || gap > (38.0 * ocrScale))
                {
                    break;
                }
                endIdx++;
                if (endIdx - targetIndex >= 9) break;
            }

            var selectedWords = words.GetRange(startIdx, endIdx - startIdx + 1);
            string matchedText = string.Join(" ", selectedWords.Select(w => w.Text)).Trim();

            // Sanear texto: eliminar corchetes o artefactos residuales que puedan alterar la traducción
            matchedText = matchedText.Trim('[', ']', '{', '}', '(', ')', '|', ' ', '\t', '\r', '\n');
            if (matchedText.StartsWith("[") && matchedText.EndsWith("]"))
            {
                matchedText = matchedText.Substring(1, matchedText.Length - 2).Trim();
            }

            if (string.IsNullOrWhiteSpace(matchedText) || matchedText.Length < 1) return null;

            // 8. Calcular BoundingRect en coordenadas físicas reales
            var firstR = selectedWords[0].BoundingRect;
            var lastR = selectedWords[selectedWords.Count - 1].BoundingRect;
            int physX = (int)(capX + firstR.X / ocrScale);
            int physY = (int)(capY + firstR.Y / ocrScale);
            int physW = (int)((lastR.X + lastR.Width - firstR.X) / ocrScale);
            int physH = (int)(Math.Max(firstR.Height, lastR.Height) / ocrScale);
            Rectangle matchedRect = new(physX, physY, Math.Max(20, physW), Math.Max(16, physH));

            sw.Stop();

            // 9. Traducir con el motor neuronal
            return await TranslateTextAsync(matchedText, matchedRect, targetLanguage, sw.Elapsed.TotalMilliseconds);
        }
        catch (System.ComponentModel.Win32Exception winEx) when (winEx.NativeErrorCode == 6)
        {
            return null;
        }
        catch (Exception ex)
        {
            App.SafeLog($"[TranslateEngine] Scan Error: {ex.Message}\n");
            return null;
        }
    }

    /// <summary>
    /// Traduce un texto o frase completa con preservación íntegra de palabras y auto-detección neural
    /// </summary>
    public async Task<TranslationResult> TranslateTextAsync(string text, Rectangle bounds, string targetLang = "es", double ocrLatency = 2.5)
    {
        string trimmed = text.Trim();
        string cacheKey = $"{trimmed.ToLowerInvariant()}_{targetLang}";
        if (_cache.TryGetValue(cacheKey, out var cached))
        {
            return cached;
        }

        // Si es una sola palabra exacta en el diccionario local
        if (!trimmed.Contains(' ') && LocalDictionary.TryGetValue(trimmed, out var exactLocal))
        {
            var res = new TranslationResult(
                trimmed,
                exactLocal.Tr,
                null,
                null,
                exactLocal.Lang,
                targetLang,
                ocrLatency,
                bounds
            );
            _cache[cacheKey] = res;
            return res;
        }

        // Determinar idioma origen: detección multilingüe neuronal 100% automática (Chino, Japonés, Coreano, Ruso, etc.)
        string sourceLang = CurrentSourceLanguage;
        if (string.IsNullOrWhiteSpace(sourceLang) || sourceLang.Equals("auto", StringComparison.OrdinalIgnoreCase))
        {
            sourceLang = "auto";
        }

        var (translated, actualSourceLang) = await QueryNeuralTranslationAsync(trimmed, sourceLang, targetLang);

        var finalResult = new TranslationResult(
            trimmed,
            translated,
            null,
            null,
            actualSourceLang,
            targetLang,
            ocrLatency,
            bounds
        );

        _cache[cacheKey] = finalResult;
        return finalResult;
    }

    /// <summary>
    /// Realiza OCR y traduce directamente el contenido de una imagen recortada o captura
    /// </summary>
    public async Task<TranslationResult?> TranslateImageBytesAsync(byte[] imageBytes, int screenX, int screenY, string targetLanguage = "es")
    {
        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            using var ms = new MemoryStream(imageBytes);
            using var bmp = new Bitmap(ms);

            using var memStream = new InMemoryRandomAccessStream();
            using (var gdiStream = new MemoryStream())
            {
                bmp.Save(gdiStream, ImageFormat.Bmp);
                var bytes = gdiStream.ToArray();
                using var writer = new DataWriter(memStream);
                writer.WriteBytes(bytes);
                await writer.StoreAsync();
                await writer.FlushAsync();
            }
            memStream.Seek(0);

            var decoder = await BitmapDecoder.CreateAsync(memStream);
            var softwareBitmap = await decoder.GetSoftwareBitmapAsync();

            OcrResult? ocrResult = null;
            if (_primaryOcrEngine != null)
            {
                try { ocrResult = await _primaryOcrEngine.RecognizeAsync(softwareBitmap); } catch { }
            }

            foreach (var altEngine in _allOcrEngines)
            {
                if (altEngine == _primaryOcrEngine) continue;
                if (ocrResult == null || string.IsNullOrWhiteSpace(ocrResult.Text))
                {
                    try
                    {
                        var altRes = await altEngine.RecognizeAsync(softwareBitmap);
                        if (altRes != null && !string.IsNullOrWhiteSpace(altRes.Text))
                        {
                            ocrResult = altRes;
                        }
                    }
                    catch { }
                }
            }

            if (ocrResult == null || string.IsNullOrWhiteSpace(ocrResult.Text)) return null;

            string recognizedText = ocrResult.Text.Trim();
            sw.Stop();

            return await TranslateTextAsync(recognizedText, new Rectangle(screenX, screenY, bmp.Width, bmp.Height), targetLanguage, sw.Elapsed.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            App.SafeLog($"[TranslateEngine] TranslateImageBytesAsync error: {ex.Message}\n");
            return null;
        }
    }

    private async Task<(string Translated, string SourceLang)> QueryNeuralTranslationAsync(string text, string sourceLang, string targetLang)
    {
        // 1. Google Translate GTX (Ultra-rápido ~60ms, traduce oraciones completas sin perder palabras)
        try
        {
            string slParam = string.IsNullOrWhiteSpace(sourceLang) ? "auto" : sourceLang;
            string gtxUrl = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={slParam}&tl={targetLang}&dt=t&q={Uri.EscapeDataString(text)}";
            var response = await _httpClient.GetStringAsync(gtxUrl);
            using var doc = JsonDocument.Parse(response);
            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
            {
                var firstArr = doc.RootElement[0];
                if (firstArr.ValueKind == JsonValueKind.Array)
                {
                    var sb = new System.Text.StringBuilder();
                    foreach (var item in firstArr.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.Array && item.GetArrayLength() > 0)
                        {
                            sb.Append(item[0].GetString());
                        }
                    }
                    var tr = sb.ToString().Trim();

                    // Extraer idioma detectado real
                    string detected = slParam;
                    if (doc.RootElement.GetArrayLength() > 2 && doc.RootElement[2].ValueKind == JsonValueKind.String)
                    {
                        detected = doc.RootElement[2].GetString() ?? slParam;
                    }

                    if (!string.IsNullOrWhiteSpace(tr))
                    {
                        return (tr, detected);
                    }
                }
            }
        }
        catch { }

        // 2. Fallback: MyMemory API
        try
        {
            string sl = sourceLang == "auto" ? "en" : sourceLang;
            string url = $"https://api.mymemory.translated.net/get?q={Uri.EscapeDataString(text)}&langpair={sl}|{targetLang}";
            var response = await _httpClient.GetStringAsync(url);
            using var doc = JsonDocument.Parse(response);
            if (doc.RootElement.TryGetProperty("responseData", out var data) &&
                data.TryGetProperty("translatedText", out var trText))
            {
                var tr = trText.GetString()?.Trim();
                if (!string.IsNullOrWhiteSpace(tr)) return (tr, sl);
            }
        }
        catch { }

        return (text, sourceLang);
    }
}
