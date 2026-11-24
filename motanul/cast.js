// cast.js — "Motanul Copiat": Bubu (the fat deadpan cat, and all his clones), Sorin (the panicked inventor), the clone printer.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const GLOW = '#9dff2e';   // the printer's button and its flash: the only glowing colour
const C = { fur: '#8a9bb5', furS: '#6c7c96', stripe: '#5d6c85', belly: '#f4f1ea', nose: '#ff8fa6', white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  skin: '#e8b48a', skinS: '#c99068', beard: '#2b2230', shirt: '#e2523b', shirtW: '#fff6e0', pants: '#4a5a8a', glove: '#f2c230', cap: '#3a7bd5' };

export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = C.skin, lw = 6, slit = false } = {}) {
  shape(ell(cx, cy, rx, ry, 30), { fill: slit ? '#d8f07a' : C.white, lw, shade: () => {
    if (slit) fillOnly(ell(cx + look[0] * rx * .4, cy, rx * .18, ry * .8, 12), INK, { boil: .3 }); else dot(cx + look[0] * rx * .55, cy + look[1] * ry * .5, pupil);
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw); }
  } });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  shape([...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)], { fill: C.mouthIn, lw, shade: () => {
    if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), C.white, { boil: .3 });
    fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), C.tongue, { boil: .3 });
  } });
}
const hand = (x, y, ang, r, col) => { push(); translate(x, y); rotate(ang); shape(spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]]), { fill: col, lw: 6 }); pop(); };
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— Bubu: a fat loaf of a cat. Origin at the bottom centre. ——
// o: {face, lid, look, mo (mouth open), sleep, stretch (0..1, front paw reaching forward), tail (phase), lw}
export function cat(x, y, s = 1, o = {}) {
  const f = o.face ?? 1, lw = o.lw ?? 6;
  push(); translate(x, y); scale(s * f, s * (o.sq ?? 1));
  // tail
  const tp = o.tail ?? 0;
  shape(noodle([-100, -40], [-170 + Math.sin(tp) * 20, -150 + Math.cos(tp) * 10], -40 + Math.sin(tp) * 20, 34, 26), { fill: C.fur, lw, shade: () => { for (let k = 0; k < 3; k++) stroke([[-140 - k * 10, -60 - k * 30], [-110 - k * 10, -70 - k * 30]], 5, { line: C.stripe }); } });
  // body loaf
  shape(spline([[-120, 0], [-130, -70], [-90, -130], [10, -140], [100, -120], [130, -60], [124, 0]]), { fill: C.fur, lw, shade: () => {
    fillOnly(ell(30, -20, 80, 50, 20), C.belly, { boil: .3 });
    for (let k = 0; k < 4; k++) stroke(spline([[-90 + k * 40, -130], [-80 + k * 40, -100], [-90 + k * 40, -70]], false), 6, { line: C.stripe });
    fillOnly(ell(-60, -90, 60, 40, 16), C.furS, { boil: .3 });
  } });
  // front paws (one reaches forward when stretching)
  const st = o.stretch ?? 0;
  shape(ell(70 + st * 90, -8 - st * 30, 30, 18, 14), { fill: C.belly, lw });
  shape(ell(20, -8, 30, 18, 14), { fill: C.belly, lw });
  // head
  push(); translate(90, -150); rotate(o.headTilt ?? 0);
  for (const sx of [-1, 1]) shape([[sx * 30 - 40, -40], [sx * 62 - 8, -110], [sx * 74, -30]], { fill: C.fur, lw, shade: () => fillOnly([[sx * 34 - 30, -44], [sx * 60 - 8, -92], [sx * 66, -36]], C.nose, { boil: .3 }) });
  shape(ell(0, 0, 86, 74, 36), { fill: C.fur, lw, shade: () => { for (let k = 0; k < 3; k++) stroke([[-20 + k * 20, -72], [-16 + k * 18, -48]], 5, { line: C.stripe }); } });
  shape(ell(8, 30, 46, 30, 20), { fill: C.belly, lw: lw * .8 });
  if (o.sleep) { for (const ex of [-30, 34]) stroke(arc(ex, -6, 16, 8, Math.PI * .1, Math.PI * .9, 10), lw); }
  else { eye(-30, -8, 18, 18, { lid: o.lid ?? .55, look: o.look || [0, 0], skin: C.fur, slit: true, lw: lw * .85 }); eye(34, -8, 18, 18, { lid: o.lid ?? .55, look: o.look || [0, 0], skin: C.fur, slit: true, lw: lw * .85 }); }
  shape([[0, 16], [16, 16], [8, 26]], { fill: C.nose, lw: lw * .7 });
  if ((o.mo ?? 0) > .07) mouth(8, 36, 30, { o: o.mo, sm: .1, lw: lw * .8 });
  else { stroke(quad([-6, 36], [0, 42], [8, 34], 6), lw * .7); stroke(quad([8, 34], [16, 42], [22, 36], 6), lw * .7); }
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) stroke([[8 + sx * 34, 30 + k * 8], [8 + sx * 90, 22 + k * 16]], 3);
  pop();
  pop();
}

