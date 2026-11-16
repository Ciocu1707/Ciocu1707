// Motanul Copiat — Sci-Fi Sitcom Toon, episode 4 (new cast)
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { cat, sorin, printer, PRN, GLOW } from './cast.js';
import { workshop, crowd, exterior, city, planet, SLOT_COUNT } from './sets.js';
import { DUR, q, VO, SHOTS, shotAt, COPIES, T, CUES, CREDITS } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
const vdur = id => DURS[id] ?? .5;
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of VO) {
    if (LINE[id].who !== who || tq < t0 || tq >= t0 + vdur(id)) continue;
    const k = Math.floor((tq - t0) * 24), lp = LIPS[id];
    const o = lp ? (lp.o[k] ?? 0) : .4, b = lp ? (lp.b[k] ?? .5) : .5;
    return { o, w: .8 + .45 * b - .2 * o, talking: true };
  }
  return { o: 0, w: 1, talking: false };
}
const blinks = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 30); return hash(c * 7.1 + seed) > .35 && (k % 30 === Math.floor(hash(c + seed) * 20)); };
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const countAt = t => { let n = 1; for (const [tc, c] of COPIES) if (t >= tc) n = c; return n; };
const flashAt = t => { for (const [tc] of COPIES) if (t >= tc - .05 && t < tc + .25) return 1 - (t - tc + .05) / .3; if (t >= T.flash2 && t < T.flash2 + .4) return 1 - (t - T.flash2) / .4; return 0; };
// when each crowd slot appears: spread over the copy events (slot i is born at the copy that brings the count past i+2)
const SINCE = Array.from({ length: SLOT_COUNT }, (_, i) => { for (const [tc, c] of COPIES) if (c >= i + 3) return tc + hash(i) * .2; return 99; });

const SX = 600, FLOOR = 900;
function S(t, o = {}) {
  const m = talk('SORIN', t), tq = q(t);
  return { x: SX, y: FLOOR, s: 1, face: 1, t, nerv: .4, look: [.6, -.1], brow: 1.4, blink: blinks(t, 5), mouth: { o: m.o * 1.15, w: m.w, sm: -.4 },
    armF: { h: [30, 200], bend: 14 }, armB: { h: [-20, 200], bend: -14 }, sq: 1 + .012 * Math.sin(tq * 3.1), headTilt: m.talking ? (m.o - .3) * .08 : 0, ...o };
}
// Bubu, the original, asleep on top of the printer
const BUBU = [PRN.x - 20, PRN.y - 460];
function bubuTop(t, o = {}) { const m = talk('BUBU', t); cat(BUBU[0], BUBU[1], .8, { tail: t * 2, lid: .6, mo: m.o, ...o }); }

