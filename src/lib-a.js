// Video A (v5) additions, loaded after lib.js. Video B never loads this file.
// - the new ZOOD brand line (thin vertical stroke whose kink swells into a tapered S)
// - generated / client clips as frame sequences (assets/clips/gen, see tools/prep_clips.py)
// - app UI mapped onto green phone / tablet screens, frame by frame

// ---------- brand line ----------
// One line: x at the top, kinks at y=k over height kh, ends at x+dx. Thin half-width a, swells to b.
function brandLineD(x, k, dx, { h = H, a = 1.4, b = 7, kh = 150, top = -20 } = {}) {
  const N = 28, L = [], R = [];
  const y0 = k - kh / 2;
  const ss = (u) => u * u * (3 - 2 * u);
  L.push([x - a, top]); R.push([x + a, top]);
  for (let i = 0; i <= N; i++) {
    const u = i / N, y = y0 + kh * u;
    const cx = x + dx * ss(u);
    // swell is strongest just after the middle of the S, like the brand drawing
    const sw = a + (b - a) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 2.2);
    const slope = 6 * u * (1 - u) * dx / kh;               // dx/dy of the centre line
    const off = sw * Math.sqrt(1 + slope * slope);         // keep the stroke width perpendicular
    L.push([cx - off, y]); R.push([cx + off, y]);
  }
  L.push([x + dx - a, h + 20]); R.push([x + dx + a, h + 20]);
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `M ${L.map(f).join(' L ')} L ${R.reverse().map(f).join(' L ')} Z`;
}
// "Simple" pattern: vertical brand lines, kinks at varied heights, some in close pairs.
function brandPattern(parent, { n = 12, x0 = 0, x1 = W, h = H, color = 'rgba(214,165,140,.35)', seed = 3, dx = 70, a = 1.3, b = 6, kh = 170, w = W } = {}) {
  const r = rng(seed);
  const svg = el(`<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:0;top:0;overflow:visible"></svg>`, parent);
  const paths = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + 0.2 + r() * 0.6) / n;
    const k = h * (0.2 + 0.6 * r()), d = (r() > 0.5 ? 1 : -1) * dx * (0.8 + r() * 0.5);
    const add = (xx, kk) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', brandLineD(xx, kk, d, { h, a, b, kh })); p.setAttribute('fill', color);
      svg.appendChild(p); paths.push(p);
    };
    add(x, k);
    if (r() < 0.3) add(x + 16, k + 12);                    // a close twin, as in the "Simple" artwork
  }
  return { svg, paths };
}
// "Complex" pattern: dense columns of repeating S kinks that tile into a weave.
function brandWeave(parent, { cols = 30, rows = 7, w = W, h = H, color = 'rgba(214,165,140,.18)', a = 1.6, b = 7 } = {}) {
  const svg = el(`<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:0;top:0;overflow:visible"></svg>`, parent);
  const sp = (w + 400) / cols, per = h / rows * 1.4;
  let d = '';
  for (let c = -2; c < cols + 2; c++) {
    for (let r = -1; r < rows + 2; r++) {
      const x = c * sp + (r % 2) * sp * 0.5 - 200, y = r * per * 0.72;
      d += brandLineD(x, y + per / 2, sp * 0.5, { h: y + per, top: y, a, b, kh: per * 0.5 }) + ' ';
    }
  }
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d); p.setAttribute('fill', color); svg.appendChild(p);
  return svg;
}
// Video A uses the new brand line wherever the old uniform kink lines were.
function kinkLines(parent, { n = 14, x0 = 0, x1 = W, h = H, color = 'rgba(214,165,140,.5)', width = 2, seed = 3, dx = 46 } = {}) {
  return brandPattern(parent, { n, x0, x1, h, color, seed, dx: dx * 1.5, a: width * 0.6, b: width * 3 });
}
function ambient(L, t0, t1, { color = 'rgba(214,165,140,.10)', glow = 'rgba(155,203,235,.10)', glow2 = 'rgba(214,165,140,.10)', seed = 2 } = {}) {
  const A = el('<div class="layer" style="overflow:hidden"></div>');
  L.insertBefore(A, L.firstChild);
  const g1 = el(`<div class="abs" style="left:-300px;top:-200px;width:1100px;height:1100px;border-radius:50%;background:radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 65%)"></div>`, A);
  const g2 = el(`<div class="abs" style="left:1100px;top:300px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle, ${glow2} 0%, rgba(0,0,0,0) 65%)"></div>`, A);
  const c = color.replace(/[\d.]+\)$/, (m) => `${Math.min(1, parseFloat(m) * 1.6)})`);
  const bp = brandPattern(A, { n: 16, x1: 2400, w: 2400, color: c, seed, dx: 80, a: 1.1, b: 5.5 });
  const d = t1 - t0;
  tl.fromTo(bp.svg, { x: 0 }, { x: -420, duration: d, ease: 'none', immediateRender: false }, t0);
  tl.fromTo(g1, { x: 0, y: 0 }, { x: 700, y: 260, duration: d, ease: 'sine.inOut', immediateRender: false }, t0);
  tl.fromTo(g2, { x: 0, y: 0 }, { x: -800, y: -380, duration: d, ease: 'sine.inOut', immediateRender: false }, t0);
  return A;
}
// Transition: brand lines drop through the frame, one after another (replaces the old stroke sweep).
function brandSweep(t, parent, { n = 9, color = 'rgba(214,165,140,.9)', dir = 1, seed = null } = {}) {
  const box = el('<div class="layer" style="pointer-events:none;overflow:hidden"></div>', parent || stage);
  gsap.set(box, { autoAlpha: 0 });
  const { paths } = brandPattern(box, { n, color, seed: seed == null ? Math.round(t * 10) : seed, dx: 90, a: 1.6, b: 8, kh: 200 });
  tl.set(box, { autoAlpha: 1 }, t);
  paths.forEach((p, i) => {
    const k = dir > 0 ? i : paths.length - 1 - i;
    tl.fromTo(p, { y: -H - 100 }, { y: H + 100, duration: 1.15, ease: 'power2.inOut', immediateRender: true }, t + k * 0.04);
  });
  tl.set(box, { autoAlpha: 0 }, t + 1.2 + n * 0.04);
}

