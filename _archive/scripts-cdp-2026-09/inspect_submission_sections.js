const { chromium } = require('D:/pwcli/node_modules/playwright');

async function inspectSubmissionSections() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const sections = ['Precios y disponibilidad', 'Propiedades', 'Clasificación por edades', 'Paquetes', 'Descripciones de Store', 'Opciones de envío'];
  for (const s of sections) {
    const el = page.locator('div, li, tr, a, [role="listitem"]').filter({ hasText: new RegExp('^' + s, 'i') }).first();
    const isVis = await el.isVisible();
    const text = isVis ? (await el.innerText()).replace(/\n/g, ' - ') : 'No visible';
    console.log(s + ' => ' + text);
  }
}

inspectSubmissionSections().catch(e => console.error(e));
