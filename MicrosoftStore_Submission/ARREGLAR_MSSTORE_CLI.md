# Arreglo de `msstore` CLI (rota por Antigravity/Gemini)

## Estado 25/09/2026 (sesión con MiMo)

**Hecho:**
- App Entra nueva `MSStoreCLI-ToolTipAI-Partner` = `cf17dc6b-abb1-4f6c-9c92-27ee2f524c04`
- Secret generado y CLI reconfigurada (`msstore info` la muestra)
- Usuario member `msstore-admin@DIxStdGdlhotmail.onmicrosoft.com` (Global Admin Entra + Partner Center)
- Sesión Entra en Partner Center abierta en Edge

**Sigue fallando:** `msstore apps list` → `A valid account could not be found with given authorization token`

**Causa raíz (código msstore-cli):** falta en Partner Center  
**User management → Microsoft Entra applications → Add Microsoft Entra Application → app `MSStoreCLI-ToolTipAI-Partner` → rol Manager(Windows)**.

Esa pestaña (hash `#apps`) está oculta si `hasDeveloperPrograms()` es false. En Programs sale «Windows – Register as an app developer».

**CLI actual:**
```text
TenantId  = 53bb6c33-8f48-45b9-ae83-02280f5690c7
SellerId  = 94193860
ClientId  = cf17dc6b-abb1-4f6c-9c92-27ee2f524c04
```
Secret: `%TEMP%\partner_secret.txt`

**Paso pendiente (~2 min):** abrir `https://partner.microsoft.com/dashboard/account/v3/usermanagement#apps` y añadir la app con Manager. Si no hay pestaña, inscribir programa Windows app developer o usar la cuenta que ya lo tiene.

---

**Fecha:** 24/09/2026  
**Síntoma:** cualquier comando (`apps list`, `submission status`…) devuelve:

```text
{"code":"Unauthorized","message":"A valid account could not be found with given authorization token"}
```

**Diagnóstico real:** el token de Azure se emite bien. Partner Center **no reconoce** esa aplicación como vinculada a la cuenta del vendedor. No era «secret caducado».

## Qué rompió Gemini

| Paso incorrecto | Detalle |
|---|---|
| Usó la app AAD `0b5b3ddb-259f-4877-94d9-8a352de29d2b` | Creada por **Azure DevOps Service Connection**, no desde Partner Center |
| `msstore reconfigure` con ese clientId | Guarda credenciales, pero **no** da de alta la app en la cuenta Store |
| Conclusión «secret caducado» | Falso: hay secretos válidos (2026–2028) y aun así falla |
| También se probó `82c01b3d-…` | Mismo Unauthorized: ninguna está vinculada |

Config actual en  
`%LOCALAPPDATA%\Packages\Microsoft.MicrosoftStoreCLI_8wekyb3d8bbwe\LocalCache\Local\Microsoft\MSStore.CLI\settings.json`:

```json
{"SellerId":94193860,"TenantId":"53bb6c33-8f48-45b9-ae83-02280f5690c7","ClientId":"0b5b3ddb-259f-4877-94d9-8a352de29d2b"}
```

## Arreglo (obligatorio, ~5 min)

El vínculo solo se hace en la **web de Partner Center**. La CLI no puede auto-vincularse.

1. Entrar en [Partner Center](https://partner.microsoft.com/dashboard) → **Configuración de cuenta** → **Administración de usuarios**.
2. **Importante:** hace falta «Iniciar sesión con **Microsoft Entra ID**» (no vale solo la sesión MSA `DIxStdGdl@hotmail.com`).  
   - Tenant: `DIxStdGdlhotmail.onmicrosoft.com` (`53bb6c33-8f48-45b9-ae83-02280f5690c7`).  
   - Usuario Entra: `DIxStdGdl_hotmail.com#EXT#@DIxStdGdlhotmail.onmicrosoft.com` (invitado).  
   - Si esa cuenta no deja gestionar usuarios, hay que usar el **admin global** del tenant o crear un usuario member.
3. Pestaña **Aplicaciones de Azure AD** → **Crear nueva aplicación** (o *Agregar* si permite pegar un Application ID existente).  
   - Nombre sugerido: `MSStoreCLI-ToolTipAI`  
   - Rol: **Manager**
4. Copiar el **Client ID** nuevo y crear una **clave (Client Secret)** en esa misma pantalla (1–2 años). Guardar el valor al instante.
5. Reconfigurar la CLI:

```powershell
msstore reconfigure `
  --tenantId "53bb6c33-8f48-45b9-ae83-02280f5690c7" `
  --sellerId "94193860" `
  --clientId "<NUEVO_CLIENT_ID_DE_PARTNER_CENTER>" `
  --clientSecret "<NUEVO_CLIENT_SECRET>"
```

6. Verificar:

```powershell
msstore info
msstore apps list          # debe listar las 4 apps ToolTip AI
msstore submission status 9N3D02KXKD3D
msstore submission status 9NQN3RZ2Z655
```

Si `apps list` sigue devolviendo «Unauthorized» / «no Managed apps», el paso 2–3 no se completó: la app sigue sin estar en Partner Center.

## No volver a hacer

- No reutilizar la app de Azure DevOps `0b5b3ddb-…` para Store.
- No regenerar secretos a ciegas sin vincular primero en Partner Center.
- No publicar/reescribir docs con credenciales en claro.

## Estado de producto (24/09/2026)

| App | ID | Estado |
|---|---|---|
| ToolTip AI | `9N3D02KXKD3D` | En proceso de certificación (reenvío 24/09) |
| ToolTip AI Translate | `9NQN3RZ2Z655` | En proceso de certificación (reenvío 24/09) |

La CLI sigue sin poder leerlos hasta el arreglo de arriba; el estado se comprobó en Partner Center web.


---

## Cierre 25/09/2026 noche — pendientes

- **Aura 10.1.2.10 / 10.5.1:** crash corregido en código + MSIX `ToolTipAIAura_1.0.3.0_x64.msix` listo. Privacy URL correcta: `https://tooltip-ai.com/privacy`.
- **Subir paquete** en Partner Center (Packages daba FaultCode undefined).
- **Opciones de envío** Aura y Voice → completar.
- **Reenviar** Aura y Voice a certificación.
- **CLI:** Add Microsoft Entra Application con sesión sellerId=94193860.
- Build con `--no-restore` (restore NuGet roto: path1 null).
