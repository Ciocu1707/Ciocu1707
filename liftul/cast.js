// cast.js — "Liftul": Tanti Leana (deadpan lift operator) and Mihai (panicked intern). Origin at the feet, y down.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const GLOW = '#ff4fd8';   // the lift's magic: only the lever knob and the door gap glow
const P_ = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  skinM: '#f6d2b8', skinMs: '#e0ad8c', hairM: '#ff7a1a', hairMs: '#d95a00', hoodie: '#3aa35a', hoodieS: '#2a7d43', jeans: '#3b6fd6', jeansS: '#2a52a8', tie: '#e2523b',
  skinL: '#f0c49a', skinLs: '#d29d72', jacket: '#d33a3a', jacketS: '#a82828', gold: '#f2c230', cap: '#7a4a24', capS: '#5c361a', stool: '#3a2a20', yarn: '#7fd3ff',
  cup: '#f7f3ea', coffee: '#6b3e26', tray: '#c9d2dc',
};
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = P_.skinM, closed = false, lw = 6, jitter = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), { fill: P_.white, lw, shade: () => {
    dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw); }
  } });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  shape([...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)], { fill: P_.mouthIn, lw, shade: () => {
    if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), P_.white, { boil: .3 });
    fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), P_.tongue, { boil: .3 });
  } });
}
function hand(x, y, ang, r, col, fist = false) {
  push(); translate(x, y); rotate(ang);
  shape(fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]), { fill: col, lw: 6 });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// a coffee cup (steaming); local origin = cup bottom
export function cup(x, y, s = 1, { steam = 1, t = 0, empty = false } = {}) {
  push(); translate(x, y); scale(s);
  shape(spline([[30, -50], [52, -46], [52, -22], [30, -18]], false).concat([[30, -26], [42, -28], [42, -42], [30, -42]]), { fill: P_.cup, lw: 5 });
  shape([[-32, -64], [32, -64], [24, 0], [-24, 0]], { fill: P_.cup, lw: 6, shade: () => fillOnly(rect(8, -70, 30, 80), '#d9d1c1', { boil: .3 }) });
  shape(ell(0, -64, 32, 8, 18), { fill: empty ? '#d9d1c1' : P_.coffee, lw: 5 });
  if (steam) for (let k = 0; k < 2; k++) { const ph = (t * 1.3 + k * .5) % 1, y0 = -80 - ph * 50, x0 = -12 + k * 24; stroke(spline([[x0, y0], [x0 + 8, y0 - 16], [x0 - 6, y0 - 32], [x0 + 6, y0 - 48]], false), 5, { line: `rgba(255,255,255,${.85 * (1 - ph) * steam})` }); }
  pop();
}
// a floating coffee blob (zero gravity)
export function blob(x, y, s, t) {
  const N = 14, pts = [];
  for (let i = 0; i < N; i++) { const a = i / N * TAU, r = 40 * s * (1 + .18 * Math.sin(a * 3 + t * 6) + .1 * Math.sin(a * 5 - t * 4)); pts.push([x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r]); }
  shape(pts, { fill: P_.coffee, lw: 6, shade: () => fillOnly(ell(x - 12 * s, y - 14 * s, 12 * s, 7 * s, 10), 'rgba(255,255,255,.5)', { boil: .2 }) });
}

