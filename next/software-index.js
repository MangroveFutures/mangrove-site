/* Software index: the status key filters the list (direction A); plates draw in as they scroll into view (direction B).
   Without JavaScript the whole list shows and nothing is hidden. Respects reduced motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var key = d.querySelector('.sx-a .key');
  if (key) {
    var items = [].slice.call(d.querySelectorAll('.sx-a .idx > li')), live = d.getElementById('sx-live');
    var clear = d.getElementById('sx-clear'), clearWrap = clear && clear.parentNode, grp = d.getElementById('grp-health');
    var names = {};
    [].forEach.call(key.querySelectorAll('.kitem'), function (b) { names[b.dataset.f] = b.querySelector('.kt').textContent.replace(/\s*✕$/, ''); });
    var apply = function (f) {
      var n = 0;
      items.forEach(function (li) { var show = !f || li.dataset.status === f; li.hidden = !show; if (show) n++; });
      if (grp) grp.hidden = !grp.querySelector('li:not([hidden])');
      [].forEach.call(key.querySelectorAll('.kitem'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
      if (clearWrap) clearWrap.hidden = !f;
      if (live) live.textContent = f ? 'Showing ' + n + ' of ' + items.length + ': ' + names[f] + '.' : 'Showing all ' + items.length + '.';
    };
    var cur = '';
    key.addEventListener('click', function (e) {
      var b = e.target.closest('.kitem'); if (!b) return;
      cur = cur === b.dataset.f ? '' : b.dataset.f; apply(cur);
    });
    if (clear) clear.addEventListener('click', function () { cur = ''; apply(''); });
  }

  var plates = [].slice.call(d.querySelectorAll('.sx-b .plate'));
  if (plates.length && 'IntersectionObserver' in window && !reduce && root.getAttribute('data-lib-motion') !== 'reduce') {
    [].forEach.call(d.querySelectorAll('.plate .art path'), function (p) { p.setAttribute('pathLength', '1'); });
    root.classList.add('sx-armed');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    plates.forEach(function (p) { io.observe(p); });
  }
})();
