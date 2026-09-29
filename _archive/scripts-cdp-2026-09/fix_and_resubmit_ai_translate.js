const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';

async function openProduct(page, id) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, {
    waitUntil: 'domcontentloaded', timeout: 90000
  });
  await page.waitForTimeout(6000);
}

async function tryCompleteSubmissionOptions(page, name) {
  console.log('\n==== OPCIONES DE ENVÍO', name, '====');
  // Find link to submission options
  const link = page.locator('a, button').filter({ hasText: /Opciones de envío/i }).first();
  if (await link.isVisible({ timeout: 4000 }).catch(() => false)) {
    await link.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT}/${name}_options.png`, fullPage: true });
    const t = await page.innerText('body').catch(() => '');
    console.log('OPTIONS PAGE', t.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40).join(' | '));

    // Check the publish-when-certified option
    const checks = [
      page.locator('input[type=checkbox]'),
      page.locator('[role=checkbox]'),
      page.locator('he-checkbox, he-switch')
    ];
    for (const c of checks) {
      const n = await c.count();
      if (n > 0) {
        console.log('checkboxes', n);
        for (let i = 0; i < Math.min(n, 5); i++) {
          try {
            const el = c.nth(i);
            const checked = await el.isChecked().catch(() => null);
            const label = await el.evaluate(n => (n.getAttribute('aria-label') || n.closest('label')?.innerText || n.parentElement?.innerText || '').slice(0, 120));
            console.log(i, 'checked=', checked, 'label=', label.replace(/\n/g, ' '));
            if (checked === false && /publicar|publish|certific/i.test(label)) {
              await el.click({ force: true });
              console.log('clicked checkbox', i);
            }
          } catch (e) {}
        }
      }
    }

    // Try save
    for (const txt of [/Guardar/i, /Save/i, /Continuar/i, /Aceptar/i]) {
      const b = page.locator('button').filter({ hasText: txt }).first();
      if (await b.isVisible({ timeout: 2000 }).catch(() => false)) {
        try { await b.click(); console.log('saved with', txt); await page.waitForTimeout(3000); } catch {}
      }
    }
    await page.screenshot({ path: `${OUT}/${name}_options_after.png`, fullPage: true });
    const t2 = await page.innerText('body').catch(() => '');
    console.log('AFTER', t2.split('\n').map(s => s.trim()).filter(l => /Completado|Incompleto|Opciones|publicar/i.test(l)).slice(0, 15).join(' | '));
  }
}

async function resubmit(page, name) {
  console.log('\n==== REENVÍO', name, '====');
  await openProduct(page, page.url().match(/products\/([A-Z0-9]+)/)?.[1] || '');
}

async function resubmitId(page, id, name) {
  await openProduct(page, id);
  await page.screenshot({ path: `${OUT}/${name}_pre_resubmit.png`, fullPage: true });
  const btn = page.locator('button, a').filter({ hasText: /Volver a enviar para la certificación/i }).first();
  if (!(await btn.isVisible({ timeout: 5000 }).catch(() => false))) {
    console.log(name, 'NO RESUBMIT BTN');
    const t = await page.innerText('body').catch(() => '');
    console.log(t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|error|env/i.test(l)).slice(0, 12).join(' | '));
    return;
  }
  await btn.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/${name}_resubmit_modal.png`, fullPage: true });
  const modalText = await page.innerText('body').catch(() => '');
  console.log('MODAL', modalText.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 25).join(' | '));

  for (const re of [/Volver a enviar/i, /Reenviar/i, /Confirmar/i, /Sí/i, /Si/i, /Submit/i, /Enviar/i]) {
    const cand = page.locator('button').filter({ hasText: re });
    const n = await cand.count();
    for (let i = n - 1; i >= 0; i--) {
      const b = cand.nth(i);
      if (await b.isVisible({ timeout: 1500 }).catch(() => false)) {
        const label = await b.innerText().catch(() => '?');
        console.log('CONFIRM', label);
        await b.click();
        await page.waitForTimeout(8000);
        await page.screenshot({ path: `${OUT}/${name}_resubmit_done.png`, fullPage: true });
        const t = await page.innerText('body').catch(() => '');
        fs.writeFileSync(`${OUT}/${name}_resubmit_done.txt`, t);
        console.log(name, 'RESULT', t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|proceso|error|env/i.test(l)).slice(0, 12).join(' | '));
        return;
      }
    }
  }
  console.log(name, 'NO CONFIRM BTN');
}

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();

  // Assistant: fix options then resubmit
  await openProduct(page, '9N3D02KXKD3D');
  await tryCompleteSubmissionOptions(page, 'assistant');
  await resubmitId(page, '9N3D02KXKD3D', 'assistant');

  // Translate resubmit
  await resubmitId(page, '9NQN3RZ2Z655', 'translate');

  console.log('\nDONE');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
