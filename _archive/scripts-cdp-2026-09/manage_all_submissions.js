const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const APPS = [
  {
    name: 'ToolTip AI (Assistant)',
    productId: '9N3D02KXKD3D',
    pkgPath: 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix',
    expectedVer: '1.1.3.0'
  },
  {
    name: 'ToolTip AI Aura',
    productId: '9P33P1P5Z8DC',
    pkgPath: 'D:\\ToolTip AI Aura\\MicrosoftStore_Submission\\Package\\ToolTipAIAura_1.0.2.0_x64.msix',
    expectedVer: '1.0.2.0'
  },
  {
    name: 'ToolTip AI Translate',
    productId: '9NQN3RZ2Z655',
    pkgPath: 'D:\\ToolTip AI Translate\\ToolTipAI-Translate\\MicrosoftStore_Submission\\Package\\ToolTipAITranslate_1.0.2.0_x64.msix',
    expectedVer: '1.0.2.0'
  },
  {
    name: 'ToolTip AI Voice',
    productId: '9P417GZB0FVB',
    pkgPath: 'D:\\ToolTip AI Voice\\MicrosoftStore_Submission\\Package\\ToolTipAIVoice_1.0.1.0_x64.msix',
    expectedVer: '1.0.1.0'
  }
];

async function inspectAndProcessAll() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('=== VERIFICANDO ESTADO ACTUAL EN MICROSOFT PARTNER CENTER ===\n');

  for (const app of APPS) {
    console.log(`\n======================================================`);
    console.log(`APP: ${app.name} (${app.productId})`);
    console.log(`======================================================`);

    const overviewUrl = `https://partner.microsoft.com/es-es/dashboard/products/${app.productId}/overview`;
    console.log(`Navegando a: ${overviewUrl}`);
    await page.goto(overviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const bodyText = await page.innerText('body');
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Buscar links de submissions
    const allLinks = await page.locator('a').evaluateAll(elements => 
      elements.map(e => ({ text: e.innerText.trim(), href: e.href }))
    );

    const submissionLinks = allLinks.filter(l => l.href.includes('/submissions/'));
    console.log('Enlaces de envío detectados:', JSON.stringify(submissionLinks));

    // Buscar estados clave
    const statusLines = lines.filter(l => 
      /Envío|Submission|Certificaci|Borrador|Draft|Esperando|Publicad|Rechazad|In progress|Waiting|Versión|Version|1\.\d+\.\d+\.\d+/i.test(l)
    );
    console.log('Líneas relevantes de estado:');
    console.log(statusLines.slice(0, 15).join('\n'));

    // Revisar si existe botón de "Cancelar envío" o "Actualizar" o "Crear nuevo envío" o "Volver a enviar"
    const actionButtons = await page.locator('button, a').evaluateAll(elements => 
      elements.map(e => ({ text: e.innerText.trim(), href: e.href || '', role: e.getAttribute('role') || '' }))
        .filter(e => /cancel|nuevo|actualiz|update|volver|certific|subir|upload/i.test(e.text))
    );
    console.log('Botones de acción disponibles:', JSON.stringify(actionButtons));

    const shotName = `state_${app.productId}.png`;
    await page.screenshot({ path: path.join(__dirname, shotName) });
    console.log(`Captura guardada: scripts/${shotName}`);
  }

  console.log('\n=== REVISIÓN INICIAL COMPLETADA ===');
}

inspectAndProcessAll().catch(e => {
  console.error('Error durante la ejecución:', e);
  process.exit(1);
});
