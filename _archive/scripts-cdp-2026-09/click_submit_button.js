const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  
  const elements = await page.locator('text=Enviar para certificación').all();
  console.log('Total elementos con ese texto:', elements.length);
  
  for (let i = 0; i < elements.length; i++) {
    const tagName = await elements[i].evaluate(el => el.tagName);
    const parentTag = await elements[i].evaluate(el => el.parentElement.tagName);
    console.log('Item ' + i + ': tag=' + tagName + ', parent=' + parentTag);
    console.log('Haciendo clic en item ' + i + '...');
    await elements[i].click();
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_after_click_submit.png') });
  console.log('Captura guardada en assistant_after_click_submit.png');
  await browser.close();
}

main().catch(e => console.error(e));
