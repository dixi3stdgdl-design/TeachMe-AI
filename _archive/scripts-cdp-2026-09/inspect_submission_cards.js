const { chromium } = require('D:/pwcli/node_modules/playwright');

async function inspectCards() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const sections = await page.evaluate(() => {
    const list = [];
    const elements = document.querySelectorAll('a, button, div, section');
    for (const el of elements) {
      const txt = (el.innerText || '').trim();
      if ((txt.includes('Incompleto') || txt.includes('Completado')) && txt.length < 120) {
        list.push({
          tag: el.tagName,
          text: txt.replace(/\s+/g, ' '),
          link: el.getAttribute('href') || (el.querySelector('a') ? el.querySelector('a').getAttribute('href') : null)
        });
      }
    }
    return list;
  });

  console.log('=== SECCIONES CON ESTADO ===');
  console.log(JSON.stringify(sections, null, 2));
  await browser.close();
}

inspectCards().catch(e => console.error(e));
