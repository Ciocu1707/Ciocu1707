"""Original score for "Soacra și GPS-ul", synthesized in numpy (no samples): a bouncy driving tune, a faster chase,
a banjo-ish breakdown for the off-road montage, a farmyard hoedown at Aunt Veta's, and the end sting.
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


score = np.zeros((N, 2))
def cut(name): c = CUE[name]; return c['t0'], c['t1']
def banjo(m, d=.2): return ks(m, d, .95)
def groove(a, b, bpm, prog, lead=None, lvl=1.0):
    sb = 60 / bpm
    for i in range(int((b - a) / (sb / 2))):
        tt = a + i * sb / 2
        if tt >= b: break
        ch = prog[(i // 8) % len(prog)]
        if i % 2 == 0: place(score, bass(ch[0] - 12 if i % 4 == 0 else ch[0] - 5, sb * .45), tt, .4 * lvl)
        place(score, banjo(ch[1 + i % 3] + 12, .18), tt, .3 * lvl, (-.3, .3)[i % 2])
        if i % 4 == 2: place(score, snare(), tt, .3 * lvl)
        if i % 2 == 1: place(score, hat(), tt, .25 * lvl, .4)
    if lead:
        for bt, d, m in lead: place(score, filt(square(mid(m), d * sb * .9, .3), 'low', 3000) * adsr(d * sb * .9, .01, .05) * .3, a + bt * sb, .5 * lvl, .1)
G = [[43, 55, 59, 62], [48, 60, 64, 67], [50, 62, 66, 69], [43, 55, 59, 62]]
a, b = cut('drive'); groove(a, b, 120, G, [(0, 1, 67), (1, 1, 71), (2, 2, 74), (4, 1, 72), (5, 1, 71), (6, 2, 69), (8, 1, 67), (9, 1, 71), (10, 2, 74), (12, 4, 79)], .8)
a, b = cut('chase'); groove(a, b, 150, G, [(0, .5, 74), (.5, .5, 72), (1, .5, 71), (1.5, .5, 69), (2, 1, 67), (4, .5, 74), (4.5, .5, 76), (5, 1, 79)] * 1, 1.0)
a, b = cut('montage'); groove(a, b, 176, G, None, 1.1)
for k, tc in enumerate([20.0, 21.3, 22.5, 23.5, 24.4]): place(score, arp(67 + k * 2, .12), tc, .5)
a, b = cut('banjo'); groove(a, b, 132, [[43, 55, 59, 62], [50, 62, 66, 69]], [(0, 1, 74), (1, 1, 71), (2, 1, 67), (3, 1, 71), (4, 2, 74), (6, 2, 79)], .6)
a, b = cut('end')
for i, m in enumerate([67, 71, 74, 79]): place(score, banjo(m, .3), a + i * .14, .6)
place(score, bass(31, 2.0), a + .6, .5); place(score, kick(), a + .6, .7); place(score, banjo(79, 1.5), a + .6, .5)
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's')