const SH = {};
SH.wide1 = (t, tq) => {
  cam(960, 540, 1.0);
  workshop(t);
  printer(t);
  bubuTop(t, { sleep: true });
  sorin(S(t, { armF: tq > 3.2 ? { h: [210, -60], bend: -20 } : { h: [180, -40], bend: -10 }, look: tq > 3.2 ? [.9, -.6] : [.3, -.2], brow: tq > 3.2 ? 2 : .6, nerv: tq > 3.2 ? .5 : 0 }));
};
SH.paw = (t, tq) => {
  cam(1300, 450, 3.0);
  workshop(t);
  const st = ss(seg(tq, 6.45, T.press));
  printer(t, { press: tq >= T.press ? 1 : 0 });
  bubuTop(t, { sleep: tq < 6.4, lid: .7, stretch: st });
};
SH.wide2 = (t, tq) => {
  cam(1050, 560, 1.12);
  workshop(t);
  const door = ss(seg(t, T.out - .3, T.out)), flash = flashAt(t);
  printer(t, { door, flash, count: countAt(t) });
  bubuTop(t, { lid: tq >= T.syncBlink && tq < T.syncBlink + .15 ? 1 : .6, look: [.4, .4] });
  // the copy steps out of the porthole and lands on the floor
  if (t > T.out) { const u = ss(seg(t, T.out, T.out + .7)); cat(lerp(PRN.x, PRN.x + 260, u), lerp(PRN.y - 190, FLOOR, u) - Math.sin(u * Math.PI) * 80, lerp(.3, .8, u), { lid: tq >= T.syncBlink && tq < T.syncBlink + .15 ? 1 : .6, look: [-.4, -.4], tail: t * 2, face: -1 }); }
  sorin(S(t, { lid: 0, eyeS: 1.25, pupil: 2.6, brow: 2.2, look: [.9, -.1], mouth: { o: t > T.out ? .8 : 0, sm: -.6 }, nerv: .6, armF: { h: [100, 60], bend: 20 } }));
};
SH.sorinCU = (t, tq) => {
  const sh = t > 13.3 && t < 15.2 ? 9 : t > 21.5 && t < 22.4 ? 12 : 0;
  cam(SX + 20, 300, 2.1, sh, t);
  workshop(t);
  if (t > 20) crowd(t, 60, { since: SINCE });
  printer(t, { count: countAt(t) });
  sorin(S(t, { nerv: 1, lid: 0, eyeS: 1.3, pupil: 2.6, brow: 2.5, sweat: t * 1.5, look: [.9, -.1], mouthS: 1.3, armF: { h: [80, -160], bend: 30 }, armB: { h: [-80, -160], bend: -30 } }));
};
SH.multiply = (t, tq) => {
  cam(1000, 560, lerp(1.1, .95, seg(t, 16.4, 21.4)));
  workshop(t);
  const n = countAt(t), flash = flashAt(t);
  printer(t, { count: n, flash, press: flash > .5 ? 1 : 0, door: n > 1 ? 1 : 0 });
  crowd(t, Math.max(1, n - 2), { since: SINCE });
  bubuTop(t, { lid: .5, look: [.3, .5], stretch: flash > .3 ? 1 : 0 });
  sorin(S(t, { nerv: 1, lid: 0, eyeS: 1.25, brow: 2.4, sweat: t * 1.5, look: [.9, .1], armF: { h: [120, -120], bend: 30 } }));
  crowd(t, Math.max(1, n - 2), { since: SINCE, front: true });
};
SH.look = (t, tq) => {
  cam(960, 560, .95);
  workshop(t);
  printer(t, { count: countAt(t) });
  const lk = tq < T.lookEach ? [0, .3] : tq < T.lookCam ? [Math.sin(Math.floor(tq * 6)) > 0 ? .9 : -.9, 0] : [0, 0];
  crowd(t, 200, { look: lk });
  bubuTop(t, { look: lk, lid: .55 });
  sorin(S(t, { nerv: .6, lid: 0, eyeS: 1.2, brow: 2, look: lk }));
  crowd(t, 200, { look: lk, front: true });
};
SH.house = (t, tq) => {
  cam(960, 540, .95, t > T.chorus && t < T.chorus + .6 ? 8 : 0, t);
  workshop(t);
  printer(t, { count: countAt(t) });
  const mo = t > T.chorus && t < T.chorus + .9 ? .9 : 0;
  crowd(t, 200, { mo, look: [0, 0] });
  bubuTop(t, { mo });
  const buried = ss(seg(t, T.buried, T.buried + .4));
  if (buried < 1) sorin(S(t, { hold: 'can', armF: { h: [40, -220], bend: 20 }, nerv: .8, lid: 0, eyeS: 1.25, brow: 2.2, look: [.4, -.6], y: FLOOR + buried * 400 }));
  crowd(t, 200, { mo, look: [0, 0], front: true });
  if (buried > 0) {   // a mound of cats on Sorin, only the hand with the can sticks out
    for (let i = 0; i < 9; i++) cat(SX - 160 + (i % 3) * 140 + hash(i) * 30, FLOOR + 40 - Math.floor(i / 3) * 90 - (1 - buried) * 300, .5, { face: i % 2 ? 1 : -1, lid: .6, tail: t * 3 + i });
    push(); translate(SX + 40, FLOOR - 300 - Math.sin(t * 8) * 10); shape(rr(-28, -40, 56, 60, 8), { fill: '#c9d2dc', lw: 6, shade: () => fillOnly(rect(-30, -24, 60, 24), '#e2523b', { boil: .3 }) }); pop();
  }
};
SH.exterior = (t) => {
  const u = ss(seg(t, 31.0, 35.0));
  cam(960, lerp(500, 520, u), lerp(1.5, .6, u));
  exterior(t, clamp(.4 + u));
};
SH.city = (t) => {
  cam(lerp(1000, 900, seg(t, 35, 39)), 500, lerp(.85, .62, ss(seg(t, 35, 39))));
  city(t);
};
SH.planet = (t) => {
  cam(960, 540, lerp(.75, 1.05, ss(seg(t, 39, 44))));
  planet(t);
};
SH.final = (t, tq) => {
  cam(1080, 500, 1.2);
  workshop(t, { dim: .15 });
  crowd(t, 200, { look: [.2, .3] });   // the crowd stays behind: the printer, Bubu and Sorin are in front
  const door = t < T.nudge + .5 ? 1 - ss(seg(t, T.nudge + .2, T.nudge + .5)) : ss(seg(t, T.outS - .3, T.outS));
  printer(t, { count: t > T.flash2 ? 2 : 1, flash: flashAt(t), press: tq >= T.press2 && tq < T.press2 + .25 ? 1 : 0, door });
  // Bubu nudges Sorin into the printer, presses the button; two Sorins step out
  bubuTop(t, { stretch: (tq > T.nudge - .1 && tq < T.nudge + .3) || (tq > T.press2 - .1 && tq < T.press2 + .3) ? 1 : 0, lid: .6, look: [-.6, .3] });
  const sucked = ei(seg(t, T.nudge, T.nudge + .45));
  if (t < T.nudge + .45) sorin(S(t, { x: lerp(1000, PRN.x, sucked), y: lerp(FLOOR, PRN.y - 190, sucked), s: 1 - sucked * .8, nerv: .5, lid: .2, brow: 1, look: [.6, -.4], lean: sucked * .5 }));
  if (t > T.outS) {
    const u = ss(seg(t, T.outS, T.outS + .6));
    for (const [dx, seed] of [[-430, 1], [330, 2]]) sorin(S(t, { x: lerp(PRN.x, PRN.x + dx, u), y: lerp(PRN.y - 190, FLOOR, u), s: lerp(.3, 1, u), lid: .4, brow: .4, look: [.7, -.6], nerv: 0, blink: blinks(t, seed) }));
  }
};

