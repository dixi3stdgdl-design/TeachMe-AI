const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Páginas abiertas (${pages.length}):`);
  for (let i = 0; i < pages.length; i++) {
    console.log(`[${i}] ${pages[i].url()} - ${await pages[i].title()}`);
  }

  const page = pages[0];
  console.log('\nTomando captura de la página activa actual...');
  await page.screenshot({ path: path.join(__dirname, 'current_active_tab.png') });
  console.log('Captura guardada en scripts/current_active_tab.png');
}

main().catch(e => console.error(e));
