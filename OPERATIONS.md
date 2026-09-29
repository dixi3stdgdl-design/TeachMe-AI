# Operación — ToolTip AI Suite

Reglas de trabajo del proyecto. Un agente o una persona que entre aquí las cumple sin negociar.

## 1. Principios

1. **Nada de instalaciones ni cambios de sistema sin consentimiento explícito.** No abrir navegadores, no cerrar procesos del usuario, no copiar perfiles, no `npm i` / `dotnet tool` nuevos.
2. **Diagnosticar necesidad, no pedir menú.** El trabajo obvio se ejecuta; solo se pregunta lo irreversible o lo ambiguo de negocio.
3. **Plan → ejecutar → evidencia.** Cada bloque termina con archivo, comando o estado verificable.
4. **Borrar solo lo regenerable.** Lo histórico se archiva en `_archive/`, no se destruye.
5. **Un dueño por carpeta** (ver `STRUCTURE.md`).

## 2. Flujo de una sesión de trabajo

```text
1. Estado real (comandos, no memoria)
2. Decisión: qué desbloquea ingresos o certificación
3. Ejecución en el repo
4. Verificación
5. Actualizar docs / checklist Store si aplica
```

## 3. Prohibido

- Mezclar basura de automatización con fuente de producto (`scripts/` solo con tools pedidas y versionadas).
- Dejar más de un `.msix` versionado por app en `MicrosoftStore_Submission/Package/` (el resto va a `_archive/msix-history/`).
- Reutilizar nombres/código de otra app de la suite sin renombrar namespace, csproj y `AppxManifest`.
- Enviar a certificación con capturas que no cumplan política 10.1.1.3 (1920×1080, sin claims falsos).

## 4. Definición de “listo”

- [ ] `dotnet build` del módulo compila
- [ ] 1 MSIX actual en `Package/`
- [ ] `AppxManifest` Identity/Executable coherentes con el nombre de la app
- [ ] Checklist `CHECKLIST_CERTIFICACION.md` en verde
- [ ] Sin archivos `bin/`, `obj/`, `*.log`, `node_modules` en el árbol de producto

## 5. Comandos de referencia (WPF)

```powershell
dotnet publish src-dotnet/TeachMeAI.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./dist
# Módulos: cada csproj en su carpeta (Aura / Voice / Translate)
```
