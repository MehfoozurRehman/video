"""Original score for Video A, synthesised from scratch and timed to the voiceover sections.

  python3 -I tools/music.py src/vo.js src/assets/audio/music.wav [duration]

100 BPM, D major (Dmaj9 - Bm9 - Gmaj9 - A6sus), warm pads + felt-piano plucks + soft kick / sub / hats,
risers into the big moments and impacts on the closing words and the logo. Cue times come from vo.js.
"""
import json, sys
import numpy as np
from scipy import signal

SR = 48000
VO = json.loads(open(sys.argv[1]).read().split('=', 1)[1].strip().rstrip(';'))
OUT = sys.argv[2]
DUR = float(sys.argv[3]) if len(sys.argv) > 3 else 174.0
N = int(DUR * SR)
rng = np.random.default_rng(7)
words = [w[0].lower().strip('.,?') for w in VO]


def at(phrase, k=1):
    p = phrase.lower().split()
    c = 0
    for i in range(len(words) - len(p) + 1):
        if words[i:i + len(p)] == p:
            c += 1
            if c == k:
                return VO[i][1]
    raise KeyError(phrase)


def after(phrase):  # end of the phrase's last word
    p = phrase.lower().split()
    i = next(i for i in range(len(words)) if words[i:i + len(p)] == p)
    return VO[i + len(p) - 1][2]


# ---------------------------------------------------------------- cue map
T = dict(more=at('more presence'), cream=at('because true luxury'), trad=at('traditionally'), comm=at('we build communities'),
         today=at('and today'), app=at('this is the zood app'), drop=at('explore every'), hand=at('when it is time'),
         enjoy=at('you simply enjoy'), home=at('your home'), night=at('day and night'), inv=at('and for those who invest'),
         w1=at('discover', 2), w2=at('enjoy', 3), w3=at('live', 4), w4=at('dwell'), rhythm=at('designed for the rhythm'),
         lux=at('live luxury'))
BEAT = 60 / 100
OFF = T['drop'] % BEAT                      # put a downbeat exactly on the drop
BAR = BEAT * 4


def env(t, pts):
    """piecewise-linear automation: pts = [(time, value), ...]"""
    ts, vs = zip(*pts)
    return np.interp(t, ts, vs)


t = np.arange(N) / SR

# ---------------------------------------------------------------- instruments
def note_hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


CH = [[50, 57, 61, 64, 66, 69], [47, 54, 57, 61, 62, 66], [43, 50, 54, 57, 59, 62], [45, 52, 54, 57, 59, 64]]  # Dmaj9 Bm9 Gmaj9 A6sus
TENSE = [[47, 54, 57, 62, 65], [43, 50, 55, 58, 62]]                                                             # Bm(add b6) / Gm(add9) for "Traditionally"


