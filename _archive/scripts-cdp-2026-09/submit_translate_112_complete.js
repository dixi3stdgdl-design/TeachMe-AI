const { chromium } = require('D:/pwcli/node_modules/playwright');

async function executeTranslateUpload112() {
  console.log('=== INICIANDO FLUJO COMPLETO: TRANSLATE 1.1.2.0 ===');
  const msixPath = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // 1. Clic en "Sí" del modal
  console.log('1. Pulsando Sí en el modal de cancelación...');
  try {
    const yesBtn = page.locator('he-button').filter({ hasText: /^Sí$/i }).first();
    if (await yesBtn.isVisible({ timeout: 2000 })) {
      await yesBtn.click();
      console.log('Clic en he-button Sí realizado.');
    } else {
      await page.mouse.click(310, 465);
      console.log('Clic en coordenadas (310, 465) realizado.');
    }
  } catch (e) {
    console.log('Intento de clic por coordenadas...');
    await page.mouse.click(310, 465);
  }

  await page.waitForTimeout(6000);
  console.log('URL actual tras cancelar:', page.url());

  // 2. Navegar directamente a la página de paquetes
  const packagesUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('2. Navegando a la página de paquetes:', packagesUrl);
  await page.goto(packagesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 3. Eliminar paquetes antiguos/fallidos si existen
  console.log('3. Buscando botones de eliminar/quitar en paquetes...');
  const deleteLocators = await page.locator('button, a').filter({ hasText: /Delete|Eliminar|Remove|Quitar/i }).all();
  console.log(`Botones de eliminación encontrados: ${deleteLocators.length}`);
  for (const d of deleteLocators) {
    if (await d.isVisible().catch(() => false)) {
      try {
        console.log('Pulsando botón de eliminar...');
        await d.click();
        await page.waitForTimeout(2000);
      } catch (err) {
        console.log('Error click eliminar:', err.message);
      }
    }
  }

  // 4. Configurar CDP FileChooser
  console.log('4. Configurando CDP FileChooser para:', msixPath);
  const client = await context.newCDPSession(page);
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let fileInjected = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser detectado. BackendNodeId:', event.backendNodeId);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log('[CDP OK] Archivo MSIX 1.1.2.0 inyectado exitosamente.');
      fileInjected = true;
    } catch (err) {
      console.error('[CDP ERROR] Fallo al inyectar archivo:', err);
    }
  });

  // Disparar diálogo de selección de archivo
  console.log('Disparando diálogo de archivo...');
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
    if (inputs.length > 0) {
      inputs[0].click();
      return true;
    }
    return false;
  });

  await page.waitForTimeout(3000);

  if (!fileInjected) {
    console.log('Intentando clic en zona drag/drop o browse...');
    const dropZone = page.locator('text=browse your files').first();
    if (await dropZone.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dropZone.click();
      await page.waitForTimeout(3000);
    }
  }

  // 5. Monitorear progreso de validación
  console.log('5. Esperando que el paquete 1.1.2.0 se cargue y valide...');
  for (let i = 0; i < 35; i++) {
    await page.waitForTimeout(3000);
    const body = await page.innerText('body');
    if (body.includes('1.1.2.0') || body.includes('ToolTipAITranslate_1.1.2.0')) {
      console.log(`Paquete 1.1.2.0 presente (${i * 3}s transcurridos)...`);
      if (!body.includes('Cargando...') && !body.includes('Procesando...') && !body.includes('Analizando...')) {
        console.log('Validación de paquete 1.1.2.0 completada exitosamente.');
        break;
      }
    }
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_1120_validated.png' });
  console.log('Captura guardada en translate_1120_validated.png');

  // 6. Guardar la sección de paquetes
  console.log('6. Guardando paquetes...');
  const saveBtn = page.locator('he-button, button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Sección de paquetes guardada.');
  }

  // 7. Volver al Overview para enviar a certificación
  console.log('7. Volviendo a Overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 8. Enviar a certificación
  console.log('8. Enviando a certificación...');
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('Clic en enviar para certificación realizado.');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_1120_final_submitted.png' });
  const finalBody = await page.innerText('body');
  const lines = finalBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL TRAS ENVIO DE TRANSLATE 1.1.2.0 ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0/i.test(l)).slice(0, 10).join('\n'));
}

executeTranslateUpload112().catch(e => console.error('Error fatal:', e));
