// chars.js — the cast of "Pe așteptare": Doru (deadpan inventor), Ilinca (nervous, on hold), Pufi (the creature), props.
// Local coordinates: origin at the feet, y down. face = 1 looks right (3/4 view), -1 mirrors.
// Face helpers (eye, mouth, hand) follow the parametric approach of the style's engine.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const GLOW = '#39f0ff';           // the time device's colour: nothing else uses it
export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  skinD: '#f0c49a', skinDs: '#d29d72', stache: '#2b2230', vest: '#e2a72e', vestS: '#b98118', shirt: '#9aa6b8', shirtS: '#7b879a',
  pants: '#6b4a3a', pantsS: '#523628', colander: '#c9d2dc', colanderS: '#9aa6b4', slipD: '#5f7fd6',
  skinI: '#f6d2b8', skinIs: '#dfae92', hair: '#8a4fd8', hairS: '#6b33b5', robe: '#ff8fb8', robeS: '#e2648f', slipI: '#ffe27a',
  phone: '#e2523b', phoneS: '#b63a27', pufi: '#9bd83a', pufiS: '#6fae1f', pufiSpot: '#7a3fc0',
};

// —— face parts ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.skinD, closed = false, lw = 6, jitter = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  shape([...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)], {
    fill: PAL.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 20, col = PAL.skinD, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });
const wrinkles = (x, y, n, w, lw = 3.5) => { for (let i = 0; i < n; i++) stroke(arc(x, y + i * 9, w - i * 4, 6, Math.PI * .15, Math.PI * .85, 8), lw); };

// —— props ——
// Corded receiver, held at the ear; local origin = grip centre, long axis along y
export function receiver(x, y, a = 0, s = 1) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(spline([[-16, -78], [16, -78], [20, -40], [14, 40], [18, 78], [-18, 78], [-14, 40], [-20, -40]]), { fill: PAL.phone, lw: 7, shade: () => fillOnly(rect(4, -90, 30, 180), PAL.phoneS, { boil: .3 }) });
  shape(rr(-30, -112, 60, 44, 16), { fill: PAL.phone, lw: 7, shade: () => fillOnly(rect(8, -120, 30, 60), PAL.phoneS, { boil: .3 }) });
  shape(rr(-30, 70, 60, 44, 16), { fill: PAL.phone, lw: 7, shade: () => fillOnly(rect(8, 60, 30, 60), PAL.phoneS, { boil: .3 }) });
  pop();
}
// Curly cord from a to b
export function cord(a, b, sag = 80) {
  const pts = []; const n = 60;
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag;
    pts.push([x + Math.cos(u * 46) * 9, y + Math.sin(u * 46) * 9]);
  }
  stroke(pts, 4, { boil: .4 });
}
// The "Sărito-matic": a beige TV remote with one big glowing button
export function remote(x, y, a = 0, { press = 0, glow = 0 } = {}) {
  push(); translate(x, y); rotate(a);
  shape(rr(-24, -70, 48, 120, 12), { fill: '#efe3c8', lw: 6, shade: () => fillOnly(rect(8, -80, 26, 140), '#d4c4a2', { boil: .3 }) });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) shape(rr(-14 + c * 16, 8 + r * 12, 12, 8, 3), { fill: '#8b7d66', lw: 3 });
  if (glow > 0) fillOnly(ell(0, -36, 30 + glow * 10, 30 + glow * 10, 20), 'rgba(57,240,255,.28)', { boil: .5 });
  shape(ell(0, -36 + press * 3, 16, 16 - press * 4, 22), { fill: GLOW, lw: 5 });
  stroke([[-6, -40], [0, -32], [6, -40]], 3);          // a skip arrow
  stroke([[2, -40], [8, -32], [14, -40]], 3);
  pop();
}

