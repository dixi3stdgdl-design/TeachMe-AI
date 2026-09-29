const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  // All interactive-ish elements containing enviar/certif/informe
  const hits = await page.evaluate(() => {
    const out = [];
    const nodes = document.querySelectorAll('*');
    for (const n of nodes) {
      const t = (n.innerText || '').trim().replace(/\s+/g, ' ');
      if (!t || t.length > 80) continue;
      if (/Volver a enviar|Ver el informe|Eliminar envío|Enviar para cert/i.test(t) && n.children.length === 0) {
        let el = n;
        for (let i = 0; i < 6 && el.parentElement; i++) {
          if (['A','BUTTON'].includes(el.tagName) || el.getAttribute('role') === 'button' || el.onclick) break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        out.push({ text: t, tag: el.tagName, cls: (el.className || '').toString().slice(0, 80), x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height });
      }
    }
    return out;
  });
  console.log(JSON.stringify(hits, null, 1));

  // Scroll and screenshot
  await page.screenshot({ path: `${OUT}/assistant_overview_target.png`, fullPage: true });
  fs.writeFileSync(`${OUT}/assistant_hits.json`, JSON.stringify(hits, null, 2));

  // Click the resubmit text node parent
  const target = hits.find(h => /Volver a enviar/i.test(h.text));
  if (target) {
    console.log('CLICK', target);
    await page.mouse.click(target.x, target.y);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT}/assistant_resubmit_step.png`, fullPage: true });
    const t = await page.innerText('body').catch(() => '');
    console.log('AFTER_CLICK', t.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 35).join(' | '));
    // find confirm
    const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button,[role=button],a')).map(n => ({
      t: (n.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      disabled: n.disabled
    })).filter(x => x.t && x.t.length < 50));
    console.log('BTNS', JSON.stringify(btns.filter(x => /env|confirm|sí|si|submit|reenv/i.test(x.t))));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
