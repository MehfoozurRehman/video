// ZOOD app film — full timeline. Times are seconds into the voiceover
// (word timings from tools/vo-words.json, force-aligned to the VO).

// Full-width centred text.
const ctext = (s, cls, top, parent, extra = '') => text(s, cls, `left:0;width:${W}px;top:${top}px;text-align:center;${extra}`, parent);
const ltext = (s, cls, left, top, parent, extra = '') => text(s, cls, `left:${left}px;top:${top}px;${extra}`, parent);

function swapWords(list, parent, mk) {
  // list: [[str, t], ...]; each replaces the previous.
  const els = list.map(([s]) => mk(s));
  els.forEach((e, i) => {
    reveal(e, list[i][1], { stagger: 0.04, dur: 0.8 });
    if (i < list.length - 1) hide(e, list[i + 1][1] - 0.12, 0.35, -18);
  });
  return els;
}

function chapterTitle(word, t, { left = null, top = 440, parent, color = 'cream' } = {}) {
  const e = left == null ? ctext(word, `h0 ${color}`, top, parent, 'letter-spacing:.04em')
                         : ltext(word, `h0 ${color}`, left, top, parent, 'letter-spacing:.04em');
  reveal(e, t, { stagger: 0, dur: 0.7, blur: 24, y: 10 });
  tl.fromTo(e, { scale: 1.06 }, { scale: 1, duration: 1.2, ease: 'power2.out', immediateRender: false }, t);
  tl.to(e, { autoAlpha: 0, filter: 'blur(14px)', duration: 0.45, ease: EASE_IN }, t + 0.85);
}

const chapterLabels = [];
function chapterLabel(num, word, tIn, tOut, color = 'cream') {
  chapterLabels.push([num, word, tIn, tOut, color]);
}

function chip(html, x, y, parent, cls = '') {
  const c = el(`<div class="chip ${cls}" style="left:${x}px;top:${y}px">${html}</div>`, parent);
  gsap.set(c, { autoAlpha: 0 });
  return c;
}
function pop(e, t, from = { y: 30, scale: 0.92 }) {
  tl.fromTo(e, { autoAlpha: 0, filter: 'blur(8px)', ...from }, { autoAlpha: 1, filter: 'blur(0px)', y: 0, x: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)', immediateRender: false }, t);
  return e;
}
function out(e, t, dur = 0.45) { tl.to(e, { autoAlpha: 0, filter: 'blur(8px)', duration: dur, ease: EASE_IN }, t); }
// Move a phone (centre position + 3D pose).
function pose(p, t, { x, y = 540, ry = 0, rx = 0, s = 1, dur = 1.0, ease = 'power3.inOut' } = {}) {
  const v = { rotationY: ry, rotationX: rx, scale: s, duration: dur, ease };
  if (x != null) { v.left = x - p.pw / 2; v.top = y - p.phh / 2; }
  tl.to(p, v, t);
}
function setPose(p, { x, y = 540, ry = 0, rx = 0, s = 1 }) {
  gsap.set(p, { left: x - p.pw / 2, top: y - p.phh / 2, rotationY: ry, rotationX: rx, scale: s, transformPerspective: 2600 });
}
function photoCard(src, { x, y, w, h, radius = 32, pos = 'center' }, parent) {
  const c = el(`<div class="tile" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${radius}px;box-shadow:0 40px 90px rgba(0,0,0,.35)"></div>`, parent);
  const ph = photo(src, { w, h, pos }, c);
  c.ph = ph;
  return c;
}

const ROSE_GRAD_SVG = `<defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#7a4e40"/><stop offset=".5" stop-color="#E6BFA4"/><stop offset="1" stop-color="#A27063"/></linearGradient></defs>`;

// =====================================================================
// S1  0.0 – 16.6   "Luxury … More time for what truly matters."
// =====================================================================
{
  const L = layer('bg-navy'); show(L, 0, 16.9, 1.4, 0.3);
  const svg = el(`<svg class="abs" width="1920" height="1080" style="left:0;top:0">${ROSE_GRAD_SVG}<path d="${CURVE_D}" fill="none" stroke="url(#rg)" stroke-width="2.5"/></svg>`, L);
  strokeDraw(svg.querySelector('path'), 0.4, 3.6);
  tl.to(svg, { autoAlpha: 0, duration: 0.6 }, 4.4);

  const lux = ctext('Luxury.', 'h0 cream', 440, L, 'font-size:190px');
  reveal(lux, 0.15, { stagger: 0, dur: 1.8, blur: 30, y: 16 });
  tl.fromTo(lux, { letterSpacing: '0.14em' }, { letterSpacing: '0.02em', duration: 4.4, ease: 'power2.out', immediateRender: false }, 0.15);
  const sub = ctext('Always at the heart of [ZOOD.]', 'h3 cream', 680, L, 'opacity:.85');
  reveal(sub, 1.85, { stagger: 0.08 });
  hide(lux, 4.55, 0.6); hide(sub, 4.5, 0.5);

  // "In every detail." over copper macro
  const Lc = el('<div class="layer"></div>', L); gsap.set(Lc, { autoAlpha: 0 });
  const cp = photo(PH('copper.jpg'), {}, Lc);
  el('<div class="layer shade-all"></div>', Lc);
  show(Lc, 4.6, 7.45, 1.0, 0.6);
  kenburns(cp, 4.6, 8.2, 1.22, 1.06);
  const det = ctext('In every [detail.]', 'h1 cream', 480, Lc);
  reveal(det, 4.95);

  // "More ___" with photo card
  const Ls = el('<div class="layer bg-navy-soft"></div>', L); gsap.set(Ls, { autoAlpha: 0 });
  show(Ls, 7.45, null, 0.6);
  const more = ltext('[More]', 'h1', 170, 350, Ls, 'font-size:110px');
  reveal(more, 7.78, { stagger: 0 });
  const words = [['presence.', 7.95], ['living.', 9.5], ['personalization.', 10.86], ['comfort.', 12.76], ['time for what|truly matters.', 14.15]];
  swapWords(words, Ls, (s) => ltext(s, 'h1 cream', 170, 480, Ls, 'font-size:96px'));
  const card = el(`<div class="tile" style="left:1080px;top:110px;width:680px;height:860px;border-radius:40px;box-shadow:0 50px 120px rgba(0,0,0,.45)"></div>`, Ls);
  const imgs = ['city-view.jpg', 'walk-portrait.jpg', 'wood-wall.jpg', 'corridor.jpg', 'copper-wall.jpg'];
  imgs.forEach((im, i) => {
    const p = photo(PH(im), { w: 680, h: 860 }, card);
    const t = words[i][1] - 0.1;
    tl.fromTo(p, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut', immediateRender: true }, t);
    kenburns(p, t, t + 3.2, 1.18, 1.04);
  });
  tl.fromTo(card, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.0, ease: EASE, immediateRender: false }, 7.6);
}

// =====================================================================
// S2  16.2 – 34.4   "Because true luxury … an experience you live."
// =====================================================================
{
  const L = el('<div class="layer bg-cream"></div>', stage);
  gsap.set(L, { autoAlpha: 0 });
  // kinked top edge (brand "horizontal" element)
  el(`<svg class="abs" width="1920" height="140" style="left:0;top:-139px"><path d="M0 140 L0 70 L860 70 C930 70 930 0 1000 0 L1920 0 L1920 140 Z" fill="#FBF7F3"/></svg>`, L);
  tl.set(L, { autoAlpha: 1 }, 16.2);
  tl.fromTo(L, { y: 1240 }, { y: 0, duration: 1.0, ease: 'power3.inOut', immediateRender: false }, 16.2);
  tl.set(L, { autoAlpha: 0 }, 33.2);

  const t1 = ctext('True luxury is not about|having more things.', 'h2 navy', 410, L);
  revealLines(t1, [16.75, 18.6]); hide(t1, 20.05, 0.45);
  const t2 = ctext('It is about having more of|[what is designed around you.]', 'h2 navy', 410, L);
  revealLines(t2, [20.4, 21.8]); hide(t2, 23.7, 0.45);

  const arch = el(`<div class="tile" style="left:1120px;top:120px;width:620px;height:840px;border-radius:310px 310px 32px 32px"></div>`, L);
  const a1 = photo(PH('walk-portrait.jpg'), { w: 620, h: 840 }, arch);
  const a2 = photo(PH('copper-wall.jpg'), { w: 620, h: 840 }, arch);
  tl.fromTo(arch, { clipPath: 'inset(100% 0% 0% 0% round 310px 310px 32px 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 310px 310px 32px 32px)', duration: 1.2, ease: 'power3.inOut', immediateRender: true }, 23.9);
  kenburns(a1, 23.9, 28.5, 1.15, 1.02);
  tl.fromTo(a2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, immediateRender: true }, 27.2);
  kenburns(a2, 27.2, 32.5, 1.12, 1.0);

  const h1 = ltext('That is exactly what', 'h3 navy', 170, 360, L, 'opacity:.7');
  const h2 = ltext('happiness', 'h0 navy', 160, 430, L);
  const h3 = ltext('[means.]', 'h2', 170, 620, L);
  reveal(h1, 24.1); reveal(h2, 25.55, { stagger: 0, blur: 22 }); reveal(h3, 26.15);
  [h1, h2, h3].forEach(e => hide(e, 27.0, 0.45));

  const pr = ltext('At [ZOOD,] luxury is|not a promise on paper.', 'h2 navy', 170, 420, L);
  revealLines(pr, [27.25, 29.15]); hide(pr, 31.5, 0.5);

  // full-bleed reception
  const R = layer();
  const rp = photo(PH('reception.jpg'), {}, R);
  el('<div class="layer shade-b"></div>', R); el('<div class="layer shade-l" style="opacity:.6"></div>', R);
  show(R, 31.55, 34.45, 0.9, 0.5);
  kenburns(rp, 31.55, 35, 1.14, 1.0);
  const ex = ltext('It is an experience|[you live.]', 'h1 cream', 140, 690, R);
  revealLines(ex, [31.9, 33.0]);
}

