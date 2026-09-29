const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== SUBIENDO TOOLTIP AI ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('Haciendo clic en la fila de Paquetes en la UI...');
  const pkgRow = page.locator('he-task-item').filter({ hasText: /Paquetes/i }).first();
  if (await pkgRow.isVisible()) {
    await pkgRow.click();
  } else {
    // Si no está por he-task-item, hacer clic en el texto Paquetes
    await page.locator('div, span, p').filter({ hasText: /^Paquetes$/i }).first().click();
  }
  await page.waitForTimeout(5000);

  console.log('URL en paquetes:', page.url());

  // 1. Eliminar paquete 1.0.4.0 anterior
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).first();
  if (await deleteBtn.isVisible()) {
    console.log('Eliminando paquete anterior 1.0.4.0...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  // 2. Interceptar FileChooser con CDP
  const msixPath = 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix';
  console.log('Configurando CDP para subir:', msixPath);

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
      console.log('[OK] Paquete 1.1.3.0 inyectado.');
      fileChosen = true;
    } catch (e) {
      console.error('Error DOM.setFileInputFiles:', e.message);
    }
  });

  console.log('Disparando input de archivo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  await page.waitForTimeout(4000);

  console.log('Esperando validación de paquete 1.1.3.0 (hasta 90s)...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
    const text = await page.innerText('body');
    if (/ToolTipAIAssistant_1\.1\.3\.0_x64\.msix\s+Validated|v1\.1\.3\.0|1\.1\.3\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete 1.1.3.0 validado correctamente.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_pkg_uploaded.png') });

  // 3. Guardar cambios
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('Guardando cambios en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 4. Volver a Overview y Enviar a Certificación
  console.log('Volviendo a Overview para certificar...');
  const backLink = page.locator('a, button').filter({ hasText: /Información general|Overview|Volver/i }).first();
  if (await backLink.isVisible()) {
    await backLink.click();
  } else {
    await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded' });
  }
  await page.waitForTimeout(5000);

  console.log('Pulsando Enviar para certificación...');
  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_final_certified.png') });
  console.log('Completado!');
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
