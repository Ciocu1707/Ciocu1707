// Pe așteptare — a Sci-Fi Sitcom Toon short
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { doru, ilinca, pufi, receiver, cord, GLOW } from './chars.js';
import { kitchen, portal, postPile, PHONE_BASE } from './worlds.js';
import { DUR, q, VO, SHOTS, shotAt, WIPES, TAGS, T, HOLD, CUES, CREDITS } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
const vdur = id => DURS[id] ?? LINE[id].text.length * .07;

// —— lip sync from the voice envelopes, stepped at 12 fps ——
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + vdur(id)) {
      const k = Math.floor((tq - t0) * 24), lp = LIPS[id];
      const o = lp ? (lp.o[k] ?? 0) : .4, b = lp ? (lp.b[k] ?? .5) : .5;
      return { o, w: .8 + .45 * b - .2 * o, talking: true };
    }
  }
  return { o: 0, w: 1, talking: false };
}
const voiceAt = (t, who) => Object.entries(VO).some(([id, t0]) => LINE[id].who === who && t >= t0 && t < t0 + vdur(id));
const blinks = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 30); return hash(c * 7.1 + seed) > .35 && (k % 30 === Math.floor(hash(c + seed) * 20)); };

function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const shakeAt = t => { for (const [a, d] of T.shake) if (t >= a && t < a + d) return 16 * (1 - (t - a) / d); return 0; };
const popOpen = x => x <= 0 ? 0 : back(clamp(x / .32), 1.7);

// —— the duo ——
const IX = 690, DX = 1230, FLOOR = 900;
const AGE = { acum: 0, sapt: 0, ani40: 1, an3000: 2 };
const EAR = { h: [-16, -62], bend: -20 };                    // Ilinca's arm holding the receiver at her ear
function I(t, era, o = {}) {
  const m = talk('ILINCA', t), tq = q(t), age = AGE[era];
  return { x: IX, y: FLOOR, s: 1.12, face: 1, t, age, nerv: age ? .15 : .45, look: [.6, -.1], blink: blinks(t, 3), mouth: { o: m.o * 1.15, w: m.w, sm: -.45 },
    armL: EAR, holdL: 'phone', armR: { h: [-30, 128], bend: 20, fist: true }, sq: 1 + .012 * Math.sin(tq * 3.1), headTilt: m.talking ? (m.o - .3) * .1 : Math.sin(tq * 1.7) * .03, ...o };
}
function D(t, era, o = {}) {
  const m = talk('DORU', t), tq = q(t), age = AGE[era];
  return { x: DX, y: FLOOR, s: 1, face: -1, age, lid: .52, look: [0, 0], blink: blinks(t, 11), mouth: { o: m.o, w: m.w, sm: -.3 },
    armR: { h: [20, 186], bend: 16 }, armL: { h: [-20, 186], bend: -16 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), ...o };
}
// where Ilinca's receiver is, in world coordinates (for the cord)
const recvPos = P => [P.x + (P.face ?? 1) * -24 * P.s, P.y - 268 * P.s + (P.age ? 24 : 0)];
function duo(t, era, oi = {}, od = {}, extra = {}) {
  const ip = I(t, era, oi), dp = D(t, era, od);
  const r = recvPos(ip);
  cord([PHONE_BASE[0], PHONE_BASE[1] + 60], r, 110);
  ilinca(ip); doru(dp);
  if (extra.web) { stroke(spline([[IX + 20, FLOOR - 600], [960, FLOOR - 700], [DX - 40, FLOOR - 790]], false), 3, { line: '#d9d0f0' }); }
  return { ip, dp };
}
// music notes coming out of the receiver while the hold music plays
function notes(t, x, y, k = 1) {
  for (let i = 0; i < 4; i++) {
    const u = (t * .6 + i / 4) % 1, nx = x - 70 - u * 150 + Math.sin(u * 7 + i) * 20, ny = y - 60 - u * 150;
    push(); translate(nx, ny); scale(k);
    shape(ell(0, 0, 14, 10, 14), { fill: INK, lw: 4, alpha: 1 - u }); stroke([[12, 0], [12, -44], [30, -36]], 5, { alpha: 1 - u });
    pop();
  }
}
const holdOn = t => HOLD.some(([a, b]) => t >= a && t < b);
const press = t => T.press.some(p => t >= p && t < p + .2) ? 1 : 0;
const openAt = (t, i) => t < T.open[i] ? 0 : popOpen(t - T.open[i]);

