/* De etalage van 555 Wooden Styles op de vloerenpagina (Jelle, 15-09-2026: de lijn mooi tentoonstellen,
   een beetje zoals de brochure). Een groot kamerbeeld met de naam van de eik erop, de acht eiken als
   stalen eronder, en de keuze plank of visgraat. Kies een eik en het kamerbeeld vloeit over naar die eik.

   De beelden zijn de kamerbeelden en stalen van JOKA zoals ze in de Oaklyn-winkel staan (dezelfde bron
   als de calculator). Twee eiken bestaan alleen als plank; dan blijft de knop visgraat grijs.
   Geen lange streepjes en geen emoji, conform de afspraken. */
(function () {
  var DECORS = [
    { nr: '5701', naam: 'Oak Light', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5701_Oak_Light_EIR_mus_29cd3322-6f72-4bcf-8bfc-c32ef3d176ad.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5701_Oak_Light_EIR_raukopie_52658f91-1415-4f8b-94e3-68298d992c5f.jpg' }, visgraat: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6701_Oak_Light_EIR_herrngbone_mus_96346fa3-20e1-4ca3-b0a4-d7ffc5b6fbb6.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6701_Oak_Light_EIR_herringbone_rau_82da69c3-a43c-4cc1-8d6a-1221a311550b.jpg' } },
    { nr: '5702', naam: 'Oak Cream', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_5702_Oak_Cream_EIR_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_5702_Oak_Cream_EIR_rau.jpg' }, visgraat: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_6702_Oak_Cream_EIR_herringbone_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_6702_Oak_Cream_EIR_herringbone_rau.jpg' } },
    { nr: '5703', naam: 'Oak Nordic', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5703_Oak_Nordic_EIR_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5703_Oak_Nordic_EIR_raukopie.jpg' }, visgraat: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_6703_Oak_Nordic_EIR_herringbone_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_6703_Oak_Nordic_EIR_herringbone_rau.jpg' } },
    { nr: '5704', naam: 'Oak Blond', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5704_Oak_Blond_EIR_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5704_Oak_Blond_EIR_rau_9a9aa61d-7c34-4e63-8e31-46cb3c517c18.jpg' }, visgraat: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6704_Oak_Blond_EIR_herringbone_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6704_Oak_Blond_EIR_herringbone_raukopie.jpg' } },
    { nr: '5705', naam: 'Oak Natural', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_5705_Oak_Natural_EIR_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_5705_Oak_Natural_EIR_rau.jpg' }, visgraat: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6705_Oak_Natural_EIR_herringbone_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6705_Oak_Natural_EIR_herringbone_raukopie.jpg' } },
    { nr: '5706', naam: 'Oak Chalet', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/chaletoakwhite.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5706_Oak_Chalet_EIR_raukopie.jpg' }, visgraat: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6706_Oak_Chalet_EIR_herringbone_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_6706_Oak_Chalet_EIR_herringbone.jpg' } },
    { nr: '5707', naam: 'Oak Classic', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5707_Oak_Classic_EIR_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5707_Oak_Classic_EIR_raukopie.jpg' }, visgraat: null },
    { nr: '5708', naam: 'Oak Rustic', plank: { staal: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/md_DES_555_WoodenStyles_5708_Oak_Rustic_EIR_mus.jpg', kamer: 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/DES_555_WoodenStyles_5708_Oak_Rustic_EIR_raukopie.jpg' }, visgraat: null },
  ];
  var MAAT = { plank: 'Plank, 1524 x 228 mm', visgraat: 'Visgraat, 762 x 152 mm' };

  var vak = document.querySelector('.v3-etalage');
  if (!vak) return;
  var strook = vak.querySelector('.v3-etalage-stalen');
  var kamers = [vak.querySelector('.v3-kamer-a'), vak.querySelector('.v3-kamer-b')];
  var voor = 0;
  var nrVeld = vak.querySelector('.v3-etalage-nr');
  var naamVeld = vak.querySelector('.v3-etalage-naam b');
  var maatVeld = vak.querySelector('.v3-etalage-naam i');
  var patroonKnoppen = vak.querySelectorAll('[data-patroon]');
  var stand = { decor: 4, patroon: 'visgraat' };

  function beeld(u, breed) { return u + '?width=' + breed; }

  DECORS.forEach(function (d, i) {
    var k = document.createElement('button');
    k.type = 'button';
    k.className = 'v3-staalknop';
    k.setAttribute('aria-pressed', 'false');
    k.innerHTML = '<span class="v3-staalbeeld" style="background-image: url(\'' + beeld(d.plank.staal, 300) + '\');"></span>' +
                  '<b>' + d.naam + '</b><i>' + d.nr + '</i>';
    k.addEventListener('click', function () { stand.decor = i; toon(); });
    strook.appendChild(k);
  });
  patroonKnoppen.forEach(function (k) {
    k.addEventListener('click', function () { stand.patroon = k.dataset.patroon; toon(); });
  });

  function toon() {
    var d = DECORS[stand.decor];
    var patroon = d[stand.patroon] ? stand.patroon : 'plank';
    var p = d[patroon];
    var nieuw = beeld(p.kamer, 1600);
    var achter = kamers[1 - voor];
    if (kamers[voor].getAttribute('src') !== nieuw) {
      achter.onload = function () {
        achter.onload = null;
        achter.classList.add('v3-voor');
        kamers[voor].classList.remove('v3-voor');
        voor = 1 - voor;
      };
      achter.src = nieuw;
    }
    nrVeld.textContent = '555 / ' + (patroon === 'visgraat' ? '6' + d.nr.slice(1) : d.nr);
    naamVeld.textContent = d.naam;
    maatVeld.textContent = MAAT[patroon];
    patroonKnoppen.forEach(function (k) {
      k.setAttribute('aria-pressed', k.dataset.patroon === patroon ? 'true' : 'false');
      k.disabled = k.dataset.patroon === 'visgraat' && !d.visgraat;
    });
    strook.querySelectorAll('.v3-staalknop').forEach(function (k, i) { k.setAttribute('aria-pressed', i === stand.decor ? 'true' : 'false'); });
  }

  /* De kamerbeelden alvast ophalen zodra de etalage in beeld komt, dan wisselt hij zonder wachten. */
  function haalVooruit() {
    DECORS.forEach(function (d) {
      ['plank', 'visgraat'].forEach(function (pt) { if (d[pt]) { var i = new Image(); i.src = beeld(d[pt].kamer, 1600); } });
    });
  }
  if ('IntersectionObserver' in window) {
    var kijker = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { haalVooruit(); kijker.disconnect(); } });
    }, { threshold: 0.2 });
    kijker.observe(vak);
  }

  kamers[0].src = beeld(DECORS[stand.decor].visgraat.kamer, 1600);
  kamers[0].classList.add('v3-voor');
  toon();
})();
