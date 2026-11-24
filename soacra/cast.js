// cast.js — "Soacra și GPS-ul": the son-in-law (driving), the mother-in-law (back seat, the map), Aunt Veta, chickens, the GPS.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, floorShadow } from './toon.js';

export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = '#f0c49a', lw = 6 } = {}) {
  shape(ell(cx, cy, rx, ry, 30), { fill: '#fff', lw, shade: () => {
    dot(cx + look[0] * rx * .55, cy + look[1] * ry * .5, pupil);
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw); }
  } });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  shape([...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)], { fill: '#4a1a2a', lw, shade: () => {
    if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), '#fff', { boil: .3 });
    fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), '#e8637a', { boil: .3 });
  } });
}
const hand = (x, y, ang, r, col) => { push(); translate(x, y); rotate(ang); shape(spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]]), { fill: col, lw: 6 }); pop(); };
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— the son-in-law, seen from the front at the wheel (upper body; origin = seat level, centre) ——
export function ginere(P) {
  push(); translate(P.x, P.y + (P.bob || 0)); rotate(P.lean || 0); scale(P.s ?? 1);
  shape(spline([[-130, 0], [-140, -160], [-90, -240], [90, -240], [140, -160], [130, 0]]), { fill: '#3a7bd5', lw: 7, shade: () => fillOnly(ell(70, -100, 60, 120, 16), '#2a5fa8', { boil: .3 }) });
  shape([[-40, -240], [40, -240], [0, -190]], { fill: '#fff', lw: 5 });
  shape(noodle([0, -236], [0, -270], 0, 50, 50), { fill: '#f6d2b8', lw: 6 });
  push(); translate(0, -360); rotate(P.headTilt || 0);
  for (const sx of [-1, 1]) shape(ell(sx * 80, 10, 16, 24, 14), { fill: '#f6d2b8', lw: 6 });
  shape(ell(0, 0, 84, 96, 36), { fill: '#f6d2b8', lw: 7 });
  // spiky blond hair
  shape(spline([[-86, -20], [-90, -90], [-60, -80], [-50, -140], [-20, -100], [0, -160], [24, -104], [50, -146], [64, -86], [92, -96], [86, -20], [40, -60], [-30, -56]]), { fill: '#ffd34a', lw: 7 });
  const es = P.eyeS ?? 1, look = P.look || [0, 0];
  eye(-30, -4, 24 * es, 28 * es, { lid: P.lid ?? 0, look, pupil: 4, skin: '#f6d2b8' }); eye(30, -4, 24 * es, 28 * es, { lid: P.lid ?? 0, look, pupil: 4, skin: '#f6d2b8' });
  const br = P.brow ?? 1.5; stroke([[-54, -42 + br * 2], [-14, -50 - br * 8]], 7); stroke([[54, -42 + br * 2], [14, -50 - br * 8]], 7);
  shape(ell(0, 28, 14, 12, 12), { fill: '#e0ad8c', lw: 5 });
  const m = P.mouth || {}; mouth(0, 62, 44, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.6, lw: 5 });
  if (P.chicken) chicken(0, -110, .55, { t: P.t, sit: true });
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-110, -460 + u * 40, 1); sweat(120, -440 + ((u + .5) % 1) * 40, .8); }
  pop();
}
// the steering wheel (foreground), turned by `turn` radians, with two hands on it
export function wheel(x, y, turn = 0) {
  push(); translate(x, y); rotate(turn);
  stroke(ell(0, 0, 150, 150, 40), 26, { line: '#2b2230' }); stroke(ell(0, 0, 150, 150, 40), 14, { line: '#4a4f5a' });
  stroke([[-140, 0], [140, 0]], 16, { line: '#2b2230' }); shape(ell(0, 0, 40, 40, 20), { fill: '#4a4f5a', lw: 6 });
  hand(-140, -10, Math.PI * .5, 26, '#f6d2b8'); hand(140, -10, Math.PI * .5, 26, '#f6d2b8');
  pop();
}

