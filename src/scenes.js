// ZOOD app film v2 — full timeline. Every cue is tied to a spoken phrase via at()/after()
// (word timings in vo.js, force-aligned to assets/audio/vo-edit.wav: pauses tightened, 1.1× tempo).

// ---------------------------------------------------------------- helpers
const ctext = (s, cls, top, parent, extra = '') => text(s, cls, `left:0;width:${W}px;top:${top}px;text-align:center;${extra}`, parent);
const ltext = (s, cls, left, top, parent, extra = '') => text(s, cls, `left:${left}px;top:${top}px;${extra}`, parent);

function swapWords(list, parent, mk, { useRise = false } = {}) {
  const els = list.map(([s]) => mk(s));
  els.forEach((e, i) => {
    useRise ? rise(e, list[i][1], { stagger: 0.04, dur: 0.6 }) : reveal(e, list[i][1], { stagger: 0.04, dur: 0.7 });
    if (i < list.length - 1) hide(e, list[i + 1][1] - 0.1, 0.3, -18);
  });
  return els;
}
function chapterTitle(word, t, { left = null, top = 440, parent, color = 'cream', hold = 0.75 } = {}) {
  const e = left == null ? ctext(word, `h0 ${color}`, top, parent, 'letter-spacing:.04em')
                         : ltext(word, `h0 ${color}`, left, top, parent, 'letter-spacing:.04em');
  rise(e, t, { stagger: 0.02, dur: 0.7 });
  tl.to(e, { autoAlpha: 0, filter: 'blur(14px)', duration: 0.35, ease: EASE_IN }, t + hold);
}
const chapterLabels = [];
const chapterLabel = (num, word, tIn, tOut, color = 'cream') => chapterLabels.push([num, word, tIn, tOut, color]);

