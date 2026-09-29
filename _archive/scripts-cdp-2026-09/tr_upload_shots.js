const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
const shots = [
  'D:/ToolTip AI Translate/ToolTipAI-Translate/MicrosoftStore_Submission/Screenshots/Screenshot_1_HoverTranslate.png',
  'D:/ToolTip AI Translate/ToolTipAI-Translate/MicrosoftStore_Submission/Screenshots/Screenshot_2_AiNuances.png',
  'D:/ToolTip AI Translate/ToolTipAI-Translate/MicrosoftStore_Submission/Screenshots/Screenshot_3_Settings.png',
  'D:/ToolTip AI Translate/ToolTipAI-Translate/MicrosoftStore_Submission/Screenshots/Screenshot_4_Overview.png'
];
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Try setInputFiles on visible-ish upload inputs near screenshot area
  const inputs = page.locator('input[type="file"]#image-upload-input, input[type="file"]');
  const n = await inputs.count();
  console.log('inputs', n);

  // Upload first 4 screenshots to the first 4 inputs
  for (let i = 0; i < 4; i++) {
    try {
      await inputs.nth(i).setInputFiles(shots[i], { timeout: 5000 });
      console.log('uploaded', i, shots[i]);
      await page.waitForTimeout(2500);
    } catch (e) {
      console.log('fail', i, e.message.slice(0, 120));
    }
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/tr_after_upload.png`, fullPage: true });
  const imgs = await page.evaluate(() => document.querySelectorAll('img[alt="listing-screenshot-image"]').length);
  console.log('IMGS', imgs);
  const t = await page.innerText('body').catch(() => '');
  console.log('SESION?', /caducado|Inicio de sesión necesario/.test(t) ? 'EXPIRED' : 'OK');
  console.log(t.split('\n').map(s => s.trim()).filter(l => /captura|escritorio|error|caducado/i.test(l)).slice(0, 10).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
