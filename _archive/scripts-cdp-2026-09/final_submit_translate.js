const { chromium } = require('D:/pwcli/node_modules/playwright');

async function finalSubmitTranslate() {
  console.log('=== ENVIANDO DEFINITIVAMENTE A CERTIFICACION ===');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(30000);

  const overviewUrl = 'https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview';
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Comprobar estado de las secciones
  const sections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, a, tr')).map(el => el.innerText ? el.innerText.trim() : '').filter(t => (t.includes('Completado') || t.includes('Incompleto')) && t.length < 100);
  });
  console.log('Secciones actuales:', sections);

  const submitBtn = page.locator('he-button, button').filter({ hasText: /Enviar para certificación/i }).first();
  if (await submitBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    const disabled = await submitBtn.evaluate(el => el.classList.contains('disable-submit') || el.disabled || el.getAttribute('aria-disabled') === 'true').catch(() => true);
    console.log('¿Botón Enviar deshabilitado?:', disabled);

    if (!disabled) {
      console.log('¡HACIENDO CLIC EN ENVIAR PARA CERTIFICACION!');
      await submitBtn.click();
      await page.waitForTimeout(10000);
      console.log('¡ENVIO FINAL A CERTIFICACION ENVIADO!');
    }
  }

  await page.screenshot({ path: 'd:/ToolTip AI/scripts/translate_submitted_definitive.png' });
  await browser.close();
}

finalSubmitTranslate().catch(e => console.error(e));
