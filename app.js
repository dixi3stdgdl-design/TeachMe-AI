/* Tooltip AI — WebGL light-field + interactions */
(function () {
  'use strict';

  /* ---------- WebGL ambient light-field ---------- */
  var canvas = document.getElementById('gl');
  if (canvas && canvas.getContext) {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (gl) {
      var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      var fs = [
        'precision highp float;',
        'uniform vec2 u_res;uniform float u_t;uniform vec2 u_m;',
        'void main(){',
        '  vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;',
        '  vec2 m=(u_m-.5)*vec2(u_res.x/u_res.y,1.);',
        '  float t=u_t*.10;',
        // thin flowing ribbons over deep void
        '  float w1=sin(p.x*1.6+t*1.15+p.y*2.2)+.55*sin(p.y*2.4-t*.85);',
        '  float w2=sin(p.x*2.1-t*.7-p.y*1.8)+.45*sin(length(p)*2.2+t*.5);',
        '  float ribbon1=pow(max(0.,1.-abs(w1)*.95),6.0);',
        '  float ribbon2=pow(max(0.,1.-abs(w2)*.9),7.0);',
        '  float halo=exp(-abs(p.y+.22*sin(t*.6+p.x*1.1))*3.2);',
        '  float d=length(p-m*.55);',
        '  float lens=exp(-d*d*5.5);',
        '  float r=length(p);',
        '  float fade=smoothstep(1.45,.12,r);',
        '  vec3 c1=vec3(.012,.018,.032);',
        '  vec3 teal=vec3(.12,.78,.70);',
        '  vec3 sky=vec3(.18,.62,.95);',
        '  vec3 vio=vec3(.58,.42,.95);',
        '  vec3 col=c1;',
        '  col+=teal*ribbon1*.85*fade;',
        '  col+=sky*ribbon2*.65*fade;',
        '  col+=vio*halo*.22*fade;',
        '  col+=vec3(.35,.75,.85)*lens*.35;',
        '  col*=.88+.12*smoothstep(1.8,0.,r);',
        '  gl_FragColor=vec4(col,1.);',
        '}'
      ].join('\n');

      function sh(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }
      var prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      var uRes = gl.getUniformLocation(prog, 'u_res');
      var uT = gl.getUniformLocation(prog, 'u_t');
      var uM = gl.getUniformLocation(prog, 'u_m');

      var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
      function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
        canvas.width = Math.floor(innerWidth * dpr);
        canvas.height = Math.floor(innerHeight * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      addEventListener('resize', resize);
      resize();

      addEventListener('pointermove', function (e) {
        tmx = e.clientX / innerWidth;
        tmy = 1 - e.clientY / innerHeight;
      }, { passive: true });

      var t0 = performance.now();
      function frame(now) {
        mx += (tmx - mx) * 0.06;
        my += (tmy - my) * 0.06;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uT, (now - t0) * 0.001);
        gl.uniform2f(uM, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }

  /* ---------- scroll progress + reveals ---------- */
  var progress = document.getElementById('progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  // hero visible immediately
  document.querySelectorAll('.hero .reveal').forEach(function (el) {
    requestAnimationFrame(function () { el.classList.add('in'); });
  });

  /* ---------- magnetic buttons ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.22 + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- mobile nav ---------- */
  var menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  /* ---------- checkout modal (PayPal in popup, no redirect) ---------- */
  var catalog = {
    bundle: {
      title: 'Bundle Suite',
      desc: 'Aura + Voice + Translate · licencia de por vida',
      product: 'Tooltip AI Bundle',
      total: '24.99 USD',
      url: 'https://paypal.me/DixLqb/24.99'
    },
    module: {
      title: 'Módulo suelto',
      desc: 'Aura, Voice o Translate · indícalo en el correo',
      product: 'Tooltip AI Module',
      total: '9.99 USD',
      url: 'https://paypal.me/DixLqb/9.99'
    },
    aura: {
      title: 'ToolTip AI Aura',
      desc: 'Contexto por reposo · licencia de por vida',
      product: 'Aura',
      total: '9.99 USD',
      url: 'https://paypal.me/DixLqb/9.99'
    },
    voice: {
      title: 'ToolTip AI Voice',
      desc: 'Voz y ducking · licencia de por vida',
      product: 'Voice',
      total: '9.99 USD',
      url: 'https://paypal.me/DixLqb/9.99'
    },
    translate: {
      title: 'ToolTip AI Translate',
      desc: 'Traducción en pantalla · licencia de por vida',
      product: 'Translate',
      total: '9.99 USD',
      url: 'https://paypal.me/DixLqb/9.99'
    },
    assistant: {
      title: 'ToolTip AI Assistant',
      desc: 'Inspector de pantalla · gratis',
      product: 'Assistant',
      total: '0 USD · gratis',
      url: 'mailto:dixstdgdl3@gmail.com?subject=Descarga%20Assistant%20Tooltip%20AI'
    },
    team: {
      title: 'Tooltip AI Team',
      desc: 'Licencias por volumen · 299–999 USD',
      product: 'Team / Enterprise',
      total: 'A medida',
      url: 'mailto:DixStdGdl@hotmail.com?subject=Tooltip%20AI%20Team'
    }
  };

  var modal = document.getElementById('checkout');
  var ckTitle = document.getElementById('ckTitle');
  var ckDesc = document.getElementById('ckDesc');
  var ckProduct = document.getElementById('ckProduct');
  var ckTotal = document.getElementById('ckTotal');
  var ckPay = document.getElementById('ckPay');
  var current = catalog.bundle;

  function openCk(key) {
    current = catalog[key] || catalog.bundle;
    ckTitle.textContent = current.title;
    ckDesc.textContent = current.desc;
    ckProduct.textContent = current.product;
    ckTotal.textContent = current.total;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeCk() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-buy]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openCk(el.getAttribute('data-buy'));
    });
  });
  document.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeCk);
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCk();
  });

  ckPay.addEventListener('click', function () {
    if (current.url.indexOf('mailto:') === 0) {
      location.href = current.url;
      return;
    }
    var w = 520, h = 720;
    window.open(
      current.url,
      'tooltip-paypal',
      'width=' + w + ',height=' + h +
      ',left=' + ((screen.width - w) / 2) +
      ',top=' + ((screen.height - h) / 2) +
      ',noopener,noreferrer'
    );
  });

  /* ---------- HUD parallax on pointer ---------- */
  var hud = document.getElementById('heroHud');
  if (hud && !reduce) {
    addEventListener('pointermove', function (e) {
      var x = (e.clientX / innerWidth - 0.5) * 12;
      var y = (e.clientY / innerHeight - 0.5) * 8;
      hud.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }, { passive: true });
  }
})();
