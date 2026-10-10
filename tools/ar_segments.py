"""List the speech segments of a voiceover take (split at pauses), for pairing with tools/ar_anchors.json.

  python3 -I tools/ar_segments.py src/assets/audio/vo-ar-take.mp3

Uses the same silence detection as tools/vo_ar.py (-40 dB, 0.2 s), so segment numbers match its s12 / e12 references.
"""
import re, subprocess, sys
det = subprocess.run(['ffmpeg', '-hide_banner', '-i', sys.argv[1], '-af', 'silencedetect=n=-40dB:d=0.2', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
v = [float(x) for x in re.findall(r'silence_(?:start|end): ([0-9.]+)', det)]
segs = [(v[i], v[i + 1]) for i in range(1, len(v) - 1, 2)]
for k, (a, b) in enumerate(segs):
    gap = segs[k + 1][0] - b if k + 1 < len(segs) else 0
    print(f'{k:3d}  {a:7.2f}-{b:7.2f}  ({b - a:4.2f}s)  pause after {gap:4.2f}s')
