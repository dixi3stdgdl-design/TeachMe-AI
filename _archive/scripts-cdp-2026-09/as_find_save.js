const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const all = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, [role=button], a')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (t && t.length < 40 && r.width > 0) {
          out.push({ t: t.slice(0, 35), tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  const interesting = all.filter(x => /guard|save|continu|next|submit|env|remove|elim|confirm|ok|listo/i.test(x.t));
  console.log('INTERESTING', JSON.stringify(interesting, null, 1));
  console.log('ALL_SAMPLE', JSON.stringify(all.slice(0, 25), null, 1));
  await page.screenshot({ path: `${OUT}/as_pkgs_ui.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
