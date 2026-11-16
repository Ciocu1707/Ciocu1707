// sets.js — the living room, the eras behind the sofa, the sofa and the TV that travel with Ilinca, the dinosaur, the soap opera.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands, noodle } from './toon.js';
import { eye, mouth } from './chars.js';
import { kitchen } from './worlds.js';

const X0 = -1600, X1 = 3600;
const floor = (col, line, y = 840) => { shape(rect(X0, y, X1 - X0, 900), { fill: col, lw: 6 }); for (let x = -1600; x < 3600; x += 170) stroke([[x, y], [x - 300, y + 900]], 4, { line }); };

export function world(name, t) {
  if (name === 'acasa') {
    fillOnly(rect(X0, -1400, X1 - X0, 2300), '#f4a88a', { boil: 0 });
    for (let x = -1500; x < 3500; x += 140) fillOnly(rect(x, -1400, 56, 2260), '#ec9a7b', { boil: 0 });
    shape(rr(1460, 150, 360, 300, 14), { fill: '#9fd6f2', lw: 8, shade: () => bands(['#9fd6f2', '#b9e2f5', '#d3eef9'], 150, 450, 1460, 1820) });
    stroke([[1640, 150], [1640, 450]], 7); stroke([[1460, 300], [1820, 300]], 7);
    shape(rr(660, 120, 300, 210, 8), { fill: '#f2c230', lw: 7, shade: () => fillOnly(rect(684, 144, 252, 162), '#fff6e0', { boil: .2 }) });   // a framed photo
    text('NUNTA 1989', 810, 230, { font: '800 30px "Baloo 2"', fill: '#c2563a' });
    shape(rect(1270, 300, 18, 540), { fill: '#3a2a20', lw: 5 }); shape([[1200, 300], [1360, 300], [1320, 200], [1240, 200]], { fill: '#ffe066', lw: 6 });   // lamp
    floor('#8a5a3c', '#734a30');
    shape(ell(860, 950, 620, 80, 40), { fill: '#c2563a', lw: 6, shade: () => stroke(ell(860, 950, 520, 60, 40), 4, { line: '#e88a6a' }) });
  } else if (name === 'dino') {
    bands(['#ff9a3c', '#ffb062', '#ffc78a', '#ffdcb0'], -800, 700);
    shape([[-200, 840], [400, 160], [560, 120], [700, 180], [1200, 840]], { fill: '#6a3fa0', lw: 7, shade: () => fillOnly([[540, 116], [580, 116], [640, 300], [500, 280]], '#e2523b', { boil: .4 }) });
    for (let i = 0; i < 3; i++) { const u = (t * .4 + i / 3) % 1; shape(ell(560 + Math.sin(i * 2 + t) * 30, 80 - u * 260, 40 + u * 50, 30 + u * 40, 16), { fill: `rgba(120,110,120,${.7 * (1 - u)})`, lw: 4, alpha: 1 - u }); }
    for (let i = 0; i < 12; i++) { const x = -200 + i * 200 + hash(i) * 60; shape(spline([[x, 840], [x - 80, 560], [x - 10, 640], [x + 10, 500], [x + 40, 640], [x + 110, 560], [x + 40, 840]]), { fill: i % 2 ? '#2e7d32' : '#43a047', lw: 6 }); }
    floor('#8b6a3e', '#735530');
  } else if (name === 'roma') {
    bands(['#7ec8e3', '#9dd6ea', '#bfe3f1'], -800, 700);
    shape([[300, 300], [1500, 300], [900, 120]], { fill: '#c4572e', lw: 7 });
    shape(rect(300, 300, 1200, 60), { fill: '#f7f2e6', lw: 7 });
    for (let i = 0; i < 6; i++) shape(rect(340 + i * 220, 360, 80, 480), { fill: '#f7f2e6', lw: 7, shade: () => { for (let k = 1; k < 4; k++) stroke([[340 + i * 220 + k * 20, 360], [340 + i * 220 + k * 20, 840]], 3, { line: '#d9cfb8' }); } });
    floor('#e8cf9e', '#d4b884');
  } else if (name === 'gheata') {
    bands(['#bfe8ff', '#d4f0ff', '#e8f8ff'], -800, 700);
    for (const [x, w, h] of [[-100, 500, 400], [500, 400, 300], [1300, 600, 460]]) shape([[x, 840], [x + w * .3, 840 - h], [x + w * .6, 840 - h * .8], [x + w, 840]], { fill: '#ffffff', lw: 7, shade: () => fillOnly([[x + w * .45, 840 - h], [x + w, 840], [x + w * .6, 840]], '#cfe6f5', { boil: .3 }) });
    floor('#f4fbff', '#d8eaf5');
    for (let i = 0; i < 30; i++) dot((hash(i) * 2200 + t * 60) % 2200 - 100, (hash(i + 7) * 900 + t * 120) % 900, 5, '#ffffff');
  } else if (name === 'disco') {
    fillOnly(rect(X0, -1400, X1 - X0, 2300), '#2a1458', { boil: 0 });
    for (let i = 0; i < 10; i++) { const a = Math.PI * (.22 + i * .062) + Math.sin(t * 3 + i) * .05; fillOnly([[960, 60], [960 + Math.cos(a - .035) * 1700, 60 + Math.sin(a - .035) * 1700], [960 + Math.cos(a + .035) * 1700, 60 + Math.sin(a + .035) * 1700]], ['rgba(255,63,164,.28)', 'rgba(255,224,102,.28)', 'rgba(140,255,90,.22)'][i % 3], { boil: 0 }); }
    shape(ell(960, 60, 80, 80, 30), { fill: '#d9dde6', lw: 7, shade: () => { for (let k = -3; k <= 3; k++) { stroke([[880, 60 + k * 22], [1040, 60 + k * 22]], 3, { line: '#9aa0ad' }); stroke([[960 + k * 22, -20], [960 + k * 22, 140]], 3, { line: '#9aa0ad' }); } } });
    for (let r = 0; r < 4; r++) for (let c = -6; c < 16; c++) { const on = (r + c + Math.floor(t * 8)) % 3 === 0; shape([[c * 160 + r * 40, 840 + r * 70], [c * 160 + 160 + r * 40, 840 + r * 70], [c * 160 + 160 + (r + 1) * 40, 910 + r * 70], [c * 160 + (r + 1) * 40, 910 + r * 70]], { fill: on ? ['#ff3fa4', '#ffe066', '#3fd0ff'][(r + c + 9) % 3] : '#4b2a8f', lw: 4 }); }
  } else if (name === 'pirati') {
    bands(['#7ec8e3', '#9dd6ea', '#bfe3f1'], -800, 520);
    shape(rect(X0, 520, X1 - X0, 330), { fill: '#1f5f9a', lw: 6, shade: () => { for (let i = 0; i < 20; i++) stroke(arc(-200 + i * 140 + Math.sin(t * 2 + i) * 20, 600 + (i % 3) * 70, 40, 14, Math.PI, TAU, 8), 4, { line: '#bfe3f1' }); } });
    shape(rect(1500, -200, 40, 1040), { fill: '#7a4a24', lw: 6 });
    shape(spline([[1540, -120], [1820, -60], [1860, 260], [1540, 300]]), { fill: '#f7f2e6', lw: 7 });
    shape(rr(1560, -260, 140, 90, 6), { fill: '#1b1422', lw: 5 }); dot(1630, -215, 18, '#f7f2e6');
    floor('#a8763e', '#8a5f30');
  } else if (name === 'spatiu') {
    fillOnly(rect(X0, -1400, X1 - X0, 2900), '#10183a', { boil: 0 });
    for (let i = 0; i < 70; i++) dot(hash(i) * 2000 - 40, hash(i + 3) * 1100 - 20, 2 + hash(i + 5) * 3, '#fff4c4');
    shape(ell(1550, 260, 150, 150, 40), { fill: '#e2a72e', lw: 7, shade: () => { fillOnly(ell(1610, 300, 120, 130, 30), '#c4852a', { boil: .3 }); for (let k = 0; k < 3; k++) stroke([[1400, 220 + k * 40], [1700, 230 + k * 40]], 6, { line: '#f2c230' }); } });
    stroke(ell(1550, 260, 260, 50, 40), 10, { line: '#f7f2e6' });
  } else if (name === 'an3000') {
    kitchen('an3000', t);
  }
}

