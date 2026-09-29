const { chromium } = require('D:/pwcli/node_modules/playwright');

async function checkAllAppsStatus() {
  console.log('=== VERIFICANDO ESTADO DE TODAS LAS APLICACIONES EN PARTNER CENTER ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(30000);

  const apps = [
    { name: 'ToolTip AI Assistant', id: '9N3D02KXKD3D', targetVer: '1.1.3.0' },
    { name: 'ToolTip AI Aura', id: '9P33P1P5Z8DC', targetVer: '1.0.2.0' },
    { name: 'ToolTip AI Voice', id: '9P417GZB0FVB', targetVer: '1.0.1.0' },
    { name: 'ToolTip AI Translate', id: '9NQN3RZ2Z655', targetVer: '1.1.2.0' }
  ];

  const results = [];

  for (const app of apps) {
    console.log(`Verificando ${app.name} (${app.id})...`);
    await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${app.id}/overview`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const bodyText = await page.innerText('body');
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const statusLine = lines.find(l => /certificaci|esperando|en proceso|publicado|borrador|submission/i.test(l)) || 'Desconocido';
    const packageLine = lines.find(l => l.includes('.msix') || l.includes('v1.')) || 'N/A';

    results.push({
      app: app.name,
      productId: app.id,
      targetVer: app.targetVer,
      statusPreview: statusLine,
      packagePreview: packageLine
    });
  }

  console.log('=== RESULTADO FINAL DE LA SUITE ===');
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
}

checkAllAppsStatus().catch(e => console.error(e));
