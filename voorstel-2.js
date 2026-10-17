/* Framr.One, tweede voorstel voor de beginpagina: de beweging.
   Elke sectie met data-akt krijgt een voortgang van 0 tot 1. Bij een vastgezet stuk (de
   sectie is hoger dan het scherm, het beeld blijft staan) loopt die over de extra hoogte;
   bij een gewoon stuk over het moment dat het in beeld schuift. Per sectie tekent een eigen
   functie de stand, alleen met transform, opacity en clip-path. Zonder beweging (de instelling
   van het apparaat) krijgt alles meteen de eindstand. Werkregels sinds de bijsturing van Jelle
   (16-10-2026, "niet scherp of helder genoeg, redelijk afleidend"): in rust staat elk scherm
   plat en zonder transform, op ware scherpte; er beweegt een ding tegelijk; niets volgt de muis
   en niets wordt wazig gemaakt; en wat beweegt is echt, het landt waar het in het portaal hoort. */
(function () {
  'use strict';

  /* Stil: de instelling van het apparaat, of ?stil in het adres om die versie na te kijken.
     Alleen met beweging krijgt de pagina de klasse v2-js; zonder die klasse toont de css de
     stilstaande versie, dezelfde als wanneer dit script niet laadt. */
  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]stil/.test(location.search);
  if (!stil) document.documentElement.classList.add('v2-js');

  function klem(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function bereik(p, a, b) { return klem((p - a) / (b - a), 0, 1); }
  function zacht(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function uit(t) { return 1 - Math.pow(1 - t, 3); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function midden(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || /[?&]proef/.test(location.search)) {
    document.getElementById('v2-proef').classList.add('zichtbaar');
  }


  var akten = [];
  function akt(naam, teken, opties) {
    var el = document.querySelector('[data-akt="' + naam + '"]');
    if (!el) return;
    akten.push({ el: el, teken: teken, vast: !!(opties && opties.vast), eigen: opties && opties.eigen, nu: -1 });
  }

  function voortgang(a) {
    var r = a.el.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -vh * .25 || r.top > vh * 1.25) return null;
    var eigen = a.eigen && a.eigen(r);
    if (typeof eigen === 'number') return eigen;
    if (a.vast) {
      var span = r.height - vh;
      return span > 0 ? klem(-r.top / span, 0, 1) : 1;
    }
    return klem((vh - r.top) / (vh * .9), 0, 1);
  }

  /* 1. De opening. Het echte overzicht van het portaal ligt in zijn eigen onderdelen uit
     elkaar: de lege basis met op elke plek een stippellijn, en daarboven de onderdelen. Het
     verloop in vier rustige stappen, steeds een ding tegelijk:
       0    tot .10  stilstand: de tekening naast de kop;
       .10  tot .30  de kop verdwijnt, de tekening schuift naar het midden;
       .30  tot .80  de onderdelen landen een voor een op hun plek, met hun naam erbij;
       .80  tot .96  het beeld komt plat en op ware grootte;
       vanaf .96     rust: geen transform meer, het volledige scherm op ware scherpte.
     Op een telefoon staat de tekening onder de tekst en vervaagt er niets: tekst en tekening
     scrollen samen omhoog, en pas als de tekening op haar plek staat zet de opening zich vast
     (de indeling rekent voorstel-2-maat.js uit). Vanaf dat punt telt een eigen voortgang:
       0    tot .06  stilstand;
       .06  tot .71  de onderdelen landen een voor een;
       .74  tot .92  het beeld komt plat;
       vanaf .92     rust. */
  var held = document.querySelector('[data-akt="hero"]');
  var heldPlak = held.querySelector('.v2-plak');
  var stapel = held.querySelector('.v2-stapel');
  var scene = held.querySelector('.v2-scene');
  var heldTekst = held.querySelector('.v2-hero-tekst');
  var heldKnoppen = held.querySelector('.v2-knoppen');
  var heldBalk = document.querySelector('.balk');
  var maten = held.querySelector('.v2-maten');
  var delen = Array.prototype.slice.call(held.querySelectorAll('.v2-deel')).map(function (deel, i) {
    var punt = document.createElement('i');
    punt.className = 'v2-punt';
    punt.style.left = deel.style.left;
    punt.style.top = deel.style.top;
    stapel.appendChild(punt);
    return { el: deel, i: i, naam: deel.dataset.naam, z: Number(deel.dataset.z) * 52, anker: deel.querySelector('.v2-anker'), punt: punt };
  });
  var smal = window.matchMedia('(max-width: 860px)');
  var GROOT = { start: .3, stap: .11, duur: .16, plat: .8, rust: .96 };
  var TELEFOON = { start: .06, stap: .15, duur: .2, plat: .74, rust: .92 };

  /* De indeling op een telefoon, in pixels. De schermhoogte komt uit 100svh, de hoogte met de
     werkbalken van de browser in beeld: die verandert niet tijdens het scrollen, innerHeight wel. */
  var telefoon = null;
  var schermMaat = document.createElement('div');
  schermMaat.style.cssText = 'position:absolute;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(schermMaat);
  function heldMaat() {
    telefoon = null;
    held.style.height = '';
    heldPlak.style.top = '';
    heldPlak.style.height = '';
    scene.style.top = '';
    if (stil || !smal.matches) return;
    heldTekst.style.opacity = '';
    heldTekst.style.transform = '';
    var plak = heldPlak.getBoundingClientRect(), k = heldKnoppen.getBoundingClientRect();
    var m = window.v2TelefoonMaat({
      scherm: schermMaat.offsetHeight || window.innerHeight,
      balk: heldBalk.offsetHeight,
      tekening: stapel.offsetHeight,
      knopBoven: k.top - plak.top,
      knopOnder: k.bottom - plak.top
    });
    scene.style.top = m.scene + 'px';
    heldPlak.style.top = -m.vast + 'px';
    heldPlak.style.height = m.plak + 'px';
    held.style.height = m.held + 'px';
    telefoon = m;
  }
  function heldVoortgang(r) {
    if (!telefoon) return null;
    return klem((-r.top - telefoon.vast) / telefoon.duur, 0, 1);
  }

  function heldTeken(p) {
    var tijd = telefoon ? TELEFOON : GROOT;
    var rust = stil || p >= tijd.rust;
    held.classList.toggle('rust', rust);
    if (rust) {
      /* In rust geen enkele transform, ook geen verschuiving: die zou de browser het beeld laten
         hergebruiken zoals het in de 3D-stand getekend was, en dan blijft het zacht. De plek komt
         uit top. */
      stapel.style.transform = 'none';
      stapel.style.top = stil ? '0px' : Math.round(eindY()) + 'px';
      delen.forEach(function (d) { d.el.style.transform = 'none'; d.el.style.setProperty('--hoog', '0'); });
      heldTekst.style.opacity = stil || telefoon ? '' : '0';
      if (maten.innerHTML) maten.innerHTML = '';
      return;
    }
    var naarMidden = telefoon ? 0 : uit(bereik(p, .1, .3));
    var plat = zacht(bereik(p, tijd.plat, tijd.rust));
    var x = telefoon ? 0 : mix(21, 0, naarMidden);
    var y = telefoon ? 0 : mix(24, eindY(), plat);
    var s = mix(telefoon ? .9 : mix(.72, .8, naarMidden), 1, plat);
    var rx = mix(54, 0, plat), rz = mix(-18, 0, plat);
    stapel.style.top = '0px';
    stapel.style.transform = 'translate(' + x.toFixed(2) + 'vw, ' + y.toFixed(1) + 'px) scale(' + s.toFixed(4) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
    delen.forEach(function (d) {
      var start = tijd.start + d.i * tijd.stap;
      var land = zacht(bereik(p, start, start + tijd.duur));
      d.land = land;
      d.el.style.transform = 'translateZ(' + (d.z * (telefoon ? .55 : 1) * (1 - land)).toFixed(1) + 'px)';
      d.el.style.setProperty('--hoog', (1 - land).toFixed(3));
    });
    if (!telefoon) {
      var weg = bereik(p, .1, .24);
      heldTekst.style.opacity = (1 - weg).toFixed(3);
      heldTekst.style.transform = 'translateY(' + (-weg * 40).toFixed(1) + 'px)';
    }
    tekenMaten(p, tijd);
  }
  /* Waar het scherm in rust staat: op een groot scherm net onder de balk, op een telefoon waar
     de indeling het neerzette. */
  function eindY() {
    if (telefoon) return 0;
    var top = parseFloat(window.getComputedStyle(scene).top) || 0;
    var hoog = stapel.offsetHeight;
    return Math.max(96, (window.innerHeight - hoog) / 2) - top;
  }

  /* De valllijnen en de namen, plat over het beeld getekend zodat ze scherp blijven: een
     stippellijn van elk onderdeel naar zijn plek, en een kaartje met de naam dat oranje wordt
     terwijl het onderdeel landt en daarna verdwijnt. */
  function tekenMaten(p, tijd) {
    var bak = maten.getBoundingClientRect(), s = '';
    delen.forEach(function (d, i) {
      if (d.land >= .999) return;
      var a = midden(d.anker), b = midden(d.punt);
      var x1 = b.x - bak.left, y1 = b.y - bak.top, x2 = a.x - bak.left, y2 = a.y - bak.top;
      var landt = d.land > 0;
      var zicht = klem(1 - d.land * 1.4, 0, 1) * klem(1 - bereik(p, tijd.plat, tijd.plat + .06), 0, 1);
      var tekst = d.naam;
      var breed = tekst.length * 8.3 + 46;
      /* Het kaartje blijft binnen het scherm, ook op een smalle telefoon. */
      var kx = klem(x2 - 4, 8 - bak.left, window.innerWidth - 8 - breed - bak.left);
      s += '<g opacity="' + zicht.toFixed(3) + '">' +
        '<line class="val" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>' +
        '<circle class="voet" cx="' + x1.toFixed(1) + '" cy="' + y1.toFixed(1) + '" r="3"/>' +
        '<g class="kaartje' + (landt ? ' landt' : '') + '" transform="translate(' + kx.toFixed(1) + ' ' + (y2 - 34).toFixed(1) + ')">' +
        '<rect width="' + breed + '" height="26" rx="13"/>' +
        '<text class="nr" x="12" y="17">0' + (i + 1) + '</text>' +
        '<text x="36" y="17">' + tekst + '</text></g></g>';
    });
    maten.innerHTML = s;
  }
  akt('hero', heldTeken, { vast: true, eigen: heldVoortgang });
  if (!stil) {
    heldMaat();
    /* Na het laden van de letters is de tekst anders hoog, en dus de plek van de knoppen. Een
       andere hoogte zonder andere breedte is op een telefoon de werkbalk van de browser die in-
       of uitschuift: daar blijft de indeling staan, anders verspringt de pagina. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { heldMaat(); akten.forEach(function (a) { a.nu = -1; }); });
    }
    var heldBreedte = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === heldBreedte) return;
      heldBreedte = window.innerWidth;
      heldMaat();
    });
  }

  /* 2. Het project. Zeven echte schermen van dezelfde klus, een tegelijk, plat en scherp. Elke
     stap heeft een stilstand om te lezen en een overgang, en de overgang gaat in vaste volgorde:
       0   tot .2   het label verschijnt op het veld in het scherm dat je ziet (wat meegaat);
       .15 tot .55  het scherm wisselt;
       .45 tot .85  het label reist naar het veld in het nieuwe scherm waar het terugkomt;
       .8  tot 1    dat veld wordt oranje omlijnd, met erbij waar het vandaan komt.
     Een stap in de lijst links is een knop die naar die stap scrolt. */
  var keten = document.querySelector('[data-akt="keten"]');
  var ketenPlak = keten.querySelector('.v2-plak');
  var kaarten = Array.prototype.slice.call(keten.querySelectorAll('.v2-kaart'));
  var stapKnoppen = Array.prototype.slice.call(keten.querySelectorAll('.v2-stap'));
  var hoofdstukken = Array.prototype.slice.call(keten.querySelectorAll('[data-hoofdstuk]'));
  var pakket = keten.querySelector('.v2-pakket');
  var pakketTekst = pakket.querySelector('b');
  var ketenLijn = keten.querySelector('.v2-ketenlijn path');
  var STAPLENGTE = kaarten.length - 1 + .7;

  function ketenStand(p) {
    var n = kaarten.length;
    var t = klem(p * STAPLENGTE - .35, 0, n - 1);
    var i = Math.floor(t), f = t - i;
    if (i >= n - 1) { i = n - 1; f = 0; }
    return { i: i, g: bereik(f, .4, 1) };
  }
  function puntIn(el) {
    var b = ketenPlak.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top, links: r.left - b.left, boven: r.top - b.top };
  }

  function ketenTeken(p) {
    var st = ketenStand(p), i = st.i, g = st.g;
    /* Eerst gaat het oude scherm weg, dan komt het nieuwe: ze lopen niet door elkaar heen. */
    var weg = zacht(bereik(g, .15, .37)), komt = zacht(bereik(g, .33, .55));
    kaarten.forEach(function (c, j) {
      var o = 0, y = 0, ring = 0;
      if (j === i) { o = 1 - weg; y = -20 * weg; ring = 1 - bereik(g, .1, .3); }
      else if (j === i + 1) { o = komt; y = 20 * (1 - komt); ring = bereik(g, .8, 1); }
      c.style.opacity = o.toFixed(3);
      c.style.transform = Math.abs(y) < .05 ? 'none' : 'translateY(' + y.toFixed(1) + 'px)';
      c.style.zIndex = j === i + 1 ? '2' : '1';
      c.style.setProperty('--ring', ring.toFixed(3));
    });

    /* Het label dat meegaat, met een stippellijn achter zich aan. */
    var naar = kaarten[i + 1];
    if (g > 0 && naar) {
      var bron = naar.dataset.van !== undefined ? stapKnoppen[Number(naar.dataset.van)].querySelector('.nr') : kaarten[i].querySelector('.v2-uitpunt');
      var a = puntIn(bron), b = puntIn(naar.querySelector('.v2-ring'));
      var reis = zacht(bereik(g, .45, .85));
      var x = mix(a.x, b.links + 4, reis), y = mix(a.y, b.boven - 2, reis);
      var zicht = Math.min(bereik(g, 0, .2), 1 - bereik(g, .85, 1));
      if (pakketTekst.textContent !== naar.dataset.mee) pakketTekst.textContent = naar.dataset.mee;
      pakket.style.opacity = zicht.toFixed(3);
      pakket.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + (y - 16).toFixed(1) + 'px)';
      if (reis > 0 && reis < 1) {
        ketenLijn.setAttribute('d', 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' L' + x.toFixed(1) + ' ' + y.toFixed(1));
        ketenLijn.style.opacity = String(zicht);
      } else ketenLijn.setAttribute('d', '');
    } else {
      pakket.style.opacity = '0';
      ketenLijn.setAttribute('d', '');
    }

    var actief = g > .5 ? i + 1 : i;
    stapKnoppen.forEach(function (k, j) {
      k.classList.toggle('aan', j === actief);
      k.classList.toggle('gedaan', j < actief);
      k.parentNode.classList.toggle('aan', j === actief);
      if (j === actief) k.setAttribute('aria-current', 'step'); else k.removeAttribute('aria-current');
    });
    var hoofdstukVan = [0, 0, 1, 1, 1, 2, 2];
    hoofdstukken.forEach(function (h, j) { h.classList.toggle('aan', j === hoofdstukVan[actief]); });
  }
  /* De maat van elk scherm: nooit groter dan zijn eigen scherpte (de helft van de bron, die op
     dubbele schaal is vastgelegd), en passend in het vlak. */
  var dek = keten.querySelector('.v2-dek');
  function maatKaarten() {
    var bw = dek.clientWidth, bh = dek.clientHeight;
    kaarten.forEach(function (c) {
      var img = c.querySelector('img');
      var w = Number(img.getAttribute('width')), h = Number(img.getAttribute('height'));
      c.style.width = Math.floor(Math.min(w / 2, bw, bh * w / h)) + 'px';
    });
  }
  if (!stil) { maatKaarten(); window.addEventListener('resize', maatKaarten); }
  akt('keten', ketenTeken, { vast: true });

  /* Een stap kiezen: scroll naar de stilstand van die stap. */
  stapKnoppen.forEach(function (k, j) {
    k.addEventListener('click', function () {
      if (stil) return;
      var span = keten.offsetHeight - window.innerHeight;
      var p = (j + .15 + .35) / STAPLENGTE;
      scrollNaar(keten.offsetTop + span * klem(p, 0, 1));
    });
  });
  /* Zelf vloeiend scrollen, zodat het overal gelijk loopt (ook waar de browser het niet doet). */
  function scrollNaar(doel) {
    var start = window.scrollY, afstand = doel - start, t0 = null;
    var duur = Math.min(1100, 450 + Math.abs(afstand) * .25);
    function stap(tijd) {
      if (t0 === null) t0 = tijd;
      var k = Math.min(1, (tijd - t0) / duur);
      window.scrollTo(0, start + afstand * zacht(k));
      if (k < 1) window.requestAnimationFrame(stap);
    }
    window.requestAnimationFrame(stap);
  }


  /* 3. Basis en modules. De basis staat er; de modules komen er een voor een op, steeds een
     ding tegelijk:
       .06 tot .36  Vloeren zakt op de basis en klikt vast (de nokjes verschijnen);
       .40 tot .66  Kozijnen zakt tot boven zijn plek en blijft daar hangen;
       .70 tot .86  de lege plek voor de volgende module verschijnt.
     In rust geen transform: alles is gewone tekst op zijn plek. */
  var modules = document.querySelector('[data-akt="modules"]');
  var modVloeren = modules.querySelector('.v2-mod.vloeren');
  var modKozijnen = modules.querySelector('.v2-mod.kozijnen');
  var modVolgende = modules.querySelector('.v2-mod.volgende');
  function zak(el, t, hoogte) {
    el.style.opacity = bereik(t, 0, .45).toFixed(3);
    var y = (1 - zacht(t)) * -hoogte;
    el.style.transform = Math.abs(y) < .05 ? 'none' : 'translateY(' + y.toFixed(1) + 'px)';
  }
  function modulesTeken(p) {
    var a = bereik(p, .06, .36), b = bereik(p, .4, .66), c = bereik(p, .7, .86);
    zak(modVloeren, a, 90);
    modVloeren.style.setProperty('--nok', bereik(a, .85, 1).toFixed(3));
    zak(modKozijnen, b, 90);
    modVolgende.style.opacity = c.toFixed(3);
  }
  akt('modules', modulesTeken, { vast: true });

  /* 4. Gratis. 0 euro wordt van links naar rechts opgemeten, dan komt de rest erbij. */
  var kosten = document.querySelector('[data-akt="kosten"]');
  function kostenTeken(p) {
    kosten.style.setProperty('--q', zacht(bereik(p, .1, .5)).toFixed(4));
    kosten.style.setProperty('--per', bereik(p, .45, .58).toFixed(3));
    kosten.style.setProperty('--na', uit(bereik(p, .55, .75)).toFixed(3));
  }
  akt('kosten', kostenTeken, { vast: true });


  /* 5. Vloeren en Kozijnen: de kozijntekening tekent zich. */
  var vakken = document.querySelector('[data-akt="vakken"]');
  function vakkenTeken(p) { vakken.style.setProperty('--kz', zacht(bereik(p, .55, 1)).toFixed(3)); }
  akt('vakken', vakkenTeken);

  /* 6. De showcase: tabs kiezen het scherm; het scherm komt rechtop als het in beeld komt
     en staat daarna stil. */
  var show = document.querySelector('[data-akt="show"]');
  var tabs = Array.prototype.slice.call(show.querySelectorAll('.v2-tab'));
  var schermBeelden = Array.prototype.slice.call(show.querySelectorAll('.v2-scherm img'));
  var scherm = show.querySelector('.v2-scherm');
  var zin = show.querySelector('.v2-show-zin');
  function kiesTab(i, focus) {
    tabs.forEach(function (t, j) {
      t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      t.tabIndex = j === i ? 0 : -1;
    });
    schermBeelden.forEach(function (img, j) { img.classList.toggle('aan', j === i); });
    zin.textContent = tabs[i].dataset.zin;
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { kiesTab(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); kiesTab((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); kiesTab((i - 1 + tabs.length) % tabs.length, true); }
    });
  });
  kiesTab(0);
  function showTeken(p) {
    var op = zacht(bereik(p, .1, .7));
    scherm.style.transform = op >= .999 ? 'none' : 'rotateX(' + mix(18, 0, op).toFixed(2) + 'deg) scale(' + mix(.94, 1, op).toFixed(4) + ')';
  }
  akt('show', showTeken);

  /* 7. Van scherm naar bouwplaats: het scherm en de maten staan er meteen, dan wordt de vloer
     gelegd (de veeg van rechts naar links). */
  var bouw = document.querySelector('[data-akt="bouw"]');
  function bouwTeken(p) {
    bouw.style.setProperty('--lijn', zacht(bereik(p, 0, .22)).toFixed(3));
    bouw.style.setProperty('--chip', uit(bereik(p, 0, .16)).toFixed(3));
    bouw.style.setProperty('--veeg', zacht(bereik(p, .34, .86)).toFixed(4));
  }
  akt('bouw', bouwTeken, { vast: true });


  /* 9. Het slot: de omtrek van het merk tekent zich, dan vult het, dan valt de stip. */
  var slot = document.querySelector('[data-akt="slot"]');
  function slotTeken(p) {
    slot.style.setProperty('--trek', zacht(bereik(p, .05, .55)).toFixed(4));
    slot.style.setProperty('--vul', bereik(p, .5, .7).toFixed(3));
    slot.style.setProperty('--stip', uit(bereik(p, .62, .82)).toFixed(3));
  }
  akt('slot', slotTeken);

  /* Het menu Modules ook met klikken en Escape, voor aanraken en toetsenbord. */
  var groep = document.querySelector('.v2-groep');
  var groepKnop = groep.querySelector('.v2-groep-knop');
  groepKnop.addEventListener('click', function () {
    var open = !groep.classList.contains('open');
    groep.classList.toggle('open', open);
    groepKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && groep.classList.contains('open')) { groep.classList.remove('open'); groepKnop.setAttribute('aria-expanded', 'false'); groepKnop.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!groep.contains(e.target)) { groep.classList.remove('open'); groepKnop.setAttribute('aria-expanded', 'false'); }
  });

  /* De balk wordt donker zolang er een donkere plaat onder ligt. */
  var balk = document.querySelector('.balk');
  var donkere = Array.prototype.slice.call(document.querySelectorAll('.v2-donker'));
  function balkKleur() {
    var onder = donkere.some(function (d) { var r = d.getBoundingClientRect(); return r.top <= 40 && r.bottom >= 40; });
    if (balk.classList.contains('op-donker') !== onder) balk.classList.toggle('op-donker', onder);
  }

  /* De lus. Een sectie tekent opnieuw als de voortgang verandert. */
  function lus() {
    balkKleur();
    akten.forEach(function (a) {
      var p = stil ? 1 : voortgang(a);
      if (p === null) return;
      if (p !== a.nu) {
        a.nu = p;
        a.el.style.setProperty('--p', p.toFixed(4));
        a.teken(p);
      }
    });
    if (!stil) window.requestAnimationFrame(lus);
  }
  lus();
  if (stil) window.addEventListener('resize', lus);
  window.addEventListener('resize', function () { akten.forEach(function (a) { a.nu = -1; }); });
})();
