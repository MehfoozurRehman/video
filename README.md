# ZOOD — App Launch Film

A 2:54 landscape (1920×1080, 60fps) launch film for the ZOOD mobile app, built as code:
an HTML/CSS stage animated by a single paused GSAP timeline, rendered frame-by-frame with
headless Chromium (Playwright) and encoded with ffmpeg.

## Two films
- **Video A** (v5) — `src/index.html` + `src/scenes.js` + `src/lib-a.js` (floating 3D phone, travelling frame, portals, the new tapered brand line, generated clips with app UI mapped onto green phone/tablet screens).
- **Video B** — `src/b.html` + `src/scenes-b.js` (editorial rhythm: footage inside type and the ZOOD symbol, stripe wipes, split screens, sliding footage columns, marquee type, flat phones with UI annotations). Render with `FILM=b.html node render/render.mjs --out out/ZOOD_B.mp4`.

Both share `src/lib.js`, `src/boot.js`, `src/style.css`, `src/vo.js` and the renderer.

## Structure
| Path | What it is |
|---|---|
| `src/index.html` | The 1920×1080 stage |
| `src/style.css` | Brand tokens (Navy #041E42, Beige #DBC8B6, Rose Gold #A27063, Sky #9BCBEB), type scale, phone mockup |
| `src/lib.js` | Helpers: text reveals, iPhone mockup, screen push, tap ripples, counters, brand curve lines |
| `src/scenes.js` | The whole timeline, scene by scene. Times are seconds into the VO |
| `src/lib-a.js` | Video A only: brand line / pattern / weave, `gclip()` for prepared clips, `gscreen()` + `homography()` to map UI onto green screens |
| `tools/prep_clips.py` | Turns clips into frame sequences at their own resolution and frame rate; removes green (WebP with alpha) and tracks screen corners |
| `src/boot.js` | Grain/vignette, asset preloading, `__seek(t)` API, `?play` live preview |
| `render/render.mjs` | Parallel frame renderer → MP4 with VO |
| `render/still.mjs` | Render stills at given times for review |
| `src/vo.js` / `tools/vo-words.json` | Word-level timings of the edited voiceover (forced alignment); scenes cue off them via `at('phrase')` |

## Assets (not in git)
The repository is public, so client material is not committed. Place it in `src/assets/`:
`fonts/` (ITF Huwiya Arabic TTFs), `screens/` (app screens), `photos/` (brand-book imagery),
`brand/` (logo PNGs, App Store / Google Play SVGs), `clips/proj/` (project film as a 30 fps JPEG sequence: `ffmpeg -i film.mp4 -q:v 3 src/assets/clips/proj/f%05d.jpg`), `audio/vo-edit.wav` (voiceover with pauses tightened and 1.1× tempo), `photos/handover-clean.jpg` (Hand Over artwork with its text removed),
`clips/gen/` (prepared clips: `python3 -I tools/prep_clips.py clips.json src/assets/clips/gen`).

## Usage
```bash
npm install
node render/still.mjs out/stills 10 65 120 198      # review frames
node render/render.mjs --fps 60 --workers 4 --out out/ZOOD_App_Film_1080p60.mp4
```
Music (original, generated in code and timed to the VO cues), then mix it under the voice with ducking:
```bash
python3 -I tools/music.py src/vo.js src/assets/audio/music.wav 174
ffmpeg -i out/ZOOD_App_Film_v5_1080p60.mp4 -i src/assets/audio/vo-edit.wav -i src/assets/audio/music.wav -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=6dB,asplit[v1][v2];[2:a]volume=-7dB[m];[m][v1]sidechaincompress=threshold=0.04:ratio=2.5:attack=20:release=500[md];[v2][md]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.93:level=false[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 320k -t 174 -movflags +faststart out/ZOOD_App_Film_v5_music_1080p60.mp4
```
Open `src/index.html?play` in a browser and click to preview in real time with the VO.

## Editing
Copy and timings live in `src/scenes.js`. Every cue is keyed to a spoken phrase with
`at('phrase', occurrence)` / `after('phrase')`, so re-cutting the VO only needs a re-alignment
(regenerate `src/vo.js`).
