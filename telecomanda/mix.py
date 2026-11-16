"""Mix for "Telecomanda": dialogue (voices/) + score (music/score.wav, ducked under dialogue)
+ synthesized foley (events.json) + an ambience bed per era (TV static at home) → out/mix.wav
Usage: $LIB/.venv/bin/python mix.py  (after events.mjs, voice.py and music/score.py)"""
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ['LIB'], 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, norm, click, clack, whoosh, pop, thump, compress, limit, add
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR)
LINES = {l['id']: l for l in json.load(open(os.path.join(HERE, 'lines.json')))}
rng = np.random.default_rng(5)
nz = lambda d: rng.standard_normal(int(round(d * SR)))
sfxb, vob, amb = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2))

def sweep(f0, f1, d, curve=1.0): tt = t_(d); f = f0 * (f1 / f0) ** ((tt / d) ** curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def fade(x, a=.005, r=.02):
    n = len(x); x = x.copy(); A, R = min(n, int(a * SR)), min(n, int(r * SR)); x[:A] *= np.linspace(0, 1, A); x[n - R:] *= np.linspace(1, 0, R); return x
def bpsweep(x, f0, f1, q=.35):
    out = np.zeros_like(x); n = len(x)
    for i in range(0, n, 480):
        f = f0 * (f1 / f0) ** (i / n); s = bp(x[max(0, i - 2400):i + 480], f * (1 - q), min(f * (1 + q), 20000)); out[i:i + 480] = s[-len(out[i:i + 480]):]
    return out

# —— foley ——
def rclick(): x = click(.8); b = np.sin(2 * np.pi * 1320 * t_(.07)) * env_exp(.07, .03) * .5; y = np.zeros(int(.1 * SR)); y[:len(x)] += x; y[int(.02 * SR):int(.02 * SR) + len(b)] += b; return norm(y)
def cloth(): d = .3; return norm(lp(nz(d), 1500) * np.sin(np.pi * t_(d) / d) ** 2)
def blip(): d = .06; return norm(np.sin(2 * np.pi * 1700 * t_(d)) * np.sin(np.pi * t_(d) / d))
def tic(): d = .04; return norm(np.sin(2 * np.pi * 3200 * t_(d)) * env_exp(d, .008))
def portal_open():
    d = 1.5; tt = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(42 + 60 * np.exp(-tt / .12)) / SR) * env_exp(d, .45)
    down = bpsweep(nz(d), 6000, 300, .4) * env_exp(d, .5)
    swirl = np.sin(2 * np.pi * np.cumsum(300 + 600 * (tt / d) + 140 * np.sin(2 * np.pi * 9 * tt)) / SR) * np.sin(np.pi * np.minimum(tt / d, 1)) * .35
    ticks = np.zeros_like(tt)   # a clock racing inside the portal
    for k in range(int(d / .045)): s = int(k * .045 * SR); tk = hp(nz(.012), 3000) * env_exp(.012, .002); ticks[s:s + len(tk)] += tk[:len(ticks) - s]
    return norm(boom + down * .7 + swirl + ticks * .25 * np.linspace(1, .2, len(tt)))
def portal_whoosh(): d = .4; x = bpsweep(nz(d), 400, 4000, .3) * np.sin(np.pi * t_(d) / d) ** 2; return norm(x + np.sin(2 * np.pi * np.cumsum(np.linspace(200, 900, len(x))) / SR) * np.sin(np.pi * t_(d) / d) * .3)
def bubble(f0=300, f1=900, d=.07): return sweep(f0, f1, d, .8) * np.sin(np.pi * t_(d) / d)
def glorp():
    d = .5; tt = t_(d); f = 260 + 500 * np.sin(np.pi * tt / d)
    return norm(lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .6 * np.sin(2 * np.pi * 28 * tt)) * np.sin(np.pi * tt / d), 1800))
