const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== GUARDANDO PACKAGES Y CERTIFICANDO ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];

  console.log('1. Eliminando paquete de upload fallido...');
  const delBtn = page.locator('.upload-action').first();
  if (await delBtn.isVisible()) {
    await delBtn.click();
    console.log('Delete upload-action presionado.');
    await page.waitForTimeout(3000);
  }

  console.log('2. Haciendo scroll abajo para Guardar...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('3. Pulsando Guardar en Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  console.log('4. Navegando a Información general...');
  const back = page.locator('a, button, span').filter({ hasText: /Información general de la aplicación/i }).first();
  if (await back.isVisible()) {
    await back.click();
    await page.waitForTimeout(5000);
  } else {
    await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  }

  console.log('5. Pulsando Enviar para certificación...');
  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_final_certified.png') });
  await browser.close();
}

main().catch(e => console.error(e));
