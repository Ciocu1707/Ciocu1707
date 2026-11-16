// Tata și parola — part 1 "Parola" (Sci-Fi Sitcom Toon style, family comedy)
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { tata, mama, andrei, rex, lens, eye, TAG } from './cast.js';
import { room, sofaArmFront, tvSet, keyPos, TV, KEYS, brain, clerk, DRAWERS } from './sets.js';
import { DUR, q, VO, SHOTS, shotAt, FIELD, KEYWALK, LAPSE, T, CUES, CREDITS } from './story.js';

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
const fieldAt = t => { let f = FIELD[0]; for (const e of FIELD) if (t >= e[0]) f = e; return f; };
const cursorAt = t => { if (t >= KEYWALK[0] && t < KEYWALK[1]) return Math.min(17, Math.floor((t - KEYWALK[0]) / ((KEYWALK[1] - KEYWALK[0]) / 18))); if (t >= KEYWALK[1] && t < KEYWALK[1] + .4) return 17; return -1; };
const growAt = t => ss(seg(t, LAPSE[0], LAPSE[1]));
const spinAt = t => (t >= T.spin[0] && t < T.spin[1]) || (t >= T.spin2[0] && t < T.spin2[1]) ? t : -1;

// —— the family ——
const TX = 1030, FLOOR = 900, AX = 1520, MX = 1840;
function Tp(t, o = {}) {
  const m = talk('TATA', t);
  return { x: TX, y: FLOOR, s: 1, face: -1, lid: .45, look: [-.6, 0], brow: 0, blink: blinks(t, 4), mouth: { o: m.o, w: m.w, sm: -.2 }, spin: spinAt(t), lensUp: 1, headTilt: m.talking ? (m.o - .3) * .05 : 0, web: t > 31 && t < 41.2, ...o };
}
function Ap(t, o = {}) {
  const m = talk('ANDREI', t);
  return { x: AX, y: 790, s: 1, face: -1, look: [-.7, 0], lid: .2, brow: 1, blink: blinks(t, 8), mouth: { o: m.o, w: m.w, sm: -.4 }, grow: growAt(t), popcorn: 1 - growAt(t), headTilt: m.talking ? (m.o - .3) * .08 : 0, ...o };
}
function Mp(t, o = {}) {
  const m = talk('MAMA', t);
  return { x: MX, y: FLOOR, s: 1, face: -1, look: [-.8, 0], lid: .35, brow: -1, blink: blinks(t, 12), mouth: { o: m.o, w: m.w, sm: -.3 }, headTilt: m.talking ? (m.o - .3) * .05 : 0, ...o };
}
function living(t, { mama: showM = false, mo = {}, to = {}, ao = {}, dog = null, photo = 0 } = {}) {
  const lapse = seg(t, LAPSE[0], LAPSE[1]);
  room(t, { day: t >= LAPSE[0] && t < LAPSE[1] ? lapse * 6 : 0, clock: t >= LAPSE[0] && t < LAPSE[1] ? lapse * 30 : t * .01, photo });
  const [, fld, st] = fieldAt(t);
  tvSet(t, { field: fld, state: st, cursor: cursorAt(t), dust: t > 31 && t < 41.2 ? 1 : 0 });
  andrei(Ap(t, ao)); sofaArmFront();
  if (showM) mama(Mp(t, mo));
  if (dog) rex(dog.x, FLOOR, .9, dog);
  tata(Tp(t, to));
}

