"""Original score for "Telecomanda", synthesized in numpy (no samples): one genre cue per era, each cut on the zap.
jungle drums (dinosaurs), a Roman brass fanfare, 1-second stingers (ice, disco, sea shanty, space theremin),
tremolo strings for the soap opera (cut dead on Doru's "Nu."), and the end theme. The year 3000 has no music.
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
def tom(f, v=1.0): d = .35; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(f * (1 + .6 * np.exp(-tt / .03))) / SR) * np.exp(-tt / .1) * v
def brass(m, d): f = mid(m); x = saw(f, d) + .5 * saw(f * 1.004, d); return filt(x, 'low', 2600) * adsr(d, .03, .06) * .5
def strings(ms, d):
    tt = t_(d); trem = .6 + .4 * np.sin(2 * np.pi * 9 * tt)
    return filt(sum(saw(mid(m), d) + saw(mid(m) * 1.003, d) for m in ms), 'low', 3200) * trem * adsr(d, .2, .3) / len(ms) * .4
def accordion(ms, d): return filt(sum(square(mid(m), d, .45) + square(mid(m) * 1.006, d, .45) for m in ms), 'low', 2400) * adsr(d, .02, .05) / len(ms) * .3
# dinosaurs: jungle toms + a low ostinato, 120 bpm
a, b = cut('jungle'); sb = .5
for i in range(int((b - a) / (sb / 2))):
    tt = a + i * sb / 2
    if i % 4 == 0: place(score, tom(70, 1), tt, .6)
    if i % 4 == 2: place(score, tom(110, .8), tt, .5, .3)
    if i % 8 == 7: place(score, tom(160, .7), tt, .45, -.3)
    if i % 2 == 0: place(score, bass([38, 38, 41, 36][(i // 8) % 4], sb * .45), tt, .3)
# Rome: a brass fanfare in C major
a, b = cut('fanfare')
for k, (bt, d, m) in enumerate([(0, .25, 60), (.25, .25, 64), (.5, .25, 67), (.75, .75, 72), (1.5, .25, 67), (1.75, .5, 72)]): place(score, brass(m, d * .95), a + bt, .6); place(score, brass(m - 12, d * .95), a + bt, .3)
# the 1-second stingers
a, _ = cut('ice'); [place(score, toypiano(m, .5), a + .1 + i * .12, .4, .3) for i, m in enumerate([84, 88, 91, 96])]
tt = t_(1.0); place(score, filt(rng.standard_normal(len(tt)), 'band', [400, 1800]) * np.sin(np.pi * tt) * .3, a, .5)
a, _ = cut('disco')
for i in range(8): place(score, kick() if i % 2 == 0 else hat(), a + i * .125, .6 if i % 2 == 0 else .5)
for i, m in enumerate([45, 57, 45, 57, 48, 60, 48, 60]): place(score, bass(m, .11), a + i * .125, .4)
place(score, strings([69, 72, 76], .9), a, .5)
a, _ = cut('shanty'); [place(score, accordion(ch, .3), a + i * .33, .6) for i, ch in enumerate([[62, 66, 69], [62, 66, 69], [57, 61, 64]])]
a, _ = cut('space'); place(score, theremin([(0, 1, 74), (1, .8, 81)], 120), a, .6, .1)
# the soap opera: tremolo strings swelling, a dramatic sting on "tatăl tău", cut dead on "Nu."
a, b = cut('novela')
place(score, strings([57, 60, 64], 3.0), a + .5, .55); place(score, strings([53, 57, 62], 2.5), a + 3.5, .6)
place(score, strings([52, 56, 59, 64], 3.2), a + 5.9, .8); place(score, tom(55, 1), a + 3.7, .7)
score[int(b * SR):int(cut('end')[0] * SR)] = 0
# end card: the theme's opening on theremin + bass
a, b = cut('end'); place(score, theremin([(0, .75, 62), (.75, .75, 69), (1.5, 4, 74)], 112), a, .55, .1); place(score, bass(38, 4.0), a + .1, .5); place(score, kick(), a, .7)
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's')
