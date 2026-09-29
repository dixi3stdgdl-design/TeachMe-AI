const { chromium } = require('D:/pwcli/node_modules/playwright');

async function fixPackagesSection() {
  console.log('=== INSPECTING AND FIXING PACKAGES SECTION ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(30000);

  const url = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('Navegando a Packages:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/packages_view_detail.png' });

  // Obtener todos los mensajes de error o advertencia en la página
  const alerts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.alert, [role=\"alert\"], .error, .ms-MessageBar, .validation-summary-errors, .field-validation-error')).map(el => el.innerText.trim());
  });
  console.log('Alertas encontradas:', JSON.stringify(alerts, null, 2));

  // Buscar todos los botones en la página
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, he-button, input[type=\"submit\"]')).map(b => ({
      tag: b.tagName,
      text: b.innerText ? b.innerText.trim() : b.value,
      id: b.id,
      className: b.className,
      disabled: b.disabled || b.getAttribute('aria-disabled')
    }));
  });
  console.log('Botones encontrados:', JSON.stringify(buttons, null, 2));

  // Hacer scroll al fondo y hacer clic en Guardar
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const saveBtn = page.locator('button, he-button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Haciendo clic en Guardar...');
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Guardado ejecutado.');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/packages_after_save_click.png' });

  // Volver a overview
  console.log('Volviendo a Overview para comprobar estado...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación/i }).first();
  const isDisabled = await submitBtn.evaluate(el => el.classList.contains('disable-submit') || el.disabled || el.getAttribute('aria-disabled') === 'true').catch(() => true);
  console.log('¿Botón Enviar deshabilitado?:', isDisabled);

  if (!isDisabled) {
    console.log('¡PULSANDO ENVIAR PARA CERTIFICACION!');
    await submitBtn.click();
    await page.waitForTimeout(10000);
    console.log('¡ENVIO COMPLETADO!');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_final_post_save.png' });
  await browser.close();
  console.log('FIN.');
}

fixPackagesSection().catch(e => console.error(e));
