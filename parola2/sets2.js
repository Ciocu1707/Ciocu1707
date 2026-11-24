// sets2.js — part 2 places: the wedding album, the attic, the cellar of pickle jars, the evidence board, the locked TV.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands } from './toon.js';
import { rex } from './cast.js';

// a wedding photo: a couple (or a cake, or a car) in a white-bordered print
export function photo(x, y, w, h, kind, a = 0) {
  push(); translate(x, y); rotate(a);
  shape(rect(-w / 2, -h / 2, w, h), { fill: '#fffaf0', lw: 6, shade: () => {
    fillOnly(rect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 50), kind === 'car' ? '#9fd6f2' : '#f4e6c8', { boil: .2 });
    if (kind === 'cake') {
      for (const [ty, tw, c] of [[60, 200, '#fff'], [10, 150, '#ffd6e0'], [-34, 100, '#fff']]) shape(rr(-tw / 2, ty - 20, tw, 50, 8), { fill: c, lw: 5 });
      shape(rr(-74, 34, 148, 40, 8), { fill: '#ffe066', lw: 4 }); text('1500 LEI', 0, 56, { font: '400 30px Bungee', fill: '#c2563a' });
      for (const sx of [-1, 1]) { shape(ell(sx * 14, -78, 10, 12, 10), { fill: '#f0c49a', lw: 3 }); shape(rr(sx * 14 - 10, -66, 20, 26, 6), { fill: sx < 0 ? '#2b2230' : '#fff', lw: 3 }); }
    } else if (kind === 'car') {
      shape(rr(-150, -10, 300, 80, 24), { fill: '#e2523b', lw: 6 }); shape(rr(-90, -60, 180, 60, 20), { fill: '#e2523b', lw: 6 });
      for (const wx of [-90, 90]) shape(ell(wx, 70, 30, 30, 18), { fill: '#2b2230', lw: 5 });
      shape(rr(-60, 30, 120, 34, 4), { fill: '#fff', lw: 4 }); text('B 87 VEC', 0, 48, { font: '400 24px Bungee', fill: INK });
      text('VECINUL', 120, -80, { font: '800 18px "Baloo 2"', fill: '#7a4a24' });
    } else if (kind === 'rex') { rex(-60, 60, .5, { face: 1 }); }
    else if (kind === 'couple') { for (const [px, c] of [[-40, '#2b2230'], [40, '#ffffff']]) { shape(ell(px, -20, 26, 28, 14), { fill: '#f0c49a', lw: 4 }); shape(rr(px - 34, 10, 68, 70, 12), { fill: c, lw: 4 }); } }
  } });
  pop();
}
export function album(t, page) {
  bands(['#7a4a24', '#8a5a34'], -400, 1400, -2000, 4000);
  shape(rr(160, 120, 1600, 860, 20), { fill: '#3a7bd5', lw: 8 });
  for (const sx of [0, 1]) shape(rect(200 + sx * 760, 150, 760, 800), { fill: '#fff6e0', lw: 6 });
  stroke([[960, 150], [960, 950]], 8);
  if (page === 0) { photo(580, 520, 520, 600, 'cake', -.03); text('Nunta noastră ♥', 1340, 260, { font: '800 44px "Baloo 2"', fill: '#c2563a' }); photo(1340, 600, 460, 520, 'couple', .04); }
  else { photo(580, 540, 600, 520, 'car', .02); photo(1340, 540, 460, 520, 'rex', -.04); }
}
// the attic: beams, boxes, a trapdoor in the floor
export function attic(t, { dust = 0 } = {}) {
  fillOnly(rect(-2000, -1400, 6000, 3400), '#3a2a2a', { boil: 0 });
  shape([[-200, 900], [960, 60], [2120, 900]], { fill: '#6a4a3a', lw: 8, shade: () => { for (let k = 0; k < 8; k++) stroke([[-200 + k * 300, 900], [960, 60]], 6, { line: '#4a3226' }); } });
  shape(rect(-400, 860, 2800, 400), { fill: '#7a5a40', lw: 7 });
  for (const [x, y, w, h, l] of [[300, 640, 260, 220, 'CRĂCIUN'], [1340, 600, 300, 260, 'ACTE'], [1560, 700, 200, 160, 'HAINE']]) { shape(rect(x, y, w, h), { fill: '#c49a6a', lw: 6, shade: () => stroke([[x, y + 30], [x + w, y + 30]], 4, { line: '#a8804e' }) }); text(l, x + w / 2, y + h / 2 + 10, { font: '400 30px Bungee', fill: '#7a4a24' }); }
  shape(rect(820, 860, 280, 40), { fill: '#1b1422', lw: 6 });   // the trapdoor
  if (dust > 0) for (let i = 0; i < 18; i++) { const a = hash(i) * TAU, r = dust * (100 + hash(i + 2) * 200); shape(ell(960 + Math.cos(a) * r, 760 + Math.sin(a) * r * .5, 40 + hash(i) * 40, 30 + hash(i) * 30, 14), { fill: `rgba(200,190,170,${.6 * (1 - dust * .7)})`, lw: 3 }); }
  for (let i = 0; i < 20; i++) dot((hash(i) * 1920 + t * 15) % 1920, hash(i + 5) * 800 + Math.sin(t + i) * 15, 3, 'rgba(255,240,200,.45)');
}
export function paper(t) {
  bands(['#3a2a2a', '#4a3434'], -400, 1400, -2000, 4000);
  push(); translate(960, 520); rotate(-.04);
  shape(rect(-420, -300, 840, 600), { fill: '#fffaf0', lw: 8, shade: () => { for (let k = 0; k < 8; k++) stroke([[-360, -60 + k * 40], [360, -60 + k * 40]], 3, { line: '#d9cfb8' }); } });
  text('CERTIFICAT DE GARANȚIE', 0, -220, { font: '400 44px Bungee', fill: '#3a7bd5' });
  text('Frigider „Arctic”', 0, -150, { font: '800 40px "Baloo 2"', fill: INK });
  text('Cumpărat: 1991', 0, -90, { font: '800 48px "Baloo 2"', fill: '#e2523b' });
  text('(cadou de nuntă)', 0, -40, { font: '800 32px "Baloo 2"', fill: '#7a4a24' });
  pop();
}
// the cellar: shelves of pickle jars with years on them; 1991 is missing
export const JARS = [1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992];
export function cellar(t, { gone = false } = {}) {
  fillOnly(rect(-2000, -1400, 6000, 3400), '#2b2a3a', { boil: 0 });
  for (let r = 0; r < 2; r++) {
    shape(rect(120, 400 + r * 260, 1680, 24), { fill: '#7a4a24', lw: 6 });
    JARS.forEach((y, i) => {
      if (y === 1991 && gone) return;
      const x = 200 + i * 205, yy = 400 + r * 260;
      shape(rr(x - 60, yy - 170, 120, 170, 20), { fill: 'rgba(170,210,120,.75)', lw: 6, shade: () => { for (let k = 0; k < 4; k++) shape(ell(x - 30 + (k % 2) * 50, yy - 130 + Math.floor(k / 2) * 60, 20, 30, 12), { fill: '#6a9a3a', lw: 3 }); } });
      shape(rr(x - 64, yy - 190, 128, 30, 8), { fill: '#e2523b', lw: 5 });
      shape(rect(x - 50, yy - 110, 100, 40), { fill: '#fffaf0', lw: 4 }); text(String(y + r * 10 * 0), x, yy - 88, { font: '400 28px Bungee', fill: INK });
    });
  }
  shape(rect(-400, 860, 2800, 400), { fill: '#4a4458', lw: 7 });
  fillOnly(ell(960, 300, 500, 360, 30), 'rgba(255,240,180,.08)', { boil: 0 });
}
export function jarLabel(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(rr(-60, -170, 120, 170, 20), { fill: 'rgba(170,210,120,.85)', lw: 6 });
  shape(rr(-64, -190, 128, 30, 8), { fill: '#e2523b', lw: 5 });
  shape(rect(-50, -110, 100, 40), { fill: '#fffaf0', lw: 4 }); text('1991', 0, -88, { font: '400 28px Bungee', fill: INK });
  pop();
}
// the evidence board: cork, pinned clues, red strings (they fall when Rex runs off tangled)
const CLUES = [[420, 300, 'cake'], [760, 260, 'car'], [1100, 320, 'rex'], [560, 600, 'warranty'], [960, 620, 'jar'], [1300, 600, 'couple']];
export function board(t, { pinned = 6, fall = 0, strings = 1 } = {}) {
  shape(rect(240, 120, 1340, 700), { fill: '#c49a6a', lw: 8, shade: () => { for (let i = 0; i < 80; i++) dot(260 + hash(i) * 1300, 140 + hash(i + 3) * 660, 3, '#a8804e'); } });
  const pos = CLUES.map(([x, y], i) => [x, y + fall * (300 + i * 60), fall * (hash(i) - .5) * 1.4]);
  if (strings > 0 && fall < .5) for (const [a, b] of [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [1, 4], [0, 5]]) if (a < pinned && b < pinned) stroke([pos[a].slice(0, 2), [(pos[a][0] + pos[b][0]) / 2, (pos[a][1] + pos[b][1]) / 2 + 30], pos[b].slice(0, 2)], 5, { line: '#e8283c' });
  CLUES.slice(0, pinned).forEach(([, , k], i) => {
    const [x, y, a] = pos[i];
    if (k === 'warranty') { push(); translate(x, y); rotate(a - .05); shape(rect(-120, -80, 240, 160), { fill: '#fffaf0', lw: 5 }); text('GARANȚIE', 0, -40, { font: '400 24px Bungee', fill: '#3a7bd5' }); text('1991', 0, 10, { font: '400 40px Bungee', fill: '#e2523b' }); pop(); }
    else if (k === 'jar') { push(); translate(x, y + 90); rotate(a); jarLabel(0, 0, .8); pop(); }
    else photo(x, y, 240, 200, k, a + (hash(i) - .5) * .1);
    dot(x, y - 90 + fall * 0, 12, '#e8283c');
  });
}
