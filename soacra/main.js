// Soacra și GPS-ul — 3D-look sitcom toon, 50 s, fast
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset, lightPass } from './toon.js';
import { ginere, wheel, soacra, mapSheet, veta, chicken, feather, gps } from './cast.js';
import { carInside, carFront, dashboard, car, speedLines, road, field, farm } from './sets.js';
import { DUR, q, VO, SHOTS, shotAt, GPSAT, T, CUES, CREDITS } from './story.js';

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
    return { o: lp ? (lp.o[k] ?? 0) : .4, w: .8 + .45 * (lp ? (lp.b[k] ?? .5) : .5), talking: true };
  }
  return { o: 0, w: 1, talking: false };
}
function cam(cx, cy, z, shake = 0, t = 0, rot = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); if (rot) rotate(rot); translate(-cx, -cy);
}
const gpsAt = t => { let k = GPSAT[0][1]; for (const [a, v] of GPSAT) if (t >= a) k = v; return k; };
const GPSP = [1120, 965];

// —— inside the car: back seat, front seats, the driver, the wheel, the dashboard with the GPS ——
function inside(t, { so = {}, gi = {}, turn = 0, speed = 1, farmView = false, chickenOnHead = false } = {}) {
  carInside(t, speed, farmView ? 'farm' : 'road');
  const ms = talk('SOACRA', t);
  soacra({ x: 960, y: 880, s: 1.05, t, map: 0, mouth: { o: ms.o, w: ms.w, sm: -.4 }, headTilt: ms.talking ? (ms.o - .3) * .05 : 0, ...so });
  carFront(t);
  const mg = talk('GINERE', t);
  ginere({ x: 560, y: 1120, s: 1.1, t, look: [.3, -.6], mouth: { o: mg.o, w: mg.w, sm: -.6 }, chicken: chickenOnHead, ...gi });
  wheel(560, 1000, turn);
  dashboard();
  gps(GPSP[0], GPSP[1], .8, gpsAt(t), t);
}

