// sets.js — the car (inside and outside) and the places it drives through, all with the 3D-look engine.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text, bands, floorShadow } from './toon.js';
import { chicken } from './cast.js';

// inside the car, looking back from the windshield: rear window with the road running away, seats
export function carInside(t, speed = 1, scene = 'road') {
  // rear window: the world behind (scrolls)
  shape(rr(560, 140, 800, 300, 60), { fill: '#9fd6f2', lw: 8, shade: () => {
    bands(['#9fd6f2', '#b9e2f5', '#d3eef9'], 140, 330, 560, 1360);
    fillOnly(rect(560, 330, 800, 120), scene === 'farm' ? '#8b6a3e' : '#6aa84f', { boil: 0 });
    for (let i = 0; i < 8; i++) { const x = 560 + ((i * 140 - t * 400 * speed) % 1000 + 1000) % 1000; shape(ell(x, 300, 40, 50, 14), { fill: '#3aa35a', lw: 5 }); shape(rect(x - 6, 330, 12, 30), { fill: '#7a4a24', lw: 3 }); }
  } });
  fillOnly(rect(-2000, -2000, 2560, 6000), '#4a4f5a', { boil: 0 }); fillOnly(rect(1360, -2000, 3000, 6000), '#4a4f5a', { boil: 0 }); fillOnly(rect(-2000, -2000, 6000, 2140), '#4a4f5a', { boil: 0 });
  // roof lining + side windows
  shape(rr(-200, -60, 2320, 200, 40), { fill: '#d9d4c8', lw: 7 });
  for (const sx of [0, 1]) shape(rr(sx ? 1440 : 100, 160, 380, 260, 40), { fill: '#9fd6f2', lw: 7, shade: () => { for (let i = 0; i < 4; i++) { const x = (sx ? 1440 : 100) + ((i * 120 + t * 900 * speed * (sx ? -1 : 1)) % 500 + 500) % 500; stroke([[x, 200], [x - 40, 380]], 6, { line: 'rgba(255,255,255,.6)' }); } } });
  // back seat
  shape(rr(400, 420, 1120, 420, 60), { fill: '#7a3a2a', lw: 7, shade: () => { stroke([[960, 440], [960, 820]], 5, { line: '#5c2a1e' }); for (const x of [600, 1320]) stroke([[x, 440], [x, 820]], 4, { line: '#5c2a1e' }); } });
}
export function carFront(t) {
  // front seats (headrests) and the dashboard in the foreground
  shape(rr(300, 560, 520, 520, 60), { fill: '#3a2a20', lw: 7 }); shape(rr(1100, 560, 520, 520, 60), { fill: '#3a2a20', lw: 7 });
  shape(rr(1240, 420, 240, 170, 50), { fill: '#3a2a20', lw: 7 });   // empty passenger headrest
}
export function dashboard() { shape(rr(-200, 900, 2320, 400, 50), { fill: '#2b2230', lw: 8, shade: () => fillOnly(rect(-200, 900, 2320, 40), '#4a4f5a', { boil: .3 }) }); }

// outside: a boxy red family car in side view; bounce, tilt, map flapping from the back window
export function car(x, y, s, { t = 0, tilt = 0, bounce = 0, map = 1, dir = 1, wheels = 1, mud = 0 } = {}) {
  floorShadow(x, y + 10, 360 * s, 30 * s, .32);
  push(); translate(x, y - bounce); rotate(tilt); scale(s * dir, s);
  shape(rr(-340, -230, 680, 170, 40), { fill: '#e2523b', lw: 8, shade: () => { fillOnly(rect(-340, -110, 680, 50), '#b63a27', { boil: .3 }); if (mud) fillOnly(rect(-340, -110, 680, 60), `rgba(110,80,40,${mud})`, { boil: .4 }); } });
  shape(spline([[-200, -230], [-150, -360], [160, -360], [240, -230]]), { fill: '#e2523b', lw: 8, shade: () => { fillOnly([[-170, -236], [-130, -336], [0, -336], [0, -236]], '#9fd6f2', { boil: .3 }); fillOnly([[20, -236], [20, -336], [140, -336], [200, -236]], '#9fd6f2', { boil: .3 }); } });
  stroke([[0, -236], [0, -340]], 7);
  // heads in the windows: the driver (front) and the perm (back)
  shape(ell(110, -290, 36, 40, 16), { fill: '#f6d2b8', lw: 5 }); shape(ell(110, -326, 36, 14, 12), { fill: '#ffd34a', lw: 4 });
  shape(ell(-90, -290, 38, 40, 16), { fill: '#f0c49a', lw: 5 }); for (let i = 0; i < 5; i++) shape(ell(-120 + i * 15, -326, 14, 14, 10), { fill: '#c9cbd6', lw: 3 });
  if (map > 0) { push(); translate(-180, -280); rotate(-.3 + Math.sin(t * 24) * .25); shape(rect(-220, -60, 200, 130), { fill: '#f6eed8', lw: 6, shade: () => { stroke([[-210, -40], [-30, 50]], 4, { line: '#e2523b' }); stroke([[-200, 30], [-40, -40]], 4, { line: '#f2c230' }); } }); pop(); }
  for (const wx of [-220, 220]) { shape(ell(wx, -50, 62, 62, 24), { fill: '#2b2230', lw: 7 }); push(); translate(wx, -50); rotate(t * 20 * wheels); shape(ell(0, 0, 28, 28, 14), { fill: '#c9d2dc', lw: 5 }); stroke([[-26, 0], [26, 0]], 5); pop(); }
  shape(rr(320, -170, 40, 40, 10), { fill: '#ffe066', lw: 5 });
  pop();
}
// speed lines across the frame
export function speedLines(t, k = 1) { for (let i = 0; i < 14; i++) { const y = 100 + hash(i) * 880, x = ((hash(i + 3) * 2400 - t * 3000 * k) % 2400 + 2400) % 2400 - 200; stroke([[x, y], [x + 260 * k, y]], 6, { line: 'rgba(255,255,255,.7)' }); } }

