// lift.js — the lift interior, its doors, the floor dial, the lever, and the worlds seen through the doorway.
import { clamp, lerp, hash, vnoise, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands, noodle, tx } from './toon.js';
import { eye, mouth, GLOW } from './cast.js';

export const DOOR = { x: 760, y: 230, w: 400, h: 600 };
export function clipDoor(fn) {
  const c = [[DOOR.x, DOOR.y], [DOOR.x + DOOR.w, DOOR.y], [DOOR.x + DOOR.w, DOOR.y + DOOR.h], [DOOR.x, DOOR.y + DOOR.h]].map(p => tx(p[0], p[1]));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); c.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  fn();
  g.restore();
}

// —— worlds through the doorway (drawn in world coordinates around the door rectangle) ——
export function outside(name, t, o = {}) {
  const { x, y, w, h } = DOOR;
  if (name === 'lobby') {
    fillOnly(rect(x, y, w, h), '#c9cfd6', { boil: 0 });
    shape([[x, y + 420], [x + w, y + 420], [x + w, y + h], [x, y + h]], { fill: '#9aa3ad', lw: 5 });
    shape(rr(x + 260, y + 300, 70, 120, 8), { fill: '#e2523b', lw: 5 }); shape(spline([[x + 270, y + 300], [x + 250, y + 200], [x + 300, y + 240], [x + 320, y + 180], [x + 330, y + 300]]), { fill: '#3aa35a', lw: 5 });
    shape(rr(x + 40, y + 80, 200, 60, 8), { fill: '#3a2a20', lw: 5 }); text('RECEPȚIE', x + 140, y + 112, { font: '800 34px "Baloo 2"', fill: '#f2c230' });
  } else if (name === 'apa') {
    bands(['#1f6fb0', '#2482c4', '#2f97d6', '#45abe2'], y + h, y, x, x + w);
    for (let i = 0; i < 5; i++) shape(spline([[x + 30 + i * 80, y + h], [x + 10 + i * 80 + Math.sin(t * 2 + i) * 20, y + h - 150], [x + 40 + i * 80, y + h - 260 - (i % 2) * 60], [x + 50 + i * 80, y + h]]), { fill: '#2e9e6a', lw: 5 });
    // shark at the back, with a mug
    push(); translate(x + 300 + Math.sin(t * .8) * 20, y + 150);
    shape(spline([[-120, 0], [-40, -40], [60, -30], [120, 0], [60, 30], [-40, 30]]), { fill: '#7f8fa0', lw: 6 }); shape([[-10, -36], [10, -90], [30, -32]], { fill: '#7f8fa0', lw: 6 });
    eye(80, -6, 8, 8, { pupil: 3, skin: '#7f8fa0', lw: 4 }); shape(rr(100, 10, 30, 34, 6), { fill: '#fff', lw: 4 });
    pop();
    // the fish in a tie, staring in
    push(); translate(x + 180, y + 360 + Math.sin(t * 2) * 8);
    shape(spline([[-140, 0], [-60, -110], [80, -90], [150, 0], [80, 90], [-60, 110]]), { fill: '#ff8a3d', lw: 7, shade: () => fillOnly(ell(40, 40, 90, 60, 18), '#e2652a', { boil: .3 }) });
    shape([[-140, 0], [-220, -70], [-200, 0], [-220, 70]], { fill: '#ff8a3d', lw: 6 });
    eye(60, -30, 34, 34, { pupil: 5, skin: '#ff8a3d', look: [.3, 0] });
    mouth(120, 20, 30, { o: .3 + .2 * Math.sin(t * 6), sm: 0, lw: 5, teeth: false });
    shape([[20, 60], [40, 60], [46, 120], [30, 140], [14, 120]], { fill: '#3b6fd6', lw: 5 });
    pop();
    for (let i = 0; i < 10; i++) { const u = (t * .4 + hash(i)) % 1; shape(ell(x + hash(i + 3) * w, y + h - u * h, 8 + hash(i) * 8, 8 + hash(i) * 8, 12), { fill: 'rgba(255,255,255,.35)', lw: 3 }); }
  } else if (name === 'pisica') {
    fillOnly(rect(x, y, w, h), '#ff9a3c', { boil: 0 });
    for (let i = 0; i < 9; i++) stroke(spline([[x + i * 50 - 20, y], [x + i * 50, y + 200], [x + i * 50 - 10, y + h]], false), 6, { line: '#e07a20' });
    const bl = o.eyeBlink || 0;
    push(); translate(x + 200, y + 280);
    shape(ell(0, 0, 170, 150 * (1 - bl * .95), 40), { fill: '#c8f05a', lw: 9, shade: () => fillOnly(ell(0, 0, 28 + (o.dilate || 0) * 50, 140, 20), INK, { boil: .3 }) });
    if (bl < .5) fillOnly(ell(-50, -60, 30, 22, 14), 'rgba(255,255,255,.75)', { boil: .2 });
    pop();
  } else if (name === 'spatiu') {
    fillOnly(rect(x, y, w, h), '#10183a', { boil: 0 });
    for (let i = 0; i < 40; i++) dot(x + hash(i) * w, y + hash(i + 9) * h, 2 + hash(i + 4) * 3, '#fff4c4');
    shape(ell(x + 280, y + 180, 90, 90, 30), { fill: '#e2523b', lw: 6, shade: () => fillOnly(ell(x + 310, y + 200, 70, 80, 20), '#b63a27', { boil: .3 }) });
    stroke(ell(x + 280, y + 180, 160, 30, 30), 8, { line: '#f2c230' });
  } else if (name === 'branza') {
    fillOnly(rect(x, y, w, h), '#f2c230', { boil: 0 });
    for (let i = 0; i < 12; i++) shape(ell(x + hash(i) * w, y + hash(i + 2) * h, 14 + hash(i + 5) * 26, 12 + hash(i + 5) * 20, 16), { fill: '#d9a514', lw: 4 });
    shape(rect(x + 30, y + 420, 340, 30), { fill: '#e8b81a', lw: 6 });
    for (const mx of [x + 110, x + 290]) { push(); translate(mx, y + 420);
      shape(ell(0, -60, 50, 60, 20), { fill: '#3a3f4a', lw: 6 }); shape(ell(0, -150, 46, 44, 20), { fill: '#a8adb8', lw: 6 });
      for (const sx of [-1, 1]) shape(ell(sx * 40, -190, 24, 24, 16), { fill: '#a8adb8', lw: 5, shade: () => fillOnly(ell(sx * 40, -190, 12, 12, 10), '#ffb3c6', { boil: .2 }) });
      eye(-14, -156, 9, 10, { pupil: 3, skin: '#a8adb8', lw: 4 }); eye(14, -156, 9, 10, { pupil: 3, skin: '#a8adb8', lw: 4 }); dot(0, -136, 6, '#ff6f9f');
      shape([[-8, -110], [8, -110], [4, -40], [-4, -40]], { fill: '#e2523b', lw: 4 });
      pop(); }
  } else if (name === 'jungla') {
    fillOnly(rect(x, y, w, h), '#2e7d32', { boil: 0 });
    for (let i = 0; i < 8; i++) shape(spline([[x + i * 60 - 30, y], [x + i * 60, y + 160 + (i % 3) * 40], [x + i * 60 + 40, y]]), { fill: '#43a047', lw: 5 });
    push(); translate(x + 200, y + 430);
    shape(ell(0, -110, 130, 120, 30), { fill: '#3a3f4a', lw: 7 }); shape(ell(0, -230, 80, 72, 24), { fill: '#3a3f4a', lw: 7 });
    shape(ell(0, -210, 54, 40, 20), { fill: '#7a6a60', lw: 5 }); eye(-24, -246, 12, 12, { pupil: 4, skin: '#3a3f4a', lw: 4, lid: .4 }); eye(24, -246, 12, 12, { pupil: 4, skin: '#3a3f4a', lw: 4, lid: .4 });
    stroke(arc(0, -250, 86, 80, Math.PI * 1.1, Math.PI * 1.9, 14), 6); shape(ell(84, -230, 14, 18, 10), { fill: INK, lw: 4 }); stroke([[84, -220], [40, -196]], 4);
    pop();
    shape(rect(x + 20, y + 420, 360, 180), { fill: '#7a4a24', lw: 6 });
  } else if (name === 'ploaie') {
    fillOnly(rect(x, y, w, h), '#b8bec8', { boil: 0 });
    shape(spline([[x + 60, y + 120], [x + 100, y + 60], [x + 200, y + 50], [x + 300, y + 70], [x + 340, y + 130], [x + 60, y + 140]]), { fill: '#7b8494', lw: 6 });
    for (let i = 0; i < 26; i++) { const u = (t * 2.4 + hash(i)) % 1, rx = x + 70 + hash(i + 1) * 260; stroke([[rx, y + 140 + u * 400], [rx - 6, y + 170 + u * 400]], 4, { line: '#3b6fd6' }); }
    for (const [ux, c] of [[x + 110, '#e2523b'], [x + 290, '#f2c230']]) { shape([...arc(ux, y + 420, 80, 50, Math.PI, TAU, 14)], { fill: c, lw: 6 }); stroke([[ux, y + 420], [ux, y + 500]], 5); shape(ell(ux, y + 520, 30, 30, 14), { fill: '#f0c49a', lw: 5 }); }
    shape(rect(x + 20, y + 540, 360, 60), { fill: '#8a6a50', lw: 6 });
  }
}

