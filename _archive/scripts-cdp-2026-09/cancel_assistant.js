const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function processAssistant() {
  console.log('=== PROCESANDO TOOLTIP AI ASSISTANT (9N3D02KXKD3D) ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const url = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview';
  console.log('1. Navegando a:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Buscar botón o enlace "Cancelar el certificado"
  const cancelLink = page.locator('text=Cancelar el certificado').first();
  if (await cancelLink.isVisible()) {
    console.log('2. Encontrado "Cancelar el certificado". Haciendo clic...');
    await cancelLink.click();
    await page.waitForTimeout(4000);

    // Revisar si sale modal de confirmación
    const confirmBtn = page.locator('button').filter({ hasText: /Cancelar|Confirmar|Aceptar|Yes|Sí/i }).first();
    if (await confirmBtn.isVisible()) {
      console.log('3. Confirmando cancelación de certificación...');
      await confirmBtn.click();
      await page.waitForTimeout(6000);
    }
  } else {
    console.log('No se encontró enlace directo de "Cancelar el certificado".');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_after_cancel.png') });
  console.log('Captura guardada: scripts/assistant_after_cancel.png');

  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO TRAS CANCELACIÓN ===');
  console.log(lines.slice(10, 30).join('\n'));
}

processAssistant().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
