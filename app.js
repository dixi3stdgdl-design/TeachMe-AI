/**
 * TOOLTIP-AI — REIMAGINED HIGH-END NEURAL INTERFACE
 * Horizontal Authentic Internet Creation Code Streams, Platinum Glass & Dynamic Tooltips
 */

// Authentic Foundational Internet Creation Code Database
const INTERNET_CREATION_CODE = [
  "/* CERN WorldWideWeb v0.1 (1990) - Tim Berners-Lee */ char* HTParse(const char* aName, const char* relatedName, int flag);",
  "// RFC 793 (1981) TCP Transmission Control Protocol - 3-Way Handshake [SYN] -> [SYN-ACK] -> [ACK]",
  "struct tcphdr { uint16_t th_sport; uint16_t th_dport; uint32_t th_seq; uint32_t th_ack; uint8_t th_flags; /* SYN=0x02, ACK=0x10 */ };",
  "/* ARPANET BBN Report 1822 (1969) */ int send_imp_message(struct imp_packet *pkt, uint8_t host_id, uint8_t link);",
  "// 4.2BSD Sockets (1983) Berkeley Unix: int sockfd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);",
  "connect(sockfd, (struct sockaddr *)&server_addr, sizeof(struct sockaddr_in)); /* TCP 3-Way Handshake */",
  "/* RFC 1035 Domain Names (BIND DNS 1987) */ struct dns_header { uint16_t id; uint16_t flags; uint16_t qdcount; uint16_t ancount; };",
  "// HTTP/1.0 RFC 1945: GET /index.html HTTP/1.0\\r\\nHost: info.cern.ch\\r\\nUser-Agent: CERN-NextStep-WorldWideWeb.app\\r\\n\\r\\n",
  "/* RFC 791 IPv4 Internet Protocol Header */ struct ip { uint8_t ip_v:4, ip_hl:4; uint8_t ip_tos; uint16_t ip_len; uint32_t ip_src, ip_dst; };",
  "// RFC 4271 Border Gateway Protocol (BGP-4): struct bgp_msg { uint8_t marker[16]; uint16_t length; uint8_t type; /* KEEPALIVE */ };",
  "/* RFC 2616 HTTP/1.1 Persistent Sockets */ HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\nConnection: keep-alive\\r\\n",
  "// Vint Cerf & Bob Kahn (1974): A Protocol for Packet Network Intercommunication - IEEE Trans Comm",
  "/* Windows 11 Native Kernel Engine (P/Invoke) */ [DllImport(\"user32.dll\")] public static extern IntPtr SetWindowsHookEx(int id, HookProc lp, IntPtr h, uint t);",
  "// Zero-GC memory allocation: Span<char> buffer = stackalloc char[512]; GetClassNameW(hWnd, pBuf, 512);",
  "/* Windows.Media.Ocr Native Engine */ OcrEngine engine = OcrEngine.TryCreateFromLanguage(new Language(\"es-ES\"));",
  "// Multimodal Vision Inference Pipeline: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
];

const MODULE_CODE_DATABASE = {
  core_unsafe: {
    file: "NativeKernelEngine.cs",
    title: "C# .NET 8 Unsafe Win32 Kernel Hook",
    code: `[DllImport("user32.dll", SetLastError = true)]
public static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

public unsafe static string GetWindowClassName(IntPtr hWnd) {
    Span<char> buffer = stackalloc char[512];
    fixed (char* pBuf = buffer) {
        int len = NativeMethods.GetClassNameW(hWnd, pBuf, 512);
        return len > 0 ? new string(pBuf, 0, len) : string.Empty;
    }
}`
  },
  translate_ocr: {
    file: "TranslateEngine.cs",
    title: "Windows.Media.Ocr Local Engine",
    code: `public async Task<string> RecognizeScreenAreaAsync(SoftwareBitmap bitmap) {
    OcrEngine engine = OcrEngine.TryCreateFromLanguage(new Language("es-ES"));
    OcrResult result = await engine.RecognizeAsync(bitmap);
    if (focusedElement.IsPassword) return "[PROTECTED_PASSWORD_FIELD]";
    return result.Text;
}`
  },
  aura_dwell: {
    file: "DwellRadarEngine.cs",
    title: "Dwell Cursor Radar & 4-Quadrant Risk Matrix",
    code: `public void OnMouseDwellCompleted(Point cursorPosition) {
    AutomationElement target = AutomationElement.FromPoint(cursorPosition);
    RiskAssessment risk = CognitiveEvaluator.Evaluate(target);
    AcrylicHudWindow.ShowOverlay(target, risk, backdrop: BackdropType.Mica);
}`
  },
  voice_tts: {
    file: "VoiceSynthesizer.cs",
    title: "Windows.Media.SpeechSynthesis HD Neural",
    code: `using System.Speech.Synthesis;
public void SpeakVerdict(string diagnosis) {
    using var synth = new SpeechSynthesizer();
    synth.SelectVoiceByHints(VoiceGender.Female, VoiceAge.Adult);
    synth.SpeakAsync(diagnosis);
}`
  }
};

