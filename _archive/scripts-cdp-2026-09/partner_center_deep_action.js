const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');
const fs = require('fs');

async function processTranslateSubmission() {
  console.log('=== Automatizando Carga y Envío en Partner Center (via Native CDP File Handler) ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('1. Navegando a ToolTip AI Translate (9NQN3RZ2Z655)...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Buscar enlace a "Paquetes" / "Packages"
  const packagesLink = page.locator('a, button, [role="button"]').filter({ hasText: /^Paquetes$/i }).first();
  if (await packagesLink.isVisible()) {
    console.log('2. Entrando a la sección Paquetes...');
    await packagesLink.click();
    await page.waitForTimeout(5000);

    const msixPath = 'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Package\\ToolTipAITranslate_1.0.2.0_x64.msix';
    console.log('3. Subiendo archivo MSIX via Native CDP:', msixPath);

    // Conectar a sesion CDP de bajo nivel para asignar la ruta directa de archivo sin límite de 50MB
    const client = await page.context().newCDPSession(page);
    await client.send('DOM.enable');
    const { root: { nodeId: rootNodeId } } = await client.send('DOM.getDocument');
    const { nodeId } = await client.send('DOM.querySelector', { nodeId: rootNodeId, selector: 'input[type="file"]' });
    
    console.log('Asignando archivo a nodo:', nodeId);
    await client.send('DOM.setFileInputFiles', { files: [msixPath], nodeId });
    console.log('[OK] Archivo asignado exitosamente al control de subida de Microsoft.');

    console.log('4. Esperando subida y validación del paquete MSIX en Microsoft...');
    // Esperar a que el indicador de carga o validación termine
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(5000);
      console.log(`Progreso de validación: ${(i + 1) * 5} segundos transcurridos...`);
      const bodyText = await page.innerText('body');
      if (/1\.0\.2\.0|completado|correctamente|validado|subido/i.test(bodyText)) {
        console.log('Detección de paquete validado en pantalla.');
        break;
      }
    }

    await page.screenshot({ path: path.join(__dirname, 'translate_upload_progress.png') });

    // Guardar cambios
    const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
    if (await saveBtn.isVisible()) {
      console.log('5. Guardando cambios en Paquetes...');
      await saveBtn.click();
      await page.waitForTimeout(5000);
    }
  }

  // 6. Volver a Overview y enviar
  console.log('6. Volviendo al Overview para enviar a certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('button, a').filter({ hasText: /Volver a enviar para la certificación|Enviar para certificación|Submit for certification/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('7. Haciendo clic en "Volver a enviar para la certificación"...');
    await submitBtn.click();
    await page.waitForTimeout(5000);
    console.log('[ÉXITO] Envío iniciado para ToolTip AI Translate.');
  }

  await page.screenshot({ path: path.join(__dirname, 'translate_final_status.png') });
  console.log('Captura final guardada en scripts/translate_final_status.png');
}

processTranslateSubmission().catch(err => {
  console.error('Error durante el proceso:', err);
  process.exit(1);
});
