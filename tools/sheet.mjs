// Usage: node tools/sheet.mjs out.jpg cols thumbW thumbH file1 file2 ...
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import path from 'path';
const [out, cols, w, h, ...files] = process.argv.slice(2);
const html = `<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:4px;font:12px sans-serif;color:#f55">` +
  files.map(f => `<div style="position:relative;width:${w}px;height:${h}px"><img src="${pathToFileURL(path.resolve(f))}" style="width:100%;height:100%;object-fit:contain"><span style="position:absolute;left:2px;top:2px;background:#000a">${path.basename(f)}</span></div>`).join('') + '</body>';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: cols * (+w + 4), height: 100 } });
const tmp = out + '.html'; (await import('fs')).writeFileSync(tmp, html);
await p.goto(pathToFileURL(path.resolve(tmp)).href, { waitUntil: 'load' });
await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 80 });
await b.close();
