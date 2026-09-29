const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
async function review(page, id, name) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const data = await page.evaluate(() => {
    const t = document.body.innerText;
    // Find all status-like words near section names
    const sections = ['Precios y disponibilidad', 'Propiedades', 'Clasificación por edades', 'Paquetes', 'Descripciones de Store', 'Opciones de envío'];
    const result = {};
    for (const s of sections) {
      const i = t.indexOf(s);
      result[s] = i >= 0 ? t.slice(i, i + 120).replace(/\n/g, ' | ') : 'NOT FOUND';
    }
    result._packages = (t.match(/ToolTipAI\w+_\d+\.\d+\.\d+\.\d+_x64\.msix/g) || []).join(', ');
    result._state = (t.match(/En borrador|En proceso de certificación|En certificación|Publicada/) || [''])[0];
    return result;
  });
  console.log('====', name, '====');
  console.log(JSON.stringify(data, null, 1));
  fs.writeFileSync(`${OUT}/${name}_sections.json`, JSON.stringify(data, null, 2));
}
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await review(page, '9N3D02KXKD3D', 'assistant');
  await review(page, '9NQN3RZ2Z655', 'translate');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
