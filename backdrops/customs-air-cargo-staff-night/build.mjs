// Generates the Customs Air Cargo Staff Night backdrop.
//
//   cd backdrops && npm install && npm run build:customs-air-cargo-staff-night
//
// Writes backdrop.svg (vector master) and colour-code.svg, then uses Playwright's
// Chromium to export backdrop.pdf (vector, text as outlines), backdrop-4k.png
// (LED wall) and colour-code.png. Pass --svg-only to skip the exports.
// Edit TEXT or PALETTE below and re-run to produce new files.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fontFile = join(here, '..', '..', 'public', 'assets', 'fonts', 'PlusJakartaSans-Latin-Variable.woff2');

const TEXT = {
  eyebrow: 'CUSTOMS AIR CARGO',
  title: 'STAFF NIGHT',
  year: '2026',
  tagline: 'AN EVENING IN SHADES OF BLUE',
};

// Colour code: every colour in the artwork comes from this blue scale.
export const PALETTE = {
  midnight: '#030B1E',
  abyss: '#061634',
  navy: '#0B2350',
  deep: '#11336F',
  royal: '#1A4BA8',
  cobalt: '#2563D9',
  azure: '#3D8BF2',
  sky: '#7DB9F7',
  powder: '#BCDCFB',
  ice: '#EAF5FF',
};
const P = PALETTE;

const W = 1920;
const H = 1080;
const CX = W / 2;
const HZ = 640; // horizon line

const f = (n) => Number(n.toFixed(2));

// Deterministic randomness so every build is identical.
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Quadratic Bézier helpers for the flight-route arches.
const qPoint = ([p0, p1, p2], t) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1],
];
const qTangent = ([p0, p1, p2], t) => [
  2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]),
  2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]),
];
function qSplit([p0, p1, p2], t) {
  const a = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
  const b = [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
  const m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return [[p0, a, m], [m, b, p2]];
}
// Portion of a quadratic between t0 and t1.
function qSub(curve, t0, t1) {
  const [, tail] = qSplit(curve, t0);
  return qSplit(tail, (t1 - t0) / (1 - t0))[0];
}
const qPath = ([p0, p1, p2]) => `M${f(p0[0])} ${f(p0[1])}Q${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])}`;

function stars() {
  const rand = rng(2026);
  let out = '';
  for (let i = 0; i < 230; i++) {
    const x = rand() * W;
    const y = rand() ** 1.35 * (HZ - 70);
    const r = 0.5 + rand() ** 3 * 1.9;
    const o = 0.18 + rand() * 0.65;
    const c = rand() > 0.7 ? P.sky : P.ice;
    // Keep the lettering clear.
    if (x > 330 && x < W - 330 && y > 120 && y < 510) continue;
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" opacity="${f(o)}"/>`;
  }
  // A few four-point sparkles.
  const sparkles = [
    [212, 118, 13], [1712, 92, 15], [1546, 214, 8], [402, 268, 9],
    [96, 360, 7], [1834, 330, 9], [700, 66, 7], [1262, 58, 8],
  ];
  for (const [x, y, s] of sparkles) {
    const k = s * 0.16;
    out += `<circle cx="${x}" cy="${y}" r="${f(s * 1.8)}" fill="url(#softGlow)" opacity="0.55"/>`;
    out += `<path d="M${x} ${y - s}Q${f(x + k)} ${f(y - k)} ${x + s} ${y}Q${f(x + k)} ${f(y + k)} ${x} ${y + s}Q${f(x - k)} ${f(y + k)} ${x - s} ${y}Q${f(x - k)} ${f(y - k)} ${x} ${y - s}Z" fill="${P.ice}" opacity="0.9"/>`;
  }
  return out;
}

function bokeh() {
  const spots = [
    [140, 200, 120, 0.22], [330, 80, 70, 0.16], [1800, 210, 140, 0.2], [1610, 70, 80, 0.14],
    [60, 520, 90, 0.12], [1880, 500, 100, 0.12], [520, 470, 60, 0.08], [1420, 470, 60, 0.08],
  ];
  return spots
    .map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bokeh)" opacity="${o}"/>`)
    .join('');
}

