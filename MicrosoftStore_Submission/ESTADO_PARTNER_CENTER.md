# Partner Center — estado operativo ToolTip AI (verificado en vivo 18/09/2026 · tarde)

## Lista apps (live)

| App | ID | Estado lista | Estado Overview |
|---|---|---|---|
| ToolTip AI (Assistant) | `9N3D02KXKD3D` | **Esperando lanzamiento** | **En proceso de certificación** (mod. 18/09) |
| ToolTip AI Aura | `9P33P1P5Z8DC` | **Esperando lanzamiento** | **En proceso de certificación** (mod. 18/09) |
| ToolTip AI Translate | `9NQN3RZ2Z655` | **Esperando lanzamiento** | **En proceso de certificación** (mod. 17/09) |
| ToolTip AI Voice | `9P417GZB0FVB` | **Esperando lanzamiento** | **En proceso de certificación** (mod. 18/09) · envío `1152921505701930881` · MSIX **1.0.1.0** 85.4 MB |
| Tooltip AI Win32 | `2f19281b-3d22-4767-9246-e6fe7d6e2d8a` | Se necesita atención | Borrador fallido · UI sin «Eliminar» |

**No tocar** los 4 envíos MSIX mientras certifiquen (horas–3 días hábiles). Publicación automática al superar certificación.

**Decisión de precio (usuario, 18/09 tarde):** puso **todas las apps en Free** para que Partner Center habilitara *Enviar para certificación*. Estrategia: entran gratis → luego **nuevo envío** con **7.99** en Aura/Translate/Voice (Assistant puede seguir Free de embudo). **Requisito cobro:** Ganancias → payout/tax (PayPal de la cuenta) antes o al cambiar precio.

**Aviso:** en páginas de precios en solo lectura puede seguir viéndose texto viejo de borrador («No se han configurado precios…»). Si al publicar el precio sale mal (0 / en blanco), corregir Free (Assistant) / 7.99 (Aura, Voice, Translate) en el **siguiente envío** o en Precios si queda editable.

