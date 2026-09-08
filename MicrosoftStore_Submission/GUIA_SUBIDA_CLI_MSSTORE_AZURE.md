# ⚡ Guía: Publicar TeachMe AI por Línea de Comandos con MSStore CLI y Azure

La herramienta oficial de Microsoft para publicar aplicaciones en la **Microsoft Store** desde la terminal es **Microsoft Store Developer CLI (`msstore`)**.

Debido a que Microsoft Partner Center utiliza **Azure Active Directory (Azure Entra ID)** para la autenticación segura de APIs, se requiere vincular una aplicación de Azure para poder subir paquetes automáticamente.

Esta guía te muestra cómo obtener tus 4 credenciales en menos de 2 minutos y ejecutar la subida con un solo script.

---

## 🔑 Paso 1: Obtener las Credenciales de Azure y Partner Center

1. Inicia sesión en **[Microsoft Partner Center](https://partner.microsoft.com/dashboard)** con tu cuenta de desarrollador.
2. Haz clic en el icono de **Engranaje (Configuración)** en la esquina superior derecha > **Configuración de la cuenta (Account settings)**.
3. En el menú lateral izquierdo, haz clic en **Administración de usuarios (User management)** > pestaña **Aplicaciones de Azure AD (Azure AD applications)**.
4. Haz clic en **Crear aplicación de Azure AD** (o selecciona una existente).
   - Asigna un nombre como: `TeachMeAI-Publisher-CLI`.
   - Selecciona el rol: `Manager` o `Developer`.
5. En la pantalla de la aplicación verás inmediatamente:
   * **Tenant ID (Id. de inquilino de Azure AD):** Un GUID largo como `12345678-abcd-1234-abcd-1234567890ab`.
   * **Client ID (Id. de cliente de aplicación):** Otro GUID como `87654321-dcba-4321-dcba-ba0987654321`.
6. En esa misma pantalla, en la sección **Claves (Keys)**, haz clic en **Agregar nueva clave (Add new key)**:
   * Selecciona duración (ej. 1 año o 2 años) y pulsa **Agregar**.
   * Copia el valor generado: ese es tu **Client Secret**. *(Cópialo ahora, no se volverá a mostrar).*
7. Por último, en el menú izquierdo ve a **Perfil de la organización (Organization profile)** o **Legal**:
   * Copia tu **Seller ID** (número de identificación de vendedor / cuenta).

---

## 🚀 Paso 2: Ejecutar la Publicación Automática desde la Terminal

Ya hemos dejado instalado `MSStore.exe` en tu equipo y preparado el script interactivo.

1. Abre una terminal de PowerShell en esta carpeta:
   ```powershell
   cd "d:\TeachMe AI\MicrosoftStore_Submission\Scripts"
   .\Publicar-Con-MSStore-CLI.ps1
   ```
2. El script te solicitará por única vez:
   * `Tenant ID`
   * `Seller ID`
   * `Client ID`
   * `Client Secret`
3. Una vez autenticado, consultará automáticamente tu lista de aplicaciones en Microsoft Store y te pedirá el **Product ID** de TeachMe AI (ejemplo: `9NXXXXXXXXXX`).
4. La herramienta subirá `TeachMeAI_1.0.0.0_x64.msix` directamente a los servidores de Microsoft Store y creará el nuevo envío para certificación.

---

## 💻 Comandos Manuales de MSStore CLI (Referencia Rápida)

Si prefieres ejecutar los comandos manualmente:

```powershell
# 1. Configurar credenciales de Azure / Partner Center:
msstore reconfigure --tenantId "<TU_TENANT_ID>" --sellerId "<TU_SELLER_ID>" --clientId "<TU_CLIENT_ID>" --clientSecret "<TU_CLIENT_SECRET>"

# 2. Ver la informacion de conexion:
msstore info

# 3. Listar las aplicaciones en tu cuenta:
msstore apps list

# 4. Publicar el paquete MSIX a la tienda:
msstore publish "d:\TeachMe AI\MicrosoftStore_Submission\Package\TeachMeAI_1.0.0.0_x64.msix" --id "<TU_PRODUCT_ID>"
```