// The main route arches over the title; the plane climbs away from the left airport.
const ROUTE = [[160, HZ], [CX, -440], [W - 160, HZ]];
const PLANE_T = 0.1;
const PLANE_AT = qPoint(ROUTE, PLANE_T);

function routes() {
  const inner = ROUTE;
  const outer = [[30, HZ], [CX, -650], [W - 30, HZ]];
  const planeT = PLANE_T;
  const [flown] = qSplit(inner, planeT);
  const [px, py] = qPoint(inner, planeT);
  const [tx, ty] = qTangent(inner, planeT);
  const heading = (Math.atan2(ty, tx) * 180) / Math.PI + 90; // plane artwork points up
  const plane =
    'M0 -48C4 -48 5 -42 5 -36L5 -12L46 10L46 16L5 4L5 30L18 40L18 45L0 40L-18 45L-18 40L-5 30L-5 4L-46 16L-46 10L-5 -12L-5 -36C-5 -42 -4 -48 0 -48Z';

  let out = '';
  out += `<path d="${qPath(outer)}" fill="none" stroke="${P.sky}" stroke-width="1.5" stroke-dasharray="2 12" stroke-linecap="round" opacity="0.32"/>`;
  // Break the route where it would cross the eyebrow text, so it reads as passing behind it.
  for (const [t0, t1] of [[0, 0.285], [0.375, 0.625], [0.715, 1]]) {
    out += `<path d="${qPath(qSub(inner, t0, t1))}" fill="none" stroke="${P.sky}" stroke-width="2.4" stroke-dasharray="10 12" stroke-linecap="round" opacity="0.42"/>`;
  }
  out += `<path d="${qPath(flown)}" fill="none" stroke="url(#trail)" stroke-width="4" stroke-linecap="round"/>`;
  // Airport nodes where the routes meet the horizon.
  for (const [x, y] of [inner[0], inner[2]]) {
    out += `<circle cx="${x}" cy="${y - 2}" r="34" fill="url(#softGlow)" opacity="0.8"/>`;
    out += `<circle cx="${x}" cy="${y - 2}" r="13" fill="none" stroke="${P.powder}" stroke-width="1.5" opacity="0.6"/>`;
    out += `<circle cx="${x}" cy="${y - 2}" r="5" fill="${P.ice}"/>`;
  }
  out += `<g transform="translate(${f(px)} ${f(py)}) rotate(${f(heading)})">`;
  out += `<circle r="70" fill="url(#softGlow)" opacity="0.65"/>`;
  out += `<path d="${plane}" transform="scale(0.9)" fill="${P.ice}"/>`;
  out += '</g>';
  return out;
}

// Uld = unit load device (the contoured air cargo container).
function uld(x, y, w, h, fill, rib) {
  const cut = w * 0.26;
  let out = `<path d="M${x} ${y - h}H${x + w}V${y}H${f(x + cut)}L${x} ${f(y - h * 0.42)}Z" fill="${fill}"/>`;
  for (let i = 1; i < 5; i++) {
    const rx = f(x + (w * i) / 5);
    const bottom = rx < x + cut ? f(y - h * 0.42 * (1 - (rx - x) / cut)) : y;
    out += `<line x1="${rx}" y1="${y - h + 4}" x2="${rx}" y2="${f(bottom - 3)}" stroke="${rib}" stroke-width="1.2"/>`;
  }
  return out;
}

