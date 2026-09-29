const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';

function findInShadows(root, matcher, out = [], depth = 0) {
  if (depth > 12) return out;
  const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
  for (const el of els) {
    const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
    if (t && t.length < 80 && matcher.test(t) && el.children.length <= 2) {
      const r = el.getBoundingClientRect();
      out.push({ text: t.slice(0, 60), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height, depth });
    }
    if (el.shadowRoot) findInShadows(el.shadowRoot, matcher, out, depth + 1);
  }
  return out;
}

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  const res = await page.evaluate(() => {
    function find(root, matcher, out = [], depth = 0) {
      if (depth > 15 || !root.querySelectorAll) return out;
      for (const el of root.querySelectorAll('*')) {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        const t = (own || (el.children.length === 0 ? (el.textContent || '').trim() : '')).replace(/\s+/g, ' ');
        if (t && matcher.test(t) && t.length < 80) {
          const r = el.getBoundingClientRect();
          out.push({ text: t.slice(0, 70), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height, depth });
        }
        if (el.shadowRoot) find(el.shadowRoot, matcher, out, depth + 1);
      }
      return out;
    }
    return {
      resubmit: find(document, /Volver a enviar para la certificación/i),
      report: find(document, /Ver el informe/i),
      buttons: find(document, /^(Volver a enviar|Ver el informe|Eliminar envío|Continuar|Guardar|Enviar)$/i)
    };
  });
  console.log(JSON.stringify(res, null, 1));
  fs.writeFileSync(`${OUT}/shadow_hits.json`, JSON.stringify(res, null, 2));

  // click the smallest / most button-like resubmit
  const cands = (res.resubmit || []).sort((a, b) => (a.w * a.h) - (b.w * b.h));
  if (cands.length) {
    const c = cands[0];
    console.log('CLICKING', c);
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${OUT}/assistant_after_shadow_click.png`, fullPage: true });
    const after = await page.evaluate(() => {
      function find(root, matcher, out = [], depth = 0) {
        if (depth > 15 || !root.querySelectorAll) return out;
        for (const el of root.querySelectorAll('*')) {
          const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
          if (t && matcher.test(t) && t.length < 60 && el.children.length <= 2) {
            const r = el.getBoundingClientRect();
            out.push({ text: t.slice(0, 50), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2 });
          }
          if (el.shadowRoot) find(el.shadowRoot, matcher, out, depth + 1);
        }
        return out;
      }
      return find(document, /Volver a enviar|Reenviar|Confirmar|Sí,|Si,|Submit|Continuar/i);
    });
    console.log('AFTER_BTNS', JSON.stringify(after));
    // try confirm
    for (const btn of after) {
      if (btn.w !== 0 && /Reenviar|Confirmar|Volver a enviar|Sí|Si|Submit/i.test(btn.text) && btn.text !== 'Volver a enviar para la certificación') {
        await page.mouse.click(btn.x, btn.y);
        await page.waitForTimeout(8000);
        break;
      }
    }
    await page.screenshot({ path: `${OUT}/assistant_final_resubmit.png`, fullPage: true });
    const t = await page.innerText('body').catch(() => '');
    console.log('FINAL', t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|proceso|error/i.test(l)).slice(0, 15).join(' | '));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
