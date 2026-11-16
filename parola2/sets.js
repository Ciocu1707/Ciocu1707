// sets.js — the living room, the TV login screen with its on-screen keyboard, Tata's brain (an archive).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands } from './toon.js';
import { eye, mouth } from './cast.js';

const X0 = -1600, X1 = 3600;
export const TV = { x: 150, y: 190, w: 600, h: 360 };
export const KEYS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ⌫'];

// day 0 → 1 cycles the window's sky (used in the time lapse)
export function room(t, { day = 0, clock = 0, photo = 0 } = {}) {
  fillOnly(rect(X0, -1400, X1 - X0, 2300), '#a7c47a', { boil: 0 });
  for (let r = 0; r < 14; r++) for (let c = -8; c < 30; c++) fillOnly([[c * 120 + (r % 2) * 60, r * 80 - 200], [c * 120 + 30 + (r % 2) * 60, r * 80 - 160], [c * 120 + (r % 2) * 60, r * 80 - 120], [c * 120 - 30 + (r % 2) * 60, r * 80 - 160]], '#95b268', { boil: 0 });
  // window, sky by time of day
  const night = .5 - .5 * Math.cos(day * TAU);
  const sky = [lerpCol('#9fd6f2', '#141c44', night), lerpCol('#b9e2f5', '#1c2658', night), lerpCol('#d3eef9', '#28326c', night)];
  shape(rr(1100, 150, 300, 280, 12), { fill: sky[0], lw: 8, shade: () => { bands(sky, 150, 430, 1100, 1400); if (night > .5) { shape(ell(1330, 210, 26, 26, 20), { fill: '#fff4c4', lw: 5 }); } else shape(ell(1150 + day * 600 % 240, 200, 30, 30, 20), { fill: '#ffe066', lw: 5 }); } });
  stroke([[1250, 150], [1250, 430]], 7); stroke([[1100, 290], [1400, 290]], 7);
  // wall clock
  shape(ell(960, 110, 60, 60, 30), { fill: '#fffaf0', lw: 7 });
  stroke([[960, 110], [960 + Math.cos(clock * 12 - 1.57) * 44, 110 + Math.sin(clock * 12 - 1.57) * 44]], 5);
  stroke([[960, 110], [960 + Math.cos(clock - 1.57) * 28, 110 + Math.sin(clock - 1.57) * 28]], 7); dot(960, 110, 7);
  // the wedding photo above the sofa (it falls at the end)
  push(); translate(1540, 210 + photo * 560); rotate(photo * .5);
  shape(rr(-120, -80, 240, 170, 8), { fill: '#f2c230', lw: 7, shade: () => {
    fillOnly(rect(-100, -60, 200, 130), '#fff6e0', { boil: .2 });
    for (const [px, c] of [[-40, '#2b2230'], [40, '#ffffff']]) { shape(ell(px, -10, 22, 24, 14), { fill: '#f0c49a', lw: 4 }); shape(rr(px - 30, 14, 60, 60, 12), { fill: c, lw: 4 }); }
    text('NUNTA', 0, 58, { font: '800 18px "Baloo 2"', fill: '#c2563a' });
  } });
  if (photo > 0) stroke([[-90, -60], [90, 70]], 4); if (photo > 0) stroke([[60, -60], [-40, 70]], 4);
  pop();
  // kitchen doorway (right edge)
  shape(rect(1760, 120, 260, 740), { fill: '#f4e6c8', lw: 7 }); fillOnly(rect(1780, 140, 240, 720), '#fff6e0', { boil: 0 });
  // floor + rug
  shape(rect(X0, 860, X1 - X0, 900), { fill: '#8a5a3c', lw: 6 });
  for (let x = -1600; x < 3600; x += 170) stroke([[x, 860], [x - 300, 1760]], 4, { line: '#734a30' });
  shape(ell(900, 960, 560, 70, 40), { fill: '#3a7bd5', lw: 6, shade: () => stroke(ell(900, 960, 470, 52, 40), 4, { line: '#6aa0ea' }) });
  // sofa (behind, right)
  shape(rr(1300, 560, 440, 220, 40), { fill: '#e2a72e', lw: 7 });
  shape(rr(1310, 740, 420, 120, 30), { fill: '#e2a72e', lw: 7, shade: () => fillOnly(rect(1310, 820, 420, 50), '#c4852a', { boil: .3 }) });
  // TV cabinet
  shape(rect(100, 600, 700, 260), { fill: '#7a4a24', lw: 7, shade: () => { stroke([[450, 600], [450, 860]], 5); dot(420, 730, 7); dot(480, 730, 7); } });
}
export function sofaArmFront() { shape(rr(1680, 640, 90, 230, 30), { fill: '#e2a72e', lw: 7 }); }
function lerpCol(a, b, u) { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join(''); }

