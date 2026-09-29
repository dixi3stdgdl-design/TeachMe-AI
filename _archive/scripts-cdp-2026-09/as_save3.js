const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // all iframes
  const frames = page.frames().map(f => f.url().slice(0, 100));
  console.log('FRAMES', frames);

  // text nodes containing save
  const texts = await page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const t = w.currentNode.textContent.trim();
      if (t && /guard|save|continuar/i.test(t) && t.length < 40) {
        const el = w.currentNode.parentElement;
        const r = el.getBoundingClientRect();
        out.push({ t, tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), w: Math.round(r.width) });
      }
    }
    return out;
  });
  console.log('TEXTS', JSON.stringify(texts, null, 1));

  // Try pressing Tab and look for focused button
  await page.keyboard.press('Control+End');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/as_bottom.png` });

  // Look at last 500 chars of body innerText
  const t = await page.innerText('body');
  console.log('TAIL', JSON.stringify(t.slice(-600)));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
