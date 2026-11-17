// Tata și parola — part 2 "Investigația"
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { tata, tataStand, mama, andrei, rex, lens, eye } from './cast.js';
import { room, sofaArmFront, tvSet, TV, keyPos, KEYS } from './sets.js';
import { album, attic, paper, cellar, jarLabel, board, photo } from './sets2.js';
import { DUR, q, VO, SHOTS, shotAt, T, TYPED, CUES, CREDITS } from './story.js';

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
function cam(cx, cy, z, shake = 0, t = 0, rot = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); if (rot) rotate(rot); translate(-cx, -cy);
}
const FLOOR = 900, SX = 1000, AX = 1520, MX = 1840;
function Ts(t, o = {}) { const m = talk('TATA', t); return { x: SX, y: FLOOR, s: 1, face: -1, t, lid: .4, look: [-.6, 0], brow: .4, blink: blinks(t, 4), mouth: { o: m.o, w: m.w, sm: -.2 }, headTilt: m.talking ? (m.o - .3) * .05 : 0, ...o }; }
function Ap(t, o = {}) { const m = talk('ANDREI', t); return { x: AX, y: 790, s: 1, face: -1, look: [-.7, 0], lid: .55, brow: 0, blink: blinks(t, 8), mouth: { o: m.o, w: m.w, sm: -.4 }, grow: 1, popcorn: 0, headTilt: m.talking ? (m.o - .3) * .08 : 0, ...o }; }
function Mp(t, o = {}) { const m = talk('MAMA', t); return { x: MX, y: FLOOR, s: 1, face: -1, look: [-.8, 0], lid: .35, brow: -1, blink: blinks(t, 12), mouth: { o: m.o, w: m.w, sm: -.3 }, ...o }; }
function home(t, { field = 'DomnulRex1987', state = 'ultima', tata: to = {}, ao = {}, mama: mo = null, dog = null, boardOn = false, bo = {} } = {}) {
  room(t, {});
  if (boardOn) { push(); translate(0, 0); board(t, bo); pop(); }
  tvSet(t, { field, state });
  andrei(Ap(t, ao)); sofaArmFront();
  if (mo) mama(Mp(t, mo));
  if (dog) rex(dog.x, FLOOR, .9, dog);
  if (to !== null) tataStand(Ts(t, to));
}

