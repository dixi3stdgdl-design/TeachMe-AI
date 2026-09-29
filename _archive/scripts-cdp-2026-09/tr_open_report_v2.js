const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('9NQN3RZ2Z655')) || ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(3000);

  // Find and click "Ver el informe" precisely
  const box = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.textContent && n.textContent.trim() === 'Ver el informe') {
        let el = n.parentElement;
        for (let i = 0; i < 8 && el; i++) {
          const tag = el.tagName;
          if (tag === 'A' || tag === 'BUTTON' || tag === 'HE-BUTTON' || el.getAttribute('role') === 'button' || el.onclick) break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2, tag: el.tagName, html: el.outerHTML.slice(0, 300) };
      }
    }
    return null;
  });
  console.log('REPORT_NODE', JSON.stringify(box));
  if (box) {
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${OUT}/tr_report_v2.png`, fullPage: true });
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/tr_report_v2.txt`, t);
    // also search all frames and shadow
    const extra = await page.evaluate(() => {
      function walk(root, out = [], d = 0) {
        if (d > 12 || !root.querySelectorAll) return out;
        for (const el of root.querySelectorAll('he-card, he-dialog, he-modal, [role=dialog], .report, .certification')) {
          const t = (el.innerText || '').trim();
          if (t && t.length > 40) out.push(t.slice(0, 500));
          if (el.shadowRoot) walk(el.shadowRoot, out, d + 1);
        }
        return out;
      }
      return walk(document);
    });
    console.log('EXTRA', JSON.stringify(extra).slice(0, 2000));
    console.log('BODY_SNIP', t.split('\n').map(s => s.trim()).filter(l => /10\.|policy|error|must|fail|screenshot|captura|invalid|require|WIP|package|E[0-9]/i.test(l)).slice(0, 30).join('\n'));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