def chomp(): x = np.zeros(int(.3 * SR)); a = clack(1.4); b = clack(1.2); x[:len(a)] += a; x[int(.07 * SR):int(.07 * SR) + len(b)] += b; x[:int(.15 * SR)] += lp(nz(.15), 3000) * env_exp(.15, .03) * .5; return norm(x)
def paper(): d = .3; tt = t_(d); return norm(hp(nz(d), 2500) * (rng.random(len(tt)) > .6) * np.sin(np.pi * tt / d))
def ring(): d = .25; x = np.zeros(int(.35 * SR)); c = click(1.2); x[:len(c)] += c; x[int(.05 * SR):int(.05 * SR) + int(d * SR)] += bp(nz(d), 300, 3400) * env_exp(d, .05) * .3; return norm(x)
def slam():
    d = 1.0; tt = t_(d)
    return norm(np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-tt / .05)) / SR) * env_exp(d, .3) + bp(nz(d), 1000, 7000) * env_exp(d, .05) * .5)
def crickets(d):
    tt = t_(d); x = np.zeros_like(tt)
    for k in range(int(d / .7)):
        s = int((k * .7 + rng.random() * .2) * SR); ch = np.sin(2 * np.pi * 4300 * t_(.12)) * (np.sin(2 * np.pi * 30 * t_(.12)) > 0) * np.sin(np.pi * t_(.12) / .12)
        x[s:s + len(ch)] += ch[:len(x) - s]
    return fade(x, .2, .2)
def snore(d):
    tt = t_(d); env = np.clip(np.sin(2 * np.pi * tt / 3.2), 0, 1) ** 2
    return fade(lp(nz(d) * (1 + .8 * np.sin(2 * np.pi * 34 * tt)), 500) * env, .3, .3)
def roar():
    d = 1.2; tt = t_(d); f = 90 + 40 * np.sin(np.pi * tt / d)
    return norm(lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .7 * np.sin(2 * np.pi * 31 * tt)) + bp(nz(d), 200, 1500) * .6, 1600) * np.sin(np.pi * tt / d))
def slurp(d): tt = t_(d); return fade(norm(bp(nz(d), 700, 2600) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 6 * tt)))), .02, .05)
def squish(): d = .18; return norm(bpsweep(nz(d), 600, 2500, .5) * env_exp(d, .05))
def grab(): x = rclick(); y = np.zeros(int(.25 * SR)); y[:len(x)] += x; w = lp(nz(.15), 2000) * env_exp(.15, .03); y[:len(w)] += w; return norm(y)
def gasp(): d = .35; return norm(bp(nz(d), 1500, 5000) * np.sin(np.pi * t_(d) / d) ** .5)
FX = {'roar': (roar, .6), 'squish': (squish, .4), 'grab': (grab, .45), 'gasp': (gasp, .2), 'whoosh': (lambda: whoosh(.3), .4), 'click': (rclick, .45), 'cloth': (cloth, .18), 'blip': (blip, .3), 'tic': (tic, .2), 'portalOpen': (portal_open, .7),
      'portalWhoosh': (portal_whoosh, .45), 'whooshBig': (lambda: whoosh(.35), .45), 'glorp': (glorp, .55), 'chomp': (chomp, .5),
      'paper': (paper, .3), 'ring': (ring, .55), 'slam': (slam, .6)}
for e in E['ev']:
    ty, t, v = e['type'], e['t'], e.get('v', 1.0)
    if ty in FX: f, gdb = FX[ty]; add(sfxb, f() * v, t, gdb, float(rng.uniform(-.2, .2)))
    elif ty == 'slurp': add(sfxb, slurp(e['d']), t, .4)

