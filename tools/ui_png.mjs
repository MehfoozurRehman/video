// Stills of the live app screens at 2x (used where many screens tile, e.g. the finale wall).
// node tools/ui_png.mjs [NN ...]   (default: every src/assets/ui/NN.html)
import fs from 'fs';
import { chromium } from 'playwright-core';
const dir = new URL('../src/assets/ui/', import.meta.url).pathname;
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter(f => /^\d\d\.html$/.test(f)).map(f => f.slice(0, 2));
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
fs.mkdirSync(dir + 'png', { recursive: true });
for (const id of ids) {
  await p.goto(`file://${dir}${id}.html`);
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.screenshot({ path: `${dir}png/${id}.png` });
}
console.log(ids.length, 'screens');
await b.close();