// —— Sorin: the inventor. Backwards cap, huge black beard, striped T-shirt, yellow rubber gloves. ——
export function sorin(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 6 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); if (P.rot) rotate(P.rot); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 30, -220], ank = [sx * 34, -24];
    shape(noodle(hip, ank, sx * -4, 44, 38), { fill: C.pants, lw: 7 });
    shape(spline([[ank[0] - 30, ank[1] + 24], [ank[0] - 26, ank[1] - 4], [ank[0] + 14, ank[1] - 6], [ank[0] + 50, ank[1] + 10], [ank[0] + 46, ank[1] + 26]]), { fill: '#3a2a20', lw: 6 });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-70, -440], shF = [66, -438];
  const arm = (sh, a, hold) => {
    const hp = [sh[0] + a.h[0], sh[1] + a.h[1]];
    shape(noodle(sh, hp, a.bend ?? 0, 38, 30), { fill: C.shirt, lw: 7 });
    if (hold === 'can') { push(); translate(hp[0] + 10, hp[1] - 20); shape(rr(-28, -40, 56, 60, 8), { fill: '#c9d2dc', lw: 6, shade: () => fillOnly(rect(-30, -24, 60, 24), '#e2523b', { boil: .3 }) }); text('PEȘTE', 0, -12, { font: '800 14px "Baloo 2"', fill: '#fff' }); pop(); }
    hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), 22, C.glove);
  };
  arm(shB, P.armB || { h: [-20, 200], bend: -14 });
  // round belly in a striped T-shirt
  shape(spline([[-50, -480], [-110, -440], [-130, -320], [-120, -200], [0, -180], [120, -200], [130, -320], [110, -440], [50, -480]]), { fill: C.shirt, lw: 7, shade: () => {
    for (let k = 0; k < 6; k++) fillOnly(rect(-160, -460 + k * 46, 320, 20), C.shirtW, { boil: .3 });
    fillOnly(ell(70, -320, 60, 140, 20), 'rgba(0,0,0,.12)', { boil: .3 });
  } });
  push(); translate(0, -580); rotate(P.headTilt ?? 0);
  head(P, ner);
  pop();
  arm(shF, P.armF || { h: [30, 200], bend: 14 }, P.hold);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-90, -720 + u * 40, 1); sweat(100, -700 + ((u + .5) % 1) * 40, .8); }
  pop();
}
function head(P, ner) {
  for (const sx of [-1, 1]) shape(ell(sx * 78, 10, 16, 24, 14), { fill: C.skin, lw: 6 });
  shape(ell(0, 0, 82, 92, 40), { fill: C.skin, lw: 7, shade: () => fillOnly(ell(40, 0, 44, 80, 20), C.skinS, { boil: .3 }) });
  // backwards cap
  shape([...arc(0, -30, 90, 76, Math.PI * 1.02, Math.PI * 1.98, 24), [90, -30], [-90, -30]], { fill: C.cap, lw: 7 });
  shape(rr(-150, -50, 90, 26, 10), { fill: C.cap, lw: 6 });
  // the beard: a big black cloud
  const N = 14, cl = [];
  for (let i = 0; i <= N; i++) { const a = Math.PI * (.02 + i / N * .96), r = i % 2 ? 108 : 94; cl.push([Math.cos(a) * r * .95, 10 + Math.sin(a) * r]); }
  shape(spline([[-84, 10], ...cl, [84, 10], [50, 40], [0, 30], [-50, 40]]), { fill: C.beard, lw: 7 });
  const look = P.look || [0, 0], es = P.eyeS ?? 1, sh = ner ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * ner : 0;
  eye(-30, -14, 22 * es, 26 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look: [look[0] + sh * .02, look[1]], pupil: P.pupil ?? 4 });
  eye(28, -14, 20 * es, 24 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look: [look[0] + sh * .02, look[1]], pupil: P.pupil ?? 4 });
  const br = P.brow ?? 1;
  stroke([[-54, -52 + br * 2], [-14, -60 - br * 8]], 8); stroke([[50, -56 + br * 2], [14, -62 - br * 8]], 8);
  shape(ell(0, 24, 18, 14, 14), { fill: C.skinS, lw: 5 });
  const m = P.mouth || {};
  mouth(0, 62, 40 * (P.mouthS ?? 1), { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.5, lw: 5 });
}

// —— the clone printer: a fridge-sized box, round porthole door, a glowing button and a counter on top ——
export const PRN = { x: 1250, y: 900 };
export function printer(t, { door = 0, flash = 0, count = 1, press = 0 } = {}) {
  const { x, y } = PRN;
  push(); translate(x, y);
  shape(rr(-170, -460, 340, 460, 24), { fill: '#e8e4dc', lw: 8, shade: () => { fillOnly(rect(90, -470, 90, 480), '#cfcac0', { boil: .3 }); for (let k = 0; k < 4; k++) stroke([[-150, -60 - k * 16], [-60, -60 - k * 16]], 4, { line: '#a9a39a' }); } });
  // counter display
  shape(rr(-150, -440, 190, 70, 10), { fill: '#1b2a1b', lw: 6 });
  text('×' + (count >= 1000 ? (count / 1000).toFixed(count >= 2000 ? 0 : 1) + 'k' : count), -55, -402, { font: '400 56px VT323', fill: GLOW });
  // the button
  if (press > 0 || flash > 0) fillOnly(ell(100, -404, 52, 52, 24), `rgba(157,255,46,${.35 * Math.max(press, flash)})`, { boil: .4 });
  shape(ell(100, -404 + press * 4, 30, 30 - press * 6, 22), { fill: GLOW, lw: 6 });
  // porthole door
  fillOnly(ell(0, -190, 120, 120, 36), '#2b2230', { boil: .3 });
  if (flash > 0) fillOnly(ell(0, -190, 116, 116, 36), `rgba(157,255,46,${flash})`, { boil: .4 });
  push(); translate(-120, -190); scale(Math.cos(door * Math.PI * .5) || .02, 1);
  shape(ell(120, 0, 128, 128, 40), { fill: '#c9d2dc', lw: 8, shade: () => fillOnly(ell(120, 0, 96, 96, 36), flash > 0 ? `rgba(157,255,46,${.4 + .6 * flash})` : 'rgba(150,200,230,.55)', { boil: .3 }) });
  pop();
  pop();
}