// the road, the fields and the farmyard (scroll = how far the world has moved)
export function road(t, scroll, { fork = false } = {}) {
  bands(['#7ec8e3', '#9dd6ea', '#bfe3f1', '#d8eef7'], -600, 640, -3000, 5000);
  for (let i = 0; i < 6; i++) { const x = ((i * 520 - scroll * .2) % 3000 + 3000) % 3000 - 500; shape(ell(x, 600, 420, 160, 30), { fill: '#7cc243', lw: 6 }); }
  shape(rect(-3000, 640, 8000, 1000), { fill: '#6aa84f', lw: 6 });
  shape(rect(-3000, 780, 8000, 160), { fill: '#5a5f6a', lw: 6 });
  for (let i = 0; i < 12; i++) { const x = ((i * 260 - scroll) % 3120 + 3120) % 3120 - 600; fillOnly(rect(x, 852, 140, 14), '#ffe066', { boil: 0 }); }
  if (fork) { shape(rr(1300 - scroll * .0, 520, 26, 260, 6), { fill: '#7a4a24', lw: 5 }); shape([[1250, 520], [1500, 520], [1540, 470], [1500, 420], [1250, 420]], { fill: '#3a7bd5', lw: 6 }); text('← VETA? NU', 1380, 470, { font: '800 30px "Baloo 2"', fill: '#fff' }); }
}
export function field(t, scroll, kind) {
  bands(['#7ec8e3', '#9dd6ea', '#bfe3f1'], -600, 600, -3000, 5000);
  shape(rect(-3000, 600, 8000, 1000), { fill: kind === 'mud' ? '#8b6a3e' : kind === 'corn' ? '#b7c24a' : '#7cc243', lw: 6 });
  if (kind === 'cows') for (let i = 0; i < 4; i++) { const x = ((i * 600 - scroll * .6) % 2400 + 2400) % 2400 - 200; push(); translate(x, 720); shape(rr(-110, -90, 220, 110, 40), { fill: '#fff', lw: 6, shade: () => { fillOnly(ell(-30, -50, 40, 30, 14), INK, { boil: .3 }); fillOnly(ell(50, -30, 30, 20, 14), INK, { boil: .3 }); } }); for (const lx of [-80, -40, 40, 80]) stroke([[lx, 10], [lx, 60]], 10); shape(ell(130, -90, 50, 40, 16), { fill: '#fff', lw: 6 }); shape(ell(150, -70, 30, 20, 12), { fill: '#ffb3c6', lw: 4 }); dot(130, -104, 6); pop(); }
  if (kind === 'bridge') { fillOnly(rect(-3000, 700, 8000, 600), '#3a7bd5', { boil: 0 }); shape(rect(-3000, 760, 8000, 40), { fill: '#a8754a', lw: 6 }); for (let i = 0; i < 30; i++) { const x = ((i * 120 - scroll) % 3600 + 3600) % 3600 - 600; stroke([[x, 760], [x, 800]], 4, { line: '#7a4a24' }); } }
  if (kind === 'mud') for (let i = 0; i < 8; i++) { const x = ((i * 300 - scroll * .5) % 2400 + 2400) % 2400 - 200; shape(ell(x, 820, 120, 24, 16), { fill: '#6a4a2a', lw: 5 }); }
  if (kind === 'corn') for (let i = 0; i < 40; i++) { const x = ((i * 80 - scroll) % 3200 + 3200) % 3200 - 400, h = 260 + hash(i) * 80; stroke([[x, 900], [x + 10, 900 - h]], 10, { line: '#6aa84f' }); shape(ell(x + 14, 900 - h * .6, 14, 34, 12), { fill: '#f2c230', lw: 4 }); }
}
export function farm(t, { fence = 1 } = {}) {
  bands(['#ffd08a', '#ffe0aa', '#fff0d0'], -600, 600, -3000, 5000);
  shape(rect(-3000, 600, 8000, 1000), { fill: '#a8854e', lw: 6 });
  // Veta's house and porch
  shape(rect(1200, 220, 700, 420), { fill: '#f4e6c8', lw: 8 }); shape([[1150, 230], [1950, 230], [1550, 20]], { fill: '#c2563a', lw: 8 });
  shape(rr(1480, 400, 150, 240, 8), { fill: '#7a4a24', lw: 6 }); shape(rr(1280, 320, 140, 120, 8), { fill: '#9fd6f2', lw: 6 });
  shape(rect(-200, 500, 600, 140), { fill: '#a8754a', lw: 6 }); text('COTEȚ', 100, 580, { font: '400 40px Bungee', fill: '#fff6e0' });
  // the fence (broken by the car)
  for (let i = 0; i < 14; i++) { const x = -100 + i * 90, broken = fence < 1 && i > 3 && i < 9; if (broken) continue; shape(rect(x, 560, 30, 160), { fill: '#d9c08a', lw: 5 }); }
  stroke([[-100, 600], [1160, 600]], 8, { line: '#d9c08a' });
}
