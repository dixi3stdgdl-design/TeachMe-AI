document.addEventListener("DOMContentLoaded", () => {
  const targetLang = document.getElementById("targetLang");
  const autoLens = document.getElementById("autoLens");
  const btnTest = document.getElementById("btnTest");

  chrome.storage.sync.get(["targetLang", "autoLens"], (res) => {
    if (res.targetLang) targetLang.value = res.targetLang;
    if (res.autoLens !== undefined) autoLens.checked = res.autoLens;
  });

  targetLang.addEventListener("change", () => {
    chrome.storage.sync.set({ targetLang: targetLang.value });
  });

  autoLens.addEventListener("change", () => {
    chrome.storage.sync.set({ autoLens: autoLens.checked });
  });

  btnTest.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "show_sample_translation" });
      }
    });
  });
});
