// sets.js — Sorin's workshop, the crowd of clones, the house from outside, the city, the furry planet.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands } from './toon.js';
import { cat } from './cast.js';

const X0 = -1600, X1 = 3600;
export function workshop(t, { dim = 0 } = {}) {
  fillOnly(rect(X0, -1400, X1 - X0, 2300), '#b9a7e8', { boil: 0 });
  // pegboard with tools
  shape(rr(120, 140, 560, 340, 10), { fill: '#d9b98a', lw: 7, shade: () => { for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) dot(150 + c * 54, 170 + r * 52, 4, '#a8875a'); } });
  stroke([[200, 200], [200, 330]], 9); shape(rr(180, 320, 40, 60, 8), { fill: '#e2523b', lw: 5 });          // screwdriver
  stroke([[320, 190], [380, 330]], 8); shape(ell(310, 180, 26, 18, 12), { fill: '#7a7f8a', lw: 5 });      // wrench
  shape(rr(460, 200, 140, 90, 10), { fill: '#3a7bd5', lw: 6 }); stroke([[480, 290], [480, 360]], 6);   // a saw-ish thing
  // window
  shape(rr(1480, 140, 340, 280, 14), { fill: '#9fd6f2', lw: 8, shade: () => bands(['#9fd6f2', '#b9e2f5', '#d3eef9'], 140, 420, 1480, 1820) });
  stroke([[1650, 140], [1650, 420]], 7); stroke([[1480, 280], [1820, 280]], 7);
  // hanging lamp
  stroke([[960, -100], [960, 80]], 5); shape([[880, 140], [1040, 140], [1000, 80], [920, 80]], { fill: '#f2c230', lw: 6 });
  // shelf, fridge, sink
  shape(rect(1460, 470, 380, 24), { fill: '#7a4a24', lw: 6 });
  shape(rr(1700, 500, 200, 360, 16), { fill: '#f2f2ee', lw: 7 }); stroke([[1700, 640], [1900, 640]], 6);
  shape(rect(-100, 640, 520, 220), { fill: '#8a6a50', lw: 7 }); shape(rect(-120, 620, 560, 30), { fill: '#c9b48a', lw: 6 });   // workbench
  // floor
  shape(rect(X0, 840, X1 - X0, 900), { fill: '#6b5a8a', lw: 6 });
  for (let x = -1600; x < 3600; x += 170) stroke([[x, 840], [x - 300, 1740]], 4, { line: '#5a4a78' });
  if (dim) fillOnly(rect(X0, -1400, X1 - X0, 3300), `rgba(20,10,40,${dim})`, { boil: 0 });
}

// Crowd slots in the workshop: back rows first (draw order), each [x, y, s, seed]. The first ones fill around the printer.
const SLOTS = (() => {
  const out = [];
  const add = (x, y, s) => out.push([x, y, s, out.length]);
  // floor rows, from front-of-printer outwards
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) add(1500 - c * 150 + (r % 2) * 70 + (hash(c + r * 9) - .5) * 40, 900 + r * 50, .55 + r * .08);
  // on the furniture: bench, shelf, fridge top, window sill, lamp, pegboard
  for (let c = 0; c < 4; c++) add(-40 + c * 130, 620, .5);
  for (let c = 0; c < 3; c++) add(1510 + c * 110, 470, .42);
  add(1800, 500, .5); add(960, 140, .38); add(1560, 420, .4); add(1720, 420, .4);
  for (let c = 0; c < 5; c++) add(180 + c * 110, 480, .42);
  // a second, higher layer piled on top of the floor rows
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) add(1600 - c * 160 + (r % 2) * 80, 760 - r * 110, .5 + (hash(c * 3 + r) - .5) * .1);
  return out;
})();
// draw n clones (sorted back to front), each popping in at its own time
export function crowd(t, n, { since = [], mo = 0, look = null, lw = 5, front = false } = {}) {
  const list = SLOTS.slice(0, Math.min(n, SLOTS.length)).sort((a, b) => a[1] - b[1]);
  for (const [x, y, s, i] of list) {
    if (front !== (y > 950)) { if (front) continue; else if (y > 950) continue; }
    const born = since[i] ?? -9, u = clamp((t - born) / .25);
    const pop_ = u < 1 ? 1 + Math.sin(u * Math.PI) * .25 : 1;
    const lk = look ?? [Math.sin(t * .7 + i) * .4, 0];
    cat(x, y, s * Math.min(1, u * 1.2 + .001) * pop_, { face: hash(i * 3.7) > .5 ? 1 : -1, tail: t * 3 + i, lid: .55, look: lk, mo: mo * (.6 + .4 * hash(i)), lw });
  }
}
export const SLOT_COUNT = SLOTS.length;

