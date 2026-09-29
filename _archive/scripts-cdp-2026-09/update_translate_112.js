const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function updateTranslatePackage() {
  console.log('--- INICIANDO ACTUALIZACION DE TOOLTIP AI TRANSLATE A 1.1.2.0 ---');
  const msixFile = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';
  console.log('Archivo a subir:', msixFile);

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('1. Navegando a Overview de ToolTip AI Translate (9NQN3RZ2Z655)...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Verificar si está en certificación para cancelarlo primero
  console.log('2. Verificando si hay botón de Cancelar el certificado...');
  const cancelBtn = page.locator('he-button, button').filter({ hasText: /Cancelar el certificado/i }).first();
  if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Haciendo clic en Cancelar el certificado...');
    await cancelBtn.click();
    await page.waitForTimeout(2000);

    const confirmYes = page.locator('he-button, button').filter({ hasText: /^Sí$/i }).first();
    if (await confirmYes.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Confirmando cancelación...');
      await confirmYes.click();
      await page.waitForTimeout(6000);
      console.log('Cancelación completada.');
    }
  } else {
    console.log('No está en proceso de certificación activo o ya está en borrador.');
  }

  // Ahora buscar enlace o elemento a Paquetes
  console.log('3. Buscando sección Paquetes...');
  let packagesClicked = false;
  const pkgTaskItem = page.locator('he-task-item').filter({ hasText: /Paquetes/i }).first();
  if (await pkgTaskItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Haciendo clic en he-task-item Paquetes...');
    await pkgTaskItem.click();
    packagesClicked = true;
  } else {
    const pkgLink = page.locator('a, button').filter({ hasText: /^Paquetes$/i }).first();
    if (await pkgLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Haciendo clic en enlace Paquetes...');
      await pkgLink.click();
      packagesClicked = true;
    }
  }

  await page.waitForTimeout(5000);
  console.log('URL actual:', page.url());

  // Si no abrió la página de paquetes o sigue en overview, verificar hrefs
  if (!page.url().includes('packages')) {
    const hrefs = await page.locator('a').evaluateAll(anchors => anchors.map(a => a.href));
    const pkgHref = hrefs.find(h => h.includes('packages'));
    if (pkgHref) {
      console.log('Navegando directamente a URL de packages:', pkgHref);
      await page.goto(pkgHref, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(4000);
    }
  }

  // En la página de paquetes, buscar botones de eliminar/quitar paquetes antiguos
  console.log('4. Verificando paquetes existentes en la página...');
  const deleteButtons = await page.locator('button[aria-label*="Eliminar"], button[aria-label*="Quitar"], button:has-text("Eliminar"), button:has-text("Quitar")').all();
  console.log(`Botones de eliminar encontrados: ${deleteButtons.length}`);
  for (const delBtn of deleteButtons) {
    if (await delBtn.isVisible().catch(() => false)) {
      try {
        console.log('Haciendo clic para eliminar paquete antiguo...');
        await delBtn.click();
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log('Error al hacer clic en eliminar:', e.message);
      }
    }
  }

  // 5. Preparar CDP FileChooser para subir ToolTipAITranslate_1.1.2.0_x64.msix
  console.log('5. Configurando interceptor CDP para FileChooser...');
  const client = await context.newCDPSession(page);
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let fileSelected = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('>>> EVENTO CDP FileChooser abierto! Modo:', event.mode, 'BackendNodeId:', event.backendNodeId);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixFile],
        backendNodeId: event.backendNodeId
      });
      console.log('>>> ARCHIVO INYECTADO VIA DOM.setFileInputFiles:', msixFile);
      fileSelected = true;
    } catch (err) {
      console.error('>>> ERROR AL INYECTAR ARCHIVO VIA CDP:', err);
    }
  });

  // Activar input file
  console.log('Activando clic en input[type="file"]...');
  await page.evaluate(() => {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    if (fileInputs.length > 0) {
      fileInputs[0].click();
      return true;
    }
    return false;
  });

  await page.waitForTimeout(3000);

  if (!fileSelected) {
    console.log('Intentando hacer clic en el botón de examinar paquetes...');
    const browseBtn = page.locator('button, a, label').filter({ hasText: /Examinar|Browse|Cargar|Subir|arrastra/i }).first();
    if (await browseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await browseBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  console.log('6. Esperando a que el paquete 1.1.2.0 se cargue y procese...');
  let uploadFinished = false;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const text = await page.innerText('body');
    if (text.includes('1.1.2.0') || text.includes('ToolTipAITranslate_1.1.2.0')) {
      console.log(`Paquete 1.1.2.0 detectado en pantalla (iteración ${i})!`);
      if (!text.includes('Cargando...') && !text.includes('Procesando...') && !text.includes('Analizando...')) {
        console.log('Procesamiento del paquete 1.1.2.0 completado.');
        uploadFinished = true;
        break;
      }
    }
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_package_uploaded_112.png' });
  console.log('Captura guardada en translate_package_uploaded_112.png');

  // 7. Guardar cambios en Paquetes
  console.log('7. Buscando botón Guardar...');
  const saveBtn = page.locator('he-button, button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Haciendo clic en Guardar...');
    await saveBtn.click();
    await page.waitForTimeout(7000);
    console.log('Guardado completado.');
  }

  // 8. Volver a Overview y enviar para certificación
  console.log('8. Navegando a Overview para enviar para certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  console.log('9. Buscando botón Enviar para certificación...');
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Haciendo clic en Enviar para certificación...');
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('Envío completado.');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_final_status_112.png' });
  const finalText = await page.innerText('body');
  const lines = finalText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL DE TRANSLATE ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0|1\.0/i.test(l)).slice(0, 15).join('\n'));
}

updateTranslatePackage().catch(err => {
  console.error('Error durante la actualización:', err);
});
