"""Mix for "Tata și parola", part 1: dialogue (voices/) + score (music/score.wav, ducked under dialogue)
+ synthesized foley (events.json: key clicks, the loading spinner, barks, drawers, the slammed door, the falling photo) → out/mix.wav
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
def ding(): tt = t_(1.2); return norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in [(1318, .5), (1046, .7), (2637, .2)]))
def door():
    d = .45; x = bp(nz(d), 300, 1500) * np.sin(np.pi * t_(d) / d); k = thump(.6, 90)[:len(x)]; x[:len(k)] += k * .3; return norm(x)
def rumble(d): tt = t_(d); return fade(norm(lp(nz(d), 120) + np.sin(2 * np.pi * 48 * tt) * .5) * (.6 + .4 * np.sin(2 * np.pi * 7 * tt)), .1, .2)
def leverfx(): x = np.zeros(int(.4 * SR)); a = clack(.7); x[:len(a)] += a; b = thump(.8, 60); x[int(.12 * SR):int(.12 * SR) + len(b)] += b[:len(x) - int(.12 * SR)]; return norm(x)
def skid(): d = .3; tt = t_(d); return norm(np.sin(2 * np.pi * (1800 - 900 * tt / d) * tt) * (np.sin(2 * np.pi * 40 * tt) > 0) * np.sin(np.pi * tt / d))
def bubbles(d):
    x = np.zeros(int(round(d * SR)))
    for k in range(int(d * 6)): s_ = int(rng.random() * (d - .1) * SR); b_ = sweep(300 + rng.random() * 300, 900 + rng.random() * 600, .07) * np.sin(np.pi * t_(.07) / .07); x[s_:s_ + len(b_)] += b_
    return norm(x)
def purr(d): tt = t_(d); return fade(norm(lp(nz(d), 300) * (.5 + .5 * np.sin(2 * np.pi * 26 * tt)) * (.6 + .4 * np.sin(2 * np.pi * .8 * tt))), .2, .2)
def meow(d=.7):
    tt = t_(d); f = 500 + 450 * np.sin(np.pi * tt / d) ** .7
    x = sum(a * np.sin(2 * np.pi * np.cumsum(f * k) / SR) for k, a in [(1, 1), (2, .5), (3, .3)])
    return norm(bp(x, 300, 4000) * np.sin(np.pi * tt / d) ** .5)
def yowl(): return meow(.5)[::1] * 1.0
def bonk(): x = np.zeros(int(.4 * SR)); a = clack(1.8); x[:len(a)] += a; tt = t_(.35); x[:len(tt)] += np.sin(2 * np.pi * np.cumsum(900 - 500 * tt / .35) / SR) * np.exp(-tt / .08) * .5; return norm(x)
def blinkfx(): d = .08; return norm(bp(nz(d), 700, 3000) * env_exp(d, .015))
def floatfx(d): tt = t_(d); return fade(norm(np.sin(2 * np.pi * np.cumsum(300 + 600 * tt / d) / SR) * .4 + np.sin(2 * np.pi * np.cumsum(450 + 900 * tt / d) / SR) * .2), .05, .2)
def slurp(d): tt = t_(d); return fade(norm(bp(nz(d), 700, 2600) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 6 * tt)))), .02, .05)
def thud(): return norm(thump(1, 70) + np.pad(lp(nz(.15), 1200) * env_exp(.15, .03), (0, int(.2 * SR))))
def squeak(): d = .12; tt = t_(d); return norm(np.sin(2 * np.pi * (2400 + 600 * np.sin(2 * np.pi * 30 * tt)) * tt) * np.sin(np.pi * tt / d))
def ooh(): d = .6; tt = t_(d); f = 160 + 60 * np.sin(np.pi * tt / d); return norm(lp(np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR), 900) * np.sin(np.pi * tt / d))
def rain(d): return fade(norm(hp(nz(d), 2000) * (rng.random(int(round(d * SR))) > .97)) , .05, .1)
def boing(): d = .7; tt = t_(d); f = 180 * (1 + .35 * np.sin(2 * np.pi * 16 * tt) * np.exp(-tt / .25)) * (1 + .6 * np.exp(-tt / .04)); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .22))
def slam():
    d = 1.0; tt = t_(d)
    return norm(np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-tt / .05)) / SR) * env_exp(d, .3) + bp(nz(d), 1000, 7000) * env_exp(d, .05) * .5)
def key(): d = .05; return norm(bp(nz(d), 1500, 6000) * env_exp(d, .008) + np.sin(2 * np.pi * 2600 * t_(d)) * env_exp(d, .01) * .3)
def spinner(d):
    tt = t_(d); x = np.zeros(len(tt))
    for k in range(int(d * 12)): s_ = int(k / 12 * SR); b_ = np.sin(2 * np.pi * (900 + (k % 8) * 60) * t_(.04)) * env_exp(.04, .01); x[s_:s_ + len(b_)] += b_[:len(x) - s_]
    return norm(x + np.sin(2 * np.pi * 120 * tt) * .1)
def dingfx(): tt = t_(.8); return norm(np.sin(2 * np.pi * 1318 * tt) * np.exp(-tt / .3) + np.sin(2 * np.pi * 1760 * tt) * np.exp(-tt / .2) * .5)
def lapse(d): tt = t_(d); return fade(norm(bpsweep(nz(d), 800, 3000, .3) * (.5 + .5 * np.sin(2 * np.pi * 3 * tt))) * .5, .1, .2)
def steps(d):
    x = np.zeros(int(round(d * SR)))
    for k in range(int(d * 4)): th = thump(.5, 120); s_ = int(k * .25 * SR); x[s_:s_ + len(th)] += th[:len(x) - s_] * .6
    return x
def buzz(): d = .35; return norm(np.sign(np.sin(2 * np.pi * 110 * t_(d))) * env_exp(d, .15))
def bark(v=1.0):
    d = .25; tt = t_(d); f = 420 + 300 * np.exp(-tt / .05)
    return norm(bp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + nz(d) * .4, 300, 3000) * env_exp(d, .07))
def drawer():
    d = .5; x = bp(nz(d), 200, 1200) * np.sin(np.pi * t_(d) / d); k = thump(.6, 80)[:len(x)]; x[:len(k)] += k * .3; return norm(x)
def mothfx(d): tt = t_(d); return fade(norm(bp(nz(d), 2000, 6000) * (.5 + .5 * np.sin(2 * np.pi * 40 * tt))) * .4, .05, .3)
def creak(): d = .6; tt = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(180 + 80 * np.sin(2 * np.pi * 3 * tt)) / SR) * (np.sin(2 * np.pi * 45 * tt) > .3) * np.sin(np.pi * tt / d))
def slamfx(): d = .8; tt = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(55 + 80 * np.exp(-tt / .04)) / SR) * env_exp(d, .25) + bp(nz(d), 800, 5000) * env_exp(d, .04) * .7)
def crash():
    d = 1.2; x = bp(nz(d), 2000, 9000) * env_exp(d, .3)
    for k in range(10): s_ = int((k * .03 + rng.random() * .1) * SR); c = np.sin(2 * np.pi * (2000 + rng.random() * 3000) * t_(.25)) * env_exp(.25, .05); x[s_:s_ + len(c)] += c[:len(x) - s_] * .4
    return norm(x)
def whimper(): d = .8; tt = t_(d); f = 900 - 300 * tt / d; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) * (1 + .3 * np.sin(2 * np.pi * 9 * tt)))
FX = {'key': (key, .35), 'ding': (dingfx, .35), 'buzz': (buzz, .35), 'drawer': (drawer, .45), 'creak': (creak, .3), 'slam': (slamfx, .6), 'crash': (crash, .5), 'whimper': (whimper, .3)}
for e in E['ev']:
    ty, t, v = e['type'], e['t'], e.get('v', 1.0)
    if ty in FX: f, gdb = FX[ty]; add(sfxb, f() * v, t, gdb, float(rng.uniform(-.2, .2)))
    elif ty == 'bark': add(sfxb, bark() * v, t, .5, -.3)
    elif ty == 'spinner': add(sfxb, spinner(e['d']), t, .3)
    elif ty == 'lapse': add(sfxb, lapse(e['d']), t, .3)
    elif ty == 'steps': add(sfxb, steps(e['d']), t, .4)
    elif ty == 'moth': add(sfxb, mothfx(e['d']), t, .2)

# —— ambience: the lift hum under everything (louder at floor 9, where the music stops) ——
def brown_(d): w = np.cumsum(nz(d)); w -= np.linspace(w[0], w[-1], len(w)); return norm(hp(w, 20))
def hum(d, lvl): tt = t_(d); return (np.sin(2 * np.pi * 60 * tt) + .4 * np.sin(2 * np.pi * 120 * tt)) * lvl + lp(brown_(d), 250) * lvl * 2
add(amb, fade(hum(DUR, .005), .05, .3), 0, 1.0)   # living-room tone (fridge + TV hum)

# —— dialogue ——
PAN = {'TATA': -.05, 'MAMA': .3, 'ANDREI': .2}
GAIN = {'TATA': 1.0, 'MAMA': .95, 'ANDREI': .95}
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
