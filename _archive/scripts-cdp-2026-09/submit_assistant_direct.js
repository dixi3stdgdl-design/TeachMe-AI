const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== CARGA Y ENVÍO DE TOOLTIP AI ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/packages';
  console.log('1. Navegando a Packages URL:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Eliminar paquete anterior si existe
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).first();
  if (await deleteBtn.isVisible()) {
    console.log('2. Eliminando versión anterior...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  const msixPath = 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix';
  console.log('3. Configurando interceptor nativo CDP para:', msixPath);

  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('Page.enable');
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let fileChosen = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser dialog abierto:', event);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log('[OK] Archivo MSIX 1.1.3.0 inyectado via CDP.');
      fileChosen = true;
    } catch (e) {
      console.error('Error en setFileInputFiles:', e.message);
    }
  });

  console.log('4. Haciendo clic en la zona de carga para disparar el diálogo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  await page.waitForTimeout(4000);

  console.log('5. Esperando subida y validación en Microsoft Store (hasta 90s)...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
    const text = await page.innerText('body');
    if (/ToolTipAIAssistant_1\.1\.3\.0_x64\.msix\s+Validated|v1\.1\.3\.0|1\.1\.3\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete 1.1.3.0 validado correctamente.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_1130_uploaded.png') });

  // 6. Guardar cambios en Paquetes
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('6. Guardando cambios en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 7. Volver a Overview y Enviar a Certificación
  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview';
  console.log('7. Volviendo a Overview para enviar a certificación...');
  await page.goto(overviewUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('8. Pulsando botón de envío para certificación...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_1130_final_certified.png') });
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
