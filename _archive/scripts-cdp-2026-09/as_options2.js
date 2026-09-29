const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const hit = await page.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (n.textContent && n.textContent.trim() === 'Opciones de envío') {
        let el = n.parentElement;
        for (let i = 0; i < 6 && el; i++) {
          if (['A','BUTTON','HE-BUTTON','HE-CARD'].includes(el.tagName) || el.onclick) break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height };
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
    fs.writeFileSync(`${OUT}/as_options2.txt`, t);
    console.log(t.slice(0, 3500));
    await page.screenshot({ path: `${OUT}/as_options2.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