function skyline() {
  const base = HZ + 1;
  const sil = P.abyss;
  let out = '';

  // Left: cargo terminal, control tower and hangar.
  out += `<rect x="60" y="${base - 22}" width="210" height="22" fill="${sil}"/>`;
  out += `<rect x="86" y="${base - 34}" width="90" height="12" fill="${sil}"/>`;
  for (let i = 0; i < 9; i++) {
    out += `<rect x="${76 + i * 21}" y="${base - 15}" width="9" height="4" fill="${P.sky}" opacity="0.4"/>`;
  }
  out += `<rect x="270" y="${base - 14}" width="250" height="14" fill="${sil}"/>`;
  const tx = 468;
  out += `<path d="M${tx - 10} ${base}L${tx - 7} ${base - 120}H${tx + 7}L${tx + 10} ${base}Z" fill="${sil}"/>`;
  out += `<path d="M${tx - 26} ${base - 120}L${tx - 34} ${base - 146}H${tx + 34}L${tx + 26} ${base - 120}Z" fill="${sil}"/>`;
  out += `<rect x="${tx - 30}" y="${base - 143}" width="60" height="9" fill="${P.sky}" opacity="0.55"/>`;
  out += `<rect x="${tx - 22}" y="${base - 154}" width="44" height="8" fill="${sil}"/>`;
  out += `<line x1="${tx}" y1="${base - 154}" x2="${tx}" y2="${base - 186}" stroke="${sil}" stroke-width="3"/>`;
  out += `<circle cx="${tx}" cy="${base - 188}" r="10" fill="url(#softGlow)"/>`;
  out += `<circle cx="${tx}" cy="${base - 188}" r="3" fill="${P.ice}"/>`;
  out += `<path d="M530 ${base}V${base - 30}Q645 ${base - 72} 760 ${base - 30}V${base}Z" fill="${sil}"/>`;

  // Right: stacked cargo containers (one per shade of the colour code) and a hangar.
  const shades = [P.navy, P.deep, P.royal, P.cobalt, P.azure, P.deep, P.royal, P.navy];
  const cw = 52;
  const ch = 34;
  const gap = 6;
  const x0 = 1268;
  shades.forEach((shade, i) => {
    out += uld(x0 + i * (cw + gap), base, cw, ch, shade, P.abyss);
  });
  [P.royal, P.cobalt, P.azure, P.cobalt].forEach((shade, i) => {
    out += uld(x0 + 29 + (i + 1) * (cw + gap), base - ch - 4, cw, ch, shade, P.abyss);
  });
  out += uld(x0 + 29 + 2.5 * (cw + gap), base - 2 * (ch + 4), cw, ch, P.sky, P.royal);
  out += `<path d="M1740 ${base}V${base - 26}Q1830 ${base - 60} 1920 ${base - 26}V${base}Z" fill="${sil}"/>`;
  out += `<rect x="1720" y="${base - 12}" width="200" height="12" fill="${sil}"/>`;
  return out;
}

