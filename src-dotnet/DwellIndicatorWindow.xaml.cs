using System.Windows;

namespace TeachMeAI;

public partial class DwellIndicatorWindow : Window
{
    public DwellIndicatorWindow()
    {
        InitializeComponent();
    }

    public void UpdateProgress(double remainingSeconds, string phase)
    {
        StatusText.Text = phase;
        TimeText.Text = $"({remainingSeconds:0.0}s)";
    }
}
