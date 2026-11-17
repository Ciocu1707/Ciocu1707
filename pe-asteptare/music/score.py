"""Original score, synthesized in numpy (no samples).
- music/hold.wav: the cheesy on-hold loop (C major, 112 bpm, square lead + electric-piano chords), telephone band, placed per HOLD in story.js
- music/score.wav: theme (theremin lead, analog bass, square arp, drum machine, D minor), toy-piano lullaby (+1 week),
  elevator bossa with Karplus–Strong nylon guitar (+40 years), the final sting. Year 3000 has no music on purpose.
Usage: $LIB/.venv/bin/python music/score.py  (reads events.json)"""
import os, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SR = 48000
E = json.load(open(os.path.join(ROOT, 'events.json'))); DUR = E['dur']; N = int(DUR * SR)
CUE = {e['name']: e for e in E['ev'] if e['type'] == 'cue'}
rng = np.random.default_rng(7)
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
t_ = lambda d: np.arange(int(d * SR)) / SR
def place(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    x = x[:len(buf) - i]
    if buf.ndim == 1: buf[i:i + len(x)] += x * g
    else: buf[i:i + len(x), 0] += x * g * (1 - pan) ** .5; buf[i:i + len(x), 1] += x * g * (1 + pan) ** .5
def adsr(d, a=.01, r=.08):
    n = int(d * SR); e = np.ones(n); A, R = min(n, int(a * SR)), min(n, int(r * SR))
    e[:A] = np.linspace(0, 1, A); e[n - R:] *= np.linspace(1, 0, R); return e
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def square(f, d, duty=.5): ph = (t_(d) * f) % 1; return np.where(ph < duty, 1., -1.)
def saw(f, d): return 2 * ((t_(d) * f) % 1) - 1

# —— instruments ——
def theremin(notes, bpm):   # notes: (beat, dur_beats, midi); legato portamento + delayed vibrato
    sb = 60 / bpm; tot = max(b + d for b, d, _ in notes) * sb + .3; n = int(tot * SR)
    f = np.zeros(n); amp = np.zeros(n); onset = np.zeros(n)
    for b, d, m in notes:
        i0, i1 = int(b * sb * SR), int((b + d) * sb * SR); f[i0:i1] = mid(m); amp[i0:i1] = 1; onset[i0:i1] = np.arange(i1 - i0) / SR
    k = int(.07 * SR); fs = np.convolve(np.where(f > 0, f, np.nan_to_num(f)), np.ones(k) / k, 'same')
    last = 0
    for i in range(n):
        if f[i] > 0: last = f[i]
        elif last: fs[i] = last
    vib = 1 + .012 * np.sin(2 * np.pi * 6 * np.arange(n) / SR) * np.clip((onset - .15) / .2, 0, 1)
    ph = np.cumsum(np.maximum(fs, 1) * vib) / SR
    x = np.sin(2 * np.pi * ph) + .18 * np.sin(4 * np.pi * ph) + .08 * np.sin(6 * np.pi * ph)
    env = np.convolve(amp, np.ones(int(.03 * SR)) / int(.03 * SR), 'same')
    x = x * env
    # spring reverb: a few short feedback delays
    y = x.copy()
    for dl, g in [(.031, .35), (.047, .28), (.071, .2), (.113, .14)]:
        d_ = int(dl * SR); y[d_:] += x[:-d_] * g
    return y * .5
def bass(m, d): f = mid(m); x = saw(f, d) * .6 + np.sin(2 * np.pi * f * t_(d)); return filt(x, 'low', 700) * adsr(d, .005, .05)
def arp(m, d): return filt(square(mid(m), d, .3), 'low', 3500) * adsr(d, .002, .03) * .35
def kick(): d = .3; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-tt / .03)) / SR) * np.exp(-tt / .12)
def snare(): d = .2; return (filt(rng.standard_normal(int(d * SR)), 'band', [1500, 7000]) * .6 + np.sin(2 * np.pi * 190 * t_(d)) * .4) * np.exp(-t_(d) / .06)
def hat(): d = .05; return filt(rng.standard_normal(int(d * SR)), 'band', [6000, 11000]) * np.exp(-t_(d) / .012) * .5
def toypiano(m, d):
    f = mid(m); tt = t_(d); x = sum(a * np.sin(2 * np.pi * f * r * tt) for r, a in [(1, 1), (2.76, .4), (5.4, .2), (8.9, .08)])
    return x * np.exp(-tt / .35) * adsr(d, .002, .05)
def ks(m, d, bright=.5):   # Karplus–Strong nylon string
    f = mid(m); P = int(SR / f); n = int(d * SR); buf = filt(rng.standard_normal(P), 'low', 2500 + 3000 * bright); y = np.zeros(n)
    for i in range(n): y[i] = buf[i % P]; buf[i % P] = .5 * (buf[i % P] + buf[(i + 1) % P]) * .996
    return y * adsr(d, .001, .08)
def epiano(ms, d): tt = t_(d); return sum(np.sin(2 * np.pi * mid(m) * tt + .8 * np.sin(2 * np.pi * mid(m) * tt) * np.exp(-tt / .3)) for m in ms) * np.exp(-tt / 1.2) * adsr(d, .005, .1) / len(ms)
def shaker(): d = .07; return filt(rng.standard_normal(int(d * SR)), 'band', [4000, 9000]) * np.sin(np.pi * t_(d) / d) * .4

