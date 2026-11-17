// Telecomanda — Sci-Fi Sitcom Toon, episode 2
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { doru, ilinca, receiver } from './chars.js';
import { portal } from './worlds.js';
import { world, sofaBack, sofaFront, tv, screenArt, setNovelaO, dino, TVS } from './sets.js';
import { DUR, q, VO, SHOTS, shotAt, ZAPS, WIPES, TAGS, T, CUES, CREDITS } from './story.js';

const cv = document.getElementById('c'); init(cv);
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
const vdur = id => DURS[id] ?? .5;

function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of VO) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + vdur(id)) {
      const k = Math.floor((tq - t0) * 24), lp = LIPS[id];
      const o = lp ? (lp.o[k] ?? 0) : .4, b = lp ? (lp.b[k] ?? .5) : .5;
      return { o, w: .8 + .45 * b - .2 * o, talking: true };
    }
  }
  return { o: 0, w: 1, talking: false };
}
const blinks = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 30); return hash(c * 7.1 + seed) > .35 && (k % 30 === Math.floor(hash(c + seed) * 20)); };
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const pressAt = t => ZAPS.some(z => t >= z && t < z + .2) ? 1 : 0;

// —— the cast ——
const IX = 820, IY = 842, IS = 1.12, DX = 1420, FLOOR = 900;
const COSTUME = { dino: null, roma: 'toga', gheata: 'ice', disco: 'disco', pirati: 'pirate', spatiu: 'space' };
const POINT = { h: [138, -6], bend: 26 };                 // Ilinca points the remote at the TV (she faces left)
function I(t, o = {}) {
  const m = talk('ILINCA', t), tq = q(t);
  return { x: IX, y: IY, s: IS, face: -1, t, nerv: 0, lid: .55, brow: .2, look: [.5, 0], blink: blinks(t, 3), mouth: { o: m.o, w: m.w, sm: -.3 },
    holdR: 'remote', armR: POINT, armL: { h: [10, 110], bend: -10 }, press: pressAt(t), glow: .35, sq: 1 + .01 * Math.sin(tq * 2.6),
    headTilt: m.talking ? (m.o - .3) * .06 : 0, ...o };
}
function D(t, w, o = {}) {
  const m = talk('DORU', t), tq = q(t);
  const c = COSTUME[w];
  return { x: DX, y: FLOOR, s: 1, face: -1, lid: .2, look: [.5, 0], brow: 1.2, blink: blinks(t, 11), mouth: { o: m.o, w: m.w, sm: -.4 },
    costume: c, disco: w === 'disco', armR: { h: [-150, 30], bend: -40 }, armL: { h: [-30, 180], bend: -16 }, sq: 1 + .008 * Math.sin(tq * 2.3),
    headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), ...o };
}
const remotePos = () => [IX - (52 + POINT.h[0]) * IS, IY + (-266 + POINT.h[1] - 26) * IS];
function stage(t, w, oi = {}, od = {}, tvScreen = 'static') {
  world(w, t);
  if (w === 'dino') dino(t, ss(seg(t, T.dinoUp, T.dinoUp + .6)), 0);
  tv(t, tvScreen);
  sofaBack();
  ilinca(I(t, oi));
  sofaFront();
  if (od !== null) {
    let dp = D(t, w, od);
    if (w === 'spatiu') { push(); translate(DX, 520); rotate(2.4 + t * .8); translate(-DX, -520); doru({ ...dp, y: 820 }); pop(); }
    else doru(dp);
  }
  if (w === 'dino' && t >= T.dinoUp) { const L = seg(t, T.lick[0], T.lick[1]); dino(t, 1, L > 0 && L < 1 ? Math.sin(L * Math.PI) : 0); }
}

