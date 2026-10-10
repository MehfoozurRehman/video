# ZOOD Video A — handoff (everything you need to continue locally)

Read this first. The full conversation behind every decision is in [`history/ZOOD_chat_history.md`](history/ZOOD_chat_history.md).

> ⚠️ **Security: read before opening this folder in an editor.**
> `main` contains an injected malicious commit (`544e749`). Its `.vscode/tasks.json` silently runs `node ./public/fonts/fa-solid-800.lkf`, an obfuscated script, the moment the folder is opened in VS Code. It also adds `.vscode/settings.json` (auto-tasks allowed, terminal hidden), `api.js` and decoy `public/fonts/*` files.
> On 9 Oct GitHub user **Zain-Ul-Abideen321** merged `main` into this branch, which brought those files back. That merge was removed with a force-push.
> - Work only on `claude/intelligent-allen-jrzv18`.
> - **Never merge `main` into it** until `main` has been cleaned.
> - Before opening a clone, check that there is no `.vscode/`, `api.js` or `public/` folder.
> - Review who has write access to the repo.
> - If a machine has ever opened `main` in VS Code, treat it as compromised: scan it and rotate its credentials.

---

## 1. What this is
ZOOD (Saudi luxury real estate) app-launch film, **Video A**. It is landscape 1920×1080, 60 fps, in a premium Apple-keynote style, and every cue follows the voiceover.

It is built as code:
- an HTML/CSS stage animated by **one paused GSAP timeline**;
- rendered frame by frame in headless Chromium (Playwright);
- encoded with ffmpeg;
- with an original synth music score generated in Python and mixed under the voice.

**Video B** (`src/b.html`, `src/scenes-b.js`) is a separate film. The client said to never touch or take from it.

### Current state (10 Oct 2026)
| Version | What | Files |
|---|---|---|
| **v7** (English final) | English voice (`Updated_Audio.MP3`), full-screen furniture packages UI, identity without furniture, in-screen motion. 2:53 | `src/index.html` (cloud `out/ZOOD_App_Film_v7_1080p60.mp4`) |
| **v8 English on Arabic voice** | v7 visuals and English captions, timed to the Arabic voice | `src/index-enar.html` → `deliverables/ZOOD_v8_EN_ArabicVoice_1080p60.mp4` |
| **v8 Arabic film** (the important one) | Arabic voice, approved Arabic captions (RTL, Huwiya), Arabic labels on my own UIs. Client phone screens stay English. 2:50 | `src/index-ar.html` → `deliverables/ZOOD_v8_AR_1080p60.mp4` |

The v8 films also include four fixes from the client's v7 review:
- slower bedroom styles, with a 2.5 s held beat in the voice;
- the "Gallery" blue box removed, plus all export-broken buttons repaired;
- a readable payment journey;
- the café shot no longer has a person vanishing.

The PR is MehfoozurRehman/video#3.

The `deliverables/` files are ~4 Mbps encodes (91 MB). The full-bitrate masters (~690 MB each) were only in the cloud session's `out/`. Re-render them locally with the commands below.

---

## 2. Setup (Mac or Windows)
1. Install **Node 18+**, **ffmpeg** (on PATH) and **Python 3.10+**.
2. Run:
   ```bash
   git clone -b claude/intelligent-allen-jrzv18 https://github.com/MehfoozurRehman/video.git
   cd video
   npm install
   npx playwright install chromium       # the renderer finds it automatically (or set CHROME=/path/to/chrome)
   pip install -r requirements.txt       # numpy, scipy, Pillow, pocketsphinx — only for voice/music/clip tools
   ```
3. Preview: open `src/index.html?play` (or `index-ar.html?play`) in Chrome and click. It plays live with the voice.
   - Some browsers block `file://` loads. If so, serve the folder instead: `npx http-server -c-1 .`, then open `/src/index.html?play`.

The assets are all in git under `src/assets/` (1.5 GB). See the file map below.

---

## 3. Commands

