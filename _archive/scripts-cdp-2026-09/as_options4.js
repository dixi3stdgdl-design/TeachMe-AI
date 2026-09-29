const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Click Incompleto / card / chevron for Opciones de envío
  const hit = await page.evaluate(() => {
    const hosts = [...document.querySelectorAll('app-submission-options, .submission-option, he-card')];
    for (const host of hosts) {
      const t = (host.innerText || '').trim();
      if (t.includes('Opciones de envío')) {
        // find any clickable inside
        const clickables = host.querySelectorAll('a, button, he-button, [role=button], [routerlink]');
        for (const el of clickables) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            return { via: el.tagName + ' ' + (el.innerText || el.getAttribute('href') || '').slice(0, 40), x: r.x + r.width/2, y: r.y + r.height/2 };
          }
        }
        // click host itself
        const r = host.getBoundingClientRect();
        return { via: 'host', x: r.x + r.width - 40, y: r.y + r.height/2 };
      }
    }
    return null;
  });
  console.log('HIT', hit);
  if (hit) {
    await page.mouse.click(hit.x, hit.y);
    await page.waitForTimeout(5000);
    console.log('URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    console.log(t.slice(0, 4000));
    fs.writeFileSync(`${OUT}/as_options4.txt`, t);
    await page.screenshot({ path: `${OUT}/as_options4.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