// ———————————————— shots ————————————————
const SH = {};
SH.tvIns = (t) => {
  cam(335, 650, lerp(3.4, 3.8, ss(seg(t, 0, 2.4))));
  stage(t, 'acasa');
};
SH.iCU = (t, tq, w) => {
  cam(IX - 40, 470, 2.2, w === 'acasa' && t > 41.6 && t < 42.0 ? 12 : 0, t);
  if (w === 'acasa' && t < 10) {         // bored; the remote rises at T.reach
    const up = ss(seg(tq, T.reach, T.reach + .4));
    stage(t, w, { armR: { h: [lerp(30, 112, up), lerp(110, -40, up)], bend: 30 }, lid: .6, look: [.6, .2] }, null);
  } else if (w === 'dino') stage(t, w, { lid: .6, look: [.6, .2], brow: 0 }, null);
  else stage(t, w, { holdR: null, armR: { h: [40, -150], bend: 30 }, armL: { h: [-20, -150], bend: -30 }, lid: 0, eyeS: 1.25, pupil: 3, brow: 2, look: [.8, -.2], mouthS: 1.3, nerv: .4 }, null);
};
SH.thumb = (t, tq, w) => {
  const [rx, ry] = remotePos();
  cam(rx, ry, 3.2);
  stage(t, w, { lid: .6 });
};
SH.wide = (t, tq, w) => {
  cam(960, 560, 1.0);
  if (w === 'acasa') {   // Doru lunges, grabs the remote, steps back
    const go = ss(seg(tq, 33.15, T.grab)), back_ = ss(seg(tq, T.grab + .2, T.grab + .8)), has = tq >= T.grab;
    const x = lerp(lerp(DX, 1150, go), DX, back_);
    stage(t, w, has ? { holdR: null, armR: { h: [60, 80], bend: 20 }, lid: .3, look: [-.6, -.2], brow: 1 } : { lid: .5 },
      { x, armR: has ? { h: [-70, 40], bend: -30 } : { h: [lerp(-60, -260, go), lerp(60, -20, go)], bend: -30 }, holdR: has ? 'remote' : null, glow: .3, lid: has ? .55 : 0, brow: has ? .4 : 1.6, look: [.3, 0] },
      tq >= T.tvOn ? 'novela' : 'static');
    return;
  }
  if (w === 'dino') {
    const licked = t > T.lick[1];
    stage(t, w, { lid: .6, look: [.7, .2] }, { lid: licked ? 0 : .3, look: licked ? [0, -.6] : [.5, -.5], brow: 2, slime: licked, armR: { h: [-40, 190], bend: -10 }, sweat: licked ? t : null });
    return;
  }
  // the 1-second eras: Doru reaches in, cut off by "Nu."
  stage(t, w, { lid: .6, look: [.6, .1] }, { brow: 1.6, lid: 0 });
};
SH.dCU = (t, tq, w) => {
  if (w === 'dino') {
    cam(DX - 20, 360, 2.1);
    stage(t, w, {}, { slime: true, lid: 0, eyeS: 1.2, look: [-.2, -.7], brow: 2, armR: { h: [-40, 190], bend: -10 } });
    return;
  }
  // home, the button: deadpan "Nu." and the click
  cam(DX - 40, 400, 2.2);
  stage(t, w, { holdR: null }, { holdR: 'remote', armR: { h: [-90, 30], bend: -30 }, press: pressAt(t) || (t >= 45.7 ? 1 : 0), glow: t >= 45.7 ? 1 : .4, lid: .58, look: [-.2, .1], brow: 0 }, 'novela');
};
SH.novela = (t) => {
  setNovelaO(talk('TELEVIZOR', t).o * .9);
  cam(335, 650, lerp(4.4, 4.7, seg(t, 37.2, 41.6)));
  stage(t, 'acasa', {}, {}, 'novela');
};
SH.y3000 = (t, tq) => {
  const u = ss(seg(t, 25.4, 31.6));
  cam(lerp(1300, 1420, u), lerp(560, 500, u), lerp(.8, .98, u));
  world('an3000', t);
  tv(t, 'static'); sofaBack();
  ilinca(I(t, { lid: tq > 27 ? 0 : .5, eyeS: tq > 27 ? 1.2 : 1, look: [-.9, -.1], face: 1, armR: { h: [60, 60], bend: 20 }, brow: tq > 27 ? 1.6 : .4, x: 820 }));
  sofaFront();
  doru({ x: 1310, y: FLOOR, s: 1, face: 1, lid: tq > 27 ? 0 : .4, look: [.8, 0], brow: 1.4, mouth: { o: 0, sm: -.6 }, armR: { h: [20, 186], bend: 16 } });
  // their own year-3000 selves, still on hold
  const turned = tq >= 26.8, m = talk('ILINCA BĂTRÂNĂ', t);
  doru({ x: 2080, y: FLOOR, s: 1, face: -1, age: 2, lid: .6, look: [-.4, 0], mouth: { o: 0, sm: -.3 } });
  ilinca({ x: 1760, y: FLOOR, s: 1.12, face: turned ? -1 : 1, age: 2, lid: turned ? .25 : .6, look: [-.6, 0], holdL: 'phone', armL: { h: [-16, -62], bend: -20 }, armR: { h: [-30, 128], bend: 20, fist: true }, mouth: { o: m.o, w: m.w, sm: -.4 }, brow: .6 });
};