def chord_at(time):
    if T['trad'] - 0.3 <= time < T['comm'] - 0.2:
        return TENSE[int((time - T['trad']) // (BAR)) % 2]
    return CH[int((time - OFF) // BAR) % 4]


def pad_layer():
    out = np.zeros((N, 2))
    seg = BAR
    starts = np.arange(OFF - seg, DUR, seg)
    for s in starts:
        a, b = max(0, s), min(DUR, s + seg + 1.6)
        i0, i1 = int(a * SR), int(b * SR)
        if i1 <= i0: continue
        tt = np.arange(i1 - i0) / SR
        e = np.minimum(1, tt / 0.9) * np.clip((b - a - tt) / 1.6, 0, 1)
        for n in chord_at(s + 0.01):
            f = note_hz(n)
            for side, det in ((0, -0.07), (1, 0.07)):
                x = np.zeros_like(tt)
                for h in range(1, 9):
                    x += np.sin(2 * np.pi * f * h * (1 + det / 100 * h) * tt + rng.random() * 6.28) / h ** 1.6
                out[i0:i1, side] += x * e * 0.035
    b, a = signal.butter(2, 2600 / (SR / 2))
    return signal.lfilter(b, a, out, axis=0)


def pluck(f, dur=2.4, amp=1.0):
    tt = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(tt)
    for h, w in zip(range(1, 9), [1, .5, .28, .18, .1, .07, .04, .03]):
        x += w * np.sin(2 * np.pi * f * h * (1 + 0.0004 * h * h) * tt) * np.exp(-tt * (2.2 + h * 1.4))
    x *= np.minimum(1, tt / 0.004)
    return x * amp


def kick(amp=1.0):
    tt = np.arange(int(0.45 * SR)) / SR
    f = 46 + 90 * np.exp(-tt * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-tt * 7.5) + 0.25 * rng.standard_normal(len(tt)) * np.exp(-tt * 260)) * amp


def hat(amp=1.0, dec=70):
    n = int(0.12 * SR)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * dec)
    b, a = signal.butter(4, 7000 / (SR / 2), 'high')
    return signal.lfilter(b, a, x) * amp


def snap(amp=1.0):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    x = rng.standard_normal(n) * (np.exp(-tt * 30) + 0.5 * np.exp(-np.maximum(0, tt - 0.012) * 45) * (tt > 0.012))
    b, a = signal.butter(2, [1200 / (SR / 2), 5200 / (SR / 2)], 'band')
    return signal.lfilter(b, a, x) * amp


def boom(amp=1.0):
    tt = np.arange(int(3.2 * SR)) / SR
    f = 38 + 60 * np.exp(-tt * 6)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.6)
    nz = rng.standard_normal(len(tt)) * np.exp(-tt * 9)
    b, a = signal.butter(2, 1800 / (SR / 2))
    return (x + 0.35 * signal.lfilter(b, a, nz)) * amp


def riser(dur, amp=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    nz = rng.standard_normal(n)
    out = np.zeros(n)
    for k in range(0, n, 2048):  # sweeping band-pass
        fc = 300 + 7000 * (k / n) ** 2
        b, a = signal.butter(2, [fc * 0.7 / (SR / 2), min(0.99, fc * 1.3 / (SR / 2))], 'band')
        seg = nz[k:k + 4096]
        out[k:k + 2048] = signal.lfilter(b, a, seg)[:len(out[k:k + 2048])]
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * (tt / dur) ** 2) / SR) * 0.25
    return (out + tone) * (tt / dur) ** 2.2 * amp


def whoosh(amp=1.0):
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(tt / 0.9, 0, 1)) ** 2
    b, a = signal.butter(2, [500 / (SR / 2), 4000 / (SR / 2)], 'band')
    return signal.lfilter(b, a, rng.standard_normal(n)) * e * amp


def place(buf, x, time, pan=0.0, gain=1.0):
    i = int(time * SR)
    if i >= N or i + len(x) <= 0: return
    j = min(N, i + len(x))
    x = x[max(0, -i): j - i]
    i = max(0, i)
    buf[i:j, 0] += x * gain * (1 - max(0, pan))
    buf[i:j, 1] += x * gain * (1 + min(0, pan))


# ---------------------------------------------------------------- arrangement
drums = np.zeros((N, 2)); keys = np.zeros((N, 2)); bass = np.zeros((N, 2)); fx = np.zeros((N, 2))
beats = np.arange(OFF, DUR, BEAT / 2)  # 8th-note grid


def level(time):  # 0 = no drums, 1 = soft pulse, 2 = groove, 3 = full
    s = [(0, 0), (T['more'] - 0.1, 1), (T['trad'] - 0.2, 0.5), (T['comm'] - 0.2, 1), (T['today'] + 2, 2), (T['app'] - 0.05, 0),
         (T['drop'] - 0.01, 3), (T['hand'] - 0.3, 0.5), (T['home'] - 0.2, 3), (T['inv'] - 0.1, 3),  # steady through "always with you… day and night"
         (T['w1'] - 0.05, 0), (T['rhythm'] - 0.1, 2), (T['lux'] - 0.05, 0)]
    v = 0
    for a, b in s:
        if time >= a: v = b
    return v