// =====================================================================
// S3  34.3 – 45.5   "Traditionally … in one place?"
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
  const L = layer('bg-navy'); show(L, 34.1, 47.6, 0.5, 0.4);
  const top = ctext('Traditionally, owning a property meant…', 'h3 cream', 170, L, 'opacity:.8');
  reveal(top, 34.4); hide(top, 41.0, 0.5);

  const groups = [['Paperwork.', 36.55, ['doc', 'folder', 'stamp']], ['Spreadsheets.', 37.4, ['sheet', 'chart', 'calc']],
    ['Conversations.', 38.37, ['chat', 'mail', 'phone']], ['Endless steps.', 39.77, ['stairs', 'clock', 'loop']]];
  const ws = swapWords(groups.map(g => [g[0], g[1]]), L, (s) => ctext(s, 'h1 cream', 480, L));
  hide(ws[3], 41.1, 0.5);

  const r = rng(11);
  const icons = [];
  groups.forEach(([, t, kinds], gi) => {
    for (let i = 0; i < 11; i++) {
      let x, y;
      do { x = 80 + r() * 1700; y = 80 + r() * 880; } while (x > 420 && x < 1420 && y > 380 && y < 700);
      const s = 70 + r() * 70, rot = (r() - 0.5) * 50;
      const k = kinds[i % 3];
      const ic = el(`<svg class="abs" viewBox="0 0 72 72" width="${s}" height="${s}" style="left:${x}px;top:${y}px;opacity:0"><g fill="none" stroke="#D6A58C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g></svg>`, L);
      const ti = t + i * 0.06;
      tl.fromTo(ic, { opacity: 0, scale: 0.5, rotation: rot - 30, x: (r() - 0.5) * 160, y: (r() - 0.5) * 160 },
        { opacity: 0.55 + r() * 0.4, scale: 1, rotation: rot, x: 0, y: 0, duration: 0.9, ease: EASE, immediateRender: false }, ti);
      tl.to(ic, { y: `+=${(r() - 0.5) * 60}`, rotation: `+=${(r() - 0.5) * 20}`, duration: 41.2 - ti - 0.9, ease: 'none' }, ti + 0.9);
      tl.to(ic, { x: 960 - (x + s / 2), y: 540 - (y + s / 2), scale: 0, opacity: 0, rotation: `+=${120 + r() * 120}`, duration: 1.2, ease: 'power3.in' }, 41.25 + r() * 0.5);
      icons.push(ic);
    }
  });

  const q = ctext('What if the entire journey|could come together in [one place?]', 'h2 cream', 400, L);
  revealLines(q, [41.5, 42.85]); hide(q, 44.85, 0.5);

  const dot = el('<div class="abs" style="left:950px;top:530px;width:20px;height:20px;border-radius:50%;background:#E6BFA4;box-shadow:0 0 40px 12px rgba(230,191,164,.55)"></div>', L);
  gsap.set(dot, { autoAlpha: 0 });
  tl.fromTo(dot, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', immediateRender: false }, 42.3);
  gsap.set(dot, { top: 690 });
  tl.to(dot, { top: 530, duration: 0.8, ease: EASE_IO }, 44.6);
  tl.to(dot, { scale: 1.5, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 43.9);
}

// =====================================================================
// S4  45.4 – 57.0   "We build communities … a smarter way to …"
// S5  57.0 – 64.8   "Four journeys … This is the ZOOD app."
// =====================================================================
let hero;
{
  const L = layer(); show(L, 45.4, 65.4, 0.01, 0.6);
  const bgp = photo(PH('lounge.jpg'), { pos: '50% 50%' }, L);
  const dim = el('<div class="layer" style="background:rgba(2,12,31,.6)"></div>', L);
  tl.fromTo(L, { clipPath: 'circle(0px at 960px 540px)' }, { clipPath: 'circle(1200px at 960px 540px)', duration: 1.6, ease: 'power3.inOut', immediateRender: false }, 45.4);
  kenburns(bgp, 45.4, 58, 1.18, 1.02);
  tl.to(dim, { background: 'rgba(2,12,31,.82)', duration: 1.2 }, 49.2);
  tl.to(bgp, { filter: 'blur(14px)', duration: 1.2 }, 49.2);

  const c1 = ctext('We build [communities.]', 'h1 cream', 470, L);
  reveal(c1, 45.5); hide(c1, 47.2, 0.5);
  const c2 = ctext('And today, we have built with you', 'h2 cream', 490, L);
  reveal(c2, 47.5); hide(c2, 49.2, 0.4);

  const sw = ctext('A smarter way to', 'h3 cream', 150, L, 'opacity:.8');
  reveal(sw, 49.4); hide(sw, 56.9, 0.4);
  const J = [['Discover', 50.35, 'city-view.jpg', '50% 40%'], ['Own', 52.16, 'reception.jpg', '50% 50%'], ['Live', 54.01, 'walk-portrait.jpg', '50% 40%'], ['Invest', 56.0, 'copper-wall.jpg', '50% 50%']];
  const slot = swapWords(J.map(j => [j[0] + '.', j[1]]), L, (s) => ctext(`[${s}]`, 'h1', 215, L));
  hide(slot[3], 56.9, 0.35);
  // last slot word hides with the S5 text
  const cards = J.map(([name, t, im, pos], i) => {
    const x = 255 + i * 360;
    const c = el(`<div class="tile" style="left:${x}px;top:390px;width:330px;height:540px;border-radius:30px;box-shadow:0 40px 90px rgba(0,0,0,.5)"></div>`, L);
    photo(PH(im), { w: 330, h: 540, pos }, c);
    el('<div class="layer shade-b" style="width:100%;height:100%"></div>', c);
    const lab = el(`<div class="abs" style="left:28px;bottom:26px"><div class="label" style="opacity:.75;font-size:15px">0${i + 1}</div><div class="h3 cream" style="font-size:40px;margin-top:6px">${name}</div></div>`, c);
    c.lab = lab;
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, y: 90, rotationX: 18, transformPerspective: 1600 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.0, ease: EASE, immediateRender: false }, 49.5 + i * 0.12);
    return c;
  });
  J.forEach(([, t], k) => {
    cards.forEach((c, i) => tl.to(c, { filter: i === k ? 'brightness(1.05)' : 'brightness(.42)', scale: i === k ? 1.04 : 0.98, duration: 0.5, ease: EASE_IO }, t - 0.05));
  });
  tl.to(cards, { filter: 'brightness(1)', scale: 1, duration: 0.5 }, 56.95);

  // ---- S5
  const fj = ctext('Four [journeys.]', 'h2 cream', 170, L); reveal(fj, 57.05); hide(fj, 58.2, 0.35);
  const na = ctext('Not four applications.', 'h2 cream', 170, L); reveal(na, 58.4); hide(na, 60.1, 0.35);
  const oa = ctext('[One] application.', 'h2 cream', 170, L); reveal(oa, 60.3); hide(oa, 61.6, 0.4);
  cards.forEach((c, i) => {
    tl.to(c.lab, { autoAlpha: 0, duration: 0.3 }, 58.3);
    tl.to(c, { left: 960 + (i - 1.5) * 250 - 90, top: 520, width: 180, height: 180, borderRadius: 44, duration: 1.0, ease: 'power3.inOut' }, 58.4 + i * 0.05);
    tl.to(c, { left: 870, top: 520, scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 60.25 + (i === 0 || i === 3 ? 0 : 0.08));
  });
  const icon = el(`<div class="abs" style="left:850px;top:500px;width:220px;height:220px;border-radius:54px;background:linear-gradient(150deg,#123a6e,#041E42 60%);box-shadow:0 30px 80px rgba(0,0,0,.6), inset 0 0 0 1.5px rgba(230,191,164,.45);display:flex;align-items:center;justify-content:center"><img src="${A('brand/symbol-white.png')}" style="width:120px"></div>`, L);
  gsap.set(icon, { autoAlpha: 0 });
  tl.fromTo(icon, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)', immediateRender: false }, 60.75);
  tl.to(icon, { scale: 2.2, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 61.55);

  const tz = ltext('This is|the [ZOOD] app.', 'h1 cream', 180, 400, L);
  revealLines(tz, [61.95, 62.6]); hide(tz, 64.2, 0.5);
}

// Hero phone used through S5 → Discover
{
  const L = layer('persp'); show(L, 61.5, 92.8, 0.3, 0.5);
  hero = phone(SCR('splash.jpg'), { parent: L });
  setPose(hero, { x: 960, y: 610, ry: -40, s: 0.45 });
  tl.fromTo(hero, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, immediateRender: false }, 61.6);
  pose(hero, 61.6, { x: 1250, ry: -18, s: 1, dur: 1.4, ease: 'power3.out' });
  pose(hero, 63.0, { x: 1250, ry: 14, dur: 3.0, ease: 'sine.inOut' });
  sheen(hero, 62.6, 1.6);
}