// —— Doru ——
// P: {x,y,s,face,lean,sq,bob, lid,look,brow,mouth:{o,w,sm},blink, armR:{h,bend}, armL, holdR:'remote', press, glow, age(0..2), dust}
export function doru(P) {
  const f = P.face ?? 1, age = P.age ?? 0, old = clamp(age, 0, 1), ancient = clamp(age - 1, 0, 1);
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  const hunch = old * .12 + ancient * .06;
  // legs + slippers
  for (const sx of [-1, 1]) {
    const hip = [sx * 30, -170], ank = [sx * 34, -26];
    shape(noodle(hip, ank, sx * -4, 46, 40), { fill: PAL.pants, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 10 : -60, -180, 50, 170), PAL.pantsS, { boil: .3 }) });
    shape(spline([[ank[0] - 34, ank[1] + 26], [ank[0] - 30, ank[1] + 2], [ank[0] + 14, ank[1] - 2], [ank[0] + 50, ank[1] + 14], [ank[0] + 44, ank[1] + 28]]), { fill: PAL.slipD, lw: 7 });
  }
  push(); rotate((P.lean ?? .03) + hunch);
  const shB = [-62, -400], shF = [58, -398];
  const drawArm = (sh, arm, holding) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 44, 34), { fill: PAL.shirt, lw: 7, shade: () => fillOnly(ell(sh[0] + 30, sh[1] + 60, 30, 90), PAL.shirtS, { boil: .3 }) });
    const ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    if (holding === 'remote') { hand(hp[0], hp[1], ang, 20, PAL.skinD, { fist: true }); remote(hp[0] + 6, hp[1] - 30, -(P.lean ?? 0) + (arm.ra || 0), { press: P.press || 0, glow: P.glow || 0 }); return; }
    hand(hp[0], hp[1], ang, 20, PAL.skinD, { fist: !!arm.fist });
  };
  drawArm(shB, P.armL || { h: [-16, 190], bend: -16 });
  // body: grey shirt under a mustard knitted vest, pear-shaped
  const body = spline([[-40, -440], [-92, -400], [-112, -280], [-118, -170], [0, -150], [118, -168], [110, -280], [88, -400], [40, -440]]);
  shape(body, {
    fill: PAL.vest, lw: 7, shade: () => {
      fillOnly(spline([[40, -450], [110, -400], [130, -280], [130, -150], [60, -150], [80, -300]]), PAL.vestS, { boil: .4 });
      for (let k = 0; k < 7; k++) stroke([[-110, -380 + k * 32], [-60, -372 + k * 32], [-10, -380 + k * 32], [40, -372 + k * 32], [100, -380 + k * 32]], 3, { line: PAL.vestS });
      fillOnly([[-26, -450], [26, -450], [0, -370]], PAL.shirt, { boil: .4 });
    }
  });
  stroke([[-26, -440], [0, -370], [26, -440]], 5);
  // neck + head
  shape(noodle([0, -436], [6, -470], 2, 40, 40), { fill: PAL.skinD, lw: 6 });
  push(); translate(10, -560); rotate(P.headTilt ?? .05);
  headDoru(P, old, ancient);
  pop();
  drawArm(shF, P.armR || { h: [16, 190], bend: 16 }, P.holdR);
  pop();
  if (P.dust) for (let i = 0; i < 9; i++) dot(-90 + hash(i * 3.3) * 200, -560 + hash(i * 5.1) * 520, 3 + hash(i) * 3, '#b9a37a');
  pop();
}
function headDoru(P, old, ancient) {
  const skin = ancient > .5 ? '#ead2b8' : PAL.skinD;
  shape(ell(-78, 10, 16, 26, 18), { fill: skin, lw: 6 });
  shape(spline([[-10, -120], [60, -110], [92, -50], [96, 30], [80, 90], [30, 116], [-30, 110], [-76, 70], [-90, 0], [-80, -70], [-50, -110]]), {
    fill: skin, lw: 7, shade: () => fillOnly(spline([[-100, -40], [-70, -120], [-110, -130]]), PAL.skinDs, { boil: .3 })
  });
  if (old > .3) { wrinkles(20, -70, 3, 46); wrinkles(70, 30, 2, 16, 3); }
  // colander helmet with two antennas
  push();
  shape([...arc(4, -78, 106, 82, Math.PI * 1.03, Math.PI * 1.97, 28), [108, -70], [-100, -70]], {
    fill: PAL.colander, lw: 7, shade: () => {
      fillOnly(ell(50, -120, 60, 50, 24), PAL.colanderS, { boil: .3 });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6 - r; c++) dot(-56 + c * 24 + r * 12, -96 - r * 26, 4, '#5d6876');
    }
  });
  shape(rr(-108, -82, 220, 20, 8), { fill: PAL.colanderS, lw: 6 });
  for (const ax of [-40, 50]) { stroke(spline([[ax, -150], [ax + 6, -190], [ax - 4, -222]], false), 5); shape(ell(ax - 4, -230, 11, 11, 14), { fill: '#e2523b', lw: 5 }); }
  pop();
  // eyes: heavy lids = deadpan
  const lid = P.blink ? 1 : clamp(P.lid ?? .5, 0, 1), look = P.look || [0, 0];
  eye(10, -10, 30, 34, { lid, look, pupil: 4.5, skin });
  eye(60, -12, 24, 29, { lid, look, pupil: 4, skin });
  for (const [ex, rx] of [[10, 24], [60, 18]]) stroke(arc(ex, 28, rx, 8, Math.PI * .15, Math.PI * .85, 10), 4);
  // brows
  const br = P.brow ?? 0, by = -52 - br * 10;
  const bcol = old > .5 ? '#eeeeee' : PAL.stache;
  shape(rr(-16, by, 52, 12, 5), { fill: bcol, lw: 5 }); shape(rr(42, by - 2, 40, 12, 5), { fill: bcol, lw: 5 });
  // nose
  shape(spline([[34, -6], [48, 22], [76, 40], [68, 58], [40, 54], [30, 40]]), { fill: skin, lw: 6, shade: () => fillOnly(ell(64, 52, 14, 8, 12), PAL.skinDs, { boil: .3 }) });
  // mouth under a walrus moustache
  const m = P.mouth || {};
  mouth(40, 88, 54, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.3, lw: 6 });
  const sc = old > .5 ? '#f2f2f2' : PAL.stache;
  if (old > .5) {   // beard: long at 40 years, down to the floor in the year 3000
    const L = 120 + 330 * clamp(P.age - 1, 0, 1), side = [], n = 7;
    for (let i = 0; i <= n; i++) { const u = i / n; side.push([100 - u * 40 + (i % 2 ? 14 : -6), 80 + u * L]); }
    const left = []; for (let i = n; i >= 0; i--) { const u = i / n; left.push([-34 + u * 50 + (i % 2 ? -14 : 6), 80 + u * L]); }
    shape(spline([[-40, 66], [30, 80], [104, 66], ...side, [44, 100 + L], ...left]), { fill: sc, lw: 6, shade: () => { for (let i = 0; i < 4; i++) stroke(spline([[0 + i * 22, 120], [10 + i * 18, 100 + L * .45], [4 + i * 16, 90 + L * .8]], false), 3, { line: '#cfcfcf' }); } });
  }
  shape(spline([[-6, 66], [20, 56], [46, 66], [72, 56], [98, 66], [104, 92], [80, 84], [46, 80], [12, 84], [-12, 92]]), { fill: sc, lw: 6 });
}