### Stills (always check stills before a full render)
```bash
node render/still.mjs out/stills 10 65 120              # English film, times in seconds
FILM=index-ar.html   node render/still.mjs out/ar 10 65  # Arabic film
FILM=index-enar.html node render/still.mjs out/enar 10   # English on Arabic voice
```

### Full render → mix → review copy
**Render only when the client or user explicitly asks.** A render takes about 25 minutes with 4 workers in the cloud.

```bash
# 1. picture (+ raw voice)
node render/render.mjs --fps 60 --workers 4 --out out/EN_video.mp4                         # English (173 s)
FILM=index-ar.html   node render/render.mjs --fps 60 --workers 4 --out out/AR_video.mp4     # Arabic (170 s)
FILM=index-enar.html node render/render.mjs --fps 60 --workers 4 --out out/ENAR_video.mp4   # English on Arabic voice (170 s)

# 2. music (rebuild whenever the voice timing changes)
python3 -I tools/music.py src/vo.js    src/assets/audio/music.wav    173
python3 -I tools/music.py src/vo-ar.js src/assets/audio/music-ar.wav 170

# 3. ducked mix. English voice +6 dB; Arabic voice +1.4 dB (it is 4.6 dB louder at source). Target ≈ −16 LUFS.
ffmpeg -i out/EN_video.mp4 -i src/assets/audio/vo-edit.wav -i src/assets/audio/music.wav -filter_complex \
 "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=6dB,asplit[v1][v2];[2:a]volume=-7dB[m];[m][v1]sidechaincompress=threshold=0.04:ratio=2.5:attack=20:release=500[md];[v2][md]amix=inputs=2:normalize=0:duration=longest,volume=3dB,alimiter=limit=0.93:level=false[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 320k -t 173 -movflags +faststart out/ZOOD_EN_1080p60.mp4
#   Arabic / English-on-Arabic: vo-ar-edit.wav + music-ar.wav, volume=1.4dB instead of 6dB, -t 170

# 4. copies
#   review copy under 30 MB (what the user sends to the client in chat): 720p30, 2-pass 1150k
ffmpeg -i out/ZOOD_EN_1080p60.mp4 -vf "scale=1280:720:flags=lanczos,fps=30" -c:v libx264 -preset slow -b:v 1150k -pass 1 -an -f mp4 /dev/null   # Windows: NUL
ffmpeg -i out/ZOOD_EN_1080p60.mp4 -vf "scale=1280:720:flags=lanczos,fps=30" -c:v libx264 -preset slow -b:v 1150k -pass 2 -c:a aac -b:a 128k -movflags +faststart out/ZOOD_EN_review.mp4
#   1080p60 under GitHub's 100 MB limit: same two passes with -b:v 4100k (no scale/fps), audio 160k
```
To check a render, measure its loudness: `ffmpeg -i file.mp4 -af ebur128=peak=true -f null -`.

### Checks (run before every render)
```bash
node tools/check_overlap.mjs 0.2                        # text behind/over a phone, window, card or chip; must print "no overlaps"
FILM=index-ar.html node tools/check_overlap.mjs 0.2     # also for the other two films
node tools/check_captions.mjs                           # every English caption must be word-for-word in the VO script
```

### Voice (only when a new take arrives)
```bash
# English: align to tools/vo-script-en.txt, tighten pauses, +10% tempo, 3 s held beat after "empty room."
python3 -I tools/vo_edit.py src/assets/audio/vo-take2.mp3 tools/vo-script-en.txt src/assets/audio/vo-edit.wav src/vo.js 1.1 room.=3.0
# Arabic: no Arabic speech model, so it is split by pauses and mapped through phrase anchors
python3 -I tools/vo_ar.py src/assets/audio/vo-ar-take.mp3 tools/ar_anchors.json src/vo.js src/assets/audio/vo-ar-edit.wav src/vo-ar.js 172
```
- **English** (`vo_edit.py`): the alignment must follow the script exactly, or the tool stops.
- **Arabic** (`vo_ar.py`):
  - `tools/ar_anchors.json` pairs English phrases with Arabic speech segments (`s12` is the start of segment 12, `e12` its end, `s19+2.14` is an offset into it).
  - `holds` adds silent beats after segments: 41 is 2.5 s after "قبل أن يوضع حجر الأساس الأول" and 49 is 3.0 s after "لا إلى غرفة فارغة".
  - With a new Arabic take, list its segments with `python3 -I tools/ar_segments.py <take.mp3>` and re-pair the anchors.
  - After any voice change, rebuild the music and re-check overlaps.

