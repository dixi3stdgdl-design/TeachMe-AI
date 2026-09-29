const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  const all = await page.evaluate(() => {
    const out = { btns: [], imgs: [], files: [] };
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (t && t.length < 25 && /Eliminar|Quitar|Borrar|X|✕|Remove/i.test(t) && el.children.length <= 2 && r.width > 0) {
          out.btns.push({ t: t.slice(0, 20), tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) });
        }
        if (el.tagName === 'IMG' && r.width > 80) {
          out.imgs.push({ src: (el.src || '').slice(-60), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
        }
        if (el.tagName === 'INPUT' && el.type === 'file') {
          out.files.push({ accept: el.accept, multiple: el.multiple, name: el.name || '', id: el.id || '' });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(all, null, 1).slice(0, 6000));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