# —— the on-hold loop: 8 bars at 112 bpm, C major, deliberately cheesy ——
def hold_loop():
    bpm = 112; sb = 60 / bpm; bars = 8; d = bars * 4 * sb; x = np.zeros(int(d * SR) + SR)
    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]] * 2
    mel = [(0, 1, 76), (1, 1, 74), (2, 2, 72), (4, 1, 69), (5, 1, 71), (6, 2, 72), (8, 1, 77), (9, 1, 76), (10, 2, 74), (12, 3, 79),
           (16, 1, 76), (17, 1, 74), (18, 2, 72), (20, 1, 69), (21, 1, 71), (22, 2, 72), (24, 1, 74), (25, 1, 72), (26, 2, 71), (28, 4, 72)]
    for i, c in enumerate(chords):
        for b in range(4): place(x, epiano(c, sb * .9), (i * 4 + b) * sb, .35)
        place(x, filt(square(mid(c[0] - 12), sb * 3.8, .5), 'low', 600) * adsr(sb * 3.8), i * 4 * sb, .25)
    for b, dd, m in mel: place(x, filt(square(mid(m), dd * sb * .95, .25), 'low', 4000) * adsr(dd * sb * .95, .01, .05), b * sb, .3)
    return x[:int(d * SR)]
loop = hold_loop()
hold = np.zeros(N)
for e in E['ev']:
    if e['type'] != 'hold': continue
    n = int(e['d'] * SR); reps = np.tile(loop, n // len(loop) + 1)[:n] * e['v']
    f = int(.03 * SR); reps[:f] *= np.linspace(0, 1, f); reps[-f:] *= np.linspace(1, 0, f)
    place(hold, reps, e['t'])
hold = filt(hold, 'band', [300, 3400], 4); hold = np.tanh(hold * 2.5) / 2.5
sf.write(os.path.join(HERE, 'hold.wav'), (hold / (np.abs(hold).max() + 1e-9) * .8).astype(np.float32), SR)

score = np.zeros((N, 2))
# —— theme: D minor, 112 bpm, from the remote reveal to the first jump ——
c = CUE['theme']; bpm = 112; sb = 60 / bpm; t0 = c['t0']; nb = int((c['t1'] - t0) / sb)
th = [(0, 1.5, 62), (1.5, .5, 69), (2, 1, 70), (3, 1, 69), (4, 1, 64), (5, 1, 65), (6, 1, 64), (7, 1, 63), (8, 4, 62)]
place(score, theremin(th, bpm), t0, .5, .1)
for b in range(nb):
    place(score, bass([38, 38, 46, 45][(b // 4) % 4] if b % 2 == 0 else 50, sb * .9), t0 + b * sb, .45)
    for s in range(4): place(score, arp([62, 65, 69, 74][(b + s) % 4], sb / 4 * .9), t0 + b * sb + s * sb / 4, .25, -.3)
    place(score, kick(), t0 + b * sb, .55) if b % 2 == 0 else place(score, snare(), t0 + b * sb, .35)
    place(score, hat(), t0 + b * sb + sb / 2, .4, .4)
# a riser into the jump
d = c['t1'] - (c['t1'] - 1.2); tt = t_(1.2); place(score, np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / 1.2) ** 2) / SR) * (tt / 1.2) * .3, c['t1'] - 1.2, .5)
# —— +1 week: toy-piano lullaby in F major, 84 bpm, soft (the phone hold music sits on top) ——
c = CUE['toypiano']; sb = 60 / 84; lul = [72, 69, 65, 69, 72, 74, 72, 69, 70, 67, 64, 67, 70, 72, 70, 65]
for i in range(int((c['t1'] - c['t0']) / (sb / 2))): place(score, toypiano(lul[i % 16], sb * .5), c['t0'] + i * sb / 2, .22, .25)
# —— +40 years: elevator bossa (Karplus–Strong nylon, brushes), 100 bpm, Dm7 – G7 – Cmaj7 – A7 ——
c = CUE['bossa']; sb = 60 / 100; prog = [[50, 57, 60, 65], [43, 59, 62, 65], [48, 55, 59, 64], [45, 55, 61, 64]]
nbar = int((c['t1'] - c['t0']) / (4 * sb)) + 1
for bar in range(nbar):
    ch = prog[bar % 4]; tb = c['t0'] + bar * 4 * sb
    place(score, ks(ch[0], 1.2), tb, .5, -.1); place(score, ks(ch[0] + 7, 1.0), tb + 2.5 * sb, .35, -.1)
    for off in [0, 1.5, 3]: [place(score, ks(m, .6, .3), tb + off * sb + j * .012, .22, .2) for j, m in enumerate(ch[1:])]
    for k in range(8): place(score, shaker(), tb + k * sb / 2, .35 if k % 2 else .2, .35)
# —— final sting: the theme's first notes, then a held D on the end card ——
c = CUE['sting']; place(score, theremin([(0, .75, 62), (.75, .75, 69), (1.5, 6, 74)], 112), c['t0'], .55, .1)
place(score, bass(38, 4.5), c['t0'] + .85, .5); place(score, kick(), c['t0'] + .85, .7)
for b in range(6): place(score, arp([62, 69, 74, 77][b % 4], .2), c['t0'] + .85 + b * .27, .3, -.3)
# cut music hard where the film needs silence (no tails into the year 3000)
for a, b in [(33.4, 48.85)]:
    score[int(a * SR):int(b * SR)] = 0
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav + hold.wav', round(DUR, 2), 's')