// ———————————————— shots ————————————————
const SH = {};
SH.lens = (t) => {   // hook: Tata's eye huge behind the lens, then pull back
  const u = ss(seg(t, 1.2, 3.2));
  cam(lerp(974, 900, u), lerp(326, 420, u), lerp(4.2, 1.6, u));
  living(t, { to: { lid: .2, look: [-.8, .2], lensAt: [56, -574], lensR: 80, finger: Math.floor(t * 3) % 2 ? [200, -270] : [220, -250] } });
  // the eye behind the lens, magnified ×2.5
  const ex = TX - 56, ey = FLOOR - 574;
  eye(ex, ey, 48, 52, { lid: .15, look: [-.9, .2], pupil: 11 });
  lens(ex, ey, 80, .15);
};
SH.wide = (t, tq) => {
  if (t >= 110) {   // Mama walks out, the door slams, the wedding photo falls
    cam(1100, 540, 1.0, t > T.slam && t < T.slam + .4 ? 10 : t > T.photoFall + .5 && t < T.photoFall + .8 ? 8 : 0, t);
    const out = ss(seg(t, T.mamaOut[0], T.mamaOut[1])), fall = ei(seg(t, T.photoFall, T.photoFall + .5));
    living(t, { mama: out < 1, mo: { x: lerp(MX, 2200, out), face: 1, look: [1, 0] }, to: { lid: .6, look: [.6, 0], brow: 1.4, sweat: t, lensUp: 0 }, ao: { look: [.5, 0], lid: .5, brow: .2 }, photo: fall, dog: { x: 560, face: 1, t, sit: true } });
    return;
  }
  if (t >= 68) {   // last try left: silence
    cam(700, 420, 1.5);
    living(t, { to: { lid: .3, look: [-.8, .1], brow: 1 }, ao: { lid: 0, look: [-.8, 0] }, dog: { x: 560, face: 1, t } });
    return;
  }
  cam(1000, 520, 1.05);
  living(t, { to: { look: [-.8, 0] }, ao: { look: [-.8, 0], lid: .4, brow: .4 } });
};
SH.mama = (t, tq) => {
  const push_ = t > 104 && t < 108 ? ss(seg(t, 104, 108)) : 0;
  cam(MX - 60, 300, 2.0 + push_ * .6);
  living(t, { mama: true, mo: t > 104 ? { lid: .55, brow: -1.6, look: [-1, 0] } : {} });
};
SH.spin = (t) => {
  const u = t > 79 ? ss(seg(t, 80.6, 82)) : 0;
  cam(TX - 80, 340, 2.6 + u * 6, 0, t);
  living(t, { to: { lensUp: 0, sweat: t } });
};
SH.andrei = (t, tq) => {
  cam(AX - 20, 360, 2.1);
  const o = t > 118 ? { look: [.1, 0], lid: .5, brow: .2 } : t > 58 ? { look: [-1, 0], brow: 2, lid: 0 } : t > 49 ? { look: [-1, 0], brow: 2.2, lid: 0 } : t > 35 ? { lid: .6, brow: 0, look: [-1, .1] } : { look: [-1, 0], brow: 1.8 };
  living(t, { ao: o });
};
SH.tata = (t, tq) => {
  cam(TX - 60, 360, 2.2);
  const o = t > 108 ? { lid: .3, brow: 1.2, look: [.8, 0], sweat: t, lensUp: 0 } : t > 100 ? { lid: 0, brow: .4, look: [.8, -.2], lensUp: 0 } : t > 72 ? { look: [.9, 0], lid: .2, lensUp: 0 } : t > 38 ? { lid: .55, look: [-.7, 0], brow: -.3 } : { lid: .5, look: [-.8, 0] };
  living(t, { to: o });
};
SH.keys = (t, tq) => {
  cam(TV.x + TV.w / 2, TV.y + 220, 2.6);
  living(t);
  // Tata's finger: the remote pokes into frame on every keystroke
};
SH.timelapse = (t, tq) => {
  cam(1050, 520, 1.0);
  living(t, { to: { lid: .5, look: [-.8, 0] }, ao: { lid: lerp(.2, .7, growAt(t)), brow: lerp(1, -.4, growAt(t)), look: [-.8, 0] } });
};
SH.dog = (t, tq) => {
  cam(860, 560, 1.4);
  const u = ss(seg(t, T.dogIn[0], T.dogIn[1]));
  const lowered = ss(seg(t, T.lensDown - .4, T.lensDown));
  living(t, { dog: { x: lerp(-200, 560, u), face: 1, t, walk: u > 0 && u < 1 }, to: { look: [-.8, .6], lensUp: 1 - lowered, lensAt: lowered > .5 ? [140, -150] : undefined } });
};
SH.tag = (t) => {   // through the lens: the tag reads REXY
  cam(560 + 126 * .9, FLOOR - 30 * .9, 5.0);
  living(t, { dog: { x: 560, face: 1, t } });
  reset(); translate(960, 540);
  lens(0, 0, 330, 0);
  text('REXY', 0, 10, { font: '400 120px Bungee', fill: '#7a4a24', outlineW: 0 });
};
SH.tries = (t, tq) => {   // three wrong passwords, each faster; Rex barks at every one
  const [, , st] = fieldAt(t);
  const shake = st === 'gresit' && T.barks.some(b => t > b && t < b + .25) ? 8 : 0;
  cam(TV.x + TV.w / 2, TV.y + 200, 2.2, shake, t);
  living(t);
  const b = T.barks.find(b => t > b && t < b + .35);
  if (b) { reset(); cam(TV.x + TV.w / 2, TV.y + 200, 2.2); rex(560, 700, .8, { face: 1, t, bark: .9 }); }
};
SH.brain = (t, tq) => {
  cam(lerp(1000, 1300, ss(seg(t, 86, 94))), lerp(540, 300, ss(seg(t, 88, 94))), lerp(1.0, 1.4, ss(seg(t, 86, 94))));
  const open = t >= T.drawer ? 8 : -1;
  brain(t, { open, moth: t >= T.moth ? clamp((t - T.moth) / 3) : -1 });
  // the clerk runs from drawer to drawer, then climbs the ladder to NUNTA
  const path = [[82, 300, 900], [84, 960, 900], [86, 1620, 900], [88, 1420, 900], [90.5, 1420, 340], [93.5, 1420, 340]];
  let cx = 300, cy = 900, walking = false;
  for (let i = 1; i < path.length; i++) { const [t0, x0, y0] = path[i - 1], [t1, x1, y1] = path[i]; if (t >= t0 && t < t1) { const u = ss(seg(t, t0, t1)); cx = lerp(x0, x1, u); cy = lerp(y0, y1, u); walking = true; } else if (t >= t1) { cx = x1; cy = y1; } }
  // ladder
  shape(rect(1380, 300, 16, 600), { fill: '#c4952e', lw: 5 }); shape(rect(1480, 300, 16, 600), { fill: '#c4952e', lw: 5 });
  for (let k = 0; k < 10; k++) shape(rect(1380, 330 + k * 60, 116, 12), { fill: '#c4952e', lw: 4 });
  clerk(cx, cy, .9, { t, walk: walking && t < 90.5, up: t > 88 && t < 93.5, shrug: t > 95.5 ? ss(seg(t, 95.5, 96.2)) : 0, look: t > T.moth ? [.6, -.8] : [.6, 0] });
};
// —— subtitles, end card ——
const WHO_COL = { TATA: '#6e737e', MAMA: '#3a7bd5', ANDREI: '#e2523b' };
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = VO.map(([id, t0]) => {
  const L_ = LINE[id], s = L_.sub || L_.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .45, .9 + s.length / 17);
  const c = CUTS.find(x => x > t0 + d); if (c && t1 > c) t1 = Math.max(c - .02, t0 + d + .1);
  return { id, t0, t1, who: L_.who, text: s };
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
    g.globalAlpha = 1; y = y0 - 84;
  }
}
function endCard(t) {
  reset(); screenRect('#121426');
  // the loading spinner, big, behind the title
  const k = Math.floor(t * 12) % 8;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, f = ((i - k + 8) % 8) / 8; reset(); dot(960 + Math.cos(a) * 300, 560 + Math.sin(a) * 300, 34, `rgba(232,40,60,${.12 + .7 * (1 - f)})`); }
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 470); scale(s); rotate(-.03);
  text('TATA ȘI PAROLA', 12, 12, { font: '400 130px Bungee', fill: '#e8283c', outlineW: 22, outlineCol: INK });
  text('TATA ȘI PAROLA', 0, 0, { font: '400 130px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Partea 1 din 3: Parola', 960, 610, { font: '400 64px VT323', fill: '#ffe066', outlineW: 9 });
  CREDITS.forEach((c, i) => text(c, 960, 960 + i * 38, { font: '700 27px "Baloo 2"', fill: 'rgba(255,255,255,.85)' }));
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
  for (let x = .3; x < 3.1; x += 1 / 3) add('key', x, { v: .5 });
  add('spinner', T.spin[0], { d: T.spin[1] - T.spin[0] }); add('spinner', T.spin2[0], { d: T.spin2[1] - T.spin2[0] });
  for (let i = 0; i <= 17; i++) add('key', KEYWALK[0] + i * (KEYWALK[1] - KEYWALK[0]) / 18);
  add('ding', KEYWALK[1]);
  add('lapse', LAPSE[0], { d: LAPSE[1] - LAPSE[0] });
  [46.0, 46.4, 46.8].forEach(x => add('key', x, { v: .8 })); [47.0, 47.2, 47.4, 47.6, 48.0, 48.2, 48.4].forEach(x => add('key', x, { v: .6 }));
  add('steps', T.dogIn[0], { d: T.dogIn[1] - T.dogIn[0] });
  T.barks.forEach((b, i) => { add('buzz', b - .5); add('bark', b, { v: 1 + i * .1 }); });
  add('drawer', 84.2); add('drawer', 86.2); add('drawer', T.drawer); add('moth', T.moth, { d: 3 }); add('creak', 90.5);
  add('steps', T.mamaOut[0], { d: T.mamaOut[1] - T.mamaOut[0] }); add('slam', T.slam); add('crash', T.photoFall + .5); add('whimper', T.photoFall + 1.2);
  add('slam', T.end, { v: .6 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [];
  const [, , name] = shotAt(t);
  if (name === 'tag') out.push({ id: 'rexy', text: 'REXY', x0: 760, y0: 470, x1: 1160, y1: 610 });
  if (t >= T.end + .5) out.push({ id: 'title', text: 'TATA ȘI PAROLA Partea 1 din 3: Parola', x0: 300, y0: 380, x1: 1620, y1: 650 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 930, x1: 1720, y1: 1020, pass: true });
  return out;
};
function thumb() {
  const t = 14.5; frame(t); screenRect('#000');
  cam(980, 330, 2.0); living(t, { to: { lensUp: 0, sweat: t } });
  reset(); translate(1460, 860); rotate(-.04);
  text('PAROLA?', 12, 12, { font: '400 170px Bungee', fill: '#e8283c', outlineW: 28, outlineCol: INK });
  text('PAROLA?', 0, 0, { font: '400 170px Bungee', fill: '#fff3d6', outlineW: 28, outlineCol: INK });
}
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
if (new URLSearchParams(location.search).has('thumb')) { window.render = thumb; thumb(); }
else render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
