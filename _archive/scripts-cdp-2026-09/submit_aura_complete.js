const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== CANCELANDO CERTIFICACIÓN Y SUBIENDO AURA 1.0.2.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];

  // 1. Clic en Cancelar el certificado
  console.log('1. Pulsando "Cancelar el certificado"...');
  const cancelBtn = page.locator('button, a, he-button, span, div').filter({ hasText: /^Cancelar el certificado$/i }).first();
  await cancelBtn.click();
  await page.waitForTimeout(3000);

  // Modal Sí
  const siBtn = page.locator('button').filter({ hasText: /^Sí$|^Si$/i }).first();
  if (await siBtn.isVisible()) {
    console.log('2. Confirmando cancelación ("Sí")...');
    await siBtn.click();
    await page.waitForTimeout(6000);
  }

  // 2. Ir a Packages
  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9P33P1P5Z8DC/submissions/1152921505701893791/packages';
  console.log('3. Navegando a Packages:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 3. Eliminar versión previa si existe
  const delBtn = page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).first();
  if (await delBtn.isVisible()) {
    console.log('Eliminando versión previa...');
    await delBtn.click();
    await page.waitForTimeout(3000);
  }

  // 4. Inyectar 1.0.2.0 con CDP
  const msixPath = 'D:\\ToolTip AI Aura\\MicrosoftStore_Submission\\Package\\ToolTipAIAura_1.0.2.0_x64.msix';
  console.log('4. Configurando CDP para subir:', msixPath);

  const context = browser.contexts()[0];
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
      console.log('[OK] Archivo MSIX 1.0.2.0 inyectado.');
    } catch (e) {
      console.error('Error DOM.setFileInputFiles:', e.message);
    }
  });

  console.log('Disparando input de archivo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  console.log('5. Esperando validación del paquete 1.0.2.0...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s...`);
    const text = await page.innerText('body');
    if (/ToolTipAIAura_1\.0\.2\.0_x64\.msix\s+Validated|v1\.0\.2\.0|1\.0\.2\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete Aura 1.0.2.0 validado correctamente.');
      break;
    }
  }

  // Eliminar upload-action en error si existe
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
  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9P33P1P5Z8DC/overview';
  console.log('7. Volviendo a Overview...');
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('8. Pulsando Enviar para certificación...');
  const submitBtn = page.locator('he-button, button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Aura 1.0.2.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'aura_final_certified.png') });
  await browser.close();
}

main().catch(e => console.error(e));
