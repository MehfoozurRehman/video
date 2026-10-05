// Parallel frame renderer → H.264 MP4 with the voiceover.
// node render/render.mjs [--fps 60] [--workers 3] [--start 0] [--end DURATION] [--out out/zood.mp4] [--crf 16] [--scale 1]
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { openFilm, ROOT } from './page.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const fps = +(args.fps || 60), workers = +(args.workers || 3), crf = args.crf || '16', scale = +(args.scale || 1);
const out = path.resolve(args.out || path.join(ROOT, 'out/zood.mp4'));
const tmp = path.join(path.dirname(out), '.parts');
fs.mkdirSync(tmp, { recursive: true });

const probe = await openFilm(); const DUR = probe.duration; await probe.browser.close();
const start = +(args.start || 0), end = +(args.end || DUR);
const f0 = Math.round(start * fps), f1 = Math.round(end * fps);
const per = Math.ceil((f1 - f0) / workers);
console.log(`rendering ${f1 - f0} frames @${fps}fps with ${workers} workers`);
const t0 = Date.now();
let done = 0;

async function worker(w) {
  const a = f0 + w * per, b = Math.min(f1, a + per);
  if (a >= b) return null;
  const file = path.join(tmp, `part${w}.mp4`);
  const vf = scale !== 1 ? ['-vf', `scale=${Math.round(1920 * scale)}:-2:flags=lanczos`] : [];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', ...vf,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', '-r', String(fps), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const film = await openFilm();
  for (let f = a; f < b; f++) {
    const buf = await film.frame(f / fps, 'jpeg', 94);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    done++;
    if (done % 300 === 0) { const s = (Date.now() - t0) / 1000; console.log(`${done}/${f1 - f0} frames  ${(done / s).toFixed(1)} fps  eta ${((f1 - f0 - done) / (done / s) / 60).toFixed(1)} min`); }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await film.browser.close();
  return file;
}
const parts = (await Promise.all([...Array(workers).keys()].map(worker))).filter(Boolean);
fs.writeFileSync(path.join(tmp, 'list.txt'), parts.map(p => `file '${p}'`).join('\n'));
const audio = path.join(ROOT, 'src/assets/audio/vo.mp3');
await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'),
  '-ss', String(start), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-af', `apad`, '-t', String(end - start),
  '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', c => c ? rej(c) : res()));
console.log(`done → ${out} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
