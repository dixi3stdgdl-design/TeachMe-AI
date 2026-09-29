const { chromium } = require('D:/pwcli/node_modules/playwright');

async function handleModalAndUpload() {
  console.log('--- MANEJANDO MODAL Y SUBIENDO 1.1.2.0 ---');
  const msixFile = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // 1. Confirmar modal de cancelación si está abierto
  console.log('1. Buscando botón Sí en el modal de confirmación...');
  const yesButton = page.locator('.modal, .dialog, div').locator('button, he-button').filter({ hasText: /^Sí$/i }).first();
  if (await yesButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Haciendo clic en Sí para cancelar...');
    await yesButton.click();
    await page.waitForTimeout(6000);
  } else {
    // Si no está el modal abierto, verificar si está el botón Cancelar el certificado
    const cancelCert = page.locator('he-button').filter({ hasText: /Cancelar el certificado/i }).first();
    if (await cancelCert.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Haciendo clic en Cancelar el certificado...');
      await cancelCert.click();
      await page.waitForTimeout(2000);
      const yesBtn2 = page.locator('button, he-button').filter({ hasText: /^Sí$/i }).first();
      if (await yesBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('Haciendo clic en Sí en el modal...');
        await yesBtn2.click();
        await page.waitForTimeout(6000);
      }
    }
  }

  // 2. Navegar directamente a packages
  const packagesUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('2. Navegando directamente a Packages:', packagesUrl);
  await page.goto(packagesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 3. Eliminar paquetes antiguos o fallidos
  console.log('3. Eliminando paquetes viejos...');
  const removeButtons = await page.locator('button[aria-label*="Eliminar"], button[aria-label*="Quitar"], button:has-text("Delete"), button:has-text("Eliminar"), button:has-text("Remove")').all();
  console.log(`Botones encontrados: ${removeButtons.length}`);
  for (const rb of removeButtons) {
    if (await rb.isVisible().catch(() => false)) {
      console.log('Haciendo clic en eliminar...');
      await rb.click();
      await page.waitForTimeout(2000);
    }
  }

  // 4. Configurar CDP FileChooser
  console.log('4. Configurando CDP FileChooser interceptor para:', msixFile);
  const client = await context.newCDPSession(page);
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let uploaded = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('>>> FileChooser ABIERTO por CDP! BackendNodeId:', event.backendNodeId);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixFile],
        backendNodeId: event.backendNodeId
      });
      console.log('>>> DOM.setFileInputFiles EJECUTADO CON EXITO.');
      uploaded = true;
    } catch (e) {
      console.error('>>> Error en DOM.setFileInputFiles:', e);
    }
  });

  // Activar clic en file input
  console.log('Activando file input...');
  await page.evaluate(() => {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    if (fileInputs.length > 0) fileInputs[0].click();
  });

  await page.waitForTimeout(3000);

  // 5. Monitorear subida de 1.1.2.0
  console.log('5. Esperando procesamiento de 1.1.2.0...');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(3000);
    const body = await page.innerText('body');
    if (body.includes('1.1.2.0') || body.includes('ToolTipAITranslate_1.1.2.0')) {
      console.log(`Paquete 1.1.2.0 encontrado en pantalla (${i * 3}s)!`);
      if (!body.includes('Cargando...') && !body.includes('Procesando...') && !body.includes('Analizando...')) {
        console.log('Validación de 1.1.2.0 completada exitosamente.');
        break;
      }
    }
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_1120_uploaded.png' });
  console.log('Captura guardada en translate_1120_uploaded.png');

  // 6. Guardar cambios en paquetes
  console.log('6. Guardando sección Paquetes...');
  const saveBtn = page.locator('he-button, button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Paquetes guardados.');
  }

  // 7. Volver a Overview y Enviar
  console.log('7. Volviendo a Overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('8. Enviando a certificación...');
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('Envío realizado.');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_1120_submitted.png' });
  const finalBody = await page.innerText('body');
  const lines = finalBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL TRAS ENVIO DE 1.1.2.0 ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0/i.test(l)).slice(0, 10).join('\n'));
}

handleModalAndUpload().catch(e => console.error('Error en ejecución:', e));
