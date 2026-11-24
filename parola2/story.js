// story.js — "Tata și parola", part 2: "Investigația"
export const DUR = 124;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;

export const VO = [
  ['t1', 2.2], ['a1', 7.3], ['t2', 13.2], ['m1', 16.2], ['t3', 20.5], ['a2', 24.3],
  ['t4', 36.4], ['t5', 43.0], ['a3', 61.0], ['t6', 64.4],
  ['m2', 84.4], ['a4', 93.0], ['m3', 100.4], ['t7', 104.6], ['a5', 114.6],
];
export const SHOTS = [
  [0, 7, 'stand'], [7, 11, 'andrei'], [11, 24, 'album'], [24, 28, 'andrei'],
  [28, 36, 'attic'], [36, 40.6, 'paper'], [40.6, 50, 'cellar'], [50, 53, 'jar'],
  [53, 61, 'board'], [61, 64, 'andrei'], [64, 67.5, 'tataCU'], [67.5, 72, 'board'],
  [72, 78, 'keys'], [78, 84, 'finger'], [84, 86, 'mama'], [86, 92, 'block'], [92, 98, 'andreiSlow'],
  [98, 100.2, 'silence'], [100.2, 104.4, 'mama'], [104.4, 108, 'tataCU'], [108, 111, 'jarDrop'], [111, 114.4, 'spin'],
  [114.4, 119, 'andrei'], [119, DUR, 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
export const T = {
  flip: 19.0, trap: 28.5, popUp: 29.2, dust: 29.6, climb: 31.0, papers: [32.0, 35.0], toss: 40.0,
  rexJar: [46.0, 49.0], pins: [54.0, 60.0], tangle: [67.5, 70.5], boardFall: 70.0,
  typing: [72.4, 77.2], press: 85.6, lock: 87.4, kneel: [92.2, 94.0], dropJar: 110.0, spin: [111.2, 114.4], end: 119,
};
export const TYPED = 'DomnulRex1987';
export const CUES = [
  { name: 'detective', t0: 0, t1: 7 }, { name: 'clue', t0: 11, t1: 24 }, { name: 'search', t0: 28, t1: 50 },
  { name: 'board', t0: 53, t1: 61 }, { name: 'drama', t0: 78, t1: 86 }, { name: 'end', t0: 119, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
