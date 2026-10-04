/* De brochure als boek, op twee plekken: klein in het vlak onder de kop (slaat vanzelf om de paar
   seconden een pagina om) en groot in het blad dat opent als je op dat vlak klikt (bladeren met de
   pijlen of de pijltjestoetsen). Op wens van Jelle (15-09-2026): een echte omslag, geen wissel.

   Een boek bestaat uit twee bladen (links en rechts) en een los vel dat omslaat: de voorkant toont
   de pagina die weggaat, de achterkant de pagina die eronder vandaan komt. Het vel draait om de rug
   (de transform staat in de CSS van de pagina, klassen bk-); is het klaar, dan liggen de bladen op
   de nieuwe stand en verdwijnt het vel. Op een smal scherm ligt er een pagina tegelijk, zonder
   omslag; wie liever geen beweging heeft (prefers-reduced-motion) krijgt ook een wissel.

   De pagina's staan als beelden onder brochure/joka-designvloeren-2025/ (p01 tot en met p80).
   Geen lange streepjes en geen emoji, conform de afspraken. */
(function () {
  var PAD = 'brochure/joka-designvloeren-2025/p';
  var LAATSTE = 80;
  var STIL = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function bron(n) { return PAD + (n < 10 ? '0' + n : n) + '.webp'; }
  function laadVooruit(n) { if (n >= 1 && n <= LAATSTE) { var i = new Image(); i.src = bron(n); } }
  /* Wacht tot een beeld er is, maar nooit langer dan een tel: liever een omslag met een pagina die
     nog binnenkomt dan een boek dat hapert. */
  function alsGeladen(img) {
    return new Promise(function (klaar) {
      if (!img.getAttribute('src') || img.complete) return klaar();
      img.addEventListener('load', klaar, { once: true });
      img.addEventListener('error', klaar, { once: true });
      setTimeout(klaar, 700);
    });
  }

  function Boek(el, enkel) {
    this.el = el;
    this.enkel = enkel || function () { return false; };
    el.innerHTML =
      '<span class="bk-blad bk-links"><img alt=""></span>' +
      '<span class="bk-blad bk-rechts"><img alt=""></span>' +
      '<span class="bk-vel bk-uit"><span class="bk-voor"><img alt=""></span><span class="bk-achter"><img alt=""></span></span>';
    this.links = el.children[0];
    this.rechts = el.children[1];
    this.vel = el.children[2];
    this.voor = this.vel.children[0].firstChild;
    this.achter = this.vel.children[1].firstChild;
    this.nu = 1;
    this.bezig = false;
  }

  /* Welke pagina's samen open liggen: de omslag en de laatste pagina alleen, verder twee naast elkaar. */
  Boek.prototype.spread = function (n) {
    if (this.enkel() || n === 1 || n === LAATSTE) return [n];
    return n % 2 === 0 ? [n, n + 1] : [n - 1, n];
  };

  function vul(blad, n) {
    var img = blad.firstChild;
    if (!n) { blad.classList.add('bk-leeg'); img.removeAttribute('src'); img.alt = ''; return; }
    blad.classList.remove('bk-leeg');
    img.src = bron(n);
    img.alt = 'Pagina ' + n;
  }

  /* De bladen meteen op een stand zetten, zonder omslag. */
  Boek.prototype.zet = function (s) {
    var enkel = this.enkel();
    this.el.classList.toggle('bk-enkel', enkel);
    if (s.length === 2) { vul(this.links, s[0]); vul(this.rechts, s[1]); }
    else if (enkel || s[0] === 1) { vul(this.links, 0); vul(this.rechts, s[0]); }
    else { vul(this.links, s[0]); vul(this.rechts, 0); }
    this.nu = s[0];
    laadVooruit(s[s.length - 1] + 1);
    laadVooruit(s[s.length - 1] + 2);
  };

  /* Naar pagina n, met een omslag vooruit (verder) of achteruit (terug). Zonder richting, op een
     smal scherm of zonder beweging: meteen wisselen. */
  Boek.prototype.ga = function (n, richting, klaar) {
    n = Math.max(1, Math.min(LAATSTE, n));
    var van = this.spread(this.nu);
    var naar = this.spread(n);
    if (van[0] === naar[0]) { if (klaar) klaar(); return; }
    if (!richting || STIL || this.enkel()) { this.zet(naar); if (klaar) klaar(); return; }
    if (this.bezig) return;
    this.bezig = true;
    var self = this;
    var vel = this.vel;
    vel.className = 'bk-vel bk-' + richting;
    if (richting === 'verder') {
      /* Het rechterblad slaat naar links: voorkant de huidige rechterpagina, achterkant de nieuwe linker;
         onder het vel komt alvast de nieuwe rechterpagina te liggen. */
      this.voor.src = bron(van[van.length - 1]);
      this.achter.src = bron(naar[0]);
      vul(this.rechts, naar[1] || 0);
    } else {
      /* Het linkerblad slaat naar rechts: voorkant de huidige linkerpagina, achterkant de nieuwe rechter;
         onder het vel komt alvast de nieuwe linkerpagina te liggen. */
      this.voor.src = bron(van[0]);
      this.achter.src = bron(naar[naar.length - 1]);
      vul(this.links, naar.length === 2 ? naar[0] : 0);
    }
    var af = false;
    function einde() {
      if (af) return;
      af = true;
      self.zet(naar);
      vel.className = 'bk-vel bk-uit';
      self.bezig = false;
      if (klaar) klaar();
    }
    Promise.all([alsGeladen(self.achter), alsGeladen(self.voor)]).then(function () {
      void vel.offsetWidth;
      vel.classList.add('bk-draait');
      vel.addEventListener('transitionend', einde, { once: true });
      setTimeout(einde, 1300);
    });
  };

  /* Het boek op maat: zo groot als in de ruimte past, met de verhouding van de pagina's. */
  Boek.prototype.pas = function (breed, hoog) {
    var verhouding = (this.enkel() ? 900 : 1800) / 1273;
    var w = Math.min(breed, hoog * verhouding);
    this.el.style.width = Math.floor(w) + 'px';
    this.el.style.height = Math.floor(w / verhouding) + 'px';
  };

  var paneel = document.getElementById('v3-brochure');
  var knop = document.getElementById('v3-brochure-open');
  if (!paneel || !knop || !paneel.showModal) return;

  /* ---------- 1. het kleine boek in het vlak onder de kop ---------- */
  var vakBoek = new Boek(knop.querySelector('.v3-boek'));
  var VAK_EERSTE = 2;
  var VAK_LAATSTE = 21;
  vakBoek.pas(300, 212);
  vakBoek.zet([VAK_EERSTE, VAK_EERSTE + 1]);
  var klok = null;
  var inBeeld = false;
  function slaOm() {
    if (vakBoek.bezig) return;
    var s = vakBoek.spread(vakBoek.nu);
    var v = s[s.length - 1] + 1;
    if (v > VAK_LAATSTE) {
      /* Terug naar het begin met een korte overvloeier; een omslag over twintig pagina's bestaat niet. */
      vakBoek.el.style.opacity = '0';
      setTimeout(function () { vakBoek.zet([VAK_EERSTE, VAK_EERSTE + 1]); vakBoek.el.style.opacity = ''; }, 380);
      return;
    }
    vakBoek.ga(v, 'verder');
  }
  function start() { if (!klok && !STIL && inBeeld && !paneel.open && !document.hidden) klok = window.setInterval(slaOm, 3800); }
  function stop() { if (klok) { window.clearInterval(klok); klok = null; } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { inBeeld = e.isIntersecting; if (inBeeld) start(); else stop(); });
    }, { threshold: 0.4 }).observe(knop);
  } else { inBeeld = true; start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });

  /* ---------- 2. het blad: de hele brochure, met een omslag per pagina ---------- */
  var boek = new Boek(paneel.querySelector('.v3-boek'), function () { return window.innerWidth < 760; });
  var stand = document.getElementById('v3-brochure-stand');
  var vorige = paneel.querySelector('[data-brochure-vorige]');
  var volgende = paneel.querySelector('[data-brochure-volgende]');
  function pasBoek() {
    var ruimte = paneel.querySelector('.v3-brochure-boek');
    boek.pas(ruimte.clientWidth - 8, ruimte.clientHeight - 44);
  }
  function toonStand() {
    var s = boek.spread(boek.nu);
    stand.textContent = (s.length === 2 ? s[0] + ' en ' + s[1] : s[0]) + ' van ' + LAATSTE;
    vorige.disabled = s[0] <= 1;
    volgende.disabled = s[s.length - 1] >= LAATSTE;
  }
  function verder() { var s = boek.spread(boek.nu); boek.ga(s[s.length - 1] + 1, 'verder', toonStand); }
  function terug() { boek.ga(boek.spread(boek.nu)[0] - 1, 'terug', toonStand); }

  knop.addEventListener('click', function () {
    stop();
    paneel.showModal();
    pasBoek();
    boek.zet([1]);
    toonStand();
  });
  /* Andere ingangen op de pagina (de wegwijzer, de regel bij De collectie) doen hetzelfde als de knop in het vlak. */
  document.querySelectorAll('[data-brochure-open]').forEach(function (k) { k.addEventListener('click', function () { knop.click(); }); });
  paneel.querySelectorAll('[data-brochure-dicht]').forEach(function (k) { k.addEventListener('click', function () { paneel.close(); }); });
  paneel.addEventListener('close', start);
  vorige.addEventListener('click', terug);
  volgende.addEventListener('click', verder);
  paneel.addEventListener('click', function (e) { if (e.target === paneel) paneel.close(); });
  paneel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); terug(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); verder(); }
    if (e.key === 'Escape') { e.preventDefault(); paneel.close(); }
  });
  window.addEventListener('resize', function () {
    if (!paneel.open) return;
    pasBoek();
    boek.zet(boek.spread(boek.nu));
    toonStand();
  });
})();
