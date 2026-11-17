"""Original score for "Tata și parola", part 2, synthesized in numpy (no samples): a detective theme (walking pizzicato
bass, muted trumpet-ish lead), clue stings, a search montage, an evidence-board build, a slow-motion drama swell with a
heartbeat, and the end theme. Silence after the lock and before "'91".
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
def muted(m, d): f = mid(m); x = saw(f, d) + .4 * square(f * 2, d, .3); return filt(x, 'band', [400, 2200]) * adsr(d, .03, .08) * .5
def strings(ms, d): tt = t_(d); return filt(sum(saw(mid(m), d) + saw(mid(m) * 1.003, d) for m in ms), 'low', 2800) * adsr(d, .6, .8) / len(ms) * .45
# detective theme: walking pizzicato bass in C minor + a muted lead
a, b = cut('detective'); sb = .5
for i, m in enumerate([36, 39, 43, 44, 43, 39, 41, 42, 43, 46, 48, 46, 43]):
    tt = a + .2 + i * sb
    if tt >= b: break
    place(score, pluck(m + 12, .45, .4), tt, .5)
for bt, d, m in [(0, 1, 67), (1, .5, 70), (1.5, .5, 72), (2, 1.5, 75), (4, 1, 74), (5, 1.5, 72)]: place(score, muted(m, d * sb * .95), a + .2 + bt * sb + 1.5, .5, .1)
# clue stings on the album
a, b = cut('clue')
for tc in [13.0, 20.3]: place(score, muted(72, .2) + 0, tc, .5); place(score, muted(79, .5), tc + .2, .5)
for i in range(int((b - a) / 1.0)): place(score, pluck([48, 51][i % 2], .5, .3), a + i, .25)
# search montage: busy plucks and a shaker groove
a, b = cut('search'); sb = .25
for i in range(int((b - a) / sb)):
    tt = a + i * sb
    if i % 4 == 0: place(score, bass([36, 36, 41, 43][(i // 16) % 4], sb * 1.8), tt, .35)
    if i % 2 == 0: place(score, shaker(), tt, .25, .3)
    if i % 8 == 3: place(score, pluck(60 + (i // 8) % 5 * 2, .3), tt, .3, -.3)
# evidence board: a rising arpeggio
a, b = cut('board')
for i in range(int((b - a) / .25)): place(score, arp(48 + (i % 8) * 2 + (i // 16) * 3, .2), a + i * .25, .3, (-.2, .2)[i % 2])
# slow-motion drama: a swelling minor chord and choir-ish strings, cut dead on the key press
a, b = cut('drama'); place(score, strings([48, 51, 55, 60], b - a + .5), a, .8); place(score, strings([36, 43], b - a + .5), a, .6)
score[int(b * SR):int((b + .1) * SR)] = 0
# end card
a, b = cut('end'); place(score, muted(67, .3), a, .5); place(score, muted(72, 2.0), a + .3, .5); place(score, pluck(36, 1.5, .4), a, .5)
sf.write(os.path.join(HERE, 'score.wav'), (score / (np.abs(score).max() + 1e-9) * .85).astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's')
