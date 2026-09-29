const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(8000);
  console.log('URL', page.url());
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/tr_listings3.txt`, t);
  console.log('LEN', t.length);
  console.log(t.slice(0, 5000));
  await page.screenshot({ path: `${OUT}/tr_listings3.png`, fullPage: true });

  // find screenshot related
  const els = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        if (own && own.length < 80 && /captura|screenshot|imagen|subir|upload|borrar|eliminar|arraig/i.test(own)) {
          const r = el.getBoundingClientRect();
          out.push({ t: own.slice(0, 70), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2 });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out.slice(0, 40);
  });
  console.log('SHOTS', JSON.stringify(els, null, 1).slice(0, 2500));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
