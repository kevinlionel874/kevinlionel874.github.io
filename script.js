(function () {
  var root = document.documentElement;

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage may be blocked */ }
  }

  /* ---------- Light / dark theme ---------- */
  var toggle = document.querySelector('.theme-toggle');
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    var t = root.dataset.theme;
    return t ? t === 'dark' : media.matches;
  }
  function syncToggle() {
    toggle.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  }
  toggle.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    save('theme', next);
    syncToggle();
  });
  if (media.addEventListener) media.addEventListener('change', syncToggle);
  syncToggle();

  /* ---------- Band-gap LED picker ---------- */
  // Photon energy E = hc / λ ≈ 1239.84 eV·nm / λ
  var leds = Array.prototype.slice.call(document.querySelectorAll('.led'));
  var nmOut = document.getElementById('led-nm');
  var evOut = document.getElementById('led-ev');

  function pickLed(name, remember) {
    var btn = leds.filter(function (b) { return b.dataset.led === name; })[0] || leds[1];
    leds.forEach(function (b) {
      var on = b === btn;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    var nm = Number(btn.dataset.nm);
    nmOut.textContent = nm;
    evOut.textContent = (1239.84 / nm).toFixed(2);
    root.dataset.led = btn.dataset.led;
    if (remember) save('led', btn.dataset.led);
  }

  leds.forEach(function (b, i) {
    b.addEventListener('click', function () { pickLed(b.dataset.led, true); });
    // Arrow keys move between LEDs like a radio group.
    b.addEventListener('keydown', function (e) {
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1
              : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = leds[(i + dir + leds.length) % leds.length];
      pickLed(next.dataset.led, true);
      next.focus();
    });
  });
  pickLed(root.dataset.led || 'amber', false);

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) navObserver.observe(s); });

    /* ---------- Fade sections in as they scroll into view ---------- */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      var targets = document.querySelectorAll('.section, .project, .skill-group');
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    }
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