/* ========================================================================== */
/* 1. HORIZONTAL SLOW INTERNET CREATION CODE STREAM ENGINE                    */
/* ========================================================================== */
class HorizontalInternetCodeEngine {
  constructor() {
    this.canvas = document.getElementById('codeRainCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.lanes = [];
    this.laneHeight = 32;
    this.baseSpeed = 0.45; // Calm, slow, elegant horizontal speed
    this.activeSpecSnippet = "";
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const numLanes = Math.floor(this.canvas.height / this.laneHeight);
    this.lanes = [];

    for (let i = 0; i < numLanes; i++) {
      const codeIndex = i % INTERNET_CREATION_CODE.length;
      this.lanes.push({
        y: (i + 1) * this.laneHeight,
        x: Math.random() * this.canvas.width,
        speed: this.baseSpeed + (Math.random() * 0.25 - 0.1),
        text: INTERNET_CREATION_CODE[codeIndex],
        opacity: 0.12 + Math.random() * 0.16,
        isHighlighted: false
      });
    }
  }

  highlightSpecCode(codeSnippet, fileName) {
    this.activeSpecSnippet = codeSnippet;
    const banner = document.getElementById('activeFileName');
    if (banner && fileName) {
      banner.textContent = `${fileName} • Código de Inferencia Activo`;
    }

    // Assign snippet lines to random lanes to smoothly illuminate
    const lines = codeSnippet.split('\n').filter(l => l.trim().length > 0);
    lines.forEach((line, idx) => {
      const laneIdx = (idx * 3 + 2) % this.lanes.length;
      if (this.lanes[laneIdx]) {
        this.lanes[laneIdx].text = line;
        this.lanes[laneIdx].isHighlighted = true;
        this.lanes[laneIdx].opacity = 0.55;
      }
    });
  }

  resetHighlight() {
    this.lanes.forEach((lane, i) => {
      lane.isHighlighted = false;
      lane.opacity = 0.12 + (i % 5) * 0.03;
      lane.text = INTERNET_CREATION_CODE[i % INTERNET_CREATION_CODE.length];
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Clean background redraw with deep obsidian tint
    this.ctx.fillStyle = 'rgba(7, 10, 19, 0.22)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = '13px "JetBrains Mono", Consolas, monospace';

    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];

      // Smooth horizontal drift from right to left
      lane.x -= lane.speed;

      const textWidth = this.ctx.measureText(lane.text).width;

      // Wrap around screen horizontally
      if (lane.x + textWidth < 0) {
        lane.x = this.canvas.width + 40;
        if (!lane.isHighlighted) {
          lane.text = INTERNET_CREATION_CODE[Math.floor(Math.random() * INTERNET_CREATION_CODE.length)];
        }
      }

      // Elegant Color Palette: Luminescent Blue, Ice Cyan, Platinum White
      if (lane.isHighlighted) {
        this.ctx.fillStyle = `rgba(56, 189, 248, ${lane.opacity})`; // Vibrant Ice Cyan
      } else if (i % 4 === 0) {
        this.ctx.fillStyle = `rgba(96, 165, 250, ${lane.opacity})`; // Cobalt Sky
      } else if (i % 4 === 1) {
        this.ctx.fillStyle = `rgba(165, 180, 252, ${lane.opacity})`; // Soft Platinum Violet
      } else {
        this.ctx.fillStyle = `rgba(148, 163, 184, ${lane.opacity})`; // Deep Silver Gray
      }

      this.ctx.fillText(lane.text, lane.x, lane.y);
    }
  }
}

/* ========================================================================== */
/* 2. AUDIO FEEDBACK HAPTIC SYNTH                                            */
/* ========================================================================== */
class AudioHapticSynth {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    } catch (e) {
      this.enabled = false;
    }
  }

  playBeep(freq = 520, duration = 0.05) {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
}

/* ========================================================================== */
/* 3. DYNAMIC FLOATING TOOLTIP & LASER BEAM ENGINE                           */
/* ========================================================================== */
class TooltipEngine {
  constructor(codeEngine, audio) {
    this.codeEngine = codeEngine;
    this.audio = audio;
    this.tooltipEl = document.getElementById('dynamicTooltip');
    this.titleEl = document.getElementById('tooltipHeaderTitle');
    this.specTagEl = document.getElementById('tooltipSpecTag');
    this.bodyEl = document.getElementById('tooltipBodyText');
    this.snippetEl = document.getElementById('tooltipCodeSnippet');

    this.connectorSvg = document.getElementById('connectorSvg');
    this.connectorPath = document.getElementById('connectorPath');
    this.anchorDot = document.getElementById('connectorAnchorDot');
    this.targetDot = document.getElementById('connectorTargetDot');

    this.activeTarget = null;
    this.init();
  }