// —— Mihai: tall lanky intern with a coffee tray ——
// P: {x,y,s,face,lean,sq,bob,rot, lid,look,brow,eyeS,pupil,mouth,blink,nerv,t, armF:{h,bend}, armB, tray:'cup'|'empty'|null, sweat, hairUp}
export function mihai(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 6 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); if (P.rot) rotate(P.rot); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  // legs: long jeans, white sneakers
  for (const [sx, lg] of [[-1, P.legB || [0, 0]], [1, P.legF || [0, 0]]]) {
    const hip = [sx * 22, -300], ank = [sx * 26 + lg[0], -24 + lg[1]];
    shape(noodle(hip, ank, sx * 8, 34, 30), { fill: P_.jeans, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 6 : -40, -310, 34, 290), P_.jeansS, { boil: .3 }) });
    shape(spline([[ank[0] - 26, ank[1] + 24], [ank[0] - 24, ank[1] - 2], [ank[0] + 16, ank[1] - 6], [ank[0] + 52, ank[1] + 10], [ank[0] + 48, ank[1] + 26]]), { fill: '#f7f7f2', lw: 6, shade: () => fillOnly(rect(ank[0] - 30, ank[1] + 18, 90, 14), '#e2523b', { boil: .3 }) });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-50, -520], shF = [48, -518];
  const arm = (sh, a, front) => {
    const hp = [sh[0] + a.h[0], sh[1] + a.h[1]];
    shape(noodle(sh, hp, a.bend ?? 0, 30, 24), { fill: P_.hoodie, lw: 7 });
    const ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    if (front && P.tray) {   // the tray rests flat on the palm
      shape(rr(hp[0] - 70, hp[1] - 16, 140, 16, 6), { fill: P_.tray, lw: 6 });
      if (P.tray === 'cup') cup(hp[0] + 10, hp[1] - 16, .9, { t: P.t || 0 });
      hand(hp[0], hp[1] + 6, 0, 16, P_.skinM);
      return;
    }
    hand(hp[0], hp[1], ang, 16, P_.skinM, !!a.fist);
  };
  arm(shB, P.armB || { h: [-20, 200], bend: -12 }, false);
  // hoodie torso + tie + lanyard
  shape(spline([[-36, -560], [-70, -530], [-78, -400], [-72, -290], [0, -280], [72, -290], [78, -400], [70, -530], [36, -560]]), { fill: P_.hoodie, lw: 7, shade: () => {
    fillOnly(spline([[20, -570], [80, -530], [96, -400], [90, -280], [40, -280], [56, -420]]), P_.hoodieS, { boil: .4 });
    shape(rr(-50, -380, 100, 46, 12), { fill: P_.hoodieS, lw: 4 });   // front pocket
  } });
  shape([[-12, -556], [12, -556], [16, -420], [0, -396], [-16, -420]], { fill: P_.tie, lw: 5 });
  stroke([[-30, -556], [-20, -470], [0, -440]], 3, { line: '#3b6fd6' }); stroke([[30, -556], [20, -470], [0, -440]], 3, { line: '#3b6fd6' });
  shape(rr(-22, -446, 44, 56, 6), { fill: '#fffaf0', lw: 4 }); stroke([[-12, -428], [12, -428]], 3); stroke([[-12, -414], [6, -414]], 3);
  // neck + head
  shape(noodle([0, -556], [4, -600], 0, 26, 26), { fill: P_.skinM, lw: 6 });
  push(); translate(6, -690); rotate(P.headTilt ?? 0);
  headMihai(P, ner);
  pop();
  arm(shF, P.armF || { h: [60, 120], bend: 30 }, true);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-80, -780 + u * 40, 1); sweat(90, -760 + ((u + .5) % 1) * 40, .8); }
  pop();
}
function headMihai(P, ner) {
  // ears
  for (const sx of [-1, 1]) shape(ell(sx * 64, 10, 18, 28, 16), { fill: P_.skinM, lw: 6 });
  // hair tuft: a carrot flame (stands up straighter in zero gravity)
  const up = P.hairUp ?? 0;
  shape(spline([[-50, -60], [-40, -120 - up * 40], [-10, -100], [0, -170 - up * 60], [30, -110], [56, -140 - up * 30], [56, -60]]), { fill: P_.hairM, lw: 7, shade: () => fillOnly(ell(30, -100, 30, 60, 14), P_.hairMs, { boil: .3 }) });
  shape(spline([[-6, -96], [50, -86], [66, -20], [60, 60], [30, 100], [-24, 100], [-58, 60], [-64, -20], [-50, -80]]), { fill: P_.skinM, lw: 7, shade: () => fillOnly(ell(40, 30, 30, 70, 16), P_.skinMs, { boil: .3 }) });
  for (let i = 0; i < 7; i++) dot(-34 + (i % 4) * 20 + (i > 3 ? 70 : 0), 30 + (i % 2) * 10, 3, '#d9825a');
  const look = P.look || [0, 0], sh = ner ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * ner : 0, es = P.eyeS ?? 1;
  eye(-20, -8, 26 * es, 32 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 4, skin: P_.skinM, jitter: sh });
  eye(30, -10, 22 * es, 28 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 4, skin: P_.skinM, jitter: sh });
  const br = P.brow ?? 1;
  stroke([[-44, -50 + br * 2], [-8, -58 - br * 8]], 7); stroke([[56, -54 + br * 2], [20, -60 - br * 8]], 7);
  stroke([[4, 10], [16, 34], [4, 40]], 5);
  const m = P.mouth || {};
  mouth(6, 66, 40 * (P.mouthS ?? 1), { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.5, lw: 5 });
}

