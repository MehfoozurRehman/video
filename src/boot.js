// Global overlays (grain + vignette), asset preloading and the seek API used by the renderer.
const grainCanvas = document.createElement('canvas');
grainCanvas.width = grainCanvas.height = 256;
{
  const g = grainCanvas.getContext('2d'), d = g.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
}
const grain = el(`<div id="grain" style="background-image:url(${grainCanvas.toDataURL()})"></div>`, stage);
el('<div id="vignette"></div>', stage);

window.DURATION = tl.duration();
window.__seek = (t) => {
  tl.seek(t, false);
  const f = Math.floor(t * 60);
  grain.style.transform = `translate(${(f * 37) % 64 - 32}px, ${(f * 53) % 64 - 32}px)`;
  return updateClips(t);
};
window.__ready = (async () => {
  await document.fonts.ready;
  const urls = new Set([...document.querySelectorAll('img')].map(i => i.src).filter(u => !u.startsWith('data:')));
  document.querySelectorAll('*').forEach(e => { const m = e.style && e.style.backgroundImage.match(/url\("?([^")]+)"?\)/); if (m) urls.add(m[1]); });
  await Promise.all([...urls].map(u => { const i = new Image(); i.src = u; return i.decode().catch(() => console.warn('img fail', u)); }));
  await Promise.all([...document.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
  window.__seek(0);
  return true;
})();
// Live preview: open index.html?play to watch in real time with the voiceover.
if (location.search.includes('play')) {
  const audio = new Audio('assets/audio/vo-edit.wav');
  document.addEventListener('click', () => { audio.play(); const t0 = performance.now();
    const loop = () => { window.__seek(audio.currentTime || (performance.now() - t0) / 1000); requestAnimationFrame(loop); }; loop(); }, { once: true });
}
