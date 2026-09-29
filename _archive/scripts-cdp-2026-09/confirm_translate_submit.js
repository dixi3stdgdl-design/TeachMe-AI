const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Navegando a Translate overview...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview');
  await page.waitForTimeout(4000);

  console.log('Buscando botón "Volver a enviar para la certificación"...');
  const submitBtn = page.locator('button, a').filter({ hasText: /Volver a enviar para la certificación/i }).first();
  
  if (await submitBtn.isVisible()) {
    console.log('Botón encontrado. Haciendo clic...');
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // Revisar si apareció un diálogo de confirmación
    const confirmBtn = page.locator('button').filter({ hasText: /Enviar|Confirmar|Submit|Aceptar|Continuar/i }).first();
    if (await confirmBtn.isVisible()) {
      console.log('Confirmando envío...');
      await confirmBtn.click();
      await page.waitForTimeout(5000);
    }

    await page.waitForTimeout(4000);
  } else {
    console.log('El botón "Volver a enviar para la certificación" ya no está visible (posiblemente ya fue enviado).');
  }

  const screenshotPath = 'd:/ToolTip AI/scripts/translate_submitted_final_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Captura guardada:', screenshotPath);

  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO ACTUAL DE TRANSLATE ===');
  console.log(lines.slice(10, 35).join('\n'));
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
