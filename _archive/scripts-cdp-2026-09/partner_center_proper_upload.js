const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== Corrección y Carga de Paquetes en Partner Center ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('1. Navegando a Packages URL:', pkgUrl);
  await page.goto(pkgUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // 1. Eliminar paquete con error previo si existe botón Delete
  console.log('2. Limpiando intento fallido...');
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$/i }).first();
  if (await deleteBtn.isVisible()) {
    console.log('Haciendo clic en Delete del paquete con error...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  // 2. Subir paquete usando fileChooser oficial
  const msixPath = 'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Package\\ToolTipAITranslate_1.0.2.0_x64.msix';
  console.log('3. Iniciando carga de archivo con fileChooser:', msixPath);

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(msixPath);
  console.log('Archivo seleccionado. Esperando subida a Azure Blob...');

  // Esperar a que se procese
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(5000);
    console.log(`Validando paquete... ${(i + 1) * 5}s`);
    const text = await page.innerText('body');
    if (/ToolTipAITranslate_1\.0\.2\.0_x64\.msix\s+Validated|v1\.0\.2\.0/i.test(text)) {
      console.log('[ÉXITO] Paquete 1.0.2.0 validado correctamente por Microsoft.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'packages_after_clean_upload.png') });

  // 3. Guardar cambios en Paquetes
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('4. Guardando cambios en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(5000);
  }

  // 4. Ir a Opciones de envío para completar lo pendiente
  const optionsUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/submissionoptions';
  console.log('5. Navegando a Opciones de envío:', optionsUrl);
  await page.goto(optionsUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Guardar en opciones de envío
  const saveOptBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveOptBtn.isVisible()) {
    await saveOptBtn.click();
    await page.waitForTimeout(4000);
  }

  // 5. Volver a Overview y enviar
  console.log('6. Volviendo a Overview para enviar a certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('text=Volver a enviar para la certificación').first();
  if (await submitBtn.isVisible()) {
    console.log('7. Pulsando Volver a enviar para la certificación...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[COMPLETADO] Enviado exitosamente.');
  }

  await page.screenshot({ path: path.join(__dirname, 'translate_final_submission.png') });
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
