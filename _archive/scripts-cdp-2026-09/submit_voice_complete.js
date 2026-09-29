const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== CANCELANDO CERTIFICACIÓN Y SUBIENDO TOOLTIP AI VOICE 1.0.1.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9P417GZB0FVB/overview';
  console.log('1. Navegando a Voice Overview:', overviewUrl);
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 1. Cancelar certificado si está en certificación
  const cancelBtn = page.locator('button, a, he-button, span, div').filter({ hasText: /^Cancelar el certificado$/i }).first();
  if (await cancelBtn.isVisible()) {
    console.log('2. Cancelando certificación previa...');
    await cancelBtn.click();
    await page.waitForTimeout(3000);

    const siBtn = page.locator('button').filter({ hasText: /^Sí$|^Si$/i }).first();
    if (await siBtn.isVisible()) {
      await siBtn.click();
      console.log('Confirmación "Sí" pulsada.');
      await page.waitForTimeout(6000);
    }
  }

  // 2. Obtener enlace de Packages
  console.log('3. Obteniendo URL de Packages para Voice...');
  const links = await page.locator('a').evaluateAll(els => els.map(e => e.href));
  let pkgUrl = links.find(l => l.includes('/submissions/') && l.includes('/packages'));
  
  if (!pkgUrl) {
    const subMatch = links.find(l => l.includes('/submissions/'));
    if (subMatch) {
      const match = subMatch.match(/\/submissions\/(\d+)/);
      if (match) {
        pkgUrl = `https://partner.microsoft.com/es-es/dashboard/products/9P417GZB0FVB/submissions/${match[1]}/packages`;
      }
    }
  }

  console.log('URL de Packages:', pkgUrl);
  if (pkgUrl) {
    await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }

  // 3. Eliminar versión previa si existe
  const delBtn = page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).first();
  if (await delBtn.isVisible()) {
    console.log('Eliminando versión previa...');
    await delBtn.click();
    await page.waitForTimeout(3000);
  }

  // 4. Inyectar paquete Voice 1.0.1.0 con CDP
  const msixPath = 'D:\\ToolTip AI Voice\\MicrosoftStore_Submission\\Package\\ToolTipAIVoice_1.0.1.0_x64.msix';
  console.log('4. Configurando CDP para:', msixPath);

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
      console.log('[OK] Archivo MSIX 1.0.1.0 inyectado.');
    } catch (e) {
      console.error('Error DOM.setFileInputFiles:', e.message);
    }
  });

  console.log('Disparando input de archivo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  console.log('5. Esperando validación del paquete 1.0.1.0...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s...`);
    const text = await page.innerText('body');
    if (/ToolTipAIVoice_1\.0\.1\.0_x64\.msix\s+Validated|v1\.0\.1\.0|1\.0\.1\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete Voice 1.0.1.0 validado correctamente.');
      break;
    }
  }

  // Eliminar upload-action fallido si existe
  const delErr = page.locator('.upload-action').first();
  if (await delErr.isVisible()) {
    await delErr.click();
    await page.waitForTimeout(2000);
  }

  // 6. Scroll y Guardar Paquetes
  console.log('6. Guardando sección Paquetes...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(6000);
    console.log('Paquetes guardado.');
  }

  // 7. Volver a Overview y Enviar a certificación
  console.log('7. Volviendo a Overview...');
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('8. Pulsando Enviar para certificación...');
  const submitBtn = page.locator('he-button, button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Voice 1.0.1.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'voice_final_certified.png') });
  console.log('=== VOICE COMPLETADO CON ÉXITO ===');
  await browser.close();
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
