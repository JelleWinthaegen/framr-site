/* Framr.One site: het beetje gedrag dat de paginas nodig hebben.
   De meetlat bovenaan loopt oranje vol met het scrollen, de balk wordt dekkend
   zodra je voorbij de hero bent, en de oranje streep boven een pakketvak wordt
   getekend als het vak in beeld komt. */
(function () {
  var voortgang = document.querySelector('.meetlat .voortgang');
  var balk = document.querySelector('.balk');
  var hero = document.querySelector('.hero');

  function meet() {
    if (voortgang) {
      var totaal = document.documentElement.scrollHeight - window.innerHeight;
      var deel = totaal > 0 ? Math.min(1, window.scrollY / totaal) : 0;
      voortgang.style.width = (deel * 100) + '%';
    }
    if (balk) {
      balk.classList.toggle('vast', window.scrollY > 24);
      if (hero && balk.classList.contains('merk-wacht')) {
        var grens = hero.offsetHeight * 0.55;
        balk.classList.toggle('voorbij-hero', window.scrollY > grens);
      }
    }
  }

  window.addEventListener('scroll', meet, { passive: true });
  window.addEventListener('resize', meet);
  meet();

  var vakken = document.querySelectorAll('.vak');
  if (!vakken.length) return;

  if (!('IntersectionObserver' in window)) {
    vakken.forEach(function (vak) { vak.classList.add('getekend'); });
    return;
  }

  var kijker = new IntersectionObserver(function (regels) {
    regels.forEach(function (regel) {
      if (!regel.isIntersecting) return;
      var vak = regel.target;
      var stand = Number(vak.dataset.stand || 0);
      window.setTimeout(function () { vak.classList.add('getekend'); }, stand * 110);
      kijker.unobserve(vak);
    });
  }, { threshold: 0.25 });

  vakken.forEach(function (vak, i) {
    vak.dataset.stand = String(i % 5);
    kijker.observe(vak);
  });
})();
