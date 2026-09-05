using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace TeachMeAI;

public partial class HudWindow : Window
{
    private static HudWindow? _instance;
    public static HudWindow Instance => _instance ??= new HudWindow();

    private InspectionData? _currentData;
    private byte[]? _currentImageBytes;
    private bool _isPinned = false;
    private bool _isAiAnalyzing = false;
    private string _settingsPath;

    public string ApiKey { get; private set; } = string.Empty;
    public string Model { get; private set; } = "gemini-flash-latest";
    public string AnalysisMode { get; private set; } = "Maestro & Guía de Acciones";
    public double DwellSeconds { get; private set; } = 3.0;

    public event Action? OnRequestSnipping;

    public HudWindow()
    {
        InitializeComponent();
        _instance = this;

        this.Closing += (s, e) =>
        {
            e.Cancel = true;
            this.Hide();
        };

        string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        string folder = Path.Combine(appData, "TeachMeAI");
        Directory.CreateDirectory(folder);
        _settingsPath = Path.Combine(folder, "config.json");

        LoadSettings();
    }

    public void ShowSettingsOrAdjustments()
    {
        this.Show();
        SettingsDrawer.Visibility = Visibility.Visible;
        if (ModelCombo != null)
        {
            foreach (ComboBoxItem item in ModelCombo.Items)
            {
                if (item.Content?.ToString() == Model)
                {
                    ModelCombo.SelectedItem = item;
                    break;
                }
            }
        }
        this.Activate();
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        DwellSlider.Value = DwellSeconds;
        DwellValueLabel.Text = $"{DwellSeconds:0.0} seg";
        ApiKeyBox.Password = ApiKey;

        if (ModelCombo != null)
        {
            foreach (ComboBoxItem item in ModelCombo.Items)
            {
                if (item.Content?.ToString() == Model)
                {
                    ModelCombo.SelectedItem = item;
                    break;
                }
            }
        }

        if (AnalysisModeCombo != null)
        {
            foreach (ComboBoxItem item in AnalysisModeCombo.Items)
            {
                if (item.Content?.ToString() == AnalysisMode)
                {
                    AnalysisModeCombo.SelectedItem = item;
                    break;
                }
            }
        }
    }