// the house from outside, overflowing with cats
export function exterior(t, fill = 1) {
  bands(['#7ec8e3', '#9dd6ea', '#bfe3f1', '#d8eef7'], -1600, 700, -3000, 5000);
  shape(rect(-3000, 700, 8000, 1200), { fill: '#6aa84f', lw: 6 });
  shape(rect(-3000, 880, 8000, 140), { fill: '#9aa3ad', lw: 6 });   // street
  // the house
  shape(rect(660, 300, 600, 420), { fill: '#f4a88a', lw: 8 });
  shape([[620, 310], [1300, 310], [960, 60]], { fill: '#c2563a', lw: 8 });
  shape(rect(1120, 90, 60, 140), { fill: '#7a4a24', lw: 6 });
  for (const [wx, wy] of [[720, 380], [1080, 380]]) shape(rr(wx, wy, 120, 110, 8), { fill: '#3a2a20', lw: 6 });
  shape(rr(900, 520, 120, 200, 8), { fill: '#3a2a20', lw: 6 });
  // cats: in the windows, the door, on the roof, out of the chimney, piling on the lawn and the street
  const spots = [[780, 480, .3], [1140, 480, .3], [960, 720, .35], [900, 700, .3], [1020, 700, .3], [960, 170, .28], [1150, 90, .3], [860, 250, .26], [1060, 250, .26], [760, 300, .26], [1180, 300, .26]];
  for (let i = 0; i < 40; i++) spots.push([300 + hash(i) * 1400, 760 + hash(i + 3) * 240, .22 + hash(i + 7) * .1]);
  const n = Math.floor(spots.length * fill);
  spots.slice(0, n).sort((a, b) => a[1] - b[1]).forEach(([x, y, s], i) => cat(x, y, s, { face: hash(i) > .5 ? 1 : -1, tail: t * 3 + i, lid: .6, lw: 4 }));
}
// the city, under a carpet of cats
export function city(t) {
  bands(['#ff9a5c', '#ffb37a', '#ffcc9c', '#ffe2c2'], -1600, 800, -3000, 5000);
  const B = [[-200, 300, 260], [80, 180, 220], [320, 380, 200], [540, 120, 240], [800, 260, 200], [1020, 60, 260], [1300, 220, 220], [1540, 340, 200], [1760, 150, 260], [2040, 300, 220]];
  for (const [x, top, w] of B) shape(rect(x, top, w, 1200), { fill: '#5a4a78', lw: 7, shade: () => { for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) fillOnly(rect(x + 30 + c * 60, top + 40 + r * 70, 30, 36), '#f2c230', { boil: .3 }); } });
  for (let i = 0; i < 120; i++) { const b = B[i % B.length]; cat(b[0] + hash(i) * b[2], b[1] + 10 + Math.floor(i / B.length) * 60 * hash(i + 2), .16 + hash(i + 5) * .06, { face: hash(i + 9) > .5 ? 1 : -1, lid: .6, lw: 3, tail: t * 3 + i }); }
  for (let i = 0; i < 90; i++) cat(-300 + i * 28, 1000 + (i % 3) * 30, .2, { face: i % 2 ? 1 : -1, lid: .6, lw: 3, tail: t * 3 + i });
}
// planet Earth, entirely furred, with two ears and a sleeping face
export function planet(t) {
  fillOnly(rect(-3000, -3000, 8000, 8000), '#0b1030', { boil: 0 });
  for (let i = 0; i < 160; i++) dot(-800 + hash(i) * 3600, -600 + hash(i + 3) * 2400, 2 + hash(i + 6) * 3, '#fff4c4');
  for (const sx of [-1, 1]) shape([[960 + sx * 140, 270], [960 + sx * 330, 40], [960 + sx * 380, 330]], { fill: '#8a9bb5', lw: 8, shade: () => fillOnly([[960 + sx * 170, 270], [960 + sx * 320, 90], [960 + sx * 350, 300]], '#ff8fa6', { boil: .3 }) });
  const N = 64, pts = [];
  for (let i = 0; i < N; i++) { const a = i / N * TAU, r = 380 + (i % 2 ? 22 : 0) + Math.sin(t * 2 + i) * 4; pts.push([960 + Math.cos(a) * r, 560 + Math.sin(a) * r]); }
  shape(pts, { fill: '#8a9bb5', lw: 8, shade: () => {
    fillOnly(ell(1080, 640, 300, 320, 30), '#6c7c96', { boil: .3 });
    for (let k = 0; k < 7; k++) stroke(spline([[700 + k * 80, 220], [720 + k * 80, 400], [700 + k * 80, 560]], false), 10, { line: '#5d6c85' });
  } });
  for (const ex of [860, 1060]) stroke(arc(ex, 560, 50, 26, Math.PI * .1, Math.PI * .9, 12), 9);
  shape([[945, 620], [975, 620], [960, 640]], { fill: '#ff8fa6', lw: 6 });
  stroke(quad_([930, 670], [945, 690], [960, 668]), 6); stroke(quad_([960, 668], [975, 690], [990, 670]), 6);
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) stroke([[960 + sx * 60, 650 + k * 14], [960 + sx * 220, 620 + k * 30]], 4);
  text('z', 1380 + Math.sin(t) * 10, 260 - (t * 40 % 80), { font: '800 80px "Baloo 2"', fill: '#fff4c4' });
}
function quad_(a, c, b) { const p = []; for (let i = 0; i <= 10; i++) { const t = i / 10, u = 1 - t; p.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return p; }
