const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
async function dumpReport(page, id, name) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const exact = page.getByText('Ver el informe', { exact: true }).first();
  const alt = page.locator('button, a, he-link, span, div').filter({ hasText: /^Ver el informe$/ }).first();
  let clicked = false;
  for (const loc of [exact, alt]) {
    try {
      if (await loc.isVisible({ timeout: 3000 })) {
        await loc.click({ force: true });
        clicked = true;
        console.log(name, 'clicked report');
        break;
      }
    } catch (e) { console.log(name, 'click fail', e.message); }
  }
  if (!clicked) {
    // try click by coordinates from text node
    const box = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode;
        if (n.textContent && n.textContent.trim() === 'Ver el informe') {
          const el = n.parentElement;
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, tag: el.tagName, html: el.outerHTML.slice(0, 200) };
        }
      }
      return null;
    });
    console.log(name, 'box', box);
    if (box) {
      await page.mouse.click(box.x, box.y);
      clicked = true;
    }
  }
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/${name}_report2.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/${name}_report2.txt`, t);
  // If modal iframe, try frames
  for (const f of page.frames()) {
    try {
      const ft = await f.innerText('body');
      if (ft && ft.length > 50 && ft !== t) {
        fs.writeFileSync(`${OUT}/${name}_report_frame.txt`, ft);
        console.log(name, 'FRAME', ft.slice(0, 3000));
      }
    } catch {}
  }
  console.log('====', name, '====');
  const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
  console.log(lines.filter(l => /10\.|policy|política|must|should|fail|error|invalid|screenshot|captura|package|cert|not |cannot|unable|require|PFD|privacy|privacidad|E9|WIP/i.test(l)).slice(0, 40).join('\n') || t.slice(0, 2500));
}
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await dumpReport(page, '9N3D02KXKD3D', 'assistant');
  await dumpReport(page, '9NQN3RZ2Z655', 'translate');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
