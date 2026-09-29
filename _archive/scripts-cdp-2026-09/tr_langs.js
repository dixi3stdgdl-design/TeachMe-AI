const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('9NQN3RZ2Z655')) || ctx.pages()[0];
  await page.bringToFront();

  // Click the smaller "Agregar o quitar idiomas" link first - or find edit listing
  const all = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a, he-button, button, [role=button]')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const href = el.getAttribute('href') || '';
        if (t && t.length < 80 && /idioma|listing|descripci|store|editar|edit|screenshot|captura|imagen/i.test(t + href)) {
          const r = el.getBoundingClientRect();
          out.push({ t: t.slice(0, 70), href: href.slice(0, 120), tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2, w: r.width });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(all, null, 1));

  const lang = all.find(a => /Agregar o quitar idiomas/i.test(a.t));
  if (lang) {
    await page.mouse.click(lang.x, lang.y);
    await page.waitForTimeout(6000);
    console.log('URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/tr_langs.txt`, t);
    console.log(t.slice(0, 2800));
    await page.screenshot({ path: `${OUT}/tr_langs.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
