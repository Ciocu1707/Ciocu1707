// sets3.js — part 3 screens: the reset flow on the TV, the 2004 laptop, the inbox, the captchas, the profiles, the film.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands } from './toon.js';
import { rex, eye } from './cast.js';
import { TV, tvSet } from './sets.js';

const spinner = (cx, cy, r, t, col = '232,40,60') => { const k = Math.floor(t * 12) % 8; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, f = ((i - k + 8) % 8) / 8; dot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * .22, `rgba(${col},${.12 + .85 * (1 - f)})`); } };
// the TV in the reset flow (the frame comes from tvSet; we paint over the screen)
export function tvScreen(t, kind, { typed = '', cursor = -1, pick = -1 } = {}) {
  if (kind === 'login') {
    tvSet(t, { field: '', state: '' }); const { x, y, w } = TV;
    shape(rr(x + w / 2 - 150, y + 322, 300, 36, 8), { fill: pick > 0 ? '#3a7bd5' : '#121426', lw: 0, line: null });
    text('Ai uitat parola?', x + w / 2, y + 340, { font: '800 26px "Baloo 2"', fill: '#7fb4ff' }); stroke([[x + w / 2 - 100, y + 356], [x + w / 2 + 100, y + 356]], 3, { line: '#7fb4ff' });
    return;
  }
  tvSet(t, { field: '', state: '' });
  const { x, y, w, h } = TV;
  shape(rect(x, y, w, h), { fill: '#121426', lw: 4, shade: () => {
    text('STREAM+', x + 70, y + 34, { font: '400 30px Bungee', fill: '#e8283c' });
    if (kind === 'sent') { text('Ți-am trimis un cod', x + w / 2, y + 150, { font: '800 40px "Baloo 2"', fill: '#fff' }); text('pe e-mail.', x + w / 2, y + 200, { font: '800 40px "Baloo 2"', fill: '#fff' }); shape(rr(x + w / 2 - 60, y + 240, 120, 80, 8), { fill: '#f2c230', lw: 5 }); stroke([[x + w / 2 - 60, y + 240], [x + w / 2, y + 290], [x + w / 2 + 60, y + 240]], 5); }
    if (kind === 'newpass' || kind === 'changed') {
      text('Creați o parolă nouă', x + w / 2, y + 90, { font: '800 32px "Baloo 2"', fill: '#fff' });
      shape(rr(x + 90, y + 120, w - 180, 54, 10), { fill: '#23263c', lw: 4, line: '#8a8fa8' });
      text(typed + (Math.floor(t * 2) % 2 ? '|' : ''), x + 110, y + 148, { font: '400 38px VT323', fill: '#fff', align: 'left' });
      if (kind === 'changed') { shape(rr(x + 80, y + 210, w - 160, 90, 14), { fill: '#2bb673', lw: 5 }); text('✓ Parola a fost schimbată!', x + w / 2, y + 256, { font: '800 32px "Baloo 2"', fill: '#fff' }); }
    }
    if (kind === 'profiles') {
      text('Cine se uită?', x + w / 2, y + 90, { font: '800 40px "Baloo 2"', fill: '#fff' });
      ['TATA', 'MAMA', 'ANDREI', 'REX'].forEach((n, i) => {
        const px = x + 105 + i * 130, py = y + 200, on = i === cursor;
        shape(rr(px - 50, py - 50, 100, 100, 14), { fill: ['#8a8f9a', '#3a7bd5', '#e2523b', '#b5652e'][i], lw: on ? 8 : 4, line: on ? '#fff' : '#1b1422' });
        eye(px - 18, py - 6, 12, 13, { pupil: 3.5, lw: 4 }); eye(px + 18, py - 6, 12, 13, { pupil: 3.5, lw: 4 }); stroke(arc(px, py + 18, 20, 10, Math.PI * .1, Math.PI * .9, 8), 4);
        text(n, px, py + 80, { font: '800 24px "Baloo 2"', fill: '#fff' });
      });
    }
    if (kind === 'loading') spinner(x + w / 2, y + h / 2, 70, t);
    if (kind === 'film') {   // a generic sunset western, nothing anyone owns
      bands(['#ff7a2f', '#ff9a4f', '#ffb870', '#ffd090'], y, y + h * .7, x, x + w);
      shape(ell(x + w * .65, y + h * .55, 70, 70, 30), { fill: '#ffe066', lw: 5 });
      shape(rect(x, y + h * .7, w, h * .3), { fill: '#7a4a24', lw: 4 });
      push(); translate(x + w * .35, y + h * .7); shape(spline([[-60, 0], [-50, -60], [10, -70], [60, -90], [70, -60], [40, -50], [50, 0]]), { fill: '#2b2230', lw: 0, line: null }); pop();
    }
    if (kind === 'still') { fillOnly(rect(x, y, w, h), 'rgba(0,0,0,.6)', { boil: 0 }); text('Mai sunteți acolo?', x + w / 2, y + 160, { font: '800 44px "Baloo 2"', fill: '#fff' }); shape(rr(x + w / 2 - 120, y + 210, 240, 60, 12), { fill: '#e8283c', lw: 4 }); text('Da', x + w / 2, y + 242, { font: '800 30px "Baloo 2"', fill: '#fff' }); }
    if (kind === 'dogs') {   // a dog show: dachshunds running on grass
      bands(['#9fd6f2', '#b9e2f5'], y, y + h * .5, x, x + w); fillOnly(rect(x, y + h * .5, w, h * .5), '#6aa84f', { boil: 0 });
      for (let i = 0; i < 3; i++) rex(x + ((t * 120 + i * 220) % (w + 200)) - 100, y + h * .9 - i * 30, .45, { face: 1, t: t + i, walk: true });
      text('CANALUL CĂȚEILOR', x + w / 2, y + 40, { font: '400 26px Bungee', fill: '#fff', outlineW: 6 });
    }
  } });
}

