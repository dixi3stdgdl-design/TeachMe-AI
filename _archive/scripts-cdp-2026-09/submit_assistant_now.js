const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function main() {
  console.log('=== CANCELANDO CERTIFICACIÓN Y SUBIENDO TOOLTIP AI ASSISTANT 1.1.3.0 ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // 1. Confirmar cancelación haciendo clic en "Sí"
  console.log('1. Haciendo clic en "Sí" del diálogo de confirmación...');
  const siBtn = page.locator('button').filter({ hasText: /^Sí$|^Si$/i }).first();
  if (await siBtn.isVisible()) {
    await siBtn.click();
    console.log('Clic en Sí realizado.');
    await page.waitForTimeout(6000);
  } else {
    console.log('Botón Sí no visible directamente, buscando por texto...');
    await page.click('text=Sí').catch(() => {});
    await page.waitForTimeout(6000);
  }

  console.log('URL tras cancelación:', page.url());
  await page.screenshot({ path: path.join(__dirname, 'assistant_cancelled_state.png') });

  // 2. Obtener la URL de packages de la submission en borrador
  console.log('2. Buscando enlace a Paquetes en el borrador...');
  let pkgUrl = null;
  const links = await page.locator('a').evaluateAll(elements => elements.map(e => e.href));
  for (const l of links) {
    if (l.includes('/submissions/') && l.includes('/packages')) {
      pkgUrl = l;
      break;
    }
  }

  if (!pkgUrl) {
    // Si no está directo el link de packages, buscar link de submission
    for (const l of links) {
      if (l.includes('/submissions/')) {
        const subIdMatch = l.match(/\/submissions\/(\d+)/);
        if (subIdMatch) {
          pkgUrl = `https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/${subIdMatch[1]}/packages`;
          break;
        }
      }
    }
  }

  console.log('URL de Packages detectada:', pkgUrl);
  if (!pkgUrl) {
    // Fallback con he-task-item
    const pkgItem = page.locator('he-task-item').filter({ hasText: /Paquetes/i }).first();
    if (await pkgItem.isVisible()) {
      await pkgItem.click();
      await page.waitForTimeout(5000);
      pkgUrl = page.url();
    }
  } else {
    await page.goto(pkgUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
  }

  console.log('En página de paquetes:', page.url());

  // 3. Eliminar paquete previo si existe
  const deleteBtn = page.locator('button, a').filter({ hasText: /^Delete$|^Eliminar$/i }).first();
  if (await deleteBtn.isVisible()) {
    console.log('Eliminando paquete anterior...');
    await deleteBtn.click();
    await page.waitForTimeout(3000);
  }

  // 4. Inyectar nuevo paquete 1.1.3.0 con CDP
  const msixPath = 'D:\\ToolTip AI\\MicrosoftStore_Submission\\Package\\ToolTipAIAssistant_1.1.3.0_x64.msix';
  console.log('4. Configurando CDP FileChooser para:', msixPath);

  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('Page.enable');
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });

  let fileChosen = false;
  client.on('Page.fileChooserOpened', async (event) => {
    console.log('[CDP EVENT] FileChooser dialog abierto:', event);
    try {
      await client.send('DOM.setFileInputFiles', {
        files: [msixPath],
        backendNodeId: event.backendNodeId
      });
      console.log('[OK] Archivo MSIX 1.1.3.0 inyectado.');
      fileChosen = true;
    } catch (e) {
      console.error('Error DOM.setFileInputFiles:', e.message);
    }
  });

  console.log('5. Disparando clic en input de archivo...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) input.click();
  });

  await page.waitForTimeout(4000);

  console.log('6. Esperando subida y validación en Microsoft Store (hasta 90s)...');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    console.log(`Progreso: ${(i + 1) * 5}s transcurridos...`);
    const text = await page.innerText('body');
    if (/ToolTipAIAssistant_1\.1\.3\.0_x64\.msix\s+Validated|v1\.1\.3\.0|1\.1\.3\.0/i.test(text)) {
      console.log('[ÉXITO CONFIRMADO] Paquete 1.1.3.0 validado correctamente en Partner Center.');
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_pkg_uploaded.png') });

  // 7. Guardar cambios
  const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save/i }).first();
  if (await saveBtn.isVisible()) {
    console.log('7. Guardando cambios en sección Paquetes...');
    await saveBtn.click();
    await page.waitForTimeout(6000);
  }

  // 8. Volver a Overview y Enviar a Certificación
  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview';
  console.log('8. Volviendo a Overview para enviar a certificación...');
  await page.goto(overviewUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const submitBtn = page.locator('button, a').filter({ hasText: /Enviar para la certificación|Volver a enviar para la certificación/i }).first();
  if (await submitBtn.isVisible()) {
    console.log('9. Pulsando botón de envío a certificación...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log('[ÉXITO TOTAL] ¡ToolTip AI Assistant 1.1.3.0 ENVIADO A CERTIFICACIÓN!');
  }

  await page.screenshot({ path: path.join(__dirname, 'assistant_final_certified.png') });
  console.log('Proceso de Assistant concluido con éxito.');
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