// =====================================================================
// 01 DISCOVER  64.3 – 96.6
// =====================================================================
{
  const L = layer(); show(L, 64.2, 96.7, 0.3, 0.4);
  chapterTitle('Discover', 64.3, { left: 160, top: 440, parent: L });
  chapterLabel('01', 'Discover', 65.4, 92.6);

  pose(hero, 65.2, { x: 620, ry: 12, dur: 1.2 });
  swap(hero, SCR('onboarding.jpg'), 65.5);
  const e1 = ltext('Explore every destination|[with complete clarity.]', 'h2 cream', 1000, 280, L);
  revealLines(e1, [65.45, 66.75]);
  const lst = ltext('Layouts.|Views.|Neighborhood.', 'h2 cream', 1000, 520, L, 'line-height:1.35');
  revealLines(lst, [68.4, 69.5, 70.72]);
  focusLine(lst, 0, 68.4); focusLine(lst, 1, 69.5); focusLine(lst, 2, 70.72);
  swap(hero, SCR('map.jpg'), 68.35);
  swap(hero, SCR('city3d.jpg'), 69.45);
  tl.to(hero.cur, { scale: 1.28, transformOrigin: '50% 42%', duration: 2.2, ease: 'power2.inOut' }, 70.6);
  hide(e1, 72.1, 0.45); hide(lst, 72.1, 0.45);

  // tap · rotate · choose · walk through
  pose(hero, 72.1, { x: 470, ry: 16, dur: 1.0 });
  swap(hero, SCR('walkthrough.png'), 72.4);
  tap(hero, 0.2, 0.235, 73.0);
  const tr = ltext('Tap.|Rotate.|Choose.|Walk through.', 'h2 cream', 1490, 300, L, 'line-height:1.4');
  revealLines(tr, [73.02, 73.8, 75.0, 76.22]);
  focusLine(tr, 0, 73.02); focusLine(tr, 1, 73.8); focusLine(tr, 2, 75.0); focusLine(tr, 3, 76.22);
  const mw = el('<div class="abs persp" style="left:740px;top:280px;width:680px;height:520px"></div>', L);
  const model = crop(SCR('walkthrough.png'), [0.06, 0.175, 0.94, 0.475], 640, { radius: 26, style: 'left:20px;top:20px;box-shadow:0 60px 120px rgba(0,0,0,.6)' }, mw);
  gsap.set(model, { autoAlpha: 0 });
  tl.fromTo(model, { autoAlpha: 0, x: -420, scale: 0.45, rotationX: 0, rotationZ: 0 }, { autoAlpha: 1, x: 0, scale: 1, rotationX: 52, rotationZ: -24, duration: 1.1, ease: 'power3.out', immediateRender: false }, 73.55);
  tl.to(model, { rotationZ: 22, duration: 2.6, ease: 'sine.inOut' }, 74.4);
  const pin = el('<div class="abs" style="left:57%;top:46%;width:26px;height:26px;margin:-13px;border-radius:50%;background:#E6BFA4;box-shadow:0 0 0 10px rgba(230,191,164,.35)"></div>', model);
  gsap.set(pin, { autoAlpha: 0 });
  tl.fromTo(pin, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, 75.05);
  tl.to(model, { rotationX: 0, rotationZ: 0, scale: 3.2, autoAlpha: 0, duration: 1.0, ease: 'power3.in' }, 76.25);
  pose(hero, 76.2, { x: -300, ry: 30, dur: 1.0, ease: 'power3.in' });
  hide(tr, 76.9, 0.5);

  // walk through the corridor
  const C = el('<div class="layer"></div>', L); gsap.set(C, { autoAlpha: 0 });
  const cor = photo(PH('corridor.jpg'), {}, C);
  el('<div class="layer shade-b"></div>', C);
  show(C, 76.55, 80.5, 0.7, 0.7);
  kenburns(cor, 76.55, 81.2, 1.0, 1.35);
  const bf = ltext('Before the first stone|is even laid,', 'h2 cream', 140, 720, C);
  revealLines(bf, [78.2, 79.5]);

  // real-time availability
  setPose(hero, { x: 2300, ry: -20 });
  swap(hero, SCR('explore.jpg'), 80.2, 'fade');
  pose(hero, 80.4, { x: 1300, ry: -12, dur: 1.1, ease: 'power3.out' });
  const rt = ltext('See available units|[in real time.]', 'h2 cream', 170, 400, L);
  revealLines(rt, [81.0, 82.45]); hide(rt, 83.5, 0.4);
  const live = pop(chip('<span class="dot live"></span>Live availability · 95 units', 640, 230, L), 82.0);
  out(live, 83.5);

  // compare
  pose(hero, 83.4, { x: 960, ry: 0, dur: 0.9 });
  swap(hero, SCR('compare.png'), 83.85);
  const cm = ltext('Compare|[side by side.]', 'h2 cream', 150, 130, L);
  revealLines(cm, [83.9, 84.5]); hide(cm, 85.7, 0.4);
  const ca = crop(SCR('compare.png'), [0.03, 0.055, 0.5, 0.31], 360, { radius: 24, style: 'left:290px;top:430px;box-shadow:0 40px 90px rgba(0,0,0,.5)' }, L);
  const cb = crop(SCR('compare.png'), [0.5, 0.055, 0.97, 0.31], 360, { radius: 24, style: 'left:1270px;top:430px;box-shadow:0 40px 90px rgba(0,0,0,.5)' }, L);
  [[ca, 480], [cb, -480]].forEach(([c, dx], i) => {
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, x: dx, scale: 0.6, rotationY: 0, transformPerspective: 1600 }, { autoAlpha: 1, x: 0, scale: 1, rotationY: i ? -14 : 14, duration: 0.9, ease: 'power3.out', immediateRender: false }, 84.35 + i * 0.12);
    tl.to(c, { autoAlpha: 0, x: dx * 0.6, scale: 0.7, duration: 0.5, ease: EASE_IN }, 85.6);
  });

  // filter
  swap(hero, SCR('filter.jpg'), 85.9);
  const fl = ltext('Filter by|[what matters.]', 'h2 cream', 150, 130, L);
  revealLines(fl, [86.0, 86.6]); hide(fl, 92.3, 0.4);
  const chips = [['Space', 86.46, 'L', 360], ['Distance', 87.26, 'R', 380], ['Family', 88.04, 'L', 560], ['Individual', 88.79, 'R', 600], ['Your community', 91.73, 'L', 760]];
  chips.forEach(([s, t, side, y]) => {
    const c = chip(`<span class="dot"></span>${s}`, 0, y, L, 'dark');
    if (side === 'L') { c.style.right = `${W - 700}px`; c.style.left = 'auto'; } else c.style.left = '1220px';
    pop(c, t, { x: side === 'L' ? 60 : -60, scale: 0.9 });
    out(c, 92.3);
  });
  tap(hero, 0.25, 0.825, 86.5); tap(hero, 0.43, 0.825, 88.1); tap(hero, 0.72, 0.947, 91.95);
  pose(hero, 92.2, { x: 960, y: 1700, ry: 0, rx: 20, dur: 0.8, ease: 'power3.in' });

  // perfect home
  const P = el('<div class="layer"></div>', L); gsap.set(P, { autoAlpha: 0 });
  const pw = photo(PH('walk-wide.jpg'), {}, P);
  el('<div class="layer shade-l"></div>', P);
  show(P, 92.45, null, 0.7);
  kenburns(pw, 92.45, 97, 1.15, 1.0);
  const ph1 = ltext('Find your|[perfect home.]', 'h1 cream', 140, 340, P);
  revealLines(ph1, [92.75, 93.6]);
  const ph2 = ltext('Not just an empty room.', 'h3 cream', 145, 610, P, 'opacity:.85');
  reveal(ph2, 94.85);
}