// the laptop from 2004: a grey brick with an antenna; open = 0..1
export function laptop(x, y, s = 1, { glow = 1 } = {}) {
  push(); translate(x, y); scale(s);
  shape(rr(-150, -24, 300, 40, 8), { fill: '#9aa3ad', lw: 6 });
  shape([[-140, -24], [140, -24], [120, -220], [-120, -220]], { fill: '#7a838e', lw: 7, shade: () => fillOnly([[-110, -40], [110, -40], [96, -200], [-96, -200]], glow ? '#4a8fd5' : '#1b1422', { boil: .3 }) });
  stroke([[100, -220], [140, -330]], 6); dot(140, -330, 9, '#e2523b');
  text('2004', 0, 0, { font: '800 18px "Baloo 2"', fill: '#4a4f5a' });
  pop();
}
// the laptop's screen, full frame: boot (progress p), or the inbox
export function laptopScreen(t, kind, { p = 0, scroll = 0 } = {}) {
  fillOnly(rect(-2000, -2000, 6000, 6000), '#4a4f5a', { boil: 0 });
  shape(rr(140, 80, 1640, 920, 30), { fill: '#7a838e', lw: 10 });
  shape(rect(200, 130, 1520, 820), { fill: kind === 'boot' ? '#1f5fb0' : '#e8eef6', lw: 6, shade: () => {
    if (kind === 'boot') {
      text('Pornire...', 960, 340, { font: '800 64px "Baloo 2"', fill: '#fff' });
      shape(rr(460, 440, 1000, 70, 14), { fill: '#123a70', lw: 6 }); fillOnly(rect(470, 450, 980 * p, 50), '#2bb673', { boil: .2 });
      text(Math.floor(p * 100) + '%', 960, 476, { font: '400 50px VT323', fill: '#fff' });
      text(p < .99 ? `Se instalează actualizarea ${1 + Math.floor(p * 213)} din 214` : 'Gata!', 960, 600, { font: '800 40px "Baloo 2"', fill: '#cfe2ff' });
      push(); translate(960, 740); rotate(Math.floor(t * 2) * Math.PI / 2); shape([[-30, -40], [30, -40], [0, 0], [30, 40], [-30, 40], [0, 0]], { fill: '#f2c230', lw: 5 }); pop();   // the hourglass
    } else {
      fillOnly(rect(200, 130, 1520, 80), '#3a7bd5', { boil: 0 }); text('E-MAIL  ·  4.721 necitite', 960, 172, { font: '800 40px "Baloo 2"', fill: '#fff' });
      const rows = ['Reduceri la mobilă!!!', 'Ați câștigat un iPhone', 'Rețete de la Tanti Veta', 'Reduceri la mobilă!!!', 'Poze de la nuntă (1991)', 'Reduceri la mobilă!!!'];
      rows.forEach((r, i) => { const yy = 260 + i * 90 - scroll; if (yy > 210 && yy < 720) { shape(rect(220, yy - 36, 1480, 80), { fill: '#fff', lw: 3 }); text(r, 260, yy + 4, { font: '800 36px "Baloo 2"', fill: i === 4 ? '#e2523b' : INK, align: 'left' }); } });
      shape(rr(260, 720, 1400, 200, 16), { fill: '#fff6d8', lw: 6 });
      text('STREAM+: Codul dumneavoastră este', 960, 780, { font: '800 40px "Baloo 2"', fill: INK });
      text('1 2 3 4 5 6', 960, 860, { font: '400 90px Bungee', fill: '#e8283c' });
    }
  } });
}
// the captcha: a 3×3 grid of pictures; round 0 = traffic lights (one is a man's T-shirt), 1 = bicycles (one is Rex), 2 = "pictures of you"
function cell(kind, cx, cy, s) {
  push(); translate(cx, cy);
  fillOnly(rect(-s / 2, -s / 2, s, s), '#cfe6f5', { boil: 0 });
  if (kind === 'light') { shape(rr(-30, -70, 60, 140, 12), { fill: '#2b2230', lw: 5 }); for (const [dy, c] of [[-40, '#e8283c'], [0, '#f2c230'], [40, '#2bb673']]) dot(0, dy, 16, c); }
  if (kind === 'shirt') { shape([[-80, -60], [80, -60], [100, -20], [70, -10], [70, 90], [-70, 90], [-70, -10], [-100, -20]], { fill: '#fff', lw: 5 }); shape(rr(-18, -30, 36, 80, 8), { fill: '#2b2230', lw: 4 }); for (const [dy, c] of [[-14, '#e8283c'], [10, '#f2c230'], [34, '#2bb673']]) dot(0, dy, 8, c); }
  if (kind === 'bike') { for (const sx of [-1, 1]) stroke(ell(sx * 50, 30, 36, 36, 20), 6); stroke([[-50, 30], [0, -20], [50, 30], [0, 30], [-50, 30]], 5); }
  if (kind === 'rexbike') { rex(-40, 70, .45, { face: 1 }); }
  if (kind === 'man') { shape(ell(0, -10, 50, 56, 20), { fill: '#f0c49a', lw: 5 }); stroke(rr(-30, -20, 26, 20, 6), 4); stroke(rr(4, -20, 26, 20, 6), 4); shape(rr(-60, 50, 120, 60, 20), { fill: '#8a8f9a', lw: 5 }); }
  if (kind === 'potato') { shape(spline([[-60, -20], [-20, -50], [40, -40], [70, 0], [40, 50], [-30, 50], [-70, 20]]), { fill: '#c49a6a', lw: 5 }); for (let i = 0; i < 4; i++) dot(-30 + i * 20, -10 + (i % 2) * 20, 4, '#8a6a40'); }
  if (kind === 'tree') { shape(ell(0, -20, 60, 60, 20), { fill: '#3aa35a', lw: 5 }); shape(rect(-10, 30, 20, 50), { fill: '#7a4a24', lw: 4 }); }
  pop();
}
const GRIDS = [
  ['light', 'tree', 'light', 'tree', 'shirt', 'light', 'tree', 'light', 'tree'],
  ['bike', 'tree', 'bike', 'rexbike', 'tree', 'bike', 'tree', 'bike', 'tree'],
  ['man', 'man', 'potato', 'man', 'man', 'man', 'man', 'man', 'man'],
];
export function captcha(t, round, { picks = [], cursor = -1, retry = false } = {}) {
  fillOnly(rect(-2000, -2000, 6000, 6000), '#121426', { boil: 0 });
  shape(rr(560, 60, 800, 960, 16), { fill: '#fff', lw: 8 });
  fillOnly(rect(580, 80, 760, 120), '#3a7bd5', { boil: 0 });
  text(['Selectați toate imaginile cu', 'Selectați toate imaginile cu', 'Selectați toate imaginile cu'][round], 960, 116, { font: '800 30px "Baloo 2"', fill: '#fff' });
  text(['SEMAFOARE', 'BICICLETE', 'DUMNEAVOASTRĂ'][round], 960, 166, { font: '400 44px Bungee', fill: '#fff' });
  GRIDS[round].forEach((k, i) => {
    const cx = 700 + (i % 3) * 260, cy = 340 + Math.floor(i / 3) * 260;
    cell(k, cx, cy, 240);
    if (picks.includes(i)) { stroke(rect(cx - 120, cy - 120, 240, 240), 12, { line: '#3a7bd5' }); shape(ell(cx - 90, cy - 90, 24, 24, 16), { fill: '#3a7bd5', lw: 4 }); }
    if (i === cursor) stroke(rect(cx - 116, cy - 116, 232, 232), 6, { line: '#e8283c' });
  });
  if (retry) { shape(rr(600, 900, 720, 80, 12), { fill: '#e8283c', lw: 5 }); text('Încercați din nou.', 960, 942, { font: '800 36px "Baloo 2"', fill: '#fff' }); }
}
export function robotBox(t, { check = 0 } = {}) {
  shape(rr(620, 380, 680, 160, 14), { fill: '#f4f4f4', lw: 6 });
  shape(rr(660, 420, 80, 80, 10), { fill: '#fff', lw: 6 });
  text('Nu sunt robot', 800, 462, { font: '800 44px "Baloo 2"', fill: INK, align: 'left' });
  if (check > 0) spinner(700, 460, 26, t, '58,123,213');
}
