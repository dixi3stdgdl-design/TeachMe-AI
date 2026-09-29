const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Click delete (x=665) from bottom to top
  const ys = [1677, 1431, 1185, 939];
  for (const y of ys) {
    console.log('click delete at', y);
    await page.mouse.click(665, y);
    await page.waitForTimeout(2000);
    // confirm dialog?
    const modal = await page.evaluate(() => {
      function walk(root, out = [], d = 0) {
        if (d > 12 || !root.querySelectorAll) return out;
        for (const el of root.querySelectorAll('he-button, button')) {
          const t = (el.innerText || el.textContent || '').trim();
          if (t && /eliminar|quitar|sí|si|confirm|aceptar|ok/i.test(t) && t.length < 30) {
            const r = el.getBoundingClientRect();
            if (r.width > 0) out.push({ t, x: r.x + r.width/2, y: r.y + r.height/2 });
          }
          if (el.shadowRoot) walk(el.shadowRoot, out, d + 1);
        }
        return out;
      }
      return walk(document);
    });
    console.log('modal btns', JSON.stringify(modal));
    const conf = modal.find(m => /^(Sí|Si|Eliminar|Confirmar|Aceptar|OK)$/i.test(m.t));
    if (conf) {
      await page.mouse.click(conf.x, conf.y);
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: `${OUT}/tr_del_${y}.png` });
  }

  const t = await page.innerText('body').catch(() => '');
  const snip = t.split('\n').map(s => s.trim()).filter(l => /Captura|Escritorio|Agregar|necesita/i.test(l)).slice(0, 15);
  console.log('AFTER', snip.join(' | '));
  fs.writeFileSync(`${OUT}/tr_after_delete.txt`, t);
  await page.screenshot({ path: `${OUT}/tr_after_delete.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
