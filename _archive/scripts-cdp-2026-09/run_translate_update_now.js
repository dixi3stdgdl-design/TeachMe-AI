const { chromium } = require('D:/pwcli/node_modules/playwright');

async function run() {
  console.log('=== ACTUALIZANDO TOOLTIP AI TRANSLATE A 1.1.2.0 ===');
  const msixFile = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('Navegando a Overview de Translate...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 1. Cancelar certificado si está activo
  console.log('Buscando botón Cancelar el certificado...');
  const cancelBtn = page.locator('he-button').filter({ hasText: /Cancelar el certificado/i }).first();
  if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Haciendo clic en Cancelar el certificado...');
    await cancelBtn.click();
    await page.waitForTimeout(2000);
    
    // Cuadro de diálogo de confirmación
    const yesBtn = page.locator('button, he-button').filter({ hasText: /^Sí$/i }).first();
    if (await yesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Confirmando con Sí...');
      await yesBtn.click();
      await page.waitForTimeout(6000);
    }
  }

  // 2. Entrar a Paquetes
  console.log('Entrando a sección Paquetes...');
  const pkgItem = page.locator('he-task-item').filter({ hasText: /Paquetes/i }).first();
  if (await pkgItem.isVisible({ timeout: 4000 }).catch(() => false)) {
    await pkgItem.click();
  } else {
    // Si no es visible el he-task-item, buscar cualquier enlace a packages
    const hrefs = await page.locator('a').evaluateAll(els => els.map(e => e.href));
    const pkgHref = hrefs.find(h => h.includes('packages'));
    if (pkgHref) {
      console.log('Navegando directamente a:', pkgHref);
      await page.goto(pkgHref, { waitUntil: 'domcontentloaded' });
    }
  }
  await page.waitForTimeout(5000);
  console.log('URL tras abrir paquetes:', page.url());

  // 3. Eliminar paquetes viejos (ej. 1.0.2.0)
  console.log('Eliminando paquetes antiguos...');
  const delBtns = await page.locator('button[aria-label*="Eliminar"], button[aria-label*="Quitar"], button:has-text("Eliminar")').all();
  for (const b of delBtns) {
    if (await b.isVisible().catch(() => false)) {
      console.log('Eliminando paquete previo...');
      await b.click();
      await page.waitForTimeout(2000);
    }
  }

  // 4. Inyectar nuevo paquete 1.1.2.0 vía CDP
  console.log('Configurando interceptor CDP para subir 1.1.2.0...');
  const client = await context.newCDPSession(page);
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  client.on('Page.fileChooserOpened', async (event) => {
    console.log('CDP FileChooser abierto. Inyectando:', msixFile);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixFile],
        backendNodeId: event.backendNodeId
      });
      console.log('MSIX inyectado exitosamente.');
    } catch (e) {
      console.error('Error inyectando MSIX:', e);
    }
  });

  // Activar input file
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
    if (inputs.length > 0) inputs[0].click();
  });
  await page.waitForTimeout(3000);

  // Esperar a que se procese el paquete
  console.log('Esperando a que el paquete 1.1.2.0 se cargue y procese...');
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const bodyText = await page.innerText('body');
    if (bodyText.includes('1.1.2.0') || bodyText.includes('ToolTipAITranslate_1.1.2.0')) {
      console.log(`Paquete 1.1.2.0 detectado en pantalla (iteración ${i})!`);
      if (!bodyText.includes('Cargando...') && !bodyText.includes('Procesando...') && !bodyText.includes('Analizando...')) {
        console.log('Procesamiento completado con éxito.');
        break;
      }
    }
  }

  // 5. Guardar
  console.log('Guardando cambios en Paquetes...');
  const saveBtn = page.locator('he-button, button').filter({ hasText: /^Guardar$/i }).first();
  if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('Guardado.');
  }

  // 6. Volver a Overview y Enviar para certificación
  console.log('Volviendo a Overview para enviar a certificación...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Haciendo clic en Enviar para certificación...');
  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(8000);
    console.log('Envío a certificación completado.');
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_submitted_1120.png' });
  const finalBody = await page.innerText('body');
  const lines = finalBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== ESTADO FINAL TRAS ENVIO DE TRANSLATE 1.1.2.0 ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0/i.test(l)).slice(0, 10).join('\n'));
}

run().catch(e => console.error('Error:', e));
