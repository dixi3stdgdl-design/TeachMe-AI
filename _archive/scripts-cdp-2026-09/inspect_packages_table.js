const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];

  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/packages';
  console.log('Navegando a Packages...');
  await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: path.join(__dirname, 'packages_table_inspect.png'), fullPage: true });

  const rows = await page.locator('table tr, div[role="row"]').evaluateAll(elements => 
    elements.map(e => e.innerText.trim()).filter(e => e.length > 0)
  );
  console.log('Filas encontradas en tabla de paquetes:');
  console.log(JSON.stringify(rows, null, 2));

  // Buscar todos los botones en la página de paquetes
  const buttons = await page.locator('button, a').evaluateAll(elements => 
    elements.map(e => ({ text: e.innerText.trim(), ariaLabel: e.getAttribute('aria-label') || '', class: e.className }))
      .filter(e => e.text.length > 0 || e.ariaLabel.length > 0)
  );
  console.log('Botones disponibles en Packages:');
  console.log(JSON.stringify(buttons.filter(b => /delete|quitar|eliminar|remove|guardar|save/i.test(b.text + b.ariaLabel)), null, 2));

  await browser.close();
}

main().catch(e => console.error(e));
