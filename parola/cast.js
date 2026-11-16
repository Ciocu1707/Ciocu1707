// cast.js — "Tata și parola": Tata (seated, magnifying glass), Mama (arms crossed), Andrei (teen on the sofa, grows a beard), Rex (dachshund).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

const C = { white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  skinT: '#f0c49a', skinTs: '#d29d72', cardigan: '#8a8f9a', cardiganS: '#6e737e', hairGrey: '#d9d9d9',
  skinM: '#f6d2b8', skinMs: '#e0ad8c', hairM: '#7a3a2a', apron: '#ffb3c6', dress: '#3a7bd5',
  skinA: '#e8b48a', hoodie: '#e2523b', hoodieS: '#b63a27', hairA: '#2b2230', beard: '#4a3428',
  dog: '#b5652e', dogS: '#8a4a20', collar: '#3a7bd5', gold: '#f2c230' };

export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = C.skinT, lw = 6, spin = -1, t = 0, closed = false } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 30), { fill: C.white, lw, shade: () => {
    if (spin >= 0) {   // the loading spinner: 8 dots around the eye, one bright, the tail fading
      const k = Math.floor(t * 12) % 8;
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, f = ((i - k + 8) % 8) / 8; dot(cx + Math.cos(a) * rx * .55, cy + Math.sin(a) * ry * .55, rx * .16, `rgba(27,20,34,${.12 + .88 * (1 - f)})`); }
    } else dot(cx + look[0] * rx * .55, cy + look[1] * ry * .5, pupil);
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
const hand = (x, y, ang, r, col, point = false) => { push(); translate(x, y); rotate(ang); shape(spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]]), { fill: col, lw: 6 }); if (point) shape(rr(r * .6, -r * .3, r * 1.4, r * .55, r * .25), { fill: col, lw: 5 }); pop(); };
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— the magnifying glass: brass rim, a lens that enlarges what's behind it (we fake it with a pale tint) ——
export function lens(x, y, r, a = 0) {
  push(); translate(x, y); rotate(a);
  shape(rr(-14, r * .95, 28, r * 1.3, 10), { fill: '#7a4a24', lw: 6 });
  shape(ell(0, 0, r, r, 40), { fill: 'rgba(200,235,255,.28)', lw: 12, line: '#c4952e' });
  stroke(ell(0, 0, r, r, 40), 6);
  stroke(arc(0, 0, r * .7, r * .7, Math.PI * 1.1, Math.PI * 1.45, 10), 8, { line: 'rgba(255,255,255,.85)' });
  pop();
}

