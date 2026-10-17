/* Framr.One, derde voorstel voor de beginpagina: het enige gedrag. De oranje lijn om het veld
   dat meegaat verschijnt als het scherm van die stap in beeld komt, zodat je oog naar de
   waarde gaat die doorloopt. Zonder script of zonder beweging staat de lijn er meteen. */
(function () {
  'use strict';

  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || /[?&]proef/.test(location.search)) {
    var bordje = document.getElementById('v3-proef');
    if (bordje) bordje.classList.add('zichtbaar');
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('v3-js');
  var kijker = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (!item.isIntersecting) return;
      item.target.classList.add('in-beeld');
      kijker.unobserve(item.target);
    });
  }, { threshold: 0.45 });
  Array.prototype.forEach.call(document.querySelectorAll('.v3-stap'), function (stap) { kijker.observe(stap); });
})();
