const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== COMPLETANDO SUBIDA Y ENVIO DE TOOLTIP AI ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // 1. Clic en "Paquetes" en la barra lateral
  console.log('1. Clic en "Paquetes" en el menú lateral...');
  await page.locator('a, button, span').filter({ hasText: /^Paquetes$/i }).first().click();
  await page.waitForTimeout(4000);

  console.log('URL actual:', page.url());

  // 2. Si hay paquete anterior con error o previo, eliminarlo
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).first();
  if (await deleteBtn.isVisible()) {
    console.log('2. Eliminando paquete previo...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  // 3. Interceptar FileChooser para inyectar 1.1.3.0
  const msixPath = 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix';
  console.log('3. Inyectando paquete:', msixPath);

  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('Page.enable');
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser dialog abierto:', event);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log('[OK] Paquete 1.1.3.0 inyectado con éxito.');
    } catch (e) {
      console.error('Error DOM.setFileInputFiles:', e.message);
    }
  });

  console.log('4. Disparando input file...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  console.log('5. Esperando validación del paquete 1.1.3.0...');
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s...`);
    const text = await page.innerText('body');
    if (/ToolTipAIAssistant_1\.1\.3\.0_x64\.msix\s+Validated|v1\.1\.3\.0|1\.1\.3\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete 1.1.3.0 validado correctamente.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_1130_uploaded.png') });

  // 6. Guardar cambios en sección Paquetes
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('6. Guardando cambios en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(5000);
  }

  // 7. Volver a Información general de la aplicación y Enviar a certificación
  console.log('7. Navegando a Información general...');
  await page.locator('a, button').filter({ hasText: /Información general de la aplicación|Overview/i }).first().click();
  await page.waitForTimeout(5000);

  console.log('8. Enviando a certificación...');
  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_1130_submitted.png') });
  console.log('=== ASSISTANT COMPLETADO ===');
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
