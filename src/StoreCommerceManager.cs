using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Windows.Services.Store;

namespace ToolTipAI;

/// <summary>
/// Gestiona la monetización oficial, compras integradas (IAP Durable),
/// licencias de Microsoft Store y el periodo de evaluación de 1 día (24h).
/// </summary>
public static class StoreCommerceManager
{
    // Identificador oficial del In-App Purchase (Add-on Durable) que desbloquea las 4 apps de la Suite
    public const string SuiteBundleAddOnId = "tooltip_ai_suite_bundle";

    // Product IDs oficiales de la suite en Microsoft Store
    public const string AssistantStoreId = "9N3D02KXKD3D";
    public const string AuraStoreId = "9P33P1P5Z8DC";
    public const string TranslateStoreId = "9NQN3RZ2Z655";
    public const string VoiceStoreId = "9P417GZB0FVB";

    private static StoreContext? _storeContext;
    private static LicenseStatus? _cachedStatus;
    private static readonly object _lock = new();

    public record LicenseStatus(
        bool IsLicensed,
        bool IsTrial,
        bool IsExpired,
        TimeSpan TrialTimeRemaining,
        string StatusDescription,
        string AppPriceFormatted,
        string BundlePriceFormatted
    );

    public static event Action<LicenseStatus>? OnLicenseChanged;

    /// <summary>
    /// Consulta el estado actual de la licencia (Store nativo con fallback a TrialLicenseManager local).
    /// </summary>
    public static async Task<LicenseStatus> GetLicenseStatusAsync(IntPtr hwnd = default)
    {
        try
        {
            var ctx = GetStoreContext(hwnd);
            StoreAppLicense license = await ctx.GetAppLicenseAsync();

            string appPrice = "$9.99 USD";
            string bundlePrice = "$24.99 USD";

            // Intentar recuperar precios localizados de la tienda en segundo plano
            try
            {
                var priceTask = GetLocalizedPricingAsync(ctx);
                if (await Task.WhenAny(priceTask, Task.Delay(1500)) == priceTask)
                {
                    var (pApp, pBundle) = await priceTask;
                    if (!string.IsNullOrEmpty(pApp)) appPrice = pApp;
                    if (!string.IsNullOrEmpty(pBundle)) bundlePrice = pBundle;
                }
            }
            catch { }

            // 1. Comprobar si tiene el Bundle Suite de por vida (In-App Purchase Durable)
            if (license.AddOnLicenses.TryGetValue(SuiteBundleAddOnId, out var bundleLicense) && bundleLicense.IsActive)
            {
                var status = new LicenseStatus(
                    IsLicensed: true,
                    IsTrial: false,
                    IsExpired: false,
                    TrialTimeRemaining: TimeSpan.MaxValue,
                    StatusDescription: "Licencia de por vida (Suite Bundle activa)",
                    AppPriceFormatted: appPrice,
                    BundlePriceFormatted: bundlePrice
                );
                UpdateCachedStatus(status);
                return status;
            }

            // 2. Comprobar si tiene licencia completa de esta aplicación
            if (license.IsActive && !license.IsTrial)
            {
                var status = new LicenseStatus(
                    IsLicensed: true,
                    IsTrial: false,
                    IsExpired: false,
                    TrialTimeRemaining: TimeSpan.MaxValue,
                    StatusDescription: "Licencia individual activa",
                    AppPriceFormatted: appPrice,
                    BundlePriceFormatted: bundlePrice
                );
                UpdateCachedStatus(status);
                return status;
            }

            // 3. Comprobar si está en el periodo de prueba de 1 día (24 horas) de la Store
            if (license.IsActive && license.IsTrial)
            {
                TimeSpan remaining = license.TrialTimeRemaining;
                bool expired = remaining <= TimeSpan.Zero;

                string desc = expired
                    ? "Periodo de prueba de 24 horas finalizado"
                    : $"Prueba de 24h activa ({FormatRemaining(remaining)} restantes)";

                var status = new LicenseStatus(
                    IsLicensed: !expired,
                    IsTrial: true,
                    IsExpired: expired,
                    TrialTimeRemaining: remaining,
                    StatusDescription: desc,
                    AppPriceFormatted: appPrice,
                    BundlePriceFormatted: bundlePrice
                );
                UpdateCachedStatus(status);
                return status;
            }

            // 4. Si la Store reporta inactiva o expirada
            {
                var status = new LicenseStatus(
                    IsLicensed: false,
                    IsTrial: true,
                    IsExpired: true,
                    TrialTimeRemaining: TimeSpan.Zero,
                    StatusDescription: "Periodo de prueba de 24 horas finalizado",
                    AppPriceFormatted: appPrice,
                    BundlePriceFormatted: bundlePrice
                );
                UpdateCachedStatus(status);
                return status;
            }
        }
        catch
        {
            // Fallback seguro al motor local (DPAPI + Registro de Windows) si no hay conexión o no está empaquetado en Store
            var local = TrialLicenseManager.CheckStatus();
            var status = new LicenseStatus(
                IsLicensed: local.IsLicensed,
                IsTrial: !local.IsLicensed,
                IsExpired: local.IsExpired,
                TrialTimeRemaining: local.TimeRemaining,
                StatusDescription: local.StatusMessage,
                AppPriceFormatted: "$9.99 USD",
                BundlePriceFormatted: "$24.99 USD"
            );
            UpdateCachedStatus(status);
            return status;
        }
    }

