/* De toonbank: het portaal speelt zichzelf af in een apparaat dat rechtop komt als je scrolt.

   Twee soorten film, gekozen met data-film op de sectie.

   1. Zonder data-film: negen schermen langs de routes van het portaal, 3,2 seconden per stap.
      Twee doeken vloeien over elkaar: terwijl het ene te zien is laadt het andere de volgende
      route, en pas als die klaar is wisselen ze. Zo knippert er niets.

   2. data-film="rondleiding": het portaal bedient zichzelf (film.js in de dev-server van het
      portaal): naar Klussen klikken, een klus intikken met de klant er meteen bij, inmeten en
      doorrekenen. Het portaal meldt elke stap met postMessage; deze laag zet de zin en de
      stippen eronder, zegt speel of pauze naar gelang de scene in beeld is, en start een verse
      ronde in het tweede doek zodra de vorige klaar is. Op verzoek van Jelle (14-09-2026).

   Waar het portaal vandaan komt staat als data-bron op de sectie. Nu is dat de dev-server; op
   de publieke site wordt dat een aparte publicatie met verzonnen gegevens, want het echte
   portaal hoort niet op een landingspagina (besluit Jelle 14-09-2026).

   Is de bron niet bereikbaar, dan blijft het terugvalscherm staan en speelt de film niet. Dat
   vraagt een proef vooraf, want een iframe vuurt zijn load-event ook op een dode poort (gezien
   14-09-2026): zonder proef zou de laptop de foutpagina van de browser tonen.

   Stijl: geen lange streepjes en geen emoji, conform de projectafspraken. */
