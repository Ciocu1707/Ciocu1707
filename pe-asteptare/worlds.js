// worlds.js — one kitchen in four eras (one palette each) + the time portal.
import { clamp, lerp, hash, vnoise, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands } from './toon.js';
import { GLOW, cord } from './chars.js';

const X0 = -1600, X1 = 3600;
// Palettes per era: wall, wall stripe, floor, floor line, trim, accent, window sky bands
export const ERA = {
  acum:   { wall: '#f6d36e', stripe: '#ecc458', floor: '#2f8f83', floorL: '#23736a', trim: '#e2523b', acc: '#e2523b', sky: ['#9fd6f2', '#b9e2f5', '#d3eef9'], cal: 'NOIEMBRIE 2026', calN: '14' },
  sapt:   { wall: '#4b2a8f', stripe: '#41247d', floor: '#2a1458', floorL: '#1e0e42', trim: '#f2b632', acc: '#f2b632', sky: ['#120a2e', '#1c1046', '#28175e'], cal: 'NOIEMBRIE 2026', calN: '21' },
  ani40:  { wall: '#f07f3c', stripe: '#dc6e2e', floor: '#1f8a8a', floorL: '#176d6d', trim: '#145e5e', acc: '#fff1d6', sky: ['#ffb36b', '#ffc88e', '#ffdcb0'], cal: 'NOIEMBRIE 2066', calN: '14' },
  an3000: { wall: '#ead9bd', stripe: '#e0cdae', floor: '#b79a78', floorL: '#a38665', trim: '#8c6b4f', acc: '#8c6b4f', sky: ['#e6dcc8', '#ece3d2', '#f2ebdc'], cal: 'NOIEMBRIE 3000', calN: '14' },
};
export const PHONE_BASE = [430, 470];

export function kitchen(era, t, { clockSpin = 0, wash = 0 } = {}) {
  const P = ERA[era];
  fillOnly(rect(X0, -1400, X1 - X0, 2300), P.wall, { boil: 0 });
  for (let x = -1500; x < 3500; x += 120) fillOnly(rect(x, -1400, 46, 2260), P.stripe, { boil: 0 });
  // window (centre right) with the era's sky
  shape(rr(1130, 170, 420, 330, 14), { fill: P.sky[0], lw: 8, shade: () => {
    bands(P.sky, 170, 500, 1130, 1550);
    if (era === 'acum') { shape(ell(1250, 260, 50, 22, 18), { fill: '#fff', lw: 5 }); shape(ell(1450, 330, 40, 18, 18), { fill: '#fff', lw: 5 }); }
    if (era === 'sapt') { shape(ell(1440, 260, 34, 34, 24), { fill: '#fff4c4', lw: 5, shade: () => fillOnly(ell(1460, 250, 30, 32, 20), '#120a2e', { boil: .2 }) }); for (let i = 0; i < 8; i++) dot(1160 + hash(i) * 360, 200 + hash(i + 5) * 260, 3, '#fff4c4'); }
    if (era === 'ani40') { for (let i = 0; i < 3; i++) { const x = 1100 + ((t * 120 + i * 180) % 520), y = 240 + i * 70; shape(rr(x, y, 70, 24, 10), { fill: ['#145e5e', '#fff1d6', '#e2523b'][i], lw: 5 }); } }
  } });
  stroke([[1340, 170], [1340, 500]], 7); stroke([[1130, 335], [1550, 335]], 7);
  shape(rect(1110, 496, 460, 24), { fill: P.trim, lw: 6 });
  // floor + skirting
  shape(rect(X0, 860, X1 - X0, 900), { fill: P.floor, lw: 6 });
  for (let x = -1600; x < 3600; x += 160) stroke([[x, 860], [x - 260, 1760]], 4, { line: P.floorL });
  shape(rect(X0, 832, X1 - X0, 30), { fill: P.trim, lw: 6 });
  // wall clock (top centre): its hands spin when time is skipped
  const clockA = (t * .02 + clockSpin * 40);
  shape(ell(820, 190, 78, 78, 40), { fill: '#fffaf0', lw: 8, shade: () => {
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[820 + Math.cos(a) * 58, 190 + Math.sin(a) * 58], [820 + Math.cos(a) * 68, 190 + Math.sin(a) * 68]], 4); }
  } });
  stroke([[820, 190], [820 + Math.cos(clockA * 12 - Math.PI / 2) * 54, 190 + Math.sin(clockA * 12 - Math.PI / 2) * 54]], 6);
  stroke([[820, 190], [820 + Math.cos(clockA - Math.PI / 2) * 36, 190 + Math.sin(clockA - Math.PI / 2) * 36]], 8);
  dot(820, 190, 8);
  // calendar
  shape(rr(1640, 230, 170, 210, 8), { fill: '#fffaf0', lw: 6, shade: () => {
    fillOnly(rect(1640, 230, 170, 50), P.acc, { boil: .2 });
    text(P.cal, 1725, 256, { font: '800 20px "Baloo 2"', fill: era === 'ani40' ? INK : '#fff' });
    text(P.calN, 1725, 362, { font: '800 96px "Baloo 2"', fill: INK });
  } });
  // counter + fridge (right)
  shape(rr(1620, 520, 280, 340, 16), { fill: '#f2f2ee', lw: 7, shade: () => fillOnly(rect(1830, 500, 90, 380), '#d6d6cf', { boil: .3 }) });
  stroke([[1620, 650], [1900, 650]], 6); shape(rr(1640, 560, 16, 70, 6), { fill: '#b8b8b0', lw: 5 }); shape(rr(1640, 670, 16, 110, 6), { fill: '#b8b8b0', lw: 5 });
  shape(rect(-200, 620, 560, 240), { fill: P.trim, lw: 7 }); shape(rect(-220, 600, 600, 30), { fill: P.acc === '#fff1d6' ? '#e9d6b0' : '#f4efe4', lw: 6 });
  // wall phone base (left)
  shape(rr(PHONE_BASE[0] - 60, PHONE_BASE[1] - 110, 120, 170, 16), { fill: '#e2523b', lw: 7, shade: () => {
    fillOnly(rect(PHONE_BASE[0] + 20, PHONE_BASE[1] - 120, 50, 190), '#b63a27', { boil: .3 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) shape(ell(PHONE_BASE[0] - 26 + c * 26, PHONE_BASE[1] - 40 + r * 26, 9, 8, 10), { fill: '#fff6e0', lw: 3 });
  } });
  // era details
  if (era === 'acum') { shape(rr(150, 520, 70, 80, 10), { fill: '#fffaf0', lw: 6 }); shape(spline([[170, 520], [150, 440], [190, 470], [200, 420], [220, 470], [250, 450], [210, 520]]), { fill: '#3aa35a', lw: 6 }); }
  if (era === 'sapt') { // cobwebs + a plant that grew in a week
    for (const [cx, cy, s] of [[1130, 170, 1], [-40, 0, 1.4], [1620, 520, .8]]) for (let k = 1; k <= 3; k++) stroke(arc(cx, cy, 70 * k * s, 70 * k * s, 0, Math.PI / 2, 10), 3, { line: '#d9d0f0' });
    shape(rr(150, 520, 70, 80, 10), { fill: '#fffaf0', lw: 6 }); shape(spline([[170, 520], [120, 300], [210, 360], [230, 260], [260, 380], [320, 340], [220, 520]]), { fill: '#3aa35a', lw: 6 });
  }
  if (era === 'ani40') { // a jungle plant, peeling wallpaper, a mountain of post
    shape(rr(150, 520, 70, 80, 10), { fill: '#fffaf0', lw: 6 }); shape(spline([[160, 520], [40, 80], [200, 250], [260, -40], [330, 260], [520, 120], [240, 520]]), { fill: '#3aa35a', lw: 6 });
    shape([[600, 120], [700, 120], [690, 210], [640, 180], [610, 230]], { fill: P.stripe, lw: 5 });
  }
  if (era === 'an3000') { shape(rr(150, 520, 70, 80, 10), { fill: '#fffaf0', lw: 6 }); shape(spline([[170, 520], [150, 440], [190, 470], [200, 420], [220, 470], [250, 450], [210, 520]]), { fill: '#8f9a6a', lw: 6 }); }
  if (wash > 0) { push(); fillOnly(rect(X0, -1400, X1 - X0, 3200), `rgba(57,240,255,${.16 * wash})`, { boil: 0 }); pop(); }
}

