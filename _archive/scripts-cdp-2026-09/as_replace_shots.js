const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
const shots = [
  'D:\\ToolTip AI\\MicrosoftStore_Submission\\Store_Assets\\Screenshots\\Screenshot_1_HUD_Inspection.png',
  'D:\\ToolTip AI\\MicrosoftStore_Submission\\Store_Assets\\Screenshots\\Screenshot_2_Snipping_Tool.png',
  'D:\\ToolTip AI\\MicrosoftStore_Submission\\Store_Assets\\Screenshots\\Screenshot_3_Dashboard_Controls.png',
  'D:\\ToolTip AI\\MicrosoftStore_Submission\\Store_Assets\\Screenshots\\Screenshot_4_Docking_UIAutomation.png'
];
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/managelanguages?producttype=app', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  // click Español
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/listings?languageid=10&languagecode=es', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('URL', page.url());

  for (let i = 0; i < 4; i++) {
    const ok = await page.evaluate((idx) => {
      const imgs = [...document.querySelectorAll('img.thumbnail-image')].filter(im => {
        const r = im.getBoundingClientRect();
        return r.y > 850 && r.y < 2000;
      });
      if (!imgs[idx]) return 'no img ' + idx + '/' + imgs.length;
      const btn = imgs[idx].closest('he-button') || imgs[idx].parentElement;
      const inner = btn && btn.shadowRoot && btn.shadowRoot.querySelector('button');
      if (inner) inner.click(); else if (btn) btn.click();
      return 'clicked ' + idx;
    }, i);
    console.log(ok);
    await page.waitForTimeout(1000);
    const inputs = page.locator('input[type="file"]');
    const n = await inputs.count();
    for (let j = 0; j < n; j++) {
      try {
        await inputs.nth(j).setInputFiles(shots[i], { timeout: 3000 });
        console.log(' file', j);
        await page.waitForTimeout(1800);
        break;
      } catch (e) {}
    }
  }

  const info = await page.evaluate(() => [...document.querySelectorAll('img.thumbnail-image')].filter(im => {
    const r = im.getBoundingClientRect();
    return r.y > 850 && r.y < 2000;
  }).map((im, i) => ({ i, w: im.naturalWidth, h: im.naturalHeight })));
  console.log('SHOTS', JSON.stringify(info));

  // save
  await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/^(Guardar|Save)$/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
            if (inner) inner.click(); else el.click();
          }
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
  });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/as_shots_saved.png`, fullPage: true });
  console.log('done');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
