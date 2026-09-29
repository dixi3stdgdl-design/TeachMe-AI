const { chromium } = require('D:/pwcli/node_modules/playwright');

async function main() {
  console.log('=== FIXING TRANSLATE PACKAGES & SUBMITTING ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(30000);

  // 1. Ir a Packages
  const packagesUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('1. Navegando a Packages:', packagesUrl);
  await page.goto(packagesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Ver paquetes en la tabla
  const rows = await page.$$('tr');
  console.log('Filas encontradas:', rows.length);
  for (const row of rows) {
    const text = await row.innerText();
    console.log('Fila:', text.replace(/\n+/g, ' '));
    if ((text.includes('1.0.1.0') || text.includes('1.0.2.0')) && !text.includes('1.1.2.0')) {
      const removeBtn = await row.$('button:has-text("Quitar"), button:has-text("Remove"), a:has-text("Quitar")');
      if (removeBtn) {
        console.log('-> Haciendo clic en Quitar paquete antiguo...');
        await removeBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  }

  // Guardar en la página de paquetes
  console.log('2. Buscando botón Guardar en paquetes...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const saveBtn = page.locator('button, he-button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Pulsando Guardar en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Paquetes guardados.');
  }

  // 3. Ir a Overview y ver qué falta
  console.log('3. Volviendo a Overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Revisar si algún listado está incompleto
  const textContent = await page.innerText('body');
  console.log('Overview cargado.');

  // Si hay botón Enviar habilitado
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación/i }).first();
  const isDisabled = await submitBtn.evaluate(el => el.classList.contains('disable-submit') || el.disabled || el.getAttribute('aria-disabled') === 'true').catch(() => true);
  console.log('¿Botón Enviar deshabilitado?:', isDisabled);

  if (!isDisabled) {
    console.log('¡Haciendo clic en Enviar para certificación!');
    await submitBtn.click();
    await page.waitForTimeout(10000);
    console.log('¡ENVIO FINAL A CERTIFICACION COMPLETADO CON EXITO!');
  } else {
    // Si aún está deshabilitado, revisar qué link dice Incompleto
    console.log('Buscando secciones incompletas...');
    const incompleteLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, he-link')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(a => /incompleto/i.test(a.text) || a.closest('tr, li, div')?.innerText?.includes('Incompleto'));
    });
    console.log('Incompletos:', JSON.stringify(incompleteLinks, null, 2));
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_submitted_fixed_final.png' });
  await browser.close();
  console.log('FIN DEL PROCESO.');
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
