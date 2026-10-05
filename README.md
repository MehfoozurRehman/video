# ZOOD — App Launch Film

A 3:21 landscape (1920×1080, 60fps) launch film for the ZOOD mobile app, built as code:
an HTML/CSS stage animated by a single paused GSAP timeline, rendered frame-by-frame with
headless Chromium (Playwright) and encoded with ffmpeg.

## Structure
| Path | What it is |
|---|---|
| `src/index.html` | The 1920×1080 stage |
| `src/style.css` | Brand tokens (Navy #041E42, Beige #DBC8B6, Rose Gold #A27063, Sky #9BCBEB), type scale, phone mockup |
| `src/lib.js` | Helpers: text reveals, iPhone mockup, screen push, tap ripples, counters, brand curve lines |
| `src/scenes.js` | The whole timeline, scene by scene. Times are seconds into the VO |
| `src/boot.js` | Grain/vignette, asset preloading, `__seek(t)` API, `?play` live preview |
| `render/render.mjs` | Parallel frame renderer → MP4 with VO |
| `render/still.mjs` | Render stills at given times for review |
| `tools/vo-words.json` | Word-level timings of the voiceover (forced alignment) |

## Assets (not in git)
The repository is public, so client material is not committed. Place it in `src/assets/`:
`fonts/` (ITF Huwiya Arabic TTFs), `screens/` (app screens), `photos/` (brand-book imagery),
`brand/` (logo PNGs, App Store / Google Play SVGs), `audio/vo.mp3`.

## Usage
```bash
npm install
node render/still.mjs out/stills 10 65 120 198      # review frames
node render/render.mjs --fps 60 --workers 4 --out out/ZOOD_App_Film_1080p60.mp4
```
Open `src/index.html?play` in a browser and click to preview in real time with the VO.

## Editing
Copy and timings live in `src/scenes.js`. Each block is headed with its time range, and every
cue is keyed to a VO word time (see `tools/vo-words.json`).
