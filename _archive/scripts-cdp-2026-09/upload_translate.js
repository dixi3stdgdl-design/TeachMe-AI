const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function uploadTranslatePackage() {
  console.log('=== Cargando ToolTipAITranslate_1.0.2.0_x64.msix ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('1. Navegando a Packages URL:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const msixPath = 'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Package\\ToolTipAITranslate_1.0.2.0_x64.msix';
  console.log('2. Asignando archivo MSIX via CDP:', msixPath);

  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  const { root: { nodeId: rootNodeId } } = await client.send('DOM.getDocument');
  const { nodeId } = await client.send('DOM.querySelector', { nodeId: rootNodeId, selector: 'input[type="file"]' });

  console.log('Node ID de input[type="file"]:', nodeId);
  await client.send('DOM.setFileInputFiles', { files: [msixPath], nodeId });
  console.log('Archivo enviado a input. Esperando carga y validación en Microsoft Store...');

  // Esperar hasta 60s mientras el paquete sube y se valida
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(5000);
    console.log(`Validando... ${(i + 1) * 5}s`);
    const text = await page.innerText('body');
    if (/ToolTipAITranslate_1\.0\.2\.0/i.test(text)) {
      console.log('[OK] Paquete 1.0.2.0 detectado en la lista de paquetes.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'uploaded_1020.png') });

  // Buscar y hacer clic en Guardar
  console.log('3. Guardando configuración de paquetes...');
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    console.log('Botón Guardar presionado.');
    await page.waitForTimeout(6000);
  }

  // 4. Volver a Overview
  console.log('4. Navegando a Overview para enviar a certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // 5. Pulsar Volver a enviar para la certificación
  const submitBtn = page.locator('button').filter({ hasText: /Volver a enviar para la certificación|Enviar para certificación|Submit/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('5. Pulsando "Volver a enviar para la certificación"...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ToolTip AI Translate 1.0.2.0 enviado para certificación.');
  }

  await page.screenshot({ path: path.join(__dirname, 'translate_submitted_final.png') });
}

uploadTranslatePackage().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
