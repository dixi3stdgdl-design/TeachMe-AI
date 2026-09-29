const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Dump structure around "Capturas de pantalla"
  const dump = await page.evaluate(() => {
    function findText(root, needle, d = 0) {
      if (d > 12 || !root.querySelectorAll) return null;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode;
        if (n.textContent && n.textContent.includes(needle)) return n.parentElement;
      }
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot) {
          const r = findText(el.shadowRoot, needle, d + 1);
          if (r) return r;
        }
      }
      return null;
    }
    const h = findText(document, 'Capturas de pantalla');
    if (!h) return 'no heading';
    let section = h;
    for (let i = 0; i < 8 && section; i++) {
      if (section.innerText && section.innerText.includes('Capturas') && section.innerText.length < 2500) break;
      section = section.parentElement;
    }
    const html = section ? section.outerHTML.slice(0, 6000) : '';
    // also list buttons inside
    const btns = [];
    if (section) {
      const walk = (root, d = 0) => {
        if (d > 10 || !root.querySelectorAll) return;
        for (const el of root.querySelectorAll('he-button, button, [role=button], a')) {
          const t = (el.innerText || el.textContent || '').trim();
          const r = el.getBoundingClientRect();
          btns.push({ t: t.slice(0, 40), tag: el.tagName, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
          if (el.shadowRoot) walk(el.shadowRoot, d + 1);
        }
      };
      walk(section);
    }
    return { htmlHead: html.slice(0, 2500), btns };
  });
  console.log(JSON.stringify(dump, null, 1).slice(0, 5000));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
