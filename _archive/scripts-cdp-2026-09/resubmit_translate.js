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

  const res = await page.evaluate(() => {
    function find(root, matcher, out = [], depth = 0) {
      if (depth > 15 || !root.querySelectorAll) return out;
      for (const el of root.querySelectorAll('*')) {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        const t = (own || (el.children.length === 0 ? (el.textContent || '').trim() : '')).replace(/\s+/g, ' ');
        if (t && matcher.test(t) && t.length < 80) {
          const r = el.getBoundingClientRect();
          out.push({ text: t.slice(0, 70), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height });
        }
        if (el.shadowRoot) find(el.shadowRoot, matcher, out, depth + 1);
      }
      return out;
    }
    return find(document, /Volver a enviar para la certificación/i);
  });
  console.log('HITS', JSON.stringify(res));
  const cands = res.sort((a, b) => (a.w * a.h) - (b.w * b.h));
  if (!cands.length) {
    const t = await page.innerText('body').catch(() => '');
    console.log('NO BTN', t.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 20).join(' | '));
  } else {
    const c = cands[0];
    console.log('CLICK', c);
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${OUT}/translate_after_click.png`, fullPage: true });
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/translate_resubmit_result.txt`, t);
    console.log('RESULT', t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|proceso|error|env/i.test(l)).slice(0, 15).join(' | '));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