// —— the sofa (it travels): back before Ilinca, seat cushion after, so her legs sit inside it ——
const SOFA = '#3a5bc7', SOFAS = '#2a4497';
export function sofaBack(x = 860) {
  shape(rr(x - 340, 470, 680, 280, 40), { fill: SOFA, lw: 7, shade: () => { fillOnly(rect(x + 120, 460, 240, 300), SOFAS, { boil: .3 }); stroke([[x, 500], [x, 720]], 4, { line: SOFAS }); } });
}
export function sofaFront(x = 860) {
  shape(rr(x - 300, 700, 600, 150, 30), { fill: SOFA, lw: 7, shade: () => fillOnly(rect(x - 300, 800, 600, 60), SOFAS, { boil: .3 }) });
  for (const sx of [-1, 1]) shape(rr(x + sx * 330 - 50, 590, 100, 270, 40), { fill: SOFA, lw: 7, shade: () => fillOnly(rect(x + sx * 330 + 10, 580, 50, 290), SOFAS, { boil: .3 }) });
  for (const sx of [-1, 1]) shape(rect(x + sx * 300 - 12, 850, 24, 40), { fill: '#3a2a20', lw: 5 });
}

// —— the old CRT TV on a stand: screen = 'static' | 'novela' | 'off' ——
export const TVS = { x: 300, y: 600, w: 300, h: 230 };   // screen rectangle (world)
export function tv(t, screen = 'static') {
  shape(rect(250, 820, 280, 80), { fill: '#7a4a24', lw: 6 });
  stroke([[300, 900], [300, 960]], 8); stroke([[480, 900], [480, 960]], 8);
  stroke([[360, 540], [300, 430]], 5); stroke([[420, 540], [500, 440]], 5); dot(300, 430, 8); dot(500, 440, 8);
  shape(rr(210, 530, 360, 300, 30), { fill: '#b98a5a', lw: 7, shade: () => fillOnly(rect(470, 520, 120, 320), '#9a6f45', { boil: .3 }) });
  screenArt(t, screen, TVS.x - 80, TVS.y - 40, TVS.w - 70, TVS.h - 40);
  shape(ell(530, 640, 14, 14, 12), { fill: '#3a2a20', lw: 4 }); shape(ell(530, 700, 14, 14, 12), { fill: '#3a2a20', lw: 4 });
}
export function screenArt(t, screen, x, y, w, h) {
  shape(rr(x, y, w, h, 24), { fill: '#2b3a2e', lw: 7, shade: () => {
    if (screen === 'static') { const f = Math.floor(t * 24); for (let i = 0; i < 90; i++) { const a = hash(i * 7.1 + f), b = hash(i * 3.3 + f * 1.7); fillOnly(rect(x + a * w, y + b * h, 10 + hash(i + f) * 26, 4), hash(i + f * 2) > .5 ? '#e8f0e8' : '#5c6b5e', { boil: 0 }); } }
    if (screen === 'novela') novela(t, x, y, w, h);
  } });
}
// the soap opera, drawn to fill the screen rectangle (lip sync passed in through `o`)
export let NOVELA_O = 0;
export const setNovelaO = v => { NOVELA_O = v; };
function novela(t, x, y, w, h) {
  push(); translate(x, y); scale(w / 600, h / 400);
  fillOnly(rect(0, 0, 600, 400), '#8a1f3a', { boil: 0 });
  for (let i = 0; i < 6; i++) fillOnly(rect(i * 100, 0, 46, 400), '#a8284a', { boil: .3 });
  // the woman (left): shocked
  shape(ell(170, 220, 70, 80, 30), { fill: '#f0c49a', lw: 6 });
  shape(spline([[90, 180], [110, 110], [180, 90], [250, 120], [260, 200], [240, 160], [170, 140], [110, 170]]), { fill: '#1b1422', lw: 6 });
  shape(ell(240, 150, 20, 20, 12), { fill: '#e2523b', lw: 4 });
  eye(150, 210, 16, 20, { pupil: 3, skin: '#f0c49a', lw: 4 }); eye(196, 210, 16, 20, { pupil: 3, skin: '#f0c49a', lw: 4 });
  mouth(172, 262, 30, { o: .7, sm: -.3, lw: 4, teeth: false });
  // the man (right): pompadour, moustache, dramatic
  shape(ell(420, 230, 76, 86, 30), { fill: '#d9a57c', lw: 6 });
  shape(spline([[340, 190], [350, 110], [430, 70], [510, 110], [500, 190], [470, 150], [400, 140]]), { fill: '#3b2416', lw: 6 });
  eye(394, 220, 16, 14, { lid: .4, pupil: 3, skin: '#d9a57c', lw: 4, look: [-.7, 0] }); eye(442, 220, 16, 14, { lid: .4, pupil: 3, skin: '#d9a57c', lw: 4, look: [-.7, 0] });
  shape(spline([[380, 262], [420, 250], [460, 262], [440, 276], [420, 268], [400, 276]]), { fill: '#3b2416', lw: 4 });
  mouth(420, 288, 34, { o: NOVELA_O, sm: -.2, lw: 4 });
  shape(rect(330, 320, 180, 80), { fill: '#f7f2e6', lw: 6 });
  pop();
}

