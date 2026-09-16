#!/usr/bin/env python3
"""
Capturas Microsoft Store — ToolTip AI (fieles a la UI WPF real).

Política 10.1.1.3:
- UI = MainWindow.xaml (cápsula) + HudWindow.xaml (HUD morado)
- Atajos reales Ctrl+Shift+A / D / C
- Versión 1.0.3.0
- Sin claims falsos ni branding inventado en inglés
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BG_TOP = (5, 8, 18)
BG_BOT = (12, 21, 40)
CAPSULE_BG = (5, 10, 20, 170)
CAPSULE_BORDER = (0, 245, 160, 140)
GREEN = (0, 245, 160)
CYAN = (56, 189, 248)
PURPLE = (168, 85, 247)
PURPLE_SOFT = (216, 180, 254)
WHITE = (255, 255, 255)
SLATE = (148, 163, 184)
SLATE_DIM = (100, 113, 137)
TEXT = (226, 232, 240)
RED = (244, 63, 94)
AMBER = (245, 158, 11)
PANEL = (8, 14, 28, 235)
HUD_BG = (5, 10, 20, 220)
ADVICE_BG = (8, 14, 28, 220)
WIN_PANEL = (24, 30, 42)
WIN_HEADER = (32, 38, 52)

W, H = 1920, 1080
OUT = Path(r"D:\ToolTip AI\MicrosoftStore_Submission\Store_Assets\Screenshots")


def _t(*names: str, size: int = 16):
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


# Prefer Segoe UI Emoji so symbols render; fall back to text-only if missing.
F_EMOJI = _t("seguiemj.ttf", "Segoe UI Emoji", size=16)
F_TITLE = _t("segoeuib.ttf", size=40)
F_SUB = _t("segoeui.ttf", size=22)
F_HUD_TITLE = _t("segoeuib.ttf", size=20)
F_HUD_BODY = _t("segoeui.ttf", size=17)
F_HUD_SMALL = _t("segoeui.ttf", size=13)
F_HUD_BOLD = _t("segoeuib.ttf", size=13)
F_CAP = _t("segoeuib.ttf", size=17)
F_CAP_SM = _t("segoeui.ttf", size=13)
F_CAP_XS = _t("segoeui.ttf", size=11)
F_WIN = _t("segoeui.ttf", size=20)
F_WIN_SM = _t("segoeui.ttf", size=16)
F_BADGE = _t("segoeuib.ttf", size=15)
F_MONO = _t("consola.ttf", size=14)


def rrect(d, box, radius, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def caption(d, title: str, subtitle: str):
    d.rectangle((90, 48, 180, 52), fill=GREEN)
    d.text((90, 64), title, font=F_TITLE, fill=GREEN)
    d.text((90, 118), subtitle, font=F_SUB, fill=SLATE)


def make_desktop() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (W, H), (*BG_TOP, 255))
    d0 = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(H - 1, 1)
        r = int(BG_TOP[0] + (BG_BOT[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOT[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOT[2] - BG_TOP[2]) * t)
        d0.line([(0, y), (W, y)], fill=(r, g, b, 255))

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-220, -180, 680, 620), fill=(0, 245, 160, 16))
    gd.ellipse((1240, 280, 2140, 1120), fill=(56, 189, 248, 14))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.alpha_composite(glow)

    # taskbar
    taskbar = Image.new("RGBA", (W, 52), (16, 18, 26, 235))
    td = ImageDraw.Draw(taskbar)
    cx = W // 2
    for i, col in enumerate([(70, 110, 190), (70, 130, 190), (50, 160, 120), (110, 90, 180)]):
        x = cx - 130 + i * 48
        td.rounded_rectangle((x, 10, x + 30, 42), radius=6, fill=(*col, 220))
    td.text((W - 120, 14), "10:24", font=F_HUD_SMALL, fill=(*TEXT, 255))
    td.text((W - 120, 30), "14/09/2026", font=F_HUD_SMALL, fill=(*SLATE, 255))
    img.alpha_composite(taskbar, (0, H - 52))
    return img, ImageDraw.Draw(img, "RGBA")


def draw_capsule(d, xy=(700, 24), expanded: bool = False):
    x, y = xy
    w = 520
    h = 168 if expanded else 54
    rrect(d, (x + 2, y + 4, x + w + 2, y + h + 4), 28, (0, 0, 0, 140))
    rrect(d, (x, y, x + w, y + h), 28, CAPSULE_BG, CAPSULE_BORDER, 2)

    d.text((x + 18, y + 15), "ToolTip AI", font=F_CAP, fill=GREEN)
    rrect(d, (x + 130, y + 16, x + 205, y + 38), 8, (37, 56, 189, 200), (*CYAN, 180), 1)
    d.text((x + 140, y + 20), "Windows", font=F_CAP_XS, fill=CYAN)

    rrect(d, (x + 215, y + 14, x + 315, y + 40), 12, (20, 28, 42, 220), (255, 255, 255, 30), 1)
    d.ellipse((x + 225, y + 24, x + 235, y + 34), fill=SLATE_DIM)
    d.text((x + 243, y + 20), "Radar: OFF", font=F_CAP_XS, fill=SLATE)

    rrect(d, (x + 325, y + 14, x + 470, y + 40), 12, GREEN)
    d.text((x + 338, y + 18), "Recortar", font=F_CAP_SM, fill=(4, 8, 16))
    d.text((x + 400, y + 20), "Ctrl+Shift+A", font=F_CAP_XS, fill=(22, 56, 40))

    d.text((x + 488, y + 16), "▾", font=F_CAP_SM, fill=CYAN)
    d.text((x + 508, y + 16), "✕", font=F_CAP_SM, fill=RED)

    if expanded:
        y0 = y + 58
        d.line([(x + 14, y0), (x + w - 14, y0)], fill=(255, 255, 255, 28), width=1)
        items = [
            ("Pantalla", CYAN),
            ("Portapapeles", GREEN),
            ("Panel HUD", TEXT),
            ("Ajustes", AMBER),
        ]
        bw = (w - 40) // 4
        for i, (label, col) in enumerate(items):
            bx = x + 14 + i * (bw + 4)
            rrect(d, (bx, y0 + 10, bx + bw, y0 + 46), 8, (26, 31, 46, 230), (255, 255, 255, 30), 1)
            d.text((bx + 12, y0 + 20), label, font=F_HUD_SMALL, fill=col)
        d.text(
            (x + 36, y0 + 60),
            "Ctrl+Shift+A Recortar   •   Ctrl+Shift+D Radar   •   Ctrl+Shift+C Ajustes",
            font=F_HUD_SMALL,
            fill=SLATE_DIM,
        )


def draw_windows_dialog(d, xy=(380, 300), error: bool = False):
    x, y = xy
    w, h = (560, 300) if error else (520, 240)
    rrect(d, (x, y, x + w, y + h), 10, (*WIN_PANEL, 245), (70, 80, 100, 200), 1)
    rrect(d, (x, y, x + w, y + 40), 10, (*WIN_HEADER, 255))
    d.rectangle((x, y + 30, x + w, y + 40), fill=(*WIN_HEADER, 255))
    d.text((x + 16, y + 10), "Windows Update" if not error else "Error del sistema", font=F_WIN_SM, fill=TEXT)
    d.text((x + w - 78, y + 10), "—  □  ✕", font=F_WIN_SM, fill=SLATE)

    if not error:
        d.text((x + 24, y + 60), "Actualización disponible", font=F_WIN, fill=WHITE)
        d.text((x + 24, y + 100), "Hay una actualización acumulativa lista.", font=F_WIN_SM, fill=SLATE)
        rrect(d, (x + 24, y + 150, x + 220, y + 190), 6, (0, 120, 212))
        d.text((x + 48, y + 160), "Actualizar y reiniciar", font=F_WIN_SM, fill=WHITE)
        rrect(d, (x + 240, y + 150, x + 380, y + 190), 6, (45, 50, 62), (90, 100, 120), 1)
        d.text((x + 270, y + 160), "Más tarde", font=F_WIN_SM, fill=TEXT)
    else:
        d.text((x + 24, y + 60), "Acceso denegado: 0x80070005", font=F_WIN, fill=(252, 165, 165))
        body = (
            "El instalador intentó modificar una clave del\n"
            "registro protegida (HKLM\\Software\\Policies).\n\n"
            "Se requiere elevación UAC para continuar."
        )
        d.multiline_text((x + 24, y + 105), body, font=F_WIN_SM, fill=TEXT, spacing=6)
        rrect(d, (x + 24, y + h - 60, x + 120, y + h - 24), 6, (0, 120, 212))
        d.text((x + 48, y + h - 50), "Reintentar", font=F_WIN_SM, fill=WHITE)
        rrect(d, (x + 140, y + h - 60, x + 240, y + h - 24), 6, (45, 50, 62), (90, 100, 120), 1)
        d.text((x + 168, y + h - 50), "Cancelar", font=F_WIN_SM, fill=TEXT)


def draw_hud(
    d,
    xy=(1180, 240),
    title: str = "Actualizar y reiniciar ahora",
    advice: str = "",
    summary: str = "",
    consequences: str = "",
):
    """HUD vertical fiel a HudWindow.xaml (borde morado, tarjeta consejo, pestañas)."""
    x, y = xy
    w, h = 400, 580
    rrect(d, (x + 3, y + 6, x + w + 3, y + h + 6), 18, (0, 0, 0, 160))
    rrect(d, (x, y, x + w, y + h), 18, HUD_BG, (*PURPLE, 220), 2)

    # domain badge
    rrect(d, (x + 14, y + 12, x + 200, y + 36), 5, (48, 168, 85, 200), (*PURPLE, 180), 1)
    d.text((x + 22, y + 16), "WINDOWS // SISTEMA", font=F_HUD_SMALL, fill=PURPLE_SOFT)

    # window controls (texto, sin emoji)
    d.text((x + w - 70, y + 14), "↔  ✕", font=F_HUD_SMALL, fill=SLATE)

    # title
    d.text((x + 14, y + 44), title, font=F_HUD_TITLE, fill=WHITE)

    # chips
    rrect(d, (x + 14, y + 74, x + 118, y + 96), 4, (255, 255, 255, 24), (255, 255, 255, 36), 1)
    d.text((x + 22, y + 78), "explorer.exe", font=F_HUD_SMALL, fill=TEXT)
    rrect(d, (x + 126, y + 74, x + 230, y + 96), 4, (20, 28, 42, 220), (255, 255, 255, 36), 1)
    d.ellipse((x + 134, y + 80, x + 144, y + 90), fill=GREEN)
    d.text((x + 150, y + 78), "Verificado", font=F_HUD_SMALL, fill=(203, 213, 225))
    d.text((x + 236, y + 78), "• 99.8%", font=F_HUD_SMALL, fill=SLATE_DIM)

    # advice card
    rrect(d, (x + 14, y + 108, x + w - 14, y + 220), 10, ADVICE_BG, (80, 168, 85, 200), 2)
    d.text((x + 24, y + 118), "CONSEJO TÁCTICO DEL MAESTRO", font=F_HUD_BOLD, fill=PURPLE)
    d.multiline_text((x + 24, y + 142), advice, font=F_HUD_BODY, fill=WHITE, spacing=5)

    # tabs
    tabs = ["Qué es", "Specs", "Preguntar"]
    tx = x + 14
    for i, t in enumerate(tabs):
        selected = i == 0
        bw = 100
        rrect(
            d,
            (tx, y + 232, tx + bw, y + 258),
            6,
            (48, 32, 53, 255) if selected else (26, 13, 21, 255),
            (*CYAN, 180) if selected else (255, 255, 255, 30),
            1,
        )
        d.text((tx + 12, y + 237), t, font=F_HUD_SMALL, fill=WHITE if selected else SLATE)
        tx += bw + 6

    # body
    d.text((x + 14, y + 272), "RESUMEN DIDÁCTICO", font=F_HUD_BOLD, fill=SLATE)
    d.multiline_text((x + 14, y + 292), summary, font=F_HUD_BODY, fill=WHITE, spacing=5)
    d.text((x + 14, y + 400), "CONSECUENCIAS & IMPACTO", font=F_HUD_BOLD, fill=SLATE)
    d.multiline_text((x + 14, y + 420), consequences, font=F_HUD_BODY, fill=TEXT, spacing=5)

    # footer
    d.text((x + 14, y + h - 28), "Ctrl+Shift+A  Recortar  •  Ctrl+Shift+D  Radar", font=F_HUD_SMALL, fill=SLATE_DIM)
    d.text((x + w - 88, y + h - 28), "Recortar", font=F_HUD_SMALL, fill=CYAN)


def save(img: Image.Image, name: str):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    final = Image.new("RGB", (W, H), BG_TOP)
    final.paste(img.convert("RGB"), (0, 0))
    final.save(path, "PNG", optimize=True)
    print(f"OK  {path.name}  {final.size[0]}x{final.size[1]}  {path.stat().st_size} bytes")


def shot1():
    img, d = make_desktop()
    caption(
        d,
        "ToolTip AI — HUD cognitivo en acción",
        "Explica botones y diálogos de Windows con IA didáctica (Gemini con tu propia clave)",
    )
    draw_windows_dialog(d, (360, 320), error=False)
    d.rounded_rectangle((380, 460, 610, 510), radius=8, outline=GREEN, width=3)
    draw_capsule(d, (700, 180), expanded=False)
    draw_hud(
        d,
        (1160, 230),
        title="Actualizar y reiniciar ahora",
        advice=(
            "Botón oficial de Windows Update.\n"
            "Aplica parches de seguridad acumulativos.\n"
            "Los archivos personales permanecen intactos."
        ),
        summary=(
            "Aplica la actualización acumulativa de Windows 11\n"
            "con mejoras de seguridad y estabilidad oficiales."
        ),
        consequences=(
            "• Datos personales: intactos\n"
            "• Reinicio: puede requerirse al terminar\n"
            "• Punto de restauración disponible"
        ),
    )
    save(img, "Screenshot_1_HUD_Inspection.png")


def shot2():
    img, d = make_desktop()
    caption(
        d,
        "Recorte global con Ctrl+Shift+A",
        "Congela la pantalla y analiza el área que selecciones; no interfiere con Seleccionar todo",
    )
    draw_windows_dialog(d, (620, 300), error=False)

    # dim only outside selection
    sel = (560, 270, 1200, 580)
    outside = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(outside)
    od.rectangle((0, 0, W, sel[1]), fill=(0, 0, 0, 120))
    od.rectangle((0, sel[3], W, H), fill=(0, 0, 0, 120))
    od.rectangle((0, sel[1], sel[0], sel[3]), fill=(0, 0, 0, 120))
    od.rectangle((sel[2], sel[1], W, sel[3]), fill=(0, 0, 0, 120))
    img.alpha_composite(outside)
    d = ImageDraw.Draw(img, "RGBA")

    d.rectangle(sel, outline=GREEN, width=3)
    for hx, hy in [(sel[0], sel[1]), (sel[2], sel[1]), (sel[0], sel[3]), (sel[2], sel[3])]:
        d.rectangle((hx - 5, hy - 5, hx + 5, hy + 5), fill=GREEN)

    rrect(d, (sel[0] + 16, sel[1] + 16, sel[0] + 430, sel[1] + 50), 8, (7, 11, 22, 240), GREEN, 1)
    d.text((sel[0] + 28, sel[1] + 24), "Área seleccionada 640×310 px  |  Procesando IA…", font=F_BADGE, fill=GREEN)

    rrect(d, (1480, 200, 1860, 248), 8, (7, 11, 22, 240), (*CYAN, 180), 1)
    d.text((1500, 214), "Atajo: Ctrl+Shift+A   •   Salir: Esc", font=F_HUD_BODY, fill=CYAN)

    draw_capsule(d, (700, 170), expanded=False)
    save(img, "Screenshot_2_Snipping_Tool.png")


def shot3():
    img, d = make_desktop()
    caption(
        d,
        "Cápsula, bandeja y ajustes de ToolTip AI",
        "Clave de Gemini cifrada localmente con DPAPI; análisis a la API de Google que configures",
    )

    # control panel
    x, y = 300, 360
    w, h = 640, 480
    rrect(d, (x + 3, y + 5, x + w + 3, y + h + 5), 16, (0, 0, 0, 150))
    rrect(d, (x, y, x + w, y + h), 16, PANEL, CAPSULE_BORDER, 2)
    d.text((x + 28, y + 28), "ToolTip AI — Panel de control", font=F_HUD_TITLE, fill=GREEN)
    d.text((x + 28, y + 62), "Versión 1.0.3.0  |  Estado: listo", font=F_HUD_BODY, fill=SLATE)

    actions = [
        ("Recortar pantalla", "Ctrl+Shift+A", GREEN),
        ("Inspeccionar pantalla completa", "", CYAN),
        ("Analizar portapapeles", "", TEXT),
        ("Radar automático (dwell)", "Ctrl+Shift+D", PURPLE_SOFT),
        ("Ajustes de IA y Gemini", "Ctrl+Shift+C", AMBER),
    ]
    ay = y + 100
    for label, key, col in actions:
        rrect(d, (x + 28, ay, x + w - 28, ay + 52), 10, (20, 28, 42, 230), (255, 255, 255, 28), 1)
        d.text((x + 48, ay + 16), label, font=F_HUD_BODY, fill=col)
        if key:
            d.text((x + w - 170, ay + 16), key, font=F_HUD_SMALL, fill=SLATE_DIM)
        ay += 62

    # privacy
    px, py = 1000, 360
    pw, ph = 600, 480
    rrect(d, (px + 3, py + 5, px + pw + 3, py + ph + 5), 16, (0, 0, 0, 150))
    rrect(d, (px, py, px + pw, py + ph), 16, PANEL, (*CYAN, 140), 2)
    d.text((px + 28, py + 28), "Privacidad y seguridad", font=F_HUD_TITLE, fill=CYAN)
    body = (
        "Bóveda DPAPI\n"
        "Tu clave de API se cifra en este equipo con\n"
        "Windows DPAPI (ProtectedData).\n\n"
        "Análisis a la API de Google\n"
        "Las capturas se envían cifradas a la API de\n"
        "Gemini que tú configuras, bajo demanda.\n\n"
        "Sin backend propio de capturas\n"
        "Dixi3 Lqbs no opera un servidor intermedio\n"
        "de capturas ni incluye publicidad.\n\n"
        "Ejecución en bandeja del sistema\n"
        "Cápsula flotante y HUD con acceso rápido."
    )
    d.multiline_text((px + 28, py + 72), body, font=F_HUD_BODY, fill=TEXT, spacing=5)

    draw_capsule(d, (700, 155), expanded=True)
    save(img, "Screenshot_3_Dashboard_Controls.png")


def shot4():
    img, d = make_desktop()
    caption(
        d,
        "Explica errores de Windows y te da el siguiente paso",
        "Veredicto, impacto y comando de diagnóstico listo para copiar",
    )
    draw_windows_dialog(d, (260, 300), error=True)
    draw_capsule(d, (700, 170), expanded=False)
    draw_hud(
        d,
        (1160, 230),
        title="Acceso denegado 0x80070005",
        advice=(
            "Se requiere elevación UAC.\n"
            "Haz clic derecho sobre el instalador y elige\n"
            "«Ejecutar como administrador»."
        ),
        summary=(
            "Windows bloqueó un cambio en una clave del\n"
            "registro protegida. La app no tiene permisos\n"
            "de administrador en esta sesión."
        ),
        consequences=(
            "• Solución: ejecutar como administrador\n"
            "• Comando: Start-Process .\\setup.exe -Verb RunAs\n"
            "• No se modificó el registro"
        ),
    )
    save(img, "Screenshot_4_Docking_UIAutomation.png")


def main():
    print(f"Salida: {OUT}")
    shot1()
    shot2()
    shot3()
    shot4()
    print("Listo. Sustituye las 4 capturas en Partner Center (listado español).")


if __name__ == "__main__":
    main()
