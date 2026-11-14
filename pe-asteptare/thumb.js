// YouTube thumbnail (1280×720): the same Ilinca now and in the year 3000, split on a diagonal, still on hold.
// Drawn in the film's 1920×1080 space and scaled by 2/3. Render: node core/render/still.mjs <project> 0 --size 1280x720 --q thumb=1
import { init, frame, g, reset, push, pop, translate, scale, rotate, text, shape, rr } from './toon.js';
import { ilinca, cord } from './chars.js';
import { kitchen, portal, PHONE_BASE } from './worlds.js';
const K = 2 / 3;
const cv = document.getElementById('c'); cv.width = 1280; cv.height = 720; init(cv);
const S = 2.25;
function panel(poly, era, P) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x * K, y * K) : g.moveTo(x * K, y * K)); g.closePath(); g.clip();
  reset(); scale(K);
  kitchen(era, 3.2);
  if (P.cord) cord([PHONE_BASE[0], PHONE_BASE[1] + 60], [P.x - 24 * S, P.y - 268 * S + (P.age ? 24 : 0)], 60);
  ilinca({ s: S, face: 1, t: 0, holdL: 'phone', armL: { h: [-16, -62], bend: -20 }, armR: { h: [-30, 128], bend: 20, fist: true }, mouth: { o: 0, sm: -.6 }, ...P });
  g.restore();
}
function render() {
  frame(0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, 1280, 720);
  // left: now — bored, heavy lids
  panel([[0, 0], [1030, 0], [890, 1080], [0, 1080]], 'acum', { x: 470, y: 1290, age: 0, lid: .55, look: [.4, -.2], brow: 1.3, cord: 1 });
  // right: the year 3000 — hair to the ceiling, eyes wide, receiver still at the ear
  panel([[1030, 0], [1920, 0], [1920, 1080], [890, 1080]], 'an3000', { x: 1480, y: 1250, age: 2, lid: 0, eyeS: 1.2, pupil: 3, look: [-.2, -.1], brow: 2, nerv: 0 });
  // the seam: the time portal's glow (the device colour), and a hard ink edge
  reset(); scale(K);
  push(); translate(960, 540); rotate(.13); portal(0, 0, 150, 1.7, { open: 1, sx: .55 }); pop();
  g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = '#1b1422'; g.lineWidth = 9; g.beginPath(); g.moveTo(1030 * K, 0); g.lineTo(890 * K, 1080 * K); g.stroke();
  // three words, bottom: what the title does not say
  reset(); scale(K); translate(960, 960); rotate(-.03);
  text('ÎNCĂ AL 47-LEA', 10, 10, { font: '400 158px Bungee', fill: '#e2523b', outlineW: 24 });
  text('ÎNCĂ AL 47-LEA', 0, 0, { font: '400 158px Bungee', fill: '#fff3d6', outlineW: 24 });
}
await document.fonts.load('400 60px Bungee'); await document.fonts.load('800 50px "Baloo 2"');
render();
window.render = render; window.DUR = 1; window.READY = true;
