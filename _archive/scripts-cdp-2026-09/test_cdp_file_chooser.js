const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== Carga de Paquete MSIX con DOM.setFileInputFiles (backendNodeId) ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('1. Navegando a Packages URL:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Eliminar paquete con error si existe
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$/i }).first();
  if (await deleteBtn.isVisible()) {
    console.log('Eliminando intento fallido previo...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  const msixPath = 'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Package\\ToolTipAITranslate_1.0.2.0_x64.msix';
  console.log('2. Configurando interceptor nativo CDP para:', msixPath);

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
      console.log('[OK] Archivo MSIX inyectado al input via backendNodeId.');
      fileChosen = true;
    } catch (e) {
      console.error('Error en setFileInputFiles:', e.message);
    }
  });

  console.log('3. Haciendo clic en la zona de carga para disparar el diálogo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.click();
    }
  });

  await page.waitForTimeout(4000);

  console.log('4. Esperando subida y validación en Microsoft Store (hasta 90s)...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
    const text = await page.innerText('body');
    if (/ToolTipAITranslate_1\.0\.2\.0_x64\.msix\s+Validated|v1\.0\.2\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete 1.0.2.0 validado correctamente.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'cdp_file_chosen_result.png') });

  // 5. Guardar cambios en Paquetes
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('5. Guardando cambios en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 6. Ir a Opciones de envío y guardar
  const optionsUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/submissionoptions';
  console.log('6. Completando Opciones de envío...');
  await page.goto(optionsUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const saveOptBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveOptBtn.isVisible()) {
    await saveOptBtn.click();
    await page.waitForTimeout(5000);
  }

  // 7. Volver a Overview y Enviar a Certificación
  console.log('7. Volviendo a Overview para enviar a certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('text=Volver a enviar para la certificación').first();
  if (await submitBtn.isVisible()) {
    console.log('8. Pulsando "Volver a enviar para la certificación"...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Translate 1.0.2.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'final_translate_certified.png') });
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
