/* De kluscalculator van de vloerenlandingspagina (14-09-2026, naar het voorstel van Jelle).

   Een complete vloerklus: de vloer, de voorbereiding (egaline en primer), de lijm of de
   ondervloer, de plinten en eventueel profielen. Per regel de hoeveelheid, de inkoop op brons,
   jouw verkoop en de marge; onderaan de brutomarge op de hele klus. Dezelfde regels als de
   calculator van het portaal (framr-portaal/app/calculator.js): snijverlies 10 procent bij recht
   en 15 procent bij visgraat, hele pakken, lijm en primer in kilo's per m2, egaline in kilo's per
   m2 per millimeter, plint met 10 procent extra in staven van 2,4 meter.

   DE PRIJZEN zijn de echte bronsprijzen en adviesprijzen uit de prijslaag van het portaal, stand
   14-09-2026, exclusief btw. Brons mag publiek (besluit Jelle 14-09-2026), de inkoop nooit. De
   pakinhoud van de ondervloeren staat niet in de prijslaag maar komt uit de winkel; die staat
   daarom op het scherm als eigen invoer, zodat de uitkomst controleerbaar blijft. Profielen
   staan niet in de prijslaag en zijn helemaal eigen invoer.

   Drie plekken lezen hieruit: de calculator zelf, de drie voorbeeldprojecten eronder (die laden
   met een knop in de calculator) en de werkwijze en het verdienmodel, die de voorbeeldklus
   Woonkamer en hal tonen. Zo lopen de bedragen op de pagina nooit uit elkaar.

   Geen lange streepjes en geen emoji, conform de afspraken. */
