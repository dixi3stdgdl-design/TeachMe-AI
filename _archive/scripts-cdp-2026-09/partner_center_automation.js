const { chromium } = require('D:/pwcli/node_modules/playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('=== Ingestionando sesión con Playwright ===');
  let browser;
  let context;

  // Intento 1: Conectar por CDP a puerto 9222 si existe
  try {
    console.log('Intentando conectar por CDP (http://localhost:9222)...');
    browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 3000 });
    context = browser.contexts()[0] || await browser.newContext();
    console.log('[OK] Conectado exitosamente via CDP.');
  } catch (e) {
    console.log('CDP no activo en 9222 (' + e.message + '). Probando lanzamiento con canal msedge/brave...');
    
    // Intento 2: Iniciar con canal oficial o ejecutable de Brave / Edge
    const bravePath = 'C:\\Users\\drbea\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    
    let executablePath = fs.existsSync(bravePath) ? bravePath : (fs.existsSync(edgePath) ? edgePath : undefined);
    
    console.log('Usando ejecutable:', executablePath);
    browser = await chromium.launch({
      headless: false,
      executablePath: executablePath,
      args: ['--start-maximized']
    });
    context = await browser.newContext({ viewport: null });
  }

  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  console.log('Navegando a Partner Center - Administración de Usuarios...');
  await page.goto('https://partner.microsoft.com/dashboard/account/usermanagement', { waitUntil: 'domcontentloaded', timeout: 45000 });

  console.log('URL actual:', page.url());
  const title = await page.title();
  console.log('Título de la página:', title);

  // Esperar 3 segundos para que cargue la SPA
  await page.waitForTimeout(3000);

  // Tomar captura de verificación
  const screenshotPath = path.join(__dirname, 'partner_center_status.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Captura guardada en:', screenshotPath);

  // Si estamos en la página de login o requiere interacción
  if (page.url().includes('login.microsoftonline.com') || page.url().includes('login.live.com')) {
    console.log('[AVISO] La página está en pantalla de Login de Microsoft.');
  } else {
    console.log('[OK] Sesión activa o página de Partner Center detectada.');
  }
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
