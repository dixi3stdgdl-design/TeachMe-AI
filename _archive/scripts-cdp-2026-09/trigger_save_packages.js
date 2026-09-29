const { chromium } = require('D:/pwcli/node_modules/playwright');

async function triggerSavePackages() {
  console.log('=== TRIGGERING SAVE ON PACKAGES ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];

  const packagesUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/packages';
  await page.goto(packagesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Buscar cualquier botón o elemento clickable con texto 'Guardar'
  const clicked = await page.evaluate(() => {
    // 1. he-button
    const heBtns = Array.from(document.querySelectorAll('he-button')).filter(b => b.innerText?.includes('Guardar') || b.innerText?.includes('Save'));
    if (heBtns.length > 0) {
      heBtns[0].click();
      const inner = heBtns[0].shadowRoot?.querySelector('button');
      if (inner) inner.click();
      return 'he-button clicked';
    }

    // 2. button normal
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText?.includes('Guardar') || b.innerText?.includes('Save'));
    if (btns.length > 0) {
      btns[0].click();
      return 'button clicked';
    }

    // 3. input submit
    const inputs = Array.from(document.querySelectorAll('input[type="submit"], input[type="button"]')).filter(b => b.value?.includes('Guardar') || b.value?.includes('Save'));
    if (inputs.length > 0) {
      inputs[0].click();
      return 'input clicked';
    }

    // 4. Buscar en formularios
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      forms[0].requestSubmit?.();
      return 'form submit requested';
    }

    return 'no save button found';
  });

  console.log('Resultado clic:', clicked);
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/packages_after_direct_trigger.png' });

  // Ir a overview
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('=== OVERVIEW ESTADO ===');
  console.log(lines.filter(l => /certificaci|esperando|en proceso|envío|1\.1\.2\.0|completado|incompleto/i.test(l)).slice(0, 15).join('\n'));
  
  await browser.close();
}

triggerSavePackages().catch(e => console.error(e));
