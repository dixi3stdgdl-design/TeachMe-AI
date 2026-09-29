# Diseño de apps — al nivel del render

## Respuesta corta
**Sí, se puede.** El render de marketing usa vidrio 3D + cintas de luz. En WPF nativo eso se aproxima con:

| Del render | En WPF |
|---|---|
| Vidrio esmerilado | `Glass.Panel` + `DropShadow` + bordes hairline |
| Borde especular | `Glass.Edge` (gradiente teal→sky) |
| Cintas de luz | `Brand.Ribbon` en acentos, progreso, CTAs |
| Glow | `DropShadow` coloreado en botones primarios |
| Tipografía | Segoe UI Variable Display/Text |
| Fondo profundo | `#04060A` / `#0A0F18` (mismos tokens que la web) |

**No se puede (y no hace falta):** raytracing 3D real dentro de la ventana. El *feel* premium viene de luz + contraste + espaciado, no de un motor 3D.

## Tokens
`src/Theme.Premium.xaml` (copiado a Aura, Voice, Translate)

- Colores: `Brand.Teal #2DD4BF`, `Sky #38BDF8`, `Violet #A78BFA`
- Superficies: `Glass.Panel`, `Glass.Edge`, `Surface.0/1/2`
- Botones: `Button.Primary` (shine + glow), `Button.Ghost`
- Texto: `Text.Display / Title / Body / Caption`
- Radios: `Radius.Panel 18`, `Card 12`, `Pill 999`

## Ya aplicado
- Assistant `HudWindow` chassis → glass + edge premium

## Siguiente (por ventana, de más visible a menos)
1. `MainWindow` (dashboard Assistant)
2. `TranslateTooltipWindow` + `TranslateOverlayWindow`
3. `VoiceHudWindow` + `SettingsWindow`
4. `HudWindow` de Aura
5. Iconografía: sustituir emojis por path icons (más "producto")

## Regla
Cada ventana que se toque debe **compilar** y verse coherente con tooltip-ai.com.
