const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'cdp_status_now');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('partner.microsoft.com')) || context.pages()[0];
  if (!page) page = await context.newPage();
  page.setDefaultTimeout(45000);

  const apps = [
    { name: 'assistant', id: '9N3D02KXKD3D' },
    { name: 'aura', id: '9P33P1P5Z8DC' },
    { name: 'translate', id: '9NQN3RZ2Z655' },
    { name: 'voice', id: '9P417GZB0FVB' }
  ];

  console.log('START URL', page.url(), await page.title());

  for (const app of apps) {
    const url = `https://partner.microsoft.com/es-es/dashboard/products/${app.id}/overview`;
    console.log('\n====', app.name, app.id, '====');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(OUT, `${app.name}_overview.png`), fullPage: true });
    const text = await page.innerText('body').catch(() => '');
    fs.writeFileSync(path.join(OUT, `${app.name}_overview.txt`), text, 'utf8');
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    const interesting = lines.filter(l =>
      /error|error|rechaz|certific|borrador|submission|env[ií]o|public|package|paquete|\.msix|acción|accion|atenci|failed|validat|pendiente/i.test(l)
    ).slice(0, 40);
    console.log('URL', page.url());
    console.log('INTERESTING:\n' + interesting.join('\n'));

    // packages page
    const pkgUrl = `https://partner.microsoft.com/es-es/dashboard/products/${app.id}/submissions`;
    await page.goto(pkgUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(OUT, `${app.name}_subs.png`), fullPage: true });
    const t2 = await page.innerText('body').catch(() => '');
    fs.writeFileSync(path.join(OUT, `${app.name}_subs.txt`), t2, 'utf8');
    const lines2 = t2.split('\n').map(s => s.trim()).filter(Boolean);
    console.log('SUBS SNIP:', lines2.filter(l => /error|certific|borrador|submission|paquete|\.msix|public/i.test(l)).slice(0, 25).join(' | '));
  }

  console.log('DONE screenshots in', OUT);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