for k, b in enumerate(beats):
    lv = level(b)
    eighth = k % 2
    beat_in_bar = int(round((b - OFF) / BEAT)) % 4
    if lv >= 1 and not eighth and (beat_in_bar in (0, 2) or lv >= 2):
        place(drums, kick(0.9 if lv >= 2 else 0.55), b)
    if lv >= 2 and not eighth and beat_in_bar in (1, 3):
        place(drums, snap(0.32 if lv >= 3 else 0.22), b, pan=0.1)
    if lv >= 1:
        place(drums, hat((0.10 if eighth else 0.06) * (1.4 if lv >= 3 else 1)), b, pan=-0.3)
    if lv >= 3 and eighth and rng.random() < 0.35:
        place(drums, hat(0.05, dec=120), b + BEAT / 4, pan=0.35)
    if lv == 0.5:  # "Traditionally": a clock-like tick
        place(drums, hat(0.07, dec=160), b, pan=0.5 if eighth else -0.5)
    # sub bass on the root: 1 and the "and" of 2
    if lv >= 2 and ((beat_in_bar == 0 and not eighth) or (beat_in_bar == 1 and eighth)):
        r = chord_at(b + 0.01)[0] - 12
        tt = np.arange(int(BEAT * 1.4 * SR)) / SR
        place(bass, np.sin(2 * np.pi * note_hz(r) * tt) * np.minimum(1, tt / 0.01) * np.exp(-tt * 2.2) * 0.42, b)
    # felt-piano arpeggio (sparser when the drums rest)
    ch = chord_at(b + 0.01)
    if lv >= 2 or (lv >= 0.5 and not eighth and rng.random() < 0.7) or (lv == 0 and not eighth and beat_in_bar in (0, 2)):
        n = ch[(k * 3) % len(ch)] + 12
        place(keys, pluck(note_hz(n), amp=0.16 if lv >= 2 else 0.2), b, pan=rng.uniform(-0.5, 0.5))

# risers and impacts on the big moments
for tgt, dur, g in [(T['app'], 3.0, 0.22), (T['drop'], 2.4, 0.18), (T['home'], 1.8, 0.12), (T['w1'], 2.4, 0.2), (T['lux'], 4.0, 0.26)]:
    place(fx, riser(dur, g), tgt - dur)
for tgt, g in [(T['app'], 0.6), (T['drop'], 0.45), (T['w1'], 0.55), (T['w2'], 0.4), (T['w3'], 0.4), (T['w4'], 0.5), (T['lux'], 0.75)]:
    place(fx, boom(g), tgt)
    place(fx, pluck(note_hz(74), dur=3, amp=0.18), tgt, pan=0.2)
for tw in [T['cream'] - 0.35, T['trad'] - 0.15, T['drop'] - 0.6, at('verify your identity') - 0.3, T['hand'] - 0.6, T['enjoy'] - 0.5,
           at('before the first') + 0.1, after('not just an empty room') + 0.05,
           at('and everything your community') - 0.5, at('everything you need') - 0.4, T['inv'] - 0.45, T['rhythm'] - 0.35]:
    place(fx, whoosh(0.16), tw - 0.45, pan=rng.uniform(-0.4, 0.4))

pads = pad_layer()
# pad level automation: fuller in the quiet moments, tucked under the groove
padv = env(t, [(0, 0), (1.5, 1), (T['trad'], 0.7), (T['comm'], 1), (T['drop'], 0.6), (T['hand'], 1.1), (T['home'], 0.6),
               (T['w1'], 1.0), (T['lux'], 1.2), (DUR - 3, 0.8), (DUR, 0)])[:, None]
mix = pads * padv * 1.0 + keys * 0.9 + drums * 0.8 + bass * 0.9 + fx * 0.9

# ---------------------------------------------------------------- space + master
ir_n = int(2.6 * SR)
irt = np.arange(ir_n) / SR
IR = np.stack([rng.standard_normal(ir_n) * np.exp(-irt * 2.6) for _ in range(2)], 1)
IR[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
IR /= np.sqrt((IR ** 2).sum(0))
send = (keys + pads * padv) * 0.6 + (mix - drums * 0.8 - bass * 0.9) * 0.3   # no kick / sub in the reverb
hb, ha = signal.butter(2, 220 / (SR / 2), 'high')
send = signal.lfilter(hb, ha, send, axis=0)
wet = np.stack([signal.fftconvolve(send[:, c], IR[:, c])[:N] for c in range(2)], 1)
out = mix + wet * 0.35
b, a = signal.butter(2, 30 / (SR / 2), 'high')
out = signal.lfilter(b, a, out, axis=0)
fade = env(t, [(0, 0), (0.8, 1), (DUR - 4, 1), (DUR, 0)])[:, None]
out = out * fade
out = np.tanh(out / np.max(np.abs(out)) * 1.6) / np.tanh(1.6) * 0.89
pcm = (out * 32767).astype('<i2')
import wave
w = wave.open(OUT, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('wrote', OUT, f'{DUR:.1f}s', 'drop at', round(T['drop'], 2), 'logo hit at', round(T['lux'], 2))
