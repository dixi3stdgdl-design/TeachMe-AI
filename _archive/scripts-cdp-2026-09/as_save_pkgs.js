const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Find Save / Guardar
  const btns = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, a')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (t && /^(Guardar|Save|Continuar|Next)$/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) out.push({ t, tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2 });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('BTNS', JSON.stringify(btns));
  const save = btns.find(x => /^(Guardar|Save)$/i.test(x.t));
  if (save) {
    await page.mouse.click(save.x, save.y);
    console.log('clicked save');
    await page.waitForTimeout(6000);
  }
  const t = await page.innerText('body').catch(() => '');
  console.log(t.split('\n').map(s => s.trim()).filter(l => /1\.0\.|1\.1\.|remove|elimin|Validated|Completado/i.test(l)).slice(0, 20).join('\n'));
  await page.screenshot({ path: `${OUT}/as_pkgs_after_save.png`, fullPage: true });
  fs.writeFileSync(`${OUT}/as_pkgs_after.txt`, t);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
