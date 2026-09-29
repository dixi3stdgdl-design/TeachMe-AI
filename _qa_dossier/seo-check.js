const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const BRAVE = 'C:\\Users\\drbea\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const OUT = 'D:\\ToolTip AI\\_qa_dossier\\seo-2026-09-28';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: BRAVE,
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    locale: 'es-ES',
    viewport: { width: 1400, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);

  const queries = [
    'tooltip',
    'tooltip ai',
    'tooltip-ai',
    'tooltip windows 11',
    'inspector de pantalla windows',
    'site:tooltip-ai.com',
  ];

  const report = [];

  for (const q of queries) {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(q) + '&hl=es&num=10';
    console.log('\n==== QUERY:', q, '====');
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      const snap = page.url();
      const body = await page.innerText('body').catch(() => '');
      await page.screenshot({ path: path.join(OUT, 'serp_' + q.replace(/[^\w]+/g, '_') + '.png'), fullPage: true }).catch(() => {});

      // detect captcha / consent
      const blocked = /captcha|unusual traffic|no soy un robot|before you continue|consent/i.test(body.slice(0, 1500) + snap);
      const hits = [];
      const lower = body.toLowerCase();
      for (const needle of ['tooltip-ai.com', 'tooltip ai', 'dixi3', 'tooltip-ai']) {
        if (lower.includes(needle.toLowerCase())) hits.push(needle);
      }
      // extract roughly result lines mentioning tooltip-ai
      const lines = body.split('\n').map((s) => s.trim()).filter(Boolean);
      const relevant = lines.filter((l) => /tooltip-ai|tooltip ai|dixi3/i.test(l)).slice(0, 12);

      report.push({
        q,
        url: snap,
        blocked,
        hits,
        relevant,
        snippet: body.slice(0, 400).replace(/\s+/g, ' '),
      });
      console.log('blocked=', blocked, 'hits=', hits.join('|') || '(none)');
      console.log('relevant:', relevant.join(' || ').slice(0, 300));
    } catch (e) {
      console.log('ERR', e.message);
      report.push({ q, error: e.message });
    }
  }

  // Site live check
  console.log('\n==== SITE ====');
  const sitePages = ['https://tooltip-ai.com/', 'https://tooltip-ai.com/privacy/', 'https://tooltip-ai.com/en/'];
  const site = [];
  for (const u of sitePages) {
    try {
      const r = await page.goto(u, { waitUntil: 'networkidle', timeout: 45000 });
      const status = r ? r.status() : 0;
      const t = await page.title();
      const body = await page.innerText('body').catch(() => '');
      const hasBuy = body.includes('24.99') && body.includes('Comprar');
      const hasMail = body.includes('dixstdgdl3@gmail.com');
      await page.screenshot({ path: path.join(OUT, 'site_' + u.replace(/[^\w]+/g, '_') + '.png'), fullPage: true }).catch(() => {});
      site.push({ u, status, t, hasBuy, hasMail, len: body.length });
      console.log(u, status, 'buy', hasBuy, 'mail', hasMail, t.slice(0, 60));
    } catch (e) {
      console.log(u, 'ERR', e.message);
      site.push({ u, error: e.message });
    }
  }

  fs.writeFileSync(
    path.join(OUT, 'report.json'),
    JSON.stringify({ when: new Date().toISOString(), report, site }, null, 2),
    'utf8'
  );
  console.log('\nDONE →', OUT);
  await browser.close();
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