// =====================================================================
// 02 OWN  96.5 – 136.8
// =====================================================================
{
  const L = layer('bg-navy-soft persp'); show(L, 96.45, 136.9, 0.5, 0.3);
  chapterTitle('Own', 96.5, { parent: L });
  chapterLabel('02', 'Own', 97.35, 132.0);
  const p = phone(SCR('login.jpg'), { parent: L });
  setPose(p, { x: 2300, ry: -25 });
  pose(p, 96.9, { x: 1260, ry: -12, dur: 1.2, ease: 'power3.out' });

  const v = ltext('Verify your identity|[in seconds.]', 'h2 cream', 170, 410, L);
  revealLines(v, [97.4, 97.95]); hide(v, 99.7, 0.4);
  // Face ID scan
  const scrim = ov(p, '', [0, 0, 1, 1], 'background:rgba(2,12,31,.62);z-index:12');
  const fid = ov(p, `<svg viewBox="0 0 100 100" width="100%" height="100%"><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
    <path d="M8 26V14a6 6 0 0 1 6-6h12M74 8h12a6 6 0 0 1 6 6v12M92 74v12a6 6 0 0 1-6 6H74M26 92H14a6 6 0 0 1-6-6V74"/>
    <path d="M34 36v6M66 36v6M50 40v16h-5M38 66c6 6 18 6 24 0"/></g></svg>`, [0.28, 0.3, 0.44, 0.2], 'z-index:13');
  const scan = ov(p, '', [0.3, 0.31, 0.4, 0.004], 'background:linear-gradient(90deg,transparent,#E6BFA4,transparent);z-index:14;box-shadow:0 0 18px 4px rgba(230,191,164,.6)');
  const ok = ov(p, `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;color:#fff;font-size:22px;font-weight:500"><span class="tick" style="width:64px;height:64px">${ICON.check}</span>Identity verified</div>`, [0.1, 0.55, 0.8, 0.12], 'z-index:14;display:flex;justify-content:center');
  [scrim, fid, scan, ok].forEach(e => gsap.set(e, { autoAlpha: 0 }));
  tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, 97.6);
  tl.fromTo(fid, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE, immediateRender: false }, 97.7);
  tl.fromTo(scan, { autoAlpha: 1, top: '31%' }, { top: '49%', duration: 0.55, repeat: 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 97.9);
  tl.to(scan, { autoAlpha: 0, duration: 0.2 }, 99.0);
  tl.to(fid.querySelector('g'), { stroke: '#E6BFA4', duration: 0.3 }, 99.0);
  pop(ok, 99.05);
  tl.to([scrim, fid, ok], { autoAlpha: 0, duration: 0.35 }, 99.7);

  // request · visit · reserve
  pose(p, 99.6, { x: 1150, ry: -12, dur: 0.8 });
  swap(p, SCR('project.jpg'), 99.9);
  const rv = ltext('Request information.|Book a dedicated visit.|[Reserve your unit.]', 'h2 cream', 170, 330, L, 'line-height:1.45');
  revealLines(rv, [99.95, 101.5, 103.75]);
  focusLine(rv, 0, 99.95); focusLine(rv, 1, 101.5); focusLine(rv, 2, 103.75);
  hide(rv, 105.1, 0.45);
  tap(p, 0.5, 0.55, 100.2);
  const k1 = pop(chip(`<span class="tick">${ICON.check}</span>Information requested`, 1500, 300, L), 100.4);
  const k2 = pop(chip(`<span class="tick">${ICON.check}</span>Visit booked · Thu 10:00 AM`, 1500, 400, L), 101.9);
  swap(p, SCR('payment.jpg'), 103.55);
  tap(p, 0.5, 0.973, 104.45);
  const k3 = pop(chip(`<span class="tick">${ICON.check}</span>Unit A4 reserved`, 1500, 500, L), 104.6);
  [k1, k2, k3].forEach(k => out(k, 105.1));
  // the chips would overflow the right edge — keep them right-aligned to the frame
  [k1, k2, k3].forEach(k => { k.style.left = 'auto'; k.style.right = '40px'; });

  // contract
  pose(p, 105.1, { x: 640, ry: 12, dur: 1.0 });
  swap(p, SCR('esign.png'), 105.3);
  const sg = ltext('Review your contract.|Sign it digitally|and [securely.]', 'h2 cream', 1060, 330, L, 'line-height:1.3');
  revealLines(sg, [105.4, 106.85, 108.2]); hide(sg, 109.45, 0.45);
  const patch = ov(p, '', [0.285, 0.565, 0.42, 0.085], 'background:#f1e9e3');
  tl.set(patch, { clipPath: 'inset(0% 0% 0% 0%)' }, 105.3);
  tl.to(patch, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.15, ease: 'power1.inOut' }, 107.05);
  tap(p, 0.5, 0.815, 108.45);
  const sb = pop(chip('<span class="tick">' + ICON.check + '</span>Signed securely', 760, 880, L), 108.75);
  out(sb, 109.45);

  // everything with you
  pose(p, 109.4, { x: 1260, ry: -12, dur: 1.0 });
  swap(p, SCR('profile.jpg'), 109.65);
  const op = ltext('One platform.|[Everything with you.]', 'h2 cream', 170, 260, L);
  revealLines(op, [109.85, 111.85]); hide(op, 113.2, 0.4);
  const ev = ltext('Every payment.|Every stage.|Every update.', 'h2 cream', 170, 230, L, 'line-height:1.35');
  revealLines(ev, [113.42, 114.7, 115.98]);
  focusLine(ev, 0, 113.42); focusLine(ev, 1, 114.7); focusLine(ev, 2, 115.98);
  hide(ev, 117.15, 0.4);
  tap(p, 0.5, 0.86, 113.5);
  const infoCard = (title, big, sub, extra = '') => el(`<div class="card" style="left:170px;top:560px;width:560px;padding:34px 38px">
      <div class="label" style="font-size:15px;color:#A27063">${title}</div>
      <div style="font-size:52px;font-weight:400;margin-top:10px">${big}</div>
      <div style="font-size:24px;opacity:.65;margin-top:6px">${sub}</div>${extra}</div>`, L);
  const ic1 = infoCard('Next installment', 'SAR 18,500', '15 Sep 2026 · 7 of 12 paid',
    '<div style="margin-top:22px;height:10px;border-radius:9px;background:#e1d7d0;overflow:hidden"><div class="bar" style="height:100%;width:58%;border-radius:9px;background:#041E42"></div></div>');
  const ic2 = infoCard('Current stage', 'Exterior & facade', 'Stage 3 of 5 · On schedule');
  const ic3 = infoCard('Latest update', 'Level 14 slab poured', 'Today · 2 new photos');
  [ic1, ic2, ic3].forEach(c => gsap.set(c, { autoAlpha: 0 }));
  pop(ic1, 113.6); tl.fromTo(ic1.querySelector('.bar'), { width: '0%' }, { width: '58%', duration: 1.0, ease: EASE, immediateRender: false }, 113.9);
  tl.to(ic1, { autoAlpha: 0, y: -40, duration: 0.4 }, 114.7); pop(ic2, 114.8);
  tl.to(ic2, { autoAlpha: 0, y: -40, duration: 0.4 }, 115.98); pop(ic3, 116.1);
  out(ic3, 117.15);

  // construction tracking
  pose(p, 117.1, { x: 640, ry: 12, dur: 1.0 });
  swap(p, SCR('construction.png'), 117.35);
  const sh = p.sh;
  const bar = ov(p, `<div style="position:absolute;left:0;right:0;top:30%;height:46%;border-radius:20px;background:#e1d7d0;overflow:hidden"><div class="f" style="height:100%;width:0%;background:#0b3058;border-radius:20px"></div></div>`, [0.30, 0.394, 0.635, 0.024], 'background:#f3ede8');
  const pct = ov(p, `<span class="n" style="font-size:${sh * 0.0225}px;font-weight:600;color:#0b2a55;line-height:1">0%</span>`, [0.172, 0.39, 0.12, 0.026], 'background:#f3ede8;display:flex;align-items:center');
  tl.fromTo(bar.querySelector('.f'), { width: '0%' }, { width: '65.7%', duration: 1.9, ease: 'power2.out', immediateRender: false }, 117.75);
  count(pct.querySelector('.n'), 0, 68, 117.75, 1.9, v => Math.round(v) + '%');
  const big = el('<div class="abs h0 cream" style="left:1060px;top:300px;font-size:220px"><span class="w n">0%</span></div>', L);
  gsap.set(big, { autoAlpha: 0 });
  const bigN = big.querySelector('.n');
  reveal(big, 117.5, { stagger: 0 });
  count(bigN, 0, 68, 117.75, 1.9, v => Math.round(v) + '%');
  const cl = ltext('CONSTRUCTION PROGRESS', 'label', 1068, 270, L, 'color:#D6A58C');
  reveal(cl, 117.5);
  const tp = ltext('Track the progress|of [construction.]', 'h2 cream', 1060, 560, L);
  revealLines(tp, [117.45, 118.3]);
  [big, cl, tp].forEach(e => hide(e, 119.45, 0.45));
  // reports
  const ar = ltext('Access [reports.]', 'h2 cream', 1060, 190, L);
  reveal(ar, 119.65); hide(ar, 121.0, 0.4);
  const rep = photoCard(PH('report-folder.jpg'), { x: 1060, y: 330, w: 700, h: 430, pos: '55% 50%' }, L);
  gsap.set(rep, { autoAlpha: 0 });
  tl.fromTo(rep, { autoAlpha: 0, y: 80, rotationX: 22, transformPerspective: 1800 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.9, ease: EASE, immediateRender: false }, 119.75);
  tl.to(rep, { autoAlpha: 0, y: -60, duration: 0.45, ease: EASE_IN }, 121.0);
  const rl = pop(chip('Monthly report · PDF', 1100, 790, L), 120.3); out(rl, 121.0);
  // live updates
  const lw = ltext('Watch your project|take shape, [live.]', 'h2 cream', 1060, 170, L);
  revealLines(lw, [121.3, 122.3]); hide(lw, 124.4, 0.45);
  const lv = crop(SCR('construction.png'), [0, 0.012, 1, 0.2], 700, { radius: 30, style: 'left:1060px;top:420px;box-shadow:0 50px 100px rgba(0,0,0,.5)' }, L);
  gsap.set(lv, { autoAlpha: 0 });
  tl.fromTo(lv, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, immediateRender: false }, 121.2);
  const lvb = el('<div class="chip" style="left:24px;top:24px;padding:10px 20px;font-size:20px"><span class="dot live"></span>LIVE</div>', lv);
  tl.to(lvb.querySelector('.dot'), { opacity: 0.25, duration: 0.5, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 121.5);
  const lvc = pop(chip('<span class="dot"></span>Level 14 · Slab poured today', 1100, 760, L, 'dark'), 123.1);
  [lv, lvc].forEach(e => out(e, 124.4));
  pose(p, 124.3, { x: -320, ry: 30, dur: 0.9, ease: 'power3.in' });

  // handover
  const hd = ctext('When it is time for [handover,]|we take care of the details.', 'h2 cream', 170, L);
  revealLines(hd, [124.75, 126.55]); hide(hd, 132.0, 0.5);
  const ck = el(`<div class="card" style="left:610px;top:430px;width:700px;padding:26px 44px"></div>`, L);
  const items = [['Licenses', 128.41], ['Documentation', 129.24], ['Inspections', 130.58], ['Keys handed over', 131.3]];
  items.forEach(([s, t], i) => {
    const row = el(`<div style="display:flex;align-items:center;gap:26px;padding:22px 0;${i ? 'border-top:1px solid rgba(4,30,66,.1)' : ''}">
      <div style="position:relative;width:46px;height:46px"><div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(4,30,66,.25)"></div>
      <div class="tk" style="position:absolute;inset:0;border-radius:50%;background:var(--rose);display:flex;align-items:center;justify-content:center">${ICON.check.replace('<svg', '<svg width="26" height="26"')}</div></div>
      <div style="font-size:36px;font-weight:400">${s}</div></div>`, ck);
    const tk = row.querySelector('.tk'); gsap.set(tk, { autoAlpha: 0 });
    tl.fromTo(tk, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)', immediateRender: false }, t);
  });
  gsap.set(ck, { autoAlpha: 0 });
  tl.fromTo(ck, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, immediateRender: false }, 126.9);
  out(ck, 132.0, 0.5);

  // enjoy the moment
  const E = el('<div class="layer"></div>', L); gsap.set(E, { autoAlpha: 0 });
  el('<div class="abs bg-cream" style="left:0;top:0;width:960px;height:1080px"></div>', E);
  const ep = photo(PH('walk-portrait.jpg'), { x: 960, w: 960, h: 1080, pos: '50% 35%' }, E);
  show(E, 132.1, null, 0.8);
  kenburns(ep, 132.1, 137.2, 1.12, 1.0);
  const en = ltext('Enjoy|the [moment.]', 'h1 navy', 140, 330, E);
  revealLines(en, [132.45, 133.3]);
  const er = ltext('[ZOOD] takes care of the rest.', 'h3 navy', 145, 600, E, 'opacity:.85');
  reveal(er, 134.45);
}