// The time portal: a lumpy cyan rim, rotating arms and, in the core, a clock face whose hands race.
export function portal(cx, cy, r, t, { open = 1, sx = .78 } = {}) {
  if (open <= .001) return;
  const R = r * open;
  push(); translate(cx, cy); scale(sx, 1);
  fillOnly(ell(0, 0, R * 1.55, R * 1.45, 48), 'rgba(57,240,255,.13)', { boil: .6 });
  fillOnly(ell(0, 0, R * 1.28, R * 1.22, 48), 'rgba(57,240,255,.18)', { boil: .6 });
  const rim = [], N = 22;
  for (let i = 0; i < N; i++) { const a = i / N * TAU, k = 1 + .08 * (vnoise(i * 1.7 + t * 3) - .5) * 2 + .05 * Math.sin(a * 6 + t * 5); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  shape(spline(rim), { fill: GLOW, lw: 8, shade: () => {
    fillOnly(ell(0, 0, R * .9, R * .9, 40), '#1d4b8f', { boil: .3 });
    for (let k = 0; k < 6; k++) {
      const pts = [], pts2 = [];
      for (let j = 0; j <= 22; j++) { const u = j / 22, rr_ = R * (1 - u) * .92, a = k / 6 * TAU - u * 3.2 - t * 3.4; pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); const a2 = a - .45 * (1 - u * .7); pts2.push([Math.cos(a2) * rr_, Math.sin(a2) * rr_]); }
      fillOnly([...pts, ...pts2.reverse()], k % 2 ? '#7ff7ff' : '#2a6fc9', { boil: .4 });
    }
    // clock core with racing hands
    fillOnly(ell(0, 0, R * .34, R * .34, 28), '#f4fdff', { boil: .4 });
    const h = t * 40, m = t * 480;
    stroke([[0, 0], [Math.cos(m) * R * .28, Math.sin(m) * R * .28]], 5, { boil: .3 });
    stroke([[0, 0], [Math.cos(h) * R * .18, Math.sin(h) * R * .18]], 7, { boil: .3 });
  } });
  for (let i = 0; i < 12; i++) {   // orbiting sparks
    const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1));
    dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#9ff9ff' : '#ffffff');
  }
  pop();
}

// A pile of post on the floor (40 years of letters)
export function postPile(x, y, n = 18) {
  for (let i = 0; i < n; i++) {
    const px = x + (hash(i * 3.1) - .5) * 220, py = y - (i % 6) * 14 - Math.floor(i / 6) * 4, a = (hash(i * 7.7) - .5) * .8;
    push(); translate(px, py); rotate(a);
    shape(rect(-44, -26, 88, 52), { fill: i % 4 ? '#fdf6e3' : '#e6e0ff', lw: 5 }); stroke([[-44, -26], [0, 4], [44, -26]], 3);
    pop();
  }
}
export { cord };
