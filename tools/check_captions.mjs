// Lists every on-screen caption and flags any that is not, word for word, in the voiceover script.
// node tools/check_captions.mjs [script.txt]       (FILM=index-enar.html for the English film on the Arabic voice)
// The Arabic film (FILM=index-ar.html) uses the approved captions in src/captions-ar.js; this check is for English.
import fs from 'fs';
import { openFilm, ROOT } from '../render/page.mjs';
import path from 'path';
const scriptFile = process.argv[2] || path.join(ROOT, 'tools/vo-script-en.txt');
const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
const script = norm(fs.readFileSync(scriptFile, 'utf8'));
const f = await openFilm();
const caps = await f.page.evaluate(() => [...document.querySelectorAll('#stage .abs')].filter(e => e.querySelector(':scope > .line'))
  .map(e => [...e.querySelectorAll(':scope > .line')].map(l => l.textContent.trim()).join(' ')));
const bad = [...new Set(caps)].filter(c => !script.includes(norm(c)));
console.log(`${new Set(caps).size} captions; not in the voiceover script (labels are expected here):`);
for (const c of bad) console.log('  ', c);
const zood = caps.filter(c => /zood/i.test(c) && !/ZOOD/.test(c) && !/zood\.sa/.test(c));
if (zood.length) console.log('ZOOD not in capitals:', zood);
await f.browser.close();
