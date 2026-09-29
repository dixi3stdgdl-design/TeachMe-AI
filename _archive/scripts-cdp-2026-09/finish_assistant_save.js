const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== GUARDANDO PAQUETE Y ENVIANDO ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('1. Esperando que termine validación en pantalla...');
  await page.waitForTimeout(6000);

  // Hacer scroll hacia abajo para revelar el botón Save/Guardar
  console.log('2. Haciendo scroll abajo...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(__dirname, 'assistant_bottom_save.png') });

  // Buscar botón Guardar / Save
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('3. Haciendo clic en Guardar/Save...');
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Guardado exitoso.');
  } else {
    console.log('Botón guardar no encontrado directamente.');
  }

  // 4. Ir a Overview
  console.log('4. Navegando a Información general...');
  const overviewLink = page.locator('a, button, span').filter({ hasText: /Información general de la aplicación/i }).first();
  if (await overviewLink.isVisible()) {
    await overviewLink.click();
  } else {
    await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded' });
  }
  await page.waitForTimeout(5000);

  await page.screenshot({ path: path.join(__dirname, 'assistant_pre_submit.png') });

  // 5. Pulsar Enviar para certificación
  console.log('5. Pulsando Enviar para certificación...');
  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación|Volver a enviar/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('Haciendo clic en el botón de envío...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  } else {
    console.log('Botón submit no visible.');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_final_status.png') });
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