    public void ShowInspection(InspectionData data, byte[]? imageBytes, int targetX, int targetY, bool triggerAiAnalysis = true)
    {
        _currentData = data;
        _currentImageBytes = imageBytes;

        // Position near target
        double screenW = SystemParameters.PrimaryScreenWidth;
        double screenH = SystemParameters.PrimaryScreenHeight;

        double posX = targetX;
        double posY = targetY;

        if (posX + this.Width > screenW - 20) posX = screenW - this.Width - 20;
        if (posX < 20) posX = 20;
        if (posY + this.Height > screenH - 50) posY = screenH - this.Height - 50;
        if (posY < 40) posY = 40;

        this.Left = posX;
        this.Top = posY;

        // Populate fields
        TargetTitleText.Text = data.Name;
        ProcessBadgeText.Text = data.ProcessName;
        ConfidenceText.Text = $" • {data.Confidence}";
        VerdictLabelText.Text = data.VerdictText;

        SummaryText.Text = data.Summary;
        ControlTypeText.Text = data.ControlType;
        OcrTextContent.Text = string.IsNullOrWhiteSpace(data.OcrText) ? "[Sin texto OCR]" : data.OcrText;

        if (TeacherGuideText != null)
        {
            TeacherGuideText.Text = $"• Elemento: {data.Name} ({data.ProcessName})\n" +
                                   $"• Qué puedes hacer: Consulta dudas en 'Tutor IA' o ejecuta el snippet en 'CLI'.\n" +
                                   $"• Seguridad: {data.VerdictText}";
        }

        ConsequencesText.Text = data.Consequences;
        ImpactText.Text = data.Impact;

        SignStatusText.Text = data.SignStatus;
        ExePathBox.Text = data.ExePath;
        ResourcesText.Text = data.Resources;

        CliBox.Text = data.CliSnippet;
        AccessKeyText.Text = data.AccessKey;

        // Set Risk Dot Color
        if (data.RiskClass == "danger")
        {
            VerdictIndicatorDot.Background = new SolidColorBrush(Color.FromRgb(0xF4, 0x3F, 0x5E)); // Red
        }
        else if (data.RiskClass == "warning")
        {
            VerdictIndicatorDot.Background = new SolidColorBrush(Color.FromRgb(0xF5, 0x9E, 0x0B)); // Amber
        }
        else
        {
            VerdictIndicatorDot.Background = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0)); // Green
        }

        this.Show();
        this.Activate();

        // If Gemini API Key is configured and this isn't already the AI result, trigger multimodal vision in background!
        if (triggerAiAnalysis && !_isAiAnalyzing && !string.IsNullOrWhiteSpace(ApiKey) && imageBytes != null && imageBytes.Length > 0)
        {
            _isAiAnalyzing = true;
            ConfidenceText.Text = " • ✨ Analizando con Gemini...";
            Task.Run(async () =>
            {
                try
                {
                    var aiData = await GeminiClient.AnalyzeImageAsync(ApiKey, Model, imageBytes, data.Name, data.ProcessName, data.ProcessId);
                    Dispatcher.Invoke(() =>
                    {
                        ShowInspection(aiData, imageBytes, (int)this.Left, (int)this.Top, triggerAiAnalysis: false);
                    });
                }
                catch (Exception ex)
                {
                    Dispatcher.Invoke(() =>
                    {
                        ConfidenceText.Text = " • ⚠️ Error Gemini";
                        VerdictLabelText.Text = $"Error IA: {ex.Message}";
                    });
                }
                finally
                {
                    _isAiAnalyzing = false;
                }
            });
        }
    }

    private void Header_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.LeftButton == MouseButtonState.Pressed)
        {
            this.DragMove();
        }
    }

    private void BtnPin_Click(object sender, RoutedEventArgs e)
    {
        _isPinned = !_isPinned;
        this.Topmost = _isPinned;
        BtnPin.Foreground = _isPinned ? new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0)) : new SolidColorBrush(Color.FromRgb(0x94, 0xA3, 0xB8));
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        this.Hide();
    }

    private void BtnSettings_Click(object sender, RoutedEventArgs e)
    {
        SettingsDrawer.Visibility = SettingsDrawer.Visibility == Visibility.Visible ? Visibility.Collapsed : Visibility.Visible;
    }

    private void BtnCloseSettings_Click(object sender, RoutedEventArgs e)
    {
        SettingsDrawer.Visibility = Visibility.Collapsed;
    }

    private void DwellSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (DwellValueLabel != null)
        {
            DwellValueLabel.Text = $"{e.NewValue:0.0} seg";
        }
    }

    private void BtnSaveSettings_Click(object sender, RoutedEventArgs e)
    {
        ApiKey = ApiKeyBox.Password.Trim();
        if (ModelCombo.SelectedItem is ComboBoxItem item)
        {
            Model = GeminiClient.NormalizeModel(item.Content.ToString());
        }
        if (AnalysisModeCombo.SelectedItem is ComboBoxItem modeItem)
        {
            AnalysisMode = modeItem.Content.ToString() ?? "Maestro & Guía de Acciones";
        }
        DwellSeconds = DwellSlider.Value;

        SaveSettings();
        SettingsDrawer.Visibility = Visibility.Collapsed;
        MessageBox.Show("Ajustes de TeachMe AI guardados correctamente.", "TeachMe AI", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    private void BtnCopyCli_Click(object sender, RoutedEventArgs e)
    {
        Clipboard.SetText(CliBox.Text);
        BtnCopyCli.Content = "¡Copiado!";
        Task.Delay(1500).ContinueWith(_ => Dispatcher.Invoke(() => BtnCopyCli.Content = "Copiar"));
    }

    private void BtnTriggerSnip_Click(object sender, RoutedEventArgs e)
    {
        OnRequestSnipping?.Invoke();
    }

    private async void BtnSendChat_Click(object sender, RoutedEventArgs e)
    {
        string q = ChatInputBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(q)) return;

        ChatInputBox.Text = string.Empty;

        // Add user bubble
        var userBorder = new Border
        {
            Background = new SolidColorBrush(Color.FromArgb(0x33, 0x00, 0xF5, 0xA0)),
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(8),
            Margin = new Thickness(0, 0, 0, 6),
            HorizontalAlignment = HorizontalAlignment.Right
        };
        userBorder.Child = new TextBlock
        {
            Text = q,
            Foreground = new SolidColorBrush(Color.FromRgb(0xF1, 0xF5, 0xF9)),
            FontSize = 11,
            TextWrapping = TextWrapping.Wrap
        };
        ChatMessagesPanel.Children.Add(userBorder);
        ChatScrollViewer.ScrollToEnd();

        // Thinking indicator
        var thinkingBorder = new Border
        {
            Background = new SolidColorBrush(Color.FromArgb(0x33, 0x38, 0xBD, 0xF8)),
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(8),
            Margin = new Thickness(0, 0, 0, 6)
        };
        thinkingBorder.Child = new TextBlock
        {
            Text = "✨ Analizando con Gemini...",
            Foreground = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8)),
            FontSize = 11
        };
        ChatMessagesPanel.Children.Add(thinkingBorder);
        ChatScrollViewer.ScrollToEnd();

        string answer = await GeminiClient.AskQuestionAsync(ApiKey, Model, q, _currentData ?? new InspectionData(), _currentImageBytes);
        ChatMessagesPanel.Children.Remove(thinkingBorder);

        var botBorder = new Border
        {
            Background = new SolidColorBrush(Color.FromRgb(0x16, 0x1E, 0x2E)),
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(8),
            Margin = new Thickness(0, 0, 0, 6)
        };
        botBorder.Child = new TextBlock
        {
            Text = answer,
            Foreground = new SolidColorBrush(Color.FromRgb(0xCB, 0xD5, 0xE1)),
            FontSize = 11,
            TextWrapping = TextWrapping.Wrap
        };
        ChatMessagesPanel.Children.Add(botBorder);
        ChatScrollViewer.ScrollToEnd();
    }

    private void ChatInputBox_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            BtnSendChat_Click(sender, e);
        }
    }

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Escape)
        {
            if (SettingsDrawer.Visibility == Visibility.Visible)
            {
                SettingsDrawer.Visibility = Visibility.Collapsed;
            }
            else
            {
                this.Hide();
            }
        }
    }

    private void LoadSettings()
    {
        try
        {
            if (File.Exists(_settingsPath))
            {
                string json = File.ReadAllText(_settingsPath);
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.TryGetProperty("ApiKey", out var k)) ApiKey = k.GetString() ?? "";
                if (root.TryGetProperty("Model", out var m)) Model = GeminiClient.NormalizeModel(m.GetString());
                if (root.TryGetProperty("AnalysisMode", out var a)) AnalysisMode = a.GetString() ?? "Maestro & Guía de Acciones";
                if (root.TryGetProperty("DwellSeconds", out var d)) DwellSeconds = d.GetDouble();
            }
        }
        catch { }
    }

    private void SaveSettings()
    {
        try
        {
            var data = new { ApiKey, Model, AnalysisMode, DwellSeconds };
            File.WriteAllText(_settingsPath, JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true }));
        }
        catch { }
    }
}
