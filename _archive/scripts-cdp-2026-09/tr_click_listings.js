const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('9NQN3RZ2Z655')) || ctx.pages()[0];
  await page.bringToFront();

  const box = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const t = (n.textContent || '').trim();
      if (t && /Descripciones de Store|Agregar o quitar idiomas|Store listing/i.test(t) && t.length < 60) {
        let el = n.parentElement;
        for (let i = 0; i < 6 && el; i++) {
          if (['A','BUTTON','HE-BUTTON','HE-CARD'].includes(el.tagName) || el.getAttribute('role') === 'button' || el.onclick) break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        hits.push({ text: t, tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height });
      }
    }
    return hits;
  });
  console.log(JSON.stringify(box, null, 1));

  const target = box.find(h => /Descripciones de Store/i.test(h.text) && h.w < 900);
  if (target) {
    console.log('CLICK', target);
    await page.mouse.click(target.x, target.y);
    await page.waitForTimeout(5000);
    console.log('AFTER', page.url());
    const t = await page.innerText('body').catch(() => '');
    console.log(t.slice(0, 2500));
    fs.writeFileSync(`${OUT}/tr_listings2.txt`, t);
    await page.screenshot({ path: `${OUT}/tr_listings2.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
