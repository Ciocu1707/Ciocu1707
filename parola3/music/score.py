"""Original score for "Tata și parola", part 3, synthesized in numpy (no samples): a morning theme, waiting-room muzak
for the 2004 laptop, a startup jingle, a puzzled captcha loop, a victory fanfare, a sunset-western snippet for the film,
a lullaby for the night, and the end theme.
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
def pluck(m, d=.3, b=.7): return ks(m, d, b)
def muted(m, d): f = mid(m); x = saw(f, d) + .4 * square(f * 2, d, .3); return filt(x, 'band', [400, 2400]) * adsr(d, .03, .08) * .5
walk = [36, 40, 43, 45, 41, 45, 48, 50, 43, 47, 50, 52, 36, 43, 40, 36]
a, b = cut('morning')
for i in range(int((b - a) / .6)): place(score, bass(walk[i % 16], .54), a + i * .6, .4); place(score, epiano([[60, 64, 67], [65, 69, 72]][(i // 4) % 2], .5), a + i * .6 + .3, .2) if i % 2 else None
a, b = cut('waiting')   # elevator muzak, bossa-ish, slowly slowing down
for i in range(int((b - a) / .5)): place(score, ks([50, 57, 53, 60][i % 4], .5, .3), a + i * .5, .3, .2); place(score, shaker(), a + i * .5 + .25, .15)
a, b = cut('jingle'); [place(score, toypiano(m, .5), a + i * .12, .55) for i, m in enumerate([72, 76, 79, 84])]
a, b = cut('captcha')
for i in range(int((b - a) / .4)): place(score, pluck([60, 63, 67, 70, 68, 67, 63, 62][i % 8], .35, .5), a + i * .4, .35, (-.2, .2)[i % 2])
a, b = cut('victory')
for bt, d, m in [(0, .2, 67), (.2, .2, 67), (.4, .2, 67), (.6, .8, 72), (1.6, .3, 71), (1.9, .3, 72), (2.2, 1.4, 76)]: place(score, muted(m, d), a + bt, .6); place(score, muted(m - 12, d), a + bt, .3)
place(score, kick(), a + .6, .7); place(score, kick(), a + 2.2, .7)
a, b = cut('film'); place(score, theremin([(0, 2, 64), (2, 2, 67), (4, 4, 69)], 70), a, .45, .1)
for i in range(int((b - a) / .5)): place(score, ks([40, 47][i % 2], .5, .4), a + i * .5, .3)
a, b = cut('lullaby')
for i, m in enumerate([72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 79, 76, 72, 72] * 2):
    tt = a + i * .5
    if tt >= b: break
    place(score, toypiano(m, .8), tt, .3, .2)
    if i % 4 == 0: place(score, epiano([48, 55, 64], 2.0), tt, .2)
a, b = cut('end')
for i in range(6): place(score, bass(walk[i], .55), a + i * .6, .45)
place(score, epiano([60, 64, 67, 72], 3.5), a, .45)
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's')
