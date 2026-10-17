/* Het proefpaneel voor het tweede deel van de vloerenlandingspagina (15-09-2026, het systeem zelf).

   Schakelaars linksonder op de echte pagina. Elke keuze wordt een data-pf-attribuut op <html>; de
   regels staan in proef.css. Twaalf keuzes: de beweging door de pagina, wat er onder de banner komt, de overgang na de kop vloeiend of zoals net, de drie vlakken onder de kop, de foto achter de kop, de kop het hele scherm, de overgang onder de foto hoog of lager, de tekst in de kop
   links op de wand of gecentreerd, het blok Het portaal aan of uit, de tabbladen ervan links naast
   het scherm of als rij erboven, het blok Gebouwd op hoe jij werkt aan of uit, het blok Ter
   vergelijking aan of uit, en de twee nieuwe vragen aan of uit. Het eerste van elke keuze is de
   stand zoals de pagina zonder paneel staat.

   De keuze blijft in de browser staan (localStorage) zodat een herlaad hem niet wist, en staat
   onderin het paneel uitgeschreven, zodat Jelle hem letterlijk kan doorgeven.

   Tijdelijk: na de keuze gaat de gekozen variant in index.html en gaan proef.css en proef.js weg.
   Geen lange streepjes en geen emoji, conform de afspraken. */
(function () {
  /* Het paneel is er alleen op de eigen computer (localhost), of met ?proef in het adres: staat de pagina
     ergens online om te delen, dan zien anderen het niet en gelden de standen zoals ze in index.html staan. */
  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !/[?&]proef\b/.test(location.search)) return;
  var SLEUTEL = 'framr-vloeren-proef-13';
  var KEUZES = [
    { naam: 'foto', woord: 'De foto achter de kop', opties: [['gelegd', 'De gelegde vloer'], ['leggen', 'De vloer half gelegd']] },
    { naam: 'kophoogte', woord: 'De kop', opties: [['vol', 'Het hele scherm'], ['lager', 'Lager, zoals vanmiddag']] },
    { naam: 'koptekst', woord: 'De tekst in de kop', opties: [['links', 'Links op de wand'], ['midden', 'In het midden, iets groter']] },
    { naam: 'overgang', woord: 'De overgang onder de foto', opties: [['aan', 'Aan'], ['uit', 'Uit']] },
    { naam: 'vloei', woord: 'De overgang na de kop', opties: [['aan', 'Vloeiend: kleur loopt mee, beweging volgt de scroll'], ['uit', 'Zoals net']] },
    { naam: 'animatie', woord: 'Beweging door de pagina', opties: [['meer', 'Meer, door de hele pagina'], ['minder', 'Zoals net']] },
    { naam: 'onder', woord: 'Onder de banner', opties: [['niets', 'Niets, meteen het verdienmodel'], ['wegwijzers', 'Drie kleine wegwijzers'], ['vlakken', 'De drie blokken, zoals net']] },
    { naam: 'portaal', woord: 'Het portaal, scherm voor scherm', opties: [['aan', 'Aan'], ['uit', 'Uit']] },
    { naam: 'tabs', woord: 'De tabbladen', opties: [['links', 'Links naast het scherm'], ['boven', 'Als rij erboven']] },
    { naam: 'gebouwd', woord: 'Gebouwd op hoe jij werkt', opties: [['aan', 'Aan'], ['uit', 'Uit']] },
    { naam: 'vergelijk', woord: 'Ter vergelijking', opties: [['aan', 'Aan'], ['uit', 'Uit']] },
    { naam: 'vragen', woord: 'De twee nieuwe vragen', opties: [['aan', 'Aan'], ['uit', 'Uit']] },
  ];

  var stand = {};
  KEUZES.forEach(function (k) { stand[k.naam] = k.opties[0][0]; });
  try {
    var bewaard = JSON.parse(localStorage.getItem(SLEUTEL) || '{}');
    KEUZES.forEach(function (k) {
      if (k.opties.some(function (o) { return o[0] === bewaard[k.naam]; })) stand[k.naam] = bewaard[k.naam];
    });
  } catch (e) {}
  function bewaar() { try { localStorage.setItem(SLEUTEL, JSON.stringify(stand)); } catch (e) {} }

  function maak(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function pas() {
    KEUZES.forEach(function (k) { document.documentElement.setAttribute('data-pf-' + k.naam, stand[k.naam]); });
    /* De toonbank meet op scroll; na een verschuiving opnieuw laten meten. */
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    teken();
  }

  /* Het paneel begint dichtgeklapt, want open stond het over de tekst van de kop heen. */
  var paneel = maak(
    '<aside class="pf-paneel pf-dicht" aria-label="Proefpaneel">' +
      '<div class="pf-kop"><b>Proefpaneel</b><span><button type="button" data-pf-terug>Terug</button> ' +
      '<button type="button" data-pf-dicht>Open</button></span></div>' +
    '</aside>');
  KEUZES.forEach(function (k) {
    var groep = maak('<div class="pf-groep"><span class="pf-naam">' + k.woord + '</span><div class="pf-keuze"></div></div>');
    var keuze = groep.querySelector('.pf-keuze');
    k.opties.forEach(function (o) {
      var knop = maak('<button type="button" data-naam="' + k.naam + '" data-waarde="' + o[0] + '" aria-pressed="false">' + o[1] + '</button>');
      knop.addEventListener('click', function () { stand[k.naam] = o[0]; bewaar(); pas(); });
      keuze.appendChild(knop);
    });
    paneel.appendChild(groep);
  });
  var lees = maak('<div class="pf-lees"></div>');
  paneel.appendChild(lees);

  function teken() {
    paneel.querySelectorAll('.pf-keuze button').forEach(function (b) {
      b.setAttribute('aria-pressed', stand[b.dataset.naam] === b.dataset.waarde ? 'true' : 'false');
    });
    lees.textContent = KEUZES.map(function (k) {
      var o = k.opties.filter(function (x) { return x[0] === stand[k.naam]; })[0];
      return k.naam + ': ' + (o ? o[1].toLowerCase() : stand[k.naam]);
    }).join(' / ');
  }

  paneel.querySelector('[data-pf-terug]').addEventListener('click', function () {
    KEUZES.forEach(function (k) { stand[k.naam] = k.opties[0][0]; });
    bewaar(); pas();
  });
  paneel.querySelector('[data-pf-dicht]').addEventListener('click', function () {
    var dicht = paneel.classList.toggle('pf-dicht');
    this.textContent = dicht ? 'Open' : 'Dicht';
  });

  document.body.appendChild(paneel);
  pas();
})();