// —— Tata, seated in his armchair, facing left toward the TV (face = -1 by default). Origin at the floor under the seat. ——
// P: {x,y,s,face,lid,look,brow,mouth,blink,spin(t or -1),sweat,lensUp(0..1),lensAt:[x,y] local, finger:{h}, webs, dust}
export function tata(P) {
  const f = P.face ?? -1;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * f, P.s ?? 1);
  // armchair back
  shape(rr(-170, -520, 200, 440, 50), { fill: '#7a3a2a', lw: 7, shade: () => fillOnly(rect(-180, -530, 70, 460), '#5c2a1e', { boil: .3 }) });
  // legs + slippers
  shape(noodle([0, -200], [110, -200], 0, 70, 66), { fill: '#5a5f6a', lw: 7 });
  shape(noodle([110, -200], [120, -30], 0, 60, 52), { fill: '#5a5f6a', lw: 7 });
  shape(spline([[90, -10], [96, -40], [140, -44], [190, -26], [184, 0]]), { fill: '#3a7bd5', lw: 6 });
  // round body in a grey cardigan
  push(); rotate(P.lean ?? .06);
  shape(spline([[-40, -470], [-120, -430], [-140, -300], [-110, -190], [40, -170], [140, -230], [150, -350], [100, -450], [20, -480]]), { fill: C.cardigan, lw: 7, shade: () => {
    fillOnly(ell(-60, -320, 70, 140, 20), C.cardiganS, { boil: .3 });
    for (let k = 0; k < 4; k++) shape(ell(70, -420 + k * 60, 9, 9, 10), { fill: '#3a2a20', lw: 4 });
  } });
  // head
  push(); translate(40, -560); rotate(P.headTilt ?? 0);
  headTata(P);
  pop();
  // the arm with the magnifying glass (raised to the eye, or lowered)
  const up = P.lensUp ?? 1, la = P.lensAt || [lerp(150, 230, up), lerp(-300, -560, up)];
  shape(noodle([60, -420], [la[0] - 30, la[1] + 70], -30, 40, 32), { fill: C.cardigan, lw: 7 });
  hand(la[0] - 30, la[1] + 70, -1.2, 20, C.skinT);
  lens(la[0], la[1], P.lensR ?? 70, .15);
  // the typing finger (with the remote)
  const fh = P.finger || [190, -260];
  shape(noodle([40, -400], fh, 30, 40, 32), { fill: C.cardigan, lw: 7 });
  push(); translate(fh[0], fh[1]); shape(rr(-10, -24, 70, 34, 8), { fill: '#2b2230', lw: 5 }); dot(46, -8, 5, '#e2523b'); pop();
  hand(fh[0], fh[1], 0, 20, C.skinT, true);
  pop();
  // armchair arm in front
  shape(rr(-150, -240, 330, 90, 40), { fill: '#7a3a2a', lw: 7 });
  shape(rect(-140, -160, 300, 160), { fill: '#7a3a2a', lw: 7, shade: () => fillOnly(rect(-150, -60, 320, 70), '#5c2a1e', { boil: .3 }) });
  if (P.sweat != null) { const u = P.sweat % 1; sweat(120, -700 + u * 40, 1); }
  if (P.web) stroke(spline([[60, -690], [-40, -760], [-160, -700]], false), 3, { line: '#f4f4f4' });
  pop();
}
function headTata(P) {
  shape(ell(-70, 10, 16, 26, 16), { fill: C.skinT, lw: 6 });
  shape(spline([[0, -110], [70, -90], [96, -20], [90, 60], [56, 110], [-10, 120], [-70, 90], [-90, 10], [-70, -80]]), { fill: C.skinT, lw: 7, shade: () => fillOnly(ell(-40, 20, 40, 80, 16), C.skinTs, { boil: .3 }) });
  stroke(arc(10, 104, 50, 18, Math.PI * .1, Math.PI * .9, 10), 5);   // double chin
  // comb-over: three long hairs
  for (let k = 0; k < 3; k++) stroke(spline([[-70, -40 + k * 6], [-30, -112 + k * 6], [30, -116 + k * 4], [70, -86 + k * 8]], false), 4);
  shape(spline([[-92, -20], [-80, -60], [-62, -30], [-70, 20]]), { fill: C.hairGrey, lw: 5 });
  const look = P.look || [0, 0], lid = P.blink ? 1 : (P.lid ?? .45), spin = P.spin ?? -1;
  eye(16, -14, 22, 26, { lid: spin >= 0 ? 0 : lid, look, pupil: 4, spin, t: spin });
  eye(62, -16, 18, 22, { lid: spin >= 0 ? 0 : lid, look, pupil: 4, spin, t: spin + .3 });
  // glasses low on the nose
  stroke(rr(-6, 6, 50, 34, 10), 5); stroke(rr(48, 4, 40, 32, 10), 5); stroke([[44, 20], [48, 20]], 4);
  const br = P.brow ?? 0;
  shape(spline([[-10, -48 - br * 6], [40, -58 - br * 8], [44, -44 - br * 6], [-6, -36 - br * 5]]), { fill: C.hairGrey, lw: 5 });
  shape(spline([[52, -56 - br * 8], [92, -48 - br * 6], [90, -38 - br * 5], [54, -44 - br * 6]]), { fill: C.hairGrey, lw: 5 });
  shape(ell(70, 34, 24, 20, 16), { fill: C.skinTs, lw: 6 });
  const m = P.mouth || {};
  mouth(40, 76, 40, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.2, lw: 5 });
}

