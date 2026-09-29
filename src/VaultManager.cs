using System;
using System.Security.Cryptography;
using System.Text;

namespace TeachMeAI;

public static class VaultManager
{
    private static readonly byte[] OptionalEntropy = Encoding.UTF8.GetBytes("TeachMeAI.Vault.Entropy.v1");

    public static string EncryptSecret(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return string.Empty;

        try
        {
            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            byte[] encryptedBytes = ProtectedData.Protect(
                plainBytes,
                OptionalEntropy,
                DataProtectionScope.CurrentUser
            );
            return Convert.ToBase64String(encryptedBytes);
        }
        catch
        {
            return string.Empty;
        }
    }

    /// <summary>
    /// Decrypts a DPAPI-protected secret. Returns null if the value is not valid ciphertext
    /// (callers should treat that as "no key stored").
    /// </summary>
    public static string? TryDecryptSecret(string cipherText)
    {
        if (string.IsNullOrWhiteSpace(cipherText)) return null;

        try
        {
            byte[] encryptedBytes = Convert.FromBase64String(cipherText);
            byte[] plainBytes = ProtectedData.Unprotect(
                encryptedBytes,
                OptionalEntropy,
                DataProtectionScope.CurrentUser
            );
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// One-shot migration for legacy plaintext keys (pre-DPAPI configs).
    /// Returns the plaintext so the caller can re-encrypt and rewrite settings immediately.
    /// </summary>
    public static bool TryMigrateLegacyPlaintext(string storedValue, out string plainText)
    {
        plainText = string.Empty;
        if (string.IsNullOrWhiteSpace(storedValue)) return false;

        if (storedValue.StartsWith("AIzaSy", StringComparison.Ordinal) ||
            storedValue.StartsWith("AQ.", StringComparison.Ordinal))
        {
            plainText = storedValue;
            return true;
        }

        return false;
    }
}
