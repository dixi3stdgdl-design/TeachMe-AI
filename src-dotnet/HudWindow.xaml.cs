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
    private DockingEngine _dockingEngine = new DockingEngine();

    public string Provider { get; private set; } = AiProviderCatalog.Gemini;
    public string ApiKey { get; private set; } = string.Empty;
    public string Model { get; private set; } = GeminiClient.DefaultModel;
    public string AzureEndpoint { get; private set; } = string.Empty;
    public string AzureDeployment { get; private set; } = string.Empty;
    public string AnalysisMode { get; private set; } = "Maestro & Guía de Acciones";
    public double DwellSeconds { get; private set; } = 3.0;

    public AiCredentials CreateCredentials() => new()
    {
        Provider = Provider,
        ApiKey = ApiKey,
        Model = Model,
        AzureEndpoint = AzureEndpoint,
        AzureDeployment = AzureDeployment
    };

    public bool IsPinned => _isPinned;

    public bool IsMouseOverHud(int screenX, int screenY)
    {
        if (!this.IsVisible) return false;
        return screenX >= this.Left && screenX <= (this.Left + this.Width) &&
               screenY >= this.Top && screenY <= (this.Top + this.Height);
    }

    public bool IsInteractingWithHud()
    {
        return this.IsVisible && (this.IsKeyboardFocusWithin || this.IsActive);
    }

    public void FadeOutAndHide(double durationMs = 220)
    {
        if (_isPinned || !this.IsVisible) return;

        Dispatcher.Invoke(() =>
        {
            if (_isPinned || !this.IsVisible) return;
            var anim = new System.Windows.Media.Animation.DoubleAnimation(this.Opacity, 0.0, TimeSpan.FromMilliseconds(durationMs));
            anim.Completed += (s, e) =>
            {
                if (!_isPinned)
                {
                    this.Hide();
                    this.Opacity = 1.0;
                    this.BeginAnimation(UIElement.OpacityProperty, null);
                }
            };
            this.BeginAnimation(UIElement.OpacityProperty, anim);
        });
    }

    public event Action? OnRequestSnipping;

    public HudWindow()
    {
        InitializeComponent();
        _instance = this;

        _dockingEngine.OnDockModeChanged += HandleDockModeChanged;
        this.LostMouseCapture += (s, e) => EndDirectDrag();

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

    private void HandleDockModeChanged(DockMode mode)
    {
        Dispatcher.Invoke(() =>
        {
            if (mode == DockMode.BottomRibbon)
            {
                VerticalViewContainer.Visibility = Visibility.Collapsed;
                HorizontalRibbonContainer.Visibility = Visibility.Visible;
            }
            else
            {
                VerticalViewContainer.Visibility = Visibility.Visible;
                HorizontalRibbonContainer.Visibility = Visibility.Collapsed;
            }
        });
    }

    public void ShowSettingsOrAdjustments()
    {
        this.Show();
        SettingsDrawer.Visibility = Visibility.Visible;
        RefreshSettingsUi();
        this.Activate();
    }

    private void RefreshSettingsUi()
    {
        ProviderCombo.ItemsSource = null;
        ProviderCombo.Items.Clear();
        foreach (var p in AiProviderCatalog.Providers)
        {
            ProviderCombo.Items.Add(new ComboBoxItem { Content = p, IsSelected = p == Provider });
        }

        ApiKeyBox.Password = ApiKey;
        AzureEndpointBox.Text = AzureEndpoint;
        AzureDeploymentBox.Text = AzureDeployment;
        ProviderCombo_SelectionChanged(ProviderCombo, null);

        DwellSlider.Value = DwellSeconds;
        DwellValueLabel.Text = $"{DwellSeconds:0.0} seg";
    }

    private void ProviderCombo_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs? e)
    {
        if (ProviderCombo?.SelectedItem is not ComboBoxItem item) return;
        string provider = item.Content?.ToString() ?? AiProviderCatalog.Gemini;
        Provider = AiProviderCatalog.Normalize(provider);

        AzureFieldsPanel.Visibility = Provider == AiProviderCatalog.AzureOpenAI
            ? Visibility.Visible
            : Visibility.Collapsed;

        if (ProviderLink != null)
        {
            ProviderLink.NavigateUri = new Uri(AiProviderCatalog.GetSignUpUrl(Provider));
            string label = Provider switch
            {
                AiProviderCatalog.OpenAI => "Obtener clave en OpenAI Platform ↗",
                AiProviderCatalog.AzureOpenAI => "Crear recurso Azure OpenAI ↗",
                AiProviderCatalog.OpenRouter => "Obtener clave en OpenRouter ↗",
                AiProviderCatalog.Claude => "Obtener clave en Anthropic Console ↗",
                _ => "Obtener clave gratuita en Google AI Studio ↗"
            };
            ProviderLink.Inlines.Clear();
            ProviderLink.Inlines.Add(new System.Windows.Documents.Run(label));
        }

        string currentModel = Model;
        ModelCombo.Items.Clear();
        foreach (var m in AiProviderCatalog.GetModels(Provider))
        {
            bool selected = string.Equals(m, currentModel, StringComparison.OrdinalIgnoreCase)
                            || ModelCombo.Items.Count == 0;
            ModelCombo.Items.Add(new ComboBoxItem { Content = m, IsSelected = selected });
            if (selected) Model = m;
        }
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        DwellSlider.Value = DwellSeconds;
        DwellValueLabel.Text = $"{DwellSeconds:0.0} seg";
        RefreshSettingsUi();

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

    public void ApplyDomainTheme(string domain)
    {
        Dispatcher.Invoke(() =>
        {
            SolidColorBrush accentBrush;
            SolidColorBrush bgBadgeBrush;
            string domainLabel;
            string adviceTitle;

            switch (domain?.ToLowerInvariant())
            {
                case "gaming":
                    accentBrush = new SolidColorBrush(Color.FromRgb(0xA8, 0x55, 0xF7)); // Violet
                    bgBadgeBrush = new SolidColorBrush(Color.FromArgb(0x35, 0xA8, 0x55, 0xF7));
                    domainLabel = "🎮 COACH GAMING // METAGAME";
                    adviceTitle = "🎮 ESTRATEGIA TÁCTICA DEL MAESTRO";
                    break;
                case "audio":
                    accentBrush = new SolidColorBrush(Color.FromRgb(0xF5, 0x9E, 0x0B)); // Amber
                    bgBadgeBrush = new SolidColorBrush(Color.FromArgb(0x35, 0xF5, 0x9E, 0x0B));
                    domainLabel = "🎛️ INGENIERÍA DE AUDIO // MASTERING";
                    adviceTitle = "🎛️ INGENIERÍA ACÚSTICA & MEZCLA";
                    break;
                case "dev":
                    accentBrush = new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0)); // Emerald
                    bgBadgeBrush = new SolidColorBrush(Color.FromArgb(0x35, 0x00, 0xF5, 0xA0));
                    domainLabel = "💻 ARQUITECTO DEV // CIBERAUDITOR";
                    adviceTitle = "💻 ARQUITECTURA & CIBERSEGURIDAD";
                    break;
                case "web":
                    accentBrush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8)); // Sky Blue
                    bgBadgeBrush = new SolidColorBrush(Color.FromArgb(0x35, 0x38, 0xBD, 0xF8));
                    domainLabel = "🌐 INVESTIGACIÓN & FACT-CHECK";
                    adviceTitle = "🌐 CONCLUSIÓN ANALÍTICA & VERACIDAD";
                    break;
                default:
                    accentBrush = new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8)); // Cyan
                    bgBadgeBrush = new SolidColorBrush(Color.FromArgb(0x35, 0x38, 0xBD, 0xF8));
                    domainLabel = "🧠 COPILOTO COGNITIVO // WINDOWS";
                    adviceTitle = "🧠 ASISTENCIA COGNITIVA WINDOWS";
                    break;
            }

            MainChassisBorder.BorderBrush = accentBrush;
            DomainBadgeBorder.Background = bgBadgeBrush;
            DomainBadgeBorder.BorderBrush = accentBrush;
            DomainBadgeText.Text = domainLabel;
            DomainBadgeText.Foreground = accentBrush;

            if (DomainBadgeBorderH != null)
            {
                DomainBadgeBorderH.Background = bgBadgeBrush;
                DomainBadgeBorderH.BorderBrush = accentBrush;
                DomainBadgeTextH.Text = domainLabel;
                DomainBadgeTextH.Foreground = accentBrush;
            }

            AdviceCardBorder.BorderBrush = new SolidColorBrush(Color.FromArgb(0x60, accentBrush.Color.R, accentBrush.Color.G, accentBrush.Color.B));
            AdviceCardTitle.Text = adviceTitle;
            AdviceCardTitle.Foreground = accentBrush;

            if (AdviceCardBorderH != null)
            {
                AdviceCardBorderH.BorderBrush = new SolidColorBrush(Color.FromArgb(0x60, accentBrush.Color.R, accentBrush.Color.G, accentBrush.Color.B));
                AdviceCardTitleH.Text = adviceTitle;
                AdviceCardTitleH.Foreground = accentBrush;
            }

            VerdictIndicatorDot.Background = accentBrush;
        });
    }

    public void ShowInspection(InspectionData data, byte[]? imageBytes, int targetX, int targetY, bool triggerAiAnalysis = true)
    {
        _currentData = data;
        _currentImageBytes = imageBytes;

        string domain = !string.IsNullOrWhiteSpace(data.DomainType) && data.DomainType != "system"
            ? data.DomainType
            : GeminiClient.DetectDomainFromProcess(data.ProcessName);

        ApplyDomainTheme(domain);
        MainWindow.Instance?.UpdateActiveDomain(domain);

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

        if (TargetTitleTextH != null) TargetTitleTextH.Text = data.Name;
        if (ProcessBadgeTextH != null) ProcessBadgeTextH.Text = data.ProcessName;
        if (VerdictLabelTextH != null) VerdictLabelTextH.Text = data.VerdictText;

        // Píldora de valor nativo en encabezado
        if (!string.IsNullOrWhiteSpace(data.NativeValue))
        {
            string shortVal = data.NativeValue.Length > 16 ? data.NativeValue.Substring(0, 16) : data.NativeValue;
            ValueBadgeBorder.Visibility = Visibility.Visible;
            ValueBadgeText.Text = shortVal;
            if (ValueBadgeBorderH != null)
            {
                ValueBadgeBorderH.Visibility = Visibility.Visible;
                ValueBadgeTextH.Text = shortVal;
            }
        }
        else
        {
            ValueBadgeBorder.Visibility = Visibility.Collapsed;
            if (ValueBadgeBorderH != null) ValueBadgeBorderH.Visibility = Visibility.Collapsed;
        }

        // Tooltip y ayuda nativa registrada en Windows
        if (!string.IsNullOrWhiteSpace(data.NativeHelpText))
        {
            NativeHelpLabel.Visibility = Visibility.Visible;
            NativeHelpBorder.Visibility = Visibility.Visible;
            NativeHelpTextContent.Text = data.NativeHelpText;
        }
        else
        {
            NativeHelpLabel.Visibility = Visibility.Collapsed;
            NativeHelpBorder.Visibility = Visibility.Collapsed;
        }

        SummaryText.Text = data.Summary;
        ControlTypeText.Text = data.ControlType;
        OcrTextContent.Text = string.IsNullOrWhiteSpace(data.OcrText) ? "[Sin texto OCR]" : data.OcrText;

        // Pestaña Maestro: Consejo didáctico de alto nivel
        if (TeacherGuideText != null)
        {
            string guide;
            if (!string.IsNullOrWhiteSpace(data.ExpertAdvice))
            {
                guide = data.ExpertAdvice;
            }
            else
            {
                guide = $"• Elemento: {data.Name} ({data.ProcessName})\n" +
                        $"• Qué puedes hacer: Consulta dudas técnicas en 'Tutor IA' o ejecuta el snippet en 'CLI'.\n" +
                        $"• Seguridad: {data.VerdictText}";
            }
            TeacherGuideText.Text = guide;
            if (TeacherGuideTextH != null) TeacherGuideTextH.Text = guide;
        }

        ConsequencesText.Text = data.Consequences;
        ImpactText.Text = data.Impact;

        // Pestaña Specs: Módulo padre y valor nativo
        if (!string.IsNullOrWhiteSpace(data.ParentContainer))
        {
            ParentModulePanel.Visibility = Visibility.Visible;
            ParentModuleText.Text = data.ParentContainer;
        }
        else
        {
            ParentModulePanel.Visibility = Visibility.Collapsed;
        }

        if (!string.IsNullOrWhiteSpace(data.NativeValue))
        {
            NativeValuePanel.Visibility = Visibility.Visible;
            NativeValueText.Text = data.NativeValue;
        }
        else
        {
            NativeValuePanel.Visibility = Visibility.Collapsed;
        }

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

        this.BeginAnimation(UIElement.OpacityProperty, null);
        this.Opacity = 1.0;
        this.Show();
        this.Activate();

        if (triggerAiAnalysis)
        {
            var fadeIn = new System.Windows.Media.Animation.DoubleAnimation(0.3, 1.0, TimeSpan.FromMilliseconds(160));
            this.BeginAnimation(UIElement.OpacityProperty, fadeIn);
        }

        // Control visual del Banner de Modo Local cuando no hay API Key
        if (string.IsNullOrWhiteSpace(ApiKey))
        {
            NoKeyNoticeBanner.Visibility = Visibility.Visible;
            ConfidenceText.Text = " • Modo Local (Sin IA)";
        }
        else
        {
            NoKeyNoticeBanner.Visibility = Visibility.Collapsed;
        }

        // If Gemini API Key is configured and this isn't already the AI result, trigger multimodal vision in background!
        if (triggerAiAnalysis && !_isAiAnalyzing && !string.IsNullOrWhiteSpace(ApiKey) && imageBytes != null && imageBytes.Length > 0)
        {
            _isAiAnalyzing = true;
            ConfidenceText.Text = $" • ✨ Maestro {Provider} Analizando...";
            Task.Run(async () =>
            {
                try
                {
                    var nativeInfo = new NativeElementInfo(
                        Name: data.Name,
                        ControlType: data.ControlType,
                        LocalizedControlType: data.ControlType,
                        HelpText: data.NativeHelpText,
                        Value: data.NativeValue,
                        ItemStatus: string.Empty,
                        ItemType: string.Empty,
                        AcceleratorKey: data.AccessKey,
                        AccessKey: data.AccessKey,
                        FrameworkId: data.FrameworkId,
                        ClassName: string.Empty,
                        ParentContainerName: data.ParentContainer,
                        HasNativeData: !string.IsNullOrWhiteSpace(data.NativeValue) || !string.IsNullOrWhiteSpace(data.NativeHelpText) || !string.IsNullOrWhiteSpace(data.ParentContainer)
                    );

                    var aiData = await AiBridge.AnalyzeImageAsync(CreateCredentials(), imageBytes, data.Name, data.ProcessName, data.ProcessId, nativeInfo);
                    Dispatcher.Invoke(() =>
                    {
                        ShowInspection(aiData, imageBytes, (int)this.Left, (int)this.Top, triggerAiAnalysis: false);
                    });
                }
                catch (Exception ex)
                {
                    Dispatcher.Invoke(() =>
                    {
                        ConfidenceText.Text = $" • ⚠️ Error {Provider}";
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

    #region Direct Dragging Dynamics

    private bool _isDirectDragging = false;
    private DockingEngine.POINT _dragStartCursor;
    private double _dragStartWindowLeft;
    private double _dragStartWindowTop;

    private static T? FindVisualParent<T>(DependencyObject? child) where T : DependencyObject
    {
        while (child != null)
        {
            if (child is T parent) return parent;
            child = VisualTreeHelper.GetParent(child);
        }
        return null;
    }

    private void StartDirectDrag(MouseButtonEventArgs e)
    {
        if (e.OriginalSource is DependencyObject dep)
        {
            if (FindVisualParent<System.Windows.Controls.Button>(dep) != null ||
                FindVisualParent<System.Windows.Controls.TextBox>(dep) != null ||
                FindVisualParent<System.Windows.Controls.PasswordBox>(dep) != null)
            {
                return;
            }
        }

        if (e.LeftButton == MouseButtonState.Pressed)
        {
            if (DockingEngine.GetCursorPos(out _dragStartCursor))
            {
                _isDirectDragging = true;
                _dragStartWindowLeft = this.Left;
                _dragStartWindowTop = this.Top;
                this.CaptureMouse();
                e.Handled = true;
            }
        }
    }

    private void Header_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        StartDirectDrag(e);
    }

    private void Ribbon_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        StartDirectDrag(e);
    }

    private void Window_MouseMove(object sender, MouseEventArgs e)
    {
        if (_isDirectDragging && e.LeftButton == MouseButtonState.Pressed)
        {
            if (DockingEngine.GetCursorPos(out var cur))
            {
                var dpi = VisualTreeHelper.GetDpi(this);
                double scaleX = dpi.DpiScaleX > 0 ? dpi.DpiScaleX : 1.0;
                double scaleY = dpi.DpiScaleY > 0 ? dpi.DpiScaleY : 1.0;

                double deltaX = (cur.X - _dragStartCursor.X) / scaleX;
                double deltaY = (cur.Y - _dragStartCursor.Y) / scaleY;

                this.Left = _dragStartWindowLeft + deltaX;
                this.Top = _dragStartWindowTop + deltaY;
            }
        }
        else if (_isDirectDragging && e.LeftButton != MouseButtonState.Pressed)
        {
            EndDirectDrag();
        }
    }

    private void Window_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
    {
        if (_isDirectDragging)
        {
            EndDirectDrag();
            e.Handled = true;
        }
    }

    private void EndDirectDrag()
    {
        if (!_isDirectDragging) return;
        _isDirectDragging = false;
        try { this.ReleaseMouseCapture(); } catch { }
        _dockingEngine.EvaluateAndSnap(this);
    }

    #endregion

    private void BtnMorphOrientation_Click(object sender, RoutedEventArgs e)
    {
        _dockingEngine.ToggleOrientation(this);
    }

    private void BtnPin_Click(object sender, RoutedEventArgs e)
    {
        _isPinned = !_isPinned;
        this.Topmost = _isPinned;
        var pinBrush = _isPinned ? new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0)) : new SolidColorBrush(Color.FromRgb(0x94, 0xA3, 0xB8));
        BtnPin.Foreground = pinBrush;
        if (BtnPinH != null) BtnPinH.Foreground = pinBrush;
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
        if (ProviderCombo.SelectedItem is ComboBoxItem providerItem)
        {
            Provider = AiProviderCatalog.Normalize(providerItem.Content?.ToString());
        }
        if (ModelCombo.SelectedItem is ComboBoxItem item)
        {
            Model = AiProviderCatalog.NormalizeModel(Provider, item.Content?.ToString());
        }
        AzureEndpoint = AzureEndpointBox.Text.Trim();
        AzureDeployment = AzureDeploymentBox.Text.Trim();
        if (AnalysisModeCombo.SelectedItem is ComboBoxItem modeItem)
        {
            AnalysisMode = modeItem.Content.ToString() ?? "Maestro & Guía de Acciones";
        }
        DwellSeconds = DwellSlider.Value;

        SaveSettings();
        if (!string.IsNullOrWhiteSpace(ApiKey))
        {
            NoKeyNoticeBanner.Visibility = Visibility.Collapsed;
        }
        SettingsDrawer.Visibility = Visibility.Collapsed;
        MessageBox.Show(
            $"Ajustes guardados ({Provider} · {Model}). Clave cifrada con DPAPI.",
            "ToolTip AI",
            MessageBoxButton.OK,
            MessageBoxImage.Information);
    }

    private void BtnOpenSettingsFromBanner_Click(object sender, RoutedEventArgs e)
    {
        ShowSettingsOrAdjustments();
    }

    private void Hyperlink_RequestNavigate(object sender, System.Windows.Navigation.RequestNavigateEventArgs e)
    {
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = e.Uri.AbsoluteUri,
                UseShellExecute = true
            });
            e.Handled = true;
        }
        catch { }
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

    private void BtnSendChat_Click(object sender, RoutedEventArgs e)
    {
        string q = ChatInputBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(q)) return;

        ChatInputBox.Text = "";
        AddChatMessage("Tú", q, isUser: true);

        Task.Run(async () =>
        {
            string answer = await AiBridge.AskQuestionAsync(CreateCredentials(), q, _currentData ?? new InspectionData(), _currentImageBytes);
            Dispatcher.Invoke(() =>
            {
                AddChatMessage("Maestro IA", answer, isUser: false);
            });
        });
    }

    private void AddChatMessage(string author, string text, bool isUser)
    {
        var border = new Border
        {
            Background = isUser ? new SolidColorBrush(Color.FromArgb(0x30, 0x00, 0xF5, 0xA0)) : new SolidColorBrush(Color.FromRgb(0x12, 0x18, 0x26)),
            BorderBrush = isUser ? new SolidColorBrush(Color.FromArgb(0x60, 0x00, 0xF5, 0xA0)) : new SolidColorBrush(Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF)),
            BorderThickness = new Thickness(0.8),
            CornerRadius = new CornerRadius(6),
            Padding = new Thickness(6),
            Margin = new Thickness(0, 0, 0, 6)
        };

        var sp = new StackPanel();
        sp.Children.Add(new TextBlock
        {
            Text = author,
            Foreground = isUser ? new SolidColorBrush(Color.FromRgb(0x00, 0xF5, 0xA0)) : new SolidColorBrush(Color.FromRgb(0x38, 0xBD, 0xF8)),
            FontWeight = FontWeights.Bold,
            FontSize = 8.5,
            Margin = new Thickness(0, 0, 0, 2)
        });
        sp.Children.Add(new TextBlock
        {
            Text = text,
            Foreground = new SolidColorBrush(Color.FromRgb(0xEB, 0xF0, 0xF7)),
            FontSize = 9.5,
            TextWrapping = TextWrapping.Wrap,
            LineHeight = 13.5
        });

        border.Child = sp;
        ChatMessagesPanel.Children.Add(border);
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
        bool needsRewrite = false;
        try
        {
            if (File.Exists(_settingsPath))
            {
                string json = File.ReadAllText(_settingsPath);
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.TryGetProperty("Provider", out var p))
                {
                    Provider = AiProviderCatalog.Normalize(p.GetString());
                }
                if (root.TryGetProperty("ApiKey", out var k))
                {
                    string rawKey = k.GetString() ?? "";
                    string? decrypted = VaultManager.TryDecryptSecret(rawKey);
                    if (decrypted != null)
                    {
                        ApiKey = decrypted;
                    }
                    else if (VaultManager.TryMigrateLegacyPlaintext(rawKey, out string legacyPlain))
                    {
                        ApiKey = legacyPlain;
                        needsRewrite = true;
                    }
                }
                if (root.TryGetProperty("Model", out var m))
                {
                    Model = AiProviderCatalog.NormalizeModel(Provider, m.GetString());
                }
                if (root.TryGetProperty("AzureEndpoint", out var ae)) AzureEndpoint = ae.GetString() ?? string.Empty;
                if (root.TryGetProperty("AzureDeployment", out var ad)) AzureDeployment = ad.GetString() ?? string.Empty;
                if (root.TryGetProperty("AnalysisMode", out var a)) AnalysisMode = a.GetString() ?? "Maestro & Guía de Acciones";
                if (root.TryGetProperty("DwellSeconds", out var d)) DwellSeconds = d.GetDouble();
            }
        }
        catch { }

        if (needsRewrite)
        {
            SaveSettings();
        }
    }

    private void SaveSettings()
    {
        try
        {
            string encryptedKey = VaultManager.EncryptSecret(ApiKey);
            var data = new
            {
                Provider,
                ApiKey = encryptedKey,
                Model,
                AzureEndpoint,
                AzureDeployment,
                AnalysisMode,
                DwellSeconds
            };
            File.WriteAllText(_settingsPath, JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true }));
        }
        catch { }
    }
}