// —— Mama: standing, arms crossed, hair bun with a pencil, floral apron ——
export function mama(P) {
  const f = P.face ?? -1;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * f, P.s ?? 1);
  for (const sx of [-1, 1]) { shape(noodle([sx * 26, -230], [sx * 30, -24], 0, 30, 26), { fill: C.skinM, lw: 6 }); shape(spline([[sx * 30 - 24, -6], [sx * 30 - 20, -30], [sx * 30 + 30, -30], [sx * 30 + 40, -6]]), { fill: '#e2523b', lw: 6 }); }
  shape(spline([[-60, -560], [-100, -480], [-120, -230], [0, -210], [120, -230], [100, -480], [60, -560]]), { fill: C.dress, lw: 7 });
  shape(spline([[-70, -470], [70, -470], [92, -240], [-92, -240]]), { fill: C.apron, lw: 6, shade: () => { for (let i = 0; i < 9; i++) shape(ell(-60 + (i % 3) * 60, -420 + Math.floor(i / 3) * 70, 12, 12, 10), { fill: '#fff', lw: 3 }); } });
  // head
  push(); translate(0, -660); rotate(P.headTilt ?? 0);
  shape(ell(0, -110, 56, 50, 24), { fill: C.hairM, lw: 7 }); stroke([[-20, -170], [40, -90]], 6, { line: '#f2c230' });   // bun + pencil
  shape(ell(0, 0, 80, 92, 36), { fill: C.skinM, lw: 7, shade: () => fillOnly(ell(40, 10, 40, 80, 16), C.skinMs, { boil: .3 }) });
  shape(spline([[-84, 0], [-80, -70], [-20, -100], [60, -96], [86, -40], [84, 0], [60, -50], [-50, -56]]), { fill: C.hairM, lw: 6 });
  const look = P.look || [0, 0], lid = P.blink ? 1 : (P.lid ?? .3);
  eye(-26, 0, 20, 22, { lid, look, pupil: 4, skin: C.skinM });
  eye(28, -2, 18, 20, { lid, look, pupil: 4, skin: C.skinM });
  const br = P.brow ?? -1;   // negative = stern (inner ends down)
  stroke([[-50, -34 - br * 6], [-10, -30 + br * 6]], 7); stroke([[50, -36 - br * 6], [12, -32 + br * 6]], 7);
  stroke([[4, 14], [14, 38], [2, 42]], 5);
  const m = P.mouth || {};
  mouth(4, 66, 40, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.3, lw: 6 });
  shape(ell(4, 66, 22, 6, 12), { fill: 'rgba(210,40,70,.55)', stroke: false });
  pop();
  // crossed arms: two bands across the chest
  if (P.crossed !== false) { shape(rr(-110, -430, 220, 60, 28), { fill: C.dress, lw: 7 }); shape(rr(-100, -396, 200, 54, 26), { fill: C.dress, lw: 7 }); hand(96, -404, 0, 18, C.skinM); hand(-96, -370, Math.PI, 18, C.skinM); }
  pop();
}

