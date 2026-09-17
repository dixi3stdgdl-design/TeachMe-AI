document.addEventListener("DOMContentLoaded", () => {
  const auraRadar = document.getElementById("auraRadar");
  const linkShield = document.getElementById("linkShield");
  const btnPing = document.getElementById("btnPing");

  chrome.storage.sync.get(["auraRadar", "linkShield"], (res) => {
    if (res.auraRadar !== undefined) auraRadar.checked = res.auraRadar;
    if (res.linkShield !== undefined) linkShield.checked = res.linkShield;
  });

  auraRadar.addEventListener("change", () => {
    chrome.storage.sync.set({ auraRadar: auraRadar.checked });
  });

  linkShield.addEventListener("change", () => {
    chrome.storage.sync.set({ linkShield: linkShield.checked });
  });

  btnPing.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "ping_aura_sonar" });
      }
    });
  });
});