function chip(html, x, y, parent, cls = '') {
  const c = el(`<div class="chip ${cls}" style="left:${x}px;top:${y}px">${html}</div>`, parent);
  gsap.set(c, { autoAlpha: 0 });
  return c;
}
function pop(e, t, from = { y: 30, scale: 0.92 }) {
  tl.fromTo(e, { autoAlpha: 0, filter: 'blur(8px)', ...from }, { autoAlpha: 1, filter: 'blur(0px)', y: 0, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', immediateRender: false }, t);
  return e;
}
function out(e, t, dur = 0.4) { tl.to(e, { autoAlpha: 0, filter: 'blur(8px)', duration: dur, ease: EASE_IN }, t); }
function pose(p, t, { x, y = 540, ry = 0, rx = 0, rz = 0, s = 1, dur = 0.9, ease = 'power3.inOut' } = {}) {
  const v = { rotationY: ry, rotationX: rx, rotationZ: rz, scale: s, duration: dur, ease };
  if (x != null) { v.left = x - p.pw / 2; v.top = y - p.phh / 2; }
  tl.to(p, v, t);
}
function setPose(p, { x, y = 540, ry = 0, rx = 0, rz = 0, s = 1 }) {
  gsap.set(p, { left: x - p.pw / 2, top: y - p.phh / 2, rotationY: ry, rotationX: rx, rotationZ: rz, scale: s, transformPerspective: 2600 });
}
// Same as setPose but applied on the timeline at time t (for mid-film repositioning).
function setPoseAt(p, t, { x, y = 540, ry = 0, rx = 0, rz = 0, s = 1 }) {
  tl.set(p, { left: x - p.pw / 2, top: y - p.phh / 2, rotationY: ry, rotationX: rx, rotationZ: rz, scale: s }, t);
}
function photoCard(src, { x, y, w, h, radius = 32, pos = 'center' }, parent) {
  const c = el(`<div class="tile" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${radius}px;box-shadow:0 40px 90px rgba(0,0,0,.35)"></div>`, parent);
  c.ph = photo(src, { w, h, pos }, c);
  return c;
}
// Brand-line sweep: kinked rose lines race across the frame (chapter transition).
function lineSweep(t, parent, { n = 9, color = 'rgba(214,165,140,.85)', dir = 1 } = {}) {
  const box = el('<div class="layer" style="pointer-events:none"></div>', parent || stage);
  gsap.set(box, { autoAlpha: 0 });
  const { paths } = kinkLines(box, { n, color, width: 2.2, seed: Math.round(t * 10), dx: 60 });
  tl.set(box, { autoAlpha: 1 }, t);
  paths.forEach((p, i) => {
    const L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: `${L * 0.35} ${L}`, strokeDashoffset: L * 0.35 });
    tl.fromTo(p, { strokeDashoffset: L * 0.35 }, { strokeDashoffset: -L, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, t + (dir > 0 ? i : n - i) * 0.035);
  });
  tl.set(box, { autoAlpha: 0 }, t + 1.3);
}
const ROSE_GRAD_SVG = `<defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#7a4e40"/><stop offset=".5" stop-color="#E6BFA4"/><stop offset="1" stop-color="#A27063"/></linearGradient></defs>`;

// =====================================================================
// S1+S2 — one continuous frame: "Luxury." → copper iris → photo card → arch → full-bleed reception
// =====================================================================
{
  const TB = at('but luxury'), TM = at('more presence'), T0 = at('because true luxury'), TH = at('and that is exactly'),
    TW = at('that is why'), TX = at('it is an experience'), T1 = at('traditionally');
  // navy opening
  const L = layer('bg-navy'); show(L, 0, null, 1.0);
  tl.set(L, { autoAlpha: 0 }, T0 + 1.2);
  const D = el('<div class="layer"></div>', L); drift(D, 0, TB + 0.5, 1.0, 1.05);
  const svg = el(`<svg class="abs" width="1920" height="1080" style="left:0;top:0">${ROSE_GRAD_SVG}<path d="${CURVE_D}" fill="none" stroke="url(#rg)" stroke-width="2.5"/></svg>`, D);
  strokeDraw(svg.querySelector('path'), 0.2, 2.6);
  const lux = ctext('Luxury.', 'h0 cream', 440, D, 'font-size:190px');
  reveal(lux, 0.05, { stagger: 0, dur: 1.4, blur: 30, y: 16 });
  tl.fromTo(lux, { letterSpacing: '0.14em' }, { letterSpacing: '0.02em', duration: 3.6, ease: 'power2.out', immediateRender: false }, 0.05);
  const sub = ctext('Always at the heart of [ZOOD.]', 'h3 cream', 680, D, 'opacity:.85');
  rise(sub, at('it has always'));
  // the period of "Luxury." opens into copper (iris)
  const PX = 1250, PY = 572;
  tl.to(lux, { scale: 1.25, transformOrigin: `${PX}px ${PY - 440}px`, autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, TB - 0.3);
  tl.to([sub, svg], { autoAlpha: 0, duration: 0.4 }, TB - 0.3);

  // "More ___" (navy-soft) sits underneath
  const Ls = layer('bg-navy-soft'); show(Ls, TM - 0.4, null, 0.3);
  tl.set(Ls, { autoAlpha: 0 }, T0 + 1.2);
  rise(ltext('[More]', 'h1', 170, 350, Ls, 'font-size:110px'), TM);
  const words = [['presence.', at('presence')], ['living.', at('living')], ['personalization.', at('personalization')], ['comfort.', at('comfort')], ['time for what|truly matters.', at('time for what')]];
  const ws = swapWords(words, Ls, (s) => ltext(s, 'h1 cream', 170, 480, Ls, 'font-size:96px'), { useRise: true });
  hide(ws[4], T0 - 0.35, 0.35); hide(Ls.children[0], T0 - 0.35, 0.35);
  const pl = el('<div class="abs" style="left:172px;top:700px;width:560px;height:2px;background:rgba(214,165,140,.25)"><div class="f" style="height:100%;width:100%;background:#D6A58C;transform-origin:0 50%"></div></div>', Ls);
  tl.fromTo(pl.querySelector('.f'), { scaleX: 0 }, { scaleX: 1, duration: T0 - TM, ease: 'none', immediateRender: true }, TM);
  tl.to(pl, { autoAlpha: 0, duration: 0.3 }, T0 - 0.35);

  // cream world slides up with the kinked brand edge
  const C2 = el('<div class="layer bg-cream"></div>', stage);
  gsap.set(C2, { autoAlpha: 0 });
  el(`<svg class="abs" width="1920" height="140" style="left:0;top:-139px"><path d="M0 140 L0 70 L860 70 C930 70 930 0 1000 0 L1920 0 L1920 140 Z" fill="#FBF7F3"/></svg>`, C2);
  tl.set(C2, { autoAlpha: 1 }, T0 - 0.35);
  tl.fromTo(C2, { y: 1240 }, { y: 0, duration: 0.85, ease: 'power3.inOut', immediateRender: false }, T0 - 0.35);
  tl.set(C2, { autoAlpha: 0 }, TX + 1.0);
  const t1 = ltext('True luxury is not about|having more things.', 'h2 navy', 170, 380, C2);
  rise(t1, T0 + 0.1, { lineGap: [T0 + 0.1, at('having more things')] }); hide(t1, at('it is about having') - 0.25, 0.35);
  const t2 = ltext('It is about having more of|[what is designed around you.]', 'h2 navy', 170, 380, C2);
  rise(t2, at('it is about having'), { lineGap: [at('it is about having'), at('what is designed')] }); hide(t2, TH - 0.25, 0.35);
  const h1 = ltext('That is exactly what', 'h3 navy', 170, 360, C2, 'opacity:.7');
  const h2 = ltext('happiness', 'h0 navy', 160, 430, C2);
  const h3 = ltext('[means.]', 'h2', 170, 620, C2);
  rise(h1, TH); rise(h2, at('happiness'), { stagger: 0 }); rise(h3, at('means'));
  [h1, h2, h3].forEach(e => hide(e, TW - 0.25, 0.35));
  const pr = ltext('At [ZOOD,] luxury is|not a promise on paper.', 'h2 navy', 170, 420, C2);
  rise(pr, TW + 0.1, { lineGap: [TW + 0.1, at('not a promise')] }); hide(pr, TX - 0.45, 0.3);

  // THE FRAME — one element that travels: card → arch → full screen
  const FRL = zlayer(20); show(FRL, TM - 0.4, null, 0.01);
  const fr = el('<div class="abs" style="left:1080px;top:110px;width:680px;height:860px;border-radius:40px;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,.45)"></div>', FRL);
  const img = (src, pos = 'center') => el(`<div class="abs" style="inset:0;background:url('${PH(src)}') ${pos}/cover"></div>`, fr);
  const seq = [['city-view.jpg', null], ['walk-wide.jpg', at('living'), '62% 50%'], ['wood-wall.jpg', at('personalization')], ['corridor.jpg', at('comfort')],
    ['copper-wall.jpg', at('time for what')], ['walk-portrait.jpg', TH - 0.1], ['letter.jpg', TW - 0.1, '32% 50%'], ['reception.jpg', TX - 0.5]];
  seq.forEach(([src, t, pos]) => {
    const im = img(src, pos || 'center');
    if (t != null) tl.fromTo(im, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut', immediateRender: true }, t - 0.1);
    kenburns(im, t == null ? TM : t - 0.1, (t == null ? TM : t) + 3.2, 1.18, 1.03);
  });
  const shade = el('<div class="abs" style="inset:0;background:linear-gradient(90deg,rgba(2,12,31,.8),rgba(2,12,31,.2) 60%,rgba(2,12,31,0)),linear-gradient(180deg,rgba(2,12,31,0) 40%,rgba(2,12,31,.7))"></div>', fr);
  const navy = el('<div class="abs" style="inset:0;background:#041E42"></div>', fr);
  gsap.set([shade, navy], { autoAlpha: 0 });
  tl.fromTo(fr, { rotationY: -6, transformPerspective: 2000 }, { rotationY: 4, duration: T0 - TM, ease: 'none', immediateRender: false }, TM);
  // card → arch
  tl.to(fr, { left: 1120, top: 120, width: 620, height: 840, rotationY: 0, borderTopLeftRadius: 310, borderTopRightRadius: 310, borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    boxShadow: '0 40px 90px rgba(80,50,30,.25)', duration: 0.9, ease: 'power3.inOut' }, T0 - 0.35);
  // arch → full screen
  tl.to(fr, { left: 0, top: 0, width: 1920, height: 1080, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, duration: 0.9, ease: 'power3.inOut' }, TX - 0.4);
  tl.to(shade, { autoAlpha: 1, duration: 0.8 }, TX - 0.2);
  // push in and dissolve to navy → "Traditionally"
  tl.to(fr, { scale: 1.12, duration: 1.0, ease: 'power2.in' }, T1 - 0.5);
  tl.to(navy, { autoAlpha: 1, duration: 0.8, ease: 'power1.in' }, T1 - 0.45);
  tl.set(FRL, { autoAlpha: 0 }, T1 + 0.4);
  const RT = zlayer(25); show(RT, TX - 0.2, T1 - 0.4, 0.3, 0.3);
  rise(ltext('It is an experience|[you live.]', 'h1 cream', 140, 690, RT), TX, { lineGap: [TX, at('you live')] });

  // copper: opens from the period, then shrinks into the card
  const Lc = zlayer(22); gsap.set(Lc, { autoAlpha: 0 });
  const cp = photo(PH('copper.jpg'), {}, Lc);
  el('<div class="layer shade-all"></div>', Lc);
  tl.set(Lc, { autoAlpha: 1 }, TB - 0.3);
  tl.fromTo(Lc, { clipPath: `circle(0px at ${PX}px ${PY}px)` }, { clipPath: `circle(2300px at ${PX}px ${PY}px)`, duration: 1.0, ease: 'power3.in', immediateRender: false }, TB - 0.3);
  tl.set(Lc, { clipPath: FULL }, TB + 0.71);
  kenburns(cp, TB - 0.3, TM + 0.5, 1.25, 1.05, { from: { rotation: -2 }, to: { rotation: 0 } });
  const det = ctext('In every [detail.]', 'h1 cream', 480, Lc);
  rise(det, at('in every detail')); hide(det, TM - 0.45, 0.3);
  tl.to(Lc, { clipPath: 'inset(110px 160px 110px 1080px round 40px)', duration: 0.8, ease: 'power3.inOut' }, TM - 0.4);
  tl.to(Lc, { autoAlpha: 0, duration: 0.3 }, TM + 0.35);
}

// =====================================================================
// S3  "Traditionally … in one place?"  + skyline "We build communities."
// =====================================================================
const ICONS = {
  doc: '<rect x="14" y="6" width="44" height="58" rx="4"/><path d="M22 20h28M22 30h28M22 40h20M22 50h24"/>',
  folder: '<path d="M6 18h22l6 7h30v35H6z"/><path d="M6 30h58"/>',
  stamp: '<path d="M27 8h18v20l8 8v8H19v-8l8-8z"/><path d="M14 52h44v8H14z"/>',
  sheet: '<rect x="6" y="10" width="60" height="50" rx="3"/><path d="M6 24h60M6 38h60M26 10v50M46 10v50"/>',
  chart: '<path d="M8 62h58M14 54V36M28 54V22M42 54V30M56 54V12"/>',
  calc: '<rect x="14" y="6" width="44" height="60" rx="5"/><rect x="21" y="13" width="30" height="12" rx="2"/><path d="M23 35h4M35 35h4M47 35h4M23 46h4M35 46h4M47 46h4M23 57h4M35 57h16"/>',
  chat: '<path d="M8 12h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H26l-12 10v-10H8a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z"/><path d="M16 26h28M16 34h18"/>',
  mail: '<rect x="6" y="14" width="60" height="42" rx="4"/><path d="M6 18l30 20 30-20"/>',
  phone: '<path d="M18 8h12l5 14-8 5c4 9 9 14 18 18l5-8 14 5v12c0 3-3 6-6 6C30 60 12 42 12 14c0-3 3-6 6-6z"/>',
  stairs: '<path d="M6 62h14V48h14V34h14V20h14V6"/>',
  clock: '<circle cx="36" cy="36" r="27"/><path d="M36 18v18l12 8"/>',
  loop: '<path d="M14 36a22 22 0 0 1 40-12M58 36a22 22 0 0 1-40 12"/><path d="M54 10v14H40M18 62V48h14"/>',
};
{
  const T0 = at('traditionally'), TQ = at('but what if'), T1 = at('we build communities');
  const L = layer('bg-navy'); show(L, T0 - 0.15, at('a smarter way to discover') + 0.6, 0.3, 0.5);
  const top = ctext('Traditionally, owning a property meant…', 'h3 cream', 170, L, 'opacity:.8');
  rise(top, T0 + 0.35); hide(top, TQ - 0.2, 0.4);
  const groups = [['Paperwork.', at('paperwork'), ['doc', 'folder', 'stamp']], ['Spreadsheets.', at('spreadsheets'), ['sheet', 'chart', 'calc']],
    ['Conversations.', at('conversations'), ['chat', 'mail', 'phone']], ['Endless steps.', at('endless steps'), ['stairs', 'clock', 'loop']]];
  const ws = swapWords(groups.map(g => [g[0], g[1]]), L, (s) => ctext(s, 'h1 cream', 480, L), { useRise: true });
  hide(ws[3], TQ - 0.15, 0.4);
  const r = rng(11);
  groups.forEach(([, t, kinds]) => {
    for (let i = 0; i < 11; i++) {
      let x, y;
      do { x = 80 + r() * 1700; y = 80 + r() * 880; } while (x > 420 && x < 1420 && y > 380 && y < 700);
      const s = 70 + r() * 70, rot = (r() - 0.5) * 50;
      const ic = el(`<svg class="abs" viewBox="0 0 72 72" width="${s}" height="${s}" style="left:${x}px;top:${y}px;opacity:0"><g fill="none" stroke="#D6A58C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[kinds[i % 3]]}</g></svg>`, L);
      const ti = t + i * 0.045;
      tl.fromTo(ic, { opacity: 0, scale: 0.5, rotation: rot - 30, x: (r() - 0.5) * 160, y: (r() - 0.5) * 160 },
        { opacity: 0.55 + r() * 0.4, scale: 1, rotation: rot, x: 0, y: 0, duration: 0.7, ease: EASE, immediateRender: false }, ti);
      tl.to(ic, { y: `+=${(r() - 0.5) * 60}`, rotation: `+=${(r() - 0.5) * 20}`, duration: Math.max(0.3, TQ - ti - 0.7), ease: 'none' }, ti + 0.7);
      tl.to(ic, { x: 960 - (x + s / 2), y: 540 - (y + s / 2), scale: 0, opacity: 0, rotation: `+=${120 + r() * 120}`, duration: 1.0, ease: 'power3.in' }, TQ + r() * 0.4);
    }
  });
  const q = ctext('What if the entire journey|could come together in [one place?]', 'h2 cream', 400, L);
  rise(q, TQ + 0.15, { lineGap: [TQ + 0.15, at('could come together')] }); hide(q, T1 - 0.4, 0.35);
  const dot = el('<div class="abs" style="left:950px;top:690px;width:20px;height:20px;border-radius:50%;background:#E6BFA4;box-shadow:0 0 40px 12px rgba(230,191,164,.55)"></div>', L);
  gsap.set(dot, { autoAlpha: 0 });
  tl.fromTo(dot, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, TQ + 0.9);
  tl.to(dot, { top: 530, duration: 0.6, ease: EASE_IO }, T1 - 0.6);

  // NEW — line-art skyline draws itself (from the animatic)
  const bx = [[560, 120, 60], [640, 210, 70], [730, 330, 64], [815, 250, 60], [895, 420, 76], [990, 300, 66], [1075, 380, 70], [1165, 230, 62], [1245, 160, 58], [1320, 110, 56]];
  let inner = `<path d="M 200 760 C 520 760 640 700 960 700 S 1400 640 1720 650"/>`;
  bx.forEach(([x, h, w]) => {
    const yb = 760 - (x - 200) / 1520 * 100 - 10;
    inner += `<rect x="${x}" y="${yb - h}" width="${w}" height="${h}" rx="2"/>`;
    for (let k = 0; k < Math.floor(h / 46); k++) inner += `<path d="M ${x + 14} ${yb - h + 22 + k * 46} h 10 M ${x + w - 24} ${yb - h + 22 + k * 46} h 10" stroke-width="3" data-w="1"/>`;
  });
  const SK = svgEl(inner, { sw: 2 }, L);
  gsap.set(SK, { autoAlpha: 0 });
  tl.set(SK, { autoAlpha: 1 }, T1 - 0.05);
  drawAll(SK, T1 - 0.05, 1.0, 0.012);
  tl.to(dot, { autoAlpha: 0, scale: 3, duration: 0.5 }, T1);
  SK.querySelectorAll('[data-w]').forEach((p, i) => tl.to(p, { stroke: '#F3D2B8', duration: 0.2 }, T1 + 0.8 + (i % 7) * 0.08));
  tl.to(SK, { y: 170, autoAlpha: 0, duration: 0.7, ease: EASE_IN }, at('a smarter way to discover') - 0.3);
  const wb = ctext('We build [communities.]', 'h1 cream', 830, L);
  rise(wb, T1 + 0.05); hide(wb, at('and today') + 0.1, 0.4);
}

// =====================================================================
// S4  "And today … a smarter way to …"   S5 "Four journeys … ZOOD app."
// =====================================================================
let hero, portalHome, portalEnjoy;
{
  const T0 = at('and today'), TF = at('four journeys'), TN = at('not four applications'), TO = at('one application'), TZ = at('this is the zood app');
  const L = layer(); show(L, T0 - 0.2, at('explore every') + 0.5, 0.01, 0.5);
  const BG = el('<div class="layer"></div>', L); gsap.set(BG, { autoAlpha: 0 });
  const bgp = photo(PH('lounge.jpg'), {}, BG);
  el('<div class="layer" style="background:rgba(2,12,31,.8)"></div>', BG);
  tl.set(bgp, { filter: 'blur(12px)' }, 0);
  tl.to(BG, { autoAlpha: 1, duration: 1.1, ease: 'sine.inOut' }, at('a smarter way to discover') - 0.45);
  kenburns(bgp, T0 - 0.2, TZ + 2, 1.2, 1.05);

  const c2 = ctext('And today, we have built with you', 'h2 cream', 830, L);
  rise(c2, T0 + 0.1); hide(c2, at('a smarter way to discover') - 0.2, 0.3);
  const sw = ctext('A smarter way to', 'h3 cream', 150, L, 'opacity:.8');
  rise(sw, at('a smarter way to discover')); hide(sw, TF - 0.2, 0.3);
  const J = [['Discover', at('discover'), 'city-view.jpg', '50% 40%'], ['Own', at('create'), 'reception.jpg', '50% 50%'],
    ['Live', at('smarter way to live') + 0.5, 'walk-portrait.jpg', '50% 40%'], ['Invest', at('enjoy'), 'copper-wall.jpg', '50% 50%']];
  const slot = swapWords(J.map(j => [j[0] + '.', j[1]]), L, (s) => ctext(`[${s}]`, 'h1', 215, L), { useRise: true });
  hide(slot[3], TF - 0.2, 0.3);
  const cards = J.map(([name, t, im, pos], i) => {
    const c = el(`<div class="tile" style="left:${255 + i * 360}px;top:390px;width:330px;height:540px;border-radius:30px;box-shadow:0 40px 90px rgba(0,0,0,.5)"></div>`, L);
    photo(PH(im), { w: 330, h: 540, pos }, c);
    el('<div class="layer shade-b" style="width:100%;height:100%"></div>', c);
    c.lab = el(`<div class="abs" style="left:28px;bottom:26px"><div class="label" style="opacity:.75;font-size:15px">0${i + 1}</div><div class="h3 cream" style="font-size:40px;margin-top:6px">${name}</div></div>`, c);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, scaleY: 0.05, transformOrigin: '50% 100%' }, { autoAlpha: 1, scaleY: 1, duration: 0.85, ease: 'power3.out', immediateRender: false }, at('a smarter way to discover') - 0.25 + i * 0.09);
    return c;
  });
  J.forEach(([, t], k) => cards.forEach((c, i) => tl.to(c, { filter: i === k ? 'brightness(1.05)' : 'brightness(.42)', scale: i === k ? 1.05 : 0.97, y: i === k ? -14 : 0, duration: 0.4, ease: EASE_IO }, t - 0.05)));
  tl.to(cards, { filter: 'brightness(1)', scale: 1, y: 0, duration: 0.4 }, TF - 0.1);

  const fj = ctext('Four [journeys.]', 'h2 cream', 170, L); rise(fj, TF); hide(fj, TN - 0.15, 0.3);
  const na = ctext('Not four applications.', 'h2 cream', 170, L); rise(na, TN); hide(na, TO - 0.15, 0.3);
  const oa = ctext('[One] application.', 'h2 cream', 170, L); rise(oa, TO); hide(oa, TZ - 0.1, 0.3);
  cards.forEach((c, i) => {
    tl.to(c.lab, { autoAlpha: 0, duration: 0.25 }, TN - 0.1);
    tl.to(c, { left: 960 + (i - 1.5) * 250 - 90, top: 520, width: 180, height: 180, borderRadius: 44, duration: 0.8, ease: 'power3.inOut' }, TN + i * 0.04);
    tl.to(c, { left: 870, top: 520, scale: 0.6, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, TO - 0.05 + (i === 0 || i === 3 ? 0 : 0.06));
  });
  const icon = el(`<div class="abs" style="left:850px;top:500px;width:220px;height:220px;border-radius:54px;background:linear-gradient(150deg,#123a6e,#041E42 60%);box-shadow:0 30px 80px rgba(0,0,0,.6), inset 0 0 0 1.5px rgba(230,191,164,.45);display:flex;align-items:center;justify-content:center"><img src="${A('brand/symbol-white.png')}" style="width:120px"></div>`, L);
  gsap.set(icon, { autoAlpha: 0 });
  tl.fromTo(icon, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)', immediateRender: false }, TO + 0.35);
  tl.to(icon, { autoAlpha: 0, scale: 0.7, duration: 0.35 }, TZ - 0.35);

  // NEW — line phone sketches itself, then becomes the real iPhone (from the animatic)
  const LP = svgEl(`<rect x="782" y="170" width="356" height="740" rx="62"/><rect x="900" y="196" width="120" height="30" rx="15"/>
      <path d="M 840 560 C 890 520 930 580 960 560 S 1040 520 1080 550"/>`, { sw: 2.4 }, L);
  const lpz = el('<div class="abs label" style="left:0;width:1920px;top:600px;text-align:center;font-size:30px;letter-spacing:.6em;color:#E6BFA4">ZOOD</div>', L);
  gsap.set([LP, lpz], { autoAlpha: 0 });
  tl.set(LP, { autoAlpha: 1 }, TZ - 0.35);
  drawAll(LP, TZ - 0.35, 0.8, 0.08);
  tl.fromTo(lpz, { autoAlpha: 0, letterSpacing: '1.2em' }, { autoAlpha: 1, letterSpacing: '.6em', duration: 0.6, ease: EASE, immediateRender: false }, TZ + 0.1);
  tl.to([LP, lpz], { autoAlpha: 0, scale: 1.04, duration: 0.45 }, TZ + 0.8);

  const tz = ltext('This is|the [ZOOD] app.', 'h1 cream', 180, 400, L);
  rise(tz, TZ + 0.6, { lineGap: [TZ + 0.6, at('zood app') + 0.1] }); hide(tz, at('explore every') - 0.5, 0.35);
}
{
  const TZ = at('this is the zood app');
  const L = zlayer(50, 'persp'); show(L, TZ + 0.7, at('discover', 2) + 0.9, 0.3, 0.3);
  hero = phone(SCR('splash.jpg'), { parent: L });
  setPose(hero, { x: 960, y: 540, ry: 0, s: 0.85 });
  tl.fromTo(hero, { filter: 'brightness(2) blur(6px)' }, { filter: 'brightness(1) blur(0px)', duration: 0.7, ease: 'power2.out', immediateRender: false }, TZ + 0.7);
  pose(hero, TZ + 0.9, { x: 1250, ry: -16, s: 1, dur: 1.1, ease: 'power3.inOut' });
  sheen(hero, TZ + 1.3, 1.2);
}

// =====================================================================
// 01 DISCOVER
// =====================================================================
{
  const T0 = at('explore every'), TE = at('so you can find'), TV = at('verify your identity');
  const L = layer(); show(L, T0 - 0.6, TV + 0.4, 0.3, 0.3);
  lineSweep(T0 - 0.6, L);
  chapterTitle('Discover', T0 - 0.25, { left: 1000, top: 440, parent: L, hold: 0.75 });
  chapterLabel('01', 'Discover', T0 + 0.5, TE);

  // NEW — radar rings behind the phone (the animatic's discovery engine)
  const RR = svgEl([0, 1, 2, 3].map(() => `<circle cx="620" cy="540" r="120" data-nodraw="1"/>`).join(''), { sw: 1.5 }, L);
  gsap.set(RR, { autoAlpha: 0 });
  tl.to(RR, { autoAlpha: 1, duration: 0.4 }, T0 + 0.3);
  RR.querySelectorAll('circle').forEach((c, i) => tl.fromTo(c, { attr: { r: 120 }, opacity: 0.9 }, { attr: { r: 640 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: 2, immediateRender: true }, T0 + 0.3 + i * 0.6));
  tl.to(RR, { autoAlpha: 0, duration: 0.4 }, at('then tap') - 0.3);

  pose(hero, T0 - 0.75, { x: 620, ry: 12, dur: 0.9 });
  swap(hero, SCR('onboarding.jpg'), T0 - 0.2);
  const e1 = ltext('Explore every destination|[with complete clarity.]', 'h2 cream', 1000, 280, L);
  rise(e1, T0 + 0.6, { lineGap: [T0 + 0.6, at('with complete clarity')] });
  const lst = ltext('Layouts.|Views.|Neighborhood.', 'h2 cream', 1000, 520, L, 'line-height:1.35');
  rise(lst, at('layouts'), { lineGap: [at('layouts'), at('views'), at('neighborhood')] });
  focusLine(lst, 0, at('layouts')); focusLine(lst, 1, at('views')); focusLine(lst, 2, at('neighborhood'));
  swap(hero, SCR('map.jpg'), at('layouts') - 0.1);
  swap(hero, SCR('city3d.jpg'), at('views') - 0.1);
  tl.to(hero.cur, { scale: 1.28, transformOrigin: '50% 42%', duration: 1.8, ease: 'power2.inOut' }, at('neighborhood'));
  hide(e1, at('then tap') - 0.3, 0.35); hide(lst, at('then tap') - 0.3, 0.35);

  // tap · rotate · choose · walk through
  pose(hero, at('then tap') - 0.3, { x: 470, ry: 16, dur: 0.8 });
  swap(hero, SCR('walkthrough.png'), at('then tap') - 0.1);
  tap(hero, 0.2, 0.235, at('tap'));
  const tr = ltext('Tap.|Rotate.|Choose.|Walk through.', 'h2 cream', 1490, 300, L, 'line-height:1.4');
  rise(tr, at('tap'), { lineGap: [at('tap'), at('rotate'), at('choose your unit'), at('walk through')] });
  focusLine(tr, 0, at('tap')); focusLine(tr, 1, at('rotate')); focusLine(tr, 2, at('choose your unit')); focusLine(tr, 3, at('walk through'));
  const mw = el('<div class="abs persp" style="left:740px;top:280px;width:680px;height:520px"></div>', L);
  const model = crop(SCR('walkthrough.png'), [0.06, 0.175, 0.94, 0.475], 640, { radius: 26, style: 'left:20px;top:20px;box-shadow:0 60px 120px rgba(0,0,0,.6)' }, mw);
  gsap.set(model, { autoAlpha: 0 });
  tl.fromTo(model, { autoAlpha: 0, x: -420, scale: 0.45, rotationX: 0, rotationZ: 0 }, { autoAlpha: 1, x: 0, scale: 1, rotationX: 52, rotationZ: -24, duration: 0.9, ease: 'power3.out', immediateRender: false }, at('tap') + 0.25);
  tl.to(model, { rotationZ: 24, duration: at('choose your unit') - at('rotate') + 0.2, ease: 'sine.inOut' }, at('rotate'));
  tl.to(model, { autoAlpha: 0, scale: 0.8, duration: 0.35 }, at('choose your unit') - 0.05);
  // NEW — stacked floors, Floor 12 lifts out (from the animatic)
  const FL = el('<div class="abs" style="left:780px;top:250px;width:600px;height:600px"></div>', L);
  let fl = '';
  for (let i = 0; i < 14; i++) { const y = 470 - i * 26; fl += `<path class="fl${i}" d="M 300 ${y - 60} L 470 ${y} L 300 ${y + 60} L 130 ${y} Z"/>`; }
  const FS = svgEl(fl, { w: 600, h: 600, sw: 1.6 }, FL);
  gsap.set(FL, { autoAlpha: 0 });
  tl.set(FL, { autoAlpha: 1 }, at('choose your unit'));
  drawAll(FS, at('choose your unit'), 0.5, 0.03);
  tl.to(FS.querySelector('.fl11'), { fill: 'rgba(214,165,140,.55)', y: -40, x: 70, duration: 0.6, ease: 'back.out(1.6)' }, at('choose your unit') + 0.6);
  const flab = el('<div class="chip dark" style="left:450px;top:80px;font-size:22px;padding:12px 22px"><span class="dot"></span>Floor 12 · Unit A4</div>', FL);
  gsap.set(flab, { autoAlpha: 0 }); pop(flab, at('choose your unit') + 0.8);
  // NEW — isometric room with Modern / Classic toggle (from the animatic)
  const RM = el('<div class="abs" style="left:760px;top:250px;width:640px;height:600px"></div>', L);
  const RS = svgEl(`<path d="M 320 60 L 560 180 L 560 420 L 320 540 L 80 420 L 80 180 Z"/><path d="M 320 60 L 320 300 L 80 420 M 320 300 L 560 420"/>
      <path class="sofa" d="M 170 380 L 260 425 L 260 395 L 170 350 Z" fill="rgba(214,165,140,.5)"/><ellipse cx="380" cy="400" rx="50" ry="24"/><path d="M 470 230 L 470 330"/>`, { w: 640, h: 560, sw: 1.8 }, RM);
  const tog = el(`<div class="abs" style="left:170px;top:540px;width:300px;height:54px;border-radius:999px;border:1px solid rgba(214,165,140,.5);background:rgba(4,30,66,.6)">
      <div class="k" style="position:absolute;left:4px;top:4px;width:144px;height:44px;border-radius:999px;background:linear-gradient(100deg,#B07A63,#E6BFA4)"></div>
      <div style="position:absolute;left:4px;top:0;width:144px;height:54px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:500;color:#041E42">Modern</div>
      <div style="position:absolute;right:4px;top:0;width:144px;height:54px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:500;color:#F4EEE8">Classic</div></div>`, RM);
  gsap.set([RM, tog], { autoAlpha: 0 });
  const tW = at('walk through');
  tl.to(FL, { autoAlpha: 0, duration: 0.3 }, tW - 0.35);
  tl.set(RM, { autoAlpha: 1 }, tW - 0.2); drawAll(RS, tW - 0.2, 0.6, 0.05);
  pop(tog, tW + 0.2);
  tl.to(tog.querySelector('.k'), { left: 152, duration: 0.45, ease: 'power3.inOut' }, tW + 0.85);
  tl.to(RS.querySelector('.sofa'), { fill: 'rgba(155,203,235,.45)', duration: 0.4 }, tW + 0.9);
  const tB = at('before the first'), tS = at('see the available');
  tl.to(RM, { scale: 2.6, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, tB - 0.75);
  hide(tr, tB - 0.6, 0.35);

  // dive through the room into the corridor, then the corridor shrinks back into the phone screen
  const C = zlayer(60); gsap.set(C, { autoAlpha: 0 });
  const cor = photo(PH('corridor.jpg'), {}, C);
  el('<div class="layer shade-b"></div>', C);
  portalOpen(C, tB - 0.75, { l: 1020, t: 490, w: 120, h: 120, r: 10 }, 0.85);
  kenburns(cor, tB - 0.75, tS + 0.6, 1.0, 1.4);
  const bfs = ltext('Before the first stone|is even laid,', 'h2 cream', 140, 720, C);
  rise(bfs, tB, { lineGap: [tB, at('is even laid')] }); hide(bfs, tS - 0.55, 0.25);
  setPoseAt(hero, tB + 0.3, { x: 1300, ry: 0 });
  swap(hero, SCR('explore.jpg'), tB + 0.3, 'fade');
  portalClose(C, tS - 0.4, screenRect(hero, 1300), 0.85);
  pose(hero, tS + 0.45, { x: 1300, ry: -12, dur: 0.9, ease: 'power2.inOut' });
  const rt = ltext('See available units|[in real time.]', 'h2 cream', 170, 250, L);
  rise(rt, tS, { lineGap: [tS, at('in real time')] }); hide(rt, at('compare them') - 0.25, 0.3);
  const G = el('<div class="abs" style="left:175px;top:480px;width:560px;height:330px"></div>', L);
  const gr = rng(4), cells = [];
  for (let rr = 0; rr < 4; rr++) for (let cc = 0; cc < 7; cc++) {
    const c = el(`<div class="abs" style="left:${cc * 78}px;top:${rr * 78}px;width:64px;height:64px;border-radius:12px;border:1.5px solid rgba(214,165,140,.6)"></div>`, G);
    gsap.set(c, { autoAlpha: 0 }); cells.push(c);
    tl.fromTo(c, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, tS + 0.1 + (rr * 7 + cc) * 0.018);
    if (gr() < 0.45) tl.to(c, { background: 'rgba(214,165,140,.85)', duration: 0.25 }, at('in real time') + gr() * 1.3);
  }
  const live = pop(chip('<span class="dot live"></span>Live · 95 units available', 640, 160, L), at('in real time') + 0.3);
  out(live, at('compare them') - 0.25);
  [cells[9], cells[12]].forEach(c => tl.to(c, { boxShadow: '0 0 0 3px #F3D2B8', background: 'rgba(230,191,164,1)', duration: 0.3 }, at('compare them') - 0.1));
  tl.to(G, { autoAlpha: 0, x: -60, duration: 0.35, ease: EASE_IN }, at('compare them') + 0.25);
  pose(hero, at('compare them') - 0.2, { x: 960, ry: 0, dur: 0.8 });
  swap(hero, SCR('compare.png'), at('compare them'));
  const cm = ltext('Compare|[side by side.]', 'h2 cream', 150, 130, L);
  rise(cm, at('compare them'), { lineGap: [at('compare them'), at('side by side')] }); hide(cm, at('filter by') - 0.2, 0.3);
  const ca = crop(SCR('compare.png'), [0.03, 0.055, 0.5, 0.31], 360, { radius: 24, style: 'left:290px;top:430px;box-shadow:0 40px 90px rgba(0,0,0,.5)' }, L);
  const cb = crop(SCR('compare.png'), [0.5, 0.055, 0.97, 0.31], 360, { radius: 24, style: 'left:1270px;top:430px;box-shadow:0 40px 90px rgba(0,0,0,.5)' }, L);
  [[ca, 480], [cb, -480]].forEach(([c, dx], i) => {
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, x: dx, scale: 0.6, rotationY: 0, transformPerspective: 1600 }, { autoAlpha: 1, x: 0, scale: 1, rotationY: i ? -14 : 14, duration: 0.75, ease: 'power3.out', immediateRender: false }, at('side by side') - 0.2 + i * 0.1);
    tl.to(c, { autoAlpha: 0, x: dx * 0.6, scale: 0.7, duration: 0.4, ease: EASE_IN }, at('filter by') - 0.3);
  });

  // filter
  swap(hero, SCR('filter.jpg'), at('filter by') - 0.05);
  const fl2 = ltext('Filter by|[what matters.]', 'h2 cream', 150, 130, L);
  rise(fl2, at('filter by'), { lineGap: [at('filter by'), at('space')] }); hide(fl2, TE - 0.3, 0.3);
  [['Space', at('space'), 'L', 360], ['Distance', at('distance'), 'R', 380], ['Family', at('family'), 'L', 560], ['Individual', at('individual'), 'R', 600], ['Your community', at('residential community'), 'L', 760]].forEach(([s, t, side, y]) => {
    const c = chip(`<span class="dot"></span>${s}`, 0, y, L, 'dark');
    if (side === 'L') { c.style.right = `${W - 700}px`; c.style.left = 'auto'; } else c.style.left = '1220px';
    pop(c, t, { x: side === 'L' ? 60 : -60, scale: 0.9 }); out(c, TE - 0.3);
  });
  tap(hero, 0.25, 0.825, at('space')); tap(hero, 0.43, 0.825, at('family')); tap(hero, 0.72, 0.947, at('residential community') + 0.3);

  // dive through the phone screen into "perfect home"
  const P = zlayer(60); gsap.set(P, { autoAlpha: 0 }); portalHome = P;
  const pw = photo(PH('walk-wide.jpg'), {}, P);
  el('<div class="layer shade-l"></div>', P);
  portalOpen(P, TE - 0.5, screenRect(hero, 960), 0.85);
  kenburns(pw, TE - 0.25, TV + 0.5, 1.15, 1.0, { from: { x: -30 }, to: { x: 0 } });
  rise(ltext('Find your|[perfect home.]', 'h1 cream', 140, 340, P), TE, { lineGap: [TE, at('perfect home')] });
  rise(ltext('Not just an empty room.', 'h3 cream', 145, 610, P, 'opacity:.85'), at('not just an empty'));
}

// =====================================================================
// 02 OWN
// =====================================================================
{
  const T0 = at('verify your identity'), TH = at('when it is time'), TJ = at('you simply enjoy'), T1 = at('your home');
  const L = layer('bg-navy-soft persp'); show(L, T0 - 0.85, T1 + 0.4, 0.35, 0.6);
  lineSweep(T0 - 0.2, L, { dir: -1 });
  chapterTitle('Own', T0 - 0.2, { left: 170, top: 190, parent: L, hold: 0.55 });
  chapterLabel('02', 'Own', T0 + 0.4, TJ - 0.2);
  // "perfect home" shrinks back into the phone, which now shows Login
  const p = hero;
  setPoseAt(p, T0 - 0.95, { x: 1260, ry: 0 });
  swap(p, SCR('login.jpg'), T0 - 0.95, 'fade');
  portalClose(portalHome, T0 - 0.8, screenRect(p, 1260), 0.85);
  pose(p, T0 + 0.1, { x: 1260, ry: -12, dur: 0.8, ease: 'power2.inOut' });

  const vt = ltext('Verify your identity|[in seconds.]', 'h2 cream', 170, 410, L);
  rise(vt, T0 + 0.2, { lineGap: [T0 + 0.2, at('in seconds')] }); hide(vt, at('request information') - 0.3, 0.3);
  const scrim = ov(p, '', [0, 0, 1, 1], 'background:rgba(2,12,31,.62);z-index:12');
  const fid = ov(p, `<svg viewBox="0 0 100 100" width="100%" height="100%"><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
    <path d="M8 26V14a6 6 0 0 1 6-6h12M74 8h12a6 6 0 0 1 6 6v12M92 74v12a6 6 0 0 1-6 6H74M26 92H14a6 6 0 0 1-6-6V74"/>
    <path d="M34 36v6M66 36v6M50 40v16h-5M38 66c6 6 18 6 24 0"/></g></svg>`, [0.28, 0.3, 0.44, 0.2], 'z-index:13');
  const scan = ov(p, '', [0.3, 0.31, 0.4, 0.004], 'background:linear-gradient(90deg,transparent,#E6BFA4,transparent);z-index:14;box-shadow:0 0 18px 4px rgba(230,191,164,.6)');
  const ok = ov(p, `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;color:#fff;font-size:22px;font-weight:500"><span class="tick" style="width:64px;height:64px">${ICON.check}</span>Identity verified</div>`, [0.1, 0.55, 0.8, 0.12], 'z-index:14;display:flex;justify-content:center');
  [scrim, fid, scan, ok].forEach(e => gsap.set(e, { autoAlpha: 0 }));
  const tF = T0 + 0.5;
  tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, tF);
  tl.fromTo(fid, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: EASE, immediateRender: false }, tF + 0.05);
  tl.fromTo(scan, { autoAlpha: 1, top: '31%' }, { top: '49%', duration: 0.45, repeat: 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, tF + 0.2);
  tl.to(scan, { autoAlpha: 0, duration: 0.15 }, tF + 1.1);
  tl.to(fid.querySelector('g'), { stroke: '#E6BFA4', duration: 0.25 }, tF + 1.1);
  pop(ok, tF + 1.15);
  tl.to([scrim, fid, ok], { autoAlpha: 0, duration: 0.3 }, at('request information') - 0.3);

  // request · visit · reserve
  pose(p, at('request information') - 0.4, { x: 1150, ry: -12, dur: 0.7 });
  swap(p, SCR('project.jpg'), at('request information') - 0.15);
  const rv = ltext('Request information.|Book a dedicated visit.|[Reserve your unit.]', 'h2 cream', 170, 330, L, 'line-height:1.45');
  rise(rv, at('request information'), { lineGap: [at('request information'), at('book a dedicated'), at('reserve your unit')] });
  focusLine(rv, 0, at('request information')); focusLine(rv, 1, at('book a dedicated')); focusLine(rv, 2, at('reserve your unit'));
  hide(rv, at('review your contract') - 0.3, 0.35);
  tap(p, 0.5, 0.55, at('request information') + 0.2);
  const k1 = pop(chip(`<span class="tick">${ICON.check}</span>Information requested`, 0, 300, L), at('request information') + 0.4);
  const k2 = pop(chip(`<span class="tick">${ICON.check}</span>Visit booked · Thu 10:00 AM`, 0, 400, L), at('book a dedicated') + 0.4);
  swap(p, SCR('payment.jpg'), at('reserve your unit') - 0.15);
  tap(p, 0.5, 0.973, at('reserve your unit') + 0.6);
  const k3 = pop(chip(`<span class="tick">${ICON.check}</span>Unit A4 reserved`, 0, 500, L), at('reserve your unit') + 0.7);
  [k1, k2, k3].forEach(k => { k.style.left = 'auto'; k.style.right = '40px'; out(k, at('review your contract') - 0.3); });

  // contract — NEW swipe-to-sign paper (from the animatic) + live signature
  const tR = at('review your contract'), tSg = at('then sign it');
  pose(p, tR - 0.35, { x: 640, ry: 12, dur: 0.8 });
  swap(p, SCR('esign.png'), tR - 0.1);
  const sg = ltext('Review your contract.|Sign it digitally|and [securely.]', 'h2 cream', 1060, 140, L, 'line-height:1.3');
  rise(sg, tR, { lineGap: [tR, tSg, at('and securely')] }); hide(sg, at('with a single platform') - 0.3, 0.35);
  const paper = el(`<div class="card" style="left:1080px;top:470px;width:470px;height:360px;padding:34px 40px">
      <div class="label" style="font-size:14px;color:#A27063">Sales agreement · Villa A4</div>
      ${[90, 100, 84, 96, 70].map(w => `<div style="height:9px;border-radius:5px;background:rgba(4,30,66,.12);margin-top:22px;width:${w}%"></div>`).join('')}
      <div class="sl" style="position:absolute;left:40px;right:40px;bottom:30px;height:56px;border-radius:999px;background:rgba(4,30,66,.08)">
        <div class="kn" style="position:absolute;left:5px;top:5px;width:46px;height:46px;border-radius:50%;background:linear-gradient(100deg,#B07A63,#E6BFA4)"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;color:rgba(4,30,66,.55)">Swipe to sign</div></div></div>`, L);
  gsap.set(paper, { autoAlpha: 0 });
  tl.fromTo(paper, { autoAlpha: 0, y: 80, rotationX: 25, transformPerspective: 1600 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7, ease: EASE, immediateRender: false }, tR + 0.2);
  tl.to(paper.querySelector('.kn'), { left: 333, duration: 0.7, ease: 'power2.inOut' }, tSg + 0.2);
  tl.to(paper.querySelector('.sl'), { background: 'rgba(162,112,99,.25)', duration: 0.3 }, tSg + 0.8);
  const patch = ov(p, '', [0.285, 0.565, 0.42, 0.085], 'background:#f1e9e3');
  tl.set(patch, { clipPath: 'inset(0% 0% 0% 0%)' }, tR - 0.1);
  tl.to(patch, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.95, ease: 'power1.inOut' }, tSg + 0.2);
  tap(p, 0.5, 0.815, at('and securely'));
  tl.to(paper, { x: -520, y: 60, scale: 0.25, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, at('and securely') + 0.25);
  const sb = pop(chip('<span class="tick">' + ICON.check + '</span>Signed securely', 880, 860, L), at('and securely') + 0.4);
  out(sb, at('with a single platform') - 0.3);

  // everything with you + NEW payment ring / milestones / live (from the animatic)
  const tP = at('with a single platform');
  pose(p, tP - 0.35, { x: 1260, ry: -12, dur: 0.8 });
  swap(p, SCR('profile.jpg'), tP - 0.1);
  const op = ltext('One platform.|[Everything with you.]', 'h2 cream', 170, 260, L);
  rise(op, tP, { lineGap: [tP, at('keeps everything')] }); hide(op, at('every payment') - 0.25, 0.3);
  const ev = ltext('Every payment.|Every stage.|Every update.', 'h2 cream', 170, 150, L, 'line-height:1.3');
  rise(ev, at('every payment'), { lineGap: [at('every payment'), at('every stage'), at('every update')] });
  focusLine(ev, 0, at('every payment')); focusLine(ev, 1, at('every stage')); focusLine(ev, 2, at('every update'));
  hide(ev, at('track the progress') - 0.3, 0.3);
  tap(p, 0.5, 0.86, at('every payment'));
  const ring = el(`<div class="abs" style="left:170px;top:520px;width:300px;height:300px">
      <svg width="300" height="300" viewBox="0 0 300 300">${ROSE_GRAD_SVG.replace('id="rg"', 'id="rgR"')}<circle cx="150" cy="150" r="128" fill="none" stroke="rgba(244,238,232,.12)" stroke-width="14"/>
      <circle class="arc" cx="150" cy="150" r="128" fill="none" stroke="url(#rgR)" stroke-width="14" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="804" stroke-dashoffset="804"/></svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="n h1 cream" style="font-size:78px">0%</div><div class="label" style="font-size:13px;opacity:.6;margin-top:6px">paid to date</div></div></div>`, L);
  gsap.set(ring, { autoAlpha: 0 }); pop(ring, at('every payment') + 0.1);
  tl.to(ring.querySelector('.arc'), { strokeDashoffset: 804 * 0.6, duration: 1.2, ease: 'power2.out' }, at('every payment') + 0.25);
  count(ring.querySelector('.n'), 0, 40, at('every payment') + 0.25, 1.2, v => Math.round(v) + '%');
  const ms = el(`<div class="abs" style="left:520px;top:640px;width:520px;height:80px">
      <div style="position:absolute;left:12px;right:12px;top:11px;height:2px;background:rgba(244,238,232,.2)"></div>
      <div class="pf" style="position:absolute;left:12px;top:11px;height:2px;width:0;background:#D6A58C"></div>
      ${['Booking', 'Milestone 2', 'Milestone 3', 'Milestone 4', 'Handover'].map((s, i) => `<div class="m" style="position:absolute;left:${i * 124}px;top:0;width:24px;height:24px;border-radius:50%;border:2px solid #D6A58C;background:#041E42"></div>
        <div class="label" style="position:absolute;left:${i * 124 - 30}px;top:38px;width:90px;text-align:center;font-size:11px;letter-spacing:.12em;opacity:.7">${s}</div>`).join('')}</div>`, L);
  gsap.set(ms, { autoAlpha: 0 }); pop(ms, at('every stage') - 0.1);
  tl.to(ms.querySelector('.pf'), { width: 260, duration: 0.8, ease: 'power2.inOut' }, at('every stage'));
  [...ms.querySelectorAll('.m')].slice(0, 3).forEach((m, i) => tl.to(m, { background: '#D6A58C', duration: 0.2 }, at('every stage') + i * 0.28));
  const upd = pop(chip('<span class="dot live"></span>Update · Level 14 slab poured', 520, 520, L, 'dark'), at('every update'));
  [ring, ms, upd].forEach(e => out(e, at('track the progress') - 0.3));

  // construction tracking
  const tT = at('track the progress');
  pose(p, tT - 0.35, { x: 640, ry: 12, dur: 0.8 });
  swap(p, SCR('construction.png'), tT - 0.1);
  const sh = p.sh;
  const bar = ov(p, `<div style="position:absolute;left:0;right:0;top:30%;height:46%;border-radius:20px;background:#e1d7d0;overflow:hidden"><div class="f" style="height:100%;width:0%;background:#0b3058;border-radius:20px"></div></div>`, [0.30, 0.394, 0.635, 0.024], 'background:#f3ede8');
  const pct = ov(p, `<span class="n" style="font-size:${sh * 0.0225}px;font-weight:600;color:#0b2a55;line-height:1">0%</span>`, [0.172, 0.39, 0.12, 0.026], 'background:#f3ede8;display:flex;align-items:center');
  tl.fromTo(bar.querySelector('.f'), { width: '0%' }, { width: '65.7%', duration: 1.6, ease: 'power2.out', immediateRender: false }, tT + 0.3);
  count(pct.querySelector('.n'), 0, 68, tT + 0.3, 1.6, v => Math.round(v) + '%');
  const big = el('<div class="abs h0 cream" style="left:1060px;top:300px;font-size:220px"><span class="w n">0%</span></div>', L);
  gsap.set(big, { autoAlpha: 0 }); reveal(big, tT, { stagger: 0 });
  count(big.querySelector('.n'), 0, 68, tT + 0.3, 1.6, v => Math.round(v) + '%');
  const cl = ltext('CONSTRUCTION PROGRESS', 'label', 1068, 270, L, 'color:#D6A58C'); reveal(cl, tT);
  const tp = ltext('Track the progress|of [construction.]', 'h2 cream', 1060, 560, L);
  rise(tp, tT, { lineGap: [tT, at('of construction')] });
  [big, cl, tp].forEach(e => hide(e, at('access reports') - 0.25, 0.3));
  const ar = ltext('Access [reports.]', 'h2 cream', 1060, 190, L);
  rise(ar, at('access reports')); hide(ar, at('and watch your') - 0.25, 0.3);
  const rep = photoCard(PH('report-folder.jpg'), { x: 1060, y: 330, w: 700, h: 430, pos: '55% 50%' }, L);
  gsap.set(rep, { autoAlpha: 0 });
  tl.fromTo(rep, { autoAlpha: 0, y: 80, rotationX: 22, transformPerspective: 1800 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7, ease: EASE, immediateRender: false }, at('access reports') + 0.05);
  tl.to(rep, { autoAlpha: 0, y: -60, duration: 0.35, ease: EASE_IN }, at('and watch your') - 0.25);
  const rl = pop(chip('Monthly report · PDF', 1100, 790, L), at('access reports') + 0.4); out(rl, at('and watch your') - 0.25);
  const tW = at('and watch your');
  const lw = ltext('Watch your project|take shape, [live.]', 'h2 cream', 1060, 170, L);
  rise(lw, tW, { lineGap: [tW, at('take shape')] }); hide(lw, TH - 0.35, 0.35);
  const lv = crop(SCR('construction.png'), [0, 0.012, 1, 0.2], 700, { radius: 30, style: 'left:1060px;top:420px;box-shadow:0 50px 100px rgba(0,0,0,.5)' }, L);
  gsap.set(lv, { autoAlpha: 0 });
  tl.fromTo(lv, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, immediateRender: false }, tW);
  const lvb = el('<div class="chip" style="left:24px;top:24px;padding:10px 20px;font-size:20px"><span class="dot live"></span>LIVE</div>', lv);
  tl.to(lvb.querySelector('.dot'), { opacity: 0.25, duration: 0.4, repeat: 5, yoyo: true, ease: 'sine.inOut' }, tW + 0.3);
  const lvc = pop(chip('<span class="dot"></span>Level 14 · Slab poured today', 1100, 760, L, 'dark'), at('live updates'));
  [lv, lvc].forEach(e => out(e, TH - 0.35));
  // the phone lays down flat and becomes the floor plan
  pose(p, TH - 0.45, { x: 490, y: 620, rx: 58, rz: -28, s: 0.6, dur: 0.9 });
  tl.to(p, { autoAlpha: 0, duration: 0.45 }, TH + 0.2);

  // handover — NEW floor plan with snag pins (from the animatic) + checklist
  const hd = ctext('When it is time for [handover,]|we take care of the details.', 'h2 cream', 120, L);
  rise(hd, TH, { lineGap: [TH, at('we take care of the details')] }); hide(hd, TJ - 0.35, 0.35);
  const FPw = el('<div class="abs" style="left:170px;top:400px;width:640px;height:440px"></div>', L);
  const FP = svgEl(`<rect x="10" y="10" width="620" height="420" rx="6"/><path d="M 260 10 V 200 M 10 260 H 400 V 430 M 400 260 V 330 M 520 10 V 130 H 630"/>`, { w: 640, h: 440, sw: 2 }, FPw);
  gsap.set(FPw, { autoAlpha: 0 }); tl.set(FPw, { autoAlpha: 1 }, TH + 0.2); drawAll(FP, TH + 0.2, 0.9, 0.08);
  [[120, 140, 'Scratch · kitchen'], [480, 330], [330, 120]].forEach(([x, y, s], i) => {
    const pin = el(`<div class="abs" style="left:${x - 14}px;top:${y - 36}px"><svg width="28" height="36" viewBox="0 0 28 36"><path d="M14 35C14 35 2 21 2 13a12 12 0 0 1 24 0c0 8-12 22-12 22z" fill="#D6A58C"/><circle cx="14" cy="13" r="4.5" fill="#041E42"/></svg></div>`, FPw);
    gsap.set(pin, { autoAlpha: 0 });
    tl.fromTo(pin, { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'bounce.out', immediateRender: false }, at('we take care of the details') + 0.2 + i * 0.25);
    if (s) { const tt = el(`<div class="chip" style="left:${x + 20}px;top:${y - 60}px;padding:10px 18px;font-size:18px">${s}</div>`, FPw); gsap.set(tt, { autoAlpha: 0 }); pop(tt, at('we take care of the details') + 0.6); }
  });
  const ip = el('<div class="chip dark" style="left:220px;top:460px;padding:10px 22px;font-size:18px"><span class="dot"></span>In progress → Resolved</div>', FPw);
  gsap.set(ip, { autoAlpha: 0 }); pop(ip, at('licenses') - 0.2);
  out(FPw, TJ - 0.35);
  const ck = el(`<div class="card" style="left:1040px;top:400px;width:640px;padding:22px 40px"></div>`, L);
  [['Licenses', at('licenses')], ['Documentation', at('documentation')], ['Inspections', at('every step in between')], ['Keys handed over', at('in between') + 0.15]].forEach(([s, t], i) => {
    const row = el(`<div style="display:flex;align-items:center;gap:24px;padding:19px 0;${i ? 'border-top:1px solid rgba(4,30,66,.1)' : ''}">
      <div style="position:relative;width:44px;height:44px"><div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(4,30,66,.25)"></div>
      <div class="tk" style="position:absolute;inset:0;border-radius:50%;background:var(--rose);display:flex;align-items:center;justify-content:center">${ICON.check.replace('<svg', '<svg width="24" height="24"')}</div></div>
      <div style="font-size:34px;font-weight:400">${s}</div></div>`, ck);
    const tk = row.querySelector('.tk'); gsap.set(tk, { autoAlpha: 0 });
    tl.fromTo(tk, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }, t);
  });
  gsap.set(ck, { autoAlpha: 0 });
  tl.fromTo(ck, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, immediateRender: false }, at('we take care of the details'));
  out(ck, TJ - 0.35);

  // enjoy the moment
  const E = el('<div class="layer"></div>', L); gsap.set(E, { autoAlpha: 0 });
  const ecr = el('<div class="abs bg-cream" style="left:0;top:0;width:1920px;height:1080px"></div>', E);
  show(E, TJ - 0.3, null, 0.55);
  tl.fromTo(ecr, { clipPath: 'inset(0px 1920px 0px 0px)' }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TJ - 0.3);
  const EP = zlayer(60); gsap.set(EP, { autoAlpha: 0 }); portalEnjoy = EP;
  const ep = photo(PH('walk-portrait.jpg'), { x: 960, w: 960, h: 1080, pos: '50% 35%' }, EP);
  tl.set(EP, { autoAlpha: 1 }, TJ - 0.3);
  tl.fromTo(EP, { clipPath: 'inset(0px 0px 0px 1920px round 0px)' }, { clipPath: 'inset(0px 0px 0px 960px round 0px)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TJ - 0.3);
  kenburns(ep, TJ - 0.3, T1 + 0.3, 1.12, 1.0);
  const ej1 = ltext('Enjoy|the [moment.]', 'h1 navy', 140, 330, E), ej2 = ltext('[ZOOD] takes care of the rest.', 'h3 navy', 145, 600, E, 'opacity:.85');
  rise(ej1, TJ, { lineGap: [TJ, at('the moment')] }); rise(ej2, at('while zood'));
  [ej1, ej2].forEach(e => hide(e, T1 - 0.6, 0.35));
}

// =====================================================================
// 03 LIVE
// =====================================================================
{
  const T0 = at('your home'), TC = at('and everything your community'), TM = at('more presence', 2), TN = at('everything you need'),
    TA = at('as if zood'), TD = at('day and night'), T1 = at('and for those who invest');
  const L = layer('bg-day persp'); show(L, T0 - 0.45, T1 + 0.3, 0.4, 0.35);
  const N = el('<div class="layer bg-navy"></div>', L);
  const r = rng(21);
  for (let i = 0; i < 40; i++) {
    const s = 6 + r() * 26;
    el(`<div class="abs" style="left:${r() * 1920}px;top:${r() * 1080}px;width:${s}px;height:${s}px;border-radius:50%;background:rgba(230,191,164,${0.08 + r() * 0.25});filter:blur(${r() * 4}px)"></div>`, N);
  }
  gsap.set(N, { autoAlpha: 0 });
  tl.to(N, { autoAlpha: 1, duration: 2.2, ease: 'sine.inOut' }, at('with a real sense'));
  lineSweep(T0 - 0.5, L, { color: 'rgba(162,112,99,.8)' });
  chapterTitle('Live', T0 - 0.2, { left: 160, top: 100, parent: L, color: 'navy', hold: 0.4 });
  chapterLabel('03', 'Live', T0 + 0.3, T1 - 0.2, 'navy');
  // the "enjoy" photo shrinks into the phone screen
  const p = hero;
  setPoseAt(p, T0 - 0.6, { x: 1260, ry: 0 });
  tl.set(p, { autoAlpha: 1 }, T0 - 0.6);
  swap(p, SCR('profile.jpg'), T0 - 0.6, 'fade');
  portalClose(portalEnjoy, T0 - 0.5, screenRect(p, 1260), 0.85, 'inset(0px 0px 0px 960px round 0px)');
  pose(p, T0 + 0.4, { x: 1260, ry: -12, dur: 0.8, ease: 'power2.inOut' });
  const yh = ltext('Your home.|Your property.', 'h1 navy', 160, 300, L);
  rise(yh, T0 + 0.1, { lineGap: [T0 + 0.1, at('your property')] }); hide(yh, at('everything that matters') - 0.25, 0.3);
  tap(p, 0.25, 0.42, T0 + 0.4);
  const em = ltext('Everything that matters,|[protected securely]|and managed seamlessly.', 'h2 navy', 160, 230, L, 'line-height:1.3');
  rise(em, at('everything that matters'), { lineGap: [at('everything that matters'), at('protected securely'), at('and managed seamlessly')] });
  hide(em, TC - 0.3, 0.3);
  // NEW — title deed + vault lock (from the animatic)
  const deed = el(`<div class="card" style="left:160px;top:640px;width:330px;height:210px;padding:24px 28px">
      <div class="label" style="font-size:13px;color:#A27063">Title deed</div>
      ${[80, 92, 66].map(w => `<div style="height:8px;border-radius:4px;background:rgba(4,30,66,.12);margin-top:18px;width:${w}%"></div>`).join('')}
      <div style="position:absolute;right:24px;bottom:22px;width:56px;height:56px;border-radius:50%;border:2px solid #A27063"></div></div>`, L);
  gsap.set(deed, { autoAlpha: 0 }); pop(deed, at('protected securely') - 0.1);
  const lock = svgEl(`<circle cx="70" cy="70" r="64"/><circle class="dash" cx="70" cy="70" r="50" stroke-dasharray="4 6" data-nodraw="1"/><rect x="48" y="66" width="44" height="34" rx="6"/><path class="sh" d="M 56 66 V 54 a 14 14 0 0 1 28 0 V 66"/>`, { x: 530, y: 676, w: 140, h: 140, stroke: '#A27063', sw: 2.4 }, L);
  gsap.set(lock, { autoAlpha: 0 }); tl.set(lock, { autoAlpha: 1 }, at('protected securely')); drawAll(lock, at('protected securely'), 0.6, 0.06);
  tl.fromTo(lock.querySelector('.sh'), { y: -10 }, { y: 0, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, at('protected securely') + 0.7);
  tl.to(lock.querySelector('.dash'), { rotation: 90, svgOrigin: '70 70', duration: 2, ease: 'none' }, at('protected securely'));
  [deed, lock].forEach(e => out(e, TC - 0.3));

  // community — NEW services pie + noticeboard (from the animatic)
  pose(p, TC - 0.3, { x: 960, y: 590, ry: 0, s: 0.86, dur: 0.8 });
  swap(p, SCR('community.png'), TC - 0.1);
  const yc = ctext('Your community, in [one place.]', 'h2 navy', 40, L);
  rise(yc, TC); hide(yc, TM - 0.25, 0.3);
  const pie = el(`<div class="abs" style="left:180px;top:330px;width:420px;height:470px"></div>`, L);
  const C = 2 * Math.PI * 75;
  const PS = el(`<svg width="300" height="300" viewBox="0 0 300 300" style="position:absolute;left:60px;top:0">${[[0, 0.42, '#A27063'], [0.42, 0.72, '#C9A58C'], [0.72, 1, '#2e4a76']].map(([a, b, c]) =>
    `<circle class="ps" cx="150" cy="150" r="75" fill="none" stroke="${c}" stroke-width="150" stroke-dasharray="0 ${C}" stroke-dashoffset="${-a * C}" data-len="${(b - a) * C}" transform="rotate(-90 150 150)"/>`).join('')}</svg>`, pie);
  el('<div class="label navy" style="position:absolute;left:0;top:330px;width:420px;text-align:center;font-size:14px;opacity:.7">Water · Power · Shared services</div>', pie);
  gsap.set(pie, { autoAlpha: 0 }); tl.set(pie, { autoAlpha: 1 }, TC + 0.3);
  PS.querySelectorAll('.ps').forEach((c, i) => {
    tl.fromTo(c, { attr: { 'stroke-dasharray': `0 ${C}` } }, { attr: { 'stroke-dasharray': `${c.dataset.len} ${C}` }, duration: 0.6, ease: 'power2.out', immediateRender: true }, TC + 0.3 + i * 0.3);
  });
  const nb = el(`<div class="card" style="left:1290px;top:330px;width:450px;padding:28px 32px">
      <div class="label" style="font-size:14px;color:#A27063">Noticeboard</div>
      ${['Community iftar · Sat', 'Family cinema night · Thu', 'Pool maintenance · Mon'].map(s => `<div class="nb" style="font-size:24px;padding:16px 0;border-top:1px solid rgba(4,30,66,.1);margin-top:10px">${s}</div>`).join('')}</div>`, L);
  gsap.set(nb, { autoAlpha: 0 }); pop(nb, TC + 0.4);
  nb.querySelectorAll('.nb').forEach((n, i) => tl.fromTo(n, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, ease: EASE, immediateRender: true }, TC + 0.8 + i * 0.35));
  [pie, nb].forEach(e => out(e, TM - 0.3));
  // More ___ reprise
  const mo = text('[More]', 'h1', 'left:80px;width:640px;top:470px;text-align:right', L);
  rise(mo, TM); hide(mo, TN - 0.3, 0.35);
  swapWords([['presence.', at('presence', 2)], ['connection.', at('more connection') + 0.15], ['efficiency.', at('efficiency')], ['possibilities.', at('possibilities')]], L,
    (s) => ltext(s, 'h1 navy', 1220, 470, L, 'font-size:88px'), { useRise: true }).forEach((e, i, a) => { if (i === a.length - 1) hide(e, TN - 0.3, 0.35); });
  tap(p, 0.82, 0.29, at('more connection'));

  // services
  pose(p, TN - 0.35, { x: 1120, y: 540, ry: -10, s: 1, dur: 0.8 });
  ['Cleaning', 'Delivery', 'Meeting room', 'Facilities', 'Maintenance', 'Concierge'].forEach((s, i) => {
    const c = chip(`<span class="dot"></span>${s}`, 1420 + (i % 2) * 90, 230 + i * 110, L);
    pop(c, TN + 0.05 + i * 0.2, { x: -70, scale: 0.9 }); out(c, TA - 0.3);
  });
  const en = ltext('Everything|you need,|[whenever you]|[need it.]', 'h2 navy', 140, 300, L);
  rise(en, TN, { lineGap: [TN, TN + 0.35, at('whenever'), at('whenever') + 0.35] }); hide(en, TA - 0.3, 0.3);

  // always with you · chat
  pose(p, TA - 0.35, { x: 1000, ry: -10, dur: 0.8 });
  const aw = ltext('As if [ZOOD] is|always with you.', 'h2 navy', 160, 380, L);
  rise(aw, TA, { lineGap: [TA, at('always with you')] });
  tl.to(aw, { color: '#F4EEE8', duration: 1.6 }, at('with a real sense'));
  hide(aw, TD - 0.35, 0.35);
  const b1 = el('<div class="chip dark" style="left:auto;right:90px;top:330px;border-radius:30px 30px 8px 30px;font-weight:400">Can I book the gym at 7 PM?</div>', L);
  const b2 = el(`<div class="chip" style="left:auto;right:120px;top:440px;border-radius:30px 30px 30px 8px;font-weight:400"><img src="${A('brand/symbol-navy.png')}" style="height:28px">Booked. See you at 7 PM.</div>`, L);
  [b1, b2].forEach(b => gsap.set(b, { autoAlpha: 0 }));
  pop(b1, TA + 0.3, { y: 30, scale: 0.85 }); pop(b2, at('always with you') + 0.5, { y: 30, scale: 0.85 });
  [b1, b2].forEach(b => out(b, T1 - 0.35));
  const dn = ltext('Day', 'h0', 160, 380, L, 'color:#F4EEE8');
  const dn2 = ltext('[and night.]', 'h0', 160, 560, L);
  rise(dn, TD - 0.1, { stagger: 0 }); rise(dn2, at('and night'));
  [dn, dn2].forEach(e => hide(e, T1 - 0.5, 0.3));
  pose(p, T1 - 0.4, { x: 1450, y: 540, ry: -18, s: 0.82, dur: 0.9 });
  chapterLabels[chapterLabels.length - 1].push(at('with a real sense') + 0.3);
}

// =====================================================================
// 04 INVEST
// =====================================================================
{
  const T0 = at('and for those who invest'), TS = at('a smarter way to make'), TX = at('discover', 2);
  const L = layer('bg-navy persp'); show(L, T0 - 0.4, TX - 0.1, 0.35, 0.4);
  lineSweep(T0 - 0.45, L, { dir: -1 });
  chapterTitle('Invest', T0 - 0.15, { left: 160, top: 120, parent: L, hold: 0.45 });
  chapterLabel('04', 'Invest', T0 + 0.4, TX - 0.5);
  const fi = ltext('For those who invest|in what we build,|[there is something more.]', 'h2 cream', 160, 330, L);
  rise(fi, T0 + 0.35, { lineGap: [T0 + 0.35, at('in what we build'), at('there is something more')] }); hide(fi, TS - 0.3, 0.35);
  // NEW — flowing lines rise into a curve (from the animatic)
  const FLW = svgEl([0, 1, 2].map(i => `<path class="fw" d="M -40 ${720 + i * 34} C 500 ${720 + i * 34} 800 ${720 + i * 34} 1960 ${720 + i * 34}" stroke="${i ? 'rgba(155,203,235,.45)' : '#E6BFA4'}"/>`).join(''), { sw: 2.2 }, L);
  gsap.set(FLW, { autoAlpha: 0 }); tl.set(FLW, { autoAlpha: 1 }, T0 + 0.3);
  drawAll(FLW, T0 + 0.3, 1.0, 0.12);
  FLW.querySelectorAll('.fw').forEach((pth, i) => tl.to(pth, { attr: { d: `M -40 ${760 + i * 34} C 600 ${760 + i * 34} 900 ${560 + i * 34} 1960 ${470 + i * 34}` }, duration: 1.2, ease: 'power2.inOut' }, at('there is something more') - 0.1));
  tl.to(FLW, { autoAlpha: 0, duration: 0.4 }, TS - 0.2);

  const pb = phone(SCR('mortgage.jpg'), { parent: L });
  const p = hero;
  swap(p, SCR('yield.png'), TS - 0.3);
  setPose(pb, { x: 860, y: 1700, ry: 22, s: 0.86 });
  tl.set(pb, { filter: 'brightness(.55)' }, 0);
  pose(pb, TS - 0.2, { x: 860, y: 540, ry: 22, s: 0.86, dur: 0.9, ease: 'power3.out' });
  pose(p, TS - 0.4, { x: 600, y: 540, ry: 12, s: 1, dur: 0.9, ease: 'power3.inOut' });
  sheen(p, TS + 0.8);
  const chart = ov(p, '', [0.13, 0.33, 0.82, 0.175], 'background:#f4efea');
  tl.set(chart, { clipPath: 'inset(0% 0% 0% 0%)' }, TS - 0.3);
  tl.to(chart, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.4, ease: 'power1.inOut' }, TS + 0.3);
  const mk = ltext('Make your property|[work for you.]', 'h2 cream', 1120, 260, L);
  rise(mk, TS, { lineGap: [TS, at('work for you')] });
  const tg = el(`<div class="abs" style="left:1120px;top:560px;width:690px;height:96px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(214,165,140,.35)">
      <div class="knob" style="position:absolute;top:8px;left:8px;width:220px;height:78px;border-radius:999px;background:linear-gradient(100deg,#B07A63,#E6BFA4 55%,#B5816A);box-shadow:0 10px 30px rgba(162,112,99,.45)"></div>
      ${['Long-term', 'Short stays', 'Sale'].map((s, i) => `<div class="opt" style="position:absolute;top:0;left:${8 + i * 225}px;width:220px;height:96px;display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:500">${s}</div>`).join('')}</div>`, L);
  const tlab = ltext('YIELD MANAGER', 'label', 1124, 518, L, 'color:#D6A58C');
  gsap.set(tg, { autoAlpha: 0 });
  pop(tg, at('long term') - 0.5); reveal(tlab, at('long term') - 0.5);
  const knob = tg.querySelector('.knob'), opts = tg.querySelectorAll('.opt');
  gsap.set(knob, { autoAlpha: 0 }); gsap.set(opts, { color: 'rgba(244,238,232,.6)' });
  const caps = [['Long-term leasing.', at('long term')], ['Short stays.', at('short stays')], ['Or selling.', at('or selling')]];
  caps.forEach(([, t], i) => {
    if (i === 0) tl.fromTo(knob, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, t);
    else tl.to(knob, { left: 8 + i * 225, duration: 0.45, ease: 'power3.inOut' }, t - 0.05);
    opts.forEach((o, j) => tl.to(o, { color: j === i ? '#041E42' : 'rgba(244,238,232,.6)', duration: 0.25 }, t));
  });
  swapWords([...caps, ['You choose in seconds.', at('you choose in seconds')], ['[ZOOD] takes care of the rest.', at('zood takes care of the rest', 2)]], L,
    (s) => ltext(s, 'h3 cream', 1124, 700, L), { useRise: true }).forEach((e, i, a) => { if (i === a.length - 1) hide(e, TX - 0.5, 0.4); });
  tl.to(knob, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1 }, at('you choose in seconds') + 0.2);
  const inc = el('<div class="abs" style="left:1124px;top:820px"><div class="label" style="font-size:14px;color:#D6A58C">Projected rental income</div><div class="h2 cream" style="font-size:58px;margin-top:6px">SAR <span class="n">0</span></div></div>', L);
  gsap.set(inc, { autoAlpha: 0 }); pop(inc, at('you choose in seconds'));
  count(inc.querySelector('.n'), 0, 482650, at('you choose in seconds') + 0.1, 1.6, v => Math.round(v).toLocaleString('en-US'));
  hide(mk, TX - 0.5, 0.4); out(tg, TX - 0.5, 0.4); out(tlab, TX - 0.5, 0.4); out(inc, TX - 0.5, 0.4);
  // the phone pulls back to the centre; the wall of screens assembles around it
  pose(p, TX - 1.1, { x: 960, y: 540, ry: 0, s: 0.6, dur: 0.75 });
  tl.to(p, { autoAlpha: 0, scale: 0.45, duration: 0.45, ease: 'power2.in' }, TX - 0.4);
  pose(pb, TX - 0.55, { x: 860, y: 1700, dur: 0.6, ease: 'power3.in' });
}