**Voice listado:** EN Completo; ES con textos + 1 captura + logos (podría ir a cert con eso; si rechazan por capturas, subir las 4 PNG de 1920×1080 de `Store_Assets\Screenshots\`).

**Win32:** dejarlo o soporte Microsoft; no bloquea las MSIX.

**Políticas Store:** efectivas 22/10/2026.

---

# Snapshot anterior (18/09/2026 mediodía)

Fuente: Partner Center en Brave (CDP), una sola pestaña.

## Qué se hizo hoy (automatizado, misma pestaña)

| Acción | Resultado |
|---|---|
| Borrar **Tooltip AI Win32** `2f19281b-3d22-4767-9246-e6fe7d6e2d8a` | **NO POSIBLE desde la UI**: Overview *En borrador* + revisión con errores; `#draftOptions` **deshabilitado** y menú vacío (sin «Eliminar»). Subpáginas win32 redirigen a lista vacía. |
| Opciones de envío Assistant / Aura / Voice | **Guardadas**. `runFullTrust` ya tenía justificación; publicación **ASAP** al certificar. |
| IARC **Voice** | Cuestionario respondido (tipo = otros/2558 + respuestas por defecto No) + **Guardar borrador** pulsado. |
| IARC Assistant / Aura | Ya tenían clasificación generada (IARC +3 / ESRB Todos). |
| Precios base Free / 7.99 | **NO fijados**. El control `Precio base` es un `he-data-grid` vacío (web component); el `<select>` nativo solo tiene `Selecciona` / `-1` y está disabled. No hay tiers Free/7.99 en el DOM accesible. |
| Enviar a certificación | **No pulsado** — faltan precios (y Voice sigue con paquete 1.0.0.0). |
| Translate `9NQN3RZ2Z655` | **No tocado** — sigue en certificación. |

## Pendiente humano (≈2 min por app, en Brave)

Por cada borrador (Assistant, Aura, Voice):

1. **Precios y disponibilidad** → sección **Precios** → grupo **Predeterminado** → **Precio base** → elegir **Free** (Assistant) o **7.99 USD** (Aura/Voice) → guardar/aceptar en el panel.
2. Confirmar **Propiedades** = Completado y **Opciones de envío** = Completado en Overview.
3. Botón **Enviar para certificación**.

**Voice adicional:** el MSIX en el envío es `ToolTipAIVoice_1.0.0.0_x64.msix`. En disco hay **1.0.1** (ajustes + sin autoarranque). Decidir si certificas 1.0.0 o subes 1.0.1 antes.

**Win32:** dejarlo o pedir a soporte Microsoft que lo retire; la UI no ofrece delete en este estado.

**Políticas:** banner avisa políticas Store del 15/09/2026, efectivas 22/10/2026.

---

# Snapshot Partner Center (verificado en vivo 18/09/2026)

Fuente: Partner Center en Brave (CDP), Overview de cada producto. Lista apps: 5 productos.

| App | ID Store | Estado lista | Estado Overview | MSIX en envío | Secciones rotas |
|---|---|---|---|---|---|
| ToolTip AI (Assistant) | `9N3D02KXKD3D` | No enviado | **En borrador** | `ToolTipAIAssistant_1.0.4.0_x64.msix` Validated | Precios sin estado · Edades sin estado · **Opciones de envío: Incompleto** |
| ToolTip AI Aura | `9P33P1P5Z8DC` | No enviado | **En borrador** | `ToolTipAIAura_1.0.2.0_x64.msix` Validated | Precios sin estado · Edades sin estado · **Opciones de envío: Incompleto** |
| ToolTip AI Translate | `9NQN3RZ2Z655` | Esperando lanzamiento | **En proceso de certificación** (mod. 17/09) | (solo lectura durante cert) | Nada editable; publica al certificar |
| ToolTip AI Voice | `9P417GZB0FVB` | No enviado | **En borrador** | `ToolTipAIVoice_1.0.0.0_x64.msix` Validated | Precios sin estado · Edades sin estado · aviso pago/impuestos al cobrar |
| Tooltip AI Win32 | `2f19281b-…` | Se necesita atención | — | EXE/MSI legacy | Leer motivo; no bloquea MSIX |

**Aviso de políticas en banner:** Microsoft Store Policies actualizadas el 15/09/2026, efectivas el 22/10/2026.

**Corrección vs doc del 17/09:** solo Translate está en certificación. Assistant, Aura y Voice están otra vez **en borrador** (no en certificación).

---

# Snapshot anterior (17/09/2026 noche) — parcialmente obsoleto

Fuente: documentación interna + cambios locales de esa sesión.

## Web / privacidad (ya no bloquean)

| URL | Estado |
|---|---|
| `https://tooltip-ai.com/` | **Live**, cert Let's Encrypt aprobado, HTTP→HTTPS 301, `https_enforced=true` |
| `https://tooltip-ai.com/privacy` | Usar **esta** en fichas Store (ya con HTTPS) |
| `robots.txt` / `sitemap.xml` | Listos en repo; **no** priorizar SEO ahora |

## Productos en la cuenta

| Producto | ID | Precio objetivo | Notas ficha (local) |
|---|---|---|---|
| ToolTip AI Assistant | `9N3D02KXKD3D` | **Free** | Metadatos ya razonablemente honestos |
| ToolTip AI Aura | `9P33P1P5Z8DC` | **7.99 USD** | Ficha reescrita: sin “auto-arranque” como feature; opt-in |
| ToolTip AI Translate | `9NQN3RZ2Z655` | **7.99 USD** | Modelo corregido: módulo pago + BYOK |
| Tooltip AI Win32 | `2f19281b-…` | — | “Se necesita atención”; no bloquea MSIX |
| ToolTip AI Voice | **No reservado** | **7.99 USD** | Ficha 1.0.1 lista en `ToolTip AI Voice\MicrosoftStore_Submission\METADATOS_FICHA_TIENDA.md` |

## Código / paquetes listos (lado proyecto)

| Artefacto | Ruta | Estado |
|---|---|---|
| Voice 1.0.1 exe | `D:\ToolTip AI Voice\bin\Release\...` + `.staging_publish` | Compilado; ajustes; **sin autoarranque por defecto** |
| AppxManifest Voice | `.../Package/AppxManifest.xml` | Versión **1.0.1.0**, descripción honesta |
| Ficha Voice | METADATOS 1.0.1 | Sin “neural 48 kHz / WASAPI session” |
| Aura StartupManager | `TrayIcon.cs` + `App.xaml.cs` | `EnsureDefaultNoAutoStart()`; opt-in en config |
| Privacy URL recomendada | `https://tooltip-ai.com/privacy` | Sustituir la de `github.io` en submissions |

## Qué revisar EN Partner Center (página abierta)

Por cada producto MSIX:

1. **Overview / Submission** — ¿sigue “En proceso de certificación” o ya hay resultado (Publicada / Rechazada / Acción requerida)?
2. **Pricing and availability** — Assistant = Free; Aura/Translate = 7.99; trial 7 días si está disponible.
3. **Store listings → Español** — pegar textos de METADATOS locales **sin claims viejos**.
4. **Properties** — Privacy policy URL → `https://tooltip-ai.com/privacy`.
5. **Packages** — versión del MSIX en envío vs 1.0.1 de Voice (Voice aún no está en cuenta).
6. **Payout account / Payment and tax info** — email PayPal **de la cuenta**, no paypal.me. **Bloqueante para cobrar módulos.**
7. Win32 “se necesita atención” — leer motivo; archivar si solo quieres canal MSIX.

## Orden de monetización (coherente con el plan)

1. Payout configurado  
2. Resultado de certificación de los 3 MSIX  
3. Corregir listings con textos honestos si aún no se pegaron  
4. **Reservar** `ToolTip AI Voice` + subir **1.0.1.0** + ficha nueva + 7.99  
5. Venta directa fundador Voice mientras Store certifica (fuera de Store, vía PayPal)

## Truth audit — claims que NO deben aparecer en Store

| Prohibido en ficha | Por qué |
|---|---|
| “Neural HD 48 kHz” | El TTS es SAPI/Windows |
| “WASAPI -18 dB de sesión” sin matices | 1.0.0 era stub; 1.0.1 es atenuación de **endpoint** |
| “<1.2 ms / 0 GC / 18 MB” en módulos Voice/Aura | Eso es marketing de la landing del núcleo, no del módulo |
| “Multi-IA” en Voice | Voice **no** usa IA para el núcleo |
| “Se inicia siempre con Windows” | Política: **opt-in**, default off |
| “Privacidad absoluta” | Solo: clave DPAPI local + texto al proveedor que el usuario configura |

## Pendientes solo del lado humano (Partner Center)

- [ ] Confirmar estados de certificación en la UI  
- [ ] Payout PayPal email  
- [ ] Precios Free / 7.99  
- [ ] Pegar fichas honestas si los listings aún dicen lo antiguo  
- [ ] Privacy URL HTTPS  
- [ ] Reservar Voice cuando el MSIX 1.0.1 esté firmado para Store  
