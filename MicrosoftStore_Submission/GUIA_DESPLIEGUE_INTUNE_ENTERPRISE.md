# Guía de Despliegue Corporativo (Microsoft Intune) — Tooltip-ai Suite

Esta guía detalla los pasos para que los administradores de sistemas e IT puedan desplegar masivamente la suite **Tooltip-ai** (`TooltipAI.msix` / `ToolTipAIAssistant.msix`) en entornos corporativos de Windows 10 y Windows 11 utilizando **Microsoft Intune** (Microsoft Endpoint Manager).

---

## 1. Requisitos Previos

1. **Paquete MSIX:** Tener el paquete `.msix` compilado (ubicado en `MicrosoftStore_Submission/Package/` o `downloads/`).
2. **Certificado de Firma:**
   - Si se despliega vía **Microsoft Store for Business / Intune Store App**, no requiere certificado adicional.
   - Si se despliega como **LOB (Line-of-Business) App** privada, el certificado (Sectigo, DigiCert o certificado raíz de dominio Active Directory/CA interna) debe estar instalado en los dispositivos en el almacén *Trusted People* (Personas de confianza) o *Trusted Root Certification Authorities*.
3. **Licencia Corporativa:** Asignación de licencias de volumen (BYOK corporativo o paquete Team/Enterprise).

---

## 2. Pasos para Agregar la App en Microsoft Intune

1. Iniciar sesión en el portal de [Microsoft Intune Admin Center](https://intune.microsoft.com/).
2. Ir a **Apps** > **Windows** > **Add**.
3. En **App type**, seleccionar **Line-of-business app** (App de línea de negocio).
4. Hacer clic en **Select app package file** y subir `ToolTipAIAssistant.msix` o `TooltipAI.msix`.
5. **Información de la App:**
   - **Name:** `Tooltip-ai Enterprise Inspector`
   - **Description:** `Inspector neural de pantalla de ultra-baja latencia (<1.2ms) y privacidad local (Zero-GC, ~18MB RAM).`
   - **Publisher:** `Dixi3 Labs`
   - **Category:** `Productivity / IT Tools`
6. **Asignaciones (Assignments):**
   - Asignar a los grupos de seguridad corporativos correspondientes (**Required** para instalación automática o **Available for enrolled devices** para la Company Portal).
7. Guardar y desplegar.

---

## 3. Configuración de Políticas de Privacidad y BYOK Corporativo

Tooltip-ai no utiliza servidores intermedios de captura ni realiza telemetría de pantalla a terceros. La configuración de las claves de API (OpenAI, Gemini, Azure) se puede realizar de forma centralizada o por usuario usando variables de entorno o registro cifrado con **DPAPI**.

### Registro/Parámetros Sugeridos (vía PowerShell Script de Intune):
```powershell
# Inyección de configuración B2B / BYOK corporativo
New-Item -Path "HKCU:\Software\TooltipAI" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\Software\TooltipAI" -Name "EnterpriseMode" -Value 1
Set-ItemProperty -Path "HKCU:\Software\TooltipAI" -Name "TelemetryDisabled" -Value 1
```

---

## 4. Contacto y Licenciamiento por Volumen
Para licencias Enterprise, facturación única y soporte prioritario B2B:
- **Correo:** `dixstdgdl3@gmail.com`
- **Web:** `https://tooltip-ai.com/`
- **Pasarela de pago B2B / Licencias:** `https://www.paypal.com/ncp/payment/HPDSLDCAGVHFL`