// =====================================================================
// FINALE  wall of screens → bento grid → icon → logo → end card
// =====================================================================
const ALL = ['onboarding.jpg', 'map.jpg', 'walkthrough.png', 'compare.png', 'filter.jpg', 'explore.jpg', 'login.jpg', 'project.jpg', 'esign.png',
  'payment.jpg', 'profile.jpg', 'construction.png', 'community.png', 'gallery.jpg', 'yield.png', 'mortgage.jpg', 'city3d.jpg', 'splash.jpg'];
const TL_LUX = at('live luxury');
const END = Math.ceil(after('live zood') + 6.5);
{
  const TX = at('discover', 2), TDz = at('designed for the rhythm'), TB = at('because after construction'), TE = after('responsibility begins');
  const L = zlayer(40, 'bg-navy'); show(L, TX - 0.5, null, 0.45);
  const wallWrap = el('<div class="layer persp" style="perspective:2200px"></div>', L);
  const wall = el('<div class="abs p3d" style="left:-520px;top:-260px;width:2960px;height:1600px"></div>', wallWrap);
  gsap.set(wall, { rotationX: 30, rotationZ: -14 });
  const r = rng(5);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 11; col++) {
    const src = ALL[(row * 11 + col * 5) % ALL.length];
    const c = el(`<div class="tile" style="left:${col * 270 + (row % 2) * 120}px;top:${row * 560}px;width:246px;height:535px;border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.55)"><img src="${SCR(src)}" style="width:100%;height:100%;object-fit:cover"></div>`, wall);
    tl.fromTo(c, { autoAlpha: 0, z: -600, y: 120 }, { autoAlpha: 1, z: 0, y: 0, duration: 1.0, ease: EASE, immediateRender: true }, TX - 0.45 + r() * 0.7);
  }
  tl.fromTo(wall, { x: 0, rotationZ: -14 }, { x: -480, rotationZ: -10, duration: TDz - TX + 1.2, ease: 'none', immediateRender: false }, TX - 0.5);
  const wshade = el('<div class="layer" style="background:radial-gradient(60% 45% at 50% 50%, rgba(2,12,31,.9) 0%, rgba(2,12,31,.55) 60%, rgba(2,12,31,.2) 100%)"></div>', L);
  gsap.set(wshade, { autoAlpha: 0 }); tl.to(wshade, { autoAlpha: 1, duration: 0.4 }, TX - 0.2);
  swapWords([['Discover.', TX], ['Own.', at('enjoy', 3)], ['Live.', at('live', 4)], ['[Invest.]', at('dwell')]], L, (s) => ctext(s, 'h0 cream', 440, L), { useRise: true })
    .forEach((e, i, a) => { if (i === a.length - 1) hide(e, TDz - 0.3, 0.3); });
  tl.to([wallWrap, wshade], { autoAlpha: 0, duration: 0.5 }, TDz - 0.3);

  const B = el('<div class="layer"></div>', L);
  const tiles = [];
  const T = (x, y, w, h, inner, bg = '#0b2a55') => { const t = el(`<div class="tile" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};border-radius:30px">${inner}</div>`, B); tiles.push(t); return t; };
  const scrTile = (src) => `<img src="${SCR(src)}" style="position:absolute;left:0;top:50%;width:100%;transform:translateY(-50%)">`;
  const lab = (s, dark) => `<div class="label" style="position:absolute;left:26px;bottom:24px;font-size:16px;color:${dark ? '#041E42' : '#F4EEE8'}">${s}</div>`;
  const shadeB = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,12,31,0) 50%,rgba(2,12,31,.75))"></div>';
  T(48, 48, 300, 460, `<img src="${SCR('community.png')}" style="position:absolute;left:0;top:-8px;width:100%">${shadeB}${lab('Live')}`, '#F4EEE8');
  const t68 = T(48, 526, 300, 506, `<div style="position:absolute;left:30px;top:34px" class="label navy">Construction</div><div class="navy" style="position:absolute;left:24px;bottom:70px;font-size:120px;font-weight:300"><span class="n">0</span>%</div><div class="navy" style="position:absolute;left:30px;bottom:36px;font-size:22px;opacity:.6">Tracked live</div>`, 'linear-gradient(160deg,#EFE4DA,#DBC8B6)');
  T(366, 48, 300, 300, `<div style="position:absolute;inset:0;background:url('${PH('city-view.jpg')}') center 35%/cover"></div>${shadeB}${lab('Discover')}`);
  T(366, 366, 300, 666, scrTile('walkthrough.png'), '#F4EEE8');
  T(684, 48, 552, 300, `<div style="position:absolute;inset:0;background:url('${PH('reception.jpg')}') center/cover"></div>${shadeB}${lab('Own')}`);
  const txt = T(684, 366, 552, 348, '', 'linear-gradient(160deg,#0f3364,#041E42)');
  txt.style.boxShadow = 'inset 0 0 0 1.5px rgba(214,165,140,.35)';
  T(684, 732, 552, 300, `<img src="${SCR('yield.png')}" style="position:absolute;left:-2%;top:-${0.115 * 552 / 0.46 * 1.04}px;width:104%">${lab('Invest', true)}`, '#F4EEE8');
  T(1254, 48, 300, 666, scrTile('esign.png'), '#F4EEE8');
  T(1254, 732, 300, 300, `<img src="${A('brand/symbol-navy.png')}" style="position:absolute;left:50%;top:50%;width:150px;transform:translate(-50%,-50%)">`, '#F4EEE8');
  const t78 = T(1572, 48, 300, 300, `<div style="position:absolute;left:30px;top:34px" class="label navy">Average yield</div><div class="navy" style="position:absolute;left:24px;bottom:30px;font-size:104px;font-weight:300"><span class="n">0.0</span>%</div>`, 'linear-gradient(160deg,#C4E1F4,#9BCBEB)');
  T(1572, 366, 300, 666, scrTile('map.jpg'), '#F4EEE8');
  tiles.forEach((t) => {
    const cx = parseFloat(t.style.left) + parseFloat(t.style.width) / 2, cy = parseFloat(t.style.top) + parseFloat(t.style.height) / 2;
    gsap.set(t, { autoAlpha: 0 });
    tl.fromTo(t, { autoAlpha: 0, x: (cx - 960) * 0.35, y: (cy - 540) * 0.35, scale: 0.86, rotationY: (cx - 960) / 60, transformPerspective: 2000 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotationY: 0, duration: 0.95, ease: 'power3.out', immediateRender: false }, TDz - 0.35 + Math.hypot(cx - 960, cy - 540) / 2800);
    t._c = [cx, cy];
  });
  count(t68.querySelector('.n'), 0, 68, TDz + 0.3, 1.3);
  count(t78.querySelector('.n'), 0, 7.8, TDz + 0.4, 1.3, v => v.toFixed(1));
  tl.fromTo(B, { scale: 1 }, { scale: 1.035, duration: TE - TDz + 0.5, ease: 'none', immediateRender: false }, TDz);
  const d1 = text('Designed for the rhythm|of modern life.', 'h3 cream', 'left:0;width:552px;top:110px;text-align:center', txt);
  rise(d1, TDz + 0.1, { lineGap: [TDz + 0.1, at('of modern life')] }); hide(d1, TB - 0.25, 0.3);
  const d2 = text('After construction,|[responsibility begins.]', 'h3 cream', 'left:0;width:552px;top:110px;text-align:center', txt);
  rise(d2, TB, { lineGap: [TB, at('responsibility begins')] });
  // collapse: outer tiles fly into the centre while "begins" is spoken, text tile becomes the app icon
  const TCOL = at('begins') - 0.1;
  hide(d2, TCOL + 0.35, 0.25);
  tiles.filter(t => t !== txt).forEach((t) => {
    const [cx, cy] = t._c;
    tl.to(t, { x: 960 - cx, y: 540 - cy, scale: 0.15, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, TCOL + (1 - Math.hypot(cx - 960, cy - 540) / 1100) * 0.15);
  });
  tl.to(txt, { left: 850, top: 430, width: 220, height: 220, borderRadius: 54, duration: 0.55, ease: 'power3.inOut' }, TCOL + 0.4);
  const sym = el(`<img src="${A('brand/symbol-white.png')}" style="position:absolute;left:50%;top:50%;width:120px;transform:translate(-50%,-50%)">`, txt);
  gsap.set(sym, { autoAlpha: 0 }); tl.to(sym, { autoAlpha: 1, duration: 0.25 }, TCOL + 0.7);
  tl.to(txt, { scale: 1.6, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, TL_LUX - 0.1);

  const burst = el('<div class="abs" style="left:560px;top:140px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle, rgba(230,191,164,.55) 0%, rgba(230,191,164,0) 60%)"></div>', L);
  gsap.set(burst, { autoAlpha: 0 });
  tl.fromTo(burst, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1.3, duration: 0.6, ease: 'power2.out', immediateRender: false }, TL_LUX - 0.2);
  tl.to(burst, { autoAlpha: 0, duration: 1.0 }, TL_LUX + 0.4);
  const LG = el('<div class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>', L);
  const lg = el(`<img class="abs" src="${A('brand/logo-white.png')}" style="left:${960 - 420}px;top:${430 - 145}px;width:840px">`, LG);
  gsap.set(lg, { autoAlpha: 0 });
  tl.fromTo(lg, { autoAlpha: 0, scale: 0.86, filter: 'blur(16px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.0, ease: EASE, immediateRender: false }, TL_LUX + 0.05);
  const lsh = el(`<div class="abs" style="left:${960 - 420}px;top:${430 - 145}px;width:840px;height:291px;overflow:hidden;pointer-events:none;-webkit-mask-image:url(${A('brand/logo-white.png')});-webkit-mask-size:840px auto;-webkit-mask-repeat:no-repeat"><div class="s" style="position:absolute;top:-50%;bottom:-50%;width:160px;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.75),rgba(255,255,255,0));transform:rotate(12deg)"></div></div>`, LG);
  tl.fromTo(lsh.querySelector('.s'), { left: -220 }, { left: 1000, duration: 1.2, ease: 'power2.inOut', immediateRender: true }, at('live zood') + 0.3);
  const svg = el(`<svg class="abs" width="1920" height="1080" style="left:0;top:0">${ROSE_GRAD_SVG.replace('id="rg"', 'id="rg2"')}<path d="M 560 655 C 760 655 820 620 960 610 S 1200 585 1360 560" fill="none" stroke="url(#rg2)" stroke-width="2.5" stroke-linecap="round"/></svg>`, L);
  strokeDraw(svg.querySelector('path'), TL_LUX, 1.3);
  const ll = ctext('Live luxury.  Live [ZOOD.]', 'h2 cream', 690, L);
  tl.set(ll, { autoAlpha: 1 }, TL_LUX);
  const lw = ll.querySelectorAll('.w');
  tl.fromTo([lw[0], lw[1]], { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: EASE, immediateRender: true }, TL_LUX);
  tl.fromTo([lw[2], lw[3]], { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: EASE, immediateRender: true }, at('live zood'));

  const tE = after('live zood') + 0.9;
  tl.to(LG, { y: -160, scale: 0.72, transformOrigin: '960px 430px', duration: 1.0, ease: 'power3.inOut' }, tE);
  tl.to(svg, { y: -150, autoAlpha: 0, duration: 0.7, ease: 'power3.inOut' }, tE);
  tl.to(ll, { top: 470, duration: 1.0, ease: 'power3.inOut' }, tE);
  reveal(ctext('DOWNLOAD THE ZOOD APP', 'label', 650, L, 'color:#D6A58C'), tE + 0.6);
  const badges = el(`<div class="abs" style="left:0;width:1920px;top:720px;display:flex;justify-content:center;gap:28px">
      <img src="${A('brand/app-store.svg')}" style="height:80px;width:270px" class="bd"><img src="${A('brand/google-play.svg')}" style="height:80px;width:270px" class="bd"></div>`, L);
  const bds = badges.querySelectorAll('.bd'); gsap.set(bds, { autoAlpha: 0 });
  tl.fromTo(bds, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15, ease: EASE, immediateRender: false }, tE + 0.85);
  reveal(ctext('zood.sa', 'h3 cream', 890, L, 'font-size:28px;opacity:.6;letter-spacing:.08em'), tE + 1.4);
  const black = el('<div class="layer" style="background:#000"></div>', L);
  gsap.set(black, { autoAlpha: 0 });
  tl.to(black, { autoAlpha: 1, duration: 0.9, ease: 'none' }, END - 0.9);
  tl.set({}, {}, END);
}

// ---------- chapter labels (top-left) ----------
{
  const L = el('<div class="layer" style="pointer-events:none;z-index:90"></div>', stage);
  chapterLabels.forEach(([num, word, tIn, tOut, color, tCream]) => {
    const e = el(`<div class="abs label" style="left:110px;top:78px;display:flex;align-items:center;gap:18px;color:${color === 'navy' ? '#041E42' : '#F4EEE8'};font-size:20px">
      <span style="color:#C9977F">${num}</span><span class="ln" style="display:inline-block;width:46px;height:1.5px;background:currentColor;opacity:.5"></span><span>${word}</span></div>`, L);
    gsap.set(e, { autoAlpha: 0 });
    tl.fromTo(e, { autoAlpha: 0, x: -20 }, { autoAlpha: 0.9, x: 0, duration: 0.6, ease: EASE, immediateRender: false }, tIn);
    tl.fromTo(e.querySelector('.ln'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.7, ease: EASE, immediateRender: false }, tIn + 0.1);
    if (tCream) tl.to(e, { color: '#F4EEE8', duration: 1.6 }, tCream);
    tl.to(e, { autoAlpha: 0, duration: 0.4 }, tOut);
  });
}