// ---------- generated clips ----------
// gclip(parent, 'p2', t0, t1, {from, rate, fit, pos}) — plays clip `name` from source second `from` at `rate`;
// holds the first frame before t0 and the last frame after its end.
function gclip(parent, name, t0, t1, { rate = 1, from = 0, to = null, fit = 'cover', pos = 'center', style = '' } = {}) {
  const g = GEN[name];
  if (!g) throw new Error(`clip not prepared: ${name}`);
  const img = el(`<img src="${BLANK}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${pos};${style}">`, parent);
  CLIPS.push({ img, gen: name, a: from, b: to == null ? g.n / g.fps : to, t0, t1, rate, last: -1 });
  return img;
}
// Green-screen clip with app UI mapped onto the screen. `ui` is an element of size uw×uh (app pixels).
// Returns { box, ui, img }; box is the clip at native size, scaled to cover parent (pw×ph).
function gscreen(parent, name, t0, t1, ui, { uw = 390, uh = 844, rate = 1, from = 0, pw = W, ph = H, grow = 1.03, pos = [0.5, 0.5] } = {}) {
  const g = GEN[name];
  const s = Math.max(pw / g.w, ph / g.h);
  const box = el(`<div class="abs" style="left:${(pw - g.w * s) * pos[0]}px;top:${(ph - g.h * s) * pos[1]}px;width:${g.w}px;height:${g.h}px;transform:scale(${s});transform-origin:0 0;overflow:hidden"></div>`, parent);
  const holder = el(`<div class="abs" style="left:0;top:0;width:${uw}px;height:${uh}px;transform-origin:0 0;overflow:hidden"></div>`, box);
  holder.appendChild(ui);
  const img = el(`<img src="${BLANK}" style="position:absolute;left:0;top:0;width:${g.w}px;height:${g.h}px">`, box);
  const onFrame = (n) => {
    const q = g.quads[Math.min(g.quads.length, n) - 1];
    if (!q) { holder.style.visibility = 'hidden'; return; }
    holder.style.visibility = 'visible';
    const c = [0, 1].map(k => q.reduce((s2, p) => s2 + p[k], 0) / 4);
    const Q = q.map(p => [c[0] + (p[0] - c[0]) * grow, c[1] + (p[1] - c[1]) * grow]);
    holder.style.transform = homography(uw, uh, Q);
  };
  CLIPS.push({ img, gen: name, a: from, b: g.n / g.fps, t0, t1, rate, last: -1, onFrame });
  return { box, ui: holder, img };
}
// CSS matrix3d that maps the rect (0,0)-(w,h) onto quad [TL, TR, BR, BL].
function homography(w, h, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // unit square -> quad, then pre-scale the element's w×h into the unit square
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map(v => +v.toFixed(9)).join(',')})`;
}
// Replaces lib.js updateClips: handles both the project film (SHOT) and generated clips.
function updateClips(t) {
  const jobs = [];
  for (const c of CLIPS) {
    if (t < c.t0 - 0.2 || t > c.t1 + 0.2) continue;
    const src = Math.min(c.b, Math.max(c.a, c.a + (t - c.t0) * c.rate));
    let n, url;
    if (c.gen) {
      const g = GEN[c.gen];
      n = Math.min(g.n, Math.max(1, Math.floor(src * g.fps + 1e-6) + 1));
      url = `assets/clips/gen/${c.gen}/f${String(n).padStart(4, '0')}.${g.ext}`;
    } else {
      n = Math.min(3131, Math.max(1, Math.round(src * 30) + 1));
      url = `assets/clips/proj/f${String(n).padStart(5, '0')}.jpg`;
    }
    if (n !== c.last) {
      c.last = n;
      c.img.src = url;
      if (c.onFrame) c.onFrame(n);
      jobs.push(c.img.decode().catch(() => {}));
    }
  }
  return Promise.all(jobs);
}

// ---------- live app screens (the 31 ZOOD screens, 390×844 HTML pages in assets/ui) ----------
// A screen source is either an image path or 'ui:NN'. Live screens are iframes scaled into the phone,
// so text stays sharp and their parts can be animated on the film timeline once loaded (onUI).
window.READY_WAIT = window.READY_WAIT || [];
window.UI_ANIM = window.UI_ANIM || [];
const UIW = 390, UIH = 844;
function scrContent(src, sw, sh) {
  if (!src.startsWith('ui:')) return el(`<div class="scrw"><img src="${src}"></div>`);
  const id = src.slice(3);
  const s = Math.max(sw / UIW, sh / UIH);
  const w = el(`<div class="scrw" style="background:#F4EEE8"></div>`);
  const f = el(`<iframe src="assets/ui/${id}.html" scrolling="no" style="position:absolute;left:${(sw - UIW * s) / 2}px;top:${(sh - UIH * s) / 2}px;width:${UIW}px;height:${UIH}px;border:0;transform:scale(${s});transform-origin:0 0;pointer-events:none"></iframe>`, w);
  window.READY_WAIT.push(new Promise(res => f.addEventListener('load', async () => {
    try { await f.contentDocument.fonts.ready; await Promise.all([...f.contentDocument.images].map(i => i.decode().catch(() => {}))); } catch (e) {}
    res();
  }, { once: true })));
  w.ifr = f;
  return w;
}
// Run fn(doc, q) after the screen's page has loaded: q(sel) → first match, q.all(sel) → all matches.
function onUI(w, fn) {
  window.UI_ANIM.push(() => {
    const d = w.ifr.contentDocument;
    const q = (s) => d.querySelector(s); q.all = (s) => [...d.querySelectorAll(s)];
    fn(d, q);
  });
}
// Element whose own text matches exactly (for counting up numbers inside a screen).
function uiText(d, txt) {
  return [...d.querySelectorAll('body *')].find(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim() === txt));
}
function uiCount(d, txt, t, dur = 1.2, from = 0) {
  const e = uiText(d, txt); if (!e) throw new Error('ui text not found: ' + txt);
  const n = [...e.childNodes].find(c => c.nodeType === 3 && c.textContent.trim() === txt);
  const target = parseFloat(txt.replace(/[^0-9.]/g, '')), dec = (txt.split('.')[1] || '').replace(/[^0-9]/g, '').length;
  const fmt = (v) => txt.replace(/[0-9][0-9,]*(\.[0-9]+)?/, dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'));
  const o = { v: from };
  tl.fromTo(o, { v: from }, { v: target, duration: dur, ease: 'power2.out', immediateRender: true, onUpdate: () => { n.textContent = fmt(o.v); } }, t);
}
// Staggered rise-in of items inside a screen.
function uiRise(els, t, { stagger = 0.08, y = 24, dur = 0.5 } = {}) {
  els.forEach((e, i) => tl.fromTo(e, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, ease: 'power3.out', immediateRender: true }, t + i * stagger));
}
function phone(src, { w = 420, x = 960, y = 540, parent = stage } = {}) {
  const f = Math.round(w * 0.013), b = Math.round(w * 0.03);
  const sw = w - 2 * (f + b), sh = Math.round(sw / SCREEN_ASPECT);
  const h = sh + 2 * (f + b);
  const R = w * 0.17;
  const p = el(`<div class="phone" style="width:${w}px;height:${h}px;left:${x - w / 2}px;top:${y - h / 2}px"></div>`, parent);
  for (let i = 1; i <= 9; i++) el(`<div class="ph-edge" style="border-radius:${R}px;transform:translateZ(${-i * 1.4}px)"></div>`, p);
  const body = el(`<div class="ph-body" style="border-radius:${R}px"></div>`, p);
  const bez = el(`<div class="ph-bezel" style="left:${f}px;top:${f}px;right:${f}px;bottom:${f}px;border-radius:${R - f}px"></div>`, body);
  const scr = el(`<div class="ph-screen" style="left:${b}px;top:${b}px;width:${sw}px;height:${sh}px;border-radius:${R - f - b}px"></div>`, bez);
  el(`<div class="ph-island" style="top:${sh * 0.012 + b}px;width:${sw * 0.3}px;height:${sw * 0.085}px"></div>`, bez);
  el(`<div class="ph-glare"></div>`, scr);
  const sheen = el(`<div class="ph-sheen" style="left:-60%"></div>`, scr);
  el(`<div class="ph-btn" style="left:-4px;top:${h * .2}px;width:5px;height:${h * .05}px"></div>`, p);
  el(`<div class="ph-btn" style="left:-4px;top:${h * .29}px;width:5px;height:${h * .085}px"></div>`, p);
  el(`<div class="ph-btn" style="left:-4px;top:${h * .395}px;width:5px;height:${h * .085}px"></div>`, p);
  el(`<div class="ph-btn" style="right:-4px;top:${h * .32}px;width:5px;height:${h * .12}px"></div>`, p);
  const cur = scrContent(src, sw, sh);
  scr.insertBefore(cur, scr.firstChild);
  Object.assign(p, { scr, sheen, cur, sw, sh, pw: w, phh: h });
  return p;
}
function swap(p, src, t, mode = 'push') {
  const img = scrContent(src, p.sw, p.sh);
  p.scr.insertBefore(img, p.scr.querySelector('.ph-glare'));
  const old = p.cur;
  if (mode === 'push') {
    tl.fromTo(img, { xPercent: 100 }, { xPercent: 0, duration: 0.75, ease: 'power3.inOut', immediateRender: true }, t);
    tl.fromTo(old, { xPercent: 0, filter: 'brightness(1)' }, { xPercent: -30, filter: 'brightness(.6)', duration: 0.75, ease: 'power3.inOut', immediateRender: false }, t);
  } else {
    tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none', immediateRender: true }, t);
  }
  p.cur = img;
  return img;
}
// Text that changes at given times: pairs [[t, text], ...] (deterministic under seeking).
function uiTextAt(e, pairs, tEnd) {
  const node = [...e.childNodes].find(c => c.nodeType === 3 && c.textContent.trim()) || e.firstChild;
  const t0 = pairs[0][0];
  tl.fromTo({}, { p: 0 }, { p: 1, duration: tEnd - t0, ease: 'none', immediateRender: false, onUpdate: () => {
    const now = tl.time(); let txt = pairs[0][1];
    for (const [t, s] of pairs) if (now >= t) txt = s;
    node.textContent = txt;
  } }, t0);
}
