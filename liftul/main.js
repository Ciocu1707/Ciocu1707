// Liftul — Sci-Fi Sitcom Toon, episode 3 (new cast)
import { clamp, lerp, seg, ss, eo, ei, back, spring, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset, S, getM, setM } from './toon.js';
import { mihai, leana, blob, cup, GLOW } from './cast.js';
import { DOOR, clipDoor, outside, interior, doors, dial, lever, paw } from './lift.js';
import { DUR, q, VO, SHOTS, shotAt, DOORS, DINGS, DIAL, TAGS, T, CUES, CREDITS } from './story.js';

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
const doorOpenAt = t => { let o = 0; for (const [a, b, c, d] of DOORS) { if (t >= a && t < d + .001) o = Math.max(o, b > a ? ss(seg(t, a, b)) : 1) * (t >= c ? 1 - ss(seg(t, c, d)) : 1); } return clamp(o); };
const dialAt = t => { for (let i = 1; i < DIAL.length; i++) { const [t0, f0] = DIAL[i - 1], [t1, f1] = DIAL[i]; if (t < t1) return lerp(f0, f1, ss(seg(t, t0, t1))); } return DIAL[DIAL.length - 1][1]; };
const travelling = t => (t > T.lever && t < 9.1) || (t > 15.1 && t < 15.9) || (t > 22.5 && t < 23.1) || (t > 33.5 && t < 34.5) || (t > T.lever2 && t < T.end);

// —— the cast, by floor ——
const MX = 520, LX = 1420, FLOOR = 900;
function M(t, o = {}) {
  const m = talk('MIHAI', t), tq = q(t);
  return { x: MX, y: FLOOR, s: 1, face: 1, t, nerv: .5, lid: 0, look: [.6, -.1], brow: 1.6, blink: blinks(t, 5), mouth: { o: m.o * 1.15, w: m.w, sm: -.5 },
    tray: 'cup', armF: { h: [70, 110], bend: 30 }, armB: { h: [-20, 190], bend: -12 }, sq: 1 + .012 * Math.sin(tq * 3.1),
    headTilt: m.talking ? (m.o - .3) * .1 : Math.sin(tq * 1.7) * .03, ...o };
}
function L(t, o = {}) {
  const m = talk('LEANA', t), tq = q(t);
  return { x: LX, y: FLOOR, s: 1, face: -1, t, lid: .6, look: [.4, 0], blink: blinks(t, 9), mouth: { o: m.o, w: m.w, sm: -.2 },
    hold: 'needles', armF: { h: [-60, 150], bend: 20 }, headTilt: m.talking ? (m.o - .3) * .05 : 0, ...o };
}
// the whole lift with its people; depth > 0 draws the lift seen through floor 9's doorway
function scene(t, floor, mo = {}, lo = {}, depth = 0) {
  const tq = q(t), open = doorOpenAt(t), pull = T.lever && ((t > T.lever && t < T.lever + .6) || (t > T.lever2 && t < T.lever2 + .6)) ? 1 : 0;
  interior(t);
  dial(dialAt(t));
  if (open > 0 && floor !== 'closed') clipDoor(() => {
    if (floor === 'oglinda') { if (depth < 3) { const M0 = getM(), k = .36; translate(960, 540); scale(k); translate(-960, -560); const lw = S.lwScale, amp = S.amp; S.lwScale *= k * 1.6; S.amp *= k * 1.6; scene(t, 'oglinda', mo, lo, depth + 1); S.lwScale = lw; S.amp = amp; setM(M0); } }
    else outside(floor, t, floor === 'pisica' ? { eyeBlink: (t > T.eye && t < T.eye + .15) || (t > 21.1 && t < 21.25) ? 1 : 0, dilate: t > T.paw[0] && t < T.pawOut[0] ? 1 : 0 } : {});
  });
  doors(open, travelling(t) ? .6 + .4 * Math.sin(t * 20) : 0);
  lever(pull, pull);
  // cast
  let mp = M(t, mo), lp = L(t, lo);
  if (floor === 'spatiu' && t > T.float && t < T.drop) {   // zero gravity: Mihai floats, Leana stays put, unbothered
    const u = ss(seg(t, T.float, T.float + 1.2));
    mp = { ...mp, y: FLOOR - 140 * u + Math.sin(t * 1.6) * 12, rot: -.25 * u + Math.sin(t * .9) * .08, hairUp: u, legF: [30 * u, -40 * u], legB: [-20 * u, -60 * u] };
  }
  if (floor === 'spatiu' && t >= T.drop && t < T.drop + .5) mp = { ...mp, sq: 1 - .2 * Math.exp(-(t - T.drop) * 9) * Math.cos((t - T.drop) * 30) };
  mihai(mp); leana(lp);
  return { mp, lp };
}

