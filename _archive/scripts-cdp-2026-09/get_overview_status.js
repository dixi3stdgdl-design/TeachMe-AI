const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Navegando a la tabla general de Apps and Games...');
  await page.goto('https://partner.microsoft.com/dashboard/apps-and-games/overview');
  await page.waitForTimeout(5000);

  // Capturar pantalla completa
  const screenshotPath = 'd:/ToolTip AI/scripts/partner_center_status_live.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Captura guardada en: ${screenshotPath}`);

  // Extraer texto de la tabla
  const bodyText = await page.innerText('body');
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  console.log('\n=== LISTADO COMPLETO DE PRODUCTOS Y ESTADOS ===');
  for (let i = 0; i < lines.length; i++) {
    if (/ToolTip/i.test(lines[i])) {
      console.log('-------------------------------------------');
      console.log('PRODUCTO:', lines[i]);
      // Imprimir las siguientes 6 líneas que contienen los estados y fechas
      for (let j = 1; j <= 6; j++) {
        if (lines[i + j]) console.log(`  + ${lines[i + j]}`);
      }
    }
  }
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
