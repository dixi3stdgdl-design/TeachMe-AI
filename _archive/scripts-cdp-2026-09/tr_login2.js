const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const nodes = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.length < 80 && /inicio de sesión|iniciar sesión|sesión ha caducado|caducado/i.test(t) && el.children.length <= 3) {
          const r = el.getBoundingClientRect();
          out.push({ t: t.slice(0, 70), tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), w: Math.round(r.width), vis: r.width > 0 });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(nodes, null, 1));

  const btn = nodes.find(n => /^Inicio de sesión$/i.test(n.t) && n.vis);
  if (btn) {
    console.log('CLICK', btn);
    await page.mouse.click(btn.x, btn.y);
    await page.waitForTimeout(6000);
    for (const p of ctx.pages()) console.log('PAGE', await p.title(), p.url().slice(0, 130));
    await page.screenshot({ path: `${OUT}/tr_after_login_click.png` });
    const t = await page.innerText('body').catch(() => '');
    console.log(t.slice(0, 600).replace(/\n/g, ' | '));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
