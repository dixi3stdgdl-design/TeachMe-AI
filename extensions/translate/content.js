// Content script for ToolTip AI Translate
(() => {
  let tooltip = null;

  function createTooltip(text, x, y) {
    removeTooltip();
    tooltip = document.createElement("div");
    tooltip.className = "tooltip-ai-translate-lens";
    tooltip.innerHTML = `
      <div class="tt-header">
        <span class="tt-dot"></span>
        <span class="tt-title">TOOLTIP TRANSLATE</span>
        <button class="tt-close">✕</button>
      </div>
      <div class="tt-body">${text}</div>
    `;
    tooltip.style.left = `${Math.min(x, window.innerWidth - 320)}px`;
    tooltip.style.top = `${y + 14}px`;
    document.body.appendChild(tooltip);

    tooltip.querySelector(".tt-close").addEventListener("click", removeTooltip);
  }

  function removeTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  document.addEventListener("mouseup", (e) => {
    const selected = window.getSelection().toString().trim();
    if (selected.length > 2) {
      chrome.storage.sync.get(["autoLens", "targetLang"], (res) => {
        if (res.autoLens !== false) {
          createTooltip(`Traducción instantánea: "${selected}"`, e.pageX, e.pageY);
        }
      });
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (tooltip && !tooltip.contains(e.target)) {
      removeTooltip();
    }
  });

  chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "show_sample_translation") {
      createTooltip("Muestra: El motor de traducción contextual ToolTip AI está operando correctamente.", window.innerWidth / 2 - 150, 80);
    }
  });
})();
