"""Original score for "Liftul", synthesized in numpy (no samples): lift muzak between floors, one cue per floor that
starts on the ding (underwater dub, sneaky cat pizzicato, space theremin, cheese polka, jungle toms, rainy piano),
silence at floor 9, and the end theme.
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
def pluck(m, d=.25): return ks(m, d, .6)
def accordion(ms, d): return filt(sum(square(mid(m), d, .45) + square(mid(m) * 1.006, d, .45) for m in ms), 'low', 2400) * adsr(d, .02, .05) / len(ms) * .3
# lift muzak: soft electric piano, bossa-ish, F major
for name in ['muzak', 'muzak2', 'muzak3']:
    a, b = cut(name); sb = 60 / 96; prog = [[65, 69, 72, 76], [62, 65, 69, 72], [67, 70, 74, 77], [60, 64, 67, 70]]
    for i in range(int((b - a) / sb) + 1):
        tt = a + i * sb
        if tt >= b: break
        if i % 2 == 0: place(score, epiano(prog[(i // 4) % 4], sb * 1.8), tt, .3)
        place(score, bass(prog[(i // 4) % 4][0] - 24, sb * .8), tt, .25); place(score, shaker(), tt + sb / 2, .2, .3)
    place(score, np.zeros(1), b)
# floor 3, underwater: a dub bass and bubbly synth
a, b = cut('apa'); sb = .5
for i in range(int((b - a) / sb)):
    place(score, filt(bass([38, 38, 45, 43][(i // 2) % 4], sb * .9), 'low', 300), a + i * sb, .5)
    if i % 2: place(score, toypiano([74, 77][i % 2], .4) * .6, a + i * sb + .25, .3, .4)
# floor 7, the cat: sneaky pizzicato, tiptoe minor
a, b = cut('pisica'); sb = .3
for i, m in enumerate([57, 60, 64, 63, 57, 60, 64, 65, 64, 63, 62, 61] * 3):
    tt = a + i * sb
    if tt >= b: break
    place(score, pluck(m, .25), tt, .55, (-.2, .2)[i % 2])
# floor 13, space: theremin melody over a drone
a, b = cut('spatiu'); place(score, theremin([(0, 2, 69), (2, 1, 72), (3, 3, 76), (6, 2, 74), (8, 4, 69)], 80), a + .2, .5, .1)
tt = t_(b - a); place(score, np.sin(2 * np.pi * 55 * tt) * .3 * np.minimum(1, tt / 1), a, .5)
# montage stingers: cheese polka, jungle toms, rainy piano
a, b = cut('branza'); [place(score, accordion(ch, .22), a + i * .25, .6) for i, ch in enumerate([[60, 64, 67], [55, 59, 62], [60, 64, 67], [55, 59, 62]])]
for i in range(4): place(score, bass([48, 43][i % 2], .2), a + i * .25, .45)
a, b = cut('jungla'); [place(score, tom([70, 110, 90, 160][i % 4], 1), a + i * .25, .6, (-.3, .3)[i % 2]) for i in range(4)]
a, b = cut('ploaie'); [place(score, toypiano(m, .6) * .8, a + i * .25, .45) for i, m in enumerate([76, 72, 69, 64])]
# end card: theremin flourish + bass
a, b = cut('end'); place(score, theremin([(0, .5, 65), (.5, .5, 69), (1, .5, 72), (1.5, 4, 77)], 112), a, .55, .1); place(score, bass(41, 4.0), a + .05, .5); place(score, kick(), a, .7)
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's')