const SH = {};
SH.stand = (t, tq) => {   // Tata rises in a deerstalker: the investigation begins
  const u = ss(seg(t, 0, 1.6));
  cam(lerp(SX - 40, 1050, ss(seg(t, 3, 7))), lerp(260, 520, ss(seg(t, 3, 7))), lerp(2.6, 1.05, ss(seg(t, 3, 7))));
  home(t, { field: '', state: '', tata: { sq: lerp(.8, 1, u), lensAt: [210, -620], look: [.9, -.2], lid: .2, brow: -.6 } });
};
SH.andrei = (t, tq) => {
  cam(AX - 20, 360, 2.1);
  home(t, { field: '', state: '', ao: t > 114 ? { look: [.1, 0], lid: .5 } : { look: [-1, 0] }, boardOn: t > 53 && t < 75, bo: { pinned: 6 } });
};
SH.album = (t, tq) => {
  const page = t < T.flip ? 0 : 1, flipU = seg(t, T.flip - .25, T.flip + .25);
  cam(960, 540, 1.0);
  album(t, page);
  if (flipU > 0 && flipU < 1) { push(); translate(960, 0); scale(Math.cos(flipU * Math.PI), 1); shape(rect(0, 150, 760, 800), { fill: '#fff6e0', lw: 6 }); pop(); }
  // the lens glides over the clues
  const lp = page === 0 ? [lerp(400, 600, ss(seg(t, 11.5, 14))), lerp(400, 560, ss(seg(t, 11.5, 14)))] : [lerp(500, 600, ss(seg(t, 19.6, 20.6))), 590];
  lens(lp[0], lp[1], 170, .2);
};
SH.attic = (t, tq) => {
  cam(960, 560, 1.0, t > T.dust && t < T.dust + .3 ? 6 : 0, t);
  attic(t, { dust: t > T.dust ? clamp((t - T.dust) / 1.5) : 0 });
  const up = ss(seg(t, T.popUp, T.popUp + .5)), climb = ss(seg(t, T.climb, T.climb + .8));
  if (t > T.trap) tataStand(Ts(t, { x: 960, y: lerp(lerp(1600, 1240, up), 860, climb), look: [.4, -.2], lid: 0, brow: 1, lens: true, lensAt: [210, -560] }));
  shape(rect(-400, 900, 2800, 400), { fill: '#7a5a40', lw: 7 });   // floor in front of the trapdoor hides his legs
  if (t > T.papers[0]) for (let i = 0; i < 14; i++) { const u = ((t - T.papers[0]) * .7 + hash(i)) % 1; push(); translate(1490 + Math.sin(i + t) * 200 * u, 600 - u * 500); rotate(u * 6 + i); shape(rect(-40, -30, 80, 60), { fill: '#fffaf0', lw: 4 }); pop(); }
};
SH.paper = (t) => { cam(960, 540, 1.0); paper(t); lens(lerp(760, 900, ss(seg(t, 36, 38))), 450, 200, .2); if (t > T.toss) { reset(); fillOnly(rect(0, 0, W, H), 'rgba(0,0,0,0)'); } };
SH.cellar = (t, tq) => {
  cam(960, 520, 1.0);
  cellar(t, { gone: t > T.rexJar[0] + .6 });
  tataStand(Ts(t, { x: lerp(400, 1100, ss(seg(t, 41, 49))), face: 1, look: [-.4, -.6], lid: 0, brow: 1.2, lensAt: [180, -620], legs: Math.floor(t * 6) % 2 ? [[10, 0], [-10, -10]] : [[-10, -10], [10, 0]] }));
  if (t > T.rexJar[0] && t < T.rexJar[1]) { const u = seg(t, T.rexJar[0], T.rexJar[1]); push(); rex(lerp(1700, -200, u), FLOOR, .9, { face: -1, t, walk: true }); pop(); jarLabel(lerp(1700, -200, u) - 150, FLOOR - 120, .5); }
};
SH.jar = (t) => {   // insert: Rex trotting off with jar 1991, unseen
  cam(960, 700, 2.2);
  cellar(t, { gone: true });
  const u = seg(t, 50, 53); rex(lerp(1300, 600, u), FLOOR, .9, { face: -1, t, walk: true }); jarLabel(lerp(1300, 600, u) - 150, FLOOR - 120, .5);
};
SH.board = (t, tq) => {
  cam(1000, 480, 1.0);
  const pinned = t < T.pins[0] ? 0 : Math.min(6, 1 + Math.floor((t - T.pins[0]) / ((T.pins[1] - T.pins[0]) / 6)));
  const fall = t > T.boardFall ? ei(seg(t, T.boardFall, T.boardFall + .7)) : 0;
  room(t, {});
  board(t, { pinned, fall });
  tvSet(t, { field: '', state: '' });
  andrei(Ap(t, { look: [-.6, -.4] })); sofaArmFront();
  // Rex runs across tangled in red string, dragging the strings
  if (t > T.tangle[0] && t < T.tangle[1]) { const u = seg(t, T.tangle[0], T.tangle[1]); const rx = lerp(-200, 2200, u); rex(rx, FLOOR, .9, { face: 1, t, walk: true }); for (let k = 0; k < 3; k++) stroke([[rx + 130, FLOOR - 90], [lerp(rx, 900, .5), 400 + k * 80], [600 + k * 300, 300 + k * 100]], 5, { line: '#e8283c' }); }
  tataStand(Ts(t, { x: 1250, face: -1, look: [-.8, -.3], lid: .2, other: t < T.pins[1] ? [-200 - Math.sin(t * 6) * 30, -520] : [-120, -300], point: t < T.pins[1], lensAt: [200, -580] }));
};
SH.tataCU = (t, tq) => {
  cam(SX - 40, 260, 2.3);
  home(t, { boardOn: t < 75, bo: { pinned: 6 }, field: '', state: '', tata: t > 104 ? { look: [.9, 0], lid: .5, brow: 1, sweat: t, pipe: false } : { look: [-.3, -.2], lid: .3, brow: -1 } });
};
SH.keys = (t, tq) => {
  const n = Math.max(0, Math.min(TYPED.length, Math.floor((t - T.typing[0]) / ((T.typing[1] - T.typing[0]) / TYPED.length)) + 1));
  cam(TV.x + TV.w / 2, TV.y + 200, 2.3);
  room(t, {}); tvSet(t, { field: TYPED.slice(0, n), state: '' });
};
SH.finger = (t) => {   // slow motion: the finger approaches the OK key
  const u = ss(seg(t, 78, 85.6));
  cam(lerp(560, 640, u), lerp(420, 380, u), lerp(2.0, 3.6, u));
  room(t, {}); tvSet(t, { field: TYPED, state: '' });
  push(); translate(lerp(1100, 700, u), lerp(560, 420, u)); rotate(-.2);
  shape(rr(0, -40, 360, 80, 40), { fill: '#f0c49a', lw: 7 }); shape(rr(-10, -30, 120, 60, 30), { fill: '#f0c49a', lw: 6 }); stroke([[30, -30], [30, 30]], 4);
  pop();
};
SH.mama = (t, tq) => {
  cam(MX - 60, 300, 2.0, t > 84.4 && t < 85 ? 10 : 0, t);
  home(t, { field: TYPED, state: t > 100 ? 'blocat' : '', mama: t > 100 ? { lid: .55, brow: -.4, look: [-1, 0] } : { lid: 0, brow: 1.4, look: [-1, 0] } });
};
SH.block = (t) => {
  const zoomOut = ss(seg(t, 89, 92));
  cam(lerp(TV.x + TV.w / 2, 960, zoomOut), lerp(TV.y + 180, 520, zoomOut), lerp(2.2, 1.0, zoomOut), t > T.lock && t < T.lock + .4 ? 12 : 0, t);
  room(t, {}); tvSet(t, { field: TYPED, state: t < T.lock ? 'gresit' : 'blocat' });
  andrei(Ap(t, { lid: 0, brow: 2, look: [-1, 0] })); sofaArmFront();
  tataStand(Ts(t, { look: [-.9, 0], lid: 0, brow: 2, pipe: false }));
};
SH.andreiSlow = (t) => {   // Andrei slides to his knees in slow motion, the camera turns
  const u = ss(seg(t, T.kneel[0], T.kneel[1]));
  cam(AX - 20, lerp(360, 460, u), 2.0, 0, t, Math.sin(seg(t, 92, 98) * Math.PI) * .25);
  room(t, {}); tvSet(t, { field: TYPED, state: 'blocat' });
  andrei(Ap(t, { y: 790 + u * 120, look: [0, -1], lid: 0, brow: 2.6, mouth: { o: talk('ANDREI', t).o * 1.4, sm: -.8 } }));
};
SH.silence = (t) => { cam(1050, 520, 1.05); home(t, { state: 'blocat', tata: { look: [-.9, 0], lid: .3, brow: 1, pipe: false }, ao: { y: 900, lid: .3, brow: 1.4 } }); };
SH.jarDrop = (t) => {
  cam(SX - 120, 600, 1.6);
  home(t, { state: 'blocat', tata: { look: [.5, .9], lid: 0, brow: 1, pipe: false, lensAt: [140, -300] }, dog: { x: lerp(-200, 640, ss(seg(t, 108, 109.8))), face: 1, t, walk: t < 109.8 } });
  if (t < T.dropJar) jarLabel(lerp(-200, 640, ss(seg(t, 108, 109.8))) + 150, FLOOR - 120, .5); else jarLabel(800, FLOOR, .5);
};
SH.spin = (t) => { cam(SX - 60, 260, 2.6 + ss(seg(t, 112, 114.4)) * .8); home(t, { state: 'blocat', tata: { spin: t, pipe: false, sweat: t } }); };

