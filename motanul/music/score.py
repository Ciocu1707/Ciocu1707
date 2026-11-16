"""Original score for "Motanul Copiat", synthesized in numpy (no samples): a sneaky pizzicato theme in the workshop,
a printer whir, an accelerating build-up as the copies double, a wide string swell for the pull-out to the planet,
and the end theme. Silences: the clone's first blink, the crowd's turn to camera, the planet.
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
def pluck(m, d=.25): return ks(m, d, .6)
def strings(ms, d):
    tt = t_(d); return filt(sum(saw(mid(m), d) + saw(mid(m) * 1.003, d) for m in ms), 'low', 2800) * adsr(d, .8, 1.0) / len(ms) * .45
# workshop theme: sneaky pizzicato + bass, G minor, 104 bpm (stops before the paw)
a, b = cut('theme'); sb = 60 / 104
for i, m in enumerate([55, 58, 62, 58, 55, 58, 63, 62, 60, 58, 57, 55]):
    tt = a + .4 + i * sb / 2
    if tt >= b - .2: break
    place(score, pluck(m + 12, .3), tt, .5, (-.2, .2)[i % 2])
    if i % 2 == 0: place(score, bass(43, sb * .4), tt, .35)
# the printer whir: a rising square sweep
a, b = cut('whir'); tt = t_(b - a); place(score, filt(np.sign(np.sin(2 * np.pi * np.cumsum(120 + 500 * tt / (b - a)) / SR)), 'low', 2000) * .15 * np.minimum(1, tt / .2), a, .6)
# the build-up: a kick whose interval halves with every doubling, a rising arpeggio, cut dead at the end
a, b = cut('build')
for tc, n in [(16.9, 4), (17.6, 8), (18.2, 16), (18.7, 32), (19.1, 64), (19.4, 128), (19.65, 256), (19.85, 512), (20.0, 1024), (20.12, 2048)]:
    place(score, kick(), tc, .7); place(score, arp(55 + int(np.log2(n)) * 2, .18), tc, .45, .2)
tt = t_(b - 20.12); place(score, filt(rng.standard_normal(len(tt)), 'band', [600, 6000]) * np.minimum(1, tt / .8) * .25, 20.12, .6)
# the pull-out: a wide major string swell, house → city, landing on the planet
a, b = cut('pullout'); place(score, strings([55, 59, 62, 67], b - a + 1.0), a, .7); place(score, strings([43, 50], b - a + 1.0), a, .5)
place(score, toypiano(79, 1.5), 39.0, .4); place(score, toypiano(74, 1.5), 39.4, .3)
# end card: the pizzicato theme again, then a held chord
a, b = cut('end')
for i, m in enumerate([67, 70, 74, 79]): place(score, pluck(m, .4), a + i * .18, .55)
place(score, strings([55, 58, 62], 3.5), a + .7, .55); place(score, bass(43, 3.5), a + .7, .45)
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's')
