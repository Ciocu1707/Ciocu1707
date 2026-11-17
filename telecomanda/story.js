// story.js — "Telecomanda" timeline (single source of truth)
export const DUR = 50.5;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;

// Dialogue: [id, start]. "nu" is one clip reused for the running gag.
export const VO = [
  ['d1', 2.8], ['i1', 10.0], ['d2', 12.75], ['i2', 15.8],
  ['d3', 18.6], ['nu', 19.6],
  ['nu', 20.95], ['nu', 21.95], ['nu', 22.95], ['nu', 23.95],
  ['b1', 27.2], ['nu2', 31.7],
  ['d4', 34.1], ['tv1', 37.8], ['i3', 41.8], ['d5', 45.0],
];

// Shots [start, end, name, world]
export const SHOTS = [
  [0, 2.4, 'tvIns', 'acasa'],
  [2.4, 6.85, 'iCU', 'acasa'],
  [6.85, 7.5, 'thumb', 'acasa'],
  [7.5, 12.6, 'wide', 'dino'],
  [12.6, 15.6, 'dCU', 'dino'],
  [15.6, 17.6, 'iCU', 'dino'],
  [17.6, 18.3, 'thumb', 'dino'],
  [18.3, 20.6, 'wide', 'roma'],
  [20.6, 21.6, 'wide', 'gheata'],
  [21.6, 22.6, 'wide', 'disco'],
  [22.6, 23.6, 'wide', 'pirati'],
  [23.6, 24.6, 'wide', 'spatiu'],
  [24.6, 33.0, 'y3000', 'an3000'],
  [33.0, 37.2, 'wide', 'acasa'],
  [37.2, 41.6, 'novela', 'acasa'],
  [41.6, 44.4, 'iCU', 'acasa'],
  [44.4, 46.0, 'dCU', 'acasa'],
  [46.0, DUR, 'end', 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

// Zaps: the click on the button, then the swirl wipe that covers the cut
export const ZAPS = [7.0, 17.9, 20.25, 21.35, 22.35, 23.35, 24.35, 32.6];
export const WIPES = [[7.5, .2], [18.3, .2], [20.6, .14], [21.6, .12], [22.6, .12], [23.6, .12], [24.6, .16], [33.0, .2]];

// World tags (top left): [start, end, label, background, text colour]
export const TAGS = [
  [0.4, 6.8, 'ACASĂ', '#3a5bc7', '#fff6e0'],
  [7.7, 17.5, 'DINOZAURI', '#2e7d32', '#fff6e0'],
  [18.4, 20.55, 'ROMA ANTICĂ', '#c4572e', '#fff6e0'],
  [20.65, 21.55, 'ERA GLACIARĂ', '#5aa8d8', '#ffffff'],
  [21.65, 22.55, 'DISCO 1978', '#ff3fa4', '#fff6e0'],
  [22.65, 23.55, 'PIRAȚI', '#7a4a24', '#fff6e0'],
  [23.65, 24.55, 'SPAȚIU', '#20204a', '#ffe066'],
  [24.8, 32.9, 'ANUL 3000', '#8c6b4f', '#f6ead2'],
  [33.2, 37.1, 'ACASĂ', '#3a5bc7', '#fff6e0'],
];

export const T = {
  reach: 6.0, dinoUp: 8.4, lick: [9.4, 10.3], grab: 33.8, tvOn: 36.8, end: 46.0, gasp: 41.8,
};

// Music cues: each cue's first beat is its cut
export const CUES = [
  { name: 'jungle', t0: 7.5, t1: 18.3 }, { name: 'fanfare', t0: 18.3, t1: 20.6 },
  { name: 'ice', t0: 20.6, t1: 21.6 }, { name: 'disco', t0: 21.6, t1: 22.6 }, { name: 'shanty', t0: 22.6, t1: 23.6 }, { name: 'space', t0: 23.6, t1: 24.6 },
  { name: 'novela', t0: 36.8, t1: 45.0 }, { name: 'end', t0: 46.0, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
