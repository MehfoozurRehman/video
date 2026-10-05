// Shared helpers for the ZOOD film. Everything is driven by one paused GSAP
// timeline (`tl`) so any frame can be rendered deterministically via __seek(t).

const W = 1920, H = 1080;
const SCREEN_ASPECT = 0.46;            // width / height of the app screenshots
const tl = gsap.timeline({ paused: true });
const stage = document.getElementById('stage');
const A = (p) => `assets/${p}`;
const SCR = (n) => A(`screens/${n}`);
const PH = (n) => A(`photos/${n}`);

const EASE = 'power3.out', EASE_IO = 'power2.inOut', EASE_IN = 'power2.in';

function el(html, parent) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  const e = t.content.firstElementChild;
  if (parent) parent.appendChild(e);
  return e;
}

function layer(cls = '', parent = stage) {
  const e = el(`<div class="layer ${cls}"></div>`, parent);
  gsap.set(e, { autoAlpha: 0 });
  return e;
}

// Fade a layer in at tIn and out at tOut.
function show(e, tIn, tOut, fin = 0.7, fout = 0.7) {
  tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: fin, ease: 'none', immediateRender: false }, tIn);
  if (tOut != null) tl.to(e, { autoAlpha: 0, duration: fout, ease: 'none' }, tOut);
}
function cut(e, tIn, tOut) {
  tl.set(e, { autoAlpha: 1 }, tIn);
  if (tOut != null) tl.set(e, { autoAlpha: 0 }, tOut);
}

// ---------- deterministic random ----------
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ---------- text ----------
// text: string; "|" forces a line break; words wrapped in [..] get the rose-gold treatment.
function text(str, cls, style = '', parent) {
  const lines = str.split('|').map(line => {
    const parts = line.trim().match(/\[[^\]]+\]|\S+/g) || [];
    return '<span class="line">' + parts.map((p, i) => {
      const rose = p.startsWith('[');
      const words = rose ? p.slice(1, -1).split(' ') : [p];
      return words.map((w, j) => `<span class="w${rose ? ' rose' : ''}">${w}${(j < words.length - 1 || i < parts.length - 1) ? ' ' : ''}</span>`).join('');
    }).join('') + '</span>';
  }).join('');
  const e = el(`<div class="abs ${cls}" style="${style}">${lines}</div>`, parent);
  gsap.set(e, { autoAlpha: 0 });
  return e;
}

// Word-by-word blur reveal.
function reveal(e, t, { stagger = 0.07, dur = 1.0, y = 36, blur = 14 } = {}) {
  tl.set(e, { autoAlpha: 1 }, t);
  tl.fromTo(e.querySelectorAll('.w'), { opacity: 0, y, filter: `blur(${blur}px)` },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, stagger, ease: EASE, immediateRender: false }, t);
  return e;
}
// Reveal lines individually at given times.
function revealLines(e, times, opts = {}) {
  tl.set(e, { autoAlpha: 1 }, times[0]);
  e.querySelectorAll('.line').forEach((ln, i) => {
    const ws = ln.querySelectorAll('.w');
    tl.fromTo(ws, { opacity: 0, y: opts.y ?? 36, filter: `blur(${opts.blur ?? 14}px)` },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: opts.dur ?? 1.0, stagger: opts.stagger ?? 0.06, ease: EASE, immediateRender: false }, times[i] ?? times[times.length - 1]);
  });
  return e;
}
function hide(e, t, dur = 0.6, y = -24) {
  tl.to(e, { autoAlpha: 0, y: `+=${y}`, filter: 'blur(10px)', duration: dur, ease: EASE_IN }, t);
}
// Mark the current item of a list as active (others dimmed).
function focusLine(e, idx, t, dimTo = 0.32) {
  e.querySelectorAll('.line').forEach((ln, i) => {
    tl.to(ln, { opacity: i === idx ? 1 : dimTo, duration: 0.45, ease: EASE_IO }, t);
  });
}

// Counter: animates the text of `e` from a to b.
function count(e, a, b, t, dur, fmt = (v) => Math.round(v).toString()) {
  const o = { v: a };
  tl.fromTo(o, { v: a }, { v: b, duration: dur, ease: 'power2.out', immediateRender: false,
    onUpdate: () => { e.textContent = fmt(o.v); } }, t);
  e.textContent = fmt(a);
}