// ———————————————— shots ————————————————
const SH = {};
SH.ins1 = (t, tq) => {
  const ip = I(t, 'acum'), r = recvPos(ip);
  cam(r[0] + 40, r[1] - 20, lerp(2.6, 2.95, ss(seg(t, 0, 3.4))));
  kitchen('acum', t);
  duo(t, 'acum', { lid: .45, look: [.2, -.3], mouth: { o: 0, sm: -.9 }, brow: 1.6 });
  notes(t, r[0], r[1] - 40, .9);
};
SH.two1 = (t, tq) => {
  cam(960, 560, 1.22);
  kitchen('acum', t);
  const turn = tq >= VO.i1 - .15;
  duo(t, 'acum', { look: turn ? [.8, -.2] : [.1, -.4], brow: turn ? 1.6 : 1.1, nerv: turn ? .6 : .3, bob: turn ? Math.sin(seg(tq, VO.i1 - .15, VO.i1 + .1) * Math.PI) * -10 : 0 },
    { look: turn ? [-.2, 0] : [-.5, .3], lid: .55 });
  if (holdOn(t)) notes(t, recvPos(I(t, 'acum'))[0], recvPos(I(t, 'acum'))[1] - 40, .7);
};
SH.dCU1 = (t, tq) => {
  cam(DX - 40, 400, 2.25);
  kitchen('acum', t);
  const up = ss(seg(tq, T.remote + .08, T.remote + .42)), dip = Math.sin(seg(tq, T.remote - .06, T.remote + .12) * Math.PI);
  duo(t, 'acum', {}, { holdR: 'remote', armR: { h: [lerp(20, -110, up), lerp(186 + dip * 12, -10, up)], bend: lerp(16, -40, up) }, look: [.3, .1], lid: .55, glow: up * (.5 + .5 * Math.sin(t * 9)), bob: dip * 6 });
};
SH.iCU1 = (t, tq) => {
  const sh = shakeAt(t);
  cam(IX + 10, 470, 2.25, sh, t);
  kitchen('acum', t);
  duo(t, 'acum', { nerv: 1, look: [.9, -.2], eyeS: 1.18, pupil: 2.8, brow: 2, sweat: t * 1.4, armR: { h: [90, -40], bend: 30 } }, {});
};
SH.open1 = (t, tq) => {
  const op = openAt(t, 0), [r0, r1] = T.rush[0], u = ei(seg(t, r0, r1));
  cam(lerp(960, 960, u), lerp(560, 520, u), lerp(1.08, 7, u), op > 0 && t < T.open[0] + .4 ? 10 * (1 - seg(t, T.open[0], T.open[0] + .4)) : 0, t);
  kitchen('acum', t, { wash: clamp(op), clockSpin: seg(t, T.open[0], r1) * 3 });
  duo(t, 'acum', { nerv: 1, look: [.7, .1], eyeS: 1.15, pupil: 2.6, brow: 2, armR: { h: [90, -60], bend: 30 } }, { holdR: 'remote', armR: { h: [-110, -10], bend: -40 }, press: press(t), glow: 1, look: [.6, .1] });
  portal(960, 520, 200, t, { open: op });
};
SH.two2 = (t, tq) => {
  cam(960, 560, 1.22);
  kitchen('sapt', t);
  const woke = tq > VO.h2 + .4;
  duo(t, 'sapt', { dust: 1, lid: woke ? 0 : .6, look: woke ? [.3, -.5] : [0, 0], brow: woke ? 1.8 : .4, mouth: { o: 0, sm: -.7 } },
    { dust: 1, holdR: 'remote', armR: { h: [-60, 60], bend: -30 }, lid: .6, look: [-.4, .2] }, { web: 1 });
  notes(t, recvPos(I(t, 'sapt'))[0], recvPos(I(t, 'sapt'))[1] - 40, .7);
};
SH.ins2 = (t, tq) => {
  const ip = I(t, 'sapt'), r = recvPos(ip);
  cam(r[0] + 10, r[1] - 50, 2.9);
  kitchen('sapt', t);
  duo(t, 'sapt', { dust: 1, lid: 0, look: [.3, -.7], eyeS: 1.15, brow: 2, nerv: .8, blink: false, mouth: { o: 0, w: .5, sm: -.9 } }, { dust: 1 }, { web: 1 });
  notes(t, r[0], r[1] - 40, .9);
};
SH.iCU2 = (t, tq) => {
  const sh = shakeAt(t);
  cam(IX + 10, 470, lerp(2.25, 2.6, seg(t, 20.3, 20.6)), sh, t);
  kitchen('sapt', t);
  duo(t, 'sapt', { dust: 1, nerv: 1, look: [.9, -.1], eyeS: 1.2, pupil: 2.6, brow: 2.2, sweat: t * 1.5, armR: { h: [100, -70], bend: 40 }, mouthS: 1.4 }, { dust: 1 }, { web: 1 });
};
SH.dCU2 = (t, tq) => {
  const op = openAt(t, 1), [r0, r1] = T.rush[1], u = ei(seg(t, r0, r1));
  cam(lerp(DX - 40, 960, u), lerp(400, 520, u), lerp(2.25, 7, u));
  kitchen('sapt', t, { wash: clamp(op), clockSpin: seg(t, T.open[1], r1) * 3 });
  duo(t, 'sapt', { dust: 1 }, { dust: 1, holdR: 'remote', armR: { h: [-110, -10], bend: -40 }, press: press(t), glow: .6 + .4 * Math.sin(t * 9), look: [.3, .1], lid: .58 }, { web: 1 });
  portal(960, 520, 200, t, { open: op });
};
SH.two3 = (t, tq) => {
  const u = ss(seg(t, 22.8, 27.55));
  cam(lerp(1060, 1010, u), lerp(520, 560, u), lerp(1.5, 1.1, u));
  kitchen('ani40', t);
  postPile(1480, 880, 22);
  const eat = seg(tq, T.glorp - .5, T.chomp[1]), chew = (tq > T.chomp[0] && tq < T.chomp[0] + .12) || (tq > T.chomp[1] && tq < T.chomp[1] + .12) ? 1 : 0;
  pufi(1540, 880, 1, { t, o: chew ? .1 : (eat > .2 && eat < .8 ? .9 : .25), look: [-.5, .2], letter: eat > 0 && eat < .7 ? 1 - eat : 0, chew, blink: blinks(t, 21) });
  duo(t, 'ani40', { look: [.5, -.2], lid: .3, brow: .8, nerv: .1, armR: { h: [20, 110], bend: -20 } }, { holdR: 'remote', armR: { h: [-60, 60], bend: -30 }, look: [-.3, .2], lid: .6 });
  if (holdOn(t)) notes(t, recvPos(I(t, 'ani40'))[0], recvPos(I(t, 'ani40'))[1] - 40, .7);
};
SH.iCU3 = (t, tq) => {
  cam(IX + 10, 500, 2.2);
  kitchen('ani40', t);
  duo(t, 'ani40', { look: [.9, -.1], lid: .35, brow: 1.2, nerv: .1 }, {});
};
SH.dCU3 = (t, tq) => {
  const op = openAt(t, 2), [r0, r1] = T.rush[2], u = ei(seg(t, r0, r1));
  cam(lerp(DX - 40, 960, u), lerp(420, 520, u), lerp(2.2, 7, u));
  kitchen('ani40', t, { wash: clamp(op), clockSpin: seg(t, T.open[2], r1) * 3 });
  duo(t, 'ani40', {}, { holdR: 'remote', armR: { h: [-110, -10], bend: -40 }, press: press(t), glow: .6 + .4 * Math.sin(t * 9), look: [.4, .1], lid: .6 });
  portal(960, 520, 200, t, { open: op });
};
SH.two4 = (t, tq) => {
  cam(lerp(960, 900, ss(seg(t, 33.4, 39.4))), lerp(560, 520, ss(seg(t, 33.4, 39.4))), lerp(1.05, 1.28, ss(seg(t, 36.5, 39.4))));
  kitchen('an3000', t);
  pufi(1560, 880, .9, { t, sleep: true });
  const ring = tq >= T.ring;
  duo(t, 'an3000', { look: ring ? [.2, -.6] : [0, 0], lid: ring ? 0 : .7, eyeS: ring ? 1.15 : 1, brow: ring ? 1.5 : .2, nerv: 0 }, { holdR: 'remote', armR: { h: [-60, 60], bend: -30 }, look: ring ? [-.4, .1] : [0, .3], lid: .7 });
};
SH.iCU4 = (t, tq) => {
  cam(IX + 10, 500, 2.3);
  kitchen('an3000', t);
  const thinking = tq < VO.i5;
  duo(t, 'an3000', { look: thinking ? [-.3, -.8] : [.6, 0], lid: thinking ? .1 : .4, brow: thinking ? 1.4 : .6, nerv: 0 }, {});
};
SH.ins4 = (t, tq) => {
  const ip = I(t, 'an3000'), r = recvPos(ip);
  cam(r[0] + 10, r[1] - 50, 2.9);
  kitchen('an3000', t);
  duo(t, 'an3000', { lid: .5, look: [.2, -.6], brow: tq > T.holdBack ? 2 : .6, nerv: tq > T.holdBack ? .5 : 0, mouth: { o: tq > T.holdBack ? .5 : 0, sm: -.9 } }, {});
  if (holdOn(t)) notes(t, r[0], r[1] - 40, .9);
};
SH.two5 = (t, tq) => {
  const op = openAt(t, 3), [r0, r1] = T.rush[3], u = ei(seg(t, r0, r1));
  cam(960, lerp(560, 520, u), lerp(1.15, 7, u));
  kitchen('an3000', t, { wash: clamp(op), clockSpin: seg(t, T.open[3], r1) * 3 });
  pufi(1560, 880, .9, { t, sleep: true });
  duo(t, 'an3000', { look: [.8, -.1], lid: .3, brow: .6, nerv: 0 }, { holdR: 'remote', armR: { h: [-110, -10], bend: -40 }, press: press(t), glow: .6 + .4 * Math.sin(t * 9), look: [-.5, .1], lid: .5 });
  if (holdOn(t)) notes(t, recvPos(I(t, 'an3000'))[0], recvPos(I(t, 'an3000'))[1] - 40, .7);
  portal(960, 520, 200, t, { open: op });
};