// ———————————————— shots ————————————————
const SH = {};
SH.wide = (t, tq, fl) => {
  const sh = travelling(t) ? 6 : 0;
  if (fl === 'oglinda') cam(lerp(960, 960, 0), lerp(540, 470, ss(seg(t, 35.6, 39.4))), lerp(1.0, 1.32, ss(seg(t, 35.6, 39.4))) * (t > 45.6 ? 1 / 1.32 : 1), sh, t);
  else cam(960, 540, 1.0, sh, t);
  if (fl === 'oglinda' && t > 45.6) cam(960, 540, 1.0, sh, t);
  let mo = {}, lo = {};
  if (fl === 'lobby') {   // Mihai slides in sideways through the closing doors
    const u = ss(seg(tq, T.slideIn[0], T.slideIn[1]));
    mo = { x: lerp(960, MX, u), s: lerp(.7, 1, u), lean: (1 - u) * .35, nerv: .9, sweat: t, legF: u < 1 ? [40, 0] : [0, 0], brow: 2 };
    lo = { look: [.3, .2], lid: .65 };
  } else if (fl === 'apa') { mo = { look: [.9, -.1], eyeS: 1.15, pupil: 3, nerv: .7, sweat: t, brow: 2 }; lo = { look: [.6, 0] }; }
  else if (fl === 'pisica') {
    const r = seg(tq, T.paw[0], T.paw[1]), out = seg(tq, T.pawOut[0], T.pawOut[1]);
    mo = { nerv: 1, eyeS: 1.25, pupil: 2.6, brow: 2.4, sweat: t * 1.4, lean: -.12 * (r > 0 && out < 1 ? 1 : 0), armF: r > 0 && out < 1 ? { h: [-60, 100], bend: -20 } : { h: [70, 110], bend: 30 }, look: [.9, .2], mouthS: 1.4 };
    const bonk = tq >= T.bonk - .3 && tq < T.pawOut[1];
    lo = bonk ? { hold: 'needle', armF: { h: [180, -10], bend: -20 }, look: [-1, 0], lid: .4 } : { look: [-.6, 0] };
  } else if (fl === 'spatiu') { mo = { nerv: .8, eyeS: 1.2, brow: 2.2, tray: t > T.blobOut[0] && t < T.slurp[1] ? 'empty' : 'cup', look: [.6, -.6], armF: { h: [80, 40], bend: 40 } }; lo = { look: [-.5, -.3] }; }
  else if (fl === 'branza') { mo = { nerv: .9, eyeS: 1.2, brow: 2, look: [.9, 0], mouth: { o: .6, sm: -.6 } }; }
  else if (fl === 'jungla') { mo = { nerv: 1, eyeS: 1.3, brow: 2.4, look: [.9, -.2], armB: { h: [60, -120], bend: 30 } }; }
  else if (fl === 'ploaie') { mo = { nerv: .6, lid: .3, brow: .4, look: [.9, 0], hairUp: -.6 }; }
  else if (fl === 'oglinda') {
    if (t < 45.6) { mo = { nerv: .2, lid: 0, eyeS: 1.25, pupil: 2.6, look: [.9, -.1], brow: 2 }; lo = { look: [-.8, 0], lid: .5 }; }
    else {   // Leana has the coffee; she sips; Mihai faints stiff as a plank
      const sip = seg(tq, T.sip[0], T.sip[1]), f = ei(seg(tq, T.faint[0], T.faint[1]));
      lo = { hold: 'cup', armF: sip > 0 && sip < 1 ? { h: [-130, -10], bend: 20 } : { h: [-100, 80], bend: 20 }, look: [.8, 0], lid: .6 };
      if (tq > T.lever2 - .3) lo = { ...lo, hold: null, armF: { h: [-190, -40], bend: -20 }, look: [-1, 0] };
      mo = { tray: 'empty', lid: f > 0 ? .9 : 0, eyeS: 1.2, look: [.9, 0], brow: 2, rot: -f * 1.52, x: MX - f * 40, sq: tq > T.faint[1] && tq < T.faint[1] + .4 ? 1 - .1 * Math.exp(-(tq - T.faint[1]) * 9) * Math.cos((tq - T.faint[1]) * 30) : 1 };
    }
  }
  const { mp } = scene(t, fl, mo, lo);
  if (fl === 'pisica') { const r = ss(seg(t, T.paw[0], T.paw[1])) * (1 - ss(seg(t, T.pawOut[0], T.pawOut[1]))); paw(r * .9, MX + 170, FLOOR - 470, t); }
  if (fl === 'spatiu' && t > T.blobOut[0] && t < T.slurp[1]) {   // the coffee floats out, then gets slurped back into the cup
    const cupX = mp.x + 128, cupY = mp.y - 470;
    let bx, by, s = 1;
    if (t < T.slurp[0]) { const u = ss(seg(t, T.blobOut[0], T.blobOut[1])); bx = lerp(cupX, 820, u) + Math.sin(t * 1.3) * 30; by = lerp(cupY, 330, u) + Math.cos(t * 1.1) * 20; }
    else { const u = ei(seg(t, T.slurp[0], T.slurp[1])); bx = lerp(820, cupX, u); by = lerp(330, cupY, u); s = 1 - u * .8; }
    reset(); cam(960, 540, 1.0); blob(bx, by, s, t);
  }
};
SH.leanaCU = (t, tq, fl) => {
  cam(LX - 20, 390, 2.15);
  const pullUp = fl === 'closed' && tq > T.lever - .25;
  scene(t, fl, {}, pullUp ? { armF: { h: [-190, -40], bend: -20 }, hold: null, look: [-1, 0] } : fl === 'oglinda' ? { hold: 'cup', armF: { h: [-100, 80], bend: 20 }, look: [.8, 0] } : { look: [.6, 0] });
};
SH.mihaiCU = (t, tq, fl) => {
  cam(MX + 10, 230, 2.2, t < 44.6 ? 12 : 0, t);
  scene(t, fl, { tray: 'empty', nerv: 1, eyeS: 1.35, pupil: 2.4, brow: 2.6, look: [.9, -.1], mouthS: 1.5, sweat: t * 1.4 }, { hold: 'cup', armF: { h: [-100, 80], bend: 20 } });
};
SH.dial = (t, tq, fl) => {
  cam(960, 160, 3.6, travelling(t) ? 10 : 0, t);
  scene(t, 'closed');
};

