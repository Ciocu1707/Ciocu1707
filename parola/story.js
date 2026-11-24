// story.js — "Tata și parola", part 1: "Parola"
export const DUR = 128;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;

export const VO = [
  ['t1', 3.6], ['m1', 7.2], ['a1', 16.2], ['t2', 20.1], ['a2', 35.2], ['t3', 38.2],
  ['m2', 41.4], ['t4', 45.6], ['a3', 49.8], ['t5', 55.4], ['a4', 58.6],
  ['t6', 72.3], ['m3', 75.4], ['t7', 100.3], ['t8', 108.3], ['a5', 118.6],
];

export const SHOTS = [
  [0, 3.2, 'lens'], [3.2, 7.0, 'wide'], [7.0, 12.4, 'mama'], [12.4, 16.0, 'spin'],
  [16.0, 20.0, 'andrei'], [20.0, 22.3, 'tata'], [22.3, 27.0, 'keys'], [27.0, 35.0, 'timelapse'],
  [35.0, 38.0, 'andrei'], [38.0, 41.2, 'tata'], [41.2, 45.4, 'mama'], [45.4, 49.6, 'keys'],
  [49.6, 51.6, 'andrei'], [51.6, 55.0, 'dog'], [55.0, 58.4, 'tag'], [58.4, 60.4, 'andrei'],
  [60.4, 68.0, 'tries'], [68.0, 72.0, 'wide'], [72.0, 75.0, 'tata'], [75.0, 79.0, 'mama'],
  [79.0, 82.0, 'spin'], [82.0, 100.0, 'brain'], [100.0, 104.0, 'tata'], [104.0, 108.0, 'mama'],
  [108.0, 110.0, 'tata'], [110.0, 118.0, 'wide'], [118.0, 123.0, 'andrei'], [123.0, DUR, 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

// What the password field holds over time: [time, text, state ('' | 'gresit' | 'ok')]
export const FIELD = [
  [0, '', ''], [22.3, '', ''], [26.6, 'R', ''], [30.0, 'Re', ''], [33.0, 'Rex', ''],
  [46.0, 'Re', ''], [46.4, 'R', ''], [46.8, '', ''], [47.6, 'Domnul', ''], [48.4, 'Domnul Rex', ''],
  [60.4, 'Rex', 'gresit'], [62.8, 'Rexy', 'gresit'], [65.0, 'Domnul Rex', 'gresit'], [66.6, '', 'ultima'],
];
// On-screen keyboard cursor walking from A to R, one key at a time (22.3 → 26.6)
export const KEYWALK = [22.5, 26.6];
// Time lapse 27 → 35: days pass, Andrei grows a beard
export const LAPSE = [27.0, 35.0];

export const T = {
  spin: [12.6, 16.0], spin2: [79.2, 82.0], dogIn: [51.8, 53.4], lensDown: 54.3,
  barks: [60.9, 63.3, 65.5], drawer: 94.0, moth: 94.6, mamaOut: [110.2, 112.0], slam: 112.3, photoFall: 112.9, end: 123.0,
};
export const CUES = [
  { name: 'theme', t0: 0, t1: 12.4 }, { name: 'tick', t0: 22.3, t1: 27.0 }, { name: 'lapse', t0: 27.0, t1: 35.0 },
  { name: 'tick2', t0: 45.4, t1: 49.6 }, { name: 'tries', t0: 60.4, t1: 66.6 }, { name: 'archive', t0: 82.0, t1: 94.0 },
  { name: 'end', t0: 123.0, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