// subtitles (no tags in this episode)
const WHO_COL = { SORIN: '#e2523b', BUBU: '#6c7c96' };
const CUTS = [11.4, 16.4, 21.4, 23.9, 31.0, 39.0, 50.8];
const SUBS = VO.map(([id, t0]) => {
  const L_ = LINE[id], s = id === 's6' ? 'SORIN ×2' : null, txt = L_.sub || L_.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .45, .9 + txt.length / 17);
  const c = CUTS.find(x => x > t0 + .1); if (c && t1 > c) t1 = Math.max(c - .02, t0 + d + .1);
  return { id, t0, t1, who: s || L_.who, text: txt };
});
function subs(t) {
  const act = SUBS.filter(s => t >= s.t0 && t < s.t1).slice(-2);
  let y = H - 92;
  for (let i = act.length - 1; i >= 0; i--) {
    const s = act[i], a = i === act.length - 1 ? 1 : .7, pop_ = back(seg(t, s.t0, s.t0 + .12), 2);
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 50px "Baloo 2"';
    const tw = g.measureText(s.text).width; g.font = '800 26px "Baloo 2"'; const nw = g.measureText(s.who).width + 34;
    const x0 = (W - (nw + 22 + tw)) / 2;
    reset(); g.globalAlpha = a;
    push(); translate(x0 + nw / 2, y - 4); scale(pop_); translate(-nw / 2, 0);
    shape(rr(0, -22, nw, 44, 14), { fill: WHO_COL[s.who.split(' ')[0]], lw: 5 });
    text(s.who, nw / 2, 2, { font: '800 26px "Baloo 2"', fill: '#fff' });
    pop();
    text(s.text, x0 + nw + 22, y, { font: '800 50px "Baloo 2"', fill: '#fff', align: 'left', outlineW: 11 });
    g.globalAlpha = 1; y -= 84;
  }
}
function endCard(t) {
  reset(); screenRect('#2a1f4a');
  for (let i = 0; i < 26; i++) { const x = (i % 9) * 240 - 40 + (Math.floor(i / 9) % 2) * 120, y = 640 + Math.floor(i / 9) * 170; cat(x, y + 120, .55, { face: i % 2 ? 1 : -1, lid: .6, tail: t * 2 + i, lw: 5 }); }
  screenRect('#2a1f4a', .45);
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 300); scale(s); rotate(-.04);
  text('MOTANUL COPIAT', 12, 12, { font: '400 130px Bungee', fill: '#9dff2e', outlineW: 22, outlineCol: INK });
  text('MOTANUL COPIAT', 0, 0, { font: '400 130px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Miau.', 960, 440, { font: '400 72px VT323', fill: '#ffe066', outlineW: 9 });
  CREDITS.forEach((c, i) => text(c, 960, 960 + i * 38, { font: '700 27px "Baloo 2"', fill: 'rgba(255,255,255,.9)', outlineW: 6 }));
  g.globalAlpha = 1;
}
function render(t) {
  frame(t); screenRect('#000');
  const [, , name] = shotAt(t);
  if (name === 'end') endCard(t); else SH[name](t, q(t));
  subs(t);
}
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of VO) add('vo', t0, { id, who: LINE[id].who });
  for (const c of CUES) add('cue', c.t0, c);
  add('snore', 0, { d: 6.4 }); add('stretch', 6.45); add('click', T.press); add('whir', 7.0, { d: 1.2 });
  COPIES.forEach(([tc], i) => { add('zap', tc, { v: i ? .7 : 1 }); add('pop', tc + .1, { v: .6 }); add('meow', tc + .18, { v: i ? .4 : 1, p: 1 + (i % 5) * .08 }); });
  add('door', T.out - .3); add('thud', T.out + .65, { v: .6 });
  add('blip', T.syncBlink); add('blip', T.syncBlink + .03);
  add('swish', T.lookEach); add('swish', T.lookCam, { v: 1.2 });
  add('chorus', T.chorus); add('avalanche', T.buried);
  add('wind', 31.0, { d: 8.0 }); add('purr', 39.0, { d: 5.0 });
  add('swish', T.nudge); add('suck', T.nudge + .1); add('door', T.nudge + .2); add('click', T.press2); add('zap', T.flash2); add('door', T.outS - .3); add('thud', T.outS + .55);
  add('slam', T.end, { v: .8 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [];
  if (t >= T.end + .5) out.push({ id: 'title', text: 'MOTANUL COPIAT Miau.', x0: 300, y0: 220, x1: 1620, y1: 470 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 930, x1: 1720, y1: 1020, pass: true });
  return out;
};
function thumb() {
  const t = 27.0; frame(t); screenRect('#000');
  cam(960, 500, 1.05); workshop(t); printer(t, { count: 2048 }); crowd(t, 200, { look: [0, 0] }); bubuTop(t, { lid: .6 });
  sorin(S(t, { hold: 'can', armF: { h: [40, -220], bend: 20 }, nerv: 0, lid: 0, eyeS: 1.35, pupil: 2.4, brow: 2.6, look: [.2, -.6], mouth: { o: .9, sm: -.6 } }));
  crowd(t, 200, { look: [0, 0], front: true });
  reset(); translate(1360, 170); rotate(.05);
  text('×2048', 12, 12, { font: '400 190px Bungee', fill: '#9dff2e', outlineW: 28, outlineCol: INK });
  text('×2048', 0, 0, { font: '400 190px Bungee', fill: '#fff3d6', outlineW: 28, outlineCol: INK });
}
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
if (new URLSearchParams(location.search).has('thumb')) { window.render = thumb; thumb(); }
else render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
