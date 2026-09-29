const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
const shots = [
  'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Screenshots\\Screenshot_1_HoverTranslate.png',
  'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Screenshots\\Screenshot_2_AiNuances.png',
  'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Screenshots\\Screenshot_3_Settings.png',
  'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Screenshots\\Screenshot_4_Overview.png'
];
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  for (let i = 0; i < 4; i++) {
    // Click the image-update-button for screenshot i (the ones with thumbnail)
    const ok = await page.evaluate((idx) => {
      const imgs = [...document.querySelectorAll('img.thumbnail-image')].filter(im => {
        const r = im.getBoundingClientRect();
        return r.y > 850 && r.y < 2000;
      });
      if (!imgs[idx]) return 'no img ' + idx + ' of ' + imgs.length;
      let btn = imgs[idx].closest('he-button') || imgs[idx].parentElement;
      if (btn) {
        const inner = btn.shadowRoot && btn.shadowRoot.querySelector('button');
        if (inner) inner.click(); else btn.click();
        return 'clicked ' + idx;
      }
      return 'no btn';
    }, i);
    console.log(ok);
    await page.waitForTimeout(1200);

    // Set file on visible/active file inputs
    const inputs = page.locator('input[type="file"]');
    const n = await inputs.count();
    let done = false;
    for (let j = 0; j < n; j++) {
      try {
        const el = inputs.nth(j);
        if (await el.isVisible().catch(() => false) || true) {
          await el.setInputFiles(shots[i], { timeout: 3000 });
          console.log(' set file on', j);
          done = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {}
    }
    if (!done) console.log('no input for', i);
    await page.screenshot({ path: `${OUT}/tr_repl_${i}.png` });
  }

  const info = await page.evaluate(() => [...document.querySelectorAll('img.thumbnail-image')].map(im => {
    const r = im.getBoundingClientRect();
    return { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), srcLen: (im.src || '').length };
  }).filter(x => x.y > 850 && x.y < 2000));
  console.log('SHOTS', JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/tr_repl_done.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
