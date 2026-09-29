const { chromium } = require('D:/pwcli/node_modules/playwright');

async function solveAndSubmitTranslate() {
  console.log('=== SOLVING AND SUBMITTING TRANSLATE 1.1.2.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(30000);

  const subId = '1152921505701891994';
  const baseUrl = `https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/${subId}`;

  // 1. Packages
  console.log('1. Revisando y guardando Paquetes...');
  await page.goto(`${baseUrl}/packages`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  // Guardar paquetes
  let saveBtn = page.locator('button, he-button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Haciendo clic en Guardar en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 2. Opciones de envío
  console.log('2. Revisando Opciones de envío...');
  await page.goto(`${baseUrl}/options`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    const val = await textarea.inputValue();
    if (!val || val.length < 10) {
      console.log('Llenando justificación de runFullTrust...');
      await textarea.fill('ToolTip AI Translate es una aplicación de escritorio nativa de Windows 11 para traducción en tiempo real sobre la pantalla. Requiere runFullTrust para la integración con la bandeja del sistema, atajos globales de teclado y renderizado de la ventana flotante HUD sobre el escritorio.');
      await page.waitForTimeout(1000);
    }
    const optSave = page.locator('button, he-button').filter({ hasText: /^Guardar$/i }).first();
    if (await optSave.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Guardando Opciones de envío...');
      await optSave.click();
      await page.waitForTimeout(5000);
    }
  }

  // 3. Volver a Overview
  console.log('3. Volviendo a Overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // 4. Buscar botón Enviar
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    const disabled = await submitBtn.evaluate(el => el.classList.contains('disable-submit') || el.disabled || el.getAttribute('aria-disabled') === 'true').catch(() => false);
    console.log('¿Botón Enviar deshabilitado?:', disabled);
    if (!disabled) {
      console.log('¡HACIENDO CLIC EN ENVIAR PARA CERTIFICACION!');
      await submitBtn.click();
      await page.waitForTimeout(10000);
      console.log('¡ENVIO FINAL ENVIADO A CERTIFICACION!');
    }
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_final_solved_status.png' });
  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO TRAS INTENTO DE ENVIO ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0|completado|incompleto/i.test(l)).slice(0, 15).join('\n'));
}

solveAndSubmitTranslate().catch(err => console.error(err));