const SH = {};
SH.inside = (t, tq) => {
  const bump = t > 33 ? 0 : 3 + (Math.sin(t * 40) > .9 ? 6 : 0);
  if (t < 3.2) {   // the hook: the map unfolds to the size of a bedsheet
    cam(940, 640, 1.25, bump, t);
    const u = back(seg(t, T.unfold[0], T.unfold[1]), 1.6);
    inside(t, { gi: { look: [0, -.2], lid: .2, brow: 1 } });
    reset(); cam(940, 640, 1.25, bump, t); mapSheet(960, 520, u, t);
    return;
  }
  if (t < 35) {   // after the crash: frozen, a chicken on his head, feathers drifting
    cam(900, 680, 1.35);
    inside(t, { speed: 0, farmView: true, chickenOnHead: t > T.chickenHead, gi: { lid: 0, eyeS: 1.3, look: [0, 0], brow: 2.4, mouth: { o: .3, sm: -.8 } }, so: { lid: .5, look: [.3, 0] } });
    for (let i = 0; i < 16; i++) { const u = ((t - 33) * .3 + hash(i)) % 1; feather(200 + hash(i + 2) * 1500, u * 1100 - 50, Math.sin(t * 2 + i), .9); }
    return;
  }
  // she leans in and pats the GPS: "Și tu, ia notițe."
  cam(1020, 640, 1.2, 0, t);
  inside(t, { speed: 0, farmView: true, gi: { lid: .5, look: [.6, .3], brow: 1, mouth: { o: talk('GINERE', t).o, sm: -.6 } }, so: { y: 900, look: [.6, .8], lid: .4, point: t > T.pat - .6 } });
};
SH.gps = (t) => { cam(GPSP[0], GPSP[1], 5.0, t > 13 && t < 14.4 ? 6 : 0, t); inside(t); };
SH.soacra = (t, tq) => {
  const bump = 3 + (Math.sin(t * 40) > .9 ? 6 : 0);
  cam(980, 500, 2.0, bump, t);
  const pointing = (t > 6.4 && t < 8.9) || (t > 14.4 && t < 15.4);
  const o = t > 35 ? { map: lerp(.32, 0, ss(seg(t, T.fold, T.fold + .8))), mapY: -40, mapX: -120, look: [0, 0], lid: .55, brow: -.4, mouth: { o: talk('SOACRA', t).o, sm: .5 } }
    : { map: .3, mapY: -40, mapX: -160, mapRot: .15, point: pointing, look: [.5, 0], lid: .2, brow: -1.6 };
  inside(t, { so: o });
};
SH.driver = (t, tq) => {
  cam(560, 760, 1.9, 4, t);
  const dart = Math.floor(t * 4) % 2 ? [-.8, .6] : [.8, -.6];
  const turn = t > T.turn ? -ss(seg(t, T.turn, T.turn + .3)) * 1.4 : 0;
  inside(t, { turn, gi: { look: t < 10 ? dart : [.2, -.8], eyeS: 1.25, lid: 0, brow: 2.4, sweat: t * 1.6, lean: turn * .08 } });
};
SH.road = (t) => {
  const sw = ss(seg(t, T.swerve[0], T.swerve[1]));
  cam(960, 600, 1.0, 5, t);
  road(t, t * 1400, { fork: true });
  speedLines(t, 1);
  car(lerp(700, 1100, sw), lerp(860, 980, sw), .9, { t, tilt: Math.sin(sw * Math.PI) * .18, bounce: Math.abs(Math.sin(t * 18)) * 8 });
  if (sw > 0) for (let i = 0; i < 8; i++) { const u = clamp(sw * 1.4 - i * .05); shape(ell(lerp(700, 1100, sw) - 300 - i * 50, 960 - u * 80, 40 + u * 60, 30 + u * 40, 14), { fill: `rgba(200,180,140,${.7 * (1 - u)})`, lw: 3 }); }
};
function montage(t, kind) {
  cam(960, 560, 1.0, 7, t);
  field(t, t * 2000, kind);
  speedLines(t, 1.4);
  const b = kind === 'bridge' ? Math.abs(Math.sin(t * 9)) * 60 : Math.abs(Math.sin(t * 14)) * 14;
  const sq = 1 - Math.max(0, Math.sin(t * 9)) * .05;
  if (kind === 'corn') { car(960, 900, .85, { t, bounce: b, mud: 1 }); field(t, t * 2000, 'corn'); reset(); cam(960, 560, 1.0, 7, t); mapSheet(760 + Math.sin(t * 20) * 20, 560, .25, t, Math.sin(t * 12) * .4); return; }
  car(960, kind === 'bridge' ? 780 : 900, .85, { t, bounce: b, mud: kind === 'mud' || kind === 'corn' ? 1 : 0 });
  if (kind === 'mud') for (let i = 0; i < 10; i++) { const u = (t * 3 + hash(i)) % 1; shape(ell(760 + hash(i + 1) * 400, 880 - u * 300 + u * u * 300, 22, 18, 12), { fill: '#6a4a2a', lw: 4 }); }
}
SH.cows = (t) => montage(t, 'cows'); SH.bridge = (t) => montage(t, 'bridge'); SH.mud = (t) => montage(t, 'mud'); SH.corn = (t) => montage(t, 'corn');
SH.crash = (t) => {
  const u = ss(seg(t, 29.4, T.stop));
  cam(lerp(500, 760, u), 520, lerp(1.0, .9, u), t > T.fence && t < T.fence + .5 ? 18 * (1 - (t - T.fence) / .5) : 0, t);
  farm(t, { fence: t > T.fence ? 0 : 1 });
  const x = lerp(-600, 700, eo(u));
  // chickens: walking before the crash, exploding into the air after it, landing again
  for (let i = 0; i < 14; i++) {
    const hx = 100 + i * 110, after = t - T.fence, fly = after > 0 && after < 2.2;
    const y = fly ? 820 - Math.sin(clamp(after / 2.2) * Math.PI) * (300 + hash(i) * 400) : 820 + (i % 3) * 30;
    chicken(hx + (fly ? (hash(i + 4) - .5) * after * 500 : Math.sin(t * 2 + i) * 20), y, .8, { t, fly: fly ? 1 : 0, face: hash(i) > .5 ? 1 : -1, seed: i });
  }
  car(x, 900, .85, { t, tilt: t > T.stop ? -Math.sin((t - T.stop) * 12) * .05 * Math.exp(-(t - T.stop) * 3) : 0, bounce: t < T.stop ? Math.abs(Math.sin(t * 16)) * 14 : 0, mud: 1, wheels: t < T.stop ? 1 : 0 });
  if (t > T.fence) for (let i = 0; i < 40; i++) { const a = hash(i) * TAU, r = (t - T.fence) * (300 + hash(i + 1) * 500); feather(x + 200 + Math.cos(a) * r, 700 + Math.sin(a) * r * .6 + (t - T.fence) * 120, a + t * 3, 1.1); }
  if (t > T.stop + .4) chicken(x + 40, 900 - 360 * .85, .7, { t });   // one lands on the roof
};
SH.veta = (t) => {
  cam(1250, 520, 1.15);
  farm(t, { fence: 0 });
  car(500, 900, .85, { t, mud: 1, wheels: 0 }); chicken(540, 594, .7, { t });
  for (let i = 0; i < 8; i++) chicken(800 + i * 120, 860 + (i % 2) * 40, .7, { t, face: i % 2 ? 1 : -1, seed: i });
  const m = talk('VETA', t);
  veta({ x: 1560, y: 650, s: .9, look: [-.7, .1], mouth: { o: m.o, w: m.w, sm: .1 } });
};