// —— full-screen swirl wipe through the time portal ——
function wipe(t) {
  for (const [tc, w] of WIPES) {
    const u = 1 - Math.abs(t - tc) / w; if (u <= 0) continue;
    reset(); portal(960, 540, 1500 * ss(u), t * 2, { open: 1, sx: 1.4 });
  }
}
// era readout, typed in on 12 fps steps
function tag(t) {
  for (const [a, b, label, bg, fg] of TAGS) {
    if (t < a || t >= b) continue;
    const n = Math.min(label.length, Math.floor(q(t - a) * 24));
    const s = label.slice(0, n) + (Math.floor(t * 4) % 2 && n < label.length ? '_' : '');
    reset(); translate(60, 60);
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 54px VT323'; const tw = g.measureText(label).width;
    shape(rr(0, 0, tw + 48, 70, 10), { fill: bg, lw: 6 });
    text(s, 24, 38, { font: '400 54px VT323', fill: fg, align: 'left' });
  }
}
// subtitles: heavy rounded type, black outline, speaker pill in the character's colour
const WHO_COL = { DORU: '#d8961c', ILINCA: '#ff5f97', TELEFON: '#6b7280', OPERATOR: '#4b5563' };
const CUTS = [15.3, 22.8, 33.4, 41.6, 49.7];
const SUBS = Object.entries(VO).map(([id, t0]) => {
  const L = LINE[id], s = L.sub || L.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .45, .9 + s.length / 17);
  const c = CUTS.find(x => x > t0 + .1); if (c && t1 > c) t1 = Math.max(c - .02, t0 + d + .2);
  return { id, t0, t1, who: L.who, text: s };
});
function wrapSub(str) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 50px "Baloo 2"';
  if (g.measureText(str).width < 1300) return [str];
  const mid = str.length / 2; let best = -1;
  for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [str.slice(0, best), str.slice(best + 1)];
}
function subs(t) {
  const act = SUBS.filter(s => t >= s.t0 && t < s.t1).slice(-2);
  let y = H - 92;
  for (let i = act.length - 1; i >= 0; i--) {
    const s = act[i], a = i === act.length - 1 ? 1 : .7, lines = wrapSub(s.text), pop_ = back(seg(t, s.t0, s.t0 + .12), 2);
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 50px "Baloo 2"';
    const tw = Math.max(...lines.map(l => g.measureText(l).width)); g.font = '800 26px "Baloo 2"'; const nw = g.measureText(s.who).width + 34;
    const x0 = (W - (nw + 22 + tw)) / 2, y0 = y - (lines.length - 1) * 66;
    reset(); g.globalAlpha = a;
    push(); translate(x0 + nw / 2, y0 - 4); scale(pop_); translate(-nw / 2, 0);
    shape(rr(0, -22, nw, 44, 14), { fill: WHO_COL[s.who], lw: 5 });
    text(s.who, nw / 2, 2, { font: '800 26px "Baloo 2"', fill: '#fff' });
    pop();
    lines.forEach((l, k) => text(l, x0 + nw + 22, y0 + k * 66, { font: '800 50px "Baloo 2"', fill: '#fff', align: 'left', outlineW: 11 }));
    g.globalAlpha = 1;
    y = y0 - 84;
  }
}
// end card: navy, the portal dimmed behind, title popped in on 12 fps steps
function endCard(t) {
  reset(); screenRect('#141c44');
  portal(960, 520, 420, t * .6, { open: spring(t - T.end, 7, .45), sx: 1 });
  screenRect('#141c44', .55);
  const k = t - T.end;
  if (k > 1.4) { const x = 960 + Math.sin(k * 1.3) * 120; push(); reset(); translate(x, 770); rotate(Math.sin(k * 2) * .3 + .9); scale(.9); receiver(0, 0, 0); pop(); }
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 330); scale(s); rotate(-.04);
  text('PE AȘTEPTARE', 12, 12, { font: '400 150px Bungee', fill: '#e2523b', outlineW: 22, outlineCol: INK });
  text('PE AȘTEPTARE', 0, 0, { font: '400 150px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Sunteți al 47-lea la rând.', 960, 470, { font: '400 60px VT323', fill: '#ffe066', outlineW: 9 });
  CREDITS.forEach((c, i) => text(c, 960, 948 + i * 38, { font: '700 27px "Baloo 2"', fill: 'rgba(255,255,255,.85)' }));
  g.globalAlpha = 1;
}