### App screens
- `src/assets/ui/NN.html` are the client's screens (390×844, images inlined).
- `python3 -I tools/fix_ui_buttons.py src/assets/ui/*.html` repairs buttons whose padding and radius the design export reset (the "Gallery blue box").
- `node tools/ui_png.mjs` regenerates the 2× PNG stills used by the finale wall.
- Screens 32 (Your Selection), 33 (Identity Verified · Nafath) and 34 (Sales Agreement) were built from `All_Screens_Combine.html`.

### Clips
`python3 -I tools/prep_clips.py <config.json> src/assets/clips/gen` turns a source mp4 into a frame sequence.
- Modes: `plain`, `key`, `screen`, `recolor`.
- Configs used are in `tools/clip-configs/`. Their `src` paths point at the old cloud scratch folder, so edit them before reuse.
- The prepared frames are already in git, so you only need this for new footage.

---

## 4. How the code works
- **`src/scenes.js`** is the whole film, section by section: Opening, Traditionally, Journey cards, 01 Discover, 02 Create, Handover, 03 Live, 04 Enjoy, Finale.
  - Every time is a spoken cue: `at('phrase', k)` is the start of the k-th occurrence and `after('phrase')` is its end. Re-timing the voice re-times the film.
  - Vertical stacking: chapters 0, frame 20, finale 40, hero phone 50, portals 60, labels 90.
- **`src/lib.js`**: shared helpers.
  - text (`text`/`ltext`/`ctext`; `|` breaks a line, `[..]` marks rose-gold words) and `rise`/`hide`/`focusLine`;
  - `phone`, `swap`, `tap`, `portalOpen`/`portalClose`;
  - `count`, `vclip`;
  - the Arabic layer: `tr()`, `IS_AR`, `arabizeStage()`.
- **`src/lib-a.js`** (Video A):
  - brand line, pattern and sweep;
  - `gclip(parent, name, t0, t1, {from})` plays a prepared clip by timeline time;
  - live app screens: `scrContent('ui:NN')` loads an iframe, `onUI(wrapper, (doc, q) => …)` animates inside the screen, plus `uiRise`, `uiCount` and `uiTextAt`;
  - the furniture data `PKG`, the SAR symbol `SARi`, and `htmlAt`.
- **`src/boot.js`**: grain, vignette, preloading (images decoded 4 at a time), `window.__seek(t)` and the `?play` preview.
- **Arabic film**:
  - `src/index-ar.html` sets `window.LANG='ar'` and loads `vo-ar.js` and `captions-ar.js`.
  - `AR` maps every English caption to its approved Arabic line, and `AR_UI` maps the UI labels.
  - `.ar` styles are right-to-left, with letter-spacing off so the letters stay joined.
  - Unknown strings are logged as errors (`no Arabic for: …`), and `window.AR_MISSING` lists untranslated labels.
- **English on Arabic voice**: `src/index-enar.html` is `index.html` with `vo-ar.js`.

---

## 5. The client's standing rules (non-negotiable)
1. **Show a plan before building, and never render unless explicitly told.** Long jobs only on request.
2. **On-screen text matches the voiceover word for word**, and **ZOOD is always in capitals** (Arabic: زود).
3. **No text behind or over images or phones.** `check_overlap.mjs` must print "no overlaps".
4. "100 % perfect, no room for imperfection." Watch every render as 2 fps contact sheets before sending.
5. Women in footage wear hijab. No green-screen compositing.
6. Video A only; never touch Video B.
7. Use the original source components (client screens, clips, audio), never previously rendered videos.
8. If materials are poor, ask the user for proper ones (Gemini videos, screens, audio) instead of patching.
9. Masters are 1080p60. Review copies can be any resolution but must be under 30 MB (the chat upload limit).

