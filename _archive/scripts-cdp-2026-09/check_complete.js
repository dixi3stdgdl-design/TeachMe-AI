const { chromium } = require('D:/pwcli/node_modules/playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  for (const [id, name] of [['9N3D02KXKD3D','assistant'],['9NQN3RZ2Z655','translate']]) {
    await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    const data = await page.evaluate(() => {
      const t = document.body.innerText.replace(/\n+/g, ' | ');
      const re = /(Precios y disponibilidad|Propiedades|Clasificación por edades|Paquetes|Descripciones de Store|Opciones de envío)( \| (Completado|Incompleto|Validated))?/g;
      const found = [];
      let m;
      while ((m = re.exec(t))) found.push(m[0]);
      return { found, hasIncomplete: t.includes('Incompleto'), pkgs: (t.match(/ToolTip\w+_[\d.]+_x64\.msix/g) || []) };
    });
    console.log(name, JSON.stringify(data));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
