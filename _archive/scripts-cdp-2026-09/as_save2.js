const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  // Dump every he-button outerHTML snippet for empty-text primary-looking ones
  const dumps = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button')) {
        const r = el.getBoundingClientRect();
        const t = (el.innerText || el.textContent || '').trim();
        if (r.width > 30) {
          out.push({
            t: t.slice(0, 30) || '(empty)',
            app: el.getAttribute('appearance') || '',
            cls: (el.className || '').toString().slice(0, 50),
            x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width)
          });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(dumps, null, 1).slice(0, 4000));

  // Try clicking empty appearance=primary buttons at bottom
  const save = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return null;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        const app = el.getAttribute('appearance') || '';
        const r = el.getBoundingClientRect();
        if (r.width > 40 && (app === 'primary' || /guard|save/i.test(t))) {
          const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
          if (inner) inner.click(); else el.click();
          return { t: t || app, x: r.x, y: r.y };
        }
        if (el.shadowRoot) {
          const r2 = walk(el.shadowRoot, d + 1);
          if (r2) return r2;
        }
      }
      return null;
    };
    return walk(document);
  });
  console.log('SAVE_CLICK', save);
  await page.waitForTimeout(5000);
  const t = await page.innerText('body').catch(() => '');
  console.log('AFTER', t.split('\n').map(s => s.trim()).filter(l => /1\.0\.|1\.1\.|remove|Validated|Completado|error/i.test(l)).slice(0, 18).join('\n'));
  await page.screenshot({ path: `${OUT}/as_pkgs_saved2.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