Brand:
- Navy `#041E42`, Beige `#DBC8B6`, Rose Gold `#A27063`, Sky `#9BCBEB`;
- the Huwiya font for captions (`src/assets/fonts`), Figtree inside the app UIs;
- the tapered S-kink brand line.

---

## 6. Revision history (client feedback → what changed)
- **v1–v4**: built the film structure, project footage, 31 live app screens, original music score and ducked mix.
- **v5 review** (blur; text behind images; harsh promise-box shadow; poor green screens; text behind phones; payment phone; ovals; "night" behind the phone; investment should be in phones):
  - line-drawn promise document;
  - icon-stack "Traditionally";
  - 3D model view clip;
  - all green screen removed;
  - payment milestones as a full-screen brand-line journey;
  - the overlap checker.
- **v6**: live HTML screens (iframes) instead of screenshots, the new client clips (P1–P15) and layout fixes.
- **v6 client response** (furniture should show packages and cost; identity showed furniture; "day and night" volume dip), leading to **v7**:
  - new English take;
  - full-screen Furniture Packages and Package Details UI from the landscape images, priced: Classic 78,000, Contemporary 108,500, Luxury 164,000, details 124,775 incl. VAT;
  - verify = G2 clip + Login → Face ID → Identity Verified (Nafath);
  - Selection and Sales Agreement totals of 1,324,775;
  - in-screen motion everywhere;
  - re-sequenced opening;
  - captions made verbatim.
- **v7 review**, leading to **v8**: bedroom styles too fast (1:05), Gallery blue box (1:27), payment screen unreadable (1:38), person vanishing (2:09). Plus two new versions on the Arabic voice: the English film and the full Arabic film.

---

## 7. Open items
- **Arabic captions to confirm** against the audio. These lines were reconstructed from an automatic transcript; they are marked ⚠ in the chat history, e.g. "بمنصة واحدة، زود معك في كل شيء" and the handover lines.
- **Gender agreement for زود**: the voice uses both "زود تتولى الباقي" (feminine) and "وزود يتولى الباقي" (masculine). The captions follow the voice; the client may want one form.
- **Full-bitrate masters**: re-render them locally if the client needs higher than the 4 Mbps deliverables.
- **Clean `main`**: remove the malicious commit and audit write access (see the top of this file).
- Video B is untouched since its first version.

---

## 8. File map
| Path | What |
|---|---|
| `src/index.html` / `index-ar.html` / `index-enar.html` | the three films (English / Arabic / English on Arabic voice) |
| `src/scenes.js` | the timeline |
| `src/lib.js`, `src/lib-a.js`, `src/boot.js`, `src/style.css` | helpers, Video A helpers, boot and seek, styles |
| `src/vo.js`, `src/vo-ar.js` | word timings (English) and English cues mapped onto the Arabic voice |
| `src/captions-ar.js` | approved Arabic captions (`AR`), UI labels (`AR_UI`), chapter names |
| `src/assets/audio/` | `vo-take2.mp3` (English take), `vo-edit.wav` (edited English), `vo-ar-take.mp3` / `vo-ar-edit.wav` (Arabic), `music.wav` / `music-ar.wav`; `vo-original.mp3` and `vo.mp3` are the first take |
| `src/assets/ui/` | live app screens `01–34.html` and `png/` stills |
| `src/assets/clips/gen/` | prepared clips (frame sequences) and `clips.js` (frame counts, fps) |
| `src/assets/clips/proj/` | the ZOOD project film as 30 fps frames (shots in `SHOT` in `lib.js`) |
| `src/assets/pkg/` | furniture package images (landscape and portrait) |
| `src/assets/photos`, `screens`, `brand`, `fonts` | brand imagery, old screenshots, logos and badges, the Huwiya font |
| `render/` | `render.mjs` (parallel renderer), `still.mjs`, `page.mjs`, `browser.mjs` (finds Chromium) |
| `tools/` | voice, music, clips, checks, UI fixes, chat-history generator, clip configs, the English VO script, Arabic anchors |
| `deliverables/` | the v8 films (1080p60, ~4 Mbps) |
| `history/` | the full chat history |
