// story.js — "Motanul Copiat" timeline
export const DUR = 55.3;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;

export const VO = [['s1', 0.5], ['s2', 11.5], ['s3', 21.5], ['s4', 26.6], ['s5', 36.5], ['s6', 47.4], ['b1', 49.4]];

export const SHOTS = [
  [0, 6.2, 'wide1'], [6.2, 7.6, 'paw'], [7.6, 11.4, 'wide2'], [11.4, 16.4, 'sorinCU'],
  [16.4, 21.4, 'multiply'], [21.4, 23.9, 'sorinCU'], [23.9, 26.2, 'look'], [26.2, 31.0, 'house'],
  [31.0, 35.0, 'exterior'], [35.0, 39.0, 'city'], [39.0, 44.0, 'planet'], [44.0, 50.8, 'final'], [50.8, DUR, 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

// Copy events: [time, count after it]
export const COPIES = [[8.2, 2], [16.9, 4], [17.6, 8], [18.2, 16], [18.7, 32], [19.1, 64], [19.4, 128], [19.65, 256], [19.85, 512], [20.0, 1024], [20.12, 2048]];
export const T = {
  press: 6.9, flash: 8.2, out: 8.8, syncBlink: 10.2, lookEach: 24.3, lookCam: 25.3, chorus: 28.3, buried: 29.4,
  nudge: 44.8, press2: 45.6, flash2: 46.0, outS: 46.6, end: 50.8,
};
export const TAGS = [];
export const CUES = [
  { name: 'theme', t0: 0, t1: 6.2 }, { name: 'whir', t0: 7.0, t1: 8.8 }, { name: 'build', t0: 16.4, t1: 21.4 },
  { name: 'pullout', t0: 31.0, t1: 39.0 }, { name: 'end', t0: 50.8, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
