const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('Conectando a CDP en 9222...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Navegando a Overview de Apps and Games...');
  await page.goto('https://partner.microsoft.com/dashboard/apps-and-games/overview');
  await page.waitForTimeout(5000);

  // Capturar vista general con todos los proyectos
  await page.screenshot({ path: path.join(__dirname, 'overview_table.png'), fullPage: true });
  console.log('Captura guardada en scripts/overview_table.png');

  const text = await page.innerText('body');
  console.log('=== TEXTO DEL PANEL PRINCIPAL ===');
  console.log(text.split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 60).join('\n'));

  const appNames = ['ToolTip AI', 'ToolTip AI Aura', 'ToolTip AI Translate', 'ToolTip AI Voice'];

  for (const name of appNames) {
    console.log(`\n========================================================`);
    console.log(`REVISANDO DETALLE DE: ${name}`);
    console.log(`========================================================`);

    // Volver a overview
    await page.goto('https://partner.microsoft.com/dashboard/apps-and-games/overview');
    await page.waitForTimeout(4000);

    // Buscar y hacer clic en el nombre de la app
    const appLink = page.locator('a, button, span').filter({ hasText: new RegExp('^' + name + '$', 'i') }).first();
    if (await appLink.isVisible()) {
      console.log(`Haciendo clic en ${name}...`);
      await appLink.click();
      await page.waitForTimeout(5000);

      console.log('URL actual:', page.url());
      const productText = await page.innerText('body');
      const lines = productText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const relevant = lines.filter(l => /envío|submission|certific|borrador|draft|esperando|publica|paquete|versión|1\.\d+/i.test(l));
      console.log('Líneas relevantes:');
      console.log(relevant.slice(0, 15).join('\n'));

      const cleanName = name.replace(/\s+/g, '_').toLowerCase();
      await page.screenshot({ path: path.join(__dirname, `detail_${cleanName}.png`) });
    } else {
      console.log(`No se encontró el enlace visible para ${name}`);
    }
  }

  console.log('\n=== REVISIÓN FINALIZADA ===');
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