// —— Tanti Leana: tiny, round, on a stool, aviator cap, knitting ——
// P: {x,y,s,face,lid,look,mouth,blink,brow, armF:{h,bend}, hold:'needles'|'cup'|'lever', sip, t}
export function leana(P) {
  const f = P.face ?? 1;
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  // stool
  shape(rect(-70, -190, 140, 26), { fill: P_.stool, lw: 6 });
  for (const sx of [-1, 1]) stroke([[sx * 54, -166], [sx * 70, 0]], 9);
  stroke([[-62, -80], [62, -80]], 6);
  // dangling legs + orthopaedic shoes
  for (const sx of [-1, 1]) { shape(noodle([sx * 26, -200], [sx * 30 + 20, -110], 0, 26, 22), { fill: '#3a2a20', lw: 6 }); shape(spline([[sx * 30 - 4, -120], [sx * 30 + 50, -120], [sx * 30 + 54, -96], [sx * 30 - 6, -96]]), { fill: '#2b2230', lw: 6 }); }
  // round body: red jacket, gold buttons
  shape(ell(0, -300, 110, 130, 40), { fill: P_.jacket, lw: 7, shade: () => {
    fillOnly(ell(60, -280, 70, 120, 24), P_.jacketS, { boil: .3 });
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) shape(ell(sx * 26, -360 + k * 50, 9, 9, 10), { fill: P_.gold, lw: 4 });
  } });
  for (const sx of [-1, 1]) shape(rr(sx * 90 - 30, -420, 60, 22, 8), { fill: P_.gold, lw: 5 });   // epaulettes
  // knitting in the lap
  if (P.knit !== false) { shape(ell(-40, -200, 30, 28, 18), { fill: P_.yarn, lw: 5, shade: () => { for (let k = 0; k < 3; k++) stroke(arc(-40, -200, 20 - k * 6, 20 - k * 6, 0, Math.PI * 1.4, 8), 3, { line: '#3aa0d8' }); } }); }
  // head
  push(); translate(0, -500); rotate(P.headTilt ?? 0);
  headLeana(P);
  pop();
  // front arm
  const sh = [70, -380], a = P.armF || { h: [-40, 150], bend: 20 }, hp = [sh[0] + a.h[0], sh[1] + a.h[1]];
  shape(noodle(sh, hp, a.bend ?? 0, 40, 32), { fill: P_.jacket, lw: 7 });
  if (P.hold === 'cup') cup(hp[0] + 2, hp[1] + 30, .8, { t: P.t || 0, steam: 0 });
  if (P.hold === 'needles') { stroke([[hp[0] - 40, hp[1] - 50], [hp[0] + 30, hp[1] + 30]], 5, { line: '#c9d2dc' }); stroke([[hp[0] - 10, hp[1] - 60], [hp[0] - 10, hp[1] + 40]], 5, { line: '#c9d2dc' }); }
  if (P.hold === 'needle') stroke([[hp[0], hp[1]], [hp[0] + 110, hp[1] - 40]], 6, { line: '#c9d2dc' });
  hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), 18, P_.skinL, true);
  pop();
}
function headLeana(P) {
  shape(ell(0, 0, 90, 88, 40), { fill: P_.skinL, lw: 7, shade: () => fillOnly(ell(46, 20, 50, 70, 20), P_.skinLs, { boil: .3 }) });
  // aviator cap with ear flaps and goggles on the forehead
  shape([...arc(0, -6, 98, 96, Math.PI * 1.02, Math.PI * 1.98, 26), [98, 0], [-98, 0]], { fill: P_.cap, lw: 7, shade: () => fillOnly(ell(40, -50, 50, 40, 16), P_.capS, { boil: .3 }) });
  for (const sx of [-1, 1]) shape(spline([[sx * 96, -10], [sx * 104, 40], [sx * 86, 76], [sx * 70, 40], [sx * 74, -10]]), { fill: P_.cap, lw: 6 });
  for (const gx of [-30, 30]) shape(ell(gx, -50, 26, 20, 18), { fill: '#737b87', lw: 6, shade: () => fillOnly(ell(gx, -50, 17, 13, 14), '#9fd6f2', { boil: .3 }) });
  stroke([[-4, -50], [4, -50]], 6);
  // small deadpan eyes, heavy lids
  const lid = P.blink ? 1 : clamp(P.lid ?? .55, 0, 1), look = P.look || [0, 0];
  eye(-26, 6, 18, 18, { lid, look, pupil: 3.5, skin: P_.skinL });
  eye(24, 6, 16, 17, { lid, look, pupil: 3.5, skin: P_.skinL });
  const br = P.brow ?? 0; stroke([[-42, -20 - br * 4], [-12, -22 - br * 6]], 6, { line: '#cfcfcf' }); stroke([[10, -22 - br * 6], [40, -20 - br * 4]], 6, { line: '#cfcfcf' });
  // big nose, small mouth, a mole
  shape(spline([[-6, 10], [14, 36], [10, 54], [-14, 54], [-20, 36]]), { fill: P_.skinL, lw: 6, shade: () => fillOnly(ell(4, 48, 12, 7, 10), P_.skinLs, { boil: .3 }) });
  dot(44, 44, 5, '#7a4a24');
  const m = P.mouth || {};
  mouth(0, 72, 30, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.2, lw: 5, teeth: false });
}