// —— the TV: a generic streaming login screen ——
export function tvSet(t, { field = '', state = '', cursor = -1, tries = 3, dust = 0 } = {}) {
  const { x, y, w, h } = TV;
  shape(rr(x - 20, y - 20, w + 40, h + 40, 16), { fill: '#2b2230', lw: 7 });
  shape(rect(x, y, w, h), { fill: '#121426', lw: 4, shade: () => {
    text('STREAM+', x + 70, y + 34, { font: '400 30px Bungee', fill: '#e8283c' });
    text('Introduceți parola', x + w / 2, y + 86, { font: '800 30px "Baloo 2"', fill: '#ffffff' });
    shape(rr(x + 90, y + 112, w - 180, 54, 10), { fill: state === 'gresit' ? '#4a1420' : '#23263c', lw: 4, line: state === 'gresit' ? '#e8283c' : '#8a8fa8' });
    text(field + (Math.floor(t * 2) % 2 ? '|' : ''), x + 110, y + 140, { font: '400 38px VT323', fill: '#ffffff', align: 'left' });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
      const i = r * 9 + c, kx = x + 80 + c * 50, ky = y + 190 + r * 50;
      shape(rr(kx, ky, 42, 40, 6), { fill: i === cursor ? '#e8283c' : '#2f3350', lw: 3, line: '#8a8fa8' });
      text(KEYS[r][c], kx + 21, ky + 22, { font: '800 22px "Baloo 2"', fill: '#fff' });
    }
    if (state === 'gresit') { shape(rr(x + 60, y + 330, w - 120, 0.1 + 26, 6), { fill: '#e8283c', lw: 3 }); text('PAROLĂ GREȘITĂ', x + w / 2, y + 344, { font: '800 22px "Baloo 2"', fill: '#fff' }); }
    if (state === 'ultima') text('Încercări rămase: 1', x + w / 2, y + 344, { font: '800 24px "Baloo 2"', fill: '#ffb020' });
    if (state === 'blocat') {   // the whole screen goes red: account locked
      fillOnly(rect(x, y, w, h), '#8a1020', { boil: 0 });
      shape(rr(x + w / 2 - 50, y + 90, 100, 90, 14), { fill: '#f2c230', lw: 6 }); stroke(arc(x + w / 2, y + 90, 34, 40, Math.PI, TAU, 12), 12);
      text('CONT BLOCAT', x + w / 2, y + 240, { font: '400 48px Bungee', fill: '#fff' });
      text('Încercați din nou peste 24 de ore.', x + w / 2, y + 300, { font: '800 26px "Baloo 2"', fill: '#ffd6dc' });
    }
  } });
  if (dust > 0) for (let i = 0; i < 30 * dust; i++) dot(x + hash(i) * w, y + hash(i + 3) * h, 3, 'rgba(200,190,160,.8)');
  shape(rect(x + w / 2 - 40, y + h + 20, 80, 30), { fill: '#2b2230', lw: 5 });
}
export const keyPos = i => [TV.x + 80 + (i % 9) * 50 + 21, TV.y + 190 + Math.floor(i / 9) * 50 + 20];

