using System.Windows;
using System.Windows.Media.Animation;

namespace TeachMeAI;

public partial class DwellIndicatorWindow : Window
{
    private Storyboard? _heartbeat;
    private bool _isVisible = false;

    public DwellIndicatorWindow()
    {
        InitializeComponent();
        _heartbeat = (Storyboard)Resources["DwellHeartbeat"];
    }

    public void UpdateProgress(double remainingSeconds, string phase)
    {
        StatusText.Text = phase;
        TimeText.Text = $" {remainingSeconds:0.0}s";
    }

    /// <summary>Muestra el indicador con fade-in y activa el latido del radar.</summary>
    public void ShowAnimated()
    {
        if (_isVisible) return;
        _isVisible = true;
        Opacity = 0.0;
        Visibility = Visibility.Visible;
        _heartbeat?.Begin(this, true);
        var fadeIn = (Storyboard)Resources["FadeIn"];
        fadeIn.Begin(this);
    }

    /// <summary>Oculta el indicador con fade-out y detiene el latido.</summary>
    public void HideAnimated()
    {
        if (!_isVisible) return;
        _isVisible = false;
        var fadeOut = (Storyboard)Resources["FadeOut"];
        fadeOut.Completed += (_, _) =>
        {
            Visibility = Visibility.Collapsed;
            _heartbeat?.Stop(this);
        };
        fadeOut.Begin(this);
    }
}
