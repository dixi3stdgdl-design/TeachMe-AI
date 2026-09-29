const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Click Revert on the 1.1.3.0 that was wrongly marked
  const rev = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a, button, he-button')];
    for (const el of links) {
      const t = (el.innerText || el.textContent || '').trim();
      if (t === 'Revert') {
        const r = el.getBoundingClientRect();
        if (r.width > 0) {
          el.click();
          return { x: r.x, y: r.y };
        }
      }
    }
    return null;
  });
  console.log('revert', rev);
  await page.waitForTimeout(3000);

  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/as_pkgs_revert.txt`, t);
  console.log(t.split('\n').map(s => s.trim()).filter(l => /1\.0\.|1\.1\.|remove|Revert|Validated|will be removed/i.test(l)).slice(0, 25).join('\n'));
  await page.screenshot({ path: `${OUT}/as_pkgs_revert.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