// —— subtitles, end card ——
const WHO_COL = { TATA: '#6e737e', MAMA: '#3a7bd5', ANDREI: '#e2523b' };
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = VO.map(([id, t0]) => {
  const L_ = LINE[id], s = L_.sub || L_.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .45, .9 + s.length / 17);
  const c = CUTS.find(x => x > t0 + d); if (c && t1 > c) t1 = Math.max(c - .02, t0 + d + .1);
  return { id, t0, t1, who: L_.who, text: s };
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
  reset(); screenRect('#121426');
  const k = Math.floor(t * 12) % 8;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, f = ((i - k + 8) % 8) / 8; reset(); dot(960 + Math.cos(a) * 300, 560 + Math.sin(a) * 300, 34, `rgba(232,40,60,${.12 + .7 * (1 - f)})`); }
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 470); scale(s); rotate(-.03);
  text('TATA ȘI PAROLA', 12, 12, { font: '400 130px Bungee', fill: '#e8283c', outlineW: 22, outlineCol: INK });
  text('TATA ȘI PAROLA', 0, 0, { font: '400 130px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Partea 2 din 3: Investigația', 960, 610, { font: '400 64px VT323', fill: '#ffe066', outlineW: 9 });
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
  add('flip', T.flip); add('creak', T.trap); add('poof', T.dust); add('paper', T.papers[0], { d: T.papers[1] - T.papers[0] }); add('whoosh', T.toss);
  add('steps', T.rexJar[0], { d: 3 }); add('clink', T.rexJar[0] + .6);
  for (let k = 0; k < 6; k++) add('pin', T.pins[0] + k * (T.pins[1] - T.pins[0]) / 6);
  add('steps', T.tangle[0], { d: 3 }); add('crash', T.boardFall + .5);
  for (let k = 0; k < TYPED.length; k++) add('key', T.typing[0] + k * (T.typing[1] - T.typing[0]) / TYPED.length);
  add('heartbeat', 78.4, { d: 7 }); add('key', T.press, { v: 1.5 }); add('buzz', 86.2); add('lockfx', T.lock);
  add('clink', T.dropJar); add('spinner', T.spin[0], { d: T.spin[1] - T.spin[0] });
  add('slam', T.end, { v: .6 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [], [, , name] = shotAt(t);
  if (name === 'paper') out.push({ id: 'paper-key', text: 'Cumpărat: 1991', x0: 700, y0: 400, x1: 1220, y1: 470 }, { id: 'paper-rest', text: 'CERTIFICAT DE GARANȚIE Frigider Arctic (cadou de nuntă)', x0: 540, y0: 200, x1: 1380, y1: 500, pass: true });
  if (name === 'block' && t > T.lock) out.push({ id: 'lock', text: 'CONT BLOCAT Încercați din nou peste 24 de ore.', x0: 500, y0: 300, x1: 1400, y1: 700 });
  if (t >= T.end + .5) out.push({ id: 'title', text: 'TATA ȘI PAROLA Partea 2 din 3: Investigația', x0: 300, y0: 380, x1: 1620, y1: 650 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 930, x1: 1720, y1: 1020, pass: true });
  return out;
};
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
