const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];

  console.log('1. Haciendo clic en la tarjeta de Paquetes en el SPA...');
  // Buscar he-task-item de Paquetes
  const taskItem = page.locator('he-task-item, div, a').filter({ hasText: /Paquetes/i }).first();
  await taskItem.click();
  await page.waitForTimeout(4000);

  console.log('URL actual:', page.url());
  await page.screenshot({ path: path.join(__dirname, 'packages_spa_view.png') });

  // 2. Buscar botones Delete / Quitar
  console.log('2. Buscando botones de eliminación...');
  let delButtons = await page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$|^Quitar$/i }).all();
  console.log(`Encontrados ${delButtons.length} botones.`);
  
  for (let i = 0; i < delButtons.length; i++) {
    console.log(`Pulsando botón de eliminar ${i + 1}...`);
    await delButtons[i].click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // 3. Scroll abajo y Guardar
  console.log('3. Haciendo scroll abajo para guardar...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('4. Pulsando Guardar/Save...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 5. Volver a Overview
  console.log('5. Volviendo a Overview...');
  const back = page.locator('a, button, span').filter({ hasText: /Información general de la aplicación/i }).first();
  if (await back.isVisible()) {
    await back.click();
    await page.waitForTimeout(5000);
  }

  // 6. Enviar a certificación
  console.log('6. Pulsando Enviar para certificación...');
  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_spa_final.png') });
  await browser.close();
}

main().catch(e => console.error(e));