# —— ambience: one bed per era ——
def brown_(d): w = np.cumsum(nz(d)); w -= np.linspace(w[0], w[-1], len(w)); return norm(hp(w, 20))
def fridge(d, lvl): tt = t_(d); return (np.sin(2 * np.pi * 100 * tt) + .5 * np.sin(2 * np.pi * 200 * tt) + .2 * np.sin(2 * np.pi * 300 * tt)) * lvl + lp(brown_(d), 300) * .02
def ticks(d, every=1.0, lvl=.06):
    x = np.zeros(int(d * SR))
    for k in range(int(d / every)): s = int(k * every * SR); tk = hp(nz(.025), 2500) * env_exp(.025, .003) * lvl; x[s:s + len(tk)] += tk[:len(x) - s]
    return x
def static(d): return hp(nz(d), 1800) * .05
def waves(d): tt = t_(d); return lp(nz(d), 700) * (.5 + .5 * np.sin(2 * np.pi * tt / 2.2)) * .08
def wind(d): return bpsweep(nz(d), 300, 900, .5) * .06
def birds(d):
    x = np.zeros(int(round(d * SR)))
    for k in range(int(d * 2)): s_ = int(rng.random() * (d - .2) * SR); c = sweep(2400, 3600, .12) * np.sin(np.pi * t_(.12) / .12) * .06; x[s_:s_ + len(c)] += c
    return x + lp(brown_(d), 400) * .02
TVON = 36.8
for e in E['ev']:
    if e['type'] != 'amb': continue
    t, d, w = e['t'], e['d'], e['w']
    if w == 'acasa':
        dd = d if t + d <= TVON or t >= TVON else TVON - t
        if t < TVON: add(amb, fade(static(dd), .02, .05), t, 1.0, -.4)
        add(amb, fade(fridge(d, .006) + ticks(d, 1.0, .04), .05, .05), t, 1.0)
    elif w == 'dino': add(amb, fade(birds(d), .03, .05), t, 1.0)
    elif w in ('gheata', 'spatiu'): add(amb, fade(wind(d), .03, .05), t, .8)
    elif w == 'pirati': add(amb, fade(waves(d), .03, .05), t, 1.0)
    elif w == 'an3000': add(amb, fade(fridge(d, .02) + ticks(d, 1.0, .05), .05, .05), t, 1.0)

# —— dialogue ——
PAN = {'DORU': .15, 'ILINCA': -.1, 'ILINCA BĂTRÂNĂ': .3, 'TELEVIZOR': -.4}
GAIN = {'DORU': 1.0, 'ILINCA': .95, 'ILINCA BĂTRÂNĂ': .9, 'TELEVIZOR': .85}
for e in E['ev']:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'))
    y = compress(y / np.abs(y).max(), .28, 3.2)
    y = y / (np.sqrt((y ** 2).mean()) + 1e-9) * .12
    who = LINES[e['id']]['who']; add(vob, y, e['t'], GAIN[who], PAN[who])
er = np.zeros(int(.09 * SR)); er[0] = 1
for dly, gdb in [(.011, .25), (.019, .18), (.031, .12), (.047, .08), (.067, .05)]: er[int(dly * SR)] += gdb
vob = np.stack([fftconvolve(vob[:, c], er)[:N] for c in range(2)], 1)

# —— music: score ducked ~7 dB under dialogue ——
def load(p):
    x, _ = sf.read(p); x = x if x.ndim == 2 else np.stack([x, x], 1)
    return x[:N] if len(x) >= N else np.pad(x, ((0, N - len(x)), (0, 0)))
mus = load(os.path.join(HERE, 'music/score.wav'))
act = (np.abs(vob).max(1) > .01).astype(float)
dk = np.clip(uniform_filter1d(maximum_filter1d(act, int(.3 * SR)), int(.15 * SR)), 0, 1)
mix = mus * .42 * (1 - .55 * dk)[:, None] + sfxb * .8 + vob + amb * .9
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out/mix.wav'), mix.astype(np.float32), SR)
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('mix peak %.3f rms %.1f dB | voice %.1f score %.1f sfx %.1f amb %.1f' % (np.abs(mix).max(), rms(mix), rms(vob), rms(mus * .42), rms(sfxb * .8), rms(amb)))
