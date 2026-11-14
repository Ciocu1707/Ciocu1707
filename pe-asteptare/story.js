// story.js — the timeline: picture, subtitles, foley and music all read these numbers.
export const DUR = 54.5;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;   // characters step at 12 fps

// Dialogue start times (text, speaker and durations come from lines.json / voices/dur.json)
export const VO = {
  h1: 0.45, i1: 6.25, d1: 9.45, d2: 10.95, i2: 12.7,
  h2: 15.9, i3: 18.55, d3: 21.35,
  h3: 23.45, i4: 27.75, d4: 31.75,
  o1: 34.45, i5: 39.65, o2: 42.75, h4: 44.25, d5: 46.75, i6: 48.05,
};

// Shots [start, end, name, era]
export const SHOTS = [
  [0, 3.4, 'ins1', 'acum'],
  [3.4, 9.3, 'two1', 'acum'],
  [9.3, 12.6, 'dCU1', 'acum'],
  [12.6, 13.95, 'iCU1', 'acum'],
  [13.95, 15.3, 'open1', 'acum'],
  [15.3, 17.05, 'two2', 'sapt'],
  [17.05, 18.45, 'ins2', 'sapt'],
  [18.45, 21.2, 'iCU2', 'sapt'],
  [21.2, 22.8, 'dCU2', 'sapt'],
  [22.8, 27.55, 'two3', 'ani40'],
  [27.55, 31.6, 'iCU3', 'ani40'],
  [31.6, 33.4, 'dCU3', 'ani40'],
  [33.4, 39.4, 'two4', 'an3000'],
  [39.4, 42.5, 'iCU4', 'an3000'],
  [42.5, 46.5, 'ins4', 'an3000'],
  [46.5, 49.7, 'two5', 'an3000'],
  [49.7, DUR, 'end', 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

// Full-screen time-portal wipes: [time the swirl covers the frame, half-width]
export const WIPES = [[15.3, .22], [22.8, .22], [33.4, .24], [49.7, .24]];

// Era readout (top left): [start, end, label, background, text colour]
export const TAGS = [
  [3.6, 13.9, 'ACUM', '#e2523b', '#fff6e0'],
  [15.55, 22.6, '+1 SĂPTĂMÂNĂ', '#f2b632', '#2a1458'],
  [23.05, 33.2, '+40 DE ANI', '#1f8a8a', '#fff6e0'],
  [33.7, 46.4, 'ANUL 3000', '#8c6b4f', '#f6ead2'],
];

// Key moments
export const T = {
  remote: 10.55, press: [13.95, 22.45, 33.05, 48.85], open: [14.0, 22.5, 33.1, 48.9],
  rush: [[14.95, 15.3], [22.5, 22.8], [33.1, 33.4], [49.35, 49.7]],
  glorp: 25.85, chomp: [26.25, 26.5], ring: 34.05, transfer: 43.75, holdBack: 44.0,
  shake: [[19.75, .35], [13.1, .3]],
  end: 49.7,
};

// Hold music (diegetic, through the receiver): [start, end, level]
export const HOLD = [[0, 9.3, 1], [9.3, 13.95, .45], [15.3, 21.2, .7], [22.8, 27.55, .5], [44.0, 49.7, 1]];
// Score cues: the first beat of a cue is its cut
export const CUES = [
  { name: 'theme', t0: 10.55, t1: 15.3 },
  { name: 'toypiano', t0: 15.3, t1: 22.8 },
  { name: 'bossa', t0: 22.8, t1: 33.4 },
  { name: 'sting', t0: 48.85, t1: DUR },
];

export const CREDITS = [
  'Voci: Microsoft Edge TTS (ro-RO Emil, Alina) · Muzică și efecte sintetizate în cod',
  'Fonturi: Baloo 2, VT323, Bungee — Google Fonts, SIL OFL 1.1',
];