// =====================================================================
// 03 LIVE  136.5 – 164.1
// =====================================================================
{
  const L = layer('bg-day persp'); show(L, 136.45, 164.4, 0.5, 0.4);
  const N = el('<div class="layer bg-navy"></div>', L);
  // night bokeh
  const r = rng(21);
  for (let i = 0; i < 40; i++) {
    const s = 6 + r() * 26;
    el(`<div class="abs" style="left:${r() * 1920}px;top:${r() * 1080}px;width:${s}px;height:${s}px;border-radius:50%;background:rgba(230,191,164,${0.08 + r() * 0.25});filter:blur(${r() * 4}px)"></div>`, N);
  }
  gsap.set(N, { autoAlpha: 0 });
  tl.to(N, { autoAlpha: 1, duration: 2.6, ease: 'sine.inOut' }, 160.3);

  chapterTitle('Live', 136.5, { parent: L, color: 'navy' });
  chapterLabel('03', 'Live', 137.25, 163.9, 'navy');
  const p = phone(SCR('profile.jpg'), { parent: L });
  setPose(p, { x: 2300, ry: -25 });
  pose(p, 136.8, { x: 1260, ry: -12, dur: 1.2, ease: 'power3.out' });
  const yh = ltext('Your home.|Your property.', 'h1 navy', 160, 380, L);
  revealLines(yh, [137.05, 138.05]); hide(yh, 139.3, 0.4);
  tap(p, 0.25, 0.42, 137.3);
  const em = ltext('Everything that matters,|[protected securely]|and managed seamlessly.', 'h2 navy', 160, 330, L, 'line-height:1.3');
  revealLines(em, [139.45, 141.1, 142.65]); hide(em, 144.25, 0.4);
  const shield = el(`<svg class="abs" viewBox="0 0 72 72" width="96" height="96" style="left:165px;top:650px"><g fill="none" stroke="#A27063" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M36 6l24 9v18c0 16-10 27-24 33C22 60 12 49 12 33V15z"/><path d="M26 36l7 7 14-15"/></g></svg>`, L);
  shield.querySelectorAll('path').forEach((pth, i) => strokeDraw(pth, 141.2 + i * 0.5, 0.9));
  out(shield, 144.25);

  // community
  pose(p, 144.25, { x: 960, ry: 0, dur: 1.0 });
  swap(p, SCR('community.png'), 144.45);
  const yc = ltext('Your community,|in [one place.]', 'h2 navy', 140, 400, L);
  revealLines(yc, [144.5, 147.0]); hide(yc, 148.25, 0.35);
  const mo = text('[More]', 'h1', 'left:100px;width:620px;top:470px;text-align:right', L);
  reveal(mo, 148.45, { stagger: 0 }); hide(mo, 154.9, 0.45);
  swapWords([['presence.', 148.76], ['connection.', 149.99], ['efficiency.', 151.35], ['possibilities.', 152.84]], L,
    (s) => ltext(s, 'h1 navy', 1210, 470, L, 'font-size:88px')).forEach((e, i, a) => { if (i === a.length - 1) hide(e, 154.9, 0.45); });
  tap(p, 0.82, 0.29, 149.2);

  // services
  pose(p, 154.9, { x: 1120, ry: -10, dur: 0.9 });
  const sv = ['Cleaning', 'Delivery', 'Meeting room', 'Facilities', 'Maintenance', 'Concierge'];
  sv.forEach((s, i) => {
    const c = chip(`<span class="dot"></span>${s}`, 1420 + (i % 2) * 90, 230 + i * 110, L);
    pop(c, 155.2 + i * 0.28, { x: -70, scale: 0.9 });
    out(c, 157.65);
  });
  const en = ltext('Everything|you need,|[whenever you]|[need it.]', 'h2 navy', 140, 300, L);
  revealLines(en, [155.15, 155.6, 156.45, 156.8]); hide(en, 157.65, 0.4);

  // always with you · chat
  pose(p, 157.6, { x: 1000, ry: -10, dur: 1.0 });
  const aw = ltext('As if [ZOOD] is|always with you.', 'h2 navy', 160, 380, L);
  revealLines(aw, [157.9, 158.75]);
  tl.to(aw, { color: '#F4EEE8', duration: 2.0 }, 160.4);
  hide(aw, 161.95, 0.45);
  const b1 = el('<div class="chip dark" style="left:auto;right:90px;top:330px;border-radius:30px 30px 8px 30px;font-weight:400">Can I book the gym at 7 PM?</div>', L);
  const b2 = el(`<div class="chip" style="left:auto;right:120px;top:440px;border-radius:30px 30px 30px 8px;font-weight:400"><img src="${A('brand/symbol-navy.png')}" style="height:28px">Booked. See you at 7 PM.</div>`, L);
  [b1, b2].forEach(b => gsap.set(b, { autoAlpha: 0 }));
  pop(b1, 158.3, { y: 30, scale: 0.85 }); pop(b2, 159.45, { y: 30, scale: 0.85 });
  [b1, b2].forEach(b => out(b, 163.9));
  const dn = ltext('Day', 'h0', 160, 380, L, 'color:#F4EEE8');
  const dn2 = ltext('[and night.]', 'h0', 160, 560, L);
  reveal(dn, 162.4, { stagger: 0 }); reveal(dn2, 163.1, { stagger: 0.08 });
  [dn, dn2].forEach(e => hide(e, 164.05, 0.4));
  pose(p, 163.9, { x: 1000, y: 1700, ry: -12, dur: 0.6, ease: 'power3.in' });
  chapterLabels[chapterLabels.length - 1].push(160.5);   // label turns cream at night
}

