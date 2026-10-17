/* Framr.One, de beginpagina (index.html, gegroeid uit voorstel 4): de beweging. Niets staat vast;
   alles beweegt mee met het gewone scrollen (Jelle, 17-10-2026: "het scrollen in het begin niet").
   - Het grote woordmerk in de opening komt mee als je scrolt en landt op zijn plek in de balk.
   - De laptop komt groot in beeld, het scherm gaat aan en wisselt rustig tussen vier echte
     schermen; onder de laptop kies je zelf een scherm.
   - Het sfeerbeeld van Vloeren schuift trager mee; het beeldmerk in het slot komt zacht dichterbij.
   Wat stilstaat, staat zonder transform. Zonder beweging (de instelling van het apparaat) doet dit
   script alleen de balk. */
(function () {
  'use strict';

  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;
  var balk = document.getElementById('v4-balk');

  /* De balk kleurt mee met wat eronder ligt: licht boven het lichte vlak en het sfeerbeeld van Vloeren,
     ook op een telefoon, waar dat beeld sinds 17-10-2026 overloopt in het lichte vlak eronder. */
  var lichteVlakken = Array.prototype.slice.call(document.querySelectorAll('.v4-gratis, .v4-vloeren'));
  function balkStand() {
    balk.classList.toggle('vast', window.scrollY > 24);
    var h = balk.offsetHeight / 2;
    var licht = lichteVlakken.some(function (v) { var r = v.getBoundingClientRect(); return r.top <= h && r.bottom >= h; });
    balk.classList.toggle('licht', licht);
  }
  window.addEventListener('scroll', balkStand, { passive: true });
  balkStand();

  if (stil) return;
  html.classList.add('v4-js');
  /* Een timer en geen animatieframe: een tab op de achtergrond tekent geen frames, en de tekst
     moet er hoe dan ook komen. */
  window.setTimeout(function () { html.classList.add('v4-binnen'); }, 60);

  var smal = window.matchMedia('(max-width: 700px)').matches;

  /* Het woordmerk landt in de balk. Over de eerste 45 procent van een schermhoogte scrollen schuift
     het van zijn plek in de lucht naar de plek van het merk in de balk, en wordt het daarbij zo
     klein als dat merk. Daar aangekomen neemt het merk in de balk het over. Terug scrollen doet
     hetzelfde andersom. */
  var grootMerk = document.getElementById('v4-groot-merk');
  var balkMerk = balk.querySelector('.merk');
  balk.classList.add('wacht');
  var start = null;
  function meetStart() {
    var oud = grootMerk.style.transform;
    grootMerk.style.transform = 'none';
    var r = grootMerk.getBoundingClientRect();
    start = { left: r.left, top: r.top + window.scrollY, breed: r.width, hoog: r.height };
    grootMerk.style.transform = oud;
  }
  function merkStand() {
    if (!start) meetStart();
    var s = window.scrollY;
    var e = Math.min(1, Math.max(0, s / (window.innerHeight * 0.45)));
    e = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
    var doel = balkMerk.getBoundingClientRect();
    var schaal = doel.width / start.breed;
    if (e <= 0.0005) {
      grootMerk.style.transform = 'none';
    } else {
      var nuTop = start.top - s;
      var doelTop = doel.top + doel.height / 2 - (start.hoog * schaal) / 2;
      var x = (doel.left - start.left) * e;
      var y = (doelTop - nuTop) * e;
      var k = 1 + (schaal - 1) * e;
      grootMerk.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
    }
    var geland = e >= 0.999;
    grootMerk.classList.toggle('geland', geland);
    balk.classList.toggle('wacht', !geland);
  }
  window.addEventListener('resize', function () { start = null; });

  /* Wat in beeld komt, komt een keer rustig op. */
  var kijker = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (!item.isIntersecting) return;
      item.target.classList.add('zicht');
      kijker.unobserve(item.target);
    });
  }, { threshold: 0.25 });
  Array.prototype.forEach.call(document.querySelectorAll('.v4-op'), function (el) { kijker.observe(el); });

  /* De stappen van de werkcyclus komen een voor een op, van aanvraag tot nazorg. */
  var cyclus = document.getElementById('v4-cyclus');
  Array.prototype.forEach.call(cyclus.querySelectorAll('li'), function (li, i) { li.style.transitionDelay = (i * 0.09).toFixed(2) + 's'; });
  kijker.observe(cyclus);

  /* Hoe ver een element het scherm in is: 0 als zijn bovenkant onderaan het scherm staat, 1 als
     die op het gegeven deel van de schermhoogte staat. */
  function inBeeld(el, tot) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh * (1 - tot))));
  }
  function zacht(t) { return 1 - Math.pow(1 - t, 3); }

  /* De laptop komt groot in beeld en staat daarna stil, zonder transform: zo blijft het portaal
     scherp. Halverwege gaat het scherm aan. */
  var laptop = document.getElementById('v4-laptop');
  function laptopStand() {
    var t = zacht(inBeeld(laptop, 0.2));
    laptop.classList.toggle('ingeschakeld', t > 0.55);
    if (t >= 0.999) { if (laptop.style.transform !== 'none') laptop.style.transform = 'none'; return; }
    laptop.style.transform = 'scale(' + (0.86 + 0.14 * t).toFixed(4) + ')';
  }

  /* De schermen wisselen om de vijf seconden zolang de laptop in beeld is; een klik op een knop
     kiest zelf een scherm en zet het wisselen stil. */
  var schermen = Array.prototype.slice.call(laptop.querySelectorAll('.v4-laptop-scherm img'));
  var knoppen = Array.prototype.slice.call(laptop.querySelectorAll('.v4-tabs button'));
  var actief = 0, zelfGekozen = false, laptopZichtbaar = false;
  function toon(n) {
    actief = n;
    schermen.forEach(function (img, i) { img.classList.toggle('aan', i === n); });
    knoppen.forEach(function (k, i) { k.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
  }
  knoppen.forEach(function (k, i) { k.addEventListener('click', function () { zelfGekozen = true; toon(i); }); });
  new IntersectionObserver(function (items) { laptopZichtbaar = items[0].isIntersecting; }, { threshold: 0.4 }).observe(laptop);
  window.setInterval(function () {
    if (zelfGekozen || !laptopZichtbaar || !laptop.classList.contains('ingeschakeld')) return;
    toon((actief + 1) % schermen.length);
  }, 5000);

  /* Het sfeerbeeld van Vloeren schuift trager mee dan de pagina: diepte zonder trucs. Op een
     telefoon staat het beeld boven de tekst en schuift het niet. */
  var vloerenBeeld = document.getElementById('v4-vloeren-beeld');
  function vloerenStand() {
    if (smal) return;
    var r = vloerenBeeld.parentNode.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var t = (vh - r.top) / (vh + r.height);
    vloerenBeeld.style.transform = 'translateY(' + ((t - 0.5) * 12).toFixed(2) + '%)';
  }

  /* Het beeldmerk komt zacht dichterbij als het slot in beeld komt, en staat dan stil. */
  var slotBeeld = document.getElementById('v4-slot-beeld');
  function slotStand() {
    var t = zacht(inBeeld(slotBeeld.parentNode, 0.15));
    if (t >= 0.999) { if (slotBeeld.style.transform !== 'none') slotBeeld.style.transform = 'none'; return; }
    slotBeeld.style.transform = 'scale(' + (1.08 - 0.08 * t).toFixed(4) + ')';
  }

  function lus() {
    merkStand();
    laptopStand();
    vloerenStand();
    slotStand();
    window.requestAnimationFrame(lus);
  }
  window.requestAnimationFrame(lus);
})();
