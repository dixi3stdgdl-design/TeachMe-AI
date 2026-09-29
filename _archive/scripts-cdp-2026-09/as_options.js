const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Assistant submission options
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/submissionoptions', {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForTimeout(5000);
  let t = await page.innerText('body').catch(() => '');
  console.log('AS OPTIONS URL', page.url());
  console.log(t.slice(0, 3000));
  fs.writeFileSync(`${OUT}/as_options.txt`, t);
  await page.screenshot({ path: `${OUT}/as_options.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
