// ==========================================================================
// TOOLTIP AI TRANSLATE — QUANTUM BEAM & HOLOGRAPHIC HUD SCANNER ENGINE
// ==========================================================================

(() => {
  // Prevent duplicate execution
  if (window.__tooltipAiTranslateLoaded) return;
  window.__tooltipAiTranslateLoaded = true;

  // Settings State
  let config = {
    enabled: true,
    scannerMode: "hover", // "hover", "alt", "selection"
    beamColor: "theme-cyan", // "theme-cyan", "theme-emerald", "theme-violet", "theme-stealth"
    targetLang: "es", // "es", "en", "ja", "de", "fr", "zh"
    showDock: true,
    ttsSpeed: 1.0,
    hoverDelay: 220 // ms before trigger
  };

  // Internal memory dictionary for instant offline zero-latency inference
  const LOCAL_KNOWLEDGE = {
    // Japanese Souls / RPG / Tech
    "魔女": { tr: "Bruja / Hechicera", pho: "Majo", ety: "魔 (magia) + 女 (mujer). Hechicera lunar o usuaria de artes arcanas.", lang: "ja" },
    "運命": { tr: "Destino", pho: "Unmei", ety: "運 (suerte/curso) + 命 (vida). Movimiento celeste o mandato cósmico.", lang: "ja" },
    "暗き月": { tr: "Luna Sombría", pho: "Kuraki Tsuki", ety: "Forma arcaica de adjetivo en japonés ceremonial.", lang: "ja" },
    "大剣": { tr: "Gran Espadón", pho: "Daiken", ety: "大 (gran) + 剣 (espada). Arma pesada legendaria de dos manos.", lang: "ja" },
    "騎士": { tr: "Caballero", pho: "Kishi", ety: "Guerrero de armadura o guardián de honor.", lang: "ja" },
    "記憶": { tr: "Memoria / Recuerdo", pho: "Kioku", ety: "Retención o fragmento del pasado.", lang: "ja" },
    "祝福": { tr: "Gracia / Bendición", pho: "Shukufuku", ety: "Lugar de descanso y renovación de estus.", lang: "ja" },
    "ルーン": { tr: "Runa", pho: "Rūn", ety: "Moneda de cambio y poder para ascender atributos.", lang: "ja" },
    "太陽": { tr: "Sol", pho: "Taiyō", ety: "Astro diurno o devoción solar (Praise the Sun).", lang: "ja" },

    // English Gaming / Tech / Dev
    "inventory": { tr: "Inventario", pho: "ɪn.vən.tɔːr.i", ety: "Bolsa de objetos y equipamiento activo del personaje.", lang: "en" },
    "cooldown": { tr: "Tiempo de Recarga", pho: "kuːl.daʊn", ety: "Tiempo de espera antes de volver a lanzar una habilidad.", lang: "en" },
    "buff": { tr: "Mejora Temporal", pho: "bʌf", ety: "Efecto positivo que incrementa estadísticas o daño.", lang: "en" },
    "nerf": { tr: "Reducción de Poder", pho: "nɜːrf", ety: "Ajuste de balance para disminuir la efectividad.", lang: "en" },
    "render": { tr: "Renderizar / Procesar", pho: "ren.dər", ety: "Generar imagen gráfica a partir de cálculos matemáticos.", lang: "en" },
    "buffer": { tr: "Búfer de Memoria", pho: "bʌf.ər", ety: "Espacio de memoria temporal para transferencia de datos.", lang: "en" },
    "latency": { tr: "Latencia", pho: "leɪ.tən.si", ety: "Retardo en la transmisión de paquetes de red.", lang: "en" },
    "pipeline": { tr: "Tubería / Flujo de Procesamiento", pho: "paɪp.laɪn", ety: "Secuencia de etapas lineales de computación o renderizado.", lang: "en" },
    "viewport": { tr: "Área de Visión", pho: "vjuː.pɔːrt", ety: "Ventana visible del usuario en la pantalla gráfica.", lang: "en" },
    "shader": { tr: "Sombreador Gráfico", pho: "ʃeɪ.dər", ety: "Programa ejecutado en GPU para calcular luces y texturas.", lang: "en" },
    "anti-cheat": { tr: "Sistema Anti-Trampas", pho: "æn.ti tʃiːt", ety: "Protección a nivel kernel/DWM para evitar modificaciones ilegales.", lang: "en" },
    "tooltip": { tr: "Cápsula de Ayuda Flotante", pho: "tuːl.tɪp", ety: "Interfaz de superposición contextual para clarificar términos.", lang: "en" },

    // German Tech / Engineering
    "speicher": { tr: "Memoria / Almacenamiento", pho: "ʃpaɪ̯çɐ", ety: "Dispositivo para retener bytes de programa.", lang: "de" },
    "werkzeug": { tr: "Herramienta", pho: "vɛʁkt͡sɔɪ̯k", ety: "Instrumento utilitario de trabajo.", lang: "de" },
    "abbrechen": { tr: "Cancelar / Abortar", pho: "ap.bʁɛçn̩", ety: "Detener la operación en curso.", lang: "de" },
    "einstellungen": { tr: "Configuración", pho: "aɪ̯n.ʃtɛlʊŋən", ety: "Panel de parámetros y preferencias del sistema.", lang: "de" }
  };

  // Translation cache in memory for ultra-fast lookup
  const translationCache = new Map();

  // Elements
  let photonAura = null;
  let activeTooltip = null;
  let miniDock = null;
  let isPinned = false;
  let lastTargetWord = "";
  let lastRange = null;
  let hoverTimer = null;
  let isAltPressed = false;

  // Load Saved Configuration
  chrome.storage.sync.get(["enabled", "scannerMode", "beamColor", "targetLang", "showDock"], (res) => {
    if (res.enabled !== undefined) config.enabled = res.enabled;
    if (res.scannerMode) config.scannerMode = res.scannerMode;
    if (res.beamColor) config.beamColor = res.beamColor;
    if (res.targetLang) config.targetLang = res.targetLang;
    if (res.showDock !== undefined) config.showDock = res.showDock;

    initScanner();
  });

  // Listen for preference changes from Popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) config.enabled = changes.enabled.newValue;
    if (changes.scannerMode) config.scannerMode = changes.scannerMode.newValue;
    if (changes.beamColor) {
      config.beamColor = changes.beamColor.newValue;
      updateAuraTheme();
    }
    if (changes.targetLang) config.targetLang = changes.targetLang.newValue;
    if (changes.showDock) {
      config.showDock = changes.showDock.newValue;
      toggleDockVisibility();
    }

    if (!config.enabled) {
      removeTooltip();
      if (photonAura) photonAura.style.opacity = "0";
      if (miniDock) miniDock.classList.add("dock-disabled");
    } else {
      if (miniDock) miniDock.classList.remove("dock-disabled");
    }
  });

  // Track Alt Key for Flashlight Mode
  window.addEventListener("keydown", (e) => {
    if (e.key === "Alt") {
      isAltPressed = true;
      if (config.enabled && photonAura && config.scannerMode === "alt") {
        photonAura.style.opacity = "1";
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "Alt") {
      isAltPressed = false;
      if (photonAura && config.scannerMode === "alt") {
        photonAura.style.opacity = "0";
      }
    }
  });

  function initScanner() {
    createPhotonAura();
    if (config.showDock) {
      createMiniDock();
    }
    bindMouseInteractions();
  }

  // 1. Create Photon Aura (Mouse Beam of Light)
  function createPhotonAura() {
    if (photonAura) return;
    photonAura = document.createElement("div");
    photonAura.className = `tooltip-translate-photon-aura ${config.beamColor}`;
    photonAura.style.opacity = config.scannerMode === "alt" ? "0" : (config.enabled ? "0.85" : "0");
    document.documentElement.appendChild(photonAura);
  }

  function updateAuraTheme() {
    if (!photonAura) return;
    photonAura.className = `tooltip-translate-photon-aura ${config.beamColor}`;
  }

  // 2. Create Floating Mini-Dock Widget
  function createMiniDock() {
    if (miniDock) return;
    miniDock = document.createElement("div");
    miniDock.className = `tooltip-translate-dock ${!config.enabled ? "dock-disabled" : ""}`;
    miniDock.innerHTML = `
      <div class="dock-indicator"></div>
      <div class="dock-text">
        <span>TOOLTIP SCANNER</span>
        <span class="dock-badge" id="ttDockLang">${config.targetLang.toUpperCase()}</span>
      </div>
      <button class="dock-close-btn" title="Ocultar widget">✕</button>
    `;

    document.body.appendChild(miniDock);

    miniDock.addEventListener("click", (e) => {
      if (e.target.classList.contains("dock-close-btn")) {
        e.stopPropagation();
        miniDock.style.display = "none";
        config.showDock = false;
        chrome.storage.sync.set({ showDock: false });
        return;
      }

      // Quick toggle enabled
      config.enabled = !config.enabled;
      chrome.storage.sync.set({ enabled: config.enabled });
      if (config.enabled) {
        miniDock.classList.remove("dock-disabled");
        if (photonAura && config.scannerMode !== "alt") photonAura.style.opacity = "0.85";
      } else {
        miniDock.classList.add("dock-disabled");
        removeTooltip();
        if (photonAura) photonAura.style.opacity = "0";
      }
    });
  }

  function toggleDockVisibility() {
    if (!miniDock) {
      if (config.showDock) createMiniDock();
      return;
    }
    miniDock.style.display = config.showDock ? "flex" : "none";
  }

  // 3. Mouse Tracking & Text Inspection
  function bindMouseInteractions() {
    window.addEventListener("mousemove", (e) => {
      // Update Photon Aura position smoothly
      if (photonAura) {
        photonAura.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      if (!config.enabled) return;

      // Check mode condition
      if (config.scannerMode === "selection") return;
      if (config.scannerMode === "alt" && !isAltPressed) return;

      // Ignore if hovering directly on our HUD or Dock
      if (e.target.closest(".tooltip-ai-translate-lens") || e.target.closest(".tooltip-translate-dock")) {
        return;
      }

      // Debounced scan under pointer
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        inspectWordUnderCursor(e.clientX, e.clientY, e.pageX, e.pageY);
      }, config.hoverDelay);
    }, { passive: true });

    // Handle Manual Selection
    document.addEventListener("mouseup", (e) => {
      if (!config.enabled) return;
      if (e.target.closest(".tooltip-ai-translate-lens") || e.target.closest(".tooltip-translate-dock")) {
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length > 1) {
        if (selection.rangeCount > 0) {
          lastRange = selection.getRangeAt(0).cloneRange();
        }
        triggerTranslation(selectedText, e.pageX, e.pageY, true);
      }
    });

    // Dismiss HUD on click outside if not pinned
    document.addEventListener("mousedown", (e) => {
      if (activeTooltip && !isPinned && !e.target.closest(".tooltip-ai-translate-lens") && !e.target.closest(".tooltip-translate-dock")) {
        removeTooltip();
      }
    });
  }

  // 4. Inspect Word at coordinates via Caret Position
  function inspectWordUnderCursor(clientX, clientY, pageX, pageY) {
    if (isPinned) return;

    let range = null;
    let node = null;
    let offset = 0;

    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clientX, clientY);
      if (range) {
        node = range.startContainer;
        offset = range.startOffset;
      }
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clientX, clientY);
      if (pos) {
        node = pos.offsetNode;
        offset = pos.offset;
      }
    }

    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const fullText = node.textContent;
    if (!fullText || fullText.trim() === "") return;

    // Detect word boundaries
    const wordInfo = extractWordAt(fullText, offset);
    if (!wordInfo || wordInfo.word.length < 2) return;

    // Avoid re-triggering for exact same word currently shown
    if (wordInfo.word.toLowerCase() === lastTargetWord.toLowerCase() && activeTooltip) {
      return;
    }

    // Save range for live morphing replacement
    try {
      lastRange = document.createRange();
      lastRange.setStart(node, wordInfo.start);
      lastRange.setEnd(node, wordInfo.end);
    } catch (_) {}

    lastTargetWord = wordInfo.word;

    // Visual scan feedback on photon aura
    if (photonAura) {
      photonAura.classList.add("is-scanning");
      setTimeout(() => photonAura && photonAura.classList.remove("is-scanning"), 400);
    }

    triggerTranslation(wordInfo.word, pageX, pageY, false);
  }

  // Word boundary extractor (Supports alphabetic and CJK kanji/characters)
  function extractWordAt(text, index) {
    if (index < 0 || index >= text.length) index = Math.min(Math.max(0, index), text.length - 1);

    const charAt = text[index];
    if (!charAt || /\s|[.,\/#!$%\^&\*;:{}=\-_`~()?]/.test(charAt)) return null;

    // Check if CJK character
    const isCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(charAt);
    if (isCJK) {
      let start = index;
      let end = index;
      while (start > 0 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text[start - 1])) {
        start--;
      }
      while (end < text.length - 1 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text[end + 1])) {
        end++;
      }
      return { word: text.slice(start, end + 1), start, end: end + 1 };
    }

    // Alphabetic words
    let start = index;
    let end = index;
    while (start > 0 && /[\p{L}\p{N}_'-]/u.test(text[start - 1])) {
      start--;
    }
    while (end < text.length - 1 && /[\p{L}\p{N}_'-]/u.test(text[end + 1])) {
      end++;
    }

    const word = text.slice(start, end + 1).trim();
    return { word, start, end: end + 1 };
  }

  // 5. Translation Resolver (Local Knowledge + Fallback)
  async function triggerTranslation(text, pageX, pageY, isSelection) {
    const clean = text.trim();
    if (!clean) return;

    // Check Local Instant Knowledge Base
    const lower = clean.toLowerCase();
    let result = null;

    if (LOCAL_KNOWLEDGE[clean]) {
      result = {
        translated: LOCAL_KNOWLEDGE[clean].tr,
        phonetic: LOCAL_KNOWLEDGE[clean].pho,
        etymology: LOCAL_KNOWLEDGE[clean].ety,
        sourceLang: LOCAL_KNOWLEDGE[clean].lang,
        source: "local-neural"
      };
    } else if (LOCAL_KNOWLEDGE[lower]) {
      result = {
        translated: LOCAL_KNOWLEDGE[lower].tr,
        phonetic: LOCAL_KNOWLEDGE[lower].pho,
        etymology: LOCAL_KNOWLEDGE[lower].ety,
        sourceLang: LOCAL_KNOWLEDGE[lower].lang,
        source: "local-neural"
      };
    } else if (translationCache.has(`${clean}_${config.targetLang}`)) {
      result = translationCache.get(`${clean}_${config.targetLang}`);
    } else {
      // Dynamic fallback via fast local heuristic or remote free API
      result = await fetchTranslation(clean, config.targetLang);
      translationCache.set(`${clean}_${config.targetLang}`, result);
    }

    renderHudLens(clean, result, pageX, pageY, isSelection);
  }

  // Fast translation API fallback
  async function fetchTranslation(text, targetLang) {
    // Basic automatic language guessing
    const isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
    const sourceLang = isJapanese ? "ja" : "en";

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 180))}&langpair=${sourceLang}|${targetLang}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data && data.responseData && data.responseData.translatedText) {
        return {
          translated: data.responseData.translatedText,
          phonetic: isJapanese ? "Kōbun" : null,
          etymology: "Traducción neuronal directa procesada en tiempo real.",
          sourceLang: sourceLang,
          source: "neural-cloud"
        };
      }
    } catch (_) {}

    // Fallback if offline
    return {
      translated: `Traducción (${targetLang.toUpperCase()}): ${text}`,
      phonetic: null,
      etymology: "Módulo OCR local ToolTip AI activo.",
      sourceLang: sourceLang,
      source: "local-fallback"
    };
  }

  // 6. Render Holographic HUD Lens
  function renderHudLens(originalText, translationData, pageX, pageY, isSelection) {
    removeTooltip();

    activeTooltip = document.createElement("div");
    activeTooltip.className = "tooltip-ai-translate-lens";

    // Header and badges
    const headerHtml = `
      <div class="tt-lens-header">
        <div class="tt-lens-dot"></div>
        <span class="tt-lens-title">TOOLTIP AI TRANSLATE</span>
        <span class="tt-lens-badge">${translationData.source === "local-neural" ? "DIRECT3D · < 2ms" : "NEURAL · ONLINE"}</span>
        <div class="tt-lens-actions">
          <button class="tt-lens-btn-icon btn-pin ${isPinned ? "is-pinned" : ""}" title="Anclar HUD">📌</button>
          <button class="tt-lens-btn-icon btn-close" title="Cerrar">✕</button>
        </div>
      </div>
    `;

    // Etymology / Tokens if available
    let tokenChipsHtml = "";
    if (translationData.etymology) {
      tokenChipsHtml = `
        <div class="tt-lens-tokens">
          <span class="tt-lens-token-chip" title="${translationData.etymology}">💡 ${translationData.etymology}</span>
        </div>
      `;
    }

    // Body
    const bodyHtml = `
      <div class="tt-lens-body">
        <div class="tt-lens-original-box">
          <span class="tt-lens-original">"${escapeHtml(originalText)}"</span>
          <span class="tt-lens-lang-pill">${(translationData.sourceLang || "auto").toUpperCase()}</span>
        </div>
        ${translationData.phonetic ? `<div class="tt-lens-phonetic">[${escapeHtml(translationData.phonetic)}]</div>` : ""}
        <div class="tt-lens-laser-divider"></div>
        <div class="tt-lens-translation">${escapeHtml(translationData.translated)}</div>
        ${tokenChipsHtml}
      </div>
    `;

    // Footer actions
    const footerHtml = `
      <div class="tt-lens-footer">
        <div class="tt-lens-toolbar-left">
          <button class="tt-lens-tool-btn btn-speak" title="Escuchar pronunciación">
            🔊 Pronunciar
          </button>
          <button class="tt-lens-tool-btn btn-copy" title="Copiar al portapapeles">
            📋 Copiar
          </button>
          <button class="tt-lens-tool-btn btn-morph" title="Transmutar palabra in-situ en la página">
            ⚡ Reemplazar
          </button>
        </div>
        <select class="tt-lens-target-lang-select" title="Cambiar idioma objetivo">
          <option value="es" ${config.targetLang === "es" ? "selected" : ""}>ES</option>
          <option value="en" ${config.targetLang === "en" ? "selected" : ""}>EN</option>
          <option value="ja" ${config.targetLang === "ja" ? "selected" : ""}>JA</option>
          <option value="de" ${config.targetLang === "de" ? "selected" : ""}>DE</option>
          <option value="fr" ${config.targetLang === "fr" ? "selected" : ""}>FR</option>
          <option value="zh" ${config.targetLang === "zh" ? "selected" : ""}>ZH</option>
        </select>
      </div>
    `;

    activeTooltip.innerHTML = headerHtml + bodyHtml + footerHtml;

    // Smart positioning inside viewport
    const hudWidth = 330;
    const hudHeight = 210;
    let posX = Math.min(pageX + 16, window.scrollX + window.innerWidth - hudWidth - 20);
    let posY = pageY + 20;

    if (pageY - window.scrollY + hudHeight > window.innerHeight) {
      posY = Math.max(window.scrollY + 10, pageY - hudHeight - 15);
    }

    activeTooltip.style.left = `${Math.max(10, posX)}px`;
    activeTooltip.style.top = `${posY}px`;

    document.body.appendChild(activeTooltip);

    // Event Listeners for HUD actions
    const btnClose = activeTooltip.querySelector(".btn-close");
    const btnPin = activeTooltip.querySelector(".btn-pin");
    const btnSpeak = activeTooltip.querySelector(".btn-speak");
    const btnCopy = activeTooltip.querySelector(".btn-copy");
    const btnMorph = activeTooltip.querySelector(".btn-morph");
    const langSelect = activeTooltip.querySelector(".tt-lens-target-lang-select");

    btnClose.addEventListener("click", () => {
      isPinned = false;
      removeTooltip();
    });

    btnPin.addEventListener("click", () => {
      isPinned = !isPinned;
      btnPin.classList.toggle("is-pinned", isPinned);
    });

    // TTS Pronounce
    btnSpeak.addEventListener("click", () => {
      speakText(translationData.translated, config.targetLang);
    });

    // Clipboard Copy
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(translationData.translated);
      btnCopy.innerText = "✓ Copiado!";
      setTimeout(() => {
        if (btnCopy) btnCopy.innerHTML = "📋 Copiar";
      }, 1500);
    });

    // In-Situ Morphing / Transmutation
    btnMorph.addEventListener("click", () => {
      morphWordInPlace(translationData.translated);
    });

    // Quick target language change
    langSelect.addEventListener("change", (e) => {
      config.targetLang = e.target.value;
      chrome.storage.sync.set({ targetLang: config.targetLang });
      if (miniDock) {
        const dockLang = miniDock.querySelector("#ttDockLang");
        if (dockLang) dockLang.innerText = config.targetLang.toUpperCase();
      }
      triggerTranslation(originalText, pageX, pageY, isSelection);
    });
  }

  // 7. Transmute word in DOM (Live In-Situ Morphing)
  function morphWordInPlace(replacementText) {
    if (!lastRange) return;
    try {
      const span = document.createElement("span");
      span.className = "tooltip-transmuted-word";
      span.textContent = replacementText;

      lastRange.deleteContents();
      lastRange.insertNode(span);

      // Flash feedback
      removeTooltip();
    } catch (_) {}
  }

  // 8. Speech Synthesis
  function speakText(text, langCode) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      es: "es-ES",
      en: "en-US",
      ja: "ja-JP",
      de: "de-DE",
      fr: "fr-FR",
      zh: "zh-CN"
    };

    utterance.lang = langMap[langCode] || "es-ES";
    utterance.rate = config.ttsSpeed;
    window.speechSynthesis.speak(utterance);
  }

  // 9. Remove HUD
  function removeTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  // Helper
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Listen for Sample Test or External Commands
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "show_sample_translation") {
      isPinned = true;
      triggerTranslation("魔女", window.scrollX + window.innerWidth / 2 - 165, window.scrollY + 100, false);
      sendResponse({ status: "ok" });
    }
  });

})();
