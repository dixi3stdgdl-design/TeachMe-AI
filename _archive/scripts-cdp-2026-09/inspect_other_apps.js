const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

const APPS = [
  {
    name: 'ToolTip AI (Assistant)',
    productId: '9N3D02KXKD3D',
    pkgPath: 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix',
    version: '1.1.3.0'
  },
  {
    name: 'ToolTip AI Aura',
    productId: '9P33P1P5Z8DC',
    pkgPath: 'D:\\ToolTip AI Aura\\MicrosoftStore_Submission\\Package\\ToolTipAIAura_1.0.2.0_x64.msix',
    version: '1.0.2.0'
  },
  {
    name: 'ToolTip AI Voice',
    productId: '9P417GZB0FVB',
    pkgPath: 'D:\\ToolTip AI Voice\\MicrosoftStore_Submission\\Package\\ToolTipAIVoice_1.0.1.0_x64.msix',
    version: '1.0.1.0'
  }
];

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('=== INSPECCIONANDO ASSISTANT, AURA Y VOICE ===\n');

  for (const app of APPS) {
    console.log(`\n========================================================`);
    console.log(`APP: ${app.name} (${app.productId})`);
    console.log(`========================================================`);

    const url = `https://partner.microsoft.com/es-es/dashboard/products/${app.productId}/overview`;
    console.log(`Navegando a: ${url}`);
    
    await page.evaluate(dest => { window.location.href = dest; }, url);
    await page.waitForTimeout(5000);

    const bodyText = await page.innerText('body');
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    console.log('URL actual:', page.url());
    console.log('Líneas relevantes:');
    const relevant = lines.filter(l => /envío|submission|certific|esperando|proceso|borrador|cancel|actualiz|versión|1\.\d+/i.test(l));
    console.log(relevant.slice(0, 15).join('\n'));

    // Revisar si hay botón de cancelar envío
    const cancelBtn = page.locator('button, a').filter({ hasText: /cancelar\s+envío|cancel\s+submission/i }).first();
    const canCancel = await cancelBtn.isVisible();
    console.log('¿Botón "Cancelar envío" visible?:', canCancel);

    // Revisar si hay botón "Actualizar" o "Crear nuevo envío"
    const updateBtn = page.locator('button, a').filter({ hasText: /actualizar|nuevo\s+envío|update/i }).first();
    const canUpdate = await updateBtn.isVisible();
    console.log('¿Botón "Actualizar / Nuevo envío" visible?:', canUpdate);

    // Revisar enlaces a submissions
    const allLinks = await page.locator('a').evaluateAll(elements => 
      elements.map(e => ({ text: e.innerText.trim(), href: e.href }))
    );
    const subLinks = allLinks.filter(l => l.href.includes('/submissions/'));
    console.log('Enlaces a submissions:', JSON.stringify(subLinks));

    const shot = `inspect_${app.productId}.png`;
    await page.screenshot({ path: path.join(__dirname, shot) });
    console.log(`Captura: scripts/${shot}`);
  }
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
