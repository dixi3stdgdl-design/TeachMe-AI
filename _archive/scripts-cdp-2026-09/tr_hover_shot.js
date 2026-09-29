const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Hover first screenshot
  await page.mouse.move(520, 1020);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/tr_hover_shot.png`, fullPage: false });

  const btns = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (t && t.length < 20 && r.width > 0 && r.y > 880 && r.y < 1900 && /eliminar|quitar|borrar|x|✕|more|⋮|trash/i.test(t + (el.getAttribute('aria-label')||''))) {
          out.push({ t, tag: el.tagName, aria: el.getAttribute('aria-label'), x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('HOVER_BTNS', JSON.stringify(btns, null, 1));

  // Also check for any he-button in that y range
  const he = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, [role=button]')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.y > 880 && r.y < 1950) {
          out.push({ t: (el.innerText || el.textContent || '').trim().slice(0, 30), tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('HE_BTNS', JSON.stringify(he, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
