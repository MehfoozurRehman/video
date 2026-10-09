// node render/still.mjs out_dir t1 t2 ...   → PNG stills at those times
import fs from 'fs';
import path from 'path';
import { openFilm } from './page.mjs';
const [out, ...ts] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const f = await openFilm();
for (const t of ts.map(Number).sort((a, b) => a - b)) {
  fs.writeFileSync(path.join(out, `t${t.toFixed(2).padStart(7, '0')}.jpg`), await f.frame(t, 'jpeg', 90));
}
console.log('duration', f.duration, 'errors', f.errors.length, f.errors.join(' / ').slice(0, 400));
await f.browser.close();
