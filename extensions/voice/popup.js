document.addEventListener("DOMContentLoaded", () => {
  const voiceRate = document.getElementById("voiceRate");
  const voiceVol = document.getElementById("voiceVol");
  const selectionButton = document.getElementById("selectionButton");
  const btnSpeak = document.getElementById("btnSpeak");
  const btnStop = document.getElementById("btnStop");

  chrome.storage.sync.get(["voiceRate", "voiceVol", "selectionButton"], (res) => {
    if (res.voiceRate) voiceRate.value = res.voiceRate;
    if (res.voiceVol) voiceVol.value = res.voiceVol;
    if (res.selectionButton !== undefined) selectionButton.checked = res.selectionButton;
  });

  voiceRate.addEventListener("change", () => chrome.storage.sync.set({ voiceRate: voiceRate.value }));
  voiceVol.addEventListener("change", () => chrome.storage.sync.set({ voiceVol: voiceVol.value }));
  selectionButton.addEventListener("change", () => chrome.storage.sync.set({ selectionButton: selectionButton.checked }));

  btnSpeak.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "speak_active_selection" });
      }
    });
  });

  btnStop.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "stop_speech" });
      }
    });
  });
});
