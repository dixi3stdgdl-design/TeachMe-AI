const { chromium } = require('D:/pwcli/node_modules/playwright');

async function removeOldPackagesAndSubmit() {
  console.log('=== REMOVIENDO PAQUETES VIEJOS Y ENVIANDO 1.1.2.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  console.log('1. Navegando a Packages...');
  await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Buscar todos los botones de "Remove" o "Quitar" para los paquetes viejos
  console.log('2. Buscando botones de Remove/Quitar...');
  const removeLinks = await page.locator('a, button').filter({ hasText: /^Remove$|^Quitar$/i }).all();
  console.log(`Botones Remove/Quitar encontrados: ${removeLinks.length}`);
  
  // Hacemos clic en los 2 primeros (que corresponden a 1.0.1.0 y 1.0.2.0)
  for (let i = 0; i < removeLinks.length; i++) {
    try {
      console.log(`Pulsando Remove/Quitar #${i + 1}...`);
      await removeLinks[i].click();
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('Error pulsando remove:', e.message);
    }
  }

  await page.waitForTimeout(2000);

  // Guardar en Paquetes
  console.log('3. Pulsando Guardar...');
  const saveBtn = page.locator('he-button, button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Paquetes guardados.');
  }

  // Volver a Overview
  console.log('4. Volviendo a Overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Verificar si Enviar para certificación está habilitado
  const submitBtn = page.locator('he-button').filter({ hasText: /Enviar para certificación/i }).first();
  const isDisabled = await submitBtn.evaluate(el => el.classList.contains('disable-submit') || el.disabled);
  console.log('¿Botón Enviar deshabilitado?:', isDisabled);

  if (!isDisabled) {
    console.log('5. Pulsando Enviar para certificación...');
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('¡ENVIO A CERTIFICACION EXITOSO!');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_submitted_1120_verified.png' });
  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL TRAS ENVIO ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0/i.test(l)).slice(0, 10).join('\n'));
}

removeOldPackagesAndSubmit().catch(e => console.error(e));
