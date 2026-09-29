const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  // Click via element .click() not mouse coords
  const ok = await page.evaluate(() => {
    function find(root, out = [], depth = 0) {
      if (depth > 15 || !root.querySelectorAll) return out;
      for (const el of root.querySelectorAll('he-button, button, a, [role=button]')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/Volver a enviar para la certificación/i.test(t)) out.push(el);
        if (el.shadowRoot) find(el.shadowRoot, out, depth + 1);
      }
      return out;
    }
    const els = find(document);
    for (const el of els) {
      try {
        el.click();
        if (el.shadowRoot) {
          const inner = el.shadowRoot.querySelector('button, [role=button], a');
          if (inner) inner.click();
        }
        return 'clicked';
      } catch (e) { return 'err ' + e.message; }
    }
    return 'not found ' + els.length;
  });
  console.log('EVAL_CLICK', ok);
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/translate_modal_check.png`, fullPage: true });

  const after = await page.evaluate(() => {
    function find(root, matcher, out = [], depth = 0) {
      if (depth > 15 || !root.querySelectorAll) return out;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && matcher.test(t) && t.length < 70 && el.children.length <= 3) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) out.push({ text: t.slice(0, 60), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2 });
        }
        if (el.shadowRoot) find(el.shadowRoot, matcher, out, depth + 1);
      }
      return out;
    }
    return find(document, /Reenviar|Confirmar|Volver a enviar|Sí|Si|Submit|Continuar|Aceptar/i);
  });
  console.log('MODAL_BTNS', JSON.stringify(after, null, 1));

  for (const btn of after) {
    if (/Reenviar|Confirmar|Aceptar|Submit|Continuar/i.test(btn.text) || /^Sí$/i.test(btn.text) || /^Si$/i.test(btn.text)) {
      console.log('CONFIRM', btn.text);
      await page.mouse.click(btn.x, btn.y);
      await page.waitForTimeout(8000);
      break;
    }
  }
  await page.screenshot({ path: `${OUT}/translate_final.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/translate_final.txt`, t);
  console.log('FINAL', t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|proceso|error/i.test(l)).slice(0, 15).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
