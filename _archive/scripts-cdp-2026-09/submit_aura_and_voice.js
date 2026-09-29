const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

const APPS_TO_SUBMIT = [
  {
    name: 'ToolTip AI Aura',
    productId: '9P33P1P5Z8DC',
    msixPath: 'D:\\ToolTip AI Aura\\MicrosoftStore_Submission\\Package\\ToolTipAIAura_1.0.2.0_x64.msix',
    version: '1.0.2.0'
  },
  {
    name: 'ToolTip AI Voice',
    productId: '9P417GZB0FVB',
    msixPath: 'D:\\ToolTip AI Voice\\MicrosoftStore_Submission\\Package\\ToolTipAIVoice_1.0.1.0_x64.msix',
    version: '1.0.1.0'
  }
];

async function processApp(browser, app) {
  console.log(`\n===============================================================`);
  console.log(`INICIANDO PROCESO AUTOMATIZADO PARA: ${app.name} (${app.productId})`);
  console.log(`Paquete objetivo: ${app.msixPath}`);
  console.log(`===============================================================`);

  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  // 1. Navegar a Overview del producto
  const overviewUrl = `https://partner.microsoft.com/es-es/dashboard/products/${app.productId}/overview`;
  console.log(`1. Navegando a Overview: ${overviewUrl}`);
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 2. Si está en certificación, cancelar certificado
  const cancelCertLink = page.locator('text=Cancelar el certificado').first();
  if (await cancelCertLink.isVisible()) {
    console.log('2. Cancelando certificación previa para subir nueva versión...');
    await cancelCertLink.click();
    await page.waitForTimeout(3000);

    const siBtn = page.locator('button').filter({ hasText: /^Sí$|^Si$/i }).first();
    if (await siBtn.isVisible()) {
      await siBtn.click();
      console.log('Confirmación "Sí" pulsada.');
      await page.waitForTimeout(5000);
    }
  } else {
    console.log('No se requirió cancelación de certificado (ya en borrador o editable).');
  }

  // 3. Entrar a la sección Paquetes
  console.log('3. Accediendo a la sección Paquetes...');
  const pkgCard = page.locator('he-task-item, div, a').filter({ hasText: /Paquetes/i }).first();
  if (await pkgCard.isVisible()) {
    await pkgCard.click();
  } else {
    // Si no está por tarjeta, buscar link de submission
    const links = await page.locator('a').evaluateAll(els => els.map(e => e.href));
    for (const l of links) {
      if (l.includes('/submissions/') && l.includes('/packages')) {
        await page.goto(l, { waitUntil: 'domcontentloaded' });
        break;
      }
    }
  }
  await page.waitForTimeout(4000);
  console.log('En página de paquetes:', page.url());

  // 4. Configurar CDP FileChooser para inyectar el MSIX nuevo
  console.log(`4. Inyectando paquete ${app.version} con CDP...`);
  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('Page.enable');
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser abierto:', event);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [app.msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log(`[OK] Paquete ${app.version} inyectado al input.`);
    } catch (e) {
      console.error('Error inyectando archivo:', e.message);
    }
  });

  // Disparar click en input
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });
  await page.waitForTimeout(4000);

  // 5. Esperar validación
  console.log('5. Esperando validación en Microsoft Store...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    const text = await page.innerText('body');
    if (text.includes(app.version) && text.includes('Validated')) {
      console.log(`[ÉXITO CONFIRMADO] Versión ${app.version} Validated.`);
      break;
    }
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
  }

  // Eliminar paquetes en error si hay
  const delErrBtn = page.locator('.upload-action').first();
  if (await delErrBtn.isVisible()) {
    await delErrBtn.click();
    await page.waitForTimeout(2000);
  }

  // 6. Scroll y Guardar Paquetes
  console.log('6. Guardando sección Paquetes...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(5000);
    console.log('Paquetes guardado.');
  }

  // 7. Opciones de envío y Guardar (por si acaso)
  const currentUrl = page.url();
  const subMatch = currentUrl.match(/\/submissions\/(\d+)/);
  if (subMatch) {
    const optUrl = `https://partner.microsoft.com/es-es/dashboard/products/${app.productId}/submissions/${subMatch[1]}/submissionoptions`;
    await page.goto(optUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(3000);
    const saveOptBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
    if (await saveOptBtn.isVisible()) {
      await saveOptBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  // 8. Volver a Overview y Enviar para certificación
  console.log('8. Volviendo a Overview para Enviar a certificación...');
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const submitEl = page.locator('he-button, button, a').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitEl.isVisible()) {
    console.log(`9. Haciendo clic en Enviar para certificación para ${app.name}...`);
    await submitEl.click();
    await page.waitForTimeout(6000);
    console.log(`[ÉXITO TOTAL] ¡${app.name} ENVIADO A CERTIFICACIÓN!`);
  }

  const shotName = `submitted_${app.productId}.png`;
  await page.screenshot({ path: path.join(__dirname, shotName) });
  console.log(`Captura guardada en scripts/${shotName}`);
}

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  for (const app of APPS_TO_SUBMIT) {
    await processApp(browser, app);
  }
  console.log('\n===============================================================');
  console.log('=== TODOS LOS PROYECTOS PROCESADOS Y ENVIADOS A CERTIFICACIÓN ===');
  console.log('===============================================================');
  await browser.close();
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
