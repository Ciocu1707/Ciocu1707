"""Voice post-processing: out/raw/<id>.wav (from tools/tts_ro.py) → voices/<id>.wav (48 kHz, processed per character)
+ voices/dur.json + voices/lips.json (lip sync: openness o and brightness b per 1/24 s).
- DORU: light saturation + a 180 Hz bump (gravel), slightly darker top.
- ILINCA: presence boost.
- TELEVIZOR: an old TV speaker (180–6000 Hz).
- other speakers: telephone band (300–3400 Hz) + a little grit, as if heard through the receiver.
- "cut" in lines.json: truncate at that many seconds (an interrupted line), 40 ms fade.
Usage: $LIB/.venv/bin/python voice.py"""
import json, os, numpy as np, soundfile as sf, soxr
from scipy.signal import butter, sosfilt, lfilter, stft

HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
L = json.load(open(os.path.join(HERE, 'lines.json')))
os.makedirs(os.path.join(HERE, 'voices'), exist_ok=True)


def peq(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q)
    b = np.array([1 + al * A, -2 * np.cos(w), 1 - al * A]); a = np.array([1 + al / A, -2 * np.cos(w), 1 - al / A])
    return lfilter(b / a[0], a / a[0], x)


def phone(x):
    x = sosfilt(butter(4, [300, 3400], 'bandpass', fs=SR, output='sos'), x)
    x = np.tanh(x / (np.abs(x).max() + 1e-9) * 2.2)
    return peq(x, 1600, 4, 1.2)


dur, lips = {}, {}
for l in L:
    y, sr = sf.read(os.path.join(HERE, 'out/raw', l['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = soxr.resample(y, sr, SR)
    if l.get('cut'):
        n = int(l['cut'] * SR); y = y[:n].copy(); f = int(.04 * SR); y[-f:] *= np.linspace(1, 0, f)
    y = y / (np.abs(y).max() + 1e-9) * .9
    who = l['who']
    if who == 'GINERE':
        y = peq(y, 3000, 3, .9)
    elif who == 'NIMENI':
        sat = np.tanh(y * 2.6) / np.tanh(2.6); y = .7 * y + .3 * sat
        y = peq(y, 180, 3, .8); y = peq(y, 2800, -1.5, 1.0)
    elif who in ('SOACRA', 'VETA'):
        y = peq(y, 3200, 2.5, .9)
    elif who == 'GPS':   # a dashboard GPS: small speaker, a little robotic
        y = sosfilt(butter(4, [350, 5000], 'bandpass', fs=SR, output='sos'), y); y = np.round(y * 24) / 24
    elif who == 'TELEVIZOR':   # an old TV speaker: narrower than full range, wider than a phone
        y = sosfilt(butter(2, [180, 6000], 'bandpass', fs=SR, output='sos'), y); y = peq(y, 1200, 3, 1.0)
    else:
        y = phone(y)
    y = y / (np.abs(y).max() + 1e-9) * .9
    sf.write(os.path.join(HERE, 'voices', l['id'] + '.wav'), y.astype(np.float32), SR)
    dur[l['id']] = round(len(y) / SR, 3)
    # lip sync: RMS per 1/24 s (normalised to the line's 95th percentile) + spectral centroid
    hop = SR // 24
    f, _, Z = stft(y, SR, nperseg=2400, noverlap=2400 - hop, boundary='even', padded=True)
    S = np.abs(Z)
    rms = np.sqrt((S ** 2).mean(0)); p = np.percentile(rms, 95) + 1e-9
    cen = (S * f[:, None]).sum(0) / (S.sum(0) + 1e-9)
    lips[l['id']] = {'o': [round(float(np.clip((r / p - .1) / .8, 0, 1)), 2) for r in rms],
                     'b': [round(float(np.clip((c - 1200) / 2600, 0, 1)), 2) for c in cen]}
    print(l['id'], dur[l['id']])
json.dump(dur, open(os.path.join(HERE, 'voices/dur.json'), 'w'), indent=0)
json.dump(lips, open(os.path.join(HERE, 'voices/lips.json'), 'w'))
