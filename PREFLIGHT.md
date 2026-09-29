# PREFLIGHT — gate de envío a Microsoft Store

**Ninguna app se envía a certificación si este gate no está en verde.**
Aplica a: Assistant · Aura · Voice · Translate.

Si algo falla → **se arregla o se para**. No se “reenvía para probar suerte”.
Eso es lo que ha costado 4 rechazos.

---

## 1. Identidad y versión (bloqueante)

| # | Comprobación | Cómo se verifica |
|---|---|---|
| 1.1 | `Version` del csproj = `Version` del AppxManifest = número en el nombre del `.msix` | Comparar los tres strings; deben ser **idénticos** |
| 1.2 | `Identity Name` = el reservado en Partner Center | `Dixi3Lqbs.ToolTipAI…` |
| 1.3 | `DisplayName` del manifest = nombre comercial de la ficha | Sin renombres de última hora |
| 1.4 | `Executable` existe en el paquete | Coincide con el ensamblado publicado |

**Hoy (28/09/2026, tras sincronizar):**

| App | Versión canónica | MSIX |
|---|---|---|
| Assistant | 1.1.3.0 | `ToolTipAIAssistant_1.1.3.0_x64.msix` |
| Aura | 1.0.3.0 | `ToolTipAIAura_1.0.3.0_x64.msix` |
| Voice | 1.0.2.0 | `ToolTipAIVoice_1.0.2.0_x64.msix` |
| Translate | 1.1.2.0 | `ToolTipAITranslate_1.1.2.0_x64.msix` |

## 2. Metadatos = producto real (bloqueante · política 10.1.1.3)

| # | Comprobación |
|---|---|
| 2.1 | Capturas = UI real del binario (no mockups, no logos de terceros) |
| 2.2 | Atajos y textos de la captura = código (`Ctrl+Shift+A`, etc.) |
| 2.3 | Sin claims no verificables (“privacidad absoluta”, “&lt;40 MB”, “neural”) |
| 2.4 | Descripción ES/EN sale de `METADATOS_FICHA_TIENDA.md` de **esa misma app** |
| 2.5 | Nada copiado de otra app de la suite (Aura no es “lector de voz”) |

## 3. URLs (bloqueante)

| # | Comprobación |
|---|---|
| 3.1 | Privacy URL = `https://tooltip-ai.com/privacy` (HTTPS, no github.io) |
| 3.2 | Esa URL responde **200** el día del envío |
| 3.3 | Ninguna ruta local (`D:\…`) en textos de ficha ni en el generador de assets |

## 4. Paquete (bloqueante)

| # | Comprobación |
|---|---|
| 4.1 | 1 solo `.msix` versionado en `MicrosoftStore_Submission/Package/` |
| 4.2 | Ese MSIX es el que está adjunto en Partner Center |
| 4.3 | Certificado de prueba no necesario para el envío Store (solo side-load) |

## 5. Partner Center (bloqueante)

| # | Comprobación |
|---|---|
| 5.1 | Todas las secciones del submission en **Completo** |
| 5.2 | IARC / edades generadas |
| 5.3 | Opciones de envío: `runFullTrust` con justificación |
| 5.4 | Precios y payout (PayPal) configurados si hay importe |
| 5.5 | Nota al revisor preparada si se corrigió un rechazo previo |

---

## Orden de trabajo (obligatorio)

```text
1. Cambios de código / UI
2. Build + 1 MSIX en Package/
3. Capturas de ESA versión
4. Actualizar METADATOS de ESA app
5. Pasar este PREFLIGHT entero
6. Solo entonces: Partner Center → Enviar
```

## Definición de fracaso

- Reenviar “por si acaso” sin cerrar 1.x → **fracaso de proceso**
- Dejar `[ ]` en el checklist “porque luego se ve” → **fracaso de proceso**
- Confundir apps de la suite en metadatos → **fracaso de proceso** (10.1.1.3)

El gate existe para que **Microsoft ya no tenga cosas sin sentido que corregir**.
