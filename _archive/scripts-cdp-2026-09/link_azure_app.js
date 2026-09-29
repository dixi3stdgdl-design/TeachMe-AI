const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');

async function linkAzureApp() {
  console.log('Conectando por CDP a puerto 9222...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Navegando a Administración de Usuarios...');
  await page.goto('https://partner.microsoft.com/es-es/dashboard/account/usermanagement', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Buscar y hacer clic en la pestaña Aplicaciones de Azure AD
  console.log('Buscando pestaña Aplicaciones de Azure AD...');
  const aadTab = page.locator('[role="tab"]').filter({ hasText: /Azure AD|Aplicaciones/i }).first();
  if (await aadTab.isVisible()) {
    console.log('Haciendo clic en pestaña Azure AD...');
    await aadTab.click();
    await page.waitForTimeout(3000);
  }

  const snapPath1 = path.join(__dirname, 'aad_tab_live.png');
  await page.screenshot({ path: snapPath1 });
  console.log('Captura tomada:', snapPath1);

  // Buscar botón Agregar aplicación
  const addBtn = page.locator('button').filter({ hasText: /Agregar aplicación|Add application|Crear aplicación/i }).first();
  if (await addBtn.isVisible({ timeout: 5000 })) {
    console.log('Haciendo clic en Agregar aplicación de Azure AD...');
    await addBtn.click();
    await page.waitForTimeout(4000);

    const snapPath2 = path.join(__dirname, 'aad_add_modal.png');
    await page.screenshot({ path: snapPath2 });
    console.log('Captura de formulario / modal tomada:', snapPath2);

    // Buscar la app en la lista o selector
    const appRow = page.locator('tr, div, li').filter({ hasText: /DIxStdGdl-Tool Tip Ai|TeachMeAI-Store-Publisher|0b5b3ddb/i }).first();
    if (await appRow.isVisible({ timeout: 5000 })) {
      console.log('App encontrada en la lista, seleccionando...');
      await appRow.click();
      await page.waitForTimeout(2000);
      
      // Asignar rol Manager / Administrador
      const roleCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]').filter({ hasText: /Administrador|Manager|Desarrollador|Developer/i }).first();
      if (await roleCheckbox.isVisible()) {
        await roleCheckbox.check();
      }

      // Guardar
      const saveBtn = page.locator('button').filter({ hasText: /Guardar|Save|Aceptar/i }).last();
      if (await saveBtn.isVisible()) {
        console.log('Guardando vinculación de Azure AD...');
        await saveBtn.click();
        await page.waitForTimeout(4000);
        console.log('[ÉXITO] Aplicación de Azure AD vinculada en Partner Center.');
      }
    }
  } else {
    console.log('Botón agregar aplicación no visible o ya está en modo edición.');
  }
}

linkAzureApp().catch(err => {
  console.error('Error en linkAzureApp:', err);
  process.exit(1);
});
