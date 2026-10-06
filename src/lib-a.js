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