// ---------- images ----------
function photo(src, { x = 0, y = 0, w = W, h = H, radius = 0, pos = 'center', cls = '' } = {}, parent) {
  return el(`<div class="photo ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${radius}px;background-image:url('${src}');background-position:${pos}"></div>`, parent);
}
// A crop of a screenshot (fractions of the image) rendered at a given width.
function crop(src, [x0, y0, x1, y1], width, { radius = 22, aspect = SCREEN_ASPECT, cls = '', style = '' } = {}, parent) {
  const imgW = width / (x1 - x0), imgH = imgW / aspect;
  const h = (y1 - y0) * imgH;
  const c = el(`<div class="crop ${cls}" style="width:${width}px;height:${h}px;border-radius:${radius}px;${style}">
      <img src="${src}" style="width:${imgW}px;height:${imgH}px;left:${-x0 * imgW}px;top:${-y0 * imgH}px"></div>`, parent);
  c._w = width; c._h = h;
  return c;
}
function kenburns(e, t0, t1, from = 1.12, to = 1.0, extra = {}) {
  tl.fromTo(e, { scale: from, ...extra.from }, { scale: to, ...extra.to, duration: t1 - t0, ease: 'none', immediateRender: false }, t0);
}

// ---------- phone ----------
// Realistic iPhone mockup. (x, y) is the phone centre in the parent layer.
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
  // side buttons
  el(`<div class="ph-btn" style="left:-4px;top:${h * .2}px;width:5px;height:${h * .05}px"></div>`, p);
  el(`<div class="ph-btn" style="left:-4px;top:${h * .29}px;width:5px;height:${h * .085}px"></div>`, p);
  el(`<div class="ph-btn" style="left:-4px;top:${h * .395}px;width:5px;height:${h * .085}px"></div>`, p);
  el(`<div class="ph-btn" style="right:-4px;top:${h * .32}px;width:5px;height:${h * .12}px"></div>`, p);
  const img = el(`<div class="scrw"><img src="${src}"></div>`);
  scr.insertBefore(img, scr.firstChild);
  Object.assign(p, { scr, sheen, cur: img, sw, sh, pw: w, phh: h });
  return p;
}
// Push-navigate to a new screen inside a phone.
function swap(p, src, t, mode = 'push') {
  const img = el(`<div class="scrw"><img src="${src}"></div>`);
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
// Overlay on the current screen (moves with it), positioned in screen fractions.
function ov(p, html, [x, y, w, h], style = '') {
  return el(`<div class="ov" style="left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${h * 100}%;${style}">${html}</div>`, p.cur);
}
function tap(p, fx, fy, t) {
  const r = el(`<div class="ripple" style="left:${fx * 100}%;top:${fy * 100}%"></div>`, p.scr);
  gsap.set(r, { autoAlpha: 0 });
  tl.fromTo(r, { autoAlpha: 0.95, scale: 0.3 }, { autoAlpha: 0, scale: 1.6, duration: 0.7, ease: 'power2.out', immediateRender: false }, t);
}
function sheen(p, t, dur = 1.4) {
  tl.fromTo(p.sheen, { left: '-60%' }, { left: '130%', duration: dur, ease: 'power2.inOut', immediateRender: false }, t);
}

// ---------- brand lines ----------
// The S-curve lifted from the ZOOD symbol.
const CURVE_D = 'M -40 760 C 260 760 420 600 640 520 S 1080 420 1280 340 S 1700 200 1980 120';
function strokeDraw(path, t, dur, ease = 'power2.inOut') {
  const L = path.getTotalLength();
  gsap.set(path, { strokeDasharray: L, strokeDashoffset: L });
  tl.fromTo(path, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease, immediateRender: false }, t);
}
// Vertical lines with the brand kink (the "Line / Simple" graphic element).
function kinkLines(parent, { n = 14, x0 = 0, x1 = W, h = H, color = 'rgba(214,165,140,.5)', width = 2, seed = 3, dx = 46 } = {}) {
  const r = rng(seed);
  const svg = el(`<svg class="abs lines" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" style="left:0;top:0"></svg>`, parent);
  const paths = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / n;
    const k = h * (0.25 + 0.5 * r());
    const d = (r() > 0.5 ? 1 : -1) * dx;
    const dd = `M ${x} -10 V ${k} C ${x} ${k + 50} ${x + d} ${k + 40} ${x + d} ${k + 100} V ${h + 10}`;
    const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pth.setAttribute('d', dd); pth.setAttribute('stroke', color); pth.setAttribute('stroke-width', width);
    svg.appendChild(pth); paths.push(pth);
  }
  return { svg, paths };
}

