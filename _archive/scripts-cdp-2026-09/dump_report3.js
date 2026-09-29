const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  // Find the exact node and its click handler target
  const info = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.textContent && n.textContent.trim() === 'Ver el informe') {
        let el = n.parentElement;
        for (let i = 0; i < 5 && el; i++) {
          if (el.onclick || el.getAttribute('href') || el.getAttribute('role') === 'button' || el.tagName === 'BUTTON' || el.tagName === 'A') break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          href: el.getAttribute('href'),
          role: el.getAttribute('role'),
          html: el.outerHTML.slice(0, 500),
          x: r.x + r.width/2, y: r.y + r.height/2
        };
      }
    }
    return null;
  });
  console.log('NODE', JSON.stringify(info, null, 2));

  const beforeUrls = ctx.pages().map(p => p.url());
  if (info && info.href) {
    await page.goto(new URL(info.href, page.url()).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/assistant_report_via_href.txt`, t);
    console.log('HREF_BODY', t.slice(0, 4000));
  } else if (info) {
    await page.mouse.click(info.x, info.y);
    await page.waitForTimeout(7000);
    for (const p of ctx.pages()) {
      if (!beforeUrls.includes(p.url()) || p === page) {
        console.log('PAGE', await p.title(), p.url().slice(0, 160));
        const t = await p.innerText('body').catch(() => '');
        if (t && t.length > 80) {
          fs.writeFileSync(`${OUT}/assistant_report_click_${p.url().slice(-20).replace(/\W/g,'')}.txt`, t);
          console.log('CLICK_BODY', t.slice(0, 4000));
        }
        await p.screenshot({ path: `${OUT}/assistant_report_click.png`, fullPage: true }).catch(()=>{});
      }
    }
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