var V3 = (function () {
  var CDN = 'https://cdn.shopify.com/s/files/1/0955/8920/4233/files/';
  var VLOEREN = [
    { id: 'airy-oak', naam: 'Airy Oak', collectie: 'JOKA LVT 340 Dryback', soort: 'pvc-dry', type: 'pvc plak', patroon: 'recht',
      pak: 3.37, advies: 24.38, brons: 15.68, beeld: CDN + 'md_DES_340_2811_Airy_Oak_V4_mus.jpg?v=1779292525&width=600',
      kamer: CDN + 'md_DES_340_2811_Airy_Oak_V4_rau.jpg?v=1779292524&width=900' },
    { id: 'oak-cashmir', naam: 'Oak Cashmir', collectie: 'JOKA Madison City 431', soort: 'laminaat', type: 'laminaat', patroon: 'recht',
      pak: 2.49, advies: 16.45, brons: 12.41, beeld: CDN + 'madison-city-431-np-oak-cashmir.png?v=1785846214&width=600' },
    { id: 'oak-natural-vg', naam: 'Oak Natural Visgraat', collectie: 'JOKA LVT 555 Wooden Styles', soort: 'pvc-dry', type: 'pvc plak, visgraat', patroon: 'visgraat',
      pak: 3.48, advies: 34.67, brons: 21.68, beeld: CDN + 'DES_555_WoodenStyles_6705_Oak_Natural_EIR_herringbone_mus_c2adb1ea-8740-48ce-8707-88873bc1066a.jpg?v=1779285079&width=600' },
    { id: 'chateau-sand-vg', naam: 'Oak Chateau Sand Visgraat', collectie: 'JOKA Skyline 532 HB XL', soort: 'laminaat', type: 'laminaat, visgraat', patroon: 'visgraat',
      pak: 1.98, advies: 35.50, brons: 25.89, beeld: CDN + 'joka-skyline-532-hb-xl-oak-chateau-sand-visgraat.png?v=1785846200&width=600' },
    { id: 'ambered-rigid', naam: 'Ambered Elegance', collectie: 'JOKA LVT 340 Rigid Click', soort: 'pvc-click', type: 'pvc klik', patroon: 'recht',
      pak: 1.77, advies: 31.36, brons: 23.89, beeld: CDN + 'md_DES_340_2882_Ambered_Elegance_V4_mus_8770b433-8c95-4c1d-8806-34820aba62c3.jpg?v=1779306499&width=600' },
  ];
  /* Vijf vloeren, een per soort en uit vijf lijnen (Jelle, 14-09-2026: vijf, geen tien), op
     inkoopprijs van laag naar hoog. */
  VLOEREN.sort(function (a, b) { return a.brons - b.brons || a.naam.localeCompare(b.naam); });
  var HULP = {
    lijm:    { naam: 'JOKA NL30 S dispersielijm, 14 kg', eenheid: 'emmer', inhoud: 14, verbruik: 0.275, advies: 98.17, brons: 78.05 },
    primer:  { naam: 'JOKA JK01 primer, 10 kg', eenheid: 'emmer', inhoud: 10, verbruik: 0.15, advies: 81.65, brons: 75.38 },
    egaline: { naam: 'JOKA JK10 egalisatie cement, 25 kg', eenheid: 'zak', inhoud: 25, verbruik: 1.6, advies: 28.93, brons: 21.48 },
    onderClick:    { naam: 'JOKA JK139+ Silent Design ondervloer', eenheid: 'pak', inhoud: 10.2, advies: 96.52, brons: 56.49, eigen: 'pakinhoud uit de winkel, 10,2 m2' },
    onderLaminaat: { naam: 'JOKA JK126 Silent-Step ondervloer 5 mm', eenheid: 'pak', inhoud: 7, advies: 36.74, brons: 13.04, eigen: 'pakinhoud uit de winkel, 7 m2' },
    plint:   { naam: 'JOKA MDF plint 12 x 70 mm, wit', eenheid: 'staaf', inhoud: 2.4, advies: 9.90, brons: 6.53 },
  };
  var VERLIES = { recht: 0.10, visgraat: 0.15 };
  /* De plintlengte, geschat uit de oppervlakte (Jelle wilde geen apart veld, 14-09-2026): een kamer
     die iets langer is dan breed, min twee deuropeningen van 90 cm. Een voorbeeldklus draagt zijn
     eigen lengte uit de inmeting. */
  function schatOmtrek(opp) { return Math.max(0, 4.2 * Math.sqrt(Math.max(0, opp)) - 1.8); }

  var ceil = function (n) { return n > 0 ? Math.ceil(n - 1e-9) : 0; };
  var eur = function (g) { return '€ ' + g.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var m2 = function (g) { return g.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m2'; };
  var getal = function (g, d) { return g.toLocaleString('nl-NL', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var vloer = function (id) { return VLOEREN.filter(function (v) { return v.id === id; })[0] || VLOEREN[0]; };
  /* Enkelvoud en meervoud van een eenheid: 1 emmer, 2 emmers. */
  var ENKEL = { pakken: 'pak', zakken: 'zak', emmers: 'emmer', staven: 'staaf', stuks: 'stuk' };
  var V3eenheid = function (n, meervoud) { return n === 1 ? (ENKEL[meervoud] || meervoud) : meervoud; };

  /* De som van een klus. klus: { vloer, m2, omtrek (of geschat), korting, mm, onderInhoud,
     aan: { egaline, primer, lijm, ondervloer, plint } (uit is false; de vloer staat altijd aan),
     profielen: { stuks, inkoop, verkoop }, verkoop: { sleutel: eigen prijs per eenheid } }.
     Elke regel die bij deze vloer hoort komt terug, ook als hij uit staat (dan zonder bedragen),
     zodat het scherm hem met een vinkje kan tonen. */
  function reken(klus) {
    var v = vloer(klus.vloer);
    var opp = Math.max(0, Number(klus.m2) || 0);
    var verlies = VERLIES[v.patroon] || 0.10;
    var bruto = opp * (1 + verlies);
    var pakken = ceil(bruto / v.pak);
    var besteld = pakken * v.pak;
    var korting = Math.max(0, Math.min(60, Number(klus.korting) || 0)) / 100;
    var eigen = klus.verkoop || {};
    var aan = klus.aan || {};
    var omtrek = Number(klus.omtrek) > 0 ? Number(klus.omtrek) : schatOmtrek(opp);
    var omtrekBron = Number(klus.omtrek) > 0 ? (klus.omtrekBron || 'opgegeven') : 'geschat uit de oppervlakte';
    var rijen = [];
    function rij(sleutel, naam, aantal, eenheid, uitleg, inkoopPerEenheid, adviesPerEenheid, verkoopStandaard, extra) {
      var actief = sleutel === 'vloer' || aan[sleutel] !== false;
      var verkoopPer = eigen[sleutel] !== undefined && eigen[sleutel] !== '' && isFinite(Number(eigen[sleutel]))
        ? Number(eigen[sleutel]) : verkoopStandaard;
      var inkoop = actief ? inkoopPerEenheid * aantal : 0;
      var verkoop = actief ? verkoopPer * aantal : 0;
      rijen.push(Object.assign({ sleutel: sleutel, naam: naam, aantal: aantal, eenheid: eenheid, eenheidTekst: V3eenheid(aantal, eenheid), uitleg: uitleg,
        inkoopPer: inkoopPerEenheid, adviesPer: adviesPerEenheid, verkoopPer: verkoopPer, aan: actief,
        inkoop: inkoop, verkoop: verkoop, marge: verkoop - inkoop,
        eigenVerkoop: eigen[sleutel] !== undefined && eigen[sleutel] !== '' }, extra || {}));
    }
    rij('vloer', v.collectie + ', ' + v.naam, pakken, 'pakken',
        m2(opp) + ' + ' + Math.round(verlies * 100) + '% snijverlies (' + v.patroon + ') = ' + m2(bruto) + ', in pakken van ' + getal(v.pak, 2) + ' m2 is ' + m2(besteld),
        v.brons * v.pak, v.advies * v.pak, v.advies * (1 - korting) * v.pak, { vast: true });
    if (v.soort === 'pvc-dry') {
      var mm = Math.max(0, Number(klus.mm) || 3);
      var egkg = opp * HULP.egaline.verbruik * mm;
      rij('egaline', HULP.egaline.naam, ceil(egkg / HULP.egaline.inhoud), 'zakken',
          m2(opp) + ' x ' + mm + ' mm x ' + HULP.egaline.verbruik + ' kg = ' + getal(egkg) + ' kg',
          HULP.egaline.brons, HULP.egaline.advies, HULP.egaline.advies, { mm: mm });
      var pkg = opp * HULP.primer.verbruik;
      rij('primer', HULP.primer.naam, ceil(pkg / HULP.primer.inhoud), 'emmers',
          m2(opp) + ' x ' + HULP.primer.verbruik + ' kg = ' + getal(pkg, 1) + ' kg',
          HULP.primer.brons, HULP.primer.advies, HULP.primer.advies);
      var lkg = opp * HULP.lijm.verbruik;
      rij('lijm', HULP.lijm.naam, ceil(lkg / HULP.lijm.inhoud), 'emmers',
          m2(opp) + ' x ' + HULP.lijm.verbruik + ' kg = ' + getal(lkg, 1) + ' kg',
          HULP.lijm.brons, HULP.lijm.advies, HULP.lijm.advies);
    } else {
      var o = v.soort === 'laminaat' ? HULP.onderLaminaat : HULP.onderClick;
      var inhoud = Number(klus.onderInhoud) > 0 ? Number(klus.onderInhoud) : o.inhoud;
      rij('ondervloer', o.naam, ceil(bruto / inhoud), 'pakken',
          m2(bruto) + ' in pakken van ' + getal(inhoud, 1) + ' m2 (' + o.eigen + ')',
          o.brons, o.advies, o.advies, { inhoud: inhoud });
    }
    var pbruto = omtrek * 1.1;
    rij('plint', HULP.plint.naam, ceil(pbruto / HULP.plint.inhoud), 'staven',
        'plintlengte ' + getal(omtrek, 1) + ' m (' + omtrekBron + ') + 10% = ' + getal(pbruto, 1) + ' m, in staven van 2,4 m',
        HULP.plint.brons, HULP.plint.advies, HULP.plint.advies, { omtrek: omtrek });
    var pr = klus.profielen || {};
    rij('profielen', 'Profielen en overgangen (eigen invoer)', Math.max(0, Number(pr.stuks) || 0), 'stuks', 'eigen inkoop en verkoop per stuk',
        Number(pr.inkoop) || 0, Number(pr.verkoop) || 0, Number(pr.verkoop) || 0, { profielen: true });
    var tot = rijen.reduce(function (t, r) { if (r.aan) { t.inkoop += r.inkoop; t.verkoop += r.verkoop; t.marge += r.marge; } return t; }, { inkoop: 0, verkoop: 0, marge: 0 });
    return { vloer: v, opp: opp, verlies: verlies, bruto: bruto, pakken: pakken, besteld: besteld, korting: korting, omtrek: omtrek, rijen: rijen, totaal: tot };
  }

  /* De drie voorbeeldprojecten. De Woonkamer is de voorbeeldklus van de hele pagina. */
  /* Elke voorbeeldklus heeft een eigen kamerfoto (aangeleverd door Jelle, 15-09-2026; beeld/voorbeeld-*.jpg,
     met per klus ook een close-up van de vloer als voorbeeld-*-vloer.jpg). */
  var VOORBEELDEN = [
    { id: 'slaapkamer', naam: 'Kleine slaapkamer', waar: 'Klikvloer met ondervloer en plinten', foto: '../beeld/voorbeeld-slaapkamer.jpg',
      klus: { vloer: 'oak-cashmir', m2: 12, omtrek: 12.2, omtrekBron: 'uit de inmeting', korting: 15, aan: {} } },
    { id: 'woonkamer', naam: 'Woonkamer en hal', waar: 'Plak-pvc met egaline, primer en lijm', foto: '../beeld/voorbeeld-woonkamer.jpg',
      klus: { vloer: 'airy-oak', m2: 41.3, omtrek: 28.4, omtrekBron: 'uit de inmeting', korting: 15, mm: 3, aan: {} } },
    { id: 'benedenverdieping', naam: 'Grotere benedenverdieping', waar: 'Visgraat met voorbereiding en afwerking', foto: '../beeld/voorbeeld-benedenverdieping.jpg',
      klus: { vloer: 'oak-natural-vg', m2: 68.9, omtrek: 52.1, omtrekBron: 'uit de inmeting', korting: 15, mm: 3, aan: {} } },
  ];


  return { VLOEREN: VLOEREN, HULP: HULP, VOORBEELDEN: VOORBEELDEN, reken: reken, eur: eur, m2: m2, getal: getal, vloer: vloer, eenheid: V3eenheid, schatOmtrek: schatOmtrek };
})();

/* ---------- het scherm ---------- */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('kc-vloeren')) return;
  var eur = V3.eur, m2 = V3.m2, getal = V3.getal;

  /* Standaard een klus van 60 m2 (Jelle, 14-09-2026), Airy Oak, alles erbij, 15 procent onder advies. */
  var STANDAARD = { vloer: 'airy-oak', m2: 60, korting: 15, mm: 3, aan: {}, klussen: 1 };
  function vers(basis) {
    var k = JSON.parse(JSON.stringify(basis));
    k.aan = k.aan || {}; k.klussen = k.klussen || 1; k.verkoop = {}; k.profielen = { stuks: 0 };
    return k;
  }
  var klus = vers(STANDAARD);

  var CHIPS = { egaline: 'Egaline', primer: 'Primer', lijm: 'Lijm', ondervloer: 'Ondervloer', plint: 'Plint' };

  var tegels = $('kc-vloeren');
  tegels.innerHTML = V3.VLOEREN.map(function (v) {
    return '<button type="button" class="kc-tegel" data-vloer="' + v.id + '" aria-pressed="false">' +
      '<span class="kc-foto" style="background-image: url(\'' + v.beeld + '\')"></span>' +
      '<span class="kc-tekst"><span class="kc-naam">' + v.naam + '</span><span class="kc-col">' + v.collectie.replace(/^JOKA /, '') + ', ' + v.type + '</span>' +
      '<span class="kc-prijs">' + eur(v.brons) + ' per m2</span></span></button>';
  }).join('');
  tegels.addEventListener('click', function (e) {
    var t = e.target.closest('.kc-tegel');
    if (!t) return;
    klus.vloer = t.dataset.vloer;
    klus.aan = {};
    teken();
  });

  function teken() {
    var u = V3.reken(klus);
    var v = u.vloer;
    tegels.querySelectorAll('.kc-tegel').forEach(function (t) { t.setAttribute('aria-pressed', t.dataset.vloer === klus.vloer ? 'true' : 'false'); });
    $('kc-m2').value = Math.min(150, Math.max(10, klus.m2));
    $('kc-m2-stand').textContent = getal(klus.m2, klus.m2 % 1 ? 1 : 0) + ' m2';
    $('kc-korting').value = klus.korting;
    $('kc-korting-stand').textContent = klus.korting + '%';
    $('kc-klussen').value = klus.klussen;
    $('kc-klussen-stand').textContent = String(klus.klussen);
    $('kc-gekozen').innerHTML = '<b>' + v.naam + '</b>, ' + v.collectie.replace(/^JOKA /, 'JOKA ') + ': ' + m2(u.opp) + ', ' + u.pakken + ' pakken, snijverlies ' + Math.round(u.verlies * 100) + '%.';
    /* De chips: alleen wat bij deze vloer hoort. */
    $('kc-chips').innerHTML = u.rijen.filter(function (r) { return !r.vast && !r.profielen; }).map(function (r) {
      return '<button type="button" data-aan="' + r.sleutel + '" aria-pressed="' + (r.aan ? 'true' : 'false') + '">' + CHIPS[r.sleutel] + '</button>';
    }).join('');
    $('kc-rijen').innerHTML = u.rijen.filter(function (r) { return r.aan && r.aantal > 0; }).map(function (r) {
      return '<div class="kc-regel"><span>' + r.naam.replace(/^JOKA /, '').replace(/, \d+ kg$/, '') + '</span><span>' + getal(r.aantal) + ' ' + r.eenheidTekst + '</span><b>' + eur(r.marge) + '</b></div>';
    }).join('');
    $('kc-tot-inkoop').textContent = eur(u.totaal.inkoop);
    $('kc-tot-verkoop').textContent = eur(u.totaal.verkoop);
    $('kc-uitkomst').textContent = eur(u.totaal.marge);
    var n = klus.klussen || 1;
    $('kc-maand').hidden = n <= 1;
    $('kc-maand-bedrag').textContent = eur(u.totaal.marge * n);
    $('kc-maand-n').textContent = String(n);
  }

  $('kc-chips').addEventListener('click', function (e) {
    var k = e.target.closest('[data-aan]');
    if (!k) return;
    klus.aan[k.dataset.aan] = k.getAttribute('aria-pressed') !== 'true';
    teken();
  });
  $('kc-m2').addEventListener('input', function () {
    var waarde = Number($('kc-m2').value) || 0;
    if (waarde !== klus.m2) { klus.m2 = waarde; klus.omtrek = 0; klus.omtrekBron = ''; }
    teken();
  });
  $('kc-korting').addEventListener('input', function () { klus.korting = Number($('kc-korting').value) || 0; teken(); });
  $('kc-klussen').addEventListener('input', function () { klus.klussen = Number($('kc-klussen').value) || 1; teken(); });

  /* De drie voorbeeldprojecten: kaarten met de uitkomst, en een knop die de klus in de calculator zet. */
  var kaarten = $('kc-voorbeelden');
  if (kaarten) {
    kaarten.innerHTML = V3.VOORBEELDEN.map(function (p) {
      var u = V3.reken(p.klus);
      var v = u.vloer;
      var mat = u.rijen.filter(function (r) { return r.aan && r.aantal > 0; }).map(function (r) { return r.naam.split(',')[0].replace(/^JOKA /, '') + ' (' + getal(r.aantal) + ')'; }).join(', ');
      return '<div class="kc-kaart">' +
        '<span class="kc-kaart-foto" style="background-image: url(\'' + (p.foto || v.kamer || v.beeld) + '\')"></span>' +
        '<div class="kc-kaart-tekst"><span class="opschrift" style="margin: 0 0 6px;">' + p.waar + '</span><h3>' + p.naam + '</h3>' +
        '<p class="kc-kaart-maat">' + m2(u.opp) + ', ' + v.naam + ' (' + v.type + ')</p>' +
        '<p class="kc-kaart-mat">' + mat + '</p>' +
        '<p class="kc-kaart-som"><span>Brutomarge op materiaal</span><b>' + eur(u.totaal.marge) + '</b></p>' +
        '<button type="button" class="knop open" data-voorbeeld="' + p.id + '">Bereken deze klus <span class="pijl">&rarr;</span></button></div></div>';
    }).join('');
    kaarten.addEventListener('click', function (e) {
      var k = e.target.closest('[data-voorbeeld]');
      if (!k) return;
      var p = V3.VOORBEELDEN.filter(function (x) { return x.id === k.dataset.voorbeeld; })[0];
      klus = vers(p.klus);
      teken();
      document.getElementById('marge').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* De voorbeeldklus op de rest van de pagina: het verdienmodel en de werkwijze. */
  (function () {
    var p = V3.VOORBEELDEN[1];
    var u = V3.reken(p.klus);
    var v = u.vloer;
    var vloerRij = u.rijen[0];
    var rest = u.rijen.slice(1);
    var zet = function (id, t) { var e = $(id); if (e) e.textContent = t; };
    zet('vm-inkoop', eur(v.brons));
    zet('vm-verkoop', eur(v.advies * (1 - u.korting)));
    zet('vm-marge', eur(v.advies * (1 - u.korting) - v.brons));
    zet('vm-advies', eur(v.advies));
    zet('vm-som-verkoop', eur(u.totaal.verkoop));
    zet('vm-som-inkoop', eur(u.totaal.inkoop));
    zet('vm-som-marge', eur(u.totaal.marge));
    zet('w-netto', m2(u.opp));
    zet('w-bruto', m2(u.bruto));
    zet('w-pakken-t', u.pakken + ' pakken van ' + getal(v.pak, 2) + ' m2');
    zet('w-besteld', m2(u.besteld));
    zet('w-hulp', rest.map(function (r) { return getal(r.aantal) + ' ' + r.eenheidTekst; }).join(', '));
    zet('w-inkoop', eur(u.totaal.inkoop));
    zet('w-besteld-2', m2(u.besteld));
    zet('w-verkoop', eur(vloerRij.verkoop));
    zet('w-verkoop-rest', eur(u.totaal.verkoop - vloerRij.verkoop));
    zet('w-marge', eur(u.totaal.marge));
    zet('w-pakken', u.pakken + ' pakken');
    var plint = u.rijen.filter(function (r) { return r.sleutel === 'plint'; })[0];
    zet('w-plint', plint ? getal(plint.aantal) + ' ' + plint.eenheidTekst : '');
    zet('p-brons', eur(v.brons));
    zet('p-advies', eur(v.advies));
  })();

  teken();
})();