// —— inside Tata's head: a dusty archive, a tiny clerk-Tata with a ladder ——
export const DRAWERS = [
  ['MECIURI 1986', 300, 620], ['PREȚUL PÂINII', 300, 460], ['UNDE SUNT CHEILE?', 300, 300],
  ['VERSURI DE MANELE', 960, 620], ['CĂRȚI DE TELEFON', 960, 460], ['REȚETE', 960, 300],
  ['PAROLE', 1620, 620], ['ANI', 1620, 460], ['NUNTA', 1620, 140],
];
export function brain(t, { open = -1, moth = -1 } = {}) {
  bands(['#4a2a3a', '#5a3448', '#6a3e56'], -400, 1400, -2000, 4000);
  for (const cx of [300, 960, 1620]) {
    shape(rect(cx - 230, 40, 460, 860), { fill: '#7a4a24', lw: 8, shade: () => fillOnly(rect(cx + 150, 30, 90, 880), '#5c361a', { boil: .3 }) });
  }
  DRAWERS.forEach(([label, x, y], i) => {
    const o = i === open ? 1 : 0;
    shape(rr(x - 200, y - 60 + o * 20, 400, 120, 10), { fill: '#a8643a', lw: 6, shade: () => fillOnly(rect(x + 120, y - 70, 90, 140), '#8a4f2e', { boil: .3 }) });
    shape(rr(x - 140, y - 30 + o * 20, 280, 50, 6), { fill: '#fff6e0', lw: 4 });
    text(label, x, y - 4 + o * 20, { font: '800 24px "Baloo 2"', fill: INK });
    shape(rr(x - 30, y + 30 + o * 20, 60, 18, 8), { fill: '#c4952e', lw: 4 });
  });
  // cobwebs + dust motes
  for (const [cx, cy] of [[70, 40], [1850, 40]]) for (let k = 1; k <= 3; k++) stroke(arc(cx, cy, 60 * k, 60 * k, cx < 900 ? 0 : Math.PI / 2, cx < 900 ? Math.PI / 2 : Math.PI, 10), 3, { line: 'rgba(255,255,255,.5)' });
  for (let i = 0; i < 24; i++) dot((hash(i) * 1920 + t * 20) % 1920, (hash(i + 4) * 1080 + Math.sin(t + i) * 20), 3, 'rgba(255,240,200,.5)');
  if (moth >= 0) { const mx = 1620 + moth * 300, my = 140 - moth * 200 + Math.sin(moth * 20) * 30; push(); translate(mx, my); for (const sx of [-1, 1]) shape(ell(sx * 22, Math.sin(t * 30) * 6, 22, 14, 12), { fill: '#d9cfb8', lw: 4 }); shape(ell(0, 0, 8, 16, 10), { fill: '#8a7a6a', lw: 4 }); pop(); }
}
// the tiny clerk: a small Tata in a visor and sleeve garters
export function clerk(x, y, s, { t = 0, walk = false, shrug = 0, look = [0, 0], up = false } = {}) {
  push(); translate(x, y); scale(s);
  const ph = walk ? t * 14 : 0;
  for (const [sx, o] of [[-1, 0], [1, Math.PI]]) { stroke([[sx * 20, -120], [sx * 22 + Math.sin(ph + o) * 18, -10]], 16, { line: '#5a5f6a' }); shape(ell(sx * 24 + Math.sin(ph + o) * 18, -6, 22, 10, 10), { fill: '#2b2230', lw: 4 }); }
  shape(ell(0, -190, 70, 90, 24), { fill: '#f4f1ea', lw: 6, shade: () => fillOnly(rect(-12, -270, 24, 100), '#e2523b', { boil: .3 }) });
  for (const sx of [-1, 1]) { const ay = up ? -320 : -170 - shrug * 80; stroke([[sx * 60, -240], [sx * (90 + shrug * 20), ay]], 16, { line: '#f4f1ea' }); shape(ell(sx * (90 + shrug * 20), ay, 14, 14, 10), { fill: '#f0c49a', lw: 4 }); }
  push(); translate(0, -320);
  shape(ell(0, 0, 60, 64, 24), { fill: '#f0c49a', lw: 6 });
  shape(arc(0, -24, 66, 30, Math.PI, TAU, 14).concat([[66, -24], [-66, -24]]), { fill: '#3aa35a', lw: 5 });   // green visor
  eye(-20, 4, 14, 15, { pupil: 3.5, look, lw: 5 }); eye(22, 4, 12, 14, { pupil: 3.5, look, lw: 5 });
  stroke(rr(-38, -8, 34, 26, 8), 4); stroke(rr(4, -8, 32, 24, 8), 4);
  mouth(4, 38, 24, { o: 0, sm: shrug ? -.6 : -.2, lw: 4 });
  pop();
  pop();
}
