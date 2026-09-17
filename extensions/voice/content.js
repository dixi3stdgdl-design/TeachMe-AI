// Content script for ToolTip AI Voice
(() => {
  let speakBtn = null;

  function removeBtn() {
    if (speakBtn) {
      speakBtn.remove();
      speakBtn = null;
    }
  }

  document.addEventListener("mouseup", (e) => {
    const selected = window.getSelection().toString().trim();
    if (selected.length > 2) {
      chrome.storage.sync.get(["selectionButton", "voiceRate", "voiceVol"], (res) => {
        if (res.selectionButton !== false) {
          removeBtn();
          speakBtn = document.createElement("button");
          speakBtn.className = "tooltip-voice-float-btn";
          speakBtn.innerHTML = "🔊 Escuchar";
          speakBtn.style.left = `${e.pageX + 8}px`;
          speakBtn.style.top = `${e.pageY - 30}px`;
          document.body.appendChild(speakBtn);

          speakBtn.addEventListener("click", (evt) => {
            evt.stopPropagation();
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(selected);
            u.lang = "es-ES";
            u.rate = parseFloat(res.voiceRate || 1.0);
            u.volume = parseFloat(res.voiceVol || 0.9);
            window.speechSynthesis.speak(u);
            removeBtn();
          });
        }
      });
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (speakBtn && !speakBtn.contains(e.target)) {
      removeBtn();
    }
  });

  chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "speak_active_selection") {
      const selected = window.getSelection().toString().trim() || "Bienvenido a ToolTip AI Voice.";
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(selected);
      u.lang = "es-ES";
      window.speechSynthesis.speak(u);
    } else if (req.action === "stop_speech") {
      window.speechSynthesis.cancel();
    }
  });
})();