// —— subtitles, end card ——
const WHO_COL = { GPS: '#1f3a5a', SOACRA: '#7a3fb0', GINERE: '#3a7bd5', VETA: '#e2523b' };
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = VO.map(([id, t0]) => {
  const L_ = LINE[id], s = L_.sub || L_.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .4, .9 + s.length / 17);
  const c = CUTS.find(x => x > t0 + d); if (c && t1 > c) t1 = Math.max(c - .02, t0 + d + .1);
  if (id === 'g2' && t0 > 19) t1 = Math.min(t1, t0 + .85);
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
  reset(); screenRect('#1f3a5a');
  for (let i = 0; i < 9; i++) chicken(((i * 260 + t * 200) % 2300) - 200, 980 - Math.abs(Math.sin(t * 6 + i)) * 40, .8, { t, face: 1, seed: i });
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 420); scale(s); rotate(-.04);
  text('SOACRA ȘI GPS-UL', 12, 12, { font: '400 130px Bungee', fill: '#e2523b', outlineW: 22, outlineCol: INK });
  text('SOACRA ȘI GPS-UL', 0, 0, { font: '400 130px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset(); g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Recalculare...', 960, 560, { font: '400 72px VT323', fill: '#ffe066', outlineW: 9 });
  CREDITS.forEach((c, i) => text(c, 960, 690 + i * 38, { font: '700 27px "Baloo 2"', fill: 'rgba(255,255,255,.9)', outlineW: 6 }));
  g.globalAlpha = 1;
}
function render(t) {
  frame(t); screenRect('#000');
  const [, , name] = shotAt(t);
  if (name === 'end') endCard(t); else { SH[name](t, q(t)); lightPass(); }
  subs(t);
}
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  VO.forEach(([id, t0], i) => add('vo', t0, { id, who: LINE[id].who, rate: id === 'g2' && t0 > 19 ? 1 + (t0 - 19) * .08 : 1 }));
  for (const c of CUES) add('cue', c.t0, c);
  add('engine', 0, { d: 29.9 }); add('map', T.unfold[0]); add('ding', 3.3);
  add('whoosh', 8.9); add('skid', T.turn); add('skid', T.swerve[0]); add('honk', 19.8); add('moo', 20.3); add('honk', 24.4);
  for (let x = 21.0; x < 22.2; x += .3) add('plank', x); add('splash', 22.3); add('splash', 22.8);
  add('rustle', 23.3, { d: 1 }); add('rustle', 25.2, { d: 1.8 });
  add('sad', 27.1); add('crash', T.fence); add('cluck', T.fence + .1, { d: 3 }); add('brake', T.stop - .3); add('thud', T.stop);
  add('cluck', 33.3, { d: 1 }); add('map', T.fold); add('cluck', 37.0, { d: 3 }); add('tap', T.pat); add('ding', 42.4);
  add('slam', T.end, { v: .6 }); add('cluck', T.end + .3, { d: 4 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [], [, , name] = shotAt(t);
  if (name === 'road') out.push({ id: 'sign', text: '← VETA? NU', x0: 1250, y0: 420, x1: 1540, y1: 520, pass: true });
  if (name === 'gps' && t > 43.5) out.push({ id: 'fav', text: '★ FAVORITE Mătușa Veta (prin găini)', x0: 300, y0: 200, x1: 1620, y1: 880 });
  if (t >= T.end + .2) out.push({ id: 'title', text: 'SOACRA ȘI GPS-UL', x0: 260, y0: 330, x1: 1660, y1: 500 });
  if (t >= T.end + .7) out.push({ id: 'tag', text: 'Recalculare...', x0: 700, y0: 520, x1: 1220, y1: 600 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 670, x1: 1720, y1: 740, pass: true });
  return out;
};
function thumb() {
  const t = 31.6; frame(t); screenRect('#000');
  cam(700, 540, 1.05); SH.crash(t);
  lightPass();
  reset(); translate(1380, 200); rotate(.05);
  text('RECALCULARE', 12, 12, { font: '400 120px Bungee', fill: '#e2523b', outlineW: 24, outlineCol: INK });
  text('RECALCULARE', 0, 0, { font: '400 120px Bungee', fill: '#fff3d6', outlineW: 24, outlineCol: INK });
}
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
if (new URLSearchParams(location.search).has('thumb')) { window.render = thumb; thumb(); }
else render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
