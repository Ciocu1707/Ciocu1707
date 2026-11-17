// story.js — "Soacra și GPS-ul" (50 s, fast)
export const DUR = 50;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;
export const VO = [
  ['g1', 3.4], ['s1', 5.0], ['g2', 11.2], ['g3', 13.1], ['s2', 14.5], ['d1', 15.5], ['s3', 17.5],
  ['g2', 20.0], ['g2', 21.3], ['g2', 22.5], ['g2', 23.5], ['g2', 24.4], ['g4', 27.2],
  ['s4', 35.2], ['v1', 37.3], ['s5', 40.4],
];
export const SHOTS = [
  [0, 3.2, 'inside'], [3.2, 4.8, 'gps'], [4.8, 8.9, 'soacra'], [8.9, 10.2, 'driver'], [10.2, 13.0, 'road'],
  [13.0, 14.4, 'gps'], [14.4, 15.4, 'soacra'], [15.4, 17.4, 'driver'], [17.4, 19.6, 'soacra'],
  [19.6, 20.9, 'cows'], [20.9, 22.2, 'bridge'], [22.2, 23.3, 'mud'], [23.3, 24.3, 'corn'], [24.3, 25.2, 'cows'], [25.2, 27.0, 'corn'],
  [27.0, 29.4, 'gps'], [29.4, 33.0, 'crash'], [33.0, 35.0, 'inside'], [35.0, 37.0, 'soacra'], [37.0, 40.0, 'veta'],
  [40.0, 43.5, 'inside'], [43.5, 47.0, 'gps'], [47.0, DUR, 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
// what the GPS screen shows
export const GPSAT = [[0, 'left'], [11.2, 'recalc'], [13.1, 'leftAngry'], [14.4, 'recalc'], [27.0, 'sad'], [42.4, 'veta']];
export const T = {
  unfold: [0.4, 1.2], turn: 9.8, swerve: [10.6, 11.8], fence: 29.9, stop: 31.0, chickenHead: 33.4, fold: 35.6, pat: 41.6, end: 47.0,
};
export const CUES = [
  { name: 'drive', t0: 0, t1: 9 }, { name: 'chase', t0: 10.2, t1: 19.6 }, { name: 'montage', t0: 19.6, t1: 27.0 },
  { name: 'banjo', t0: 37.0, t1: 47.0 }, { name: 'end', t0: 47.0, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