    /// <summary>
    /// Despliega el diálogo nativo de compra de Microsoft Store para adquirir la app individual ($9.99).
    /// </summary>
    public static async Task<StorePurchaseStatus> RequestPurchaseAppAsync(IntPtr hwnd, string? storeProductId = null)
    {
        try
        {
            var ctx = GetStoreContext(hwnd);
            string targetId = storeProductId ?? AssistantStoreId;

            var result = await ctx.RequestPurchaseAsync(targetId);
            if (result.Status == StorePurchaseStatus.Succeeded || result.Status == StorePurchaseStatus.AlreadyPurchased)
            {
                await GetLicenseStatusAsync(hwnd);
            }
            return result.Status;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[StoreCommerce] Error al comprar app: {ex.Message}");
            return StorePurchaseStatus.NetworkError;
        }
    }

    /// <summary>
    /// Despliega el diálogo nativo de compra de Microsoft Store para adquirir el Suite Bundle completo ($24.99).
    /// </summary>
    public static async Task<StorePurchaseStatus> RequestPurchaseBundleAsync(IntPtr hwnd)
    {
        try
        {
            var ctx = GetStoreContext(hwnd);
            var result = await ctx.RequestPurchaseAsync(SuiteBundleAddOnId);

            if (result.Status == StorePurchaseStatus.Succeeded || result.Status == StorePurchaseStatus.AlreadyPurchased)
            {
                await GetLicenseStatusAsync(hwnd);
            }
            return result.Status;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[StoreCommerce] Error al comprar Suite Bundle: {ex.Message}");
            return StorePurchaseStatus.NetworkError;
        }
    }

    /// <summary>
    /// Retorna el estado en caché para consultas síncronas rápidas de renderizado.
    /// </summary>
    public static LicenseStatus GetCachedStatus()
    {
        lock (_lock)
        {
            if (_cachedStatus != null) return _cachedStatus;
        }
        var local = TrialLicenseManager.CheckStatus();
        return new LicenseStatus(
            IsLicensed: local.IsLicensed,
            IsTrial: !local.IsLicensed,
            IsExpired: local.IsExpired,
            TrialTimeRemaining: local.TimeRemaining,
            StatusDescription: local.StatusMessage,
            AppPriceFormatted: "$9.99 USD",
            BundlePriceFormatted: "$24.99 USD"
        );
    }

    private static void UpdateCachedStatus(LicenseStatus status)
    {
        lock (_lock)
        {
            _cachedStatus = status;
        }
        try
        {
            OnLicenseChanged?.Invoke(status);
        }
        catch { }
    }

    private static StoreContext GetStoreContext(IntPtr hwnd)
    {
        if (_storeContext == null)
        {
            _storeContext = StoreContext.GetDefault();
        }

        if (hwnd != IntPtr.Zero)
        {
            try
            {
                InitializeWithWindow.Initialize(_storeContext, hwnd);
            }
            catch { }
        }

        return _storeContext;
    }

    private static async Task<(string appPrice, string bundlePrice)> GetLocalizedPricingAsync(StoreContext ctx)
    {
        string pApp = "$9.99 USD";
        string pBundle = "$24.99 USD";

        try
        {
            string[] filterList = new string[] { "Durable" };
            StoreProductQueryResult queryResult = await ctx.GetAssociatedStoreProductsAsync(filterList);

            if (queryResult.ExtendedError == null && queryResult.Products != null)
            {
                if (queryResult.Products.TryGetValue(SuiteBundleAddOnId, out var bundleProduct))
                {
                    pBundle = bundleProduct.Price?.FormattedPrice ?? pBundle;
                }
            }
        }
        catch { }

        return (pApp, pBundle);
    }

    private static string FormatRemaining(TimeSpan span)
    {
        if (span.TotalHours >= 1.0)
        {
            return $"{(int)span.TotalHours}h {span.Minutes}m";
        }
        return $"{Math.Max(1, span.Minutes)}m";
    }

    #region WinRT Window Interop (IInitializeWithWindow)

    [ComImport]
    [Guid("3E68D4BD-7135-4D10-8018-9FB6D9F33FA1")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IInitializeWithWindow
    {
        void Initialize(IntPtr hwnd);
    }

    private static class InitializeWithWindow
    {
        public static void Initialize(object target, IntPtr hwnd)
        {
            var init = (IInitializeWithWindow)target;
            init.Initialize(hwnd);
        }
    }

    #endregion
}