// —— the interior ——
export function interior(t, { doorOpen = 0, dialF = 0, lever = 0, glowGap = 0 } = {}) {
  fillOnly(rect(-1600, -1400, 5200, 2300), '#8c2f3f', { boil: 0 });
  for (let x = -1500; x < 3500; x += 120) stroke([[x, -1400], [x, 560]], 4, { line: '#7a2535' });
  shape(rect(-1600, 560, 5200, 290), { fill: '#a8643a', lw: 7, shade: () => { for (let x = -1520; x < 3500; x += 200) shape(rr(x, 590, 160, 220, 10), { fill: '#b8744a', lw: 4 }); } });
  shape(rect(-1600, 548, 5200, 20), { fill: '#e0b04a', lw: 5 });
  // checker floor
  shape(rect(-1600, 840, 5200, 900), { fill: '#f4ecd8', lw: 6 });
  for (let r = 0; r < 4; r++) for (let c = -12; c < 30; c++) if ((r + c) % 2 === 0) fillOnly([[c * 120 + r * 30, 840 + r * 60], [c * 120 + 120 + r * 30, 840 + r * 60], [c * 120 + 120 + (r + 1) * 30, 900 + r * 60], [c * 120 + (r + 1) * 30, 900 + r * 60]], '#2b2230', { boil: .2 });
  // ceiling light strip
  shape(rr(560, -40, 800, 40, 12), { fill: '#fff6d8', lw: 6 });
  // doorway frame + sliding doors
  const { x, y, w, h } = DOOR;
  shape(rect(x - 40, y - 40, w + 80, h + 50), { fill: '#e0b04a', lw: 7, shade: () => fillOnly(rect(x + w, y - 40, 40, h + 50), '#c4952e', { boil: .3 }) });
  fillOnly(rect(x, y, w, h), '#1b1422', { boil: 0 });
  return { x, y, w, h };
}
export function doors(open, glowGap = 0) {
  const { x, y, w, h } = DOOR, half = w / 2, d = half * clamp(open);
  clipDoor(() => {
    for (const sx of [-1, 1]) {
      const x0 = sx < 0 ? x - d : x + half + d;
      shape(rect(x0, y, half, h), { fill: '#c9d2dc', lw: 7, shade: () => { fillOnly(rect(x0 + (sx < 0 ? half - 30 : 0), y, 30, h), '#9aa6b4', { boil: .3 }); for (let k = 0; k < 3; k++) stroke([[x0 + 30, y + 120 + k * 160], [x0 + half - 30, y + 120 + k * 160]], 3, { line: '#9aa6b4' }); } });
    }
  });
  if (glowGap > 0 && open < .05) fillOnly(rect(x + half - 6, y, 12, h), `rgba(255,79,216,${.8 * glowGap})`, { boil: .3 });
}
// the floor dial above the doorway: -2 … 13 on a half circle
export function dial(f) {
  const cx = 960, cy = 170;
  shape([...arc(cx, cy, 130, 110, Math.PI, TAU, 30), [cx + 130, cy], [cx - 130, cy]], { fill: '#f4ecd8', lw: 7, shade: () => {
    for (let n = -2; n <= 13; n++) { const a = Math.PI + (n + 2) / 15 * Math.PI; stroke([[cx + Math.cos(a) * 100, cy + Math.sin(a) * 86], [cx + Math.cos(a) * 118, cy + Math.sin(a) * 102]], 3);
      if (n % 1 === 0 && [-2, 0, 3, 5, 7, 9, 13].includes(n)) text(String(n), cx + Math.cos(a) * 78, cy + Math.sin(a) * 64, { font: '800 22px "Baloo 2"', fill: n === 9 ? '#d33a3a' : INK }); }
  } });
  const a = Math.PI + (f + 2) / 15 * Math.PI;
  stroke([[cx, cy], [cx + Math.cos(a) * 96, cy + Math.sin(a) * 82]], 7, { line: '#d33a3a' }); dot(cx, cy, 10);
}
// the brass lever right of Leana: pull 0 (up) → 1 (down); its knob glows while pulled
export function lever(pull, glow = 0) {
  shape(rr(1600, 380, 120, 300, 14), { fill: '#e0b04a', lw: 7, shade: () => fillOnly(rect(1680, 370, 50, 320), '#c4952e', { boil: .3 }) });
  const a = lerp(-2.3, -.9, clamp(pull)), px = 1660, py = 560, kx = px + Math.cos(a) * 130, ky = py + Math.sin(a) * 130;
  stroke([[px, py], [kx, ky]], 12);
  if (glow > 0) fillOnly(ell(kx, ky, 46 + glow * 12, 46 + glow * 12, 20), `rgba(255,79,216,${.3 * glow})`, { boil: .4 });
  shape(ell(kx, ky, 28, 28, 18), { fill: GLOW, lw: 6 }); dot(px, py, 12);
}
// the giant cat paw reaching in through the doorway: reach 0..1 toward (tx_,ty_)
export function paw(reach, tx_, ty_, t) {
  if (reach <= 0) return;
  const sx = 980, sy = 560, ex = lerp(sx, tx_, reach), ey = lerp(sy, ty_, reach);
  shape(noodle([sx, sy], [ex, ey], -40, 170, 130), { fill: '#ff9a3c', lw: 8, shade: () => { for (let i = 0; i < 4; i++) stroke([[lerp(sx, ex, .2 + i * .18), lerp(sy, ey, .2 + i * .18) - 60], [lerp(sx, ex, .2 + i * .18) + 10, lerp(sy, ey, .2 + i * .18) + 50]], 5, { line: '#e07a20' }); } });
  push(); translate(ex, ey);
  shape(ell(0, 0, 80, 70, 24), { fill: '#ff9a3c', lw: 8 });
  shape(ell(0, 14, 34, 26, 16), { fill: '#ffb3c6', lw: 5 });
  for (const [bx, by] of [[-46, -34], [-14, -50], [20, -50], [50, -32]]) shape(ell(bx, by, 14, 14, 12), { fill: '#ffb3c6', lw: 4 });
  pop();
}
