const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Find screenshot section and its delete buttons + file inputs
  const info = await page.evaluate(() => {
    const out = { deletes: [], inputs: [] };
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, input[type=file]')) {
        const t = (el.innerText || el.textContent || '').trim();
        const r = el.getBoundingClientRect();
        if (/Eliminar|Quitar|Remove|Delete/i.test(t) && r.y > 700 && r.y < 2200 && r.width > 0) {
          out.deletes.push({ t: t.slice(0, 30), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2 });
        }
        if (el.type === 'file' || el.tagName === 'INPUT') {
          out.inputs.push({
            type: el.type, accept: el.accept || '', multiple: el.multiple,
            x: r.x, y: r.y, w: r.width, h: r.height
          });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: `${OUT}/tr_before_delete.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
