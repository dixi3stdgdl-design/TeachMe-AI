const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('=== Automatización Partner Center via Playwright CDP ===');
  
  let browser;
  try {
    console.log('Conectando al navegador activo en http://localhost:9222...');
    browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 5000 });
  } catch (err) {
    console.error('No se pudo conectar al puerto 9222:', err.message);
    console.log('\n[INSTRUCCIÓN] Para que Playwright controle tu navegador con la sesión ya iniciada:');
    console.log('1. Cierra Brave.');
    console.log('2. Ejecuta: brave.exe --remote-debugging-port=9222');
    console.log('O abre una terminal y corre el script de inicio.\n');
    process.exit(1);
  }

  const contexts = browser.contexts();
  const context = contexts[0];
  const pages = context.pages();
  console.log(`Páginas abiertas detectadas: ${pages.length}`);
  
  for (let i = 0; i < pages.length; i++) {
    console.log(`[Tab ${i}] URL: ${pages[i].url()} | Título: ${await pages[i].title()}`);
  }

  // Buscar si ya hay una pestaña de Partner Center o abrir una nueva
  let page = pages.find(p => p.url().includes('partner.microsoft.com'));
  if (!page) {
    console.log('Creando nueva pestaña para Partner Center...');
    page = await context.newPage();
  }

  // Paso 1: Ir a User Management para vincular Azure AD App
  console.log('\n>>> PASO 1: Vinculando Azure AD App en Administración de Usuarios...');
  await page.goto('https://partner.microsoft.com/dashboard/account/usermanagement', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  let snapPath = path.join(__dirname, 'cdp_step1_usermanagement.png');
  await page.screenshot({ path: snapPath });
  console.log(`Captura tomada: ${snapPath}`);

  // Intentar hacer clic en la pestaña "Aplicaciones de Azure AD" / "Azure AD applications"
  try {
    const aadTab = page.locator('button, a, div[role="tab"]').filter({ hasText: /Azure AD|Aplicaciones de Azure/i }).first();
    if (await aadTab.isVisible({ timeout: 5000 })) {
      console.log('Haciendo clic en pestaña Azure AD Applications...');
      await aadTab.click();
      await page.waitForTimeout(3000);
      
      const addAppBtn = page.locator('button').filter({ hasText: /Agregar aplicación|Add Azure AD|Add application/i }).first();
      if (await addAppBtn.isVisible({ timeout: 5000 })) {
        console.log('Haciendo clic en "Agregar aplicación de Azure AD"...');
        await addAppBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  } catch (e) {
    console.log('Nota pestaña Azure AD:', e.message);
  }

  // Paso 2: Revisar las aplicaciones y cancelar envíos en progreso
  console.log('\n>>> PASO 2: Navegando al Overview de aplicaciones...');
  await page.goto('https://partner.microsoft.com/dashboard/apps-and-games/overview', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  snapPath = path.join(__dirname, 'cdp_step2_apps_overview.png');
  await page.screenshot({ path: snapPath });
  console.log(`Captura tomada: ${snapPath}`);

  const apps = [
    { name: 'ToolTip AI (Assistant)', id: '9N3D02KXKD3D' },
    { name: 'ToolTip AI Aura', id: '9P33P1P5Z8DC' },
    { name: 'ToolTip AI Translate', id: '9NQN3RZ2Z655' },
    { name: 'ToolTip AI Voice', id: '9P417GZB0FVB' }
  ];

  for (const app of apps) {
    console.log(`\nRevisando app: ${app.name} (${app.id})...`);
    try {
      await page.goto(`https://partner.microsoft.com/dashboard/apps-and-games/products/${app.id}/overview`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);
      
      const appSnap = path.join(__dirname, `cdp_app_${app.id}.png`);
      await page.screenshot({ path: appSnap });
      console.log(`Captura guardada: ${appSnap}`);

      // Buscar botones de "Cancelar envío" o "Cancel submission" o "Abandonar borrador"
      const cancelBtn = page.locator('button, a').filter({ hasText: /Cancelar envío|Cancel submission|Abandon draft|Eliminar borrador/i }).first();
      if (await cancelBtn.isVisible({ timeout: 4000 })) {
        console.log(`[ENCONTRADO] Botón de cancelar en ${app.name}. Cancelando envío...`);
        await cancelBtn.click();
        await page.waitForTimeout(2000);
        
        // Confirmar modal si aparece
        const confirmBtn = page.locator('button').filter({ hasText: /Aceptar|Confirmar|Confirm|Sí|Yes|Cancelar envío/i }).last();
        if (await confirmBtn.isVisible({ timeout: 4000 })) {
          await confirmBtn.click();
          console.log(`[OK] Envío cancelado para ${app.name}.`);
          await page.waitForTimeout(3000);
        }
      } else {
        console.log(`No se detectó botón de cancelación activo en ${app.name} (puede estar en estado editable).`);
      }
    } catch (err) {
      console.error(`Error procesando ${app.name}:`, err.message);
    }
  }

  console.log('\n=== Proceso Playwright CDP Finalizado con Éxito ===');
}

main().catch(err => {
  console.error('Error en ejecución:', err);
  process.exit(1);
});
