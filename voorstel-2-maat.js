/* Framr.One, tweede voorstel voor de beginpagina: de indeling van de opening op een telefoon.
   Een losse rekenregel zonder browser, zodat hij te testen is (test/voorstel-2-maat.test.mjs).

   Op een groot scherm staat de tekening naast de tekst, en daar mag de tekst wegvagen terwijl
   de tekening naar het midden schuift. Op een telefoon staat de tekening onder de tekst, en dan
   gaf dat een half doorzichtige kop met de namen van de onderdelen over de knoppen (Jelle,
   16-10-2026: "de opening is vervaagd en de labels vallen over de knop"). Daarom hier:
     1. niets vervaagt: tekst en tekening scrollen gewoon samen omhoog;
     2. de tekening begint onder de knoppen, gemeten aan de echte knoppen en niet als deel van
        de schermhoogte, dus de namen vallen nooit over een knop;
     3. de opening zet zich vast (een sticky met een negatieve top) zodra de knoppen net onder
        de balk staan; de kop en de inleiding zijn dan al weg, zodat er niets achter de half
        doorzichtige balk wazig doorschemert. Daarna landen de onderdelen, een voor een;
     4. de tekening staat dan in het midden van de ruimte onder de knoppen. Is het scherm daar
        te laag voor (een liggende telefoon), dan scrollen ook de knoppen weg.

   In, in pixels: scherm (de schermhoogte), balk (de hoogte van de balk bovenaan), tekening
   (de hoogte van het platte scherm) en knopBoven en knopOnder (vanaf de bovenkant van de
   opening). Uit, in pixels: scene (waar de tekening begint), vast (hoe ver de opening omhoog
   scrolt voor ze vastzet), plak (de hoogte van het vastgezette stuk), duur (hoeveel er
   gescrold wordt terwijl ze vaststaat) en held (de hoogte van de hele opening). */
(function (wereld) {
  'use strict';

  /* De namen van de onderdelen staan tot zo'n 55 pixels boven de tekening (gemeten op 320
     breed); met deze ruimte blijft er dan nog ruim 20 pixels lucht onder de knoppen. */
  var LABELRUIMTE = 80;
  /* De ruimte tussen de balk en de knoppen, en tussen de tekening en de onderrand. */
  var MARGE = 14;

  function telefoonMaat(m) {
    var scene, vast;
    var knoppenVast = Math.round(m.knopBoven - m.balk - MARGE);
    /* De vrije hoogte onder de knoppen als de opening vaststaat, zonder de tekening. */
    var vrij = m.scherm - (m.knopOnder - knoppenVast) - m.tekening;
    if (vrij - MARGE >= LABELRUIMTE) {
      vast = knoppenVast;
      scene = Math.round(m.knopOnder + Math.max(LABELRUIMTE, vrij / 2));
    } else {
      vast = Math.round(m.knopOnder);
      scene = Math.round(m.knopOnder + m.balk + LABELRUIMTE);
    }
    vast = Math.max(0, vast);
    var duur = Math.round(m.scherm * 1.5);
    return { scene: scene, vast: vast, plak: m.scherm + vast, duur: duur, held: m.scherm + vast + duur };
  }

  wereld.v2TelefoonMaat = telefoonMaat;
})(this);