// —— Ilinca ——
export function ilinca(P) {
  const f = P.face ?? 1, age = P.age ?? 0, old = clamp(age, 0, 1), ancient = clamp(age - 1, 0, 1), ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 6 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 22, -110], ank = [sx * 26, -22];
    shape(noodle(hip, ank, 0, 24, 22), { fill: PAL.skinI, lw: 6 });
    shape(spline([[ank[0] - 30, ank[1] + 24], [ank[0] - 28, ank[1] - 6], [ank[0] + 10, ank[1] - 10], [ank[0] + 42, ank[1] + 6], [ank[0] + 38, ank[1] + 24]]), { fill: PAL.slipI, lw: 6, shade: () => { for (let i = 0; i < 5; i++) dot(ank[0] - 20 + i * 12, ank[1] + 2 + (i % 2) * 6, 3, '#e8b93a'); } });
  }
  push(); rotate((P.lean ?? 0) + old * .1 + ancient * .06);
  const shB = [-54, -268], shF = [52, -266];
  const drawArm = (sh, arm, holding) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 36, 28), { fill: PAL.robe, lw: 7 });
    const ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    hand(hp[0], hp[1], ang, 16, PAL.skinI, { fist: !!holding || !!arm.fist });

  };
  drawArm(shB, P.armL || { h: [-14, 130], bend: -14 }, P.holdL);
  // quilted bathrobe, a bell shape
  shape(spline([[-34, -300], [-80, -270], [-104, -160], [-118, -84], [0, -76], [118, -84], [104, -160], [80, -270], [34, -300]]), {
    fill: PAL.robe, lw: 7, shade: () => {
      fillOnly(spline([[30, -310], [96, -270], [130, -160], [130, -70], [60, -70], [70, -200]]), PAL.robeS, { boil: .4 });
      for (let k = -4; k <= 4; k++) { stroke([[k * 40 - 80, -300], [k * 40 + 80, -80]], 3, { line: PAL.robeS }); stroke([[k * 40 + 80, -300], [k * 40 - 80, -80]], 3, { line: PAL.robeS }); }
    }
  });
  stroke([[-30, -296], [8, -200], [20, -84]], 5);
  shape(spline([[-100, -186], [0, -178], [98, -188], [96, -166], [0, -158], [-100, -164]]), { fill: PAL.robeS, lw: 6 });
  // head
  push(); translate(0, -360); rotate(P.headTilt ?? 0);
  headIlinca(P, old, ancient, ner);
  pop();
  // the back hand holds the receiver; the hand hides behind the head, the receiver sits on the cheek
  if (P.holdL === 'phone') receiver(-58, -318, -.62, .8);
  drawArm(shF, P.armR || { h: [12, -150], bend: 30 }, P.holdR);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-80, -470 + u * 40, 1); sweat(86, -450 + ((u + .5) % 1) * 40, .8); }
  if (P.dust) for (let i = 0; i < 7; i++) dot(-80 + hash(i * 2.3) * 160, -520 + hash(i * 4.1) * 480, 3 + hash(i) * 3, '#b9a37a');
  pop();
}
function headIlinca(P, old, ancient, ner) {
  const hc = old > .5 ? (ancient > .5 ? '#f4f1f8' : '#d8d2e6') : PAL.hair, hs = old > .5 ? '#b9b1cc' : PAL.hairS;
  const big = 1 + ancient * .55;
  // hair cloud behind the face: lumpy circle
  const N = 16, cl = [];
  for (let i = 0; i < N; i++) { const a = i / N * TAU, r = (i % 2 ? 128 : 112) * big; cl.push([Math.cos(a) * r, -26 * big + Math.sin(a) * r * .95]); }
  shape(spline(cl), { fill: hc, lw: 7, shade: () => fillOnly(ell(60 * big, 10, 70 * big, 90 * big, 24), hs, { boil: .3 }) });
  // face
  shape(ell(8, 16, 74, 80, 48), { fill: PAL.skinI, lw: 7, shade: () => fillOnly(ell(54, 40, 40, 60, 24), PAL.skinIs, { boil: .3 }) });
  if (old > .3) { wrinkles(8, -38, 2, 40); wrinkles(-36, 50, 2, 10, 3); wrinkles(62, 50, 2, 10, 3); }
  // bangs over the forehead
  shape(spline([[-70, -40], [-50, -84], [0, -100], [50, -90], [84, -50], [60, -54], [36, -40], [10, -58], [-20, -40], [-46, -52]]), { fill: hc, lw: 6 });
  // eyes with lashes; nervous = small trembling pupils
  const look = P.look || [0, 0], sh = ner ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * ner : 0;
  const es = P.eyeS ?? 1;
  for (const [ex, rx] of [[-18, 26], [38, 22]]) {
    eye(ex, 12, rx * es, (rx + 6) * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 4, skin: PAL.skinI, jitter: sh, lw: 6 });
    for (let k = 0; k < 3; k++) stroke([[ex - rx * .6 + k * rx * .5, 12 - (rx + 6) * es + 2], [ex - rx * .8 + k * rx * .55, 12 - (rx + 6) * es - 12]], 4);
  }
  if (old > .5) for (const [ex, rx] of [[-18, 30], [38, 26]]) shape(ell(ex, 12, rx, rx, 28), { line: '#3a2a20', lw: 6 });
  // brows: worried = inner ends raised
  const br = P.brow ?? 1;
  stroke([[-46, -32 + br * 2], [-6, -40 - br * 8]], 7); stroke([[62, -36 + br * 2], [28, -42 - br * 8]], 7);
  // nose + mouth
  stroke([[20, 34], [34, 52], [22, 56]], 5);
  const m = P.mouth || {};
  mouth(14, 76, 46 * (P.mouthS ?? 1), { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.4, lw: 5 });
  // cheeks
  fillOnly(ell(-40, 50, 14, 8, 12), 'rgba(255,110,140,.45)', { boil: .2 }); fillOnly(ell(66, 50, 12, 7, 12), 'rgba(255,110,140,.45)', { boil: .2 });
}

