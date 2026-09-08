# ✅ Checklist Previo a la Publicación en Microsoft Store

Antes de hacer clic en **"Enviar a la tienda"** en Microsoft Partner Center, repasa esta lista de verificación rápida:

| Estado | Elemento | Verificación |
| :---: | :--- | :--- |
| [x] | **Paquete MSIX generado** | `TeachMeAI_1.0.0.0_x64.msix` existe y contiene binarios autónomos (self-contained win-x64). |
| [x] | **Capacidad FullTrust** | El manifiesto incluye `<rescap:Capability Name="runFullTrust" />` para permitir hooks globales y Win32. |
| [x] | **Sin autoarranque forzado** | La app no escribe en el registro de inicio sin consentimiento (cumplimiento estricto de certificación). |
| [x] | **Assets visuales completos** | `StoreLogo` (50x50), `Square44x44`, `Square150x150`, `Wide310x150`, `Square310x310` y `SplashScreen` generados e incluidos. |
| [x] | **Capturas de pantalla listas** | 3 capturas promocionales en 1920x1080 listas en `Store_Assets/Screenshots/`. |
| [x] | **Ficha de tienda redactada** | Título, subtítulo, descripción corta, descripción completa y palabras clave listos en `METADATOS_FICHA_TIENDA.md`. |
| [x] | **Cuestionario IARC preparado** | Respuestas de cero violencia, sin drogas ni apuestas listas para clasificación PEGI 3 / ESRB Everyone. |
| [x] | **Política de privacidad disponible** | URL pública vinculada a la página oficial / repositorio del proyecto. |
| [ ] | **Sincronización de Identidad** | Si Partner Center asigna un `Package Name` o `Publisher CN` personalizado, ejecutar `Scripts/Actualizar-Identidad-Y-Compilar.ps1`. |
| [ ] | **Carga en Partner Center** | Paquete subido y formularios completados en partner.microsoft.com. |
