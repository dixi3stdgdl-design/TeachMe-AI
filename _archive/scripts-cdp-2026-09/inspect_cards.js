const { chromium } = require('D:/pwcli/node_modules/playwright');

async function inspectMainContent() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const cards = await page.locator('he-task-item, [role="button"], a').all();
  console.log('Cards encontradas:', cards.length);
  for (let i = 0; i < cards.length; i++) {
    const text = (await cards[i].innerText()).trim();
    const href = await cards[i].getAttribute('href');
    const tagName = await cards[i].evaluate(el => el.tagName);
    if (text.length > 0) {
      console.log(`[${i}] <${tagName}> href=${href} text=${text.replace(/\n/g, ' ')}`);
    }
  }
}

inspectMainContent().catch(e => console.error(e));
