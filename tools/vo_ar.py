"""Edit the Arabic voiceover and move every film cue onto it.

  python3 -I tools/vo_ar.py <take.mp3> <anchors.json> <english_vo.js> <out.wav> <out_vo.js> [target_seconds]

There is no Arabic speech model here, so the take is split at its pauses (silence detection) and
anchors.json pairs English script phrases with those speech segments:
  {"holds": {"<seg>": seconds, ...},
   "anchors": [["english phrase", k, "s12"], ["english phrase", k, "e12"], ["phrase", k, "s19+0.45"], ...]}
  "s12" = start of segment 12, "e12" = its end, "+0.45" = an offset into it (seconds of the raw take).

1. pauses are tightened (sentence ≥0.8 s → 0.55 s, phrase 0.4–0.8 s → 0.32 s, shorter kept up to 0.25 s),
   held beats are inserted after the named segments, 12 ms crossfades
2. tempo (pitch kept) brings the edit to target_seconds, never faster than 1.1×
3. every English word time is mapped onto the edited Arabic take through the anchors (linear in between),
   so the film's at('english phrase') cues land on the matching Arabic phrase. Written in vo.js format.
"""
import json, re, subprocess, sys, tempfile, os, wave
import numpy as np

src, anchors_p, en_js, out_wav, out_js = sys.argv[1:6]
target = float(sys.argv[6]) if len(sys.argv) > 6 else None
cfg = json.load(open(anchors_p))
tmp = tempfile.mkdtemp()
SR = 48000

raw = os.path.join(tmp, 'raw.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', raw], check=True)
w = wave.open(raw); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32); dur = len(a) / SR

# speech segments between silences
det = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'silencedetect=n=-40dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
v = [float(x) for x in re.findall(r'silence_(?:start|end): ([0-9.]+)', det)]
segs = [(v[i], v[i + 1]) for i in range(1, len(v) - 1, 2)]
if len(v) % 2 == 1:  # take ends in speech
    segs.append((v[-1], dur))
print(len(segs), 'speech segments')

# new length of each gap
holds = {int(k): float(x) for k, x in cfg.get('holds', {}).items()}
def gap_to(g):
    return 0.55 if g >= 0.8 else 0.32 if g >= 0.4 else min(g, 0.25)
pieces = []                 # (raw_start, raw_end, out_start) for speech and kept silence; linear map inside
t_out = 0.12
pieces.append((segs[0][0] - 0.12, segs[0][0], 0.0))
for i, (s0, s1) in enumerate(segs):
    pieces.append((s0, s1, t_out)); t_out += s1 - s0
    if i + 1 < len(segs):
        g = segs[i + 1][0] - s1
        ng = gap_to(g)
        pieces.append((s1, segs[i + 1][0], t_out, ng + holds.get(i, 0)))  # silence: raw span → new length
        t_out += ng + holds.get(i, 0)
tail = min(1.2, dur - segs[-1][1])
pieces.append((segs[-1][1], segs[-1][1] + tail, t_out)); t_out += tail
cut_len = t_out

# audio: speech copied, gaps rebuilt from their own room tone (edges) plus silence for holds
out = []
xf = int(0.012 * SR)
def join(res, seg):
    if not len(res): return seg
    n = min(xf, len(res), len(seg)); f = np.linspace(0, 1, n)
    return np.concatenate([res[:-n], res[-n:] * (1 - f) + seg[:n] * f, seg[n:]])
res = np.zeros(0, np.float32)
for p in pieces:
    r0, r1 = int(p[0] * SR), int(p[1] * SR)
    if len(p) == 3:
        res = join(res, a[max(0, r0):r1])
    else:
        new = int(p[3] * SR); g = a[r0:r1]
        if new >= len(g):
            mid = np.zeros(new - len(g), np.float32)
            res = join(join(res, g[:len(g) // 2]), np.concatenate([mid, g[len(g) // 2:]]))
        else:
            h = new // 2
            res = join(join(res, g[:h]), g[len(g) - (new - h):])

tempo = 1.0 if not target else min(1.1, max(1.0, (len(res) / SR) / target))
cut = os.path.join(tmp, 'cut.wav')
o = wave.open(cut, 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
o.writeframes(np.clip(res, -32768, 32767).astype(np.int16).tobytes()); o.close()
af = f'atempo={tempo:.4f}' if tempo != 1.0 else 'anull'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', cut, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', out_wav], check=True)

def raw_to_out(t):
    for p in pieces:
        if p[0] - 1e-6 <= t <= p[1] + 1e-6:
            L = p[1] - p[0]; new = (p[3] if len(p) == 4 else L)
            return (p[2] + (t - p[0]) / L * new if L > 0 else p[2]) / tempo
    return (cut_len if t > segs[-1][1] else 0) / tempo

# English words, and the anchor pairs (english time, arabic raw time)
VO = json.loads(open(en_js).read().split('=', 1)[1].rstrip().rstrip(';'))
words = [x[0] for x in VO]
def find(phrase, k):
    p = re.sub(r"[^a-z' ]", ' ', phrase.lower()).split(); c = 0
    for i in range(len(words) - len(p) + 1):
        if words[i:i + len(p)] == p:
            c += 1
            if c == k: return i, i + len(p) - 1
    sys.exit(f'phrase not found: {phrase} ({k})')
pairs = []
for phrase, k, ref in cfg['anchors']:
    m = re.match(r'([se])(\d+)([+-][0-9.]+)?$', ref)
    seg = segs[int(m.group(2))]
    t_ar = (seg[0] if m.group(1) == 's' else seg[1]) + float(m.group(3) or 0)
    i0, i1 = find(phrase, k)
    pairs.append((VO[i0][1] if m.group(1) == 's' else VO[i1][2], t_ar, phrase))
pairs.sort()
bad = [(p, q) for p, q in zip(pairs, pairs[1:]) if q[1] <= p[1]]
if bad: sys.exit(f'anchors out of order: {bad[:3]}')
ex = np.array([p[0] for p in pairs]); ey = np.array([p[1] for p in pairs])
def en_to_ar(t):
    return float(np.interp(t, ex, ey))
new = [[x[0], round(raw_to_out(en_to_ar(x[1])), 2), round(raw_to_out(en_to_ar(x[2])), 2)] for x in VO]
for i in range(len(new)):  # keep every word at least a frame long and in order
    new[i][2] = max(new[i][2], new[i][1] + 0.02)
open(out_js, 'w').write('// English cue words mapped onto the edited Arabic voiceover (assets/audio/vo-ar-edit.wav).\nconst VO = ' + json.dumps(new) + ';\n')
print(f'raw {dur:.1f}s  cut {cut_len:.1f}s  tempo {tempo:.3f}  edited {cut_len / tempo:.2f}s  anchors {len(pairs)}')
