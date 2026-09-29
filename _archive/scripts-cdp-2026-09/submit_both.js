const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';

async function submit(page, id, name) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const hit = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return null;
      for (const el of root.querySelectorAll('he-button, button, a')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/^Enviar para certificación$/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
            if (inner) inner.click(); else el.click();
            return { x: r.x, y: r.y, t };
          }
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
  console.log(name, 'submit click', hit);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/${name}_submit_modal.png`, fullPage: true });

  // Confirm if modal
  const conf = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (t && t.length < 40 && /Enviar|Confirmar|Sí|Si|Submit|Continuar|Aceptar/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) out.push({ t, x: r.x + r.width/2, y: r.y + r.height/2 });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(name, 'modal', JSON.stringify(conf));
  const c = conf.find(x => /Confirmar|Enviar para certificación|Sí|^Si$|Submit|Aceptar/i.test(x.t) && !/Enviar correo/i.test(x.t));
  if (c) {
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(8000);
  }
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/${name}_after_submit.txt`, t);
  console.log(name, 'RESULT', t.split('\n').map(s => s.trim()).filter(l => /borrador|certific|env[ií]o|error|proceso/i.test(l)).slice(0, 12).join(' | '));
  await page.screenshot({ path: `${OUT}/${name}_after_submit.png`, fullPage: true });
}

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await submit(page, '9N3D02KXKD3D', 'assistant');
  await submit(page, '9NQN3RZ2Z655', 'translate');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