// —— the mother-in-law in the back seat: grey perm, cat-eye glasses on a chain, purple coat, a brooch ——
// map: 0 hidden … 1 unfolded huge in front of her; pointing: arm out to the right
export function soacra(P) {
  push(); translate(P.x, P.y + (P.bob || 0)); scale(P.s ?? 1);
  shape(spline([[-150, 0], [-160, -170], [-100, -250], [100, -250], [160, -170], [150, 0]]), { fill: '#7a3fb0', lw: 7, shade: () => fillOnly(ell(80, -100, 60, 140, 16), '#5a2a88', { boil: .3 }) });
  shape(ell(-40, -170, 22, 22, 14), { fill: '#f2c230', lw: 5, shade: () => dot(-40, -170, 8, '#e2523b') });   // brooch
  push(); translate(0, -360); rotate(P.headTilt || 0);
  // the perm: a ring of grey curls
  for (let i = 0; i < 14; i++) { const a = Math.PI * (1.05 + i / 13 * .9), r = 104; shape(ell(Math.cos(a) * r, -10 + Math.sin(a) * r * .95, 34, 34, 16), { fill: '#c9cbd6', lw: 5 }); }
  shape(ell(0, 0, 86, 94, 36), { fill: '#f0c49a', lw: 7 });
  for (let i = 0; i < 7; i++) shape(ell(-66 + i * 22, -78 - Math.sin(i / 6 * Math.PI) * 18, 22, 22, 14), { fill: '#c9cbd6', lw: 5 });
  const look = P.look || [0, 0];
  eye(-32, 0, 20, 20, { lid: P.lid ?? .45, look, pupil: 4 }); eye(32, 0, 20, 20, { lid: P.lid ?? .45, look, pupil: 4 });
  for (const sx of [-1, 1]) shape(spline([[sx * 8, -16], [sx * 60, -26], [sx * 66, 18], [sx * 10, 20]]), { fill: 'rgba(255,255,255,.12)', lw: 6, line: '#e2523b' });   // cat-eye glasses
  stroke(spline([[-66, 0], [-80, 80], [-40, 150]], false), 3, { line: '#f2c230' }); stroke(spline([[66, 0], [80, 80], [40, 150]], false), 3, { line: '#f2c230' });
  const br = P.brow ?? -1.2; stroke([[-52, -34 - br * 6], [-12, -30 + br * 6]], 7); stroke([[52, -34 - br * 6], [12, -30 + br * 6]], 7);
  shape(spline([[-6, 10], [12, 34], [6, 50], [-16, 48]]), { fill: '#f0c49a', lw: 5 });
  const m = P.mouth || {}; mouth(0, 70, 40, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.4, lw: 6 });
  pop();
  if (P.point) { shape(noodle([120, -220], [330, -300], -20, 46, 38), { fill: '#7a3fb0', lw: 7 }); hand(340, -304, -.3, 24, '#f0c49a'); shape(rr(352, -322, 50, 20, 8), { fill: '#f0c49a', lw: 5 }); }
  if (P.map > 0) mapSheet(P.mapX ?? 0, P.mapY ?? -330, P.map, P.t || 0, P.mapRot || 0);
  pop();
}
// the paper road map, unfolding to the size of a bedsheet
export function mapSheet(x, y, u, t, rot = 0) {
  const w = lerp(120, 1100, u), h = lerp(90, 640, u);
  push(); translate(x, y); rotate(rot + Math.sin(t * 9) * .02 * u);
  shape(rect(-w / 2, -h / 2, w, h), { fill: '#f6eed8', lw: 7, shade: () => {
    fillOnly(ell(-w * .2, -h * .1, w * .2, h * .25, 20), '#cfe6b8', { boil: .3 }); fillOnly(ell(w * .25, h * .15, w * .18, h * .2, 20), '#bfe0f2', { boil: .3 });
    for (let k = 0; k < 6; k++) stroke(spline([[-w / 2, -h / 2 + k * h / 5], [-w * .1, -h * .3 + k * h / 6], [w * .2, -h * .4 + k * h / 5], [w / 2, -h / 2 + k * h / 4]], false), 5, { line: k % 2 ? '#e2523b' : '#f2c230' });
    for (let k = 1; k < 4; k++) stroke([[-w / 2 + k * w / 4, -h / 2], [-w / 2 + k * w / 4, h / 2]], 2, { line: 'rgba(120,100,60,.4)' });
    stroke([[-w / 2, 0], [w / 2, 0]], 2, { line: 'rgba(120,100,60,.4)' });
    if (u > .6) text('MAREA NEAGRĂ', w * .25, h * .15, { font: `800 ${Math.round(14 + u * 10)}px "Baloo 2"`, fill: '#3a7bd5' });
  } });
  pop();
}