// —— full-screen swirl wipe ——
function wipe(t) {
  for (const [tc, w] of WIPES) { const u = 1 - Math.abs(t - tc) / w; if (u > 0) { reset(); portal(960, 540, 1500 * ss(u), t * 2, { open: 1, sx: 1.4 }); } }
}
function tag(t) {
  for (const [a, b, label, bg, fg] of TAGS) {
    if (t < a || t >= b) continue;
    const n = Math.min(label.length, Math.floor(q(t - a) * 30));
    reset(); translate(60, 60);
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 54px VT323'; const tw = g.measureText(label).width;
    shape(rr(0, 0, tw + 48, 70, 10), { fill: bg, lw: 6 });
    text(label.slice(0, n), 24, 38, { font: '400 54px VT323', fill: fg, align: 'left' });
  }
}
const WHO_COL = { DORU: '#d8961c', ILINCA: '#ff5f97', 'ILINCA BĂTRÂNĂ': '#b9a3c9', TELEVIZOR: '#8a1f3a' };
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = VO.map(([id, t0]) => {
  const L = LINE[id], s = L.sub || L.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .45, .9 + s.length / 17);
  if (id === 'nu') t1 = t0 + .7;   // the machine gun: each "Nu." leaves with its world
  const c = [7.5, 18.3, 20.6, 21.6, 22.6, 23.6, 24.6, 33.0, 46.0].find(x => x > t0 + .1); if (c && t1 > c) t1 = Math.max(c - .02, t0 + d + .1);
  return { id, t0, t1, who: L.who, text: s };
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
    shape(rr(0, -22, nw, 44, 14), { fill: WHO_COL[s.who], lw: 5 });
    text(s.who, nw / 2, 2, { font: '800 26px "Baloo 2"', fill: '#fff' });
    pop();
    text(s.text, x0 + nw + 22, y, { font: '800 50px "Baloo 2"', fill: '#fff', align: 'left', outlineW: 11 });
    g.globalAlpha = 1; y -= 84;
  }
}
function endCard(t) {
  reset(); screenRect('#141c44');
  portal(960, 520, 420, t * .6, { open: spring(t - T.end, 7, .45), sx: 1 });
  screenRect('#141c44', .55);
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 330); scale(s); rotate(-.04);
  text('TELECOMANDA', 12, 12, { font: '400 150px Bungee', fill: '#3a5bc7', outlineW: 22, outlineCol: INK });
  text('TELECOMANDA', 0, 0, { font: '400 150px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Episodul 2', 960, 470, { font: '400 64px VT323', fill: '#ffe066', outlineW: 9 });
  CREDITS.forEach((c, i) => text(c, 960, 948 + i * 38, { font: '700 27px "Baloo 2"', fill: 'rgba(255,255,255,.85)' }));
  g.globalAlpha = 1;
}
function render(t) {
  frame(t); screenRect('#000');
  const [, , name, w] = shotAt(t);
  if (name === 'end') endCard(t); else SH[name](t, q(t), w);
  wipe(t); tag(t); subs(t);
}
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of VO) add('vo', t0, { id, who: LINE[id].who });
  for (const c of CUES) add('cue', c.t0, c);
  for (const [a, b, , w] of SHOTS) add('amb', a, { w, d: +(b - a).toFixed(3) });
  ZAPS.forEach(z => add('click', z)); for (const [tc] of WIPES) add('portalWhoosh', tc - .16);
  add('roar', T.dinoUp + .1); add('slurp', T.lick[0], { d: T.lick[1] - T.lick[0] }); add('squish', T.lick[1]);
  add('whoosh', 33.2); add('grab', T.grab); add('click', T.tvOn, { v: .6 }); add('click', 45.7); add('gasp', T.gasp - .05, { v: .4 });
  add('slam', T.end, { v: .8 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [];
  for (const [a, b, label] of TAGS) if (t >= a + .5 && t < b) out.push({ id: 'tag' + a, text: label, x0: 60, y0: 60, x1: 480, y1: 130, pass: b - a < 2.5 });   // the 1–2 s eras of the zapping montage are read as a blur on purpose
  if (t >= T.end + .5) out.push({ id: 'title', text: 'TELECOMANDA Episodul 2', x0: 380, y0: 250, x1: 1540, y1: 500 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 920, x1: 1720, y1: 1010, pass: true });
  return out;
};
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
// ?thumb=1: the YouTube thumbnail (render at 1920×1080, downscale to 1280×720)
function thumb() {
  const t = 9.75; frame(t); screenRect('#000');
  cam(1080, 430, 1.42); stage(t, 'dino', { lid: .62, look: [.7, .2] }, { lid: 0, eyeS: 1.2, look: [.5, -.6], brow: 2.2, armR: { h: [-40, 190], bend: -10 } });
  reset(); translate(360, 300); rotate(-.08);
  text('NU.', 14, 14, { font: '400 300px Bungee', fill: '#3a5bc7', outlineW: 30, outlineCol: INK });
  text('NU.', 0, 0, { font: '400 300px Bungee', fill: '#fff3d6', outlineW: 30, outlineCol: INK });
}
const isThumb = new URLSearchParams(location.search).has('thumb');
if (isThumb) { window.render = thumb; thumb(); } else render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
