// Scans the film for on-screen text that overlaps a phone, a framed window or a card it does not belong to.
// node tools/check_overlap.mjs [step=0.2] [start=0] [end=DURATION]
import { openFilm } from '../render/page.mjs';
const [step = 0.2, start = 0, endArg] = process.argv.slice(2).map(Number);
const f = await openFilm();
const end = endArg || f.duration;
const hits = [];
for (let t = start; t <= end; t += step) {
  await f.page.evaluate((t) => window.__seek(t), t);
  const r = await f.page.evaluate(() => {
    const vis = (e) => {
      let o = 1;
      for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
        o *= parseFloat(cs.opacity);
        if (o < 0.35) return o;
      }
      return o;
    };
    const box = (e) => e.getBoundingClientRect();
    const inView = (b) => b.width > 2 && b.height > 2 && b.right > 0 && b.bottom > 0 && b.left < 1920 && b.top < 1080;
    const clipBox = (e) => {            // the part of e not clipped away by overflow:hidden ancestors
      let r = box(e), L = r.left, T = r.top, R = r.right, B = r.bottom;
      for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.overflow !== 'visible' || cs.clipPath !== 'none') { const c = box(n); L = Math.max(L, c.left); T = Math.max(T, c.top); R = Math.min(R, c.right); B = Math.min(B, c.bottom); }
      }
      return { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T };
    };
    // make only visibly painted things hit-testable: effective opacity > 0.05 and something drawn (text, image, background)
    const walk = (e, op) => {
      const cs = getComputedStyle(e);
      const o = op * parseFloat(cs.opacity), shown = cs.visibility !== 'hidden' && cs.display !== 'none' && o > 0.05;
      const paints = e.matches('.w, img, iframe, svg, .phone, [data-ob], .tile, .card, .chip') || (cs.backgroundImage !== 'none') || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent');
      e.style.pointerEvents = shown && paints && !e.matches('#grain, #vignette') ? 'auto' : 'none';
      if (cs.display !== 'none') for (const c of e.children) walk(c, o);
    };
    walk(document.getElementById('stage'), 1);
    const hit = (x, y) => document.elementFromPoint(Math.max(0, Math.min(1919, x)), Math.max(0, Math.min(1079, y)));
    const isBg = (e) => { const b = box(e); return b.width * b.height > 0.85 * 1920 * 1080 || e.closest('.p3d'); };
    const obs = [...document.querySelectorAll('.phone, [data-ob], .tile, .card, .chip')].filter(e => inView(box(e)) && vis(e) > 0.5 && !isBg(e));
    const words = [...document.querySelectorAll('.w')].filter(e => e.textContent.trim() && vis(e) > 0.5).map(e => [e, clipBox(e)]).filter(([, b]) => b.width > 4 && b.height > 4 && inView(b));
    const out = [];
    for (const [w, a] of words) {
      const wh = hit((a.left + a.right) / 2, (a.top + a.bottom) / 2);
      const wordShown = wh && (w.contains(wh) || wh.contains(w) || wh === w.parentElement);
      for (const o of obs) {
        if (o.contains(w)) continue;
        const b = clipBox(o);
        const L = Math.max(a.left, b.left), R = Math.min(a.right, b.right), T = Math.max(a.top, b.top), B = Math.min(a.bottom, b.bottom);
        if (R - L <= 6 || B - T <= 6) continue;
        const top = hit((L + R) / 2, (T + B) / 2);
        if (!top) continue;
        if (o.contains(top) && (wordShown || o.contains(wh))) out.push(`BEHIND "${w.textContent.trim()}" × ${o.className || o.dataset.ob} (${Math.round(R - L)}×${Math.round(B - T)})`);
        else if ((w.contains(top) || top.contains(w)) && (o.contains(hit((b.left + b.right) / 2, (b.top + b.bottom) / 2)))) out.push(`OVER "${w.textContent.trim()}" × ${o.className || o.dataset.ob} (${Math.round(R - L)}×${Math.round(B - T)})`);
      }
    }
    return [...new Set(out)];
  });
  if (r.length) hits.push(`${t.toFixed(1)}s  ${r.slice(0, 4).join(' | ')}`);
}
console.log(hits.length ? hits.join('\n') : 'no overlaps');
await f.browser.close();