// —— Aunt Veta on her porch: headscarf, apron, broom ——
export function veta(P) {
  floorShadow(P.x, P.y, 130);
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  for (const sx of [-1, 1]) { shape(noodle([sx * 24, -200], [sx * 28, -24], 0, 28, 24), { fill: '#3a2a20', lw: 6 }); shape(spline([[sx * 28 - 24, -4], [sx * 28 - 20, -30], [sx * 28 + 30, -30], [sx * 28 + 40, -4]]), { fill: '#2b2230', lw: 6 }); }
  shape(spline([[-60, -460], [-110, -380], [-130, -200], [0, -180], [130, -200], [110, -380], [60, -460]]), { fill: '#3a7bd5', lw: 7 });
  shape(spline([[-70, -380], [70, -380], [96, -210], [-96, -210]]), { fill: '#fff6e0', lw: 6, shade: () => { for (let i = 0; i < 6; i++) shape(ell(-50 + (i % 3) * 50, -340 + Math.floor(i / 3) * 70, 12, 12, 10), { fill: '#e2523b', lw: 3 }); } });
  stroke([[120, -420], [160, -20]], 10, { line: '#a8754a' }); shape([[130, -40], [190, -40], [210, 10], [110, 10]], { fill: '#f2c230', lw: 6 });   // broom
  hand(130, -300, 0, 20, '#f0c49a');
  push(); translate(0, -560);
  shape(ell(0, 0, 76, 86, 30), { fill: '#f0c49a', lw: 7 });
  shape([...arc(0, -10, 96, 96, Math.PI * .9, Math.PI * 2.1, 26)], { fill: '#e2523b', lw: 7, shade: () => { for (let i = 0; i < 8; i++) shape(ell(-70 + i * 20, -60 + (i % 2) * 30, 10, 10, 10), { fill: '#fff', lw: 3 }); } });
  const look = P.look || [0, 0];
  eye(-28, 6, 16, 17, { lid: .4, look, pupil: 3.5 }); eye(28, 6, 16, 17, { lid: .4, look, pupil: 3.5 });
  shape(ell(0, 30, 14, 12, 12), { fill: '#d29d72', lw: 5 });
  const m = P.mouth || {}; mouth(0, 62, 34, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? .1, lw: 5, teeth: false });
  pop();
  pop();
}
// —— a chicken: walking, flying (flap), or sitting ——
export function chicken(x, y, s = 1, { t = 0, fly = 0, face = 1, sit = false, seed = 0 } = {}) {
  push(); translate(x, y); scale(s * face, s);
  if (!sit) for (const lx of [-14, 14]) stroke([[lx, -30], [lx + Math.sin(t * 14 + seed + lx) * 8 * (fly ? 0 : 1), 0]], 6, { line: '#f2a020' });
  shape(spline([[-60, -50], [-40, -100], [30, -110], [70, -70], [50, -30], [-30, -26]]), { fill: '#fffaf0', lw: 6 });
  shape([[-60, -60], [-90, -100], [-80, -50]], { fill: '#fffaf0', lw: 5 });   // tail
  const fl = fly ? Math.sin(t * 30 + seed) : 0;
  shape(spline([[-10, -80], [30, -80 - fl * 40], [40, -60], [0, -56]]), { fill: '#f4ecd8', lw: 5 });
  shape(ell(56, -116, 26, 26, 16), { fill: '#fffaf0', lw: 6 });
  shape(spline([[46, -138], [52, -156], [60, -142], [68, -158], [74, -138]]), { fill: '#e8283c', lw: 5 });   // comb
  shape([[80, -118], [100, -112], [80, -106]], { fill: '#f2a020', lw: 4 });
  dot(64, -122, 5);
  pop();
}
// a floating feather
export function feather(x, y, a, s = 1) { push(); translate(x, y); rotate(a); scale(s); shape(spline([[0, -26], [10, 0], [0, 26], [-10, 0]]), { fill: '#fffaf0', lw: 4 }); stroke([[0, -26], [0, 30]], 3); pop(); }

// —— the GPS on the dashboard: kind = left | leftAngry | recalc | sad | veta ——
export function gps(x, y, s, kind, t) {
  push(); translate(x, y); scale(s);
  shape(rr(-170, -110, 340, 220, 22), { fill: '#2b2230', lw: 7 });
  shape(rect(-150, -92, 300, 184), { fill: kind === 'leftAngry' ? '#5a1420' : kind === 'sad' ? '#2a3050' : '#1f3a5a', lw: 4, shade: () => {
    if (kind === 'left' || kind === 'leftAngry') {
      shape([[60, 60], [60, -10], [-30, -10], [-30, -40], [-90, 10], [-30, 60], [-30, 30], [20, 30], [20, 60]], { fill: kind === 'left' ? '#2bb673' : '#e8283c', lw: 5 });
      text(kind === 'left' ? '200 m' : 'ACUM!', 90, -60, { font: '400 30px VT323', fill: '#fff' });
    } else if (kind === 'recalc') {
      const k = Math.floor(t * 12) % 8; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, f = ((i - k + 8) % 8) / 8; dot(Math.cos(a) * 40, -10 + Math.sin(a) * 40, 9, `rgba(255,255,255,${.15 + .85 * (1 - f)})`); }
      text('Recalculare...', 0, 66, { font: '400 30px VT323', fill: '#fff' });
    } else if (kind === 'sad') {
      for (const ex of [-40, 40]) stroke([[ex - 14, -30], [ex + 14, -30]], 6, { line: '#fff' });
      stroke(arc(0, 40, 40, 20, Math.PI * 1.1, Math.PI * 1.9, 10), 6, { line: '#fff' });
      shape(spline([[52, -20], [60, 0], [52, 10], [44, 0]]), { fill: '#7fb4ff', lw: 3 });
      text('???', 0, 76, { font: '400 26px VT323', fill: '#fff' });
    } else if (kind === 'veta') {
      text('★ FAVORITE', 0, -62, { font: '400 28px VT323', fill: '#f2c230' });
      chicken(-70, 40, .5, { t }); text('Mătușa Veta', 40, 0, { font: '800 26px "Baloo 2"', fill: '#fff' }); text('(prin găini)', 40, 34, { font: '800 20px "Baloo 2"', fill: '#cfe2ff' });
    }
  } });
  pop();
}
