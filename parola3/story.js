// story.js — "Tata și parola", part 3: "Marea resetare"
export const DUR = 144;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;

export const VO = [
  ['t1', 4.8], ['t2', 10.3], ['a1', 13.3], ['t3', 15.7], ['a2', 20.6], ['t4', 44.0], ['m1', 52.4],
  ['t5', 54.8], ['t6', 61.2], ['t10', 67.3], ['t7', 75.4], ['m2', 80.4], ['t8', 84.4], ['a3', 91.3],
  ['t9', 108.4], ['a4', 114.4], ['m3', 117.4],
];
export const SHOTS = [
  [0, 4.5, 'card'], [4.5, 10, 'wide'], [10, 13, 'tv'], [13, 15.5, 'andrei'], [15.5, 18, 'tata'],
  [18, 24, 'laptop'], [24, 30, 'boot'], [30, 40, 'lapse'], [40, 42, 'boot'], [42, 52, 'email'], [52, 54.5, 'mama'],
  [54.5, 75, 'captcha'], [75, 80, 'tata'], [80, 84, 'mama'], [84, 91, 'tv'], [91, 97, 'celebrate'],
  [97, 103, 'tv'], [103, 106, 'tv'], [106, 108, 'tata'], [108, 114, 'wide'], [114, 117, 'andrei'], [117, 122, 'mama'],
  [122, 132, 'night'], [132, 138, 'rexCU'], [138, DUR, 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
// what the TV shows, by time
export const SCREEN = [
  [0, 'login'], [9.3, 'sent'], [84.0, 'newpass'], [89.0, 'changed'], [97, 'profiles'], [103, 'loading'], [108, 'film'],
  [125, 'still'], [128.5, 'dogs'], [135, 'login'],
];
export const T = {
  link: 9.3, laptopIn: 18.5, boot: [24, 42], bootDone: 40.5, codeMail: 46.0,
  pickShirt: 58.5, retry1: 60.0, pickRex: 65.5, pickPotato: 73.5, spin: [79.3, 81.0], typed: [86.5, 88.5], changed: 89.0,
  beardOff: 92.0, pickTata: 101.5, loading: [103, 108], sleep: 112.5, blanket: 120.0,
  rexClimb: 126.0, rexRemote: 127.5, rexPress: 128.5, rexSpin: 136.0, end: 138.0,
};
export const CUES = [
  { name: 'morning', t0: 0, t1: 10 }, { name: 'waiting', t0: 24, t1: 40.5 }, { name: 'jingle', t0: 40.5, t1: 42 },
  { name: 'captcha', t0: 54.5, t1: 75 }, { name: 'victory', t0: 89, t1: 97 }, { name: 'film', t0: 108, t1: 114 },
  { name: 'lullaby', t0: 117, t1: 132 }, { name: 'end', t0: 138, t1: DUR },
];
export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
