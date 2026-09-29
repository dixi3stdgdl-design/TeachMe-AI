const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
const JUST = `ToolTip AI is a Windows 10/11 desktop utility built with .NET 8 WPF, packaged as an MSIX desktop bridge application. It requires the 'runFullTrust' capability for the following core functionalities:
1. Screen region capture (using standard Windows desktop GDI/Graphics APIs) triggered only when the user requests screen inspection.
2. Registering global hotkeys (RegisterHotKey API: Ctrl+Shift+A for inspection, Ctrl+Shift+D for hover radar) to allow quick access from any active window.
3. System tray (notification area) integration for background status and quick configuration access.
4. Local secure storage of user-provided API keys using Windows DPAPI (Data Protection API).
No keylogger: keyboard hook only backs up the two registered hotkeys. Password fields are blocked by design. API keys are DPAPI-encrypted locally.`;
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Select radio: Publicar tan pronto como supere la certificación
  const radio = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('label, he-radio, input[type=radio]')];
    for (const el of labels) {
      const t = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
      if (/Publicar este envío tan pronto/i.test(t)) {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, t: t.slice(0, 60), x: r.x + r.width/2, y: r.y + r.height/2 };
      }
    }
    // try click by text node parent
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (n.textContent && /Publicar este envío tan pronto como supere/i.test(n.textContent)) {
        let el = n.parentElement;
        for (let i = 0; i < 5 && el; i++) {
          if (el.tagName === 'HE-RADIO' || el.tagName === 'INPUT' || el.getAttribute('role') === 'radio' || el.tagName === 'LABEL') break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, x: r.x + r.width/2, y: r.y + r.height/2 };
      }
    }
    return null;
  });
  console.log('RADIO', JSON.stringify(radio));
  if (radio) {
    await page.mouse.click(radio.x, radio.y);
    await page.waitForTimeout(1500);
  }

  // Fill runFullTrust justification textarea
  const filled = await page.evaluate((just) => {
    const tas = [...document.querySelectorAll('textarea, he-textarea, [contenteditable=true]')];
    for (const ta of tas) {
      const lab = (ta.getAttribute('aria-label') || '') + (ta.placeholder || '') + (ta.id || '');
      const near = ta.closest('he-textarea, .field, .form-group, div');
      const nt = near ? (near.innerText || '').slice(0, 200) : '';
      if (/runFullTrust|Por qué necesita/i.test(lab + nt) || ta.tagName === 'TEXTAREA') {
        if (ta.tagName === 'TEXTAREA') {
          ta.value = just;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          return 'textarea';
        }
        if (ta.setAttribute) {
          ta.innerText = just;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          return 'contenteditable';
        }
      }
    }
    // any textarea
    const t2 = document.querySelector('textarea');
    if (t2) {
      t2.value = just;
      t2.dispatchEvent(new Event('input', { bubbles: true }));
      t2.dispatchEvent(new Event('change', { bubbles: true }));
      return 'first-textarea';
    }
    return 'none';
  }, JUST);
  console.log('FILLED', filled);

  await page.waitForTimeout(1000);
  // Save
  const saved = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return false;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/^(Guardar|Save)$/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
            if (inner) inner.click(); else el.click();
            return true;
          }
        }
        if (el.shadowRoot) if (walk(el.shadowRoot, d + 1)) return true;
      }
      return false;
    };
    return walk(document);
  });
  console.log('SAVED', saved);
  await page.waitForTimeout(5000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/as_opts_after.txt`, t);
  console.log(t.split('\n').map(s => s.trim()).filter(l => /Completado|Incompleto|Publicar|runFullTrust|error|guard/i.test(l)).slice(0, 20).join(' | '));
  await page.screenshot({ path: `${OUT}/as_opts_after.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