function render(t) {
  frame(t);
  screenRect('#000');
  const [, , name] = shotAt(t), tq = q(t);
  if (name === 'end') endCard(t); else SH[name](t, tq);
  wipe(t);
  tag(t);
  subs(t);
}

// —— sound events for mix.py ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who });
  for (const c of CUES) add('cue', c.t0, c);
  for (const [a, b, lv] of HOLD) add('hold', a, { d: +(b - a).toFixed(3), v: lv });
  let cur = null;
  for (const [a, b, , w] of SHOTS) { if (cur && cur.w === w) cur.b = b; else { if (cur) add('amb', cur.a, { w: cur.w, d: +(cur.b - cur.a).toFixed(3) }); cur = { a, b, w }; } }
  add('amb', cur.a, { w: cur.w, d: +(cur.b - cur.a).toFixed(3) });
  add('cloth', T.remote); add('blip', T.remote + .42, { v: .7 });
  T.press.forEach(p => add('click', p));
  T.open.forEach((p, i) => { add('portalOpen', p, { v: i === 3 ? 1 : .85 }); });
  T.rush.forEach(([a]) => add('whooshBig', a));
  for (const [tc] of WIPES) add('portalWhoosh', tc - .16);
  T.shake.forEach(([a]) => add('tic', a, { v: .6 }));
  add('crickets', 15.3, { d: 7.5 });
  add('glorp', T.glorp); T.chomp.forEach(c => add('chomp', c)); add('paper', T.glorp - .3);
  add('ring', T.ring); add('click', T.transfer, { v: .7 });
  add('snore', 33.6, { d: 16 });
  add('slam', T.end, { v: .8 });
  return ev.sort((a, b) => a.t - b.t);
}
// texts on screen, for readcheck (subtitles are checked via the .srt)
window.TEXTS = t => {
  const out = [];
  for (const [a, b, label] of TAGS) if (t >= a + .6 && t < b) out.push({ id: 'tag' + a, text: label, x0: 60, y0: 60, x1: 460, y1: 130 });
  if (t >= T.end + .5) out.push({ id: 'title', text: 'PE AȘTEPTARE', x0: 380, y0: 250, x1: 1540, y1: 410 }, { id: 'tag2', text: 'Sunteți al 47-lea la rând.', x0: 600, y0: 440, x1: 1320, y1: 500 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 920, x1: 1720, y1: 1010, pass: true });
  return out;
};
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
