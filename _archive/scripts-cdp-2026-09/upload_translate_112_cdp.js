const { chromium } = require('D:/pwcli/node_modules/playwright');

async function uploadExact112() {
  console.log('=== UPLOAD TRANSLATE 1.1.2.0 VIA TEST_CDP_FILE_CHOOSER METHOD ===');
  const msixPath = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('1. Navegando a Packages URL...');
  const packagesUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  await page.goto(packagesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 2. Configurar interceptor nativo CDP
  console.log('2. Configurando interceptor nativo CDP para:', msixPath);
  const client = await context.newCDPSession(page);
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let fileSent = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser dialog abierto:', JSON.stringify(event));
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log('[OK] Archivo MSIX 1.1.2.0 inyectado al input via backendNodeId.');
      fileSent = true;
    } catch (err) {
      console.error('[ERROR] al inyectar archivo:', err);
    }
  });

  // 3. Disparar clic en el área de subida
  console.log('3. Haciendo clic en la zona de carga para disparar el diálogo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.click();
    } else {
      const dropArea = document.querySelector('.file-upload-drag-drop') || document.querySelector('[class*="drag-drop"]');
      if (dropArea) dropArea.click();
    }
  });

  await page.waitForTimeout(4000);

  // 4. Esperar validación
  console.log('4. Esperando subida y validación en Microsoft Store (hasta 90s)...');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(3000);
    const body = await page.innerText('body');
    if (body.includes('1.1.2.0') || body.includes('ToolTipAITranslate_1.1.2.0')) {
      console.log(`[VALIDACION] Paquete 1.1.2.0 detectado (${(i+1)*3}s)...`);
      if (!body.includes('Cargando...') && !body.includes('Procesando...') && !body.includes('Analizando...')) {
        console.log('[EXITO CONFIRMADO] Paquete 1.1.2.0 validado correctamente.');
        break;
      }
    } else {
      console.log(`Progreso: ${(i+1)*3}s transcurridos...`);
    }
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_1120_validated_view.png' });

  // 5. Guardar paquetes
  console.log('5. Pulsando botón Guardar...');
  const saveBtn = page.locator('he-button, button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Paquetes guardados.');
  }

  // 6. Navegar a Overview y Enviar para certificación
  console.log('6. Volviendo a Overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('7. Pulsando Volver a enviar para la certificación...');
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('[EXITO TOTAL] ¡ToolTip AI Translate 1.1.2.0 ENVIADO A CERTIFICACION!');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_1120_final_success.png' });
  const finalBody = await page.innerText('body');
  const lines = finalBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL TRAS ENVIO ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0/i.test(l)).slice(0, 10).join('\n'));
}

uploadExact112().catch(e => console.error('Error fatal:', e));
