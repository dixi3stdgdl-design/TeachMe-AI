const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);

  // Find exact button coords and click with mouse
  const hit = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return null;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/Enviar para certificación/i.test(t) && t.length < 40) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) return { x: r.x + r.width/2, y: r.y + r.height/2, t, w: r.width };
        }
        if (el.shadowRoot) {
          const r = walk(el.shadowRoot, d + 1);
          if (r) return r;
        }
      }
      return null;
    };
    return walk(document);
  });
  console.log('HIT', JSON.stringify(hit));
  if (hit) {
    await page.mouse.click(hit.x, hit.y);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/tr_modal2.png`, fullPage: true });
    const t1 = await page.innerText('body').catch(() => '');
    console.log('MODAL_SNIP', t1.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 25).join(' | '));

    // Confirm
    const conf = await page.evaluate(() => {
      const out = [];
      const walk = (root, d = 0) => {
        if (d > 15 || !root.querySelectorAll) return;
        for (const el of root.querySelectorAll('he-button, button')) {
          const t = (el.innerText || el.textContent || '').trim();
          const r = el.getBoundingClientRect();
          if (t && r.width > 0 && t.length < 40 && /enviar|confirm|sí|si|submit|acept/i.test(t)) {
            out.push({ t, x: r.x + r.width/2, y: r.y + r.height/2 });
          }
          if (el.shadowRoot) walk(el.shadowRoot, d + 1);
        }
      };
      walk(document);
      return out;
    });
    console.log('CONF', JSON.stringify(conf));
    for (const c of conf) {
      if (/Enviar para certificación|Confirmar|Sí|^Si$|Aceptar/i.test(c.t)) {
        await page.mouse.click(c.x, c.y);
        await page.waitForTimeout(8000);
        break;
      }
    }
  }
  const t = await page.innerText('body').catch(() => '');
  console.log('RESULT', t.split('\n').map(s => s.trim()).filter(l => /borrador|certific|env|error|proceso/i.test(l)).slice(0, 12).join(' | '));
  await page.screenshot({ path: `${OUT}/tr_submit_result.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