// Runway and taxiway in perspective; taxiway edge lights are blue on real airfields too.
function airfield() {
  const vpY = HZ + 2;
  const rows = 26;
  const depth = (i) => 1 + i * 0.55;
  const yAt = (d) => vpY + (H + 40 - vpY) / d;
  const along = (xNear, d) => CX + (xNear - CX) / d;
  let out = '';

  out += `<path d="M${CX - 8} ${vpY}H${CX + 8}L${CX + 640} ${H + 40}H${CX - 640}Z" fill="url(#runway)"/>`;

  // Faint tarmac grid.
  for (let k = -9; k <= 9; k++) {
    if (Math.abs(k) < 3) continue;
    out += `<line x1="${CX}" y1="${vpY}" x2="${CX + k * 260}" y2="${H + 40}" stroke="${P.sky}" stroke-width="1" opacity="0.05"/>`;
  }
  for (let i = 1; i < rows; i += 2) {
    const y = f(yAt(depth(i)));
    out += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${P.sky}" stroke-width="1" opacity="${f(0.07 / Math.sqrt(depth(i)))}"/>`;
  }

  // Centre-line dashes.
  for (let i = 0; i < rows; i++) {
    const d1 = depth(i + 0.15);
    const d2 = depth(i + 0.55);
    const w1 = 9 / d1;
    const w2 = 9 / d2;
    const y1 = f(yAt(d1));
    const y2 = f(yAt(d2));
    out += `<path d="M${f(CX - w1)} ${y1}L${f(CX - w2)} ${y2}H${f(CX + w2)}L${f(CX + w1)} ${y1}Z" fill="${P.powder}" opacity="${f(0.75 / Math.sqrt(d1))}"/>`;
  }

  const light = (x, y, r, color, glow) =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 5)}" fill="url(#${glow})"/>` +
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}"/>`;

  for (let i = 0; i < rows; i++) {
    const d = depth(i);
    const y = yAt(d);
    const r = 1 + 6.5 / d;
    // Runway edges: white-ice; taxiway edges: blue.
    out += light(along(CX - 640, d), y, r, P.ice, 'lightIce');
    out += light(along(CX + 640, d), y, r, P.ice, 'lightIce');
    out += light(along(CX - 1250, d), y, r * 0.9, P.azure, 'lightBlue');
    out += light(along(CX + 1250, d), y, r * 0.9, P.azure, 'lightBlue');
  }
  // Threshold bar near the viewer.
  for (let k = -7; k <= 7; k++) {
    out += light(CX + k * 34, H - 26, 3.2, P.sky, 'lightBlue');
  }
  return out;
}

// Text is converted to vector outlines so print shops and LED playback need no font,
// and PDF viewers can fill the title with a gradient (they cannot clip to Type 3 fonts).
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const wawoff2 = require('wawoff2');
const baseFont = fontkit.create(Buffer.from(await wawoff2.decompress(readFileSync(fontFile))));
const instances = new Map();
const fontAt = (wght) => {
  if (!instances.has(wght)) instances.set(wght, baseFont.getVariation({ wght }));
  return instances.get(wght);
};

// One line of text as a single path, centred on cx. Tracking is extra space between glyphs.
function outline(text, { size, weight, tracking = 0, baseline, cx = CX }) {
  const font = fontAt(weight);
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  const advances = run.positions.map((p) => p.xAdvance * scale);
  const width = advances.reduce((sum, a) => sum + a, 0) + tracking * (advances.length - 1);
  let x = cx - width / 2;
  let d = '';
  run.glyphs.forEach((glyph, i) => {
    const { xOffset, yOffset } = run.positions[i];
    d += glyph.path
      .scale(scale, -scale)
      .translate(x + xOffset * scale, baseline - yOffset * scale)
      .toSVG();
    x += advances[i] + tracking;
  });
  return { d, half: width / 2 };
}

function titleBlock() {
  const eyebrow = outline(TEXT.eyebrow, { size: 38, weight: 600, tracking: 15, baseline: 172 });
  const title = outline(TEXT.title, { size: 186, weight: 800, tracking: 4, baseline: 346 });
  const year = outline(TEXT.year, { size: 54, weight: 300, tracking: 23, baseline: 432 });
  const tagline = outline(TEXT.tagline, { size: 24, weight: 500, tracking: 8, baseline: 494 });

  // A 2px rule fading away from the text.
  const rule = (x1, x2, y, side) =>
    `<rect x="${f(Math.min(x1, x2))}" y="${y - 1}" width="${f(Math.abs(x2 - x1))}" height="2" fill="url(#fade${side < 0 ? 'L' : 'R'})"/>`;

  let out = '';
  out += `<path d="${eyebrow.d}" fill="${P.powder}"/>`;
  for (const side of [-1, 1]) {
    const x = CX + side * (eyebrow.half + 44);
    out += `<circle cx="${f(x)}" cy="159" r="4" fill="${P.sky}"/>`;
    out += rule(x + side * 12, x + side * 180, 159, side);
  }

  out += `<path d="${title.d}" transform="translate(0 7)" fill="${P.midnight}" opacity="0.55"/>`;
  out += `<path d="${title.d}" fill="url(#titleFill)"/>`;

  out += `<path d="${year.d}" fill="${P.sky}"/>`;
  for (const side of [-1, 1]) {
    const x = CX + side * (year.half + 46);
    const y = 413;
    out += `<path d="M${f(x)} ${y - 6}L${f(x + side * 6)} ${y}L${f(x)} ${y + 6}L${f(x - side * 6)} ${y}Z" fill="${P.powder}"/>`;
    out += rule(x + side * 14, x + side * 330, y, side);
  }

  out += `<path d="${tagline.d}" fill="${P.powder}" opacity="0.85"/>`;
  return out;
}