// —— Andrei on the sofa: red hoodie, mop of hair, popcorn; beard and hair grow with `grow` 0..1 ——
export function andrei(P) {
  const f = P.face ?? -1, g = P.grow ?? 0;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * f, P.s ?? 1);
  shape(spline([[-80, -380], [-110, -260], [-100, -120], [0, -100], [100, -120], [110, -260], [80, -380], [0, -400]]), { fill: C.hoodie, lw: 7, shade: () => fillOnly(ell(50, -240, 50, 120, 16), C.hoodieS, { boil: .3 }) });
  stroke(arc(0, -380, 60, 30, 0, Math.PI, 10), 6, { line: '#f2c230' });   // headphones on the neck
  push(); translate(0, -480); rotate(P.headTilt ?? 0);
  shape(ell(0, 10, 72, 84, 30), { fill: C.skinA, lw: 7 });
  // the beard grows during the time lapse
  if (g > .05) shape(spline([[-70, 10], [-60, 80 + g * 120], [0, 110 + g * 200], [60, 80 + g * 120], [70, 10], [40, 50], [-40, 50]]), { fill: C.beard, lw: 6 });
  // mop of hair, longer with g
  const L = 40 + g * 260;
  shape(spline([[-90, 0], [-84, -80], [-30, -110], [40, -106], [92, -60], [96, 10 + L * .3], [80, L], [60, 0], [30, -30], [-10, 0], [-40, -20], [-74, L * .8]]), { fill: C.hairA, lw: 7 });
  const look = P.look || [0, 0], lid = P.blink ? 1 : (P.lid ?? .2);
  eye(-24, 6, 18, 20, { lid, look, pupil: 4, skin: C.skinA });
  eye(26, 4, 16, 18, { lid, look, pupil: 4, skin: C.skinA });
  const br = P.brow ?? 1; stroke([[-44, -24 + br * 2], [-8, -30 - br * 6]], 6); stroke([[46, -26 + br * 2], [12, -32 - br * 6]], 6);
  const m = P.mouth || {};
  if (g < .4 || (m.o || 0) > .1) mouth(2, 60, 34, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.4, lw: 5 });
  pop();
  // popcorn bowl in the lap
  const pc = P.popcorn ?? 1;
  shape([[-90, -170], [90, -170], [70, -100], [-70, -100]], { fill: '#e2523b', lw: 6, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(-80 + k * 44, -175, 20, 80), '#fff', { boil: .3 }); } });
  for (let i = 0; i < Math.floor(14 * pc); i++) shape(ell(-70 + (i % 7) * 22, -180 - Math.floor(i / 7) * 18, 14, 12, 10), { fill: '#fff6d8', lw: 3 });
  for (const sx of [-1, 1]) hand(sx * 96, -150, sx < 0 ? Math.PI : 0, 18, C.skinA);
  pop();
}

// —— Rex the dachshund: long body, short legs, a collar with a tag ——
export function rex(x, y, s = 1, { face = 1, t = 0, walk = false, bark = 0, sit = false } = {}) {
  push(); translate(x, y); scale(s * face, s);
  const ph = walk ? t * 12 : 0;
  for (const [lx, o] of [[-90, 0], [-50, Math.PI], [70, Math.PI], [110, 0]]) stroke([[lx, -50], [lx + Math.sin(ph + o) * 12, -4]], 12, { line: C.dogS });
  stroke(spline([[-140, -80], [-180, -110 + Math.sin(t * 14) * 14], [-200, -130]], false), 10, { line: C.dog });
  shape(rr(-150, -110, 300, 70, 35), { fill: C.dog, lw: 7, shade: () => fillOnly(rect(-150, -60, 300, 30), C.dogS, { boil: .3 }) });
  push(); translate(150, -110); rotate(bark ? -.3 : 0);
  shape(ell(0, 0, 46, 40, 20), { fill: C.dog, lw: 7 });
  shape(spline([[30, -6], [100, 0], [104, 24], [40, 30]]), { fill: C.dog, lw: 6 });
  dot(102, 8, 9);
  shape(spline([[-30, -20], [-60, 30], [-40, 70], [-14, 20]]), { fill: C.dogS, lw: 6 });
  eye(16, -12, 12, 13, { pupil: 4, skin: C.dog, lw: 5 });
  if (bark) mouth(70, 30, 30, { o: bark, lw: 4, teeth: false });
  pop();
  shape(rr(110, -96, 30, 60, 10), { fill: C.collar, lw: 5 });
  shape(ell(126, -30, 16, 16, 14), { fill: C.gold, lw: 5 });
  pop();
}
export const TAG = [126, -30];   // the tag, in rex() local coordinates