// =====================================================================
// 04 INVEST  164.0 – 179.3
// =====================================================================
{
  const L = layer('bg-navy persp'); show(L, 163.95, 179.6, 0.5, 0.5);
  chapterTitle('Invest', 164.1, { parent: L });
  chapterLabel('04', 'Invest', 164.95, 178.7);
  const fi = ctext('For those who invest in what we build,|[there is something more.]', 'h2 cream', 420, L);
  revealLines(fi, [164.85, 166.6]); hide(fi, 167.85, 0.45);

  const pb = phone(SCR('mortgage.jpg'), { parent: L });
  const p = phone(SCR('yield.png'), { parent: L });
  setPose(pb, { x: 860, y: 1700, ry: 22, s: 0.86 }); setPose(p, { x: 600, y: 1700, ry: 12 });
  tl.set(pb, { filter: 'brightness(.55)' }, 0);
  pose(pb, 168.0, { x: 860, y: 540, ry: 22, s: 0.86, dur: 1.2, ease: 'power3.out' });
  pose(p, 167.9, { x: 600, y: 540, ry: 12, dur: 1.2, ease: 'power3.out' });
  sheen(p, 169.2);
  const chart = ov(p, '', [0.13, 0.33, 0.82, 0.175], 'background:#f4efea');
  tl.set(chart, { clipPath: 'inset(0% 0% 0% 0%)' }, 167.9);
  tl.to(chart, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.8, ease: 'power1.inOut' }, 168.6);

  const mk = ltext('Make your property|[work for you.]', 'h2 cream', 1120, 260, L);
  revealLines(mk, [168.1, 170.0]);
  const tg = el(`<div class="abs" style="left:1120px;top:560px;width:690px;height:96px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(214,165,140,.35)">
      <div class="knob" style="position:absolute;top:8px;left:8px;width:220px;height:78px;border-radius:999px;background:linear-gradient(100deg,#B07A63,#E6BFA4 55%,#B5816A);box-shadow:0 10px 30px rgba(162,112,99,.45)"></div>
      ${['Long-term', 'Short stays', 'Sale'].map((s, i) => `<div class="opt" style="position:absolute;top:0;left:${8 + i * 225}px;width:220px;height:96px;display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:500">${s}</div>`).join('')}</div>`, L);
  const tlab = ltext('YIELD MANAGER', 'label', 1124, 518, L, 'color:#D6A58C');
  gsap.set(tg, { autoAlpha: 0 });
  pop(tg, 170.6); reveal(tlab, 170.6);
  const knob = tg.querySelector('.knob'), opts = tg.querySelectorAll('.opt');
  gsap.set(knob, { autoAlpha: 0 });
  const caps = [['Long-term leasing.', 171.34], ['Short stays.', 172.78], ['Or selling.', 173.94]];
  caps.forEach(([, t], i) => {
    if (i === 0) tl.fromTo(knob, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, t);
    else tl.to(knob, { left: 8 + i * 225, duration: 0.55, ease: 'power3.inOut' }, t - 0.05);
    opts.forEach((o, j) => tl.to(o, { color: j === i ? '#041E42' : 'rgba(244,238,232,.6)', duration: 0.3 }, t));
  });
  gsap.set(opts, { color: 'rgba(244,238,232,.6)' });
  swapWords([...caps, ['You choose in seconds.', 175.04], ['[ZOOD] takes care of the rest.', 176.9]], L,
    (s) => ltext(s, 'h3 cream', 1124, 700, L)).forEach((e, i, a) => { if (i === a.length - 1) hide(e, 178.6, 0.5); });
  tl.to(knob, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 }, 175.2);
  hide(mk, 178.6, 0.5); out(tg, 178.6, 0.5); out(tlab, 178.6, 0.5);
  pose(p, 178.5, { x: 600, y: 1700, dur: 0.8, ease: 'power3.in' });
  pose(pb, 178.55, { x: 860, y: 1700, dur: 0.8, ease: 'power3.in' });
}

