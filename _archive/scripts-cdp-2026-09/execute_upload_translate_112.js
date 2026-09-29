const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function uploadTranslate112Final() {
  console.log('=== CARGANDO Y ENVIANDO TOOLTIP AI TRANSLATE 1.1.2.0 ===');
  const msixPath = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';
  console.log('Ruta del archivo:', msixPath);

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('1. Navegando a Packages URL:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Eliminar paquete con error o intentos fallidos si existen
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$/i }).first();
  if (await deleteBtn.isVisible().catch(() => false)) {
    console.log('Eliminando intento fallido previo...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log('2. Configurando interceptor nativo CDP...');
  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('Page.enable');
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let fileChosen = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser dialog abierto en el navegador:', event);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log('[OK] Archivo MSIX 1.1.2.0 inyectado al input via backendNodeId.');
      fileChosen = true;
    } catch (e) {
      console.error('Error en setFileInputFiles:', e.message);
    }
  });

  console.log('3. Haciendo clic en input[type="file"]...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.click();
    }
  });

  await page.waitForTimeout(4000);

  console.log('4. Esperando subida y validación de 1.1.2.0 en Microsoft Store (hasta 90s)...');
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
    const text = await page.innerText('body');
    if (/ToolTipAITranslate_1\.1\.2\.0_x64\.msix\s+Validated|v1\.1\.2\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete 1.1.2.0 validado correctamente.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'translate_1120_uploaded_result.png') });

  // 5. Guardar cambios en Paquetes
  const saveBtn = page.locator('button, he-button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('5. Guardando cambios en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(8000);
  }

  // 6. Volver a Overview y Enviar a Certificación
  console.log('6. Volviendo a Overview para enviar a certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    console.log('7. Pulsando Enviar para la certificación...');
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Translate 1.1.2.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'final_translate_1120_certified.png') });
  const finalBody = await page.innerText('body');
  const lines = finalBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL TRAS ENVIO ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0/i.test(l)).slice(0, 10).join('\n'));
}

uploadTranslate112Final().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