  init() {
    const triggers = document.querySelectorAll('.tooltip-trigger');
    triggers.forEach(el => {
      el.addEventListener('mouseenter', (e) => this.show(el, e));
      el.addEventListener('mousemove', (e) => this.updatePosition(el, e));
      el.addEventListener('mouseleave', () => this.hide());
    });
  }

  show(target, e) {
    this.activeTarget = target;
    const specKey = target.getAttribute('data-code-spec') || 'core_unsafe';
    const title = target.getAttribute('data-tooltip-title') || 'Inspección de Pantalla';
    const body = target.getAttribute('data-tooltip-body') || 'Análisis en tiempo real de interfaz.';
    const specFile = target.getAttribute('data-spec-file') || 'NativeKernelEngine.cs';

    if (this.titleEl) this.titleEl.textContent = title;
    if (this.specTagEl) this.specTagEl.textContent = specFile;
    if (this.bodyEl) this.bodyEl.textContent = body;

    const specData = MODULE_CODE_DATABASE[specKey];
    if (specData && this.snippetEl) {
      this.snippetEl.textContent = specData.code;
    }

    if (this.codeEngine && specData) {
      this.codeEngine.highlightSpecCode(specData.code, specData.file);
    }

    if (this.audio) {
      this.audio.playBeep(580, 0.04);
    }

    this.tooltipEl.classList.add('active');
    this.updatePosition(target, e);
  }

  updatePosition(target, e) {
    if (!this.activeTarget) return;

    const tooltipWidth = 380;
    const tooltipHeight = 220;
    const padding = 20;

    const targetRect = target.getBoundingClientRect();
    const anchorX = targetRect.left + targetRect.width / 2;
    const anchorY = targetRect.top + targetRect.height / 2;

    let posX = e.clientX + 24;
    let posY = e.clientY + 24;

    // Viewport collision clamping
    if (posX + tooltipWidth > window.innerWidth - padding) {
      posX = e.clientX - tooltipWidth - 24;
    }
    if (posY + tooltipHeight > window.innerHeight - padding) {
      posY = e.clientY - tooltipHeight - 24;
    }

    this.tooltipEl.style.transform = `translate(${posX}px, ${posY}px)`;

    // Draw guide laser line
    this.drawLaserBeam(anchorX, anchorY, posX + 20, posY + 20);
  }

  drawLaserBeam(x1, y1, x2, y2) {
    if (!this.connectorPath) return;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx1 = x1 + dx * 0.4;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.6;
    const cy2 = y2;

    const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    this.connectorPath.setAttribute('d', d);

    if (this.anchorDot) {
      this.anchorDot.setAttribute('cx', x1);
      this.anchorDot.setAttribute('cy', y1);
    }
    if (this.targetDot) {
      this.targetDot.setAttribute('cx', x2);
      this.targetDot.setAttribute('cy', y2);
    }
  }

  hide() {
    this.activeTarget = null;
    this.tooltipEl.classList.remove('active');
    if (this.connectorPath) {
      this.connectorPath.setAttribute('d', '');
    }
    if (this.codeEngine) {
      this.codeEngine.resetHighlight();
    }
  }
}

/* ========================================================================== */
/* 4. WORKSPACE SCENARIO CONTROLLER                                          */
/* ========================================================================== */
function initScenarioSwitcher() {
  const buttons = document.querySelectorAll('.scenario-pill-btn');
  const targetInstaller = document.getElementById('targetInstaller');
  const targetError = document.getElementById('targetError');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scenario = btn.getAttribute('data-scenario');

      if (scenario === 'error') {
        if (targetError) targetError.style.display = 'block';
        if (targetInstaller) targetInstaller.style.display = 'none';
      } else {
        if (targetError) targetError.style.display = 'none';
        if (targetInstaller) targetInstaller.style.display = 'block';
      }
    });
  });
}

/* ========================================================================== */
/* 5. APP BOOTSTRAP                                                          */
/* ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const codeEngine = new HorizontalInternetCodeEngine();
  const audio = new AudioHapticSynth();
  new TooltipEngine(codeEngine, audio);
  initScenarioSwitcher();

  // Audio button toggle
  const btnSound = document.getElementById('btnSoundToggle');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      btnSound.style.opacity = audio.enabled ? '1' : '0.4';
      if (audio.enabled) audio.playBeep(720, 0.06);
    });
  }
});
