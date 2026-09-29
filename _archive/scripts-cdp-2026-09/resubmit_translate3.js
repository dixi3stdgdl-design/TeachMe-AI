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

  // Playwright pierces open shadow roots
  const btn = page.locator('he-button', { hasText: 'Volver a enviar para la certificación' }).first();
  console.log('count', await btn.count());
  await btn.click({ force: true, timeout: 15000 });
  console.log('clicked he-button');
  await page.waitForTimeout(5000);

  // Look for any dialog
  const dialog = page.locator('he-dialog, he-modal, [role=dialog], .modal, he-flyout').first();
  if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
    const dt = await dialog.innerText().catch(() => '');
    console.log('DIALOG', dt.slice(0, 500));
    await page.screenshot({ path: `${OUT}/translate_dialog.png`, fullPage: true });
  }

  // Broad search for confirm buttons now
  const texts = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, [role=button], a')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.length < 50) out.push(t);
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return [...new Set(out)];
  });
  console.log('ALL_BTNS', JSON.stringify(texts.filter(t => /env|reenv|confirm|sí|si|submit|cert|continuar|aceptar|ok/i.test(t))));

  // Click any confirm-like he-button
  const confirmLoc = page.locator('he-button, button').filter({ hasText: /Reenviar|Confirmar|Volver a enviar|Continuar|Aceptar|Sí/i });
  const n = await confirmLoc.count();
  for (let i = 0; i < n; i++) {
    const t = await confirmLoc.nth(i).innerText().catch(() => '');
    console.log('cand', i, t.trim().slice(0, 50));
    if (/Reenviar|Confirmar|Continuar|Aceptar/i.test(t) && !/Volver a enviar para la certificación/i.test(t)) {
      await confirmLoc.nth(i).click({ force: true });
      await page.waitForTimeout(8000);
      console.log('confirmed', t);
      break;
    }
  }

  await page.screenshot({ path: `${OUT}/translate_end.png`, fullPage: true });
  const body = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/translate_end.txt`, body);
  console.log('FINAL', body.split('\n').map(s => s.trim()).filter(l => /certific|borrador|proceso|error/i.test(l)).slice(0, 12).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