function defs() {
  return `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${P.midnight}"/><stop offset="0.42" stop-color="${P.abyss}"/>
  <stop offset="0.8" stop-color="${P.navy}"/><stop offset="1" stop-color="${P.deep}"/>
</linearGradient>
<linearGradient id="ground" x1="0" y1="${HZ}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${P.navy}"/><stop offset="0.35" stop-color="${P.abyss}"/><stop offset="1" stop-color="${P.midnight}"/>
</linearGradient>
<linearGradient id="runway" x1="0" y1="${HZ}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${P.deep}" stop-opacity="0.9"/><stop offset="1" stop-color="${P.navy}" stop-opacity="0.55"/>
</linearGradient>
<radialGradient id="horizonGlow">
  <stop offset="0" stop-color="${P.azure}" stop-opacity="0.75"/><stop offset="0.35" stop-color="${P.cobalt}" stop-opacity="0.35"/>
  <stop offset="1" stop-color="${P.royal}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="titleGlow">
  <stop offset="0" stop-color="${P.royal}" stop-opacity="0.5"/><stop offset="0.6" stop-color="${P.deep}" stop-opacity="0.18"/>
  <stop offset="1" stop-color="${P.deep}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="bokeh">
  <stop offset="0" stop-color="${P.sky}" stop-opacity="1"/><stop offset="0.7" stop-color="${P.azure}" stop-opacity="0.45"/>
  <stop offset="1" stop-color="${P.azure}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="softGlow">
  <stop offset="0" stop-color="${P.ice}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${P.sky}" stop-opacity="0.35"/>
  <stop offset="1" stop-color="${P.azure}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="lightIce">
  <stop offset="0" stop-color="${P.ice}" stop-opacity="0.7"/><stop offset="0.35" stop-color="${P.sky}" stop-opacity="0.22"/>
  <stop offset="1" stop-color="${P.sky}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="lightBlue">
  <stop offset="0" stop-color="${P.azure}" stop-opacity="0.8"/><stop offset="0.35" stop-color="${P.cobalt}" stop-opacity="0.28"/>
  <stop offset="1" stop-color="${P.cobalt}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="titleFill" x1="0" y1="200" x2="0" y2="350" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="${P.ice}"/><stop offset="1" stop-color="${P.powder}"/>
</linearGradient>
<linearGradient id="trail" x1="${ROUTE[0][0]}" y1="${ROUTE[0][1]}" x2="${f(PLANE_AT[0])}" y2="${f(PLANE_AT[1])}" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${P.sky}" stop-opacity="0"/><stop offset="1" stop-color="${P.ice}" stop-opacity="0.95"/>
</linearGradient>
<linearGradient id="fadeL" x1="1" y1="0" x2="0" y2="0">
  <stop offset="0" stop-color="${P.sky}"/><stop offset="1" stop-color="${P.sky}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="fadeR" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${P.sky}"/><stop offset="1" stop-color="${P.sky}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="vignette" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${P.midnight}" stop-opacity="0.55"/><stop offset="0.18" stop-color="${P.midnight}" stop-opacity="0"/>
  <stop offset="0.82" stop-color="${P.midnight}" stop-opacity="0"/><stop offset="1" stop-color="${P.midnight}" stop-opacity="0.55"/>
</linearGradient>
</defs>`;
}

function buildSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>${TEXT.eyebrow} — ${TEXT.title} ${TEXT.year}</title>
${defs()}
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<ellipse cx="${CX}" cy="300" rx="980" ry="420" fill="url(#titleGlow)"/>
<g id="layer-bokeh">${bokeh()}</g>
<g id="layer-stars">${stars()}</g>
<g id="layer-routes">${routes()}</g>
<ellipse cx="${CX}" cy="${HZ}" rx="1250" ry="170" fill="url(#horizonGlow)"/>
<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ground)"/>
<ellipse cx="${CX}" cy="${HZ + 4}" rx="900" ry="46" fill="url(#horizonGlow)" opacity="0.7"/>
<g id="layer-skyline">${skyline()}</g>
<line x1="0" y1="${HZ + 1}" x2="${W}" y2="${HZ + 1}" stroke="${P.sky}" stroke-width="1.5" opacity="0.35"/>
<g id="layer-airfield">${airfield()}</g>
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
<g id="layer-title">${titleBlock()}</g>
</svg>
`;
}

// A shareable swatch card of the colour code, for decor, lighting and print matching.
const CARD_W = 1920;
const CARD_H = 560;

function buildColourCard() {
  const names = Object.keys(PALETTE);
  const margin = 96;
  const gap = 12;
  const sw = (CARD_W - margin * 2 - gap * (names.length - 1)) / names.length;
  const heading = outline(`COLOUR CODE  ·  SHADES OF BLUE`, { size: 30, weight: 700, tracking: 9, baseline: 100 });
  let out = `<path d="${heading.d}" fill="${P.navy}"/>`;
  names.forEach((name, i) => {
    const x = margin + i * (sw + gap);
    const cx = x + sw / 2;
    const label = outline(name.toUpperCase(), { size: 21, weight: 700, tracking: 3, baseline: 452, cx });
    const hex = outline(PALETTE[name], { size: 21, weight: 500, tracking: 1, baseline: 486, cx });
    out += `<rect x="${f(x)}" y="150" width="${f(sw)}" height="260" rx="10" fill="${PALETTE[name]}" stroke="#D5E3F3" stroke-width="1.5"/>`;
    out += `<path d="${label.d}" fill="${P.navy}"/><path d="${hex.d}" fill="${P.royal}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
<title>Colour code: shades of blue</title>
<rect width="${CARD_W}" height="${CARD_H}" fill="#FFFFFF"/>
${out}
</svg>
`;
}

async function render(svgPath) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(svgPath).href);
    await page.screenshot({ path: join(here, 'backdrop-4k.png') });

    // Wrap in HTML so the PDF page is exactly the artwork, with no margins.
    const svg = readFileSync(svgPath, 'utf8');
    const printPage = await browser.newPage();
    await printPage.setContent(
      `<!doctype html><style>@page{size:${W}px ${H}px;margin:0}html,body{margin:0}svg{display:block}</style>${svg}`,
    );
    await printPage.pdf({ path: join(here, 'backdrop.pdf'), width: `${W}px`, height: `${H}px`, printBackground: true });

    const cardPage = await browser.newPage({ viewport: { width: CARD_W, height: CARD_H }, deviceScaleFactor: 2 });
    await cardPage.goto(pathToFileURL(join(here, 'colour-code.svg')).href);
    await cardPage.screenshot({ path: join(here, 'colour-code.png') });
  } finally {
    await browser.close();
  }
}

const svgPath = join(here, 'backdrop.svg');
writeFileSync(svgPath, buildSvg());
writeFileSync(join(here, 'colour-code.svg'), buildColourCard());
if (process.argv.includes('--svg-only')) {
  console.log('Wrote backdrop.svg and colour-code.svg');
} else {
  await render(svgPath);
  console.log('Wrote backdrop.svg, backdrop.pdf, backdrop-4k.png, colour-code.svg and colour-code.png');
}
