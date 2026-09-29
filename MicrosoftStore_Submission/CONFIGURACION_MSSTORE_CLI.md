# 🚀 Configuración y Publicación con Microsoft Store Developer CLI (`msstore`)

Esta guía y conjunto de configuraciones te permite interactuar y publicar los 4 módulos de **ToolTip AI** directamente desde la consola mediante la herramienta oficial de Microsoft.

---

## 📋 Proyectos Configurados y Product IDs

| Módulo | Product ID / Store ID | Paquete MSIX Oficial | Precio |
| :--- | :--- | :--- | :--- |
| **ToolTip AI (Assistant)** | `9N3D02KXKD3D` | `D:\ToolTip AI\MicrosoftStore_Submission\Package\ToolTipAIAssistant_1.1.2.0_x64.msix` | Free |
| **ToolTip AI Aura** | `9P33P1P5Z8DC` | `D:\ToolTip AI Aura\MicrosoftStore_Submission\Package\ToolTipAIAura_1.0.2.0_x64.msix` | 7.99 USD |
| **ToolTip AI Translate** | `9NQN3RZ2Z655` | `D:\ToolTip AI Translate\ToolTipAI-Translate\MicrosoftStore_Submission\Package\ToolTipAITranslate_1.0.2.0_x64.msix` | 7.99 USD |
| **ToolTip AI Voice** | `9P417GZB0FVB` | `D:\ToolTip AI Voice\MicrosoftStore_Submission\Package\ToolTipAIVoice_1.0.1.0_x64.msix` | 7.99 USD |

---

## 🛠️ Scripts Disponibles en `MicrosoftStore_Submission\Scripts`

1. **Configuración de Credenciales de Azure / Partner Center:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "d:\ToolTip AI\MicrosoftStore_Submission\Scripts\Configurar-MSStore-CLI.ps1"
   ```
   *Te pedirá el **Client Secret** de tu aplicación en Azure AD/Entra ID y verificará la conexión.*

2. **Publicador Interactivo Multi-Proyecto:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "d:\ToolTip AI\MicrosoftStore_Submission\Scripts\Publicar-Con-MSStore-CLI.ps1"
   ```
   *Permite elegir con un número (1 al 4) cuál aplicación deseas subir directamente a Microsoft Store.*

---

## 💻 Comandos Manuales Directos

### Ver información de la sesión:
```powershell
msstore info
```

### Configurar credenciales:
```powershell
msstore reconfigure --tenantId "53bb6c33-8f48-45b9-ae83-02280f5690c7" --sellerId "94193860" --clientId "0b5b3ddb-259f-4877-94d9-8a352de29d2b" --clientSecret "<TU_CLIENT_SECRET>"
```

### Consultar estado de envío de un proyecto:
```powershell
# Assistant
msstore submission status 9N3D02KXKD3D

# Aura
msstore submission status 9P33P1P5Z8DC

# Translate
msstore submission status 9NQN3RZ2Z655

# Voice
msstore submission status 9P417GZB0FVB
```

### Publicar un paquete:
```powershell
msstore publish "D:\ToolTip AI\MicrosoftStore_Submission\Package\ToolTipAIAssistant_1.1.2.0_x64.msix" --id 9N3D02KXKD3D
```