// —— Pufi: a fuzzy creature that eats the post (non-verbal) ——
export function pufi(x, y, s = 1, { t = 0, o = 0, look = [0, 0], blink = false, chew = 0, letter = 0, sleep = false } = {}) {
  push(); translate(x, y); scale(s);
  const N = 30, pts = [];
  for (let i = 0; i < N; i++) { const a = i / N * TAU, r = 110 + (i % 2 ? 14 : -4) + Math.sin(t * 6 + i) * 3; pts.push([Math.cos(a) * r * 1.15, -100 + Math.sin(a) * r * (1 - chew * .08)]); }
  shape(pts, { fill: PAL.pufi, lw: 7, shade: () => { fillOnly(ell(50, -60, 80, 90, 24), PAL.pufiS, { boil: .3 }); for (let i = 0; i < 6; i++) fillOnly(ell(-70 + hash(i) * 140, -170 + hash(i + 3) * 120, 12, 9, 12), PAL.pufiSpot, { boil: .3 }); } });
  for (const [ex, ey, r] of [[-46, -140, 20], [6, -158, 26], [56, -136, 18]]) {
    if (sleep) stroke(arc(ex, ey, r * .8, r * .4, Math.PI * .1, Math.PI * .9, 10), 5);
    else eye(ex, ey, r, r, { lid: blink ? 1 : 0, look, pupil: 5, skin: PAL.pufi, lw: 5 });
  }
  if (letter > 0) {   // an envelope going in
    push(); translate(0, -70 + (1 - letter) * 10); rotate(.25);
    shape(rect(-46, -28, 92, 56), { fill: '#fdf6e3', lw: 5 }); stroke([[-46, -28], [0, 4], [46, -28]], 4);
    pop();
  }
  mouth(6, -78, 90, { o: o, w: 1.2, sm: .3, lw: 6 });
  if (sleep) text('z', 120, -210 - (t * 30 % 40), { font: '800 44px "Baloo 2"', fill: INK });
  pop();
}
