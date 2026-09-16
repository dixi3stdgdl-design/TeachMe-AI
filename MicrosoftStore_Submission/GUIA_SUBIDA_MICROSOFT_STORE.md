# 🚀 Guía Paso a Paso para Publicar TeachMe AI en Microsoft Store

Esta guía te explica de forma clara y directa cómo publicar **TeachMe AI** en la tienda oficial de Windows (**Microsoft Store**) utilizando **Microsoft Partner Center** y el paquete `.msix` que acabamos de generar en esta carpeta.

---

## 📑 Contenido de la Carpeta de Entrega

La carpeta `MicrosoftStore_Submission/` contiene todo lo necesario:
* `Package/TeachMeAI_1.0.0.0_x64.msix`: Tu aplicación empaquetada lista para subir o probar.
* `Package/AppxManifest.xml`: El manifiesto con capacidades Desktop Bridge FullTrust.
* `Store_Assets/`: Todos los logotipos e iconos en las resoluciones oficiales (50x50, 44x44, 150x150, 310x150, 310x310, Splash 620x300, etc.).
* `Store_Assets/Screenshots/`: 3 capturas promocionales en alta definición (1920x1080) listas para la ficha de la tienda.
* `Testing_Certificate/`: Certificado de prueba para que puedas instalar y probar el `.msix` en cualquier PC antes de subirlo.
* `Scripts/`: Scripts para sincronizar tu identidad oficial de Partner Center y recompilar en 1 clic.
* `METADATOS_FICHA_TIENDA.md`: Textos, descripciones, características y respuestas al cuestionario de edad listos para copiar.
* `CHECKLIST_CERTIFICACION.md`: Lista rápida de verificación previa al envío.

---

## 🧪 Paso 0: Cómo Probar el Paquete MSIX Localmente (Opcional)

Si deseas probar cómo se instala y ejecuta el paquete `.msix` en tu propio equipo antes de subirlo:

1. Ve a la carpeta `MicrosoftStore_Submission/Testing_Certificate/`.
2. Haz clic derecho en `Instalar-Certificado-Prueba.ps1` y selecciona **Ejecutar con PowerShell como Administrador**.
   *(Esto instala el certificado de prueba en el almacén de Personas de Confianza de Windows).*
3. Una vez instalado, ve a `MicrosoftStore_Submission/Package/` y haz **doble clic en `TeachMeAI_1.0.0.0_x64.msix`**.
4. Se abrirá la ventana oficial del Instalador de aplicaciones de Windows. Haz clic en **Instalar**.
5. ¡Listo! La app se iniciará y quedará registrada en tu menú Inicio de Windows 11 como cualquier app de la Store.

---

## 🌐 Paso 1: Iniciar Sesión en Microsoft Partner Center

