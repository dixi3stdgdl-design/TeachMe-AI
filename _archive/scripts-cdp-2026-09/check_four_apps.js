const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function checkApp(page, name, productId) {
  console.log(`\n========================================`);
  console.log(`REVISANDO: ${name} (${productId})`);
  console.log(`========================================`);
  const url = `https://partner.microsoft.com/es-es/dashboard/products/${productId}/overview`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log('Timeout parcial en goto, continuando con el contenido actual...');
  }
  await page.waitForTimeout(3000);

  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  console.log('URL actual:', page.url());
  const statusLines = lines.filter(l => /envío|submission|certific|esperando|proceso|borrador|cancel|actualiz|versión|1\.\d+/i.test(l));
  console.log('Estados / Textos clave detectados:');
  console.log(statusLines.slice(0, 15).join('\n'));

  // Revisar si hay botón de cancelar envío
  const cancelBtn = page.locator('button, a').filter({ hasText: /cancelar\s+envío|cancel\s+submission/i }).first();
  const canCancel = await cancelBtn.isVisible().catch(() => false);
  console.log('¿Botón "Cancelar envío" visible?:', canCancel);

  // Revisar si hay botón "Actualizar" o "Crear nuevo envío"
  const updateBtn = page.locator('button, a').filter({ hasText: /actualizar|nuevo\s+envío|update/i }).first();
  const canUpdate = await updateBtn.isVisible().catch(() => false);
  console.log('¿Botón "Actualizar / Nuevo envío" visible?:', canUpdate);

  // Submissions links
  const links = await page.locator('a').evaluateAll(elements => elements.map(e => ({ text: e.innerText.trim(), href: e.href })).filter(e => e.href.includes('/submissions/'))).catch(() => []);
  console.log('Enlaces de envío:', JSON.stringify(links));

  const shot = `app_${productId}.png`;
  await page.screenshot({ path: path.join(__dirname, shot) });
  console.log(`Captura guardada en scripts/${shot}`);

  return { name, productId, canCancel, canUpdate, statusLines: statusLines.slice(0, 5), subLinks: links };
}

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const results = [];
  results.push(await checkApp(page, 'ToolTip AI (Assistant)', '9N3D02KXKD3D'));
  results.push(await checkApp(page, 'ToolTip AI Aura', '9P33P1P5Z8DC'));
  results.push(await checkApp(page, 'ToolTip AI Voice', '9P417GZB0FVB'));
  results.push(await checkApp(page, 'ToolTip AI Translate', '9NQN3RZ2Z655'));

  console.log('\n========================================');
  console.log('=== RESUMEN GLOBAL DE LAS 4 APPS ===');
  console.log('========================================');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