const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

// ---------- VO cue lookup (VO comes from vo.js) ----------
const _norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
const _VOW = (typeof VO !== 'undefined' ? VO : []).map(v => _norm(v[0]));
function _find(phrase, k = 1) {
  const p = _norm(phrase).split(' ');
  let c = 0;
  for (let i = 0; i + p.length <= _VOW.length; i++) {
    if (p.every((x, j) => _VOW[i + j] === x) && ++c === k) return i;
  }
  throw new Error(`VO phrase not found: "${phrase}" #${k}`);
}
// start time of a spoken phrase (kth occurrence) / end time of its last word
const at = (phrase, k = 1) => VO[_find(phrase, k)][1];
const after = (phrase, k = 1) => VO[_find(phrase, k) + _norm(phrase).split(' ').length - 1][2];

// ---------- extra motion ----------
// Apple-style masked rise: each line clips, words slide up from below.
function rise(e, t, { stagger = 0.05, dur = 0.85, lineGap = null } = {}) {
  tl.set(e, { autoAlpha: 1 }, t);
  e.querySelectorAll('.line').forEach((ln, i) => {
    ln.style.overflow = 'hidden'; ln.style.paddingBottom = '0.12em'; ln.style.marginBottom = '-0.12em';
    tl.fromTo(ln.querySelectorAll('.w'), { yPercent: 115, opacity: 1 }, { yPercent: 0, duration: dur, stagger, ease: 'power4.out', immediateRender: true },
      t + (lineGap == null ? i * 0.12 : (Array.isArray(lineGap) ? lineGap[i] - t : i * lineGap)));
  });
  return e;
}
// Draw every stroke of an SVG (paths, rects, circles, lines, polylines).
function drawAll(svg, t, dur = 1.2, stagger = 0.04, ease = 'power2.inOut') {
  [...svg.querySelectorAll('path,rect,circle,line,polyline,ellipse')].filter(n => !n.hasAttribute('data-nodraw')).forEach((n, i) => {
    const L = n.getTotalLength ? n.getTotalLength() : 400;
    gsap.set(n, { strokeDasharray: L + 1, strokeDashoffset: L + 1 });
    tl.fromTo(n, { strokeDashoffset: L + 1 }, { strokeDashoffset: 0, duration: dur, ease, immediateRender: false }, t + i * stagger);
  });
}
// Slow camera drift on a layer's content.
function drift(e, t0, t1, from = 1.0, to = 1.045, x = 0) {
  tl.fromTo(e, { scale: from, x: 0 }, { scale: to, x, duration: t1 - t0, ease: 'none', immediateRender: false }, t0);
}
// Line-art helper: inline SVG on the stage.
function svgEl(inner, { x = 0, y = 0, w = W, h = H, vb = null, stroke = '#D6A58C', sw = 2, style = '' } = {}, parent) {
  const s = el(`<svg class="abs" width="${w}" height="${h}" viewBox="${vb || `0 0 ${w} ${h}`}" style="left:${x}px;top:${y}px;overflow:visible;${style}">
    <g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`, parent);
  return s;
}

// ---------- continuity helpers ----------
// A layer with an explicit stacking order (z): chapters 0, frame 20, finale 40, hero phone 50, portals 60, labels 90.
function zlayer(z, cls = '') { const e = layer(cls); e.style.zIndex = z; return e; }
// On-stage rect of a phone's screen when it sits flat (no rotation) centred at (x, y) with scale s.
function screenRect(p, x, y = 540, s = 1) {
  const w = p.sw * s, h = p.sh * s, R = p.pw * 0.17, f = Math.round(p.pw * 0.013), b = Math.round(p.pw * 0.03);
  return { l: x - w / 2, t: y - h / 2, w, h, r: (R - f - b) * s };
}
const insetFor = (r) => `inset(${r.t}px ${W - r.l - r.w}px ${H - r.t - r.h}px ${r.l}px round ${r.r}px)`;
const FULL = 'inset(0px 0px 0px 0px round 0px)';
// Full-frame layer grows out of a rect (e.g. the phone screen) / shrinks back into one.
function portalOpen(e, t, rect, dur = 0.9) {
  tl.set(e, { autoAlpha: 1 }, t);
  tl.fromTo(e, { clipPath: insetFor(rect) }, { clipPath: FULL, duration: dur, ease: 'power3.inOut', immediateRender: false }, t);
}
function portalClose(e, t, rect, dur = 0.9, from = FULL) {
  tl.fromTo(e, { clipPath: from }, { clipPath: insetFor(rect), duration: dur, ease: 'power3.inOut', immediateRender: false }, t);
  tl.to(e, { autoAlpha: 0, duration: 0.2, ease: 'none' }, t + dur - 0.2);
}

