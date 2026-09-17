// Content script for ToolTip AI Aura
(() => {
  let dwellTimer = null;
  let activeElement = null;

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("a, button, [role='button']");
    if (target && target !== activeElement) {
      activeElement = target;
      clearTimeout(dwellTimer);
      dwellTimer = setTimeout(() => {
        target.classList.add("tooltip-aura-dwell-highlight");
      }, 450);
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (activeElement && !activeElement.contains(e.relatedTarget)) {
      clearTimeout(dwellTimer);
      activeElement.classList.remove("tooltip-aura-dwell-highlight");
      activeElement = null;
    }
  });

  chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "ping_aura_sonar") {
      const links = document.querySelectorAll("a, button");
      links.forEach((el) => {
        el.classList.add("tooltip-aura-pulse");
        setTimeout(() => el.classList.remove("tooltip-aura-pulse"), 1200);
      });
    }
  });
})();
