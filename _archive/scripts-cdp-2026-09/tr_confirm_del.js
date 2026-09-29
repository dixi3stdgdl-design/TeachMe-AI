const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/tr_modal.png`, fullPage: false });

  const dialog = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-dialog, he-modal, [role=dialog], he-flyout, he-callout, .he-dialog')) {
        const t = (el.innerText || '').trim().slice(0, 400);
        if (t) out.push({ tag: el.tagName, t });
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    // also any visible button with eliminar/si/confirmar
    const btns = [];
    const walk2 = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        const r = el.getBoundingClientRect();
        if (t && r.width > 0 && /eliminar|sí|si|confirmar|aceptar|ok|remove/i.test(t) && t.length < 25) {
          btns.push({ t, x: r.x + r.width/2, y: r.y + r.height/2 });
        }
        if (el.shadowRoot) walk2(el.shadowRoot, d + 1);
      }
    };
    walk2(document);
    return { dialogs: out, btns };
  });
  console.log(JSON.stringify(dialog, null, 1));

  // Click Eliminar/Sí if dialog
  const conf = dialog.btns.find(x => /^(Eliminar|Sí|Si|Confirmar|Aceptar|OK|Quitar)$/i.test(x.t) && x.y < 2500);
  if (conf) {
    console.log('CONFIRM', conf);
    await page.mouse.click(conf.x, conf.y);
    await page.waitForTimeout(2500);
  }
  const n = await page.evaluate(() => document.querySelectorAll('img[alt="listing-screenshot-image"]').length);
  console.log('IMGS', n);
  await page.screenshot({ path: `${OUT}/tr_after_modal.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
