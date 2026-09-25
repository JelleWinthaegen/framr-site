/* Neemt de film van het portaal op (25-09-2026): de intro (intro.html), dan het portaal dat zichzelf
   bedient (film.js in de dev-server met de nagebouwde motor, framr-portaal/server.mjs --nep), dan
   het slot (slot.html). Een opname, geen montage: Playwright neemt het venster op terwijl de pagina
   van intro naar portaal naar slot gaat, en ffmpeg maakt er een mp4 van plus een stilstaand beeld.

   Draaien, met de site op 4180 en het portaal op 4600 (launch-configs framr-site en framr-portaal):

       node framr-site/vloeren/film/opnemen.mjs

   Uit: rondleiding.mp4 en rondleiding.jpg in deze map; de ruwe webm gaat weg. Playwright komt uit
   de globale npm-installatie (npm ls -g playwright), ffmpeg met libx264 uit het systeem. De
   webletters moeten er zijn, van Google Fonts of lokaal gezet; anders neemt Chrome de valletter.

   Het portaal krijgt tijdens de opname een ondertitel onderin (de zin van elke stap, uit film.js),
   zodat de film zichzelf uitlegt. Geen lange streepjes en geen emoji, conform de afspraken. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { rmSync, renameSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const SITE = process.env.FILM_SITE || 'http://127.0.0.1:4180';
const PORTAAL = process.env.FILM_PORTAAL || 'http://127.0.0.1:4600';
const BREED = 1440, HOOG = 900;
const RUW = join(HIER, 'ruw');
mkdirSync(RUW, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' }).catch(() => chromium.launch());
const ctx = await browser.newContext({ viewport: { width: BREED, height: HOOG }, deviceScaleFactor: 1,
  recordVideo: { dir: RUW, size: { width: BREED, height: HOOG } } });
const page = await ctx.newPage();
const meldingen = [];
page.on('console', (m) => { const t = m.text(); if (t.startsWith('FILM ')) { meldingen.push(t); console.log(t); } });
page.on('pageerror', (e) => console.log('pageerror: ' + e.message));

/* De ondertitel in het portaal: luistert naar de meldingen van film.js (die gaan naar window.parent,
   en dat is hier het venster zelf) en zet de zin onderin, in de letters van de site. */
await page.addInitScript(() => {
  if (!/[?&]film=/.test(location.search)) return;
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.tb !== 'film') return;
    console.log('FILM ' + JSON.stringify(e.data));
    if (e.data.doe !== 'stap') return;
    let bar = document.getElementById('film-onder');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'film-onder';
      bar.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:99999;background:rgba(20,22,26,.92);color:#fff;' +
        'padding:16px 26px 15px;border-radius:999px;font-family:Poppins,sans-serif;font-weight:500;font-size:19px;letter-spacing:-.01em;' +
        'box-shadow:0 18px 44px rgba(20,22,26,.3);display:flex;align-items:center;gap:16px;white-space:nowrap;transition:opacity .3s;';
      document.body.appendChild(bar);
    }
    bar.innerHTML = '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.18em;color:#EA5B10;text-transform:uppercase">' +
      (e.data.nr + 1) + ' / ' + e.data.van + '</span><span>' + e.data.zin.replace(/</g, '&lt;') + '</span>';
    bar.style.opacity = '0';
    requestAnimationFrame(() => { bar.style.opacity = '1'; });
  });
});

/* 1. De intro. */
await page.goto(SITE + '/vloeren/film/intro.html', { waitUntil: 'load' });
await page.waitForTimeout(5400);

/* 2. Het portaal bedient zichzelf. */
await page.goto(PORTAAL + '/?film=rondleiding', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
await page.evaluate(() => window.postMessage({ tb: 'toonbank', doe: 'speel' }, '*'));
const tot = Date.now() + 240000;
while (Date.now() < tot && !meldingen.some((m) => /"doe":"(klaar|fout)"/.test(m))) await page.waitForTimeout(400);
if (meldingen.some((m) => /"doe":"fout"/.test(m))) console.log('LET OP: de rondleiding meldde een fout; de film is niet compleet.');
await page.waitForTimeout(600);

/* 3. Het slot. */
await page.goto(SITE + '/vloeren/film/slot.html', { waitUntil: 'load' });
await page.waitForTimeout(4600);

const video = page.video();
await ctx.close();
await browser.close();
const webm = await video.path();

/* 4. Naar mp4 (H.264, 1280 breed, zonder geluid) en een stilstaand beeld uit de intro. */
const mp4 = join(HIER, 'rondleiding.mp4');
const jpg = join(HIER, 'rondleiding.jpg');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '4.2', '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);
rmSync(RUW, { recursive: true, force: true });
const duur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString().trim();
console.log('klaar: ' + mp4 + ' (' + Math.round(Number(duur)) + ' s), stilstaand beeld ' + jpg);
