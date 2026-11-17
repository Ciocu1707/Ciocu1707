// Tata și parola — part 3 "Marea resetare"
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { tata, mama, andrei, rex, lens, eye } from './cast.js';
import { room, sofaArmFront, TV } from './sets.js';
import { tvScreen, laptop, laptopScreen, captcha, robotBox } from './sets3.js';
import { DUR, q, VO, SHOTS, shotAt, SCREEN, T, CUES, CREDITS } from './story.js';

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
const screenAt = t => { let s = SCREEN[0][1]; for (const [a, k] of SCREEN) if (t >= a) s = k; return s; };
const TX = 1030, FLOOR = 900, AX = 1520, MX = 1840;
const asleep = t => t > T.sleep;
function Tp(t, o = {}) {
  const m = talk('TATA', t), sl = asleep(t);
  return { x: TX, y: FLOOR, s: 1, face: -1, lid: sl ? 1 : .45, look: [-.6, 0], brow: 0, blink: !sl && blinks(t, 4), mouth: { o: sl ? .15 + .1 * Math.sin(t * 2) : m.o, w: m.w, sm: -.2 },
    spin: (t >= T.spin[0] && t < T.spin[1]) || (t >= 106 && t < 108) ? t : -1, lensUp: t > 18 ? 0 : 1, headTilt: sl ? .35 : m.talking ? (m.o - .3) * .05 : 0, ...o };
}
function Ap(t, o = {}) {
  const m = talk('ANDREI', t), bald = t > T.beardOff;
  return { x: AX, y: 790, s: 1, face: -1, look: [-.7, 0], lid: t > 124 ? 1 : .4, brow: .4, blink: blinks(t, 8), mouth: { o: m.o, w: m.w, sm: -.4 }, grow: bald ? 0 : 1, popcorn: 0, headTilt: m.talking ? (m.o - .3) * .08 : 0, ...o };
}
function Mp(t, o = {}) { const m = talk('MAMA', t); return { x: MX, y: FLOOR, s: 1, face: -1, look: [-.8, 0], lid: .35, brow: -1, blink: blinks(t, 12), mouth: { o: m.o, w: m.w, sm: -.3 }, ...o }; }
function home(t, { to = {}, ao = {}, mo = null, dog = null, night = 0, lap = false, blanket = 0 } = {}) {
  room(t, {});
  tvScreen(t, screenAt(t), { pick: t > T.link && t < T.link + .3 ? 1 : 0, typed: 'Rex91'.slice(0, Math.max(0, Math.floor((t - T.typed[0]) / .4) + 1)), cursor: t > 97 ? Math.min(0, Math.floor(4 - (t - 97) * 1.5)) * -1 * 0 + (t > 99 ? 0 : 3 - Math.floor((t - 97) * 1.5)) : -1 });
  andrei(Ap(t, ao)); sofaArmFront();
  if (mo) mama(Mp(t, mo));
  if (dog) rex(dog.x, dog.y ?? FLOOR, .9, dog);
  tata(Tp(t, to));
  if (lap) laptop(TX - 120, FLOOR - 220, .8, { glow: 1 });
  if (blanket > 0) shape(spline([[TX - 200, FLOOR - 330], [TX - 20, FLOOR - 360], [TX + 150, FLOOR - 300], [TX + 160, FLOOR - 120], [TX - 210, FLOOR - 110]]), { fill: '#3a7bd5', lw: 7, shade: () => { for (let k = 0; k < 4; k++) { stroke([[TX - 210, FLOOR - 300 + k * 50], [TX + 160, FLOOR - 300 + k * 50]], 5, { line: '#e2523b' }); stroke([[TX - 160 + k * 90, FLOOR - 360], [TX - 160 + k * 90, FLOOR - 110]], 5, { line: '#e2523b' }); } } });
  if (night > 0) fillOnly(rect(-2000, -2000, 6000, 6000), `rgba(10,12,40,${.45 * night})`, { boil: 0 });
}

