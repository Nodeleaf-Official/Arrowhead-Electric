(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('top');

  // Smooth scrolling (skipped for reduced motion or if the library didn't load)
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }

  // In-page links glide to their section
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#' || id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // Header: solid after the hero, tucks away when scrolling down
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y < 500) header.classList.remove('hide');
    lastY = y;
    parallax(y);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Arrowhead drifts and turns slightly as the hero scrolls away
  var stone = document.querySelector('.stone');
  function parallax(y) {
    if (!stone || reduce || y > 900) return;
    stone.style.transform = 'translateY(' + (y * 0.12) + 'px) rotate(' + (y * 0.012) + 'deg)';
  }

  // Fade-ins
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { revealIO.observe(el); });

  // Sticky house: whichever step is in the middle of the screen sets the stage
  var house = document.getElementById('house');
  var steps = document.querySelectorAll('.step');
  var bars = document.querySelectorAll('.stagebar li');
  function setStage(n) {
    house.setAttribute('data-stage', n);
    steps.forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-stage') === String(n)); });
    bars.forEach(function (b, i) { b.classList.toggle('on', i <= n); });
  }
  var stepIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) setStage(Number(en.target.getAttribute('data-stage')));
    });
  }, { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach(function (s) { stepIO.observe(s); });
  setStage(0);

  // Open / closed, Tulsa time. Sunday to Friday, 7 AM to 8 PM.
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
    var day = parts.find(function (p) { return p.type === 'weekday'; }).value;
    var hour = parseInt(parts.find(function (p) { return p.type === 'hour'; }).value, 10) % 24;
    var openDay = day !== 'Sat';
    var open = openDay && hour >= 7 && hour < 20;
    var msg;
    if (open) msg = 'Open now, until 8 PM';
    else if (openDay && hour < 7) msg = 'Closed now. Opens at 7 AM';
    else if (day === 'Fri' || day === 'Sat') msg = 'Closed now. Opens Sunday at 7 AM';
    else msg = 'Closed now. Opens tomorrow at 7 AM';
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.textContent = msg;
      el.classList.add(open ? 'is-open' : 'is-closed');
    });
  } catch (e) {}

  document.getElementById('yr').textContent = new Date().getFullYear();
  onScroll();
})();
