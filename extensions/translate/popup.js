// ==========================================================================
// TOOLTIP AI TRANSLATE — POPUP CONTROLLER
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const masterEnabled = document.getElementById("masterEnabled");
  const lblMasterHint = document.getElementById("lblMasterHint");
  const targetLang = document.getElementById("targetLang");
  const showDock = document.getElementById("showDock");
  const btnTestSample = document.getElementById("btnTestSample");
  const modeOptions = document.querySelectorAll(".mode-option");
  const beamButtons = document.querySelectorAll(".beam-btn");

  let currentMode = "hover";
  let currentBeamColor = "theme-cyan";

  // Load Preferences
  chrome.storage.sync.get(["enabled", "scannerMode", "beamColor", "targetLang", "showDock"], (res) => {
    // Master Switch
    const isEnabled = res.enabled !== undefined ? res.enabled : true;
    masterEnabled.checked = isEnabled;
    updateMasterStatus(isEnabled);

    // Scanner Mode
    if (res.scannerMode) {
      currentMode = res.scannerMode;
      modeOptions.forEach(opt => {
        opt.classList.toggle("active", opt.dataset.mode === currentMode);
      });
    }

    // Beam Color
    if (res.beamColor) {
      currentBeamColor = res.beamColor;
      beamButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.color === currentBeamColor);
      });
    }

    // Target Lang
    if (res.targetLang) {
      targetLang.value = res.targetLang;
    }

    // Show Dock
    if (res.showDock !== undefined) {
      showDock.checked = res.showDock;
    }
  });

  // Master Toggle Change
  masterEnabled.addEventListener("change", () => {
    const isEnabled = masterEnabled.checked;
    chrome.storage.sync.set({ enabled: isEnabled });
    updateMasterStatus(isEnabled);
  });

  function updateMasterStatus(isEnabled) {
    lblMasterHint.textContent = isEnabled
      ? "El cursor escanea y traduce en tiempo real"
      : "Haz de escaneo en reposo (Inactivo)";
    lblMasterHint.style.color = isEnabled ? "#94a3b8" : "#f43f5e";
  }

  // Scanner Mode Change
  modeOptions.forEach(option => {
    option.addEventListener("click", () => {
      modeOptions.forEach(opt => opt.classList.remove("active"));
      option.classList.add("active");
      currentMode = option.dataset.mode;
      chrome.storage.sync.set({ scannerMode: currentMode });
    });
  });

  // Beam Color Change
  beamButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      beamButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentBeamColor = btn.dataset.color;
      chrome.storage.sync.set({ beamColor: currentBeamColor });
    });
  });

  // Target Language Change
  targetLang.addEventListener("change", () => {
    chrome.storage.sync.set({ targetLang: targetLang.value });
  });

  // Dock Visibility Change
  showDock.addEventListener("change", () => {
    chrome.storage.sync.set({ showDock: showDock.checked });
  });

  // Test Sample HUD on Current Tab
  btnTestSample.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "show_sample_translation" });
        btnTestSample.innerHTML = "<span>✓ Lente Proyectado!</span>";
        setTimeout(() => {
          btnTestSample.innerHTML = "<span>⚡ Probar Lente de Muestra</span>";
        }, 1500);
      }
    });
  });
});
