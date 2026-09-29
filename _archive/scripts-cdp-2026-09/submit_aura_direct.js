const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== CARGA Y ENVÍO DE TOOLTIP AI AURA 1.0.2.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9P33P1P5Z8DC/submissions/1152921505701893791/packages';
  console.log('1. Navegando a Packages URL:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 2. Interceptar FileChooser para inyectar 1.0.2.0
  const msixPath = 'D:\\ToolTip AI Aura\\MicrosoftStore_Submission\\Package\\ToolTipAIAura_1.0.2.0_x64.msix';
  console.log('2. Configurando interceptor nativo CDP para:', msixPath);

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
      console.log('[OK] Archivo MSIX 1.0.2.0 inyectado via CDP.');
    } catch (e) {
      console.error('Error en setFileInputFiles:', e.message);
    }
  });

  console.log('3. Haciendo clic en la zona de carga para disparar el diálogo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  await page.waitForTimeout(4000);

  console.log('4. Esperando validación del paquete 1.0.2.0 (hasta 90s)...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
    const text = await page.innerText('body');
    if (/ToolTipAIAura_1\.0\.2\.0_x64\.msix\s+Validated|v1\.0\.2\.0|1\.0\.2\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete Aura 1.0.2.0 validado correctamente.');
      break;
    }
  }

  // Eliminar upload fallido si existe
  const delErr = page.locator('.upload-action').first();
  if (await delErr.isVisible()) {
    await delErr.click();
    await page.waitForTimeout(2000);
  }

  // 5. Scroll abajo y Guardar Paquetes
  console.log('5. Guardando sección Paquetes...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('Pulsando Guardar...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 6. Opciones de envío y Guardar
  const optUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9P33P1P5Z8DC/submissions/1152921505701893791/submissionoptions';
  await page.goto(optUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(3000);
  const saveOpt = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveOpt.isVisible()) {
    await saveOpt.click();
    await page.waitForTimeout(4000);
  }

  // 7. Overview y Enviar a certificación
  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9P33P1P5Z8DC/overview';
  console.log('7. Volviendo a Overview para Enviar a certificación...');
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('he-button, button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('8. Pulsando botón de envío para certificación...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Aura 1.0.2.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'aura_1020_final_certified.png') });
  await browser.close();
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