const SH = {};
SH.card = (t) => {
  cam(1050, 520, 1.05); home(t, { to: { lid: .8 }, ao: { lid: 1, headTilt: .3 } });
  reset(); fillOnly(rect(0, 0, W, H), 'rgba(18,20,38,.72)', { boil: 0 });
  const s = back(seg(q(t), .3, .7), 2); reset(); translate(960, 520); scale(s);
  text('24 DE ORE MAI TÂRZIU', 0, 0, { font: '400 96px Bungee', fill: '#fff3d6', outlineW: 18 });
};
SH.wide = (t, tq) => {
  if (t >= 108) {   // the film starts; Tata nods off
    cam(1050, 520, 1.05);
    home(t, { to: { look: [-.8, 0], lid: .5 }, ao: { look: [-.8, 0], lid: .2, brow: 1 } });
    return;
  }
  cam(1000, 520, 1.05);
  home(t, { to: { look: [-.8, .3], lid: .4, lensUp: 1 } });
};
SH.tv = (t) => { cam(TV.x + TV.w / 2, TV.y + TV.h / 2 + 10, 2.4); home(t); };
SH.andrei = (t) => { cam(AX - 20, 360, 2.1); home(t, { ao: t > 114 ? { look: [-1, .3], lid: .1, brow: 1.2 } : { look: [-1, 0], brow: 1.6 } }); };
SH.tata = (t) => { cam(TX - 60, 360, 2.2); home(t, { to: t > 106 ? { look: [-.9, 0] } : t > 75 ? { look: [-.9, .1], lid: .2, brow: 1.2 } : { look: [.9, 0], lid: .4 } }); };
SH.mama = (t) => { cam(MX - 60, 300, 2.0); home(t, { mo: t > 117 ? { lid: .45, brow: .8, look: [-1, .3], mouth: { o: talk('MAMA', t).o, sm: .5 } } : t > 80 ? { lid: .4, brow: 0, look: [-1, 0] } : { lid: .55, brow: -1.4, look: [-1, 0] } }); };
SH.laptop = (t) => {
  const u = ss(seg(t, T.laptopIn - .5, T.laptopIn + .5));
  cam(1000, 540, 1.1);
  home(t, { lap: u > .5, to: { look: [-.3, .8], lid: .3 }, ao: { look: [-.8, .4], brow: 2 } });
};
SH.boot = (t) => { cam(960, 540, 1.0); const p = t < 40 ? Math.min(.03 + (t - 24) * .002, .06) : 1; laptopScreen(t, 'boot', { p }); };
SH.lapse = (t) => {   // days pass; Tata dozes; Rex sleeps on the warm laptop
  const u = seg(t, 30, 40);
  cam(1050, 520, 1.05);
  room(t, { day: u * 5, clock: u * 30 });
  tvScreen(t, 'sent');
  andrei(Ap(t, { lid: 1, headTilt: .3 })); sofaArmFront();
  tata(Tp(t, { lid: 1, headTilt: .3, mouth: { o: .2, sm: 0 } }));
  laptop(TX - 120, FLOOR - 220, .8, { glow: 1 });
  push(); rex(TX - 230, FLOOR - 230, .5, { face: 1, t }); pop();
  // a little progress bar in the corner: 4% → 99%
  reset(); shape(rr(1440, 960, 420, 50, 10), { fill: '#123a70', lw: 5 }); fillOnly(rect(1450, 970, 400 * lerp(.04, .99, u), 30), '#2bb673', { boil: .2 });
  text(Math.floor(lerp(4, 99, u)) + '%', 1650, 985, { font: '400 34px VT323', fill: '#fff' });
};
SH.email = (t) => { cam(960, 540, 1.0); laptopScreen(t, 'mail', { scroll: ss(seg(t, 42, 45)) * 0 }); };
SH.captcha = (t, tq) => {
  cam(960, 540, 1.0);
  if (t < 61) { captcha(t, 0, { cursor: t > 56.5 ? 4 : -1, picks: t > T.pickShirt ? [4] : [], retry: t > T.retry1 }); return; }
  if (t < 67) { captcha(t, 1, { cursor: t > 63.5 ? 3 : -1, picks: t > T.pickRex ? [3] : [] }); return; }
  captcha(t, 2, { cursor: t > 72 ? 2 : -1, picks: t > T.pickPotato ? [2] : [] });
};
SH.celebrate = (t) => {
  cam(1100, 520, 1.05, t > 91.3 && t < 92 ? 6 : 0, t);
  const jump = Math.abs(Math.sin((t - 91.3) * 5)) * 60 * (t > 91.3 && t < 95 ? 1 : 0);
  home(t, { ao: { y: 790 - jump, look: [-.5, -.4], lid: 0, brow: 2, mouth: { o: .7 + talk('ANDREI', t).o * .3, sm: .6 } }, to: { look: [.9, -.2], lid: .2, brow: .6, mouth: { o: .2, sm: .7 } }, mo: { lid: .3, brow: .6, mouth: { o: 0, sm: .6 } }, dog: { x: 560, face: 1, t, bark: Math.sin(t * 9) > .6 ? .8 : 0 } });
  // the beard flies off, and confetti
  if (t > T.beardOff) { const u = t - T.beardOff; push(); translate(AX - 80 - u * 400, 300 + u * u * 500); rotate(u * 4); shape(spline([[-70, 10], [-60, 200], [0, 300], [60, 200], [70, 10]]), { fill: '#4a3428', lw: 6 }); pop(); }
  reset(); for (let i = 0; i < 60; i++) { const u = ((t - 89) * .5 + hash(i)) % 1; fillOnly(rect((hash(i + 3) * 1920 + Math.sin(t * 2 + i) * 40), u * 1100 - 40, 18, 10), ['#e8283c', '#f2c230', '#2bb673', '#3a7bd5'][i % 4], { boil: 0 }); }
};
SH.night = (t) => {
  cam(1000, 540, 1.05);
  const climb = ss(seg(t, T.rexClimb, T.rexClimb + 1)), bl = ss(seg(t, T.blanket - 2, T.blanket));
  home(t, { night: ss(seg(t, 122, 124)), blanket: 1, ao: { lid: 1, headTilt: .3 } });
  // Rex hops onto the TV cabinet, picks up the remote, presses (drawn over the dim room)
  const rx = lerp(1200, 640, climb), ry = lerp(FLOOR, 600, climb);
  rex(rx, ry, .9, { face: -1, t, walk: climb > 0 && climb < 1 });
  if (t > T.rexRemote) { push(); translate(rx - 230, ry - 110); shape(rr(-30, -14, 70, 30, 8), { fill: '#2b2230', lw: 5 }); dot(30, 0, 5, '#e2523b'); pop(); }
};
SH.rexCU = (t) => {
  cam(lerp(560, 520, ss(seg(t, 132, 137))), lerp(420, 470, ss(seg(t, 132, 137))), lerp(1.7, 2.6, ss(seg(t, 132, 137))));
  home(t, { night: 1, blanket: 1 });
  rex(640, 600, .9, { face: -1, t, spin: t > T.rexSpin ? t : -1 });
  push(); translate(410, 490); shape(rr(-30, -14, 70, 30, 8), { fill: '#2b2230', lw: 5 }); dot(30, 0, 5, '#e2523b'); pop();
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
  const k = Math.floor(t * 12) % 8;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, f = ((i - k + 8) % 8) / 8; reset(); dot(960 + Math.cos(a) * 300, 560 + Math.sin(a) * 300, 34, `rgba(232,40,60,${.12 + .7 * (1 - f)})`); }
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 470); scale(s); rotate(-.03);
  text('TATA ȘI PAROLA', 12, 12, { font: '400 130px Bungee', fill: '#e8283c', outlineW: 22, outlineCol: INK });
  text('TATA ȘI PAROLA', 0, 0, { font: '400 130px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Sfârșit.', 960, 610, { font: '400 72px VT323', fill: '#ffe066', outlineW: 9 });
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
  add('key', T.link, { v: 1.2 }); add('ding', 10.1);
  add('creak', T.laptopIn); add('fan', 24, { d: 16 }); add('lapse', 30, { d: 10 }); add('snore', 31, { d: 9 });
  add('key', T.pickShirt); add('buzz', T.retry1); add('key', T.pickRex); add('key', T.pickPotato);
  add('spinner', T.spin[0], { d: T.spin[1] - T.spin[0] }); add('spinner', 103, { d: 5 });
  for (let k = 0; k < 5; k++) add('key', T.typed[0] + k * .4); add('ding', T.changed); add('tada', T.changed + .05);
  add('whoosh', T.beardOff); add('bark', 92.5); add('bark', 93.4);
  [98.5, 99.2, 99.9, 100.6].forEach(x => add('key', x, { v: .6 })); add('ding', T.pickTata);
  add('snore', T.sleep + .4, { d: 22 }); add('whoosh', T.blanket - 1);
  add('steps', T.rexClimb, { d: 1 }); add('key', T.rexPress); add('bark', 131, { v: .5 }); add('spinner', T.rexSpin, { d: 2 });
  add('slam', T.end, { v: .6 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [], [, , name] = shotAt(t);
  if (name === 'card') out.push({ id: 'card', text: '24 DE ORE MAI TÂRZIU', x0: 300, y0: 460, x1: 1620, y1: 580 });
  if (name === 'boot' && t < 30) out.push({ id: 'boot', text: 'Pornire... Se instalează actualizarea 1 din 214', x0: 300, y0: 300, x1: 1620, y1: 640 });
  if (name === 'email') out.push({ id: 'code', text: 'Codul dumneavoastră este 1 2 3 4 5 6', x0: 300, y0: 740, x1: 1620, y1: 900 }, { id: 'inbox', text: 'inbox rows', x0: 220, y0: 130, x1: 1700, y1: 720, pass: true });
  if (name === 'captcha') out.push({ id: 'cap' + (t < 61 ? 0 : t < 67 ? 1 : 2), text: 'Selectați toate imaginile cu ' + (t < 61 ? 'SEMAFOARE' : t < 67 ? 'BICICLETE' : 'DUMNEAVOASTRĂ'), x0: 580, y0: 80, x1: 1340, y1: 200 });
  if (t >= T.end + .5) out.push({ id: 'title', text: 'TATA ȘI PAROLA Sfârșit.', x0: 300, y0: 380, x1: 1620, y1: 650 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 930, x1: 1720, y1: 1020, pass: true });
  return out;
};
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
