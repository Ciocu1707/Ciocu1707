// story.js — "Liftul" timeline
export const DUR = 55.7;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;

export const VO = [
  ['m1', 0.7], ['l1', 6.75],
  ['m2', 10.6], ['l2', 12.4],
  ['m3', 17.0], ['l3', 20.9],
  ['m4', 24.6], ['l4', 28.2],
  ['l5', 30.45], ['l6', 31.5], ['l7', 32.65],
  ['l8', 34.7], ['m5', 37.8], ['l9', 39.6], ['m6', 44.35], ['l10', 46.9], ['l11', 49.2],
];

// Shots [start, end, name, floor]
export const SHOTS = [
  [0, 6.6, 'wide', 'lobby'],
  [6.6, 8.0, 'leanaCU', 'closed'],
  [8.0, 9.2, 'dial', 'closed'],
  [9.2, 12.2, 'wide', 'apa'],
  [12.2, 14.6, 'leanaCU', 'apa'],
  [14.6, 15.2, 'wide', 'apa'],
  [15.2, 16.0, 'dial', 'closed'],
  [16.0, 22.6, 'wide', 'pisica'],
  [22.6, 23.2, 'dial', 'closed'],
  [23.2, 30.2, 'wide', 'spatiu'],
  [30.2, 31.3, 'wide', 'branza'],
  [31.3, 32.4, 'wide', 'jungla'],
  [32.4, 33.5, 'wide', 'ploaie'],
  [33.5, 34.6, 'dial', 'closed'],
  [34.6, 39.4, 'wide', 'oglinda'],
  [39.4, 44.2, 'leanaCU', 'oglinda'],
  [44.2, 45.6, 'mihaiCU', 'oglinda'],
  [45.6, 51.2, 'wide', 'oglinda'],
  [51.2, DUR, 'end', 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

// Doors: [open start, open end, close start, close end] per floor (time the doors take to slide)
export const DOORS = [
  [-1, -.5, 1.5, 2.1],            // lobby: open at the start, Mihai slides in, they close
  [9.3, 9.7, 14.7, 15.1],
  [16.1, 16.5, 22.1, 22.5],
  [23.3, 23.7, 29.6, 30.0],
  [30.2, 30.2, 99, 99], [31.3, 31.3, 99, 99], [32.4, 32.4, 33.42, 33.48],   // montage: hard cuts, doors already open
  [34.8, 35.8, 50.5, 51.0],
];
export const DINGS = [9.1, 15.9, 23.1, 30.2, 31.3, 32.4, 34.5];
// Floor dial: [time, floor] keyframes for the needle
export const DIAL = [[0, 0], [7.8, 0], [9.1, 3], [15.2, 3], [15.9, 7], [22.6, 7], [23.1, 13], [30.0, 13], [30.2, 5], [31.3, -2], [32.4, 8], [33.5, 8], [34.5, 9]];

export const TAGS = [
  [9.6, 14.6, 'ETAJUL 3', '#1f6fb0', '#e8fbff'],
  [16.4, 22.0, 'ETAJUL 7', '#ff8a3d', '#fff6e0'],
  [23.6, 29.5, 'ETAJUL 13', '#20204a', '#ffe066'],
  [30.25, 31.25, 'ETAJUL 5', '#f2c230', '#5a3a10'],
  [31.35, 32.35, 'ETAJUL -2', '#2e7d32', '#fff6e0'],
  [32.45, 33.45, 'ETAJUL 8', '#6b7280', '#ffffff'],
  [35.0, 45.5, 'ETAJUL 9', '#8c2f3f', '#ffe9b0'],
];

export const T = {
  slideIn: [0.15, 0.9], lever: 7.8, eye: 16.7, paw: [17.9, 19.4], bonk: 20.4, pawOut: [20.5, 21.0],
  float: 23.8, blobOut: [24.1, 25.4], slurp: [27.1, 27.8], drop: 30.0,
  grab: 45.0, sip: [46.0, 46.6], faint: [48.0, 48.45], lever2: 50.4, end: 51.2,
};
export const CUES = [
  { name: 'muzak', t0: 2.2, t1: 9.1 }, { name: 'apa', t0: 9.2, t1: 14.7 }, { name: 'muzak2', t0: 15.1, t1: 16.0 },
  { name: 'pisica', t0: 16.0, t1: 22.1 }, { name: 'muzak3', t0: 22.5, t1: 23.2 }, { name: 'spatiu', t0: 23.2, t1: 29.6 },
  { name: 'branza', t0: 30.2, t1: 31.3 }, { name: 'jungla', t0: 31.3, t1: 32.4 }, { name: 'ploaie', t0: 32.4, t1: 33.5 },
  { name: 'end', t0: 51.2, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
