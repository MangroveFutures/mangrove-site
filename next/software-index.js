/* Software section. Direction B: plates draw in as they scroll into view. Product pages: the "On this page" list marks the
   section you are reading, and the flow line of "How it works" draws in. Without JavaScript or with reduced motion
   everything shows at once and nothing is hidden. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ||
    root.getAttribute('data-lib-motion') === 'reduce';
  if (!('IntersectionObserver' in window)) return;

  var plates = [].slice.call(d.querySelectorAll('.sx-b .plate'));
  var steps = [].slice.call(d.querySelectorAll('.flow li'));
  if ((plates.length || steps.length) && !reduce) {
    [].forEach.call(d.querySelectorAll('.plate .art path'), function (p) { p.setAttribute('pathLength', '1'); });
    root.classList.add('sx-armed');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    plates.concat(steps).forEach(function (p) { io.observe(p); });
  }

  var links = [].slice.call(d.querySelectorAll('.toc a'));
  if (links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var cur = null;
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = byId[e.target.id];
        if (!a || a === cur) return;
        if (cur) cur.removeAttribute('aria-current');
        a.setAttribute('aria-current', 'true'); cur = a;
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    [].forEach.call(d.querySelectorAll('.ps-sec'), function (s) { so.observe(s); });
  }
})();