1. Abre tu navegador y dirígete al panel oficial:
   👉 **[https://partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard)**
2. Inicia sesión con tu cuenta de desarrollador de Microsoft (cuenta Microsoft personal o empresarial).
   *(Si aún no estás registrado como desarrollador, el costo de registro único es de ~$19 USD para particulares).*
3. En el menú lateral izquierdo, ve a **Aplicaciones y juegos (Apps & games)** > **Resumen (Overview)**.

---

## 🏷️ Paso 2: Crear una Nueva Aplicación y Reservar el Nombre

1. Haz clic en el botón azul **Nueva aplicación / Crear un producto nuevo**.
2. Escribe el nombre: `TeachMe AI`.
3. Haz clic en **Comprobar disponibilidad** y luego en **Reservar nombre del producto**.

---

## 🔑 Paso 3: Sincronizar la Identidad del Producto con el MSIX

Para que Microsoft Store acepte tu paquete `.msix`, el `Name` y `Publisher` del manifiesto deben coincidir con los asignados a tu cuenta en Partner Center:

1. Dentro de tu aplicación en Partner Center, en el menú izquierdo haz clic en **Administración de productos (Product management)** > **Identidad del producto (Product identity)**.
2. Verás estos 3 valores clave:
   * **Nombre del paquete (Package identity name):** *(Ejemplo: `12345TuNombre.TeachMeAI`)*
   * **Id. de publicador (Package/Identity/Publisher):** *(Ejemplo: `CN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)*
   * **Nombre para mostrar del publicador (Publisher display name):** *(Ejemplo: `Tu Nombre o Empresa`)*

3. **Sincronización en 1 clic:**
   - Abre la carpeta `MicrosoftStore_Submission/Scripts/`.
   - Haz clic derecho en `Actualizar-Identidad-Y-Compilar.ps1` y pulsa **Ejecutar con PowerShell**.
   - El script te pedirá esos 3 valores que acabas de ver en la pantalla de Microsoft. Pégalos y presiona Enter.
   - En solo 5 segundos, el script recompilará el paquete `.msix` con tu identidad exacta de Partner Center.

---

## 📦 Paso 4: Cargar el Paquete MSIX

1. En Partner Center, dentro de la ficha de tu aplicación, haz clic en **Iniciar envío (Start your submission)**.
2. Haz clic en la sección **Paquetes (Packages)**.
3. Arrastra y suelta el archivo:
   `MicrosoftStore_Submission/Package/TeachMeAI_1.0.0.0_x64.msix`
4. Microsoft analizará el paquete automáticamente. Validará:
   - Arquitectura: `x64`
   - Versión: `1.0.0.0`
   - Capacidad: `runFullTrust` (Desktop Bridge)
5. Haz clic en **Guardar (Save)**.

---

## 📝 Paso 5: Completar los Formularios de Publicación

Sigue el orden de secciones en la página de envío:

### A. Precios y Disponibilidad (Pricing and availability)
* **Mercados:** Selecciona *Todos los mercados posibles* (Worldwide).
* **Precio:** Selecciona *Gratis (Free)*.
* Guarda los cambios.

### B. Propiedades (Properties)
* **Categoría:** Selecciona `Productivity` (Productividad).
* **Subcategoría:** Selecciona `Developer Tools` o `Utilities & tools`.
* **URL de directiva de privacidad:** Pega:
  `https://dixi3stdgdl-design.github.io/TeachMe-AI/`
* **Información de soporte:** Pega la URL de tu repositorio o correo de contacto.
* Guarda los cambios.

### C. Clasificaciones por Edad (Age ratings)
* Haz clic en **Cuestionario de IARC**.
* Selecciona la categoría: *Utilidad / Herramienta / Productividad*.
* Responde **"No"** a todas las preguntas de violencia, contenido explícito, apuestas y drogas (consulta la tabla en `METADATOS_FICHA_TIENDA.md`).
* En segundos recibirás tu certificado internacional IARC con clasificación para todas las regiones (PEGI 3, ESRB Everyone, etc.).
* Guarda los cambios.

### D. Fichas de la Tienda (Store listings)
* Haz clic en **Español (alfabetización internacional)**.
* Copia y pega los campos preparados en `METADATOS_FICHA_TIENDA.md`:
  - **Descripción corta**
  - **Descripción completa**
  - **Características del producto**
  - **Palabras clave de búsqueda** (Tooltip AI, Inteligencia Artificial, Asistente virtual, etc.)
* **Imágenes y Capturas de Pantalla:**
  - Sube las 3 imágenes ubicadas en `MicrosoftStore_Submission/Store_Assets/Screenshots/`.
  - Sube `StoreListing_Icon_1024.png` como icono de la aplicación.
* Haz clic en **Guardar**.
*(Opcional: puedes añadir una ficha adicional en Inglés copiando la sección en inglés de `METADATOS_FICHA_TIENDA.md`).*

---

## 🚀 Paso 6: Revisión Final y Envío (Submit to Store)

1. Vuelve al menú principal del envío. Todas las secciones deben mostrar una marca de verificación verde (✅).
2. Haz clic en el botón superior derecho: **Enviar a la tienda (Submit to the Store)**.
3. Tu aplicación entrará en el proceso de certificación de Microsoft:
   - **Paso 1 (Automatizado):** Pruebas de seguridad, análisis antivirus y cumplimiento del paquete (tarda de 15 a 45 minutos).
   - **Paso 2 (Revisión humana de Microsoft):** Certificación final (suele tardar entre 12 y 48 horas).
4. Cuando sea aprobada, recibirás un correo de felicitación y **TeachMe AI** estará publicada y disponible para millones de usuarios en Microsoft Store.

---

## 💡 Consejos para Actualizaciones Futuras (v1.0.1, v1.1.0...)

Cuando hagas mejoras o nuevas versiones en el código:
1. Cambia la versión en `src-dotnet/TeachMeAI.csproj` (por ejemplo `<Version>1.0.1.0</Version>`).
2. Ejecuta `MicrosoftStore_Submission/Scripts/build-msix.bat`.
3. En Partner Center, crea un **Nuevo envío**, sube el nuevo `.msix` y pulsa **Enviar**.
