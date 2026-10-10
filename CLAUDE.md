# CLAUDE.md

ZOOD Video A, a launch film built as code (HTML stage + GSAP timeline → Playwright frames → ffmpeg).

**Before doing anything, read `HANDOFF.md`.** It covers setup, commands, how the code works and the open items. The reasoning behind each decision is in `history/ZOOD_chat_history.md`.

Security: work only on the `claude/intelligent-allen-jrzv18` branch.
- Never merge or pull `main`: it contains a malicious `.vscode/tasks.json` auto-run task.
- If `.vscode/`, `api.js` or `public/fonts/*.lkf` ever appear, stop and tell the user.

Client rules (always):
- Show a plan first.
- **Never start a render or other long job unless the user explicitly asks for a video.**
- On-screen text matches the voiceover word for word.
- ZOOD is always in capitals (Arabic: زود).
- No text behind or over images or phones: `node tools/check_overlap.mjs 0.2` must print "no overlaps" for every film you touch.
- Run `node tools/check_captions.mjs` for English.
- Review stills (`render/still.mjs`) before rendering, and 2 fps contact sheets after.
- Women in hijab; no green-screen compositing.
- Video A only (never `b.html` / `scenes-b.js`).
- Use the original source components.
- Ask for proper materials instead of patching.
- Masters are 1080p60; review copies must be under 30 MB.
- Timing: every cue is `at('english phrase')`. Re-time by regenerating `src/vo.js` / `src/vo-ar.js` (see `HANDOFF.md` §3), then rebuild the music.