// —— subtitles, tags, end card ——
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
const WHO_COL = { MIHAI: '#2a8f4a', LEANA: '#d33a3a' };
const CUTS = [9.2, 15.2, 16.0, 23.2, 30.2, 31.3, 32.4, 33.5, 39.4, 51.2];
const SUBS = VO.map(([id, t0]) => {
  const L_ = LINE[id], s = L_.sub || L_.text, d = vdur(id);
  let t1 = t0 + Math.max(d + .45, .9 + s.length / 17);
  const c = CUTS.find(x => x > t0 + .1); if (c && t1 > c && id !== 'l9') t1 = Math.max(c - .02, t0 + d + .1);
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
  reset(); screenRect('#2a1020');
  // the lift doors, closed, the gap glowing, the dial on 9
  reset(); translate(960, 600); scale(.9); translate(-960, -530);
  interior(t); dial(9); doors(0, .7 + .3 * Math.sin(t * 6));
  screenRect('#2a1020', .55);
  const s = back(seg(q(t), T.end + .1, T.end + .4), 2.2);
  reset(); translate(960, 330); scale(s); rotate(-.04);
  text('LIFTUL', 12, 12, { font: '400 170px Bungee', fill: '#d33a3a', outlineW: 22, outlineCol: INK });
  text('LIFTUL', 0, 0, { font: '400 170px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  reset();
  g.globalAlpha = ss(seg(t, T.end + .6, T.end + 1.1));
  text('Ține-te bine.', 960, 480, { font: '400 64px VT323', fill: '#ffe066', outlineW: 9 });
  CREDITS.forEach((c, i) => text(c, 960, 948 + i * 38, { font: '700 27px "Baloo 2"', fill: 'rgba(255,255,255,.85)' }));
  g.globalAlpha = 1;
}
function render(t) {
  frame(t); screenRect('#000');
  const [, , name, fl] = shotAt(t);
  if (name === 'end') endCard(t); else SH[name](t, q(t), fl);
  tag(t); subs(t);
}
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of VO) add('vo', t0, { id, who: LINE[id].who });
  for (const c of CUES) add('cue', c.t0, c);
  for (const [a, b, , fl] of SHOTS) add('amb', a, { w: fl, d: +(b - a).toFixed(3) });
  DINGS.forEach(d => add('ding', d));
  for (const [a, b, c, d] of DOORS) { if (b > a && a > 0) add('doorOpen', a); if (d < 90) add('doorClose', c); }
  add('rumble', T.lever, { d: 9.1 - T.lever }); add('rumble', 15.1, { d: .8 }); add('rumble', 22.5, { d: .6 }); add('rumble', 33.5, { d: 1.0 }); add('rumble', T.lever2, { d: T.end - T.lever2 });
  add('lever', T.lever); add('lever', T.lever2);
  add('whoosh', T.slideIn[0]); add('skid', T.slideIn[1] - .1);
  add('bubbles', 9.4, { d: 5 }); add('purr', 16.2, { d: 1.6 }); add('blink', T.eye); add('meow', T.paw[0]); add('bonk', T.bonk); add('yowl', T.bonk + .05);
  add('float', T.float, { d: 1.2 }); add('slurp', T.slurp[0], { d: T.slurp[1] - T.slurp[0] }); add('thud', T.drop);
  add('squeak', 30.4); add('ooh', 31.45); add('rain', 32.4, { d: 1.05 });
  add('slurp', T.sip[0], { d: T.sip[1] - T.sip[0] }); add('boing', T.faint[1]); add('thud', T.faint[1]);
  add('slam', T.end, { v: .8 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => {
  const out = [];
  for (const [a, b, label] of TAGS) if (t >= a + .5 && t < b) out.push({ id: 'tag' + a, text: label, x0: 60, y0: 60, x1: 460, y1: 130, pass: b - a < 2.5 });
  if (t >= T.end + .5) out.push({ id: 'title', text: 'LIFTUL Ține-te bine.', x0: 380, y0: 240, x1: 1540, y1: 510 }, { id: 'credits', text: CREDITS.join(' '), x0: 200, y0: 920, x1: 1720, y1: 1010, pass: true });
  return out;
};
// ?thumb=1: the thumbnail frame (render at 1920×1080, downscale to 1280×720)
function thumb() {
  const t = 19.35; frame(t); screenRect('#000');
  cam(900, 480, 1.25); SH.wide(t, q(t), 'pisica');
  reset(); translate(1430, 210); rotate(.06);
  text('ETAJUL 7', 12, 12, { font: '400 150px Bungee', fill: '#d33a3a', outlineW: 26, outlineCol: INK });
  text('ETAJUL 7', 0, 0, { font: '400 150px Bungee', fill: '#fff3d6', outlineW: 26, outlineCol: INK });
}
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
if (new URLSearchParams(location.search).has('thumb')) { window.render = thumb; thumb(); }
else render(parseFloat(new URLSearchParams(location.search).get('t') ?? '5'));
window.READY = true;