// =====================================================================
// FINALE  179.0 – 201   wall of screens → bento grid → logo → end card
// =====================================================================
const ALL = ['onboarding.jpg', 'map.jpg', 'walkthrough.png', 'compare.png', 'filter.jpg', 'explore.jpg', 'login.jpg', 'project.jpg', 'esign.png',
  'payment.jpg', 'profile.jpg', 'construction.png', 'community.png', 'gallery.jpg', 'yield.png', 'mortgage.jpg', 'city3d.jpg', 'splash.jpg'];
const END = 201;
{
  const L = layer('bg-navy'); show(L, 178.9, null, 0.6);
  // wall
  const wallWrap = el('<div class="layer persp" style="perspective:2200px"></div>', L);
  const wall = el('<div class="abs p3d" style="left:-520px;top:-260px;width:2960px;height:1600px"></div>', wallWrap);
  gsap.set(wall, { rotationX: 30, rotationZ: -14, scale: 1.0 });
  const r = rng(5);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 11; col++) {
    const src = ALL[(row * 11 + col * 5) % ALL.length];
    const x = col * 270 + (row % 2) * 120, y = row * 560;
    const c = el(`<div class="tile" style="left:${x}px;top:${y}px;width:246px;height:535px;border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.55)"><img src="${SCR(src)}" style="width:100%;height:100%;object-fit:cover"></div>`, wall);
    tl.fromTo(c, { autoAlpha: 0, z: -600, y: 120 }, { autoAlpha: 1, z: 0, y: 0, duration: 1.2, ease: EASE, immediateRender: true }, 178.95 + r() * 0.9);
  }
  tl.fromTo(wall, { x: 0 }, { x: -420, duration: 6, ease: 'none', immediateRender: false }, 178.9);
  const wshade = el('<div class="layer" style="background:radial-gradient(60% 45% at 50% 50%, rgba(2,12,31,.9) 0%, rgba(2,12,31,.55) 60%, rgba(2,12,31,.2) 100%)"></div>', L);
  gsap.set(wshade, { autoAlpha: 0 });
  tl.to(wshade, { autoAlpha: 1, duration: 0.6 }, 179.2);
  swapWords([['Discover.', 179.34], ['Own.', 180.45], ['Live.', 181.51], ['[Invest.]', 182.55]], L, (s) => ctext(s, 'h0 cream', 440, L))
    .forEach((e, i, a) => { if (i === a.length - 1) hide(e, 183.45, 0.4); });
  tl.to([wallWrap, wshade], { autoAlpha: 0, duration: 0.7 }, 183.4);

  // bento
  const B = el('<div class="layer"></div>', L);
  const tiles = [];
  const T = (x, y, w, h, inner, bg = '#0b2a55') => {
    const t = el(`<div class="tile" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};border-radius:30px">${inner}</div>`, B);
    tiles.push(t); return t;
  };
  const scrTile = (src) => `<img src="${SCR(src)}" style="position:absolute;left:0;top:50%;width:100%;transform:translateY(-50%)">`;
  const lab = (s, dark) => `<div class="label" style="position:absolute;left:26px;bottom:24px;font-size:16px;color:${dark ? '#041E42' : '#F4EEE8'}">${s}</div>`;
  const shadeB = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,12,31,0) 50%,rgba(2,12,31,.75))"></div>';
  T(48, 48, 300, 460, `<img src="${SCR('community.png')}" style="position:absolute;left:0;top:-8px;width:100%">${shadeB}${lab('Live')}`, '#F4EEE8');
  T(48, 526, 300, 506, `<div style="position:absolute;left:30px;top:34px" class="label navy">Construction</div><div class="navy" style="position:absolute;left:24px;bottom:70px;font-size:120px;font-weight:300">68%</div><div class="navy" style="position:absolute;left:30px;bottom:36px;font-size:22px;opacity:.6">Tracked live</div>`, 'linear-gradient(160deg,#EFE4DA,#DBC8B6)');
  T(366, 48, 300, 300, `<div style="position:absolute;inset:0;background:url('${PH('city-view.jpg')}') center 35%/cover"></div>${shadeB}${lab('Discover')}`);
  T(366, 366, 300, 666, scrTile('walkthrough.png'), '#F4EEE8');
  T(684, 48, 552, 300, `<div style="position:absolute;inset:0;background:url('${PH('reception.jpg')}') center/cover"></div>${shadeB}${lab('Own')}`);
  const txt = T(684, 366, 552, 348, '', 'linear-gradient(160deg,#0f3364,#041E42)');
  txt.style.boxShadow = 'inset 0 0 0 1.5px rgba(214,165,140,.35)';
  T(684, 732, 552, 300, `<img src="${SCR('yield.png')}" style="position:absolute;left:-2%;top:-${0.115 * 552 / 0.46 * 1.04}px;width:104%">${lab('Invest', true)}`, '#F4EEE8');
  T(1254, 48, 300, 666, scrTile('esign.png'), '#F4EEE8');
  T(1254, 732, 300, 300, `<img src="${A('brand/symbol-navy.png')}" style="position:absolute;left:50%;top:50%;width:150px;transform:translate(-50%,-50%)">`, '#F4EEE8');
  T(1572, 48, 300, 300, `<div style="position:absolute;left:30px;top:34px" class="label navy">Average yield</div><div class="navy" style="position:absolute;left:24px;bottom:30px;font-size:104px;font-weight:300">7.8%</div>`, 'linear-gradient(160deg,#C4E1F4,#9BCBEB)');
  T(1572, 366, 300, 666, scrTile('map.jpg'), '#F4EEE8');
  tiles.forEach((t, i) => {
    const cx = parseFloat(t.style.left) + parseFloat(t.style.width) / 2, cy = parseFloat(t.style.top) + parseFloat(t.style.height) / 2;
    const dx = (cx - 960) * 0.35, dy = (cy - 540) * 0.35;
    gsap.set(t, { autoAlpha: 0 });
    tl.fromTo(t, { autoAlpha: 0, x: dx, y: dy, scale: 0.86 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', immediateRender: false }, 183.55 + Math.hypot(cx - 960, cy - 540) / 2600);
    t._c = [cx, cy];
  });
  const d1 = text('Designed for the rhythm|of modern life.', 'h3 cream', 'left:0;width:552px;top:110px;text-align:center', txt);
  revealLines(d1, [184.1, 184.9]); hide(d1, 186.4, 0.4);
  const d2 = text('After construction,|[responsibility begins.]', 'h3 cream', 'left:0;width:552px;top:110px;text-align:center', txt);
  revealLines(d2, [186.6, 187.4]); hide(d2, 189.6, 0.4);
  // collapse into the app icon
  tiles.filter(t => t !== txt).forEach((t) => {
    const [cx, cy] = t._c;
    tl.to(t, { x: 960 - cx, y: 540 - cy, scale: 0.15, autoAlpha: 0, duration: 0.9, ease: 'power3.in' }, 189.75 + (1 - Math.hypot(cx - 960, cy - 540) / 1100) * 0.25);
  });
  tl.to(txt, { left: 850, top: 430, width: 220, height: 220, borderRadius: 54, duration: 0.9, ease: 'power3.inOut' }, 189.8);
  const sym = el(`<img src="${A('brand/symbol-white.png')}" style="position:absolute;left:50%;top:50%;width:120px;transform:translate(-50%,-50%)">`, txt);
  gsap.set(sym, { autoAlpha: 0 });
  tl.to(sym, { autoAlpha: 1, duration: 0.4 }, 190.3);
  tl.to(txt, { scale: 0.5, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 190.95);

  // logo
  const lg = el(`<img class="abs" src="${A('brand/logo-white.png')}" style="left:${960 - 420}px;top:${430 - 145}px;width:840px">`, L);
  gsap.set(lg, { autoAlpha: 0 });
  tl.fromTo(lg, { autoAlpha: 0, scale: 0.86, filter: 'blur(16px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: EASE, immediateRender: false }, 191.05);
  const svg = el(`<svg class="abs" width="1920" height="1080" style="left:0;top:0">${ROSE_GRAD_SVG.replace('id="rg"', 'id="rg2"')}<path d="M 560 655 C 760 655 820 620 960 610 S 1200 585 1360 560" fill="none" stroke="url(#rg2)" stroke-width="2.5" stroke-linecap="round"/></svg>`, L);
  strokeDraw(svg.querySelector('path'), 191.4, 1.6);
  const ll = ctext('Live luxury.  Live [ZOOD.]', 'h2 cream', 690, L);
  tl.set(ll, { autoAlpha: 1 }, 191.3);
  const lw = ll.querySelectorAll('.w');
  tl.fromTo([lw[0], lw[1]], { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1, ease: EASE, immediateRender: true }, 191.35);
  tl.fromTo([lw[2], lw[3]], { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.12, ease: EASE, immediateRender: true }, 193.2);

  // end card
  tl.to(lg, { top: 230 - 145 + 40, scale: 0.72, duration: 1.1, ease: 'power3.inOut' }, 195.6);
  tl.to(svg, { y: -150, autoAlpha: 0.0, duration: 0.8, ease: 'power3.inOut' }, 195.6);
  tl.to(ll, { top: 470, duration: 1.1, ease: 'power3.inOut' }, 195.6);
  const dl = ctext('DOWNLOAD THE ZOOD APP', 'label', 650, L, 'color:#D6A58C');
  reveal(dl, 196.3);
  const badges = el(`<div class="abs" style="left:0;width:1920px;top:720px;display:flex;justify-content:center;gap:28px">
      <img src="${A('brand/app-store.svg')}" style="height:80px;width:270px" class="bd">
      <img src="${A('brand/google-play.svg')}" style="height:80px;width:270px" class="bd"></div>`, L);
  const bds = badges.querySelectorAll('.bd'); gsap.set(bds, { autoAlpha: 0 });
  tl.fromTo(bds, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15, ease: EASE, immediateRender: false }, 196.6);
  const web = ctext('zood.sa', 'h3 cream', 890, L, 'font-size:28px;opacity:.6;letter-spacing:.08em');
  reveal(web, 197.3);
  const black = el('<div class="layer" style="background:#000"></div>', L);
  gsap.set(black, { autoAlpha: 0 });
  tl.to(black, { autoAlpha: 1, duration: 1.0, ease: 'none' }, END - 1.0);
  tl.set({}, {}, END);
}

// ---------- chapter labels (top-left) ----------
{
  const L = el('<div class="layer" style="pointer-events:none"></div>', stage);
  chapterLabels.forEach(([num, word, tIn, tOut, color, tCream]) => {
    const c = color === 'navy' ? '#041E42' : '#F4EEE8';
    const e = el(`<div class="abs label" style="left:110px;top:78px;display:flex;align-items:center;gap:18px;color:${c};font-size:20px">
      <span style="color:#C9977F">${num}</span><span class="ln" style="display:inline-block;width:46px;height:1.5px;background:currentColor;opacity:.5"></span><span>${word}</span></div>`, L);
    gsap.set(e, { autoAlpha: 0 });
    tl.fromTo(e, { autoAlpha: 0, x: -20 }, { autoAlpha: 0.9, x: 0, duration: 0.7, ease: EASE, immediateRender: false }, tIn);
    tl.fromTo(e.querySelector('.ln'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.8, ease: EASE, immediateRender: false }, tIn + 0.1);
    if (tCream) tl.to(e, { color: '#F4EEE8', duration: 2.0 }, tCream);
    tl.to(e, { autoAlpha: 0, duration: 0.5 }, tOut);
  });
}
