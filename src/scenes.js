// ZOOD app film v5 — full timeline. Every cue is tied to a spoken phrase via at()/after()
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
function lineSweep(t, parent, { n = 9, color = 'rgba(214,165,140,.85)', dir = 1 } = {}) { brandSweep(t, parent, { n, color, dir }); }
const ROSE_GRAD_SVG = `<defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#7a4e40"/><stop offset=".5" stop-color="#E6BFA4"/><stop offset="1" stop-color="#A27063"/></linearGradient></defs>`;

// =====================================================================
// S1+S2 — continuous, high-motion opening on live ZOOD footage
// sunrise "Luxury." → iris into facade detail → travelling frame (a new shot + layout per "More ___")
// → arch on cream → triptych → "happiness" → paper → full-bleed "experience you live"
// =====================================================================
{
  const TB = at('but luxury'), TM = at('more presence'), T0 = at('because true luxury'), TA = at('it is about having'), TH = at('and that is exactly'),
    TW = at('that is why'), TX = at('it is an experience'), T1 = at('traditionally');
  const tLv = at('living'), tPz = at('personalization'), tCf = at('comfort'), tTm = at('time for what');

  // --- sunrise opening
  const L = layer('bg-navy'); show(L, 0, null, 0.01);
  tl.set(L, { autoAlpha: 0 }, T0 + 1.2);
  const SR = el('<div class="layer"></div>', L);
  vclip(SR, 'sunrise', 0, TB + 0.6, { rate: 1.3 });
  el('<div class="layer" style="background:linear-gradient(180deg,rgba(2,12,31,.55),rgba(2,12,31,.15) 45%,rgba(2,12,31,.6))"></div>', SR);
  tl.fromTo(SR, { scale: 1.18 }, { scale: 1.0, duration: TB + 0.6, ease: 'power1.out', immediateRender: true }, 0);
  const D = el('<div class="layer"></div>', L);
  const svg = el(`<svg class="abs" width="1920" height="1080" style="left:0;top:0">${ROSE_GRAD_SVG}<path d="${CURVE_D}" fill="none" stroke="url(#rg)" stroke-width="2.5"/></svg>`, D);
  strokeDraw(svg.querySelector('path'), 0.2, 2.4);
  const lux = ctext('Luxury.', 'h0 cream', 440, D, 'font-size:190px;text-shadow:0 10px 60px rgba(0,0,0,.35)');
  reveal(lux, 0.05, { stagger: 0, dur: 1.3, blur: 30, y: 16 });
  tl.fromTo(lux, { letterSpacing: '0.16em' }, { letterSpacing: '0.02em', duration: 3.6, ease: 'power2.out', immediateRender: false }, 0.05);
  const sub = ctext('It has always been at the heart of [ZOOD.]', 'h3 cream', 680, D, 'opacity:.9');
  rise(sub, at('it has always'));
  const PX = 1250, PY = 572;
  tl.to(lux, { scale: 1.25, transformOrigin: `${PX}px ${PY - 440}px`, autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, TB - 0.3);
  tl.to([sub, svg], { autoAlpha: 0, duration: 0.4 }, TB - 0.3);

  // --- navy-soft stage for the "More" sequence
  const Ls = layer('bg-navy-soft'); show(Ls, TM - 0.4, null, 0.3);
  tl.set(Ls, { autoAlpha: 0 }, T0 + 1.2);
  const moreTxt = [
    ['[More] presence.', TM, 'h1 cream', 'left:170px;top:440px'],
    ['[More] living.', tLv, 'h1 cream', 'left:1000px;top:440px'],
    ['[More]|personalization.', tPz, 'h1 cream', 'left:140px;top:640px;text-shadow:0 8px 40px rgba(0,0,0,.4)'],
    ['[More]', tCf, 'h1', 'left:40px;width:580px;top:470px;text-align:right'],
    ['[More] time for what truly matters.', tTm, 'h2 cream', `left:0;width:${W}px;top:110px;text-align:center`],
  ].map(([s, t, cls, st], i, arr) => {
    const e = text(s, cls, st, Ls); rise(e, t, { stagger: 0.05, dur: 0.6 });
    if (i < arr.length - 1 && i !== 3) hide(e, arr[i + 1][1] - 0.15, 0.3);
    return e;
  });
  const cf2 = ltext('comfort.', 'h1 cream', 1300, 470, Ls); rise(cf2, tCf + 0.08);
  hide(moreTxt[3], tTm - 0.15, 0.3); hide(cf2, tTm - 0.15, 0.3); hide(moreTxt[4], T0 - 0.3, 0.3);

  // --- cream world (slides up with the kinked brand edge)
  const C2 = el('<div class="layer bg-cream"></div>', stage);
  gsap.set(C2, { autoAlpha: 0 });
  el(`<svg class="abs" width="1920" height="140" style="left:0;top:-139px"><path d="M0 140 L0 70 L860 70 C930 70 930 0 1000 0 L1920 0 L1920 140 Z" fill="#FBF7F3"/></svg>`, C2);
  tl.set(C2, { autoAlpha: 1 }, T0 - 0.35);
  tl.fromTo(C2, { y: 1240 }, { y: 0, duration: 0.85, ease: 'power3.inOut', immediateRender: false }, T0 - 0.35);
  tl.set(C2, { autoAlpha: 0 }, TX + 1.0);
  // slow kinked line pattern drifting behind everything on cream
  const kl = kinkLines(C2, { n: 16, color: 'rgba(162,112,99,.14)', width: 2, seed: 9, dx: 50 });
  tl.fromTo(kl.svg, { x: 0 }, { x: -260, duration: TX - T0 + 1, ease: 'none', immediateRender: false }, T0 - 0.35);
  const t1 = ltext('Because true luxury is not|about having more things.', 'h2 navy', 170, 300, C2);
  rise(t1, T0 + 0.1, { lineGap: [T0 + 0.1, at('about having more things')] }); hide(t1, TA - 0.25, 0.3);
  // floating "things" that scatter away
  const things = [['cabinet.jpg', 190, 600, 230, 170], ['report-folder.jpg', 470, 680, 260, 160], ['copper.jpg', 760, 560, 170, 170], ['wood-wall.jpg', 300, 820, 190, 150], ['letter.jpg', 620, 860, 240, 140], ['arch.jpg', 880, 760, 150, 150]];
  const rr = rng(31);
  things.forEach(([src, x, y, w, h], i) => {
    const c = photoCard(PH(src), { x, y, w, h, radius: 18 }, C2);
    c.style.boxShadow = '0 24px 50px rgba(60,40,25,.22)';
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, y: 80, rotation: (rr() - 0.5) * 20, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: EASE, immediateRender: false }, T0 + 0.2 + i * 0.07);
    tl.to(c, { y: `-=${30 + rr() * 30}`, rotation: `+=${(rr() - 0.5) * 12}`, duration: 2.2, ease: 'sine.inOut' }, T0 + 0.9);
    const ang = Math.atan2(y - 760, x - 560);
    tl.to(c, { x: Math.cos(ang) * 900, y: Math.sin(ang) * 700, rotation: `+=${(rr() - 0.5) * 90}`, scale: 0.6, autoAlpha: 0, filter: 'blur(6px)', duration: 0.8, ease: 'power3.in' }, at('having more things') + 0.25 + i * 0.03);
  });
  const t2 = ctext('It is about having more of|[what is designed around you.]', 'h2 navy', 90, C2);
  rise(t2, TA, { lineGap: [TA, at('what is designed')] }); hide(t2, TH - 0.25, 0.3);
  const h1 = ltext('That is exactly what', 'h3 navy', 170, 360, C2, 'opacity:.7');
  const h2 = ltext('happiness', 'h0 navy', 160, 430, C2);
  const h3 = ltext('[means.]', 'h2', 170, 620, C2);
  rise(h1, TH); rise(h2, at('happiness'), { stagger: 0 }); rise(h3, at('means'));
  tl.fromTo(h2, { letterSpacing: '0.1em' }, { letterSpacing: '0em', duration: 1.6, ease: 'power2.out', immediateRender: false }, at('happiness'));
  [h1, h2, h3].forEach(e => hide(e, TW - 0.25, 0.3));
  const pr = ltext('That is why, at [ZOOD,]|luxury is not a promise on paper.', 'h2 navy', 170, 330, C2);
  rise(pr, TW + 0.1, { lineGap: [TW + 0.1, at('luxury is not a promise')] }); hide(pr, TX - 0.45, 0.3);
  // floating sheet of "paper" that flips away
  const paper = el(`<div class="card" style="left:190px;top:600px;width:380px;height:250px;padding:30px 34px">
      <div class="label" style="font-size:13px;color:#A27063">Promise</div>
      ${[92, 100, 80, 96].map(w => `<div style="height:8px;border-radius:4px;background:rgba(4,30,66,.12);margin-top:20px;width:${w}%"></div>`).join('')}</div>`, C2);
  gsap.set(paper, { autoAlpha: 0 });
  tl.fromTo(paper, { autoAlpha: 0, y: 60, rotationX: 30, rotationZ: -8, transformPerspective: 1400 }, { autoAlpha: 1, y: 0, rotationX: 12, rotationZ: -4, duration: 0.8, ease: EASE, immediateRender: false }, TW + 0.3);
  tl.to(paper, { rotationY: 25, rotationZ: 3, y: -20, duration: 2.0, ease: 'sine.inOut' }, TW + 1.1);
  tl.to(paper, { rotationY: 180, x: 500, y: -300, scale: 0.4, autoAlpha: 0, duration: 0.8, ease: 'power3.in' }, TX - 0.6);

  // side arches of the triptych
  const sideA = [[260, 'reflection'], [1260, 'arcade']].map(([x, shot], i) => {
    const a = el(`<div class="abs" style="left:${x}px;top:330px;width:400px;height:680px;border-radius:200px 200px 24px 24px;overflow:hidden;box-shadow:0 30px 70px rgba(80,50,30,.22)"></div>`, C2);
    vclip(a, shot, TA, TH + 0.4, { rate: 0.9 });
    gsap.set(a, { autoAlpha: 0 });
    tl.fromTo(a, { autoAlpha: 0, x: i ? -500 : 500, scale: 0.7 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.85, ease: 'power3.out', immediateRender: false }, TA + 0.1);
    tl.to(a, { y: i ? -24 : 24, duration: TH - TA - 0.9, ease: 'sine.inOut' }, TA + 0.95);
    tl.to(a, { x: i ? 700 : -700, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, TH - 0.3);
    return a;
  });

  // THE FRAME — one element that travels through every layout
  const FRL = zlayer(20); show(FRL, TM - 0.4, null, 0.01);
  const fr = el('<div class="abs" style="left:1080px;top:110px;width:680px;height:860px;border-radius:40px;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,.45)"></div>', FRL);
  const shots = [['garden', TM - 0.4, tLv + 0.8, 1], ['boulevard', tLv - 0.1, tPz + 0.8, 1], ['g:p17', tPz - 0.1, tCf + 0.8, 1, 1.9], ['swim', tCf - 0.1, tTm + 0.8, 1],
    ['dining', tTm - 0.1, T0 + 0.8, 1], ['pergola', T0 - 0.2, TA + 0.9, 0.8], ['pool', TA - 0.1, TH + 0.8, 0.9], ['kids', TH - 0.25, TW + 0.8, 0.55], [null, TW - 0.15, TX + 0.6], ['bench', TX - 0.5, T1 + 0.6, 0.75]];
  shots.forEach(([shot, t, t1, rate, from = 0], i) => {
    const box = el('<div class="abs" style="inset:0;overflow:hidden"></div>', fr);
    if (shot && shot.startsWith('g:')) gclip(box, shot.slice(2), t, t1, { rate, from });
    else if (shot) vclip(box, shot, t, t1, { rate });
    else photo(PH('letter.jpg'), { w: 1920, h: 1080, pos: '32% 50%' }, box).style.cssText += ';inset:0;width:100%;height:100%';
    if (i) tl.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: true }, t);
    tl.fromTo(box, { scale: 1.15 }, { scale: 1.0, duration: Math.max(1, t1 - t), ease: 'none', immediateRender: false }, t);
  });
  const shade = el('<div class="abs" style="inset:0;background:linear-gradient(90deg,rgba(2,12,31,.75),rgba(2,12,31,.15) 60%,rgba(2,12,31,0)),linear-gradient(180deg,rgba(2,12,31,0) 40%,rgba(2,12,31,.7))"></div>', fr);
  const navy = el('<div class="abs" style="inset:0;background:#041E42"></div>', fr);
  gsap.set([shade, navy], { autoAlpha: 0 });
  const R = (a, b, c, d) => ({ borderTopLeftRadius: a, borderTopRightRadius: b, borderBottomRightRadius: c, borderBottomLeftRadius: d });
  const mv = (t, props, dur = 0.75) => tl.to(fr, { ...props, duration: dur, ease: 'power3.inOut' }, t);
  gsap.set(fr, { rotationY: -8, transformPerspective: 2000 });
  mv(tLv - 0.2, { left: 160, top: 110, width: 680, height: 860, rotationY: 8 });                                   // living: frame glides left
  mv(tPz - 0.2, { left: 0, top: 0, width: 1920, height: 1080, rotationY: 0, ...R(0, 0, 0, 0) });                   // personalization: full screen
  tl.to(shade, { autoAlpha: 1, duration: 0.5 }, tPz - 0.1); tl.to(shade, { autoAlpha: 0, duration: 0.4 }, tCf - 0.2);
  mv(tCf - 0.2, { left: 660, top: 90, width: 600, height: 900, ...R(300, 300, 32, 32) });                             // comfort: centred arch
  mv(tTm - 0.2, { left: 0, top: 250, width: 1920, height: 600, ...R(0, 0, 0, 0) });                                   // time: cinematic band
  mv(T0 - 0.35, { left: 1120, top: 120, width: 620, height: 840, ...R(310, 310, 32, 32), boxShadow: '0 40px 90px rgba(80,50,30,.25)' }, 0.9); // arch on cream
  mv(TA - 0.1, { left: 760, top: 330, width: 400, height: 680, ...R(200, 200, 24, 24) }, 0.8);                       // centre of the triptych
  mv(TH - 0.3, { left: 1120, top: 120, width: 620, height: 840, ...R(310, 310, 32, 32) }, 0.8);                      // "happiness"
  tl.to(fr, { rotationY: -10, duration: TW - TH, ease: 'sine.inOut' }, TH + 0.5);
  tl.to(fr, { rotationY: 6, duration: TX - TW, ease: 'sine.inOut' }, TW);
  mv(TX - 0.4, { left: 0, top: 0, width: 1920, height: 1080, rotationY: 0, ...R(0, 0, 0, 0) }, 0.9);                 // full screen: experience
  tl.to(shade, { autoAlpha: 1, duration: 0.8 }, TX - 0.2);
  tl.to(fr, { scale: 1.12, duration: 1.0, ease: 'power2.in' }, T1 - 0.5);
  tl.to(navy, { autoAlpha: 1, duration: 0.8, ease: 'power1.in' }, T1 - 0.45);
  tl.set(FRL, { autoAlpha: 0 }, T1 + 0.4);
  // text that must sit above the frame
  const TOP = zlayer(25); show(TOP, TM - 0.4, T1 - 0.4, 0.01, 0.3);
  [moreTxt[2]].forEach(e => TOP.appendChild(e));
  rise(ltext('It is an experience|[you live.]', 'h1 cream', 140, 690, TOP), TX, { lineGap: [TX, at('you live')] });

  // iris: the period of "Luxury." opens into facade detail, which then shrinks into the frame
  const Lc = zlayer(22); gsap.set(Lc, { autoAlpha: 0 });
  const LcIn = el('<div class="layer"></div>', Lc);
  vclip(LcIn, 'facade', TB - 0.3, TM + 0.5, { rate: 0.9 });
  el('<div class="layer" style="background:rgba(2,12,31,.35)"></div>', Lc);
  tl.set(Lc, { autoAlpha: 1 }, TB - 0.3);
  tl.fromTo(Lc, { clipPath: `circle(0px at ${PX}px ${PY}px)` }, { clipPath: `circle(2300px at ${PX}px ${PY}px)`, duration: 1.0, ease: 'power3.in', immediateRender: false }, TB - 0.3);
  tl.set(Lc, { clipPath: FULL }, TB + 0.71);
  tl.fromTo(LcIn, { scale: 1.3, rotation: -3 }, { scale: 1.05, rotation: 0, duration: TM - TB + 0.8, ease: 'power1.out', immediateRender: false }, TB - 0.3);
  const det = ctext('But luxury in every [detail.]', 'h1 cream', 480, Lc, 'text-shadow:0 8px 40px rgba(0,0,0,.4)');
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
  // the client's 3D icons (green removed) land as each word is spoken, then everything is pulled into one point
  [['paper', 380, 330, -8], ['sprea', 1540, 330, 6], ['conve', 960, 790, 4]].forEach(([nm, cx, cy, rot], i) => {
    const t = groups[i][1];
    const w3 = el('<div class="abs" style="left:0;top:0;width:464px;height:720px;clip-path:inset(60px 14px 120px 14px)"></div>', L);
    gclip(w3, nm, t - 0.1, TQ + 1.2, { fit: 'fill' });
    const s3 = 0.95;
    gsap.set(w3, { x: cx - 232, y: cy - 333, scale: s3, transformOrigin: '232px 333px', autoAlpha: 0 });
    tl.fromTo(w3, { autoAlpha: 0, scale: 0.3, rotation: rot - 25, y: cy - 333 + 120 }, { autoAlpha: 1, scale: s3, rotation: rot, y: cy - 333, duration: 0.75, ease: 'back.out(1.5)', immediateRender: false }, t - 0.05);
    tl.to(w3, { y: `-=${18 + i * 6}`, rotation: `+=${i % 2 ? -4 : 4}`, duration: Math.max(0.5, TQ - t - 0.7), ease: 'sine.inOut' }, t + 0.7);
    tl.to(w3, { x: 960 - 232, y: 540 - 333, scale: 0, rotation: `+=${140}`, autoAlpha: 0, duration: 0.9, ease: 'power3.in' }, TQ + 0.1 + i * 0.08);
  });
  groups.forEach(([, t, kinds]) => {
    for (let i = 0; i < 7; i++) {
      let x, y;
      do { x = 80 + r() * 1700; y = 80 + r() * 880; } while ((x > 420 && x < 1420 && y > 380 && y < 700) || (x > 480 && x < 1440 && y < 250));
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
  const AER = el('<div class="layer"></div>', L); gsap.set(AER, { autoAlpha: 0 });
  vclip(AER, 'aerial', T1 + 0.4, at('explore every') + 1, { rate: 0.9 });
  el('<div class="layer" style="background:linear-gradient(180deg,rgba(2,12,31,.55),rgba(2,12,31,.25) 50%,rgba(2,12,31,.7))"></div>', AER);
  tl.to(AER, { autoAlpha: 1, duration: 1.2, ease: 'sine.inOut' }, T1 + 0.5);
  tl.fromTo(AER, { scale: 1.12 }, { scale: 1.0, duration: 4, ease: 'none', immediateRender: false }, T1 + 0.5);
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
  const bgp = el('<div class="layer"></div>', BG);
  vclip(bgp, 'aerial', at('we build communities') + 0.4, TZ + 2, { rate: 0.9 });
  el('<div class="layer" style="background:rgba(2,12,31,.72)"></div>', BG);
  tl.set(bgp, { filter: 'blur(10px)' }, 0);
  tl.to(BG, { autoAlpha: 1, duration: 1.1, ease: 'sine.inOut' }, at('a smarter way to discover') - 0.45);
  kenburns(bgp, T0 - 0.2, TZ + 2, 1.2, 1.05);

  const c2 = ctext('And today, we have built with you', 'h2 cream', 830, L);
  rise(c2, T0 + 0.1); hide(c2, at('a smarter way to discover') - 0.2, 0.3);
  const sw = ctext('A smarter way to', 'h3 cream', 150, L, 'opacity:.8');
  rise(sw, at('a smarter way to discover')); hide(sw, TF - 0.2, 0.3);
  const J = [['Discover', at('discover'), 'haze', '50% 50%'], ['Create', at('create'), 'frontal', '60% 50%'],
    ['Live', at('live', 2), 'arcade', '50% 50%'], ['Enjoy', at('enjoy'), 'pool', '30% 50%']];
  // outline icons, as in the client's Discover reference
  const JI = [
    '<circle cx="62" cy="58" r="36"/><path d="M 40 50 A 26 26 0 0 1 62 32"/><path d="M 88 84 L 116 112" stroke-width="7"/>',
    '<path d="M 26 116 L 96 30 a 8 8 0 0 1 12 10 L 38 124 L 22 128 Z"/><path d="M 88 40 l 12 10"/><path d="M 112 118 L 52 50"/><path d="M 52 50 c -10 -12 -26 -14 -32 -8 c 6 2 6 10 4 14 c 8 6 20 6 28 -6 z"/>',
    '<path d="M 18 66 L 70 22 L 122 66"/><path d="M 30 56 V 122 H 110 V 56"/><path d="M 96 28 V 44"/><path d="M 70 102 C 50 88 44 78 50 70 C 56 62 66 64 70 72 C 74 64 84 62 90 70 C 96 78 90 88 70 102 Z"/>',
    '<circle cx="62" cy="66" r="46"/><path d="M 40 58 q 6 -8 12 0 M 72 58 q 6 -8 12 0"/><path d="M 42 80 q 20 22 40 0"/><path d="M 108 92 l 5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1 z" fill="rgba(4,30,66,.35)"/>',
  ];
  const slot = swapWords(J.map(j => [j[0] + '.', j[1]]), L, (s) => ctext(`[${s}]`, 'h1', 215, L), { useRise: true });
  hide(slot[3], TF - 0.2, 0.3);
  const cards = J.map(([name, t, im, pos], i) => {
    const c = el(`<div class="tile" style="left:${255 + i * 360}px;top:390px;width:330px;height:540px;border-radius:30px;box-shadow:0 40px 90px rgba(0,0,0,.5)"></div>`, L);
    vclip(c, im, at('a smarter way to discover') - 0.3, TZ, { pos });
    el('<div class="layer" style="width:100%;height:100%;background:linear-gradient(180deg,rgba(2,12,31,.05) 30%,rgba(2,12,31,.55) 75%,rgba(2,12,31,.8))"></div>', c);
    c.ic = el(`<svg class="abs" viewBox="0 0 140 140" width="150" height="150" style="left:90px;top:170px;overflow:visible"><g fill="none" stroke="#F4EEE8" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${JI[i]}</g></svg>`, c);
    c.lab = el(`<div class="abs" style="left:28px;bottom:26px"><div class="label" style="opacity:.75;font-size:15px">0${i + 1}</div><div class="h3 cream" style="font-size:40px;margin-top:6px">${name}</div></div>`, c);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, scaleY: 0.05, transformOrigin: '50% 100%' }, { autoAlpha: 1, scaleY: 1, duration: 0.85, ease: 'power3.out', immediateRender: false }, at('a smarter way to discover') - 0.25 + i * 0.09);
    drawAll(c.ic, t - 0.1, 0.7, 0.06);
    return c;
  });
  cards.forEach(c => tl.to(c.ic, { autoAlpha: 0, duration: 0.25 }, TN - 0.1));
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
  { const t0 = TZ + 0.7, n = Math.floor((at('discover', 2) - t0) / 2.4);
    tl.fromTo(L, { y: -9, rotation: -0.4 }, { y: 9, rotation: 0.4, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: n, immediateRender: false }, t0); }
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
  ambient(L, T0 - 0.6, TV + 0.4, { seed: 3 });
  const DB = el('<div class="layer"></div>', L);
  vclip(DB, 'haze', T0 - 0.6, at('then tap'), { rate: 0.8 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.55),rgba(2,12,31,.82) 55%,rgba(2,12,31,.9))"></div>', DB);
  tl.fromTo(DB, { scale: 1.1 }, { scale: 1, duration: 6, ease: 'none', immediateRender: false }, T0 - 0.6);
  tl.to(DB, { autoAlpha: 0, duration: 0.8 }, at('then tap') - 0.6);
  lineSweep(T0 - 0.6, L);
  chapterLabel('01', 'Discover', T0 + 0.2, TE - 0.5);

  // radar rings behind the phone (the discovery engine)
  const RR = svgEl([0, 1, 2, 3].map(() => `<circle cx="620" cy="540" r="120" data-nodraw="1"/>`).join(''), { sw: 1.5 }, L);
  gsap.set(RR, { autoAlpha: 0 });
  tl.to(RR, { autoAlpha: 1, duration: 0.4 }, T0 + 0.3);
  RR.querySelectorAll('circle').forEach((c, i) => tl.fromTo(c, { attr: { r: 120 }, opacity: 0.9 }, { attr: { r: 640 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: 2, immediateRender: true }, T0 + 0.3 + i * 0.6));
  tl.to(RR, { autoAlpha: 0, duration: 0.4 }, at('then tap') - 0.3);

  pose(hero, T0 - 0.75, { x: 620, ry: 12, dur: 0.9 });
  swap(hero, SCR('onboarding.jpg'), T0 - 0.2);
  const e1 = ltext('Explore every destination|[with complete clarity.]', 'h2 cream', 1000, 280, L);
  rise(e1, T0 + 0.2, { lineGap: [T0 + 0.2, at('with complete clarity')] });
  const lst = ltext('The layouts.|The views.|The neighborhood.', 'h2 cream', 1000, 520, L, 'line-height:1.35');
  rise(lst, at('the layouts'), { lineGap: [at('the layouts'), at('the views'), at('the neighborhood')] });
  focusLine(lst, 0, at('the layouts')); focusLine(lst, 1, at('the views')); focusLine(lst, 2, at('the neighborhood'));
  swap(hero, SCR('map.jpg'), at('layouts') - 0.1);
  swap(hero, SCR('city3d.jpg'), at('views') - 0.1);
  tl.to(hero.cur, { scale: 1.28, transformOrigin: '50% 42%', duration: 1.8, ease: 'power2.inOut' }, at('neighborhood'));
  hide(e1, at('then tap') - 0.3, 0.35); hide(lst, at('then tap') - 0.3, 0.35);

  // tap · rotate the model · choose your unit (P1: the floor lights up) · walk through (the 3D configurator)
  const tTap = at('tap'), tRot = at('rotate the model'), tCh = at('choose your unit'), tW = at('walk through'), tB = at('before the first'), tS = at('see the available');
  pose(hero, at('then tap') - 0.3, { x: 400, ry: 16, dur: 0.8 });
  swap(hero, SCR('walkthrough.png'), at('then tap') - 0.1);
  tap(hero, 0.2, 0.235, tTap);
  const tr = ltext('Tap.|Rotate the model.|Choose your unit.|Walk through.', 'h3 cream', 1530, 330, L, 'line-height:1.75');
  rise(tr, tTap, { lineGap: [tTap, tRot, tCh, tW] });
  focusLine(tr, 0, tTap); focusLine(tr, 1, tRot); focusLine(tr, 2, tCh); focusLine(tr, 3, tW);
  const mw = el('<div class="abs persp" style="left:680px;top:280px;width:680px;height:520px"></div>', L);
  const model = crop(SCR('walkthrough.png'), [0.06, 0.175, 0.94, 0.475], 640, { radius: 26, style: 'left:20px;top:20px;box-shadow:0 60px 120px rgba(0,0,0,.6)' }, mw);
  gsap.set(model, { autoAlpha: 0 });
  tl.fromTo(model, { autoAlpha: 0, x: -420, scale: 0.45, rotationX: 0, rotationZ: 0 }, { autoAlpha: 1, x: 0, scale: 1, rotationX: 52, rotationZ: -24, duration: 0.9, ease: 'power3.out', immediateRender: false }, tTap + 0.25);
  tl.to(model, { rotationZ: 24, duration: tCh - tRot + 0.2, ease: 'sine.inOut' }, tRot);
  tl.to(model, { autoAlpha: 0, scale: 0.8, duration: 0.35 }, tCh - 0.1);
  // one window carries "choose your unit" and "walk through" and then closes into the phone
  const WL = zlayer(60); show(WL, tCh - 0.25, null, 0.01);
  const win = el('<div class="abs" style="left:690px;top:250px;width:800px;height:580px;border-radius:34px;overflow:hidden;box-shadow:0 60px 140px rgba(0,0,0,.55);background:#0b2a55"></div>', WL);
  const u1 = el('<div class="abs" style="inset:0"></div>', win);
  gclip(u1, 'p1', tCh - 0.25, tW + 0.6, { from: 3.4 });
  tl.fromTo(win, { clipPath: 'inset(45% 40% 45% 40% round 34px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', duration: 0.7, ease: 'power3.out', immediateRender: false }, tCh - 0.25);
  tl.fromTo(u1, { scale: 1.06 }, { scale: 1.16, duration: tW - tCh + 0.8, ease: 'none', immediateRender: false }, tCh - 0.25);
  const fchip = el('<div class="chip dark" style="left:440px;top:300px;font-size:22px;padding:12px 22px"><span class="dot"></span>Floor 12 · Unit A4</div>', win);
  gsap.set(fchip, { autoAlpha: 0 }); pop(fchip, tCh + 0.75); out(fchip, tW - 0.15, 0.25);
  // the 3D configurator (the client's clip, its green background turned brand navy)
  const u2 = el('<div class="abs" style="inset:0;background:#0c2856"></div>', win);
  gsap.set(u2, { autoAlpha: 0 });
  gclip(u2, 'cfg3d', tW - 0.2, tS + 0.2, { fit: 'cover' });
  tl.fromTo(u2, { autoAlpha: 0, clipPath: 'inset(0% 0% 0% 100%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tW - 0.2);
  // window grows as the list leaves
  hide(tr, tB - 0.35, 0.3);
  tl.to(win, { left: 640, top: 120, width: 1180, height: 664, duration: 0.8, ease: 'power3.inOut' }, tB - 0.3);
  const bfs = ltext('Before the first foundation|stone is even laid,', 'h2 cream', 640, 830, WL);
  rise(bfs, tB, { lineGap: [tB, at('stone is even laid')] }); hide(bfs, tS - 0.35, 0.3);
  // flatten the phone, then the window closes into its screen
  pose(hero, tS - 1.0, { x: 400, ry: 0, dur: 0.5, ease: 'power2.inOut' });
  swap(hero, SCR('explore.jpg'), tS - 0.6, 'fade');
  const rr0 = screenRect(hero, 400);
  tl.to(win, { left: rr0.l, top: rr0.t, width: rr0.w, height: rr0.h, borderRadius: rr0.r, duration: 0.75, ease: 'power3.inOut' }, tS - 0.45);
  tl.to(win, { autoAlpha: 0, duration: 0.2 }, tS + 0.15);
  tl.set(WL, { autoAlpha: 0 }, tS + 0.4);
  pose(hero, tS + 0.2, { x: 1400, ry: -12, dur: 0.9, ease: 'power2.inOut' });
  const rt = ltext('See the available units|[in real time.]', 'h2 cream', 150, 250, L, 'font-size:64px');
  rise(rt, tS + 0.2, { lineGap: [tS + 0.2, at('in real time')] }); hide(rt, at('compare them') - 0.25, 0.3);
  const G = el('<div class="abs" style="left:175px;top:480px;width:560px;height:330px"></div>', L);
  const gr = rng(4), cells = [];
  for (let rr = 0; rr < 4; rr++) for (let cc = 0; cc < 7; cc++) {
    const c = el(`<div class="abs" style="left:${cc * 78}px;top:${rr * 78}px;width:64px;height:64px;border-radius:12px;border:1.5px solid rgba(214,165,140,.6)"></div>`, G);
    gsap.set(c, { autoAlpha: 0 }); cells.push(c);
    tl.fromTo(c, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, tS + 0.5 + (rr * 7 + cc) * 0.016);
    if (gr() < 0.45) tl.to(c, { background: 'rgba(214,165,140,.85)', duration: 0.25 }, at('in real time') + gr() * 1.0);
  }
  const live = pop(chip('<span class="dot live"></span>Live · 95 units available', 640, 160, L), at('in real time') + 0.3);
  out(live, at('compare them') - 0.25);
  [cells[9], cells[12]].forEach(c => tl.to(c, { boxShadow: '0 0 0 3px #F3D2B8', background: 'rgba(230,191,164,1)', duration: 0.3 }, at('compare them') - 0.1));
  tl.to(G, { autoAlpha: 0, x: -60, duration: 0.35, ease: EASE_IN }, at('compare them') + 0.25);
  pose(hero, at('compare them') - 0.2, { x: 960, ry: 0, dur: 0.8 });
  swap(hero, SCR('compare.png'), at('compare them'));
  const cm = ltext('Compare them|[side by side.]', 'h2 cream', 150, 130, L);
  rise(cm, at('compare them'), { lineGap: [at('compare them'), at('side by side')] }); hide(cm, at('filter by') - 0.2, 0.3);
  const ca = crop(SCR('compare.png'), [0.03, 0.055, 0.5, 0.31], 360, { radius: 24, style: 'left:290px;top:430px;box-shadow:0 40px 90px rgba(0,0,0,.5)' }, L);
  const cb = crop(SCR('compare.png'), [0.5, 0.055, 0.97, 0.31], 360, { radius: 24, style: 'left:1270px;top:430px;box-shadow:0 40px 90px rgba(0,0,0,.5)' }, L);
  [[ca, 480], [cb, -480]].forEach(([c, dx], i) => {
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, x: dx, scale: 0.6, rotationY: 0, transformPerspective: 1600 }, { autoAlpha: 1, x: 0, scale: 1, rotationY: i ? -14 : 14, duration: 0.75, ease: 'power3.out', immediateRender: false }, at('side by side') - 0.2 + i * 0.1);
    tl.to(c, { autoAlpha: 0, x: dx * 0.6, scale: 0.7, duration: 0.4, ease: EASE_IN }, at('filter by') - 0.3);
  });

  // filter — the client's Filters reference: a small UI card for every spoken filter
  const tF = at('filter by');
  swap(hero, SCR('filter.jpg'), tF - 0.05);
  const fl2 = ltext('Filter by', 'h1 cream', 150, 128, L);
  rise(fl2, tF); hide(fl2, TE - 0.3, 0.3);
  const FC = (x, y, w, h, inner) => { const c = el(`<div class="card" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:22px 24px;border-radius:20px"><div style="position:absolute;left:50%;top:9px;width:44px;height:4px;margin-left:-22px;border-radius:2px;background:rgba(4,30,66,.12)"></div>${inner}</div>`, L); gsap.set(c, { autoAlpha: 0 }); return c; };
  const slider = (lab, unit) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:21px"><span>${lab}</span><span style="background:rgba(4,30,66,.07);border-radius:999px;padding:6px 18px;font-size:19px">${unit}</span></div>
      <div style="position:relative;margin-top:22px;height:4px;border-radius:2px;background:rgba(4,30,66,.12)"><div class="fill" style="position:absolute;left:0;top:0;height:4px;width:10%;border-radius:2px;background:#041E42"></div>
      <div class="kb" style="position:absolute;left:10%;top:-11px;width:26px;height:26px;margin-left:-13px;border-radius:50%;border:2.5px solid #041E42;background:#fff"></div></div>`;
  const area = FC(200, 318, 290, 118, slider('Area', 'Sq. Ft.'));
  const beds = FC(220, 510, 270, 120, `<div style="display:flex;justify-content:space-between;font-size:20px"><span>Bedrooms</span><span>Bathrooms</span></div>
      <div style="display:flex;justify-content:space-between;margin-top:14px">${['bd', 'bt'].map(k => `<div style="width:108px;height:42px;border-radius:999px;background:rgba(4,30,66,.07);display:flex;align-items:center;justify-content:center;gap:12px;font-size:21px"><span class="${k}">0</span><span style="opacity:.5">⌄</span></div>`).join('')}</div>`);
  const mapc = FC(200, 690, 180, 262, `<div style="height:84px;border-radius:12px;background:linear-gradient(135deg,#e9e4dc 0 45%,#cfe3c6 45% 60%,#e9e4dc 60%);position:relative;overflow:hidden">
      <div style="position:absolute;left:30%;top:0;bottom:0;width:6px;background:#fff"></div><div style="position:absolute;top:45%;left:0;right:0;height:6px;background:#fff"></div>
      <svg viewBox="0 0 40 40" width="44" height="44" style="position:absolute;left:50%;top:50%;margin:-22px 0 0 -22px"><path d="M6 10l9-4 10 4 9-4v24l-9 4-10-4-9 4z M15 6v24 M25 10v24" fill="none" stroke="#041E42" stroke-width="2.4" stroke-linejoin="round"/></svg></div>
      ${['Schools', 'Parks', 'Shops'].map(s => `<div class="mr" style="font-size:20px;margin-top:13px;display:flex;gap:10px;align-items:center"><span style="width:10px;height:10px;border-radius:50%;background:#A27063"></span>${s}</div>`).join('')}`);
  const rad = FC(1462, 330, 296, 118, slider('Radius', 'KM'));
  const pref = FC(1462, 540, 262, 150, ['Studio', 'Pet-friendly', 'Gym'].map((s, i) => `<div style="display:flex;align-items:center;gap:14px;font-size:21px;margin-top:${i ? 12 : 4}px"><span class="cb" style="width:24px;height:24px;border-radius:6px;border:2px solid rgba(4,30,66,.4);display:inline-flex;align-items:center;justify-content:center"></span>${s}</div>`).join(''));
  const fchips = [['Space', at('space'), 532, 352], ['Distance', at('distance'), 1214, 372], ['Family', at('family'), 530, 552], ['Individual', at('individual'), 1214, 592], ['Residential community', at('residential community'), 360, 760]].map(([s, t, x, y]) => {
    const c = chip(`<span class="dot"></span>${s}`, x, y, L, 'dark'); pop(c, t, { x: x < 960 ? 60 : -60, scale: 0.9 }); out(c, TE - 0.3); return c;
  });
  [[area, at('space') - 0.1], [rad, at('distance') - 0.1], [beds, at('family') - 0.1], [pref, at('individual') - 0.1], [mapc, at('residential community') - 0.1]].forEach(([c, t]) => { pop(c, t, { y: 30, scale: 0.92 }); out(c, TE - 0.3); });
  const slide = (c, t, to) => { tl.to(c.querySelector('.fill'), { width: to, duration: 0.8, ease: 'power2.inOut' }, t); tl.to(c.querySelector('.kb'), { left: to, duration: 0.8, ease: 'power2.inOut' }, t); };
  slide(area, at('space') + 0.3, '38%'); slide(rad, at('distance') + 0.3, '42%');
  count(beds.querySelector('.bd'), 0, 3, at('family') + 0.3, 0.6); count(beds.querySelector('.bt'), 0, 2, at('family') + 0.45, 0.6);
  pref.querySelectorAll('.cb').forEach((b, i) => { if (i !== 1) tl.to(b, { background: '#041E42', borderColor: '#041E42', duration: 0.2 }, at('individual') + 0.3 + i * 0.15); });
  mapc.querySelectorAll('.mr').forEach((m, i) => tl.fromTo(m, { opacity: 0.25 }, { opacity: 1, duration: 0.25, immediateRender: false }, at('residential community') + 0.2 + i * 0.15));
  tap(hero, 0.25, 0.825, at('space')); tap(hero, 0.43, 0.825, at('family')); tap(hero, 0.72, 0.947, at('residential community') + 0.4);

  // dive through the phone into the empty apartment that furnishes itself (P2)
  const P = zlayer(60); gsap.set(P, { autoAlpha: 0 }); portalHome = P;
  P.style.background = 'radial-gradient(120% 100% at 60% 40%,#c9d3d8,#b9c3c9)';
  const pw = el('<div class="abs" style="left:300px;top:60px;width:1620px;height:911px"></div>', P);
  gclip(pw, 'p2', TE - 0.55, TV + 2.0, { from: 0 });
  portalOpen(P, TE - 0.55, screenRect(hero, 960), 0.85);
  tl.fromTo(pw, { scale: 1.08 }, { scale: 1.0, duration: TV - TE + 1.2, ease: 'power1.out', immediateRender: false }, TE - 0.55);
  rise(ltext('So you can find|your [perfect home,]', 'h1 navy', 120, 110, P), TE, { lineGap: [TE, at('your perfect home')] });
  rise(ltext('not just an empty room.', 'h2 navy', 124, 340, P, 'opacity:.8'), at('not just an empty'));
}

// =====================================================================
// 02 OWN
// =====================================================================
{
  const T0 = at('verify your identity'), TH = at('when it is time');
  const L = layer('bg-navy-soft persp'); show(L, T0 - 0.85, TH + 0.6, 0.35, 0.5);
  ambient(L, T0 - 0.85, TH + 0.6, { seed: 5 });
  lineSweep(T0 - 0.2, L, { dir: -1 });
  chapterLabel('02', 'Create', T0 + 0.3, TH - 0.4);
  const p = hero;
  setPoseAt(p, T0 - 0.95, { x: 1260, ry: 0 });
  swap(p, SCR('login.jpg'), T0 - 0.95, 'fade');
  pose(p, T0 + 0.1, { x: 1260, ry: -12, dur: 0.8, ease: 'power2.inOut' });

  // the furnished apartment settles into a style card; the style switches as the client's P3 morphs
  const CR = { l: 140, t: 380, w: 860, h: 484, r: 30 };
  const P = portalHome, pw = P.firstChild;
  tl.to(P.querySelectorAll('.h1,.h2'), { autoAlpha: 0, duration: 0.3 }, T0 - 0.75);
  tl.to(P, { clipPath: insetFor(CR), duration: 0.85, ease: 'power3.inOut' }, T0 - 0.45);
  tl.to(pw, { left: CR.l - 60, top: CR.t - 30, width: CR.w + 120, height: (CR.w + 120) * 9 / 16, duration: 0.85, ease: 'power3.inOut' }, T0 - 0.45);
  const p3 = el(`<div class="abs" style="left:${CR.l}px;top:${CR.t}px;width:${CR.w}px;height:${CR.h}px;border-radius:30px;overflow:hidden"></div>`, P);
  const tP3 = T0 + 0.45, morph = tP3 + (3.05 - 1.2);
  gclip(p3, 'p3', tP3, morph + 1.0, { from: 1.2 });
  gsap.set(p3, { autoAlpha: 0 });
  tl.to(p3, { autoAlpha: 1, duration: 0.5 }, tP3);
  const pill = el(`<div class="abs" style="left:${CR.l + 24}px;top:${CR.t + CR.h - 78}px;width:380px;height:54px;border-radius:999px;background:rgba(4,30,66,.82);border:1px solid rgba(214,165,140,.5)">
      <div class="k" style="position:absolute;left:4px;top:4px;width:150px;height:46px;border-radius:999px;background:linear-gradient(100deg,#B07A63,#E6BFA4)"></div>
      <div class="o1" style="position:absolute;left:4px;top:0;width:150px;height:54px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:500;color:#041E42">Classic</div>
      <div class="o2" style="position:absolute;left:158px;top:0;width:218px;height:54px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:500;color:#F4EEE8">Contemporary</div></div>`, P);
  gsap.set(pill, { autoAlpha: 0 }); pop(pill, tP3 + 0.2);
  tl.to(pill.querySelector('.k'), { left: 158, width: 218, duration: 0.45, ease: 'power3.inOut' }, morph - 0.2);
  tl.to(pill.querySelector('.o1'), { color: '#F4EEE8', duration: 0.2 }, morph - 0.1); tl.to(pill.querySelector('.o2'), { color: '#041E42', duration: 0.2 }, morph - 0.1);
  const cardOut = at('request information') - 0.15;
  tl.to(P, { clipPath: `inset(${CR.t}px ${W - CR.l - CR.w + 700}px ${H - CR.t - CR.h}px ${CR.l - 700}px round 30px)`, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, cardOut);

  const vt = ltext('Verify your identity|[in seconds.]', 'h2 cream', 150, 120, L);
  rise(vt, T0 + 0.1, { lineGap: [T0 + 0.1, at('in seconds')] }); hide(vt, at('request information') - 0.3, 0.3);
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

  // request · visit · reserve (the reservation carries the furniture chosen in 3D, with the running total)
  pose(p, at('request information') - 0.4, { x: 1080, ry: -12, dur: 0.7 });
  swap(p, SCR('project.jpg'), at('request information') - 0.15);
  const rv = ltext('Request information.|Book a dedicated visit.|[And reserve your unit.]', 'h2 cream', 150, 330, L, 'line-height:1.45');
  rise(rv, at('request information'), { lineGap: [at('request information'), at('book a dedicated'), at('and reserve your unit')] });
  focusLine(rv, 0, at('request information')); focusLine(rv, 1, at('book a dedicated')); focusLine(rv, 2, at('and reserve your unit'));
  hide(rv, at('review your contract') - 0.3, 0.35);
  tap(p, 0.5, 0.55, at('request information') + 0.2);
  const k1 = pop(chip(`<span class="tick">${ICON.check}</span>Information requested`, 0, 330, L), at('request information') + 0.4);
  const k2 = pop(chip(`<span class="tick">${ICON.check}</span>Visit booked · Thu 10:00 AM`, 0, 430, L), at('book a dedicated') + 0.4);
  [k1, k2].forEach(k => { k.style.left = 'auto'; k.style.right = '40px'; out(k, at('reserve your unit') - 0.25, 0.3); });
  swap(p, SCR('payment.jpg'), at('reserve your unit') - 0.15);
  tap(p, 0.5, 0.973, at('reserve your unit') + 0.4);
  const tRv = at('reserve your unit');
  const CC = { l: 1360, t: 170, w: 500, h: 750, r: 28 };
  const cart = el(`<div class="card" style="left:${CC.l}px;top:${CC.t}px;width:${CC.w}px;height:${CC.h}px;padding:30px 34px;border-radius:28px">
      <div class="label" style="font-size:14px;color:#A27063">Your selection</div>
      <div class="plan" style="position:relative;height:190px;margin-top:16px;border-radius:18px;overflow:hidden;background:#b0b9c1"></div>
      <div style="display:flex;justify-content:space-between;margin-top:18px;font-size:24px"><span>Unit A4 · Floor 12</span><span>SAR 2,100,000</span></div>
      <div class="sofa" style="position:relative;height:150px;margin-top:16px;border-radius:18px;background:linear-gradient(160deg,#F4EEE8,#E6DACE);overflow:hidden"></div>
      <div style="display:flex;justify-content:space-between;margin-top:16px;font-size:24px"><span>Furniture · Contemporary</span><span>SAR <span class="fu">0</span></span></div>
      <div style="height:1px;background:rgba(4,30,66,.12);margin:22px 0 18px"></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="label" style="font-size:15px">Total</span><span style="font-size:44px;font-weight:400">SAR <span class="tot">2,100,000</span></span></div>
      <div style="margin-top:20px;height:58px;border-radius:999px;background:#041E42;color:#F4EEE8;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:500">Reserve unit A4</div></div>`, L);
  const sbox = el('<div class="abs" style="left:50%;top:50%;width:1280px;height:720px;margin:-360px 0 0 -640px;transform:scale(.36)"></div>', cart.querySelector('.sofa'));
  gclip(sbox, 'sofa', tRv - 0.2, tRv + 4, { fit: 'fill' });
  gclip(cart.querySelector('.plan'), 'p5', tRv - 0.6, tRv + 4, { from: 2.6 });
  gsap.set(cart, { autoAlpha: 0 });
  tl.fromTo(cart, { autoAlpha: 0, x: 80, rotationY: -18, transformPerspective: 1800 }, { autoAlpha: 1, x: 0, rotationY: 0, duration: 0.6, ease: EASE, immediateRender: false }, tRv - 0.25);
  count(cart.querySelector('.fu'), 0, 186500, tRv + 0.35, 0.9, v => Math.round(v).toLocaleString('en-US'));
  count(cart.querySelector('.tot'), 2100000, 2286500, tRv + 0.35, 0.9, v => Math.round(v).toLocaleString('en-US'));

  // review & sign: the agreement — with the full price — signed on the tablet (P6)
  const tR = at('review your contract'), tSg = at('then sign it'), tP = at('with a single platform');
  const SG = zlayer(60); gsap.set(SG, { autoAlpha: 0 });
  const doc = el(`<div style="position:absolute;inset:0;background:#FBF8F5;color:#041E42;padding:58px 70px;font-family:Huwiya">
      <div style="display:flex;justify-content:space-between;align-items:center"><img src="${A('brand/logo-navy.png')}" style="height:54px"><span class="label" style="font-size:20px;color:#A27063">Sales agreement</span></div>
      <div style="font-size:40px;margin-top:40px">Unit A4 · Floor 12</div>
      ${[['Unit price', '2,100,000'], ['Furniture · Contemporary', '186,500']].map(([a, b]) => `<div style="display:flex;justify-content:space-between;font-size:30px;margin-top:24px;opacity:.8"><span>${a}</span><span>SAR ${b}</span></div>`).join('')}
      <div style="height:2px;background:rgba(4,30,66,.12);margin:28px 0 20px"></div>
      <div style="display:flex;justify-content:space-between;font-size:42px"><span>Total</span><span>SAR 2,286,500</span></div>
      <div style="position:absolute;left:70px;right:70px;bottom:70px;height:190px;border-radius:20px;border:2px dashed rgba(4,30,66,.25)">
        <div class="label" style="position:absolute;left:24px;top:16px;font-size:16px;opacity:.6">Signature</div>
        <svg viewBox="0 0 600 160" style="position:absolute;left:60px;top:20px;width:620px;height:160px"><path class="sig" d="M 20 110 C 60 30 90 30 80 100 S 120 150 150 80 S 190 40 200 100 C 210 140 240 60 270 90 S 330 120 360 70 C 380 40 400 120 430 100 S 520 60 580 80" fill="none" stroke="#041E42" stroke-width="5" stroke-linecap="round"/></svg>
        <div class="sd" style="position:absolute;right:22px;top:16px;display:flex;align-items:center;gap:10px;font-size:22px;color:#A27063"><span class="tick" style="width:34px;height:34px">${ICON.check}</span>Signed securely</div></div></div>`);
  gscreen(SG, 'p6', tR - 0.3, tP + 0.2, doc, { uw: 1180, uh: 820, from: 0 });
  const sh0 = el('<div class="layer" style="background:linear-gradient(180deg,rgba(244,238,232,.75),rgba(244,238,232,0) 40%)"></div>', SG);
  portalOpen(SG, tR - 0.3, CC, 0.75);
  tl.to(cart, { autoAlpha: 0, duration: 0.2 }, tR + 0.4);
  const sig = doc.querySelector('.sig'); const SL = 1400;
  gsap.set(sig, { strokeDasharray: SL, strokeDashoffset: SL });
  tl.to(sig, { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' }, tR + 0.4);
  const sd = doc.querySelector('.sd'); gsap.set(sd, { autoAlpha: 0 }); pop(sd, at('and securely') + 0.1);
  const sg1 = ltext('Review your contract.', 'h2 navy', 120, 150, SG);
  rise(sg1, tR); hide(sg1, tSg - 0.15, 0.25);
  const sg2 = ltext('Then sign it digitally|and [securely.]', 'h2 navy', 120, 150, SG);
  rise(sg2, tSg, { lineGap: [tSg, at('and securely')] }); hide(sg2, tP - 0.85, 0.3);
  // the tablet scene closes into the phone, which now shows the profile
  setPoseAt(p, tP - 0.95, { x: 1260, ry: 0 });
  swap(p, SCR('profile.jpg'), tP - 0.95, 'fade');
  portalClose(SG, tP - 0.8, screenRect(p, 1260), 0.85);

  // everything with you + payment ring / milestones / live
  pose(p, tP + 0.1, { x: 1260, ry: -12, dur: 0.8 });
  const op = ltext('With a single platform,|[ZOOD] keeps everything with you.', 'h2 cream', 150, 260, L);
  rise(op, tP, { lineGap: [tP, at('zood keeps everything')] }); hide(op, at('every payment') - 0.25, 0.3);
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
  const lw = ltext('Watch your project take shape|through [live updates.]', 'h2 cream', 1060, 170, L, 'font-size:64px');
  rise(lw, tW, { lineGap: [tW, at('through live updates')] }); hide(lw, TH - 0.35, 0.35);
  const lv = el('<div class="tile" style="left:1060px;top:420px;width:700px;height:300px;border-radius:30px;box-shadow:0 50px 100px rgba(0,0,0,.5)"></div>', L);
  vclip(lv, 'street', tW - 0.2, TH, { rate: 1 });
  gsap.set(lv, { autoAlpha: 0 });
  tl.fromTo(lv, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, immediateRender: false }, tW);
  const lvb = el('<div class="chip" style="left:24px;top:24px;padding:10px 20px;font-size:20px"><span class="dot live"></span>LIVE</div>', lv);
  tl.to(lvb.querySelector('.dot'), { opacity: 0.25, duration: 0.4, repeat: 5, yoyo: true, ease: 'sine.inOut' }, tW + 0.3);
  const lvc = pop(chip('<span class="dot"></span>Level 14 · Slab poured today', 1100, 760, L, 'dark'), at('live updates'));
  [lv, lvc].forEach(e => out(e, TH - 0.35));
  // the phone lays down flat and becomes the floor plan
  pose(p, TH - 0.45, { x: 490, y: 620, rx: 58, rz: -28, s: 0.6, dur: 0.9 });
  tl.to(p, { autoAlpha: 0, duration: 0.45 }, TH + 0.2);

}

// =====================================================================
// 03 LIVE — handover: the team prepares the unit (P8), final inspection (P9), the Hand Over plate, the keys (P10)
// =====================================================================
{
  const TH = at('when it is time'), TD = at('we take care of the details'), TL = at('licenses'), TDo = at('documentation'),
    TS = at('and every step in between'), TJ = at('you simply enjoy'), T1 = at('your home');
  chapterLabel('03', 'Live', TH + 0.4, at('and for those who invest') - 0.3);
  const HL = zlayer(30); show(HL, TH - 0.55, T1 + 0.6, 0.01, 0.3);
  // P8 — the team at work
  const a8 = el('<div class="layer"></div>', HL);
  gclip(a8, 'p8', TH - 0.55, TD + 0.6, { from: 0.2 });
  tl.fromTo(a8, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TH - 0.55);
  tl.fromTo(a8, { scale: 1.08 }, { scale: 1.0, duration: TD - TH + 1.4, ease: 'none', immediateRender: false }, TH - 0.55);
  lineSweep(TH - 0.65, HL);
  // P9 — final inspection, the checklist on her tablet
  const a9 = el('<div class="layer"></div>', HL);
  const chk = el(`<div style="position:absolute;inset:0;background:#FBF8F5;color:#041E42;padding:60px 70px">
      <div class="label" style="font-size:22px;color:#A27063">Final inspection · Unit A4</div>
      ${['Kitchen & fittings', 'Windows & glazing', 'Electrical & lighting', 'Cleaning'].map(s => `<div class="ir" style="display:flex;align-items:center;gap:26px;font-size:40px;margin-top:38px"><span class="tk" style="width:52px;height:52px;border-radius:50%;background:#A27063;display:inline-flex;align-items:center;justify-content:center">${ICON.check.replace('<svg', '<svg width="30" height="30"')}</span>${s}</div>`).join('')}
      <div style="position:absolute;right:70px;bottom:56px;font-size:64px;font-weight:300"><span class="pc">0</span>%</div></div>`);
  gscreen(a9, 'p9', TD - 0.1, TL + 0.6, chk, { uw: 1180, uh: 820, from: 4.45 });
  gsap.set(a9, { autoAlpha: 0 });
  tl.fromTo(a9, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: false }, TD - 0.1);
  chk.querySelectorAll('.tk').forEach((k, i) => { gsap.set(k, { scale: 0 }); tl.to(k, { scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, TD + 0.5 + i * 0.2); });
  count(chk.querySelector('.pc'), 0, 100, TD + 0.5, 0.9);
  // the Hand Over plate (client artwork, its own text removed so the labels can arrive on cue)
  const ho = el('<div class="layer" style="background:#0a2550"></div>', HL);
  const hp = photo(PH('handover-clean.jpg'), { w: 1920, h: 1080 }, ho);
  gsap.set(ho, { autoAlpha: 0 });
  tl.fromTo(ho, { autoAlpha: 1, clipPath: 'circle(0px at 1240px 700px)' }, { clipPath: 'circle(2300px at 1240px 700px)', duration: 0.9, ease: 'power3.in', immediateRender: false }, TL - 0.45);
  tl.fromTo(hp, { scale: 1.1 }, { scale: 1.0, duration: TJ - TL + 0.6, ease: 'power1.out', immediateRender: false }, TL - 0.45);
  const hl = (s, x, y, t) => { const e = ltext(s, 'h3 cream', x, y, ho, 'font-size:36px'); rise(e, t); return e; };
  hl('Licenses', 258, 487, TL); hl('Documentation', 258, 823, TDo); hl('Keys handed over', 1478, 819, TS + 0.5);
  [[1095, 418], [851, 574], [1001, 645]].forEach(([x, y], i) => {
    const ring = el(`<div class="abs" style="left:${x - 30}px;top:${y - 30}px;width:60px;height:60px;border-radius:50%;border:2px solid #E6BFA4"></div>`, ho);
    tl.fromTo(ring, { scale: 0.3, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 1.1, repeat: 2, ease: 'power1.out', immediateRender: true }, TL - 0.1 + i * 0.3);
  });
  const prog = el(`<div class="abs" style="left:1326px;top:922px;width:396px;height:68px;border-radius:999px;background:rgba(10,36,74,.85);border:1px solid rgba(214,165,140,.35);padding:10px 26px 0 76px">
      <svg viewBox="0 0 30 30" width="34" height="34" style="position:absolute;left:24px;top:16px"><rect x="3" y="3" width="24" height="24" rx="6" fill="none" stroke="#D6A58C" stroke-width="1.8"/><path d="M9 15.5l4 4 8-9" fill="none" stroke="#D6A58C" stroke-width="2" stroke-linecap="round"/></svg>
      <div style="font-size:22px;color:#F4EEE8">Progress: <span class="n">0</span>% Complete</div>
      <div style="margin-top:8px;height:5px;border-radius:3px;background:rgba(244,238,232,.15)"><div class="f" style="height:5px;width:0;border-radius:3px;background:linear-gradient(90deg,#B07A63,#E6BFA4)"></div></div></div>`, ho);
  gsap.set(prog, { autoAlpha: 0 }); pop(prog, TDo + 0.2);
  count(prog.querySelector('.n'), 0, 100, TS, 1.3); tl.to(prog.querySelector('.f'), { width: '100%', duration: 1.3, ease: 'power2.out' }, TS);
  // headline rides over all three shots
  const top = el('<div class="layer" style="background:linear-gradient(180deg,rgba(4,30,66,.82),rgba(4,30,66,.35) 28%,rgba(4,30,66,0) 45%)"></div>', HL);
  gsap.set(top, { autoAlpha: 0 }); tl.to(top, { autoAlpha: 1, duration: 0.5 }, TH - 0.3); tl.to(top, { autoAlpha: 0, duration: 0.4 }, TJ - 0.4);
  const hd = ctext('When it is time for [handover,]|we take care of the details.', 'h2 cream', 100, HL);
  rise(hd, TH, { lineGap: [TH, TD] }); hide(hd, TJ - 0.4, 0.35);
  // P10 — the keys
  const a10 = el('<div class="layer"></div>', HL);
  gclip(a10, 'p10', TJ - 0.45, T1 + 0.6, { from: 0 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.85),rgba(2,12,31,.55) 38%,rgba(2,12,31,0) 68%)"></div>', a10);
  tl.fromTo(a10, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TJ - 0.45);
  gsap.set(a10, { autoAlpha: 0 }); tl.set(a10, { autoAlpha: 1 }, TJ - 0.45);
  lineSweep(TJ - 0.55, HL, { dir: -1 });
  const ej1 = ltext('You simply enjoy|the [moment.]', 'h1 cream', 130, 330, a10);
  const ej2 = ltext('While [ZOOD] takes care of the rest.', 'h3 cream', 135, 600, a10, 'opacity:.9');
  rise(ej1, TJ, { lineGap: [TJ, at('the moment')] }); rise(ej2, at('while zood'));
  [ej1, ej2].forEach(e => hide(e, T1 - 0.45, 0.3));
}

// =====================================================================
// 03 LIVE — home, management, community, services, always with you
// =====================================================================
{
  const T0 = at('your home'), TM0 = at('everything that matters'), TC = at('and everything your community'), TM = at('more presence', 2), TN = at('everything you need'),
    TA = at('as if zood'), TD = at('day and night'), T1 = at('and for those who invest');
  const L = layer('bg-day persp'); show(L, T0 - 0.45, T1 + 0.3, 0.4, 0.35);
  ambient(L, T0 - 0.45, T1 + 0.3, { color: 'rgba(162,112,99,.12)', glow: 'rgba(255,255,255,.35)', glow2: 'rgba(214,165,140,.18)', seed: 7 });
  const N = el('<div class="layer bg-navy"></div>', L);
  vclip(N, 'night', at('with a real sense') - 0.2, T1 + 0.6, { rate: 0.8 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.75),rgba(2,12,31,.35) 60%,rgba(2,12,31,.5))"></div>', N);
  gsap.set(N, { autoAlpha: 0 });
  tl.to(N, { autoAlpha: 1, duration: 2.2, ease: 'sine.inOut' }, at('with a real sense'));
  const p = hero;
  const FL = zlayer(32); show(FL, T0 - 0.5, TA + 0.2, 0.01, 0.01);

  // "Your home. Your property." — a swipe of the hand restyles the room (client's Swiping clip)
  const sw = el('<div class="layer"></div>', FL);
  gclip(sw, 'swipe', T0 - 0.5, TM0 + 0.6, { from: 0.7 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.6),rgba(2,12,31,.1) 50%,rgba(2,12,31,0))"></div>', sw);
  tl.fromTo(sw, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T0 - 0.5);
  const yh = ltext('Your home.|Your property.', 'h1 cream', 130, 360, sw);
  rise(yh, T0, { lineGap: [T0, at('your property')] }); hide(yh, TM0 - 0.25, 0.3);
  // "…protected securely and managed seamlessly." — the owner runs his home from the app (P7)
  const dash = (big) => `<div style="position:absolute;inset:0;background:linear-gradient(170deg,#0d2f5e,#041E42);color:#F4EEE8;padding:${big ? '30px 28px' : '70px 30px'};font-family:Huwiya">
      <div style="display:flex;align-items:center;gap:12px"><img src="${A('brand/symbol-white.png')}" style="height:${big ? 30 : 44}px"><div style="font-size:${big ? 24 : 34}px">Unit A4 · Home</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:${big ? 14 : 18}px;margin-top:${big ? 22 : 34}px">
      ${[['Lights', 'On', 'lt'], ['Curtains', 'Closing', 'cu'], ['Climate', '22°C', ''], ['Documents', 'Secured', '']].map(([a, b, k]) => `<div class="${k}" style="border-radius:${big ? 18 : 24}px;background:rgba(255,255,255,.08);border:1px solid rgba(214,165,140,.3);padding:${big ? '18px 18px' : '26px 22px'};height:${big ? 110 : 170}px">
        <div style="font-size:${big ? 16 : 24}px;opacity:.65">${a}</div><div style="font-size:${big ? 26 : 38}px;margin-top:8px">${b}</div></div>`).join('')}</div>
      <div style="margin-top:${big ? 16 : 24}px;border-radius:${big ? 18 : 24}px;background:rgba(214,165,140,.18);padding:${big ? '16px 18px' : '24px 22px'};font-size:${big ? 18 : 28}px">Maintenance visit · Tue 10:00 · Confirmed</div></div>`;
  const s7 = el('<div class="layer"></div>', FL);
  const u7 = el(`<div style="position:absolute;inset:0">${dash(false)}</div>`);
  gscreen(s7, 'p7', TM0 - 0.35, TC + 0.6, u7, { uw: 390, uh: 844, from: 0.15, grow: 1.06 });
  el('<div class="layer" style="background:linear-gradient(270deg,rgba(2,12,31,.78),rgba(2,12,31,.3) 45%,rgba(2,12,31,0) 65%)"></div>', s7);
  tl.fromTo(s7, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: true }, TM0 - 0.35);
  const em = ltext('Everything that matters to you,|[protected securely]|and managed seamlessly.', 'h2 cream', 990, 120, s7, 'font-size:56px;line-height:1.25');
  rise(em, TM0, { lineGap: [TM0, at('protected securely'), at('and managed seamlessly')] }); hide(em, TC - 0.3, 0.3);
  const card7 = el(`<div class="abs" style="left:1240px;top:540px;width:560px;height:420px;border-radius:30px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.5)">${dash(true)}</div>`, s7);
  gsap.set(card7, { autoAlpha: 0 }); pop(card7, at('protected securely') + 0.1); out(card7, TC - 0.3);
  [u7, card7].forEach(u => { const lt = u.querySelector('.lt'), cu = u.querySelector('.cu');
    tl.fromTo(lt, { background: 'rgba(255,255,255,.08)' }, { background: 'rgba(214,165,140,.55)', duration: 0.3, immediateRender: false }, at('and managed seamlessly'));
    tl.fromTo(cu, { background: 'rgba(255,255,255,.08)' }, { background: 'rgba(214,165,140,.55)', duration: 0.3, immediateRender: false }, at('and managed seamlessly') + 0.35); });
  // community — the evening event (P11) with the events calendar and a booking
  const s11 = el('<div class="layer"></div>', FL);
  gclip(s11, 'p11', TC - 0.4, TM + 0.6, { from: 0.4 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.72),rgba(2,12,31,.2) 50%,rgba(2,12,31,.35))"></div>', s11);
  tl.fromTo(s11, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: true }, TC - 0.4);
  lineSweep(TC - 0.5, FL);
  const yc = ltext('And everything your community|brings together, in [one place.]', 'h2 cream', 120, 150, s11, 'font-size:62px');
  rise(yc, TC, { lineGap: [TC, at('brings together')] }); hide(yc, TM - 0.3, 0.3);
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  const cal = el(`<div class="card" style="left:1250px;top:300px;width:560px;padding:28px 30px 24px;border-radius:28px">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="label" style="font-size:15px;color:#A27063">Community events</span><span style="font-size:22px">October</span></div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:16px;text-align:center;font-size:18px">
      ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div style="opacity:.45;font-size:14px">${d}</div>`).join('')}
      ${days.map(d => `<div class="${[9, 16, 23].includes(d) ? 'ev' : ''}" style="height:36px;line-height:36px;border-radius:50%;${d < 1 || d > 31 ? 'opacity:0' : ''}">${d}</div>`).join('')}</div>
      ${[['Courtyard evening · Thu 9 Oct', 'b1'], ['Family cinema night · Thu 16 Oct', ''], ['Padel tournament · Thu 23 Oct', '']].map(([s, k]) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:21px;padding:12px 0;border-top:1px solid rgba(4,30,66,.1)"><span>${s}</span><span class="${k}" style="padding:8px 18px;border-radius:999px;background:rgba(4,30,66,.08);font-size:18px">Book</span></div>`).join('')}</div>`, s11);
  gsap.set(cal, { autoAlpha: 0 }); pop(cal, TC + 0.3); out(cal, TM - 0.3);
  cal.querySelectorAll('.ev').forEach((d, i) => tl.to(d, { background: '#A27063', color: '#fff', duration: 0.25 }, TC + 0.7 + i * 0.25));
  const b1 = cal.querySelector('.b1');
  tl.to(b1, { background: '#041E42', color: '#F4EEE8', duration: 0.2 }, at('in one place', 2) - 0.1);
  const bk = el('<span>Booked ✓</span>', b1); gsap.set(bk, { display: 'none' });
  tl.set(b1.firstChild, { display: 'none' }, at('in one place', 2)); tl.set(bk, { display: 'inline' }, at('in one place', 2));
  // More ___ — a window cycles through the community
  tl.set(sw, { autoAlpha: 0 }, TM0 + 0.6); tl.set(s7, { autoAlpha: 0 }, TC + 0.6);
  const WF = el('<div class="abs" style="left:1000px;top:110px;width:780px;height:860px;border-radius:40px;overflow:hidden;box-shadow:0 50px 120px rgba(60,40,25,.35)"></div>', FL);
  gsap.set(WF, { autoAlpha: 0 }); tl.set(WF, { autoAlpha: 1 }, at('more connection') - 0.15);
  tl.fromTo(s11, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: 'inset(110px 140px 110px 1000px round 40px)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TM - 0.4);
  const wins = [['p14', at('more connection'), 3.6], ['p12', at('efficiency'), 0.5], ['p13', at('possibilities'), 0.2]];
  wins.forEach(([nm, t, from], i) => {
    const b = el('<div class="abs" style="inset:0;overflow:hidden"></div>', WF);
    if (nm === 'p12') {
      const bkui = el(`<div style="position:absolute;inset:0;background:#FBF8F5;color:#041E42;padding:90px 30px;font-family:Huwiya">
        <div class="label" style="font-size:20px;color:#A27063">Facilities</div><div style="font-size:44px;margin-top:14px">Padel court 2</div>
        <div style="font-size:28px;opacity:.65;margin-top:8px">Today · 7:00 PM</div>
        <div style="margin-top:40px;border-radius:30px;height:300px;background:linear-gradient(160deg,#9BCBEB,#5c95c2)"></div>
        <div class="bb" style="margin-top:44px;height:96px;border-radius:999px;background:#041E42;color:#F4EEE8;display:flex;align-items:center;justify-content:center;font-size:34px"><span class="b0">Book now</span><span class="b2" style="display:none">Booked ✓</span></div></div>`);
      gscreen(b, 'p12', t - 0.1, wins[i + 1][1] + 0.6, bkui, { uw: 390, uh: 844, from, pw: 780, ph: 860, pos: [0.42, 0.5] });
      const tb = t - 0.1 + (1.45 - from);
      tl.to(bkui.querySelector('.bb'), { background: '#A27063', duration: 0.2 }, tb);
      tl.set(bkui.querySelector('.b0'), { display: 'none' }, tb); tl.set(bkui.querySelector('.b2'), { display: 'inline' }, tb);
    } else gclip(b, nm, t - 0.1, i < 2 ? wins[i + 1][1] + 0.6 : TN + 0.2, { from });
    tl.fromTo(b, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: true }, t - 0.1);
    tl.fromTo(b, { scale: 1.12 }, { scale: 1.0, duration: 2.2, ease: 'none', immediateRender: false }, t - 0.1);
  });
  tl.set(s11, { autoAlpha: 0 }, at('more connection') + 0.6);
  const mo = ltext('[More]', 'h0', 140, 330, L);
  rise(mo, TM); hide(mo, TN - 0.3, 0.35);
  swapWords([['presence.', at('presence', 2)], ['connection.', at('more connection') + 0.15], ['efficiency.', at('efficiency')], ['possibilities|for the community.', at('possibilities')]], L,
    (s) => ltext(s, 'h1 navy', 140, 540, L), { useRise: true }).forEach((e, i, a) => { if (i === a.length - 1) hide(e, TN - 0.3, 0.35); });
  tl.to(WF, { autoAlpha: 0, duration: 0.4 }, TN + 0.1);

  // "Everything you need, whenever you need it." — services on request (P15) with the concierge bell
  const SV = zlayer(60); show(SV, TN - 0.4, null, 0.01);
  const s15 = el('<div class="layer"></div>', SV);
  gclip(s15, 'p15', TN - 0.4, TA + 0.6, { from: 0.15 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.72),rgba(2,12,31,.2) 50%,rgba(2,12,31,0))"></div>', s15);
  tl.fromTo(SV, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TN - 0.4);
  const en = ltext('Everything you need,|[whenever you need it.]', 'h2 cream', 120, 150, SV);
  rise(en, TN, { lineGap: [TN, at('whenever')] }); hide(en, TA - 0.6, 0.3);
  const req = el(`<div class="card" style="left:120px;top:640px;width:560px;padding:24px 28px;border-radius:26px"><div class="label" style="font-size:14px;color:#A27063">Service requests</div></div>`, SV);
  const sub = (TN - 0.4) - 0.15;
  [['Concierge · Package delivered', 0.15], ['Housekeeping · Scheduled', 1.3], ['Maintenance · On the way', 2.62]].forEach(([s, c], i) => {
    const r = el(`<div style="display:flex;align-items:center;gap:16px;font-size:24px;padding:12px 0;border-top:1px solid rgba(4,30,66,.1);margin-top:${i ? 0 : 10}px"><span class="tick" style="width:30px;height:30px">${ICON.check}</span>${s}</div>`, req);
    tl.fromTo(r, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: EASE, immediateRender: true }, Math.max(TN - 0.1, sub + c));
  });
  gsap.set(req, { autoAlpha: 0 }); pop(req, TN - 0.1);
  const bellBox = el('<div class="abs" style="left:520px;top:440px;width:1280px;height:720px;transform:scale(.3);transform-origin:0 0"></div>', SV);
  gclip(bellBox, 'bell', TN, TA + 0.6, { fit: 'fill' });
  gsap.set(bellBox, { autoAlpha: 0 }); tl.fromTo(bellBox, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE, immediateRender: false }, TN + 0.2);
  // the services scene closes into the phone: "As if ZOOD is always with you"
  tl.set(p, { autoAlpha: 1 }, TA - 1.3);
  setPoseAt(p, TA - 1.3, { x: 1000, ry: 0 });
  swap(p, SCR('community.png'), TA - 1.3, 'fade');
  out(req, TA - 0.85, 0.3); out(bellBox, TA - 0.85, 0.3);
  portalClose(SV, TA - 0.75, screenRect(p, 1000), 0.85);
  pose(p, TA + 0.2, { x: 1000, ry: -10, dur: 0.8 });

  const aw = ltext('As if [ZOOD] is|always with you.', 'h2 navy', 160, 380, L);
  rise(aw, TA, { lineGap: [TA, at('always with you')] });
  tl.to(aw, { color: '#F4EEE8', duration: 1.6 }, at('with a real sense'));
  hide(aw, TD - 0.35, 0.35);
  const c1 = el('<div class="chip dark" style="left:auto;right:90px;top:330px;border-radius:30px 30px 8px 30px;font-weight:400">Can I book the gym at 7 PM?</div>', L);
  const c2 = el(`<div class="chip" style="left:auto;right:120px;top:440px;border-radius:30px 30px 30px 8px;font-weight:400"><img src="${A('brand/symbol-navy.png')}" style="height:28px">Booked. See you at 7 PM.</div>`, L);
  [c1, c2].forEach(b => gsap.set(b, { autoAlpha: 0 }));
  pop(c1, TA + 0.3, { y: 30, scale: 0.85 }); pop(c2, at('always with you') + 0.5, { y: 30, scale: 0.85 });
  [c1, c2].forEach(b => out(b, T1 - 0.35));
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
  ambient(L, T0 - 0.4, TX - 0.1, { seed: 8 });
  const IB = el('<div class="layer"></div>', L);
  vclip(IB, 'dusk', T0 - 0.4, TS + 0.6, { rate: 1 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.85),rgba(2,12,31,.45) 60%,rgba(2,12,31,.6))"></div>', IB);
  tl.fromTo(IB, { scale: 1.15 }, { scale: 1.0, duration: TS - T0 + 1, ease: 'none', immediateRender: false }, T0 - 0.4);
  tl.to(IB, { autoAlpha: 0, duration: 0.8 }, TS - 0.2);
  lineSweep(T0 - 0.45, L, { dir: -1 });
  chapterLabel('04', 'Enjoy', T0 + 0.4, TX - 0.5);
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
  const mk = ltext('A smarter way to make|your property [work for you.]', 'h2 cream', 1120, 230, L, 'font-size:62px');
  rise(mk, TS, { lineGap: [TS, at('your property work for you')] });
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
  { const wv = el('<div class="layer" style="overflow:hidden"></div>', L); const sv = brandWeave(wv, { color: 'rgba(214,165,140,.08)' });
    tl.fromTo(sv, { y: 0 }, { y: -160, duration: END - TX + 0.5, ease: 'none', immediateRender: false }, TX - 0.5); }
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
  swapWords([['Discover.', TX], ['Enjoy.', at('enjoy', 3)], ['Live.', at('live', 4)], ['[Dwell.]', at('dwell')]], L, (s) => ctext(s, 'h0 cream', 440, L), { useRise: true })
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
  T(684, 48, 552, 300, `<div style="position:absolute;inset:0;background:url('${PH('reception.jpg')}') center/cover"></div>${shadeB}${lab('Create')}`);
  const txt = T(684, 366, 552, 348, '', 'linear-gradient(160deg,#0f3364,#041E42)');
  txt.style.boxShadow = 'inset 0 0 0 1.5px rgba(214,165,140,.35)';
  T(684, 732, 552, 300, `<img src="${SCR('yield.png')}" style="position:absolute;left:-2%;top:-${0.115 * 552 / 0.46 * 1.04}px;width:104%">${lab('Enjoy', true)}`, '#F4EEE8');
  T(1254, 48, 300, 666, scrTile('esign.png'), '#F4EEE8');
  const tStar = T(1254, 732, 300, 300, '', 'radial-gradient(90% 90% at 50% 40%,#FBF7F3,#E9DDD2)');
  { const sb = el('<div class="abs" style="left:-170px;top:-58px;width:1280px;height:720px;transform:scale(.5);transform-origin:0 0"></div>', tStar); gclip(sb, 'star', TDz - 0.4, END, { fit: 'fill' }); }
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
  const d2 = text('Because after construction,|[responsibility begins.]', 'h3 cream', 'left:0;width:552px;top:116px;text-align:center;font-size:40px', txt);
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

  const NB = el('<div class="layer"></div>', L); gsap.set(NB, { autoAlpha: 0 });
  vclip(NB, 'night', TL_LUX - 0.5, END, { rate: 0.85 });
  el('<div class="layer" style="background:radial-gradient(70% 70% at 50% 45%, rgba(2,12,31,.55), rgba(2,12,31,.85))"></div>', NB);
  tl.to(NB, { autoAlpha: 1, duration: 1.4, ease: 'sine.inOut' }, TL_LUX - 0.3);
  tl.fromTo(NB, { scale: 1.12 }, { scale: 1.0, duration: END - TL_LUX, ease: 'none', immediateRender: false }, TL_LUX - 0.3);
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
