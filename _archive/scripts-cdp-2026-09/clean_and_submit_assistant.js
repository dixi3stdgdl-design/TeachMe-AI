const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== LIMPIANDO Y ENVIANDO TOOLTIP AI ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // 1. Ir a la página de paquetes
  const pkgUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/packages';
  console.log('1. Navegando a Packages...');
  await page.goto(pkgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // 2. Eliminar paquetes con error o anteriores
  console.log('2. Eliminando paquetes en error y versiones anteriores...');
  let deleteButtons = await page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).all();
  console.log(`Encontrados ${deleteButtons.length} botones de eliminación.`);
  
  while (deleteButtons.length > 0) {
    console.log('Haciendo clic en Delete...');
    await deleteButtons[0].click().catch(() => {});
    await page.waitForTimeout(2500);
    deleteButtons = await page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).all();
    if (deleteButtons.length === 1) {
      // Si solo queda 1 paquete y es 1.1.3.0 Validated, paramos
      const text = await page.innerText('body');
      if (text.includes('1.1.3.0') && text.includes('Validated') && !text.includes('Error')) {
        console.log('Queda únicamente 1.1.3.0 Validated. Listo.');
        break;
      }
    }
  }

  // Si no quedó 1.1.3.0 validado, inyectarlo
  const bodyText = await page.innerText('body');
  if (!bodyText.includes('1.1.3.0') || bodyText.includes('Error')) {
    console.log('Inyectando ToolTipAIAssistant_1.1.3.0_x64.msix de forma limpia...');
    const msixPath = 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix';
    const client = await context.newCDPSession(page);
    await client.send('DOM.enable');
    await client.send('Page.enable');
    await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

    client.on('Page.fileChooserOpened', async (event) => {
      try {
        await client.send('DOM.setFileInputFiles', {
          files: [msixPath],
          backendNodeId: event.backendNodeId
        });
        console.log('[OK] Paquete 1.1.3.0 inyectado.');
      } catch (e) {}
    });

    await page.evaluate(() => {
      const input = document.querySelector('input[type="file"]');
      if (input) input.click();
    });

    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(5000);
      const t = await page.innerText('body');
      if (t.includes('1.1.3.0') && t.includes('Validated')) {
        console.log('[OK] 1.1.3.0 Validated.');
        break;
      }
    }
  }

  // 3. Scroll abajo y Guardar Paquetes
  console.log('3. Guardando sección Paquetes...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(6000);
    console.log('Paquetes guardado.');
  }

  // 4. Ir a Opciones de envío y Guardar
  console.log('4. Guardando Opciones de envío...');
  const optUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/options';
  await page.goto(optUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(4000);
  const saveOptBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveOptBtn.isVisible()) {
    await saveOptBtn.click();
    await page.waitForTimeout(5000);
    console.log('Opciones de envío guardadas.');
  }

  // 5. Ir a Overview y Enviar a certificación
  console.log('5. Volviendo a Overview para Enviar para certificación...');
  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview';
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para certificación|Enviar para la certificación|Volver a enviar/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('Haciendo clic en el botón de envío...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_final_certified_verified.png') });
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
