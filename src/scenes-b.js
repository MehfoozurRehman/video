// ZOOD app film — VARIANT B ("Editorial rhythm").
// Same voiceover and brand kit as film A, entirely different visual language:
// footage inside type and the ZOOD symbol, brand-stripe wipes, split screens, sliding footage columns,
// marquee type, word tickers, flat phones with UI annotations, loupes, colour-block chapter slabs.

// ---------------------------------------------------------------- helpers
const ctext = (s, cls, top, parent, extra = '') => text(s, cls, `left:0;width:${W}px;top:${top}px;text-align:center;${extra}`, parent);
const ltext = (s, cls, left, top, parent, extra = '') => text(s, cls, `left:${left}px;top:${top}px;${extra}`, parent);
const big = (s, size, extra = '') => `font-weight:600;font-size:${size}px;letter-spacing:.02em;line-height:.95;${extra}`;
function pop(e, t, from = { y: 30, scale: 0.92 }) {
  tl.fromTo(e, { autoAlpha: 0, ...from }, { autoAlpha: 1, y: 0, x: 0, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.6)', immediateRender: false }, t);
  return e;
}
function out(e, t, dur = 0.3) { tl.to(e, { autoAlpha: 0, duration: dur, ease: EASE_IN }, t); }
function slam(e, t, { from = 1.35 } = {}) {   // word slams in with a short motion blur
  tl.set(e, { autoAlpha: 1 }, t);
  tl.fromTo(e.querySelectorAll('.w'), { opacity: 0, scale: from, filter: 'blur(18px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.38, stagger: 0.03, ease: 'power4.out', immediateRender: true }, t);
  return e;
}
function setP(p, x, y = 540, s = 1, extra = {}) { gsap.set(p, { left: x - p.pw / 2, top: y - p.phh / 2, scale: s, transformPerspective: 2600, ...extra }); }
function moveP(p, t, x, y = 540, s = 1, dur = 0.7, extra = {}) { tl.to(p, { left: x - p.pw / 2, top: y - p.phh / 2, scale: s, duration: dur, ease: 'power3.inOut', ...extra }, t); }
// a footage panel (rect) that can slide in from any side
function panel(parent, shot, t0, t1, { x = 0, y = 0, w = W, h = H, rate = 1, pos = 'center', radius = 0, shade = 0 } = {}) {
  const p = el(`<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden;border-radius:${radius}px"></div>`, parent);
  vclip(p, shot, t0, t1, { rate, pos });
  if (shade) el(`<div class="abs" style="inset:0;background:rgba(2,12,31,${shade})"></div>`, p);
  return p;
}
// stripe reveal of a full-frame element: vertical bands widen until the element is whole
function stripeReveal(e, t, dur = 0.7, band = 160) {
  e.style.setProperty('--sw', '0px');
  e.style.webkitMaskImage = `repeating-linear-gradient(90deg, #000 0 var(--sw), transparent var(--sw) ${band}px)`;
  tl.fromTo(e, { '--sw': '0px' }, { '--sw': `${band + 1}px`, duration: dur, ease: 'power3.inOut', immediateRender: true }, t);
}
// rolling word ticker (slot window); returns the times each word lands
function ticker(parent, words, times, { left, top, size = 150, color = '#F4EEE8' }) {
  const hh = Math.round(size * 1.3);
  const win = el(`<div class="abs" style="left:${left}px;top:${top - size * 0.15}px;height:${hh}px;overflow:hidden"></div>`, parent);
  const col = el(`<div style="position:relative">${words.map(w => `<div style="height:${hh}px;${big('', size)};line-height:${hh}px;color:${color};white-space:nowrap">${w}</div>`).join('')}</div>`, win);
  times.forEach((t, i) => { if (i) tl.to(col, { y: -i * hh, duration: 0.45, ease: 'power4.inOut' }, t - 0.2); });
  return win;
}
// chapter slab: a colour block rises with a giant number + word, then lifts away
function slab(t, num, word, { bg = '#A27063', fg = '#F4EEE8', z = 70 } = {}) {
  const S = zlayer(z);
  const b = el(`<div class="abs" style="inset:0;background:${bg}"></div>`, S);
  const n = el(`<div class="abs" style="left:120px;top:120px;${big('', 420, `color:${fg};opacity:.95`)}">${num}</div>`, S);
  const wd = el(`<div class="abs" style="left:130px;top:620px;${big('', 170, `color:transparent;-webkit-text-stroke:2px ${fg}`)}">${word}</div>`, S);
  const ln = el(`<div class="abs" style="left:130px;top:580px;width:1660px;height:2px;background:${fg};opacity:.5;transform-origin:0 50%"></div>`, S);
  tl.set(S, { autoAlpha: 1 }, t);
  tl.fromTo(b, { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: 'power4.inOut', immediateRender: false }, t);
  gsap.set([n, wd, ln], { opacity: 0 });
  tl.fromTo(n, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 0.95, duration: 0.5, ease: 'power4.out', immediateRender: false }, t + 0.38);
  tl.fromTo(ln, { scaleX: 0, opacity: 0.5 }, { scaleX: 1, opacity: 0.5, duration: 0.5, ease: 'power3.inOut', immediateRender: false }, t + 0.4);
  tl.fromTo(wd, { x: 400, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power4.out', immediateRender: false }, t + 0.42);
  tl.to([n, wd, ln], { yPercent: -40, opacity: 0, duration: 0.3, ease: 'power2.in' }, t + 1.0);
  tl.to(b, { yPercent: -100, duration: 0.45, ease: 'power4.inOut' }, t + 1.05);
  tl.set(S, { autoAlpha: 0 }, t + 1.55);
  return t + 0.45;   // fully covered from here until t + 1.05
}
const ROSE_GRAD_SVG_B = `<defs><linearGradient id="rgb" x1="0" x2="1"><stop offset="0" stop-color="#7a4e40"/><stop offset=".5" stop-color="#E6BFA4"/><stop offset="1" stop-color="#A27063"/></linearGradient></defs>`;
const TICK = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// =====================================================================
// B1  "Luxury … in every detail."  — footage inside the word, zoom through a letter
// =====================================================================
{
  const TB = at('but luxury'), TM = at('more presence');
  const L = layer(); show(L, 0, TM + 0.3, 0.01, 0.2);
  el('<div class="layer" style="background:#020c1f"></div>', L);
  const ghost = panel(L, 'sunrise', 0, TB + 0.6, { rate: 1.3 }); ghost.style.opacity = 0;
  tl.to(ghost, { opacity: 0.22, duration: 2.5 }, 0.6);
  const LX = el('<div class="layer"></div>', L);
  vclip(LX, 'sunrise', 0, TB + 0.6, { rate: 1.3 });
  textMask(LX, 'LUXURY', { size: 330, spacing: 30 });
  tl.fromTo(LX, { scale: 1.25, filter: 'brightness(1.6)' }, { scale: 1, filter: 'brightness(1.15)', duration: 3.6, ease: 'power3.out', immediateRender: true }, 0);
  // thin brand lines draw down first
  const ln = kinkLines(L, { n: 10, color: 'rgba(214,165,140,.55)', width: 1.4, seed: 4, dx: 40 });
  ln.paths.forEach((p, i) => strokeDraw(p, 0.05 + i * 0.05, 1.1, 'power2.out'));
  tl.to(ln.svg, { autoAlpha: 0, duration: 0.8 }, 1.6);
  const cap = ctext('ALWAYS AT THE HEART OF [ZOOD]', 'label', 760, L, 'font-size:24px;letter-spacing:.5em;color:#F4EEE8');
  reveal(cap, at('it has always'), { stagger: 0.05, dur: 0.5 }); out(cap, TB - 0.4);
  // zoom through the letters; full footage fades up underneath
  const FULLF = panel(L, 'sunrise', 0, TB + 0.6, { rate: 1.3 }); gsap.set(FULLF, { autoAlpha: 0 });
  L.insertBefore(FULLF, LX);
  tl.to(LX, { scale: 22, transformOrigin: '36% 50%', duration: 0.75, ease: 'power3.in' }, TB - 0.45);
  tl.to(FULLF, { autoAlpha: 1, duration: 0.4 }, TB - 0.25);
  // in every detail — four vertical detail panels slicing in
  const det = ['facade', 'interior', 'dining', 'swim'].map((s, i) => {
    const p = panel(L, s, TB + 0.1, TM + 0.4, { x: i * 480, w: 482, rate: 0.9 });
    gsap.set(p, { autoAlpha: 0 });
    tl.fromTo(p, { autoAlpha: 1, yPercent: i % 2 ? -100 : 100 }, { yPercent: 0, duration: 0.55, ease: 'power4.out', immediateRender: false }, TB + 0.15 + i * 0.07);
    tl.fromTo(p.firstChild, { scale: 1.3 }, { scale: 1.05, duration: 2.4, ease: 'none', immediateRender: false }, TB + 0.15);
    return p;
  });
  [1, 2, 3].forEach(i => el(`<div class="abs" style="left:${i * 480}px;top:0;width:2px;height:1080px;background:#D6A58C;opacity:.7"></div>`, L));
  const band = el('<div class="abs" style="left:0;top:430px;width:1920px;height:220px;background:rgba(2,12,31,.55)"></div>', L);
  gsap.set(band, { autoAlpha: 0 }); tl.fromTo(band, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.4, ease: 'power3.out', immediateRender: false }, at('in every detail') - 0.1);
  slam(ctext('IN EVERY [DETAIL]', '', 455, L, big('', 150, 'color:#F4EEE8')), at('in every detail'));
}

// =====================================================================
// B2  "More ___"  — rolling ticker + stripe-revealed full-frame footage + counter
// =====================================================================
{
  const TM = at('more presence'), T0 = at('because true luxury');
  const W5 = [['PRESENCE.', at('presence'), 'frontal'], ['LIVING.', at('living'), 'arcade'], ['PERSONALIZATION.', at('personalization'), 'window'],
    ['COMFORT.', at('comfort'), 'pool'], ['TIME.', at('time for what'), 'pavilion']];
  const L = layer(); show(L, TM - 0.35, T0 + 0.6, 0.01, 0.2);
  W5.forEach(([, t, shot], i) => {
    const f = panel(L, shot, t - 0.3, (W5[i + 1] ? W5[i + 1][1] : T0) + 0.6, { rate: 1 });
    tl.fromTo(f.firstChild, { scale: 1.2 }, { scale: 1.02, duration: 2.0, ease: 'power2.out', immediateRender: false }, t - 0.3);
    if (i) stripeReveal(f, t - 0.3, 0.55); else gsap.set(f, { autoAlpha: 0 }), tl.set(f, { autoAlpha: 1 }, t - 0.35);
  });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.85) 0%,rgba(2,12,31,.4) 55%,rgba(2,12,31,.1))"></div>', L);
  const more = ltext('MORE', '', 120, 300, L, big('', 210, 'color:transparent;-webkit-text-stroke:2.5px #E6BFA4'));
  slam(more, TM, { from: 1.2 });
  ticker(L, W5.map(w => w[0]), W5.map(w => w[1]), { left: 124, top: 500, size: 140 });
  const sub = ltext('FOR WHAT TRULY MATTERS.', 'label', 130, 690, L, 'font-size:30px;letter-spacing:.4em;color:#D6A58C');
  reveal(sub, at('for what truly'), { stagger: 0.05, dur: 0.4 });
  const cnt = el('<div class="abs" style="right:120px;top:110px;font-size:30px;font-weight:500;letter-spacing:.2em;color:#F4EEE8"><span class="n">01</span> / 05</div>', L);
  gsap.set(cnt, { autoAlpha: 0 }); tl.to(cnt, { autoAlpha: 1, duration: 0.3 }, TM);
  W5.forEach(([, t], i) => tl.set(cnt.querySelector('.n'), { textContent: `0${i + 1}` }, t - 0.1));
  const bar = el('<div class="abs" style="right:120px;top:160px;width:300px;height:3px;background:rgba(244,238,232,.25)"><div class="f" style="height:100%;width:100%;background:#E6BFA4;transform-origin:0 50%"></div></div>', L);
  tl.fromTo(bar.querySelector('.f'), { scaleX: 0 }, { scaleX: 1, duration: T0 - TM, ease: 'none', immediateRender: true }, TM);
}

// =====================================================================
// B3  editorial split screen on cream — split line moves on every statement
// =====================================================================
{
  const T0 = at('because true luxury'), TA = at('it is about having'), TH = at('and that is exactly'), TW = at('that is why'), TX = at('it is an experience'), T1 = at('traditionally');
  const cov = stripeWipe(T0 - 0.75, { color: '#F4EEE8', color2: '#DBC8B6' });
  const L = layer('bg-cream'); show(L, cov, T1 + 0.2, 0.01, 0.2);
  // right footage panel whose left edge is the moving split
  const R = el('<div class="abs" style="left:1060px;top:0;width:860px;height:1080px;overflow:hidden"></div>', L);
  const shots = [['pergola', cov, TA + 0.6, 0.8], ['garden', TA - 0.3, TH + 0.4, 0.9], ['bench', TW - 0.3, T1 + 0.5, 0.7]];
  shots.forEach(([s, t, t1, rate], i) => {
    const b = el('<div class="abs" style="inset:0;overflow:hidden"></div>', R); vclip(b, s, t, t1, { rate });
    if (i) tl.fromTo(b, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.inOut', immediateRender: true }, t);
  });
  const split = el('<div class="abs" style="left:1060px;top:0;width:3px;height:1080px;background:#A27063"></div>', L);
  const setSplit = (t, x, d = 0.7) => { tl.to(R, { left: x, width: W - x, duration: d, ease: 'power4.inOut' }, t); tl.to(split, { left: x, duration: d, ease: 'power4.inOut' }, t); };
  tl.fromTo(R, { left: 1920, width: 0 }, { left: 1060, width: 860, duration: 0.7, ease: 'power4.out', immediateRender: false }, cov);
  tl.fromTo(split, { left: 1920 }, { left: 1060, duration: 0.7, ease: 'power4.out', immediateRender: false }, cov);
  // statement 1 + "things" struck through
  const lb1 = ltext('TRUE LUXURY', 'label', 140, 170, L, 'font-size:22px;letter-spacing:.45em;color:#A27063'); reveal(lb1, T0, { dur: 0.4 });
  const s1 = ltext('is not about|having more', 'h2 navy', 140, 230, L, 'font-size:86px'); rise(s1, T0 + 0.1, { lineGap: [T0 + 0.1, at('having more things')] });
  const th = el('<div class="abs" style="left:140px;top:450px"></div>', L);
  for (let i = 0; i < 4; i++) {
    const w = el(`<div style="position:relative;${big('', 110, `color:${i ? 'rgba(4,30,66,.25)' : '#041E42'}`)}">THINGS<div class="st" style="position:absolute;left:0;top:52%;height:6px;width:100%;background:#A27063;transform-origin:0 50%"></div></div>`, th);
    gsap.set(w, { autoAlpha: 0 }); gsap.set(w.querySelector('.st'), { scaleX: 0 });
    tl.fromTo(w, { autoAlpha: 0, x: -60 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out', immediateRender: false }, at('having more things') + 0.15 + i * 0.12);
    tl.to(w.querySelector('.st'), { scaleX: 1, duration: 0.3, ease: 'power3.inOut' }, at('having more things') + 0.6 + i * 0.08);
  }
  [lb1, s1].forEach(e => out(e, TA - 0.2)); out(th, TA - 0.2);
  // statement 2: split widens, brackets close in "around you"
  setSplit(TA - 0.3, 760);
  const s2 = ltext('It is about|having more of|[what is designed]|[around you.]', 'h2 navy', 120, 260, L, 'font-size:72px'); rise(s2, TA, { lineGap: [TA, TA + 0.4, at('what is designed'), at('around you')] });
  out(s2, TH - 0.25);
  const BR = svgEl(['M 0 90 V 0 H 90', 'M 330 0 H 420 V 90', 'M 420 330 V 420 H 330', 'M 90 420 H 0 V 330'].map((d, i) => `<path class="b${i}" d="${d}" stroke-width="5"/>`).join(''), { x: 1130, y: 330, w: 420, h: 420, stroke: '#E6BFA4' }, L);
  gsap.set(BR, { autoAlpha: 0 }); tl.set(BR, { autoAlpha: 1 }, at('what is designed'));
  [[-160, -160], [160, -160], [160, 160], [-160, 160]].forEach(([dx, dy], i) => tl.fromTo(BR.querySelector(`.b${i}`), { x: dx, y: dy, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power4.out', immediateRender: true }, at('around you') - 0.2));
  out(BR, TH - 0.25);
  // happiness: the word filled with footage
  setSplit(TH - 0.3, 1920, 0.6);
  const HP = el('<div class="layer"></div>', L); gsap.set(HP, { autoAlpha: 0 });
  vclip(HP, 'kids', TH - 0.3, TW + 0.3, { rate: 0.5 });
  textMask(HP, 'HAPPINESS', { size: 300, spacing: 10, y: 0.52 });
  tl.set(HP, { autoAlpha: 1 }, at('happiness') - 0.15);
  tl.fromTo(HP, { scale: 0.7, filter: 'blur(10px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out', immediateRender: false }, at('happiness') - 0.15);
  tl.to(HP, { scale: 1.08, duration: 1.8, ease: 'none' }, at('happiness') + 0.55);
  const hp1 = ctext('THAT IS EXACTLY WHAT', 'label', 300, L, 'font-size:24px;letter-spacing:.5em;color:#A27063'); reveal(hp1, TH, { dur: 0.4 });
  const hp2 = ctext('MEANS.', 'label', 760, L, 'font-size:24px;letter-spacing:.5em;color:#A27063'); reveal(hp2, at('means'), { dur: 0.4 });
  [HP, hp1, hp2].forEach(e => out(e, TW - 0.25));
  // promise on paper: a page turns away to reveal the footage
  setSplit(TW - 0.3, 960, 0.7);
  const s3 = ltext('At [ZOOD,]|luxury is not|a promise|on paper.', 'h2 navy', 120, 230, L, 'font-size:80px'); rise(s3, TW, { lineGap: [TW, TW + 0.4, at('a promise on'), at('on paper')] });
  out(s3, TX - 0.3);
  const pw = el('<div class="abs persp" style="left:960px;top:0;width:960px;height:1080px;perspective:2400px"></div>', L);
  const page = el(`<div class="abs" style="inset:0;background:#FBF7F3;transform-origin:0 50%;box-shadow:-20px 0 60px rgba(60,40,25,.25);padding:150px 120px">
      <div class="label" style="font-size:20px;color:#A27063;letter-spacing:.4em">Promise</div>
      ${[96, 88, 100, 72, 94, 84, 60].map(w => `<div style="height:12px;border-radius:6px;background:rgba(4,30,66,.1);margin-top:44px;width:${w}%"></div>`).join('')}</div>`, pw);
  gsap.set(page, { autoAlpha: 0 });
  tl.fromTo(page, { autoAlpha: 0, x: 200 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, TW - 0.2);
  tl.to(page, { rotationY: -165, duration: 0.9, ease: 'power3.inOut' }, at('on paper') + 0.1);
  tl.to(page, { autoAlpha: 0, duration: 0.2 }, at('on paper') + 0.85);
  // experience you live: footage takes the whole frame
  setSplit(TX - 0.35, 0, 0.75);
  const ex = el('<div class="abs" style="left:110px;top:600px"></div>', L);
  slam(el(`<div style="${big('', 120, 'color:#F4EEE8;text-shadow:0 10px 40px rgba(0,0,0,.4)')}"><span class="w">AN</span> <span class="w">EXPERIENCE</span></div>`, ex), TX);
  slam(el(`<div style="${big('', 120, 'color:#E6BFA4;text-shadow:0 10px 40px rgba(0,0,0,.4)')}"><span class="w">YOU</span> <span class="w">LIVE.</span></div>`, ex), at('you live'));
}

// =====================================================================
// B4  "Traditionally …"  — a deck of forms dealt into chaos, then stacked into one tile
// =====================================================================
const FORM = (k) => k === 0
  ? `<div class="label" style="font-size:12px;color:#A27063">Application form</div>${[80, 60, 90, 50].map(w => `<div style="height:22px;border:1.5px solid rgba(4,30,66,.18);border-radius:6px;margin-top:12px;width:${w}%"></div>`).join('')}`
  : k === 1
  ? `<div class="label" style="font-size:12px;color:#A27063">Payments.xlsx</div><div style="margin-top:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:3px">${Array(20).fill('<div style="height:16px;background:rgba(4,30,66,.08)"></div>').join('')}</div>`
  : `<div class="label" style="font-size:12px;color:#A27063">Messages</div><div style="margin-top:12px;height:28px;width:70%;border-radius:14px;background:rgba(4,30,66,.12)"></div><div style="margin:10px 0 0 30%;height:28px;width:70%;border-radius:14px;background:rgba(162,112,99,.35)"></div><div style="margin-top:10px;height:28px;width:55%;border-radius:14px;background:rgba(4,30,66,.12)"></div>`;
let bIcon;
{
  const T0 = at('traditionally'), TQ = at('but what if'), T1 = at('we build communities');
  const L = layer('bg-day'); show(L, T0 - 0.3, T1 + 0.4, 0.3, 0.3);
  const steps = el('<div class="abs" style="right:110px;top:90px;text-align:right"><div class="label" style="font-size:18px;color:#A27063">Steps</div><div class="n" style="font-size:96px;font-weight:600;color:#041E42">01</div></div>', L);
  gsap.set(steps, { autoAlpha: 0 }); tl.to(steps, { autoAlpha: 1, duration: 0.3 }, T0 + 0.2);
  count(steps.querySelector('.n'), 1, 47, at('paperwork'), TQ - at('paperwork'), v => String(Math.round(v)).padStart(2, '0'));
  const words = [['PAPERWORK', at('paperwork')], ['SPREADSHEETS', at('spreadsheets')], ['CONVERSATIONS', at('conversations')], ['ENDLESS STEPS', at('endless steps')]];
  const tr = ltext('Traditionally, owning a property meant…', 'h3 navy', 120, 110, L, 'opacity:.75'); rise(tr, T0); out(tr, TQ - 0.2);
  words.forEach(([w, t], i) => {
    const e = ctext(w, '', 470, L, big('', 150, 'color:#041E42;z-index:20;text-shadow:0 0 40px rgba(244,236,228,.9)'));
    slam(e, t); if (i < 3) tl.to(e, { autoAlpha: 0, duration: 0.15 }, words[i + 1][1] - 0.08); else out(e, TQ - 0.15);
  });
  const r = rng(77), cards = [];
  for (let i = 0; i < 26; i++) {
    const k = i % 3, x = 80 + r() * 1560, y = 160 + r() * 700, rot = (r() - 0.5) * 50, ti = at('paperwork') + i * ((TQ - at('paperwork') - 0.4) / 26);
    const c = el(`<div class="card" style="left:${x}px;top:${y}px;width:260px;height:170px;padding:16px 18px;box-shadow:0 14px 34px rgba(60,40,25,.18)">${FORM(k)}</div>`, L);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, x: (r() > 0.5 ? 1 : -1) * 900, y: -300 + r() * 600, rotation: rot * 3 }, { autoAlpha: 1, x: 0, y: 0, rotation: rot, duration: 0.45, ease: 'power3.out', immediateRender: false }, ti);
    tl.to(c, { left: 830, top: 455, rotation: (r() - 0.5) * 6, duration: 0.6, ease: 'power3.inOut' }, TQ + 0.05 + i * 0.012);
    cards.push(c);
  }
  // the stack becomes one tile: the ZOOD app icon
  tl.to(cards, { autoAlpha: 0, duration: 0.25 }, TQ + 1.0);
  bIcon = el(`<div class="abs" style="left:850px;top:430px;width:220px;height:220px;border-radius:54px;background:linear-gradient(150deg,#123a6e,#041E42 60%);box-shadow:0 30px 70px rgba(4,30,66,.35);display:flex;align-items:center;justify-content:center"><img src="${A('brand/symbol-white.png')}" style="width:120px"></div>`, L);
  gsap.set(bIcon, { autoAlpha: 0 });
  tl.fromTo(bIcon, { autoAlpha: 0, scale: 1.4, rotation: -8 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.6)', immediateRender: false }, TQ + 0.95);
  const q = ctext('What if the entire journey could come|together in [one place?]', 'h2 navy', 130, L); rise(q, TQ + 0.15, { lineGap: [TQ + 0.15, at('together in one')] });
  out(q, T1 - 0.3);
  // icon spins and opens into the footage columns
  tl.to(bIcon, { rotation: 90, scale: 0.4, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, T1 - 0.4);
}

// =====================================================================
// B5  "We build communities … This is the ZOOD app."  — sliding footage columns → one phone
// =====================================================================
let bHero;
{
  const T0 = at('we build communities'), TT = at('and today'), TS = at('a smarter way to discover'), TF = at('four journeys'), TN = at('not four applications'),
    TO = at('one application'), TZ = at('this is the zood app'), TE = at('explore every');
  const L = layer('bg-navy'); show(L, T0 - 0.35, TE + 0.3, 0.3, 0.3);
  const COLS = ['aerial', 'haze', 'street', 'boulevard', 'reflection'];
  const cw = 360, gap = 22, total = COLS.length * (cw + gap);
  const strip = el(`<div class="abs" style="left:${(W - total) / 2}px;top:0;width:${total}px;height:1080px"></div>`, L);
  const cols = COLS.map((s, i) => {
    const c = panel(strip, s, T0 - 0.3, TO + 0.6, { x: i * (cw + gap), y: 90, w: cw, h: 900, rate: 0.9, radius: 22 });
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 1, yPercent: i % 2 ? -120 : 120 }, { yPercent: 0, duration: 0.7, ease: 'power4.out', immediateRender: false }, T0 - 0.3 + i * 0.06);
    tl.fromTo(c, { y: 0 }, { y: i % 2 ? 70 : -70, duration: TF - T0, ease: 'sine.inOut', immediateRender: false }, T0 + 0.4);
    return c;
  });
  tl.fromTo(strip, { x: 220 }, { x: -220, duration: TF - T0 + 0.5, ease: 'none', immediateRender: false }, T0 - 0.3);
  const dim = el('<div class="layer" style="background:rgba(2,12,31,.35)"></div>', L);
  const wb = ctext('WE BUILD [COMMUNITIES.]', '', 470, L, big('', 130, 'color:#F4EEE8;text-shadow:0 10px 50px rgba(0,0,0,.5)')); slam(wb, T0 + 0.05); out(wb, TT - 0.15);
  const td = ctext('And today, we have built with you', 'h2 cream', 480, L, 'text-shadow:0 8px 40px rgba(0,0,0,.6)'); rise(td, TT); out(td, TS - 0.15);
  // "a smarter way to" — giant words push through horizontally
  const sw = ctext('A SMARTER WAY TO', 'label', 250, L, 'font-size:26px;letter-spacing:.6em;color:#E6BFA4'); reveal(sw, TS, { dur: 0.4 }); out(sw, TF - 0.2);
  const J = [['DISCOVER', at('discover')], ['OWN', at('create')], ['LIVE', at('smarter way to live') + 0.5], ['INVEST', at('enjoy')]];
  J.forEach(([w, t], i) => {
    const e = ctext(w, '', 400, L, big('', 230, 'color:#F4EEE8;text-shadow:0 10px 60px rgba(0,0,0,.5)'));
    gsap.set(e, { autoAlpha: 0 });
    tl.set(e, { autoAlpha: 1 }, t - 0.2);
    tl.fromTo(e, { x: 1400 }, { x: 0, duration: 0.45, ease: 'power4.out', immediateRender: false }, t - 0.2);
    tl.to(e, { x: -1600, duration: 0.4, ease: 'power3.in' }, (J[i + 1] ? J[i + 1][1] : TF) - 0.25);
  });
  // four journeys: five columns become four labelled ones, then phones, then one
  tl.to(cols[4], { autoAlpha: 0, scale: 0.8, duration: 0.4 }, TF - 0.3);
  tl.to(strip, { x: (cw + gap) / 2, duration: 0.6, ease: 'power3.inOut' }, TF - 0.3);
  tl.to(dim, { background: 'rgba(2,12,31,.2)', duration: 0.4 }, TF - 0.3);
  const fj = ctext('FOUR JOURNEYS.', 'label', 40, L, 'font-size:30px;letter-spacing:.5em;color:#F4EEE8'); reveal(fj, TF, { dur: 0.4 }); out(fj, TN - 0.15);
  ['01  DISCOVER', '02  OWN', '03  LIVE', '04  INVEST'].forEach((s, i) => {
    const lab = el(`<div class="abs label" style="left:28px;bottom:30px;font-size:20px;color:#F4EEE8">${s}</div>`, cols[i]);
    gsap.set(lab, { autoAlpha: 0 }); pop(lab, TF + 0.1 + i * 0.1); out(lab, TN);
  });
  const na = ctext('NOT FOUR APPLICATIONS.', 'label', 40, L, 'font-size:30px;letter-spacing:.5em;color:#F4EEE8'); reveal(na, TN, { dur: 0.4 }); out(na, TO - 0.15);
  cols.slice(0, 4).forEach((c, i) => {
    tl.to(c, { top: 330, height: 420, width: 200, left: i * (cw + gap) + 80, borderRadius: 40, duration: 0.6, ease: 'power3.inOut' }, TN + 0.05);
    tl.to(c, { left: 1.5 * (cw + gap) + 80, rotation: (i - 1.5) * 6, duration: 0.5, ease: 'power3.in' }, TO - 0.1);
    tl.to(c, { autoAlpha: 0, duration: 0.25 }, TO + 0.45);
  });
  const oa = ctext('ONE APPLICATION.', 'label', 40, L, 'font-size:30px;letter-spacing:.5em;color:#E6BFA4'); reveal(oa, TO, { dur: 0.4 }); out(oa, TZ - 0.35, 0.2);
  // the flat hero phone rises; giant ZOOD marquee behind it
  const mq = marquee(L, 'ZOOD', 360, TZ - 0.5, TE + 0.4, { size: 380, speed: 260, color: 'rgba(230,191,164,.35)' });
  L.insertBefore(mq, strip);
  const HL = el('<div class="layer persp"></div>', L);
  bHero = phone(SCR('splash.jpg'), { parent: HL, w: 440 });
  setP(bHero, 960, 560);
  gsap.set(bHero, { autoAlpha: 0 });
  tl.fromTo(bHero, { autoAlpha: 1, top: 1100 }, { top: 560 - bHero.phh / 2, duration: 0.8, ease: 'power4.out', immediateRender: false }, TO + 0.3);
  sheen(bHero, TZ + 0.3, 1.0);
  const tz = ctext('THIS IS THE [ZOOD] APP.', 'label', 40, L, 'font-size:30px;letter-spacing:.5em;color:#F4EEE8'); reveal(tz, TZ, { dur: 0.4 }); out(tz, TE - 0.3);
}

// =====================================================================
// 01 DISCOVER — flat phone on a split stage, annotations, loupe, VS split, filter switches
// =====================================================================
{
  const T0 = at('explore every'), TT = at('then tap'), TB = at('before the first'), TS = at('see the available'), TC = at('compare them'), TF = at('filter by'),
    TE = at('so you can find'), TV = at('verify your identity');
  const cov = slab(T0 - 0.55, '01', 'DISCOVER', { bg: '#A27063' });
  const L = layer('bg-navy'); show(L, cov, TV + 0.2, 0.01, 0.2);
  const BG = panel(L, 'haze', cov, TT, { x: 0, w: 960, rate: 0.8, shade: 0.45 });
  tl.to(BG, { width: 0, duration: 0.6, ease: 'power3.inOut' }, TT - 0.4);
  marquee(L, 'DISCOVER', 820, cov, TE, { size: 200, speed: 120, color: 'rgba(214,165,140,.16)' });
  const p = phone(SCR('onboarding.jpg'), { parent: L, w: 440 });
  setP(p, 960, 540);
  moveP(p, cov + 0.1, 760, 540, 1, 0.7);
  const ttl = ltext('Explore every|destination', '', 1080, 250, L, big('', 92, 'color:#F4EEE8'));
  rise(ttl, T0 + 0.1, { lineGap: [T0 + 0.1, at('destination')] });
  const ttl2 = ltext('WITH COMPLETE CLARITY', 'label', 1084, 470, L, 'font-size:22px;letter-spacing:.45em;color:#E6BFA4'); reveal(ttl2, at('with complete clarity'), { dur: 0.4 });
  [ttl, ttl2].forEach(e => out(e, at('layouts') - 0.15));
  // layouts / views / neighborhood: screen changes + annotations
  swap(p, SCR('map.jpg'), at('layouts') - 0.15);
  const pcx = 760, pcy = 540, sw = p.sw, sh = p.sh, sx = (fx) => pcx - sw / 2 + fx * sw, sy = (fy) => pcy - sh / 2 + fy * sh;
  const a1 = annotate(L, [sx(0.62), sy(0.16)], [1150, 300], 'LAYOUTS', at('layouts'));
  swap(p, SCR('city3d.jpg'), at('views') - 0.15);
  const a2 = annotate(L, [sx(0.5), sy(0.45)], [1150, 520], 'VIEWS', at('views'));
  const lp1 = loupe(L, SCR('city3d.jpg'), pcx, pcy, p, [[0.45, 0.35], [0.6, 0.5], [0.4, 0.6]], at('views') + 0.2, TT - 0.2, { r: 120, zoom: 2.6 });
  const a3 = annotate(L, [sx(0.3), sy(0.7)], [1150, 740], 'NEIGHBORHOOD', at('neighborhood'));
  [...a1, ...a2, ...a3].forEach(e => out(e, TT - 0.3));
  // tap · rotate · choose · walk through — numbered steps + screen detail
  swap(p, SCR('walkthrough.png'), TT - 0.15);
  moveP(p, TT - 0.3, 600, 540, 1);
  const steps = [['TAP', at('tap')], ['ROTATE', at('rotate')], ['CHOOSE', at('choose your unit')], ['WALK THROUGH', at('walk through')]];
  steps.forEach(([s, t], i) => {
    const row = el(`<div class="abs" style="left:980px;top:${250 + i * 150}px;display:flex;align-items:baseline;gap:30px"><span style="font-size:34px;font-weight:500;color:#D6A58C">0${i + 1}</span><span style="${big('', 96, 'color:#F4EEE8')}">${s}</span></div>`, L);
    gsap.set(row, { autoAlpha: 0 });
    tl.fromTo(row, { autoAlpha: 0, x: 120 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power4.out', immediateRender: false }, t);
    if (i < 3) tl.to(row, { opacity: 0.3, duration: 0.3 }, steps[i + 1][1]);
    out(row, TB - 0.5);
  });
  tap(p, 0.2, 0.235, at('tap'));
  tl.to(p, { rotationY: 360, duration: 0.9, ease: 'power3.inOut' }, at('rotate'));
  tl.set(p, { rotationY: 0 }, at('rotate') + 0.95);
  tap(p, 0.5, 0.33, at('choose your unit') + 0.1);
  // walk through: phone scales up until its screen fills the frame → interior footage
  const cw2 = stripeWipe(TB - 0.75, { color: '#041E42', color2: '#A27063' });
  const IN = el('<div class="layer"></div>', L); gsap.set(IN, { autoAlpha: 0 }); tl.set(IN, { autoAlpha: 1 }, cw2);
  panel(IN, 'interior', cw2, TS, { rate: 0.75 });
  el('<div class="layer" style="background:linear-gradient(180deg,rgba(2,12,31,0) 50%,rgba(2,12,31,.75))"></div>', IN);
  tl.fromTo(IN.firstChild, { scale: 1 }, { scale: 1.25, duration: TS - cw2, ease: 'none', immediateRender: false }, cw2);
  marquee(IN, 'BEFORE THE FIRST STONE IS EVEN LAID', 820, cw2, TS + 0.2, { size: 120, speed: 380, outline: false, color: 'rgba(244,238,232,.92)' });
  const cw3 = stripeWipe(TS - 0.7, { color: '#A27063', color2: '#041E42', dir: -1 });
  tl.set(IN, { autoAlpha: 0 }, cw3);
  // real-time availability: live counter + availability bars
  tl.set(p, { left: 640 - p.pw / 2, top: 540 - p.phh / 2, scale: 1 }, cw3);
  swap(p, SCR('explore.jpg'), cw3, 'fade');
  const rt = ltext('AVAILABLE NOW', 'label', 1080, 230, L, 'font-size:22px;letter-spacing:.45em;color:#E6BFA4'); reveal(rt, TS, { dur: 0.4 });
  const units = el(`<div class="abs" style="left:1072px;top:270px;${big('', 240, 'color:#F4EEE8')}"><span class="n">0</span></div>`, L);
  gsap.set(units, { autoAlpha: 0 }); tl.to(units, { autoAlpha: 1, duration: 0.2 }, TS);
  count(units.querySelector('.n'), 0, 95, TS, 1.4);
  const ul = ltext('UNITS · IN REAL TIME', 'label', 1084, 520, L, 'font-size:22px;letter-spacing:.4em;color:#F4EEE8'); reveal(ul, at('in real time'), { dur: 0.4 });
  const bars = el('<div class="abs" style="left:1084px;top:600px;width:640px;height:200px;display:flex;align-items:flex-end;gap:10px"></div>', L);
  const br = rng(12);
  for (let i = 0; i < 16; i++) {
    const b = el(`<div style="flex:1;height:${30 + br() * 170}px;background:${br() > 0.4 ? '#D6A58C' : 'rgba(244,238,232,.25)'};border-radius:4px;transform-origin:50% 100%"></div>`, bars);
    tl.fromTo(b, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.out', immediateRender: true }, TS + 0.1 + i * 0.03);
    tl.to(b, { scaleY: 0.4 + br() * 0.8, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 2 }, at('in real time') + br() * 0.4);
  }
  [rt, units, ul, bars].forEach(e => out(e, TC - 0.25));
  // compare: the phone splits into two, VS between them
  const p2 = phone(SCR('project.jpg'), { parent: L, w: 440 }); setP(p2, 640, 540); gsap.set(p2, { autoAlpha: 0 });
  tl.set(p2, { autoAlpha: 1 }, TC - 0.1);
  moveP(p, TC - 0.1, 560, 540, 0.9); moveP(p2, TC - 0.1, 1360, 540, 0.9);
  const vs = ctext('VS', '', 470, L, big('', 130, 'color:#E6BFA4')); slam(vs, TC + 0.3);
  const sbs = ctext('SIDE BY SIDE', 'label', 990, L, 'font-size:24px;letter-spacing:.5em;color:#F4EEE8'); reveal(sbs, at('side by side'), { dur: 0.4 });
  [vs, sbs].forEach(e => out(e, TF - 0.2)); tl.to(p2, { left: 2200, duration: 0.5, ease: 'power3.in' }, TF - 0.3);
  // filter: switches flip on, one per spoken word
  moveP(p, TF - 0.3, 640, 540, 1);
  swap(p, SCR('filter.jpg'), TF - 0.1);
  const fl = ltext('FILTER BY', 'label', 1080, 190, L, 'font-size:22px;letter-spacing:.45em;color:#E6BFA4'); reveal(fl, TF, { dur: 0.4 });
  [['Space', at('space')], ['Distance', at('distance')], ['Family', at('family')], ['Individual', at('individual')], ['Community', at('residential community')]].forEach(([s, t], i) => {
    const row = el(`<div class="abs" style="left:1080px;top:${250 + i * 118}px;width:620px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(244,238,232,.15);padding-bottom:22px">
        <span style="font-size:52px;font-weight:400;color:#F4EEE8">${s}</span>
        <span class="sw" style="position:relative;width:96px;height:52px;border-radius:26px;background:rgba(244,238,232,.18)"><span class="k" style="position:absolute;left:5px;top:5px;width:42px;height:42px;border-radius:50%;background:#F4EEE8"></span></span></div>`, L);
    gsap.set(row, { autoAlpha: 0 });
    tl.fromTo(row, { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out', immediateRender: false }, TF + 0.2 + i * 0.08);
    tl.to(row.querySelector('.sw'), { background: '#A27063', duration: 0.2 }, t);
    tl.to(row.querySelector('.k'), { left: 49, duration: 0.25, ease: 'back.out(2)' }, t);
    out(row, TE - 0.25);
  });
  out(fl, TE - 0.25);
  tap(p, 0.25, 0.825, at('space')); tap(p, 0.72, 0.947, at('residential community') + 0.3);
  // perfect home: the word HOME filled with footage
  const cw4 = stripeWipe(TE - 0.7, { color: '#F4EEE8', color2: '#DBC8B6' });
  const PH_ = el('<div class="layer bg-cream"></div>', L); gsap.set(PH_, { autoAlpha: 0 }); tl.set(PH_, { autoAlpha: 1 }, cw4);
  tl.set(p, { autoAlpha: 0 }, cw4);
  const HM = el('<div class="layer"></div>', PH_); vclip(HM, 'window', cw4, TV + 0.3, { rate: 0.9 });
  textMask(HM, 'HOME', { size: 520, spacing: 20, y: 0.5 });
  tl.fromTo(HM, { scale: 1.3 }, { scale: 1, duration: 1.4, ease: 'power3.out', immediateRender: false }, cw4);
  const fy = ctext('FIND YOUR [PERFECT] HOME', 'label', 160, PH_, 'font-size:28px;letter-spacing:.5em;color:#041E42'); reveal(fy, TE, { dur: 0.4 });
  const ne = ctext('NOT JUST AN EMPTY ROOM.', 'label', 880, PH_, 'font-size:28px;letter-spacing:.5em;color:#A27063'); reveal(ne, at('not just an empty'), { dur: 0.4 });
}

// =====================================================================
// 02 OWN — scan ring, process stepper, giant signature, stamp, big numbers, rising tower, checklist stamps
// =====================================================================
{
  const T0 = at('verify your identity'), TR = at('request information'), TC = at('review your contract'), TP = at('with a single platform'),
    TY = at('every payment'), TT = at('track the progress'), TA = at('access reports'), TW = at('and watch your'), TH = at('when it is time'),
    TJ = at('you simply enjoy'), T1 = at('your home');
  const cov = slab(T0 - 0.55, '02', 'OWN', { bg: '#041E42', fg: '#E6BFA4' });
  const L = layer('bg-navy-soft'); show(L, cov, T1 + 0.2, 0.01, 0.2);
  marquee(L, 'OWN', 840, cov, TJ, { size: 220, speed: 140, color: 'rgba(214,165,140,.14)', dir: 1 });
  const p = phone(SCR('login.jpg'), { parent: L, w: 440 });
  setP(p, 1300, 540);
  // biometric ring with % counter
  const ring = el(`<div class="abs" style="left:280px;top:260px;width:480px;height:480px">
      <svg width="480" height="480" viewBox="0 0 480 480">${ROSE_GRAD_SVG_B}<circle cx="240" cy="240" r="210" fill="none" stroke="rgba(244,238,232,.12)" stroke-width="3" stroke-dasharray="3 9"/>
      <circle class="arc" cx="240" cy="240" r="180" fill="none" stroke="url(#rgb)" stroke-width="10" stroke-linecap="round" transform="rotate(-90 240 240)" stroke-dasharray="1131" stroke-dashoffset="1131"/></svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="n" style="${big('', 130, 'color:#F4EEE8')}">0%</div><div class="label" style="font-size:18px;color:#E6BFA4;margin-top:16px">Identity</div></div></div>`, L);
  gsap.set(ring, { autoAlpha: 0 }); pop(ring, T0 + 0.1, { scale: 0.7 });
  tl.to(ring.querySelector('svg'), { rotation: 120, transformOrigin: '50% 50%', duration: 2.6, ease: 'none' }, T0);
  tl.to(ring.querySelector('.arc'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, T0 + 0.3);
  count(ring.querySelector('.n'), 0, 100, T0 + 0.3, 1.4, v => Math.round(v) + '%');
  const vf = ctext('VERIFIED IN SECONDS', 'label', 790, L, 'font-size:22px;letter-spacing:.45em;color:#E6BFA4;width:1040px;left:0'); reveal(vf, at('in seconds'), { dur: 0.4 });
  [ring, vf].forEach(e => out(e, TR - 0.2));
  // process stepper: request → visit → reserve
  swap(p, SCR('project.jpg'), TR - 0.15);
  moveP(p, TR - 0.35, 1500, 540, 0.95);
  const st = el('<div class="abs" style="left:150px;top:300px;width:820px;height:400px"></div>', L);
  el('<div class="abs" style="left:30px;top:29px;width:760px;height:3px;background:rgba(244,238,232,.18)"></div>', st);
  const prog = el('<div class="abs" style="left:30px;top:29px;width:0;height:3px;background:#D6A58C"></div>', st);
  const SP = [['REQUEST', TR], ['VISIT', at('book a dedicated')], ['RESERVE', at('reserve your unit')]];
  st.style.left = '120px';
  SP.forEach(([s, t], i) => {
    const node = el(`<div class="abs" style="left:${i * 380}px;top:0"><div class="dt" style="width:60px;height:60px;border-radius:50%;border:3px solid #D6A58C;background:#0b2a55;display:flex;align-items:center;justify-content:center"></div>
        <div style="margin-top:34px;${big('', 70, 'color:#F4EEE8')}">${s}</div></div>`, st);
    gsap.set(node, { autoAlpha: 0 }); pop(node, TR + i * 0.12);
    tl.to(node.querySelector('.dt'), { background: '#A27063', duration: 0.2 }, t);
    tl.set(node.querySelector('.dt'), { innerHTML: TICK }, t);
    if (i) tl.to(prog, { width: i * 380, duration: 0.5, ease: 'power3.inOut' }, t - 0.2);
  });
  out(st, TC - 0.25);
  swap(p, SCR('payment.jpg'), at('reserve your unit') - 0.1);
  tap(p, 0.5, 0.973, at('reserve your unit') + 0.5);
  // contract: a giant signature written across the frame, then a stamp
  swap(p, SCR('esign.png'), TC - 0.1);
  moveP(p, TC - 0.3, 1440, 540, 0.9);
  const rc = ltext('REVIEW.|SIGN.', '', 150, 220, L, big('', 150, 'color:#F4EEE8'));
  rise(rc, TC, { lineGap: [TC, at('then sign it')] }); out(rc, TP - 0.25);
  const sig = svgEl('<path d="M 60 300 C 120 120 200 80 220 200 C 236 300 150 330 170 240 C 200 120 300 120 300 230 C 300 300 330 300 360 220 C 380 170 420 170 430 230 C 440 290 480 280 520 200 C 560 130 620 140 640 210 C 660 280 720 280 800 230 C 860 190 940 200 1000 230"/>',
    { x: 160, y: 470, w: 1100, h: 380, stroke: '#E6BFA4', sw: 9 }, L);
  gsap.set(sig, { autoAlpha: 0 }); tl.set(sig, { autoAlpha: 1 }, at('then sign it'));
  drawAll(sig, at('then sign it'), 1.1, 0, 'power1.inOut');
  const stamp = el(`<div class="abs" style="left:880px;top:380px;padding:18px 40px;border:6px solid #E6BFA4;border-radius:18px;${big('', 70, 'color:#E6BFA4')};transform:rotate(-12deg)">SIGNED</div>`, L);
  gsap.set(stamp, { autoAlpha: 0 });
  tl.fromTo(stamp, { autoAlpha: 0, scale: 2.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power4.in', immediateRender: false }, at('and securely'));
  tl.to(L, { x: 6, duration: 0.05, yoyo: true, repeat: 3 }, at('and securely') + 0.3);
  [sig, stamp].forEach(e => out(e, TP - 0.25));
  // one platform: three big numbers
  swap(p, SCR('profile.jpg'), TP - 0.1);
  moveP(p, TP - 0.3, 1440, 540, 0.9);
  const op = ltext('ONE PLATFORM.|EVERYTHING WITH YOU.', '', 150, 200, L, big('', 92, 'color:#F4EEE8'));
  rise(op, TP, { lineGap: [TP, at('keeps everything')] }); out(op, TY - 0.2);
  const NUMS = [['12', 'PAYMENTS', TY], ['05', 'STAGES', at('every stage')], ['24/7', 'UPDATES', at('every update')]];
  const ncont = el('<div class="abs" style="left:150px;top:300px;display:flex;gap:90px"></div>', L);
  NUMS.forEach(([n, lab, t], i) => {
    const c = el(`<div><div class="n" style="${big('', 170, 'color:#F4EEE8')}">${n}</div><div class="label" style="font-size:22px;color:#E6BFA4;margin-top:20px">EVERY ${lab.slice(0, -1)}</div></div>`, ncont);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power4.out', immediateRender: false }, t);
    if (i < 2) count(c.querySelector('.n'), 0, +n, t, 0.8, v => String(Math.round(v)).padStart(2, '0'));
  });
  out(ncont, TT - 0.25);
  // construction: a tower of floors stacks up to 68%
  swap(p, SCR('construction.png'), TT - 0.1);
  const tw = el('<div class="abs" style="left:300px;top:150px;width:300px;height:760px"></div>', L);
  for (let i = 0; i < 20; i++) {
    const f = el(`<div class="abs" style="left:${i % 2 ? 6 : 0}px;bottom:${i * 36}px;width:300px;height:30px;border-radius:4px;background:${i < 14 ? '#D6A58C' : 'rgba(244,238,232,.12)'}"></div>`, tw);
    gsap.set(f, { autoAlpha: 0 });
    tl.fromTo(f, { autoAlpha: 0, y: -300 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'bounce.out', immediateRender: false }, TT + i * 0.06);
  }
  const pc = el(`<div class="abs" style="left:680px;top:330px"><div class="n" style="${big('', 210, 'color:#F4EEE8')}">0%</div><div class="label" style="font-size:22px;color:#E6BFA4;margin-top:16px">Construction progress</div></div>`, L);
  gsap.set(pc, { autoAlpha: 0 }); tl.to(pc, { autoAlpha: 1, duration: 0.2 }, TT);
  count(pc.querySelector('.n'), 0, 68, TT + 0.1, 1.3, v => Math.round(v) + '%');
  [tw, pc].forEach(e => out(e, TA - 0.25));
  // reports: pages fan out
  const fan = el('<div class="abs persp" style="left:240px;top:250px;width:700px;height:600px"></div>', L);
  [0, 1, 2, 3].forEach(i => {
    const pg = el(`<div class="card" style="left:150px;top:40px;width:360px;height:480px;padding:34px;transform-origin:50% 100%">
        <div class="label" style="font-size:14px;color:#A27063">Monthly report · ${['Jan', 'Feb', 'Mar', 'Apr'][i]}</div>
        ${[90, 70, 100, 60, 84].map(w => `<div style="height:10px;border-radius:5px;background:rgba(4,30,66,.12);margin-top:26px;width:${w}%"></div>`).join('')}
        <div style="margin-top:34px;height:120px;display:flex;align-items:flex-end;gap:10px">${[40, 70, 55, 90, 75].map(h => `<div style="flex:1;height:${h}%;background:#D6A58C;border-radius:3px"></div>`).join('')}</div></div>`, fan);
    gsap.set(pg, { autoAlpha: 0 });
    tl.fromTo(pg, { autoAlpha: 0, y: 200, rotation: 0 }, { autoAlpha: 1, y: 0, rotation: (i - 1.5) * 12, duration: 0.5, ease: 'power4.out', immediateRender: false }, TA + i * 0.08);
  });
  const ar = ltext('ACCESS REPORTS.', 'label', 260, 900, L, 'font-size:24px;letter-spacing:.45em;color:#E6BFA4'); reveal(ar, TA, { dur: 0.4 });
  [fan, ar].forEach(e => out(e, TW - 0.2));
  // live updates: footage fills the left half, LIVE tag
  const LV = panel(L, 'frontal', TW - 0.3, TH, { x: 0, w: 1060, rate: 1, shade: 0.15 });
  L.insertBefore(LV, p);
  tl.fromTo(LV, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.inOut', immediateRender: true }, TW - 0.3);
  const lt = el('<div class="abs chip" style="left:80px;top:90px;font-size:22px;padding:12px 24px"><span class="dot live"></span>LIVE · LEVEL 14</div>', LV);
  tl.to(lt.querySelector('.dot'), { opacity: 0.2, duration: 0.35, yoyo: true, repeat: 6 }, TW);
  slam(ltext('TAKE SHAPE,|LIVE.', '', 80, 640, LV, big('', 120, 'color:#F4EEE8;text-shadow:0 10px 40px rgba(0,0,0,.5)')), at('take shape'));
  tl.to(LV, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.5, ease: 'power4.inOut' }, TH - 0.35);
  // handover: checklist as big stamped lines
  tl.to(p, { left: 2200, duration: 0.5, ease: 'power3.in' }, TH - 0.4);
  const hd = ltext('HANDOVER.', '', 150, 140, L, big('', 150, 'color:#F4EEE8')); slam(hd, TH + 0.1);
  const hd2 = ltext('WE TAKE CARE OF THE DETAILS', 'label', 160, 300, L, 'font-size:22px;letter-spacing:.45em;color:#E6BFA4'); reveal(hd2, at('we take care of the details'), { dur: 0.4 });
  [['LICENSES', at('licenses')], ['DOCUMENTATION', at('documentation')], ['INSPECTIONS', at('every step in between')], ['KEYS', at('in between') + 0.2]].forEach(([s, t], i) => {
    const row = el(`<div class="abs" style="left:150px;top:${400 + i * 130}px;display:flex;align-items:center;gap:36px"><span class="ck" style="width:72px;height:72px;border-radius:50%;background:#A27063;display:flex;align-items:center;justify-content:center">${TICK.replace(/26/g, '40')}</span><span style="${big('', 96, 'color:#F4EEE8')}">${s}</span></div>`, L);
    gsap.set(row, { autoAlpha: 0 });
    tl.fromTo(row, { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power4.out', immediateRender: false }, t - 0.05);
    tl.fromTo(row.querySelector('.ck'), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, t + 0.1);
    out(row, TJ - 0.3);
  });
  [hd, hd2].forEach(e => out(e, TJ - 0.3));
  // enjoy the moment: footage through the ZOOD symbol, which opens to full frame
  const EJ = el('<div class="layer"></div>', L); gsap.set(EJ, { autoAlpha: 0 });
  vclip(EJ, 'swim', TJ - 0.3, T1 + 0.3, { rate: 0.8 });
  EJ.style.webkitMaskImage = `url(${A('brand/symbol-white.png')})`; EJ.style.webkitMaskRepeat = 'no-repeat'; EJ.style.webkitMaskPosition = 'center'; EJ.style.setProperty('--ms', '420px'); EJ.style.webkitMaskSize = 'var(--ms) auto';
  tl.set(EJ, { autoAlpha: 1 }, TJ - 0.3);
  tl.fromTo(EJ, { '--ms': '420px' }, { '--ms': '9000px', duration: 1.4, ease: 'power3.in', immediateRender: false }, TJ - 0.1);
  const ej = ltext('ENJOY|THE MOMENT.', '', 110, 640, L, big('', 120, 'color:#F4EEE8;text-shadow:0 10px 40px rgba(0,0,0,.5)'));
  rise(ej, TJ + 0.5, { lineGap: [TJ + 0.5, at('the moment')] });
  const ej2 = ltext('[ZOOD] TAKES CARE OF THE REST.', 'label', 116, 900, L, 'font-size:24px;letter-spacing:.4em;color:#F4EEE8'); reveal(ej2, at('while zood'), { dur: 0.4 });
}

// =====================================================================
// 03 LIVE — giant marquee words, vault dial, footage mosaic, ticker, service tiles, typing chat, day/night slider
// =====================================================================
{
  const T0 = at('your home'), TE = at('everything that matters'), TC = at('and everything your community'), TM = at('more presence', 2),
    TN = at('everything you need'), TA = at('as if zood'), TR = at('with a real sense'), T1 = at('and for those who invest');
  const cov = slab(T0 - 0.55, '03', 'LIVE', { bg: '#9BCBEB', fg: '#041E42' });
  const L = layer('bg-day'); show(L, cov, T1 + 0.2, 0.01, 0.2);
  const m1 = marquee(L, 'YOUR HOME', 150, cov, TE, { size: 300, speed: 300, outline: false, color: 'rgba(4,30,66,.9)' });
  const m2 = marquee(L, 'YOUR PROPERTY', 560, at('your property') - 0.4, TE, { size: 300, speed: 300, outline: true, color: 'rgba(162,112,99,.9)', dir: 1 });
  gsap.set(m2, { autoAlpha: 0 }); tl.to(m2, { autoAlpha: 1, duration: 0.3 }, at('your property') - 0.3);
  [m1, m2].forEach(e => out(e, TE - 0.2));
  const p = phone(SCR('profile.jpg'), { parent: L, w: 440 });
  setP(p, 960, 1700);
  moveP(p, cov + 0.1, 960, 560, 1, 0.8);
  // vault dial: protected securely
  moveP(p, TE - 0.3, 1400, 540, 0.95);
  const dial = el(`<div class="abs" style="left:240px;top:250px;width:560px;height:560px">
      <svg width="560" height="560" viewBox="0 0 560 560"><g fill="none" stroke="#041E42">
      <circle cx="280" cy="280" r="260" stroke-width="2" opacity=".25"/>${Array.from({ length: 60 }, (_, i) => `<line x1="280" y1="30" x2="280" y2="${i % 5 ? 46 : 62}" stroke-width="${i % 5 ? 2 : 4}" transform="rotate(${i * 6} 280 280)"/>`).join('')}
      <circle cx="280" cy="280" r="150" stroke-width="3"/></g></svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><svg width="120" height="140" viewBox="0 0 120 140"><g fill="none" stroke="#A27063" stroke-width="8" stroke-linecap="round"><rect x="14" y="62" width="92" height="70" rx="12"/><path class="sh" d="M 32 62 V 42 a 28 28 0 0 1 56 0 V 62"/></g></svg></div></div>`, L);
  gsap.set(dial, { autoAlpha: 0 }); pop(dial, TE, { scale: 0.7 });
  tl.fromTo(dial.querySelector('svg'), { rotation: -180, transformOrigin: '50% 50%' }, { rotation: 0, duration: 1.6, ease: 'power3.inOut', immediateRender: false }, TE);
  tl.fromTo(dial.querySelector('.sh'), { y: -16 }, { y: 0, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, at('protected securely') + 0.3);
  const pt = ltext('PROTECTED.|MANAGED.', '', 860, 760, L, big('', 70, 'color:#041E42'));
  pt.style.left = '150px'; pt.style.top = '850px';
  rise(pt, at('protected securely'), { lineGap: [at('protected securely'), at('managed seamlessly')] });
  [dial, pt].forEach(e => out(e, TC - 0.25));
  // community: mosaic of footage tiles around the phone
  moveP(p, TC - 0.3, 960, 540, 0.82);
  swap(p, SCR('community.png'), TC - 0.1);
  const MO = el('<div class="layer"></div>', L); L.insertBefore(MO, p.parentNode === L ? p : L.lastChild);
  const tiles = [['garden', 40, 40], ['arcade', 40, 560], ['pergola', 1480, 40], ['kids', 1480, 560], ['reflection', 470, 40], ['boulevard', 1050, 560]];
  tiles.forEach(([s, x, y], i) => {
    const t = panel(MO, s, TC - 0.2, TN, { x, y, w: 400, h: 480, radius: 20, rate: 0.9 });
    gsap.set(t, { autoAlpha: 0 });
    tl.fromTo(t, { autoAlpha: 0, scale: 0.6, rotation: (i % 2 ? 6 : -6) }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.4)', immediateRender: false }, TC + i * 0.08);
    tl.to(t, { y: i % 2 ? 30 : -30, duration: TM - TC, ease: 'sine.inOut' }, TC + 0.6);
  });
  const yc = ctext('YOUR COMMUNITY, IN ONE PLACE.', 'label', 1015, L, 'font-size:26px;letter-spacing:.45em;color:#041E42'); reveal(yc, TC, { dur: 0.4 }); out(yc, TM - 0.2);
  // more ___ ticker on a navy band over the mosaic
  const band = el('<div class="abs" style="left:0;top:380px;width:1920px;height:320px;background:#041E42"></div>', L);
  gsap.set(band, { autoAlpha: 0 }); tl.fromTo(band, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'power4.out', immediateRender: false }, TM - 0.3);
  tl.to(band, { scaleY: 0, duration: 0.35, ease: 'power3.in' }, TN - 0.35);
  const mo = ltext('MORE', '', 180, 450, L, big('', 160, 'color:transparent;-webkit-text-stroke:2.5px #E6BFA4')); slam(mo, TM); out(mo, TN - 0.35);
  const tk = ticker(L, ['PRESENCE.', 'CONNECTION.', 'EFFICIENCY.', 'POSSIBILITIES.'], [at('presence', 2), at('more connection') + 0.1, at('efficiency'), at('possibilities')], { left: 690, top: 450, size: 160 });
  gsap.set(tk, { autoAlpha: 0 }); tl.to(tk, { autoAlpha: 1, duration: 0.2 }, TM); out(tk, TN - 0.35);
  tl.to(MO, { autoAlpha: 0, duration: 0.4 }, TN - 0.3);
  // services: tiles flip in around the phone
  moveP(p, TN - 0.3, 1400, 540, 0.95);
  const SV = ['Cleaning', 'Delivery', 'Meeting room', 'Facilities', 'Maintenance', 'Concierge'];
  const sg = el('<div class="abs persp" style="left:150px;top:220px;width:900px;height:640px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px"></div>', L);
  SV.forEach((s, i) => {
    const c = el(`<div style="background:#041E42;border-radius:22px;padding:34px 30px;display:flex;flex-direction:column;justify-content:space-between;color:#F4EEE8">
        <span style="width:46px;height:46px;border-radius:50%;border:2px solid #E6BFA4"></span><span style="font-size:34px;font-weight:500">${s}</span></div>`, sg);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, rotationY: -90 }, { autoAlpha: 1, rotationY: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, TN + i * 0.12);
  });
  const en = ctext('EVERYTHING YOU NEED, WHENEVER YOU NEED IT.', 'label', 960, L, 'font-size:24px;letter-spacing:.4em;color:#041E42;width:1100px'); reveal(en, TN, { dur: 0.4 });
  [sg, en].forEach(e => out(e, TA - 0.25));
  // chat with typing indicator
  swap(p, SCR('community.png'), TA - 0.1);
  const q1 = el(`<div class="abs" style="left:150px;top:330px;max-width:760px;padding:30px 40px;border-radius:40px 40px 40px 10px;background:#041E42;color:#F4EEE8;font-size:44px">Can I book the gym at 7 PM?</div>`, L);
  const ty = el(`<div class="abs" style="left:360px;top:520px;padding:26px 36px;border-radius:40px 40px 10px 40px;background:#FBF7F3;display:flex;gap:12px;box-shadow:0 20px 40px rgba(60,40,25,.15)">${'<span class="d" style="width:16px;height:16px;border-radius:50%;background:#A27063"></span>'.repeat(3)}</div>`, L);
  const a1 = el(`<div class="abs" style="left:360px;top:520px;max-width:760px;padding:30px 40px;border-radius:40px 40px 10px 40px;background:#FBF7F3;color:#041E42;font-size:44px;display:flex;align-items:center;gap:20px;box-shadow:0 20px 40px rgba(60,40,25,.15)"><img src="${A('brand/symbol-navy.png')}" style="height:46px">Booked. See you at 7 PM.</div>`, L);
  [q1, ty, a1].forEach(e => gsap.set(e, { autoAlpha: 0 }));
  pop(q1, TA + 0.1); pop(ty, TA + 0.7);
  ty.querySelectorAll('.d').forEach((d, i) => tl.to(d, { y: -10, duration: 0.2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, TA + 0.8 + i * 0.1));
  tl.to(ty, { autoAlpha: 0, duration: 0.1 }, at('always with you') + 0.3); pop(a1, at('always with you') + 0.3);
  [q1, a1].forEach(e => out(e, TR - 0.1));
  // day / night: a before-after slider sweeps across
  tl.to(p, { left: 2200, duration: 0.5, ease: 'power3.in' }, TR - 0.3);
  const DN = el('<div class="layer"></div>', L); gsap.set(DN, { autoAlpha: 0 }); tl.set(DN, { autoAlpha: 1 }, TR - 0.2);
  const day = panel(DN, 'pergola', TR - 0.2, T1 + 0.3, { rate: 0.8 });
  const night = panel(DN, 'night', TR - 0.2, T1 + 0.3, { rate: 0.8 });
  tl.fromTo(DN, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power4.out', immediateRender: false }, TR - 0.2);
  night.style.clipPath = 'inset(0% 100% 0% 0%)';
  const handle = el('<div class="abs" style="left:1920px;top:0;width:4px;height:1080px;background:#F4EEE8"><div style="position:absolute;left:-34px;top:506px;width:72px;height:72px;border-radius:50%;background:#F4EEE8;box-shadow:0 10px 30px rgba(0,0,0,.3)"></div></div>', DN);
  tl.fromTo(night, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut', immediateRender: false }, at('day and night') - 0.4);
  tl.fromTo(handle, { left: 0 }, { left: 1916, duration: 1.6, ease: 'power2.inOut', immediateRender: false }, at('day and night') - 0.4);
  const dW = ltext('DAY', '', 120, 420, DN, big('', 200, 'color:#F4EEE8;text-shadow:0 10px 40px rgba(0,0,0,.4)')); slam(dW, at('day and night'));
  const nW = el(`<div class="abs" style="right:120px;top:420px;${big('', 200, 'color:#E6BFA4;text-shadow:0 10px 40px rgba(0,0,0,.4)')}"><span class="w">NIGHT.</span></div>`, DN);
  gsap.set(nW, { autoAlpha: 0 }); slam(nW, at('and night'));
}

// =====================================================================
// 04 INVEST — dusk footage with rising line chart, three stacked option cards, 3-second timer
// =====================================================================
{
  const T0 = at('and for those who invest'), TS = at('a smarter way to make'), TX = at('discover', 2);
  const cov = slab(T0 - 0.55, '04', 'INVEST', { bg: '#E6BFA4', fg: '#041E42' });
  const L = layer('bg-navy'); show(L, cov, TX + 0.2, 0.01, 0.2);
  const D = panel(L, 'dusk', cov, TS + 0.5, { rate: 1, shade: 0.35 });
  tl.fromTo(D.firstChild, { scale: 1.2 }, { scale: 1, duration: TS - cov + 0.5, ease: 'none', immediateRender: false }, cov);
  const fi = ltext('FOR THOSE WHO|INVEST.', '', 120, 330, L, big('', 150, 'color:#F4EEE8;text-shadow:0 10px 40px rgba(0,0,0,.4)'));
  rise(fi, T0 + 0.1, { lineGap: [T0 + 0.1, at('invest in what')] });
  const sm = ltext('THERE IS SOMETHING MORE.', 'label', 126, 680, L, 'font-size:26px;letter-spacing:.45em;color:#E6BFA4'); reveal(sm, at('there is something more'), { dur: 0.4 });
  [fi, sm].forEach(e => out(e, TS - 0.25));
  tl.to(D, { autoAlpha: 0, duration: 0.5 }, TS - 0.3);
  // phone + growing yield chart
  const p = phone(SCR('yield.png'), { parent: L, w: 440 });
  setP(p, 520, 1700); moveP(p, TS - 0.3, 520, 540, 1, 0.7);
  const ch = svgEl(`<path class="area" d="M 0 360 L 0 300 C 120 280 200 250 300 230 S 520 140 640 120 S 820 60 900 40 L 900 360 Z" fill="rgba(214,165,140,.12)" stroke="none" data-nodraw="1"/>
      <path d="M 0 300 C 120 280 200 250 300 230 S 520 140 640 120 S 820 60 900 40" stroke-width="5"/>${[0, 1, 2, 3].map(i => `<line x1="0" x2="900" y1="${i * 120}" y2="${i * 120}" stroke="rgba(244,238,232,.12)" stroke-width="1" data-nodraw="1"/>`).join('')}`,
    { x: 900, y: 300, w: 900, h: 360, stroke: '#E6BFA4' }, L);
  gsap.set(ch, { autoAlpha: 0 }); tl.set(ch, { autoAlpha: 1 }, TS);
  drawAll(ch, TS, 1.4, 0, 'power2.inOut');
  tl.fromTo(ch.querySelector('.area'), { opacity: 0 }, { opacity: 1, duration: 0.8, immediateRender: true }, TS + 0.8);
  const yv = el(`<div class="abs" style="left:900px;top:150px"><div class="label" style="font-size:20px;color:#E6BFA4">Total yield</div><div style="${big('', 130, 'color:#F4EEE8')}"><span class="n">0.0</span>%</div></div>`, L);
  gsap.set(yv, { autoAlpha: 0 }); tl.to(yv, { autoAlpha: 1, duration: 0.2 }, TS);
  count(yv.querySelector('.n'), 0, 7.8, TS + 0.1, 1.4, v => v.toFixed(1));
  const wk = ltext('MAKE YOUR PROPERTY WORK FOR YOU.', 'label', 906, 700, L, 'font-size:22px;letter-spacing:.35em;color:#F4EEE8'); reveal(wk, at('work for you'), { dur: 0.4 });
  [ch, yv, wk].forEach(e => out(e, at('long term') - 0.35));
  // three option cards stack; the spoken one comes to the front
  const OPT = [['LONG-TERM', 'Leasing', at('long term')], ['SHORT', 'Stays', at('short stays')], ['SALE', 'Or selling', at('or selling')]];
  const cards = OPT.map(([a, b], i) => {
    const c = el(`<div class="abs" style="left:${1000 + i * 40}px;top:${260 + i * 40}px;width:640px;height:420px;border-radius:34px;background:${['#A27063', '#9BCBEB', '#F4EEE8'][i]};padding:56px;box-shadow:0 40px 90px rgba(0,0,0,.4)">
        <div class="label" style="font-size:20px;color:#041E42">Yield manager · 0${i + 1}</div><div style="margin-top:110px;${big('', 110, 'color:#041E42')}">${a}</div><div style="font-size:40px;color:#041E42;opacity:.7;margin-top:10px">${b}</div></div>`, L);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, y: 200 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power4.out', immediateRender: false }, at('long term') - 0.3 + i * 0.06);
    return c;
  });
  OPT.forEach(([, , t], k) => cards.forEach((c, i) => {
    const d = (i - k + 3) % 3;
    tl.to(c, { left: 1000 + d * 60, top: 260 + d * 50, scale: 1 - d * 0.06, zIndex: 10 - d, filter: `brightness(${1 - d * 0.18})`, duration: 0.45, ease: 'power3.inOut' }, t - 0.1);
  }));
  // you choose in seconds: a 3-second timer
  const tm = el(`<div class="abs" style="left:1000px;top:760px;display:flex;align-items:center;gap:30px"><span style="${big('', 110, 'color:#F4EEE8')}">00:0<span class="n">0</span></span><span class="label" style="font-size:22px;color:#E6BFA4">You choose in seconds</span></div>`, L);
  gsap.set(tm, { autoAlpha: 0 }); tl.to(tm, { autoAlpha: 1, duration: 0.2 }, at('you choose in seconds'));
  count(tm.querySelector('.n'), 0, 3, at('you choose in seconds'), 1.2);
  const rest = ltext('[ZOOD] TAKES CARE OF THE REST.', 'label', 1006, 900, L, 'font-size:24px;letter-spacing:.4em;color:#F4EEE8'); reveal(rest, at('zood takes care of the rest', 2), { dur: 0.4 });
  [...cards, tm, rest].forEach(e => out(e, TX - 0.35));
  tl.to(p, { top: 1700, duration: 0.5, ease: 'power3.in' }, TX - 0.45);
}

// =====================================================================
// FINALE — four word panels, rhythm bars, bars converge into the symbol, split end card
// =====================================================================
const END = Math.ceil(after('live zood') + 6.5);
{
  const TX = at('discover', 2), TD = at('designed for the rhythm'), TB = at('because after construction'), TL = at('live luxury'), TZ2 = at('live zood');
  const L = zlayer(40, 'bg-navy'); show(L, TX - 0.35, null, 0.2);
  // four vertical panels, one per word
  const WORDS = [['DISCOVER.', TX, 'aerial'], ['OWN.', at('enjoy', 3), 'frontal'], ['LIVE.', at('live', 4), 'garden'], ['INVEST.', at('dwell'), 'pool']];
  const panels = WORDS.map(([w, t, s], i) => {
    const pn = panel(L, s, TX - 0.3, TD + 0.4, { x: i * 480, w: 482, rate: 1, shade: 0.45 });
    gsap.set(pn, { autoAlpha: 0 });
    tl.fromTo(pn, { autoAlpha: 1, yPercent: i % 2 ? -100 : 100 }, { yPercent: 0, duration: 0.5, ease: 'power4.out', immediateRender: false }, TX - 0.35 + i * 0.05);
    const lab = el(`<div class="abs" style="left:0;width:480px;top:500px;text-align:center;${big('', 78, 'color:#F4EEE8')}">${w}</div>`, pn);
    gsap.set(lab, { autoAlpha: 0 });
    tl.fromTo(lab, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power4.out', immediateRender: false }, t);
    tl.to(pn.querySelector('div'), { background: 'rgba(2,12,31,.1)', duration: 0.3 }, t);
    tl.to(pn, { yPercent: i % 2 ? 100 : -100, duration: 0.45, ease: 'power4.in' }, TD - 0.4 + i * 0.04);
    return pn;
  });
  // rhythm bars pulse with the voice
  const BARS = el('<div class="layer" style="z-index:1"></div>', L);
  const n = 32, bw = W / n, rr = rng(3);
  const bars = [];
  for (let i = 0; i < n; i++) {
    const b = el(`<div class="abs" style="left:${i * bw + bw * 0.3}px;top:0;width:${bw * 0.4}px;height:1080px;background:${i % 5 === 2 ? '#E6BFA4' : 'rgba(244,238,232,.18)'};transform-origin:50% 50%;border-radius:20px"></div>`, BARS);
    gsap.set(b, { scaleY: 0 });
    tl.to(b, { scaleY: 0.25 + rr() * 0.5, duration: 0.3, ease: 'power3.out' }, TD - 0.2 + i * 0.01);
    const VOW = VO.filter(v => v[1] >= TD && v[1] < TB + 2.5);
    VOW.forEach((v, k) => tl.to(b, { scaleY: 0.15 + rr() * 0.75, duration: 0.18, ease: 'sine.inOut' }, v[1] + (i % 4) * 0.02));
    bars.push(b);
  }
  const tband = el('<div class="abs" style="left:0;top:380px;width:1920px;height:300px;background:linear-gradient(180deg,rgba(4,30,66,0),rgba(4,30,66,.92) 25%,rgba(4,30,66,.92) 75%,rgba(4,30,66,0));z-index:2"></div>', L);
  gsap.set(tband, { autoAlpha: 0 }); tl.to(tband, { autoAlpha: 1, duration: 0.4 }, TD - 0.1); tl.to(tband, { autoAlpha: 0, duration: 0.3 }, TL - 0.45);
  const ds = ctext('DESIGNED FOR THE RHYTHM|OF MODERN LIFE.', '', 410, L, big('', 104, 'color:#F4EEE8;z-index:3'));
  rise(ds, TD + 0.05, { lineGap: [TD + 0.05, at('of modern life')] }); out(ds, TB - 0.2);
  const rb = ctext('AFTER CONSTRUCTION,|[RESPONSIBILITY BEGINS.]', '', 410, L, big('', 104, 'color:#F4EEE8;z-index:3'));
  rise(rb, TB, { lineGap: [TB, at('responsibility begins')] }); out(rb, TL - 0.45);
  // bars converge into the ZOOD symbol
  bars.forEach((b, i) => tl.to(b, { left: 960 - bw * 0.2, scaleY: 0.02, opacity: 0, duration: 0.6, ease: 'power3.in' }, TL - 0.75 + Math.abs(i - n / 2) * 0.008));
  const SY = el(`<img class="abs" src="${A('brand/symbol-white.png')}" style="left:${960 - 150}px;top:${330}px;width:300px">`, L);
  gsap.set(SY, { autoAlpha: 0 });
  tl.fromTo(SY, { autoAlpha: 0, scale: 0.2, rotation: -90 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.6)', immediateRender: false }, TL - 0.2);
  // split end card: night footage left, navy right
  const ENDL = el('<div class="layer"></div>', L);
  const nf = panel(ENDL, 'night', TL - 0.2, END, { x: 0, w: 960, rate: 0.85, shade: 0.25 });
  gsap.set(nf, { autoAlpha: 0 });
  tl.fromTo(nf, { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power4.inOut', immediateRender: false }, TL - 0.05);
  tl.fromTo(nf.firstChild, { scale: 1.15 }, { scale: 1, duration: END - TL, ease: 'none', immediateRender: false }, TL + 0.5);
  tl.to(SY, { left: 960 + 480 - 150, top: 200, scale: 0.55, duration: 0.7, ease: 'power4.inOut' }, TL - 0.05);
  const lg = el(`<img class="abs" src="${A('brand/logo-white.png')}" style="left:${1440 - 300}px;top:250px;width:600px">`, L);
  gsap.set(lg, { autoAlpha: 0 });
  tl.fromTo(lg, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE, immediateRender: false }, TL + 0.55);
  tl.to(SY, { autoAlpha: 0, duration: 0.4 }, TL + 0.55);
  const l1 = el(`<div class="abs" style="left:${960 + 80}px;width:800px;top:540px;text-align:center;${big('', 64, 'color:#F4EEE8')}"><span class="w">LIVE</span> <span class="w">LUXURY.</span></div>`, L);
  const l2 = el(`<div class="abs" style="left:${960 + 80}px;width:800px;top:620px;text-align:center;${big('', 64, 'color:#E6BFA4')}"><span class="w">LIVE</span> <span class="w">ZOOD.</span></div>`, L);
  [l1, l2].forEach(e => gsap.set(e, { autoAlpha: 0 }));
  slam(l1, TL + 0.6); slam(l2, TZ2);
  const badges = el(`<div class="abs" style="left:${960 + 80}px;width:800px;top:800px;display:flex;justify-content:center;gap:24px">
      <img src="${A('brand/app-store.svg')}" style="height:70px;width:236px" class="bd"><img src="${A('brand/google-play.svg')}" style="height:70px;width:236px" class="bd"></div>`, L);
  const bds = badges.querySelectorAll('.bd'); gsap.set(bds, { autoAlpha: 0 });
  tl.fromTo(bds, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12, ease: EASE, immediateRender: false }, after('live zood') + 0.6);
  const dl = el(`<div class="abs label" style="left:${960 + 80}px;width:800px;top:745px;text-align:center;font-size:18px;color:#E6BFA4">Download the ZOOD app</div>`, L);
  gsap.set(dl, { autoAlpha: 0 }); tl.to(dl, { autoAlpha: 1, duration: 0.5 }, after('live zood') + 0.4);
  const web = el(`<div class="abs" style="left:${960 + 80}px;width:800px;top:920px;text-align:center;font-size:26px;letter-spacing:.1em;color:rgba(244,238,232,.6)">zood.sa</div>`, L);
  gsap.set(web, { autoAlpha: 0 }); tl.to(web, { autoAlpha: 1, duration: 0.5 }, after('live zood') + 1.0);
  const black = el('<div class="layer" style="background:#000"></div>', L);
  gsap.set(black, { autoAlpha: 0 });
  tl.to(black, { autoAlpha: 1, duration: 0.9, ease: 'none' }, END - 0.9);
  tl.set({}, {}, END);
}
