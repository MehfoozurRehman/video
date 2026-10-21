# ZOOD app launch film

A 2:54 landscape launch film for the ZOOD mobile app, built as code: an HTML and CSS stage animated by one paused GSAP timeline, rendered frame by frame with headless Chromium and encoded with ffmpeg.

**Status:** Shipped. Two finished 1920x1080, 60 fps films are committed under `deliverables/` (an Arabic version and an English version on the Arabic voice). The pipeline that makes them is in the repo, but it needs client assets that are not committed.

## The problem

A mobile app needs a launch film that can be re-cut when the voiceover or the copy changes, without rebuilding it in an editor each time. This project keeps the scenes, timings and brand styling in code, so a new voiceover only needs its timings aligned again.

## What it does

- **Scene-by-scene timeline:** `src/scenes.js` holds the whole film, and every cue is tied to a spoken phrase through `at('phrase')`, so the picture follows the voiceover.
- **Two cuts:** Video A (`src/index.html`) uses a floating 3D phone and screen mapping, and Video B (`src/b.html`) uses an editorial style with split screens and marquee type.
- **Brand system:** colours and type are set once in `src/style.css` (navy, beige, rose gold and sky blue).
- **Frame-exact rendering:** `render/render.mjs` renders frames in parallel and muxes the voiceover into an MP4. `render/still.mjs` renders single frames for review.
- **Preview:** `src/index.html?play` plays the film in real time with the voiceover.
- **Arabic and English builds:** separate Arabic entry points (`index-ar.html`, `index-enar.html`) and captions (`captions-ar.js`).

## How it's built

- Plain HTML, CSS and JavaScript, with GSAP (`gsap`) as the only animation library.
- Playwright (`playwright-core`) drives headless Chromium for rendering. ffmpeg encodes the frames and mixes the audio.
- Python scripts in `tools/` prepare the media: `prep_clips.py` removes the green background from clips and tracks screen corners, and `music.py` generates the score timed to the voiceover cues.
- Word-level voiceover timings are stored in `tools/vo-words.json` and `src/vo.js`, produced by forced alignment.

## Running it locally

Requires Node.js, ffmpeg and a Chromium that Playwright can drive. Source assets must be added first (see below).

```bash
npm install
node render/still.mjs out/stills 10 65 120 198
node render/render.mjs --fps 60 --workers 4 --out out/ZOOD_App_Film_1080p60.mp4
```

Music and the audio mix are separate ffmpeg and Python steps; the exact commands are in the README's usage section. `npm run still` and `npm run render` run the same two scripts.

## What's left

- **Client assets are not in git:** fonts, app screens, photos, logos, the project-film clips and the voiceover audio are excluded on purpose, so a fresh clone cannot render the film without them.
- **Chat transcript committed:** `history/ZOOD_chat_history.md` is a working transcript in a public repository. It should be reviewed before the repo is shared further.
- **Unreviewed root file:** `api.js` sits at the top level. It is not used by the scripts in `package.json` or by the render pipeline, and it was not reviewed.
- **Large binaries in git:** the two 90 MB deliverables and a 42 MB clip archive are tracked directly.
- **No automated tests** for the timeline or the renderer.
