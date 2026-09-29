const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  const info = await page.evaluate(() => {
    return [...document.querySelectorAll('img.thumbnail-image')].filter(im => {
      const r = im.getBoundingClientRect();
      return r.y > 850 && r.y < 2000;
    }).map((im, i) => {
      // sample colors from a canvas
      const c = document.createElement('canvas');
      c.width = 20; c.height = 12;
      const x = c.getContext('2d');
      x.drawImage(im, 0, 0, 20, 12);
      const d = x.getImageData(0, 0, 20, 12).data;
      let r = 0, g = 0, bl = 0;
      for (let k = 0; k < d.length; k += 4) { r += d[k]; g += d[k+1]; bl += d[k+2]; }
      const n = d.length / 4;
      return { i, avg: [Math.round(r/n), Math.round(g/n), Math.round(bl/n)], w: im.naturalWidth, h: im.naturalHeight };
    });
  });
  console.log(JSON.stringify(info));
  // click Guardar / Save
  const saved = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return false;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/^(Guardar|Save)$/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
            if (inner) inner.click(); else el.click();
            return true;
          }
        }
        if (el.shadowRoot) if (walk(el.shadowRoot, d + 1)) return true;
      }
      return false;
    };
    return walk(document);
  });
  console.log('saved', saved);
  await page.waitForTimeout(5000);
  const t = await page.innerText('body').catch(() => '');
  console.log(/caducado|error|guardad|Guardado|Completado/i.test(t) ? t.split('\n').map(s => s.trim()).filter(l => /guard|error|caduc|complet/i.test(l)).slice(0, 8).join(' | ') : 'page ok');
  await page.screenshot({ path: 'D:/ToolTip AI/scripts/cdp_status_now/tr_saved.png', fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
