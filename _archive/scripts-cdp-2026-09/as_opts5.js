const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(4000);

  const hit = await page.evaluate(() => {
    const hosts = [...document.querySelectorAll('*')];
    for (const host of hosts) {
      const t = (host.innerText || '').trim();
      if (t.startsWith('Opciones de envío') && t.includes('Incompleto') && t.length < 40) {
        const r = host.getBoundingClientRect();
        if (r.width > 50) return { tag: host.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width };
      }
    }
    // fallback
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      if (w.currentNode.textContent.trim() === 'Incompleto') {
        let el = w.currentNode.parentElement;
        for (let i = 0; i < 8 && el; i++) {
          if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'HE-CARD' || el.onclick) break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width };
      }
    }
    return null;
  });
  console.log('HIT', JSON.stringify(hit));
  if (!hit) {
    console.log((await page.innerText('body')).slice(0, 1500));
  } else {
    await page.mouse.click(hit.x, hit.y);
    await page.waitForTimeout(6000);
    console.log('URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/as_opts_open.txt`, t);
    console.log(t.slice(0, 4500));
    await page.screenshot({ path: `${OUT}/as_opts_open.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
