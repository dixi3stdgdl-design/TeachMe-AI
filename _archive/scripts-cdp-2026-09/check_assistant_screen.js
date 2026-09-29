const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];

  console.log('URL actual:', page.url());
  await page.screenshot({ path: path.join(__dirname, 'current_page_assistant.png') });
  console.log('Captura guardada en current_page_assistant.png');

  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('Líneas relevantes en pantalla:');
  console.log(lines.filter(l => /ToolTip|1\.1\.3|1\.0\.4|validat|error|guardar|save|enviar|borrador/i.test(l)).join('\n'));
}

main().catch(e => console.error(e));
