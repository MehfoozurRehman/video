"""Edit a voiceover take for the film and force-align it to the script.

  python3 -I tools/vo_edit.py <take.mp3|wav> <script.txt> <out.wav> <out_vo.js> [tempo=1.1] [word=seconds ...]

1. align the raw take to the script (pocketsphinx)
2. tighten pauses: 0.30 s after . ?, 0.17 s after a comma, 0.12 s between words (12 ms crossfades)
   word=seconds holds a longer, silent beat after the first script word spelled like that (e.g. room.=2.8)
3. speed up with atempo (pitch kept)
4. align the edited take again and write the word timings as `const VO = [[word, start, end], ...]`
"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np
from pocketsphinx import Decoder

src, script, out_wav, out_js = sys.argv[1:5]
tempo = float(sys.argv[5]) if len(sys.argv) > 5 else 1.1
holds = dict((k, float(v)) for k, v in (a.rsplit('=', 1) for a in sys.argv[6:]))
toks = re.findall(r"[A-Za-z']+[.,?!]?", open(script).read().replace('Long-term', 'Long term'))
words = [re.sub(r'[^a-z\']', '', t.lower()) for t in toks]
tmp = tempfile.mkdtemp()


def pcm(f, sr):
    o = os.path.join(tmp, f'a{sr}.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-ar', str(sr), '-ac', '1', '-c:a', 'pcm_s16le', o], check=True)
    w = wave.open(o)
    return np.frombuffer(w.readframes(w.getnframes()), np.int16), o


def align(f):
    a, _ = pcm(f, 16000)
    d = Decoder(samprate=16000, bestpath=False, loglevel='ERROR')
    d.add_word('zood', 'Z UW D', True)
    for w in sorted(set(words)):
        if d.lookup_word(w) is None:
            sys.exit(f'not in dictionary: {w}')
    d.set_align_text(' '.join(words))
    raw = a.tobytes()
    d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
    d.set_alignment()
    d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
    r = [(re.sub(r'\(\d+\)$', '', s.name), s.start / 100, (s.start + s.duration) / 100) for s in d.get_alignment() if s.name not in ('<sil>', '<s>', '</s>')]
    if [x[0] for x in r] != words:
        bad = [(i, x[0], y) for i, (x, y) in enumerate(zip(r, words)) if x[0] != y][:5]
        sys.exit(f'alignment does not follow the script ({len(r)} vs {len(words)}): {bad}')
    return r


w = align(src)
a, _ = pcm(src, 48000)
a = a.astype(np.float32)
sr = 48000
cuts, ins = [], {}  # removed spans; silence inserted at a time (seconds of the raw take)
for i in range(len(w) - 1):
    e, s = w[i][2], w[i + 1][1]
    t = toks[i]
    tgt = 0.30 if t[-1] in '.?!' else (0.17 if t.endswith(',') else 0.12)
    if t in holds:
        tgt += holds.pop(t) * tempo
        if s - e < tgt: ins[e + 0.07] = tgt - (s - e)
    if s - e > tgt + 0.05:
        a0 = e + 0.07
        cuts.append((a0, a0 + (s - e - tgt)))
if holds:
    sys.exit(f'hold words not in the script: {list(holds)}')
if w[0][1] > 0.12:
    cuts.insert(0, (0, w[0][1] - 0.12))
xf = int(0.012 * sr)
parts, pos = [], 0
for c0, c1 in sorted(cuts + [(t, t) for t in ins]):
    parts.append(a[pos:int(c0 * sr)]); pos = int(c1 * sr)
    if c0 == c1 and c0 in ins:
        parts.append(np.zeros(int(ins[c0] * sr), np.float32))
parts.append(a[pos:])
res = parts[0]
for seg in parts[1:]:
    n = min(xf, len(res), len(seg))
    f = np.linspace(0, 1, n)
    res = np.concatenate([res[:-n], res[-n:] * (1 - f) + seg[:n] * f, seg[n:]])
tight = os.path.join(tmp, 'tight.wav')
o = wave.open(tight, 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes(np.clip(res, -32768, 32767).astype(np.int16).tobytes()); o.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tight, '-af', f'atempo={tempo}', '-ar', '48000', '-c:a', 'pcm_s16le', out_wav], check=True)

v = align(out_wav)
open(out_js, 'w').write('// Word timings of the edited voiceover (assets/audio/vo-edit.wav), force-aligned.\nconst VO = '
                        + json.dumps([[n, round(s, 2), round(e, 2)] for n, s, e in v]) + ';\n')
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out_wav], capture_output=True, text=True).stdout)
print(f'take {w[-1][2]:.1f}s  pauses cut {len(cuts)} ({sum(b - a for a, b in cuts):.1f}s)  edited {dur:.2f}s  words {len(v)}')
