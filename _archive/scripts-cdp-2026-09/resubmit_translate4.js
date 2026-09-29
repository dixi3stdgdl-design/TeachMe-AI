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

  const info = await page.evaluate(() => {
    function find(root, d = 0) {
      if (d > 12 || !root.querySelectorAll) return [];
      const out = [];
      for (const el of root.querySelectorAll('he-button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/Volver a enviar/i.test(t)) {
          out.push({
            outer: el.outerHTML.slice(0, 800),
            disabled: el.disabled,
            aria: el.getAttribute('aria-disabled'),
            cls: el.className
          });
          if (el.shadowRoot) {
            out.push({ shadow: el.shadowRoot.innerHTML.slice(0, 800) });
          }
        }
        if (el.shadowRoot) out.push(...find(el.shadowRoot, d + 1));
      }
      return out;
    }
    return find(document);
  });
  console.log(JSON.stringify(info, null, 1));

  // Scroll button into view and click via keyboard
  const btn = page.locator('he-button', { hasText: 'Volver a enviar para la certificación' }).first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await btn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/translate_enter.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  console.log('AFTER_ENTER', t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|proceso|error|confirm|modal|enviar/i.test(l)).slice(0, 20).join(' | '));

  // Also try API from page context using cookies
  const api = await page.evaluate(async () => {
    const urls = [
      '/api/v1/my/applications/9NQN3RZ2Z655',
      '/dashboard/api/v1/my/applications/9NQN3RZ2Z655'
    ];
    const results = [];
    for (const u of urls) {
      try {
        const r = await fetch(u, { credentials: 'include' });
        results.push({ u, s: r.status, t: (await r.text()).slice(0, 200) });
      } catch (e) { results.push({ u, e: e.message }); }
    }
    return results;
  });
  console.log('API', JSON.stringify(api));

  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
