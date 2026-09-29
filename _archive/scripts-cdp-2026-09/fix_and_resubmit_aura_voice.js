const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'cdp_status_now');

async function openOverview(page, id) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForTimeout(5000);
}

async function getReport(page, name) {
  console.log('\n==== VER EL INFORME', name, '====');
  const btn = page.getByRole('button', { name: /Ver el informe/i }).first();
  if (!(await btn.isVisible({ timeout: 5000 }).catch(() => false))) {
    // fallback por texto
    const alt = page.locator('button, a').filter({ hasText: /Ver el informe/i }).first();
    if (!(await alt.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('Sin botón informe');
      return;
    }
    await alt.click();
  } else {
    await btn.click();
  }
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(OUT, `${name}_report_open.png`), fullPage: true });
  const t = await page.innerText('body');
  fs.writeFileSync(path.join(OUT, `${name}_report_open.txt`), t, 'utf8');
  const hits = t.split('\n').map(s => s.trim()).filter(l =>
    /10\.|policy|política|error|must|should|fail|invalid|screenshot|captura|package|certif|requisit|not |cannot|unable/i.test(l)
  ).slice(0, 50);
  console.log(hits.join('\n') || '(sin detalle de política)');
}

async function resubmit(page, name) {
  console.log('\n==== VOLVER A ENVIAR', name, '====');
  const btn = page.locator('button, a').filter({ hasText: /Volver a enviar para la certificación/i }).first();
  if (!(await btn.isVisible({ timeout: 5000 }).catch(() => false))) {
    console.log('Sin botón reenviar');
    return;
  }
  await btn.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, `${name}_resubmit_modal.png`), fullPage: true });

  // Confirmar en modal: botón que confirme el envío
  const candidates = [
    page.getByRole('button', { name: /Volver a enviar/i }),
    page.getByRole('button', { name: /Reenviar/i }),
    page.getByRole('button', { name: /Sí/i }),
    page.getByRole('button', { name: /Si/i }),
    page.getByRole('button', { name: /Confirmar/i }),
    page.getByRole('button', { name: /Submit/i })
  ];
  for (const loc of candidates) {
    const b = loc.last();
    if (await b.isVisible({ timeout: 1500 }).catch(() => false)) {
      console.log('Confirmando con:', await b.innerText().catch(() => '?'));
      await b.click();
      await page.waitForTimeout(8000);
      break;
    }
  }

  await page.screenshot({ path: path.join(OUT, `${name}_resubmit_done.png`), fullPage: true });
  const t = await page.innerText('body');
  fs.writeFileSync(path.join(OUT, `${name}_resubmit_done.txt`), t, 'utf8');
  console.log(t.split('\n').map(s => s.trim()).filter(l =>
    /certific|borrador|error|env[ií]o|proceso|public/i.test(l)
  ).slice(0, 15).join('\n'));
}

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com') && !p.url().includes('login'))
    || ctx.pages()[0];
  page.setDefaultTimeout(30000);

  const targets = [
    { id: '9P33P1P5Z8DC', name: 'aura' },
    { id: '9P417GZB0FVB', name: 'voice' }
  ];

  for (const app of targets) {
    await openOverview(page, app.id);
    await getReport(page, app.name);
  }

  for (const app of targets) {
    await openOverview(page, app.id);
    await resubmit(page, app.name);
  }

  console.log('\nDONE');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
