/* ============================================================
   Kotak Aspirasi OSIS — Landing Page Vanilla JS
   Vanilla JS extracted from migrasi ui/halaman-siswa-optimized.html
   ============================================================ */
(function () {
  'use strict';

  // ===== CONFIG =====
  const API_BASE = ''; // Same-origin (static di-host dari Next.js static asset)
  const FORM_ENDPOINT = API_BASE + '/api/aspirasi';
  const CEK_ENDPOINT = API_BASE + '/api/aspirasi';

  // ===== UTILITIES =====
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutQuad(x) { return 1 - (1 - x) * (1 - x); }
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

  // ===== LOADER =====
  (function loader() {
    var loaderFill = document.getElementById('loaderFill');
    var loader = document.getElementById('pageLoader');
    if (!loader || !loaderFill) return;
    var CIRC = 126;
    var progress = 0;
    var fontsReady = false;
    var minTimeReached = false;

    function setProgress(p) {
      progress = Math.min(1, p);
      loaderFill.style.strokeDashoffset = (CIRC - CIRC * progress).toFixed(1);
    }

    function tick() {
      if (progress < 0.9) {
        setProgress(progress + (0.9 - progress) * 0.08 + 0.004);
        requestAnimationFrame(tick);
      }
    }
    tick();

    function maybeFinish() {
      if (fontsReady && minTimeReached) {
        setProgress(1);
        setTimeout(function () { loader.classList.add('hidden'); }, 320);
      }
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fontsReady = true; maybeFinish(); });
    } else { fontsReady = true; }
    setTimeout(function () { minTimeReached = true; maybeFinish(); }, 900);
    window.addEventListener('load', function () { fontsReady = true; maybeFinish(); });
  })();

  // ===== CUSTOM CURSOR =====
  (function cursor() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    var rx = 0, ry = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
      dot.classList.add('show');
      ring.classList.add('show');
    }, { passive: true });

    function loop() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('button, a, select, textarea, input').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.style.width = '44px';
        ring.style.height = '44px';
        ring.style.borderColor = 'rgba(217,160,54,0.9)';
      });
      el.addEventListener('mouseleave', function () {
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.borderColor = 'rgba(217,160,54,0.5)';
      });
    });
  })();

  // ===== AMBIENT MOTES =====
  (function motes() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    var layer = document.getElementById('stageMotes');
    if (!layer) return;
    var n = window.innerWidth < 700 ? 14 : 26;
    var motes = [];
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div');
      el.className = 'mote';
      var size = 1 + Math.random() * 2;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = (Math.random() * 100) + '%';
      el.style.top = (Math.random() * 100) + '%';
      el.style.opacity = (0.15 + Math.random() * 0.35).toFixed(2);
      layer.appendChild(el);
      motes.push({
        el: el,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        amp: 10 + Math.random() * 22,
        driftX: (Math.random() - 0.5) * 14
      });
    }
    var t = 0;
    function tick() {
      t += 0.016;
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        var y = Math.sin(t * m.speed + m.phase) * m.amp;
        var x = Math.cos(t * m.speed * 0.7 + m.phase) * m.driftX;
        m.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      }
      requestAnimationFrame(tick);
    }
    tick();
  })();

  // ===== WHISPER WORDS =====
  var whispers = [
    { text: 'kantin penuh pas istirahat', cut: false },
    { text: 'kadang pengen cerita, tapi—', cut: true },
    { text: 'wifi lab sering mati', cut: false },
    { text: 'sebenernya ada yang ngeganjel dari—', cut: true },
    { text: 'jadwal ulangan numpuk', cut: false },
    { text: 'nggak semua yang keliatan baik-baik aja—', cut: true },
    { text: 'mading udah lama gitu-gitu aja', cut: false },
    { text: 'udah lama pengen bilang ini, cuma—', cut: true },
    { text: 'toilet lantai 2 kurang bersih', cut: false },
    { text: 'kalau boleh jujur, aku—', cut: true },
    { text: 'pengen ada lomba futsal', cut: false },
    { text: 'capek juga sebenernya, tapi—', cut: true },
    { text: 'kelas kepanasan pas siang', cut: false },
    { text: 'susah jelasinnya, pokoknya—', cut: true }
  ];
  var whisperPositions = [
    { top: '15%', left: '5%', z: -20, blur: 2 }, { top: '35%', left: '25%', z: 10, blur: 0 },
    { top: '65%', left: '8%', z: -40, blur: 3 }, { top: '55%', left: '70%', z: 20, blur: 0 },
    { top: '12%', left: '85%', z: -10, blur: 1 }, { top: '45%', left: '35%', z: 30, blur: 0 },
    { top: '78%', left: '75%', z: -30, blur: 2 }, { top: '25%', left: '65%', z: 5, blur: 0 },
    { top: '40%', left: '88%', z: -15, blur: 1 }, { top: '60%', left: '45%', z: 25, blur: 0 },
    { top: '48%', left: '2%', z: -25, blur: 2 }, { top: '28%', left: '78%', z: 15, blur: 0 },
    { top: '85%', left: '35%', z: -5, blur: 1 }, { top: '18%', left: '55%', z: 35, blur: 0 }
  ];

  (function whispersInit() {
    var layer = document.getElementById('whisperLayer');
    if (!layer) return;
    for (var i = 0; i < whispers.length; i++) {
      var w = whispers[i];
      var el = document.createElement('div');
      el.className = 'whisper' + (w.cut ? ' cut' : '');
      el.textContent = w.text;
      var pos = whisperPositions[i % whisperPositions.length];
      el.style.top = pos.top;
      el.style.left = pos.left;
      el.style.filter = 'blur(' + pos.blur + 'px)';
      layer.appendChild(el);
    }
  })();

  // ===== SCROLLYTELLING =====
  (function scrollytelling() {
    var story = document.getElementById('story');
    var paperObject = document.getElementById('paperObject');
    var envFlap = document.getElementById('envFlap');
    var waxSeal = document.getElementById('waxSeal');
    var progressFill = document.getElementById('progressFill');
    var progressLabel = document.getElementById('progressLabel');
    var scrollHint = document.getElementById('scrollHint');
    var caps = [
      document.getElementById('cap1'),
      document.getElementById('cap2'),
      document.getElementById('cap3'),
      document.getElementById('cap4')
    ];
    var formWrapper = document.getElementById('formCardWrapper');
    var envelope = document.getElementById('envelope');
    var flapContainer = document.getElementById('flapContainer');
    var envelopeSeal = document.getElementById('envelopeSeal');
    var fmIntro = document.getElementById('fmIntro');
    var fmTitle = document.getElementById('fmTitle');
    var fldKategori = document.getElementById('fldKategori');
    var fldEmail = document.getElementById('fldEmail');
    var fldAspirasi = document.getElementById('fldAspirasi');
    var fldActions = document.getElementById('fldActions');
    var fmNote = document.getElementById('fmNote');
    var allStagger = [fmIntro, fmTitle, fldKategori, fldEmail, fldAspirasi, fldActions, fmNote];
    var whisperEls = document.querySelectorAll('.whisper');
    var tiltX = 0, tiltY = 0, tiltTargetX = 0, tiltTargetY = 0;

    if (!story || !paperObject) return;

    window.addEventListener('pointermove', function (e) {
      var w = window.innerWidth, h = window.innerHeight;
      tiltTargetY = ((e.clientX / w) - 0.5) * 10;
      tiltTargetX = ((e.clientY / h) - 0.5) * -8;
    }, { passive: true });

    function updateScroll() {
      var rect = story.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var scrolled = clamp(-rect.top, 0, total);
      var p = total > 0 ? scrolled / total : 0;
      if (progressFill) progressFill.style.height = (p * 100) + '%';
      var sceneIdx = Math.min(3, Math.floor(p * 4));
      if (progressLabel) progressLabel.textContent = ('0' + (sceneIdx + 1)) + ' / 04';
      for (var i = 0; i < caps.length; i++) {
        var segStart = i * 0.25, segEnd = segStart + 0.25;
        var inSeg = p >= segStart - 0.05 && p < segEnd - 0.02;
        if (caps[i]) caps[i].classList.toggle('active', inSeg);
      }
      if (scrollHint) scrollHint.style.opacity = p < 0.03 ? '1' : '0';
      var w, h, rotZ, rotX, rotY, scale, flapRot, opacity, waxScale;
      if (p < 0.25) {
        var t1 = easeOutQuad(p / 0.25);
        w = lerp(160, 220, t1);
        h = lerp(200, 280, t1);
        rotZ = lerp(-8, -2, t1);
        rotX = lerp(30, 10, t1);
        rotY = lerp(-15, -5, t1);
        scale = 1;
        flapRot = -180;
        opacity = lerp(0.5, 1, t1 * 2);
        waxScale = 0;
      } else if (p < 0.5) {
        var t2 = (p - 0.25) / 0.25;
        w = lerp(220, 280, t2);
        h = lerp(280, 320, t2);
        rotZ = lerp(-2, 2, t2);
        rotX = lerp(10, 5, t2);
        rotY = lerp(-5, 5, t2);
        scale = 1;
        flapRot = -180;
        opacity = 1;
        waxScale = 0;
      } else if (p < 0.75) {
        var t3 = easeOutCubic((p - 0.5) / 0.25);
        w = lerp(280, 240, t3);
        h = lerp(320, 200, t3);
        rotZ = lerp(2, 0, t3);
        rotX = lerp(5, 0, t3);
        rotY = lerp(5, 0, t3);
        scale = 1;
        flapRot = lerp(-180, 0, t3);
        opacity = 1;
        waxScale = t3 > 0.82 ? clamp((t3 - 0.82) / 0.18, 0, 1) : 0;
      } else {
        var t4 = (p - 0.75) / 0.25;
        w = 240;
        h = 200;
        rotZ = 0;
        rotX = lerp(0, -10, t4);
        rotY = 0;
        scale = lerp(1, 1.2, t4);
        flapRot = 0;
        opacity = lerp(1, 0, clamp((t4 - 0.4) / 0.4, 0, 1));
        waxScale = 1;
      }
      tiltX += (tiltTargetX - tiltX) * 0.06;
      tiltY += (tiltTargetY - tiltY) * 0.06;
      var tiltFactor = p < 0.5 ? (1 - p * 1.4) : 0;
      var tfClamped = clamp(tiltFactor, 0, 1);
      paperObject.style.width = w + 'px';
      paperObject.style.height = h + 'px';
      paperObject.style.transform = 'scale(' + scale + ') rotateX(' + (rotX + tiltX * tfClamped) + 'deg) rotateY(' + (rotY + tiltY * tfClamped) + 'deg) rotateZ(' + rotZ + 'deg)';
      paperObject.style.opacity = opacity;
      if (envFlap) envFlap.style.transform = 'rotateX(' + flapRot + 'deg)';
      if (waxSeal) waxSeal.classList.toggle('pressed', waxScale > 0.5);
      if (envelopeSeal) envelopeSeal.classList.toggle('pressed', waxScale > 0.5);

      var formStart = 0.72;
      var formEnd = 1.0;
      var fp = clamp((p - formStart) / (formEnd - formStart), 0, 1);
      if (formWrapper) {
        if (fp > 0.02) formWrapper.classList.add('visible');
        else { formWrapper.classList.remove('visible'); formWrapper.classList.remove('ready'); }
        if (fp > 0.08) formWrapper.classList.add('ready');
        else formWrapper.classList.remove('ready');
      }
      var staggerThresholds = [
        { el: fmIntro, threshold: 0.10 }, { el: fmTitle, threshold: 0.18 },
        { el: fldKategori, threshold: 0.28 }, { el: fldEmail, threshold: 0.36 },
        { el: fldAspirasi, threshold: 0.46 }, { el: fldActions, threshold: 0.60 },
        { el: fmNote, threshold: 0.72 }
      ];
      for (var s = 0; s < staggerThresholds.length; s++) {
        var item = staggerThresholds[s];
        var show = fp > item.threshold;
        if (item.el) {
          if (show) {
            item.el.classList.add('stagger-show');
            if (item.el === fmIntro || item.el === fmTitle) item.el.classList.add('show');
          } else {
            item.el.classList.remove('stagger-show');
            if (item.el === fmIntro || item.el === fmTitle) item.el.classList.remove('show');
          }
        }
      }
      if (fp < 0.02) {
        for (var a = 0; a < allStagger.length; a++) {
          if (allStagger[a]) allStagger[a].classList.remove('stagger-show', 'show');
        }
        if (formWrapper) formWrapper.classList.remove('ready');
      }
    }
    window.addEventListener('resize', updateScroll);
    updateScroll();

    // Auto-scroll (simplified)
    var AUTO_SCROLL_SPEED = 0.6;
    var RESUME_DELAY = 2000;
    var autoScrollEnabled = true;
    var manualPause = false;
    var resumeTimer = null;
    var lastFrameTime = null;
    var isSyncingScroll = false;

    function storyBottomY() {
      var rect = story.getBoundingClientRect();
      return window.scrollY + rect.height - window.innerHeight;
    }
    function pauseAutoScroll() {
      if (!autoScrollEnabled) return;
      manualPause = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { manualPause = false; }, RESUME_DELAY);
    }
    ['wheel', 'touchstart', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, function (e) {
        if (evt === 'keydown') {
          var navKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Spacebar', 'Home', 'End'];
          if (navKeys.indexOf(e.key) === -1) return;
        }
        pauseAutoScroll();
      }, { passive: true });
    });
    window.addEventListener('scroll', function () {
      if (isSyncingScroll) { updateScroll(); return; }
      pauseAutoScroll();
      updateScroll();
    }, { passive: true });

    function autoScrollTick(now) {
      if (lastFrameTime === null) lastFrameTime = now;
      var dt = now - lastFrameTime;
      lastFrameTime = now;
      if (autoScrollEnabled && !manualPause) {
        var bottom = storyBottomY();
        if (window.scrollY < bottom - 1) {
          var step = AUTO_SCROLL_SPEED * (dt / 16.6);
          isSyncingScroll = true;
          window.scrollBy(0, step);
          isSyncingScroll = false;
        }
      }
      requestAnimationFrame(autoScrollTick);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(autoScrollTick);
    }

    var autoscrollToggle = document.getElementById('autoscrollToggle');
    var autoscrollIcon = document.getElementById('autoscrollIcon');
    var autoscrollLabel = document.getElementById('autoscrollLabel');
    if (autoscrollToggle) {
      autoscrollToggle.addEventListener('click', function () {
        autoScrollEnabled = !autoScrollEnabled;
        autoscrollToggle.classList.toggle('playing', autoScrollEnabled);
        autoscrollToggle.setAttribute('aria-pressed', autoScrollEnabled ? 'true' : 'false');
        if (autoscrollIcon) {
          autoscrollIcon.className = autoScrollEnabled ? 'ti ti-player-pause-filled' : 'ti ti-player-play-filled';
        }
        if (autoscrollLabel) autoscrollLabel.textContent = autoScrollEnabled ? 'Jeda gulir otomatis' : 'Lanjut gulir otomatis';
      });
    }
  })();

  // ===== FORM SUBMIT =====
  (function formSubmit() {
    var form = document.getElementById('aspirasiForm');
    if (!form) return;
    var btnKirim = document.getElementById('btnKirim');
    var btnKirimText = document.getElementById('btnKirimText');
    var toast = document.getElementById('toast');
    var toastCode = document.getElementById('toastCode');
    var fldAspirasi = document.getElementById('fldAspirasi');
    var fldEmail = document.getElementById('fldEmail');
    var errAspirasi = document.getElementById('errAspirasi');
    var errEmail = document.getElementById('errEmail');
    var charCount = document.getElementById('charCount');
    var textarea = document.getElementById('aspirasi');
    var emailInput = document.getElementById('email');
    var ulAspirasi = document.getElementById('ulAspirasi');
    var ulEmail = document.getElementById('ulEmail');

    if (textarea && charCount) {
      textarea.addEventListener('input', function () {
        charCount.textContent = textarea.value.length + ' / 1200';
        if (textarea.value.length > 0) charCount.classList.add('show');
        else charCount.classList.remove('show');
      });
    }
    if (ulAspirasi && textarea) {
      textarea.addEventListener('focus', function () { ulAspirasi.classList.add('focused'); });
      textarea.addEventListener('blur', function () { ulAspirasi.classList.remove('focused'); });
    }
    if (ulEmail && emailInput) {
      emailInput.addEventListener('focus', function () { ulEmail.classList.add('focused'); });
      emailInput.addEventListener('blur', function () { ulEmail.classList.remove('focused'); });
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(field, errorEl, show) {
      if (show) {
        if (field) field.classList.add('has-error');
        if (errorEl) errorEl.classList.add('show');
        if (field) field.classList.add('shake');
        setTimeout(function () { if (field) field.classList.remove('shake'); }, 500);
      } else {
        if (field) field.classList.remove('has-error');
        if (errorEl) errorEl.classList.remove('show');
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isi = textarea.value.trim();
      var email = emailInput.value.trim();
      var kategori = document.getElementById('kategori').value;

      var hasError = false;
      if (!isi) {
        showFieldError(fldAspirasi, errAspirasi, true);
        hasError = true;
      } else {
        showFieldError(fldAspirasi, errAspirasi, false);
      }
      if (email && !isValidEmail(email)) {
        showFieldError(fldEmail, errEmail, true);
        hasError = true;
      } else {
        showFieldError(fldEmail, errEmail, false);
      }
      if (hasError) return;

      btnKirim.disabled = true;
      btnKirimText.textContent = 'Mengirim...';
      btnKirim.classList.add('success');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isi: isi, kategori: kategori || null, email_siswa: email || null })
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok && result.data.kode_tiket) {
            toastCode.textContent = result.data.kode_tiket;
            toast.classList.add('show');
            setTimeout(function () { toast.classList.remove('show'); }, 4000);
            form.reset();
            if (charCount) { charCount.textContent = '0 / 1200'; charCount.classList.remove('show'); }
          } else {
            errAspirasi.querySelector('span').textContent = result.data.error || 'Gagal menyimpan aspirasi';
            showFieldError(fldAspirasi, errAspirasi, true);
          }
        })
        .catch(function () {
          errAspirasi.querySelector('span').textContent = 'Gagal terhubung ke server';
          showFieldError(fldAspirasi, errAspirasi, true);
        })
        .finally(function () {
          btnKirim.disabled = false;
          btnKirimText.textContent = 'Segel & Kirim';
          btnKirim.classList.remove('success');
        });
    });
  })();

  // ===== MODAL — RUANG PRIVAT =====
  (function modal() {
    var btnOpen = document.getElementById('btnOpenStatus');
    var modal = document.getElementById('statusModal');
    var btnCloseModal = document.getElementById('btnCloseModal');
    var btnCloseBottom = document.getElementById('btnCloseBottom');
    var btnReset = document.getElementById('btnResetCheck');
    var btnLacak = document.getElementById('btnLacak');
    var statusInput = document.getElementById('statusInput');
    var modalHint = document.getElementById('modalHint');
    var registryResult = document.getElementById('registryResult');
    var resultCode = document.getElementById('resultCodeDisplay');
    var statusStrip = document.getElementById('statusStrip');
    var resultMessage = document.getElementById('resultMessage');

    if (!modal) return;

    function openModal() { modal.classList.add('show'); }
    function closeModal() { modal.classList.remove('show'); }
    function resetResult() {
      if (registryResult) registryResult.classList.remove('show');
      if (statusInput) statusInput.value = '';
      if (modalHint) { modalHint.textContent = 'Kode tiket diberikan saat surat selesai dikirim.'; modalHint.classList.remove('error'); }
    }

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCloseBottom) btnCloseBottom.addEventListener('click', closeModal);
    if (btnReset) btnReset.addEventListener('click', resetResult);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    // Stages mapping
    var stages = [
      { key: 'menunggu', label: 'Diterima', icon: 'ti ti-mail' },
      { key: 'diproses', label: 'Diproses', icon: 'ti ti-eye' },
      { key: 'dibalas', label: 'Dibalas', icon: 'ti ti-message-circle' },
      { key: 'diteruskan', label: 'Diteruskan', icon: 'ti ti-send' }
    ];

    function renderStatusStrip(status) {
      var currentIdx = stages.findIndex(function (s) { return s.key === status; });
      if (currentIdx === -1) currentIdx = 0;
      var html = '';
      for (var i = 0; i < stages.length; i++) {
        var s = stages[i];
        var cls = '';
        if (i < currentIdx) cls = 'completed';
        else if (i === currentIdx) cls = 'current';
        html += '<div class="status-node ' + cls + '"><div class="node-dot"><i class="' + s.icon + '"></i></div><div class="node-line"></div><div class="node-label">' + s.label + '</div></div>';
      }
      if (statusStrip) statusStrip.innerHTML = html;
    }

    function fetchStatus() {
      var kode = (statusInput.value || '').trim().toUpperCase();
      if (!kode) {
        modalHint.textContent = 'Masukkan kode tiket terlebih dahulu';
        modalHint.classList.add('error');
        return;
      }
      modalHint.textContent = 'Mencari...';
      modalHint.classList.remove('error');
      btnLacak.disabled = true;
      btnLacak.innerHTML = '<i class="ti ti-loader-2"></i> Lacak';

      fetch(CEK_ENDPOINT + '/' + encodeURIComponent(kode))
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok && result.data.aspirasi) {
            var a = result.data.aspirasi;
            resultCode.textContent = a.kode_tiket;
            renderStatusStrip(a.status);
            resultMessage.innerHTML = '<strong>Status: ' + a.status + '</strong> — ' + (a.isi ? a.isi.substring(0, 100) + (a.isi.length > 100 ? '...' : '') : '');
            registryResult.classList.add('show');
            modalHint.textContent = 'Ditemukan';
            modalHint.classList.remove('error');
          } else {
            modalHint.textContent = result.data.error || 'Kode tiket tidak ditemukan';
            modalHint.classList.add('error');
            registryResult.classList.remove('show');
          }
        })
        .catch(function () {
          modalHint.textContent = 'Gagal terhubung ke server';
          modalHint.classList.add('error');
        })
        .finally(function () {
          btnLacak.disabled = false;
          btnLacak.innerHTML = '<i class="ti ti-search"></i> Lacak';
        });
    }

    if (btnLacak) btnLacak.addEventListener('click', fetchStatus);
    if (statusInput) statusInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') fetchStatus(); });
  })();
})();