(function () {
  var scene = document.querySelector('.tb-scene');
  if (!scene) return;

  var ROUTES = [
    { route: '/',             zin: 'Alles wat loopt, op een scherm' },
    { route: '/projecten',    zin: 'Een klus aanmaken' },
    { route: '/klanten',      zin: 'De klant eraan hangen' },
    { route: '/inmeten',      zin: 'Een kaart per ruimte, zo van de rolmaat' },
    { route: '/calculaties',  zin: 'Het rekenwerk doet zichzelf' },
    { route: '/offertes',     zin: 'Daar staat je offerte, met jouw naam erop' },
    { route: '/bestellingen', zin: 'Het materiaal gaat als bestelling weg' },
    { route: '/facturen',     zin: 'En de factuur rolt eruit' },
    { route: '/',             zin: 'Geen abonnement. Je verdient op het materiaal.' },
  ];
  var STAP_MS = 3200;

  var BRON = scene.dataset.bron || 'http://localhost:4600';
  var RONDLEIDING = scene.dataset.film === 'rondleiding';
  var FILM_URL = BRON + '/?film=rondleiding';
  var BRON_OORSPRONG = (function () { try { return new URL(BRON).origin; } catch (e) { return null; } })();

  /* Het portaal rendert op een vaste logische breedte en wordt dan gekrompen, zodat het er
     op elk formaat uitziet als een echt scherm. Een tablet is smaller dan een laptop. */
  var apparaat = scene.querySelector('.tb-apparaat');
  var LOGISCH = apparaat && apparaat.dataset.toestel === 'tablet' ? 1080 : 1440;

  var scherm = scene.querySelector('.tb-scherm');
  var doekA = scene.querySelector('.tb-doek-a');
  var doekB = scene.querySelector('.tb-doek-b');
  var zin = scene.querySelector('.tb-zin');
  var stippen = scene.querySelector('.tb-stippen');

  var voor = doekA;
  var achter = doekB;
  var loopt = false;

  function zetStippen(aantal) {
    stippen.innerHTML = '';
    for (var i = 0; i < aantal; i++) stippen.appendChild(document.createElement('i'));
  }
  function toonStand(nr, tekst) {
    zin.textContent = tekst;
    /* De animatie opnieuw starten door hem los te koppelen en terug te zetten. */
    zin.style.animation = 'none';
    void zin.offsetWidth;
    zin.style.animation = '';
    stippen.querySelectorAll('i').forEach(function (s, i) { s.classList.toggle('tb-nu', i === nr); });
  }

  function pasIn() {
    var breed = scherm.clientWidth;
    var hoog = scherm.clientHeight;
    if (!breed || !hoog) return;
    var krimp = breed / LOGISCH;
    [doekA, doekB].forEach(function (d) {
      d.style.width = LOGISCH + 'px';
      d.style.height = Math.ceil(hoog / krimp) + 'px';
      d.style.transform = 'scale(' + krimp + ')';
    });
  }

  function wissel() {
    achter.classList.add('tb-voor');
    voor.classList.remove('tb-voor');
    var w = voor; voor = achter; achter = w;
  }

  /* ---------- 1. de film langs de routes ---------- */
  var nu = 0;
  var klok = null;

  function volgende() {
    var komt = (nu + 1) % ROUTES.length;
    /* Blijft het scherm hetzelfde (de slotzin en de openingszin staan allebei op het
       overzicht), dan alleen de zin wisselen in plaats van hetzelfde scherm herladen. */
    if (ROUTES[komt].route === ROUTES[nu].route) { nu = komt; toonStand(nu, ROUTES[nu].zin); return; }
    achter.onload = function () {
      achter.onload = null;
      nu = komt;
      wissel();
      toonStand(nu, ROUTES[nu].zin);
    };
    achter.src = BRON + ROUTES[komt].route;
  }

  /* ---------- 2. de rondleiding ---------- */
  function zegTegenFilm(doe) {
    [voor, achter].forEach(function (d) {
      try { if (d.contentWindow) d.contentWindow.postMessage({ tb: 'toonbank', doe: doe }, BRON_OORSPRONG || '*'); } catch (e) {}
    });
  }

  window.addEventListener('message', function (e) {
    if (!RONDLEIDING || !e.data || e.data.tb !== 'film') return;
    if (BRON_OORSPRONG && e.origin !== BRON_OORSPRONG) return;
    var vanVoor = e.source === voor.contentWindow;
    var vanAchter = e.source === achter.contentWindow;
    if (!vanVoor && !vanAchter) return;
    if (e.data.doe === 'start') {
      if (stippen.children.length !== e.data.van) zetStippen(e.data.van);
      /* De verse ronde in het achterste doek is klaar om te beginnen: naar voren halen. */
      if (vanAchter && scherm.classList.contains('tb-live')) wissel();
      zegTegenFilm(loopt ? 'speel' : 'pauze');
      return;
    }
    if (!vanVoor) return;
    if (e.data.doe === 'stap') toonStand(e.data.nr, e.data.zin);
    if (e.data.doe === 'klaar' || e.data.doe === 'fout') {
      /* Een verse ronde laden in het andere doek; hij meldt zich met start en wordt dan gewisseld. */
      achter.src = FILM_URL;
    }
  });

  /* ---------- spelen en pauzeren ---------- */
  function speel() {
    /* Zonder bereikbare bron geen film: anders laadt de wissel alsnog de dode bron. */
    if (loopt || !scherm.classList.contains('tb-live')) return;
    loopt = true;
    if (RONDLEIDING) zegTegenFilm('speel');
    else klok = window.setInterval(volgende, STAP_MS);
  }

  function pauzeer() {
    if (!loopt) return;
    loopt = false;
    if (RONDLEIDING) zegTegenFilm('pauze');
    if (klok) { window.clearInterval(klok); klok = null; }
  }

  function meet() {
    var vak = scene.getBoundingClientRect();
    var hoogte = window.innerHeight;
    var totaal = vak.height - hoogte;
    var p = totaal > 0 ? Math.max(0, Math.min(1, (0 - vak.top) / totaal)) : 0;
    scene.style.setProperty('--p', p.toFixed(4));
    /* Alleen spelen als het apparaat rechtop staat en de scene in beeld staat: anders draait er
       een diavoorstelling die niemand ziet. */
    var zichtbaar = vak.bottom > 0 && vak.top < hoogte;
    if (p > 0.82 && zichtbaar) speel(); else pauzeer();
  }

  doekA.addEventListener('load', function () {
    scherm.classList.add('tb-live');
    doekA.classList.add('tb-voor');
    pasIn();
    meet();
  }, { once: true });

  window.addEventListener('scroll', meet, { passive: true });
  window.addEventListener('resize', function () { meet(); pasIn(); });

  /* Eerst proeven of de bron antwoordt (no-cors: een antwoord volstaat, de inhoud doet er
     niet toe). Antwoordt hij, dan gaat het eerste scherm het doek op; anders blijft het
     terugvalscherm staan. */
  function proef() {
    if (!window.fetch) return Promise.resolve();
    return window.fetch(BRON + '/', { mode: 'no-cors', cache: 'no-store' });
  }
  proef().then(function () { doekA.src = RONDLEIDING ? FILM_URL : BRON + ROUTES[0].route; }, function () {});
  if (RONDLEIDING) { zetStippen(9); toonStand(0, 'Alles wat loopt, op een scherm'); }
  else { zetStippen(ROUTES.length); toonStand(0, ROUTES[0].zin); }
  meet();
  pasIn();
})();