// —— the dinosaur: a long neck from top right, licking Doru's colander ——
export function dino(t, up, lick) {
  if (up <= 0) return;
  push(); translate(0, (1 - up) * 700);
  shape(noodle([2200, 1000], [1640, 160], -160, 230, 150), { fill: '#7cc243', lw: 8, shade: () => { for (let i = 0; i < 6; i++) fillOnly(ell(1800 + i * 50, 300 + i * 120, 30, 20, 12), '#5a9a2c', { boil: .3 }); } });
  push(); translate(1600, 140); rotate(-.2 + lick * .25);
  shape(spline([[-160, 10], [-120, -70], [40, -90], [120, -40], [110, 40], [-60, 70], [-150, 60]]), { fill: '#7cc243', lw: 8, shade: () => fillOnly(ell(40, 30, 90, 40, 20), '#5a9a2c', { boil: .3 }) });
  eye(30, -46, 26, 24, { pupil: 5, skin: '#7cc243', lw: 6, look: [-.6, .5] });
  if (lick > 0) shape(noodle([-140, 40], [-190 - lick * 30, 120 + lick * 40], 30, 46, 40), { fill: '#ff7fa6', lw: 6 });
  for (let i = 0; i < 5; i++) shape([[-140 + i * 26, 46], [-128 + i * 26, 70], [-116 + i * 26, 46]], { fill: '#fffaf0', lw: 4 });
  dot(-120, -20, 6);
  pop(); pop();
}