// ---------- live footage (frame sequence of the ZOOD project film, 30 fps) ----------
// Shot list: [in, out] seconds in the project film.
const SHOT = {
  sunrise: [0.2, 6.0], haze: [6.6, 11.3], aerial: [11.6, 17.0], frontal: [17.3, 22.8], street: [23.1, 28.4], bench: [28.7, 31.0],
  boulevard: [31.2, 34.6], garden: [34.9, 40.3], arcade: [40.6, 46.1], window: [46.4, 51.6], pergola: [51.9, 57.4], kids: [57.7, 60.1],
  reflection: [60.3, 66.0], pool: [66.3, 71.9], interior: [72.1, 74.6], dusk: [74.9, 80.3], facade: [80.5, 83.1], dining: [83.4, 85.9],
  pavilion: [86.2, 90.7], swim: [90.9, 94.6], night: [94.9, 103.4],
};
const CLIPS = [];
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
// Footage element filling its parent. Plays shot `name` from timeline t0 (until t1) at `rate`; holds the last frame.
function vclip(parent, name, t0, t1, { rate = 1, from = 0, pos = 'center', style = '' } = {}) {
  const [a, b] = SHOT[name];
  const img = el(`<img src="${BLANK}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};${style}">`, parent);
  CLIPS.push({ img, a: a + from, b, t0, t1, rate, last: -1 });
  return img;
}
// Called from __seek: point every active clip at the right frame and wait for decode.
function updateClips(t) {
  const jobs = [];
  for (const c of CLIPS) {
    if (t < c.t0 - 0.2 || t > c.t1 + 0.2) continue;
    const src = Math.min(c.b, Math.max(c.a, c.a + (t - c.t0) * c.rate));
    const n = Math.min(3131, Math.max(1, Math.round(src * 30) + 1));
    if (n !== c.last) {
      c.last = n;
      c.img.src = `assets/clips/proj/f${String(n).padStart(5, '0')}.jpg`;
      jobs.push(c.img.decode().catch(() => {}));
    }
  }
  return Promise.all(jobs);
}

// Ambient motion for plain backgrounds: drifting brand lines + two slow light glows.
function ambient(L, t0, t1, { color = 'rgba(214,165,140,.10)', glow = 'rgba(155,203,235,.10)', glow2 = 'rgba(214,165,140,.10)', seed = 2 } = {}) {
  const A = el('<div class="layer" style="overflow:hidden"></div>');
  L.insertBefore(A, L.firstChild);
  const g1 = el(`<div class="abs" style="left:-300px;top:-200px;width:1100px;height:1100px;border-radius:50%;background:radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 65%)"></div>`, A);
  const g2 = el(`<div class="abs" style="left:1100px;top:300px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle, ${glow2} 0%, rgba(0,0,0,0) 65%)"></div>`, A);
  const kl = kinkLines(A, { n: 18, color, width: 1.6, seed, dx: 46 });
  kl.svg.style.width = '2400px'; kl.svg.setAttribute('width', 2400);
  const d = t1 - t0;
  tl.fromTo(kl.svg, { x: 0 }, { x: -420, duration: d, ease: 'none', immediateRender: false }, t0);
  tl.fromTo(g1, { x: 0, y: 0 }, { x: 700, y: 260, duration: d, ease: 'sine.inOut', immediateRender: false }, t0);
  tl.fromTo(g2, { x: 0, y: 0 }, { x: -800, y: -380, duration: d, ease: 'sine.inOut', immediateRender: false }, t0);
  return A;
}
