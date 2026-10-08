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
  // each line leaves as its last word ends; the frame moves in the short gap, before the next line rises
  const ePr = after('more presence'), eLv = after('more living'), ePz = after('more personalization') - 0.08, eCf = after('more comfort');

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
    ['[More]|personalization.', tPz + 0.2, 'h1 cream', 'left:140px;top:640px;text-shadow:0 8px 40px rgba(0,0,0,.4)'],
    ['[More]', tCf, 'h1', 'left:20px;width:570px;top:470px;text-align:right'],
    ['[More] time for what truly matters.', tTm, 'h2 cream', `left:0;width:${W}px;top:110px;text-align:center`],
  ].map(([s, t, cls, st], i, arr) => {
    const e = text(s, cls, st, Ls); rise(e, t, { stagger: 0.05, dur: 0.6 });
    if (i < 3) hide(e, [ePr, eLv, ePz][i], 0.2);
    return e;
  });
  const cf2 = ltext('comfort.', 'h1 cream', 1330, 470, Ls); rise(cf2, tCf + 0.08);
  hide(moreTxt[3], eCf, 0.2); hide(cf2, eCf, 0.2); hide(moreTxt[4], T0 - 0.3, 0.3);

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
  const t1 = ltext('Because true luxury is not|about having more things.', 'h2 navy', 170, 300, C2, 'font-size:64px');
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
  const t2 = ctext('It is about having more of|[what is designed around you.]', 'h2 navy', 60, C2, 'font-size:64px');
  rise(t2, TA + 0.45, { lineGap: [TA + 0.45, at('what is designed')] }); hide(t2, TH - 0.25, 0.3);
  const h1 = ltext('And that is exactly what', 'h3 navy', 170, 360, C2, 'opacity:.7');
  const h2 = ltext('happiness', 'h0 navy', 160, 430, C2);
  const h3 = ltext('[means.]', 'h2', 170, 620, C2);
  rise(h1, TH); rise(h2, at('happiness'), { stagger: 0 }); rise(h3, at('means'));
  tl.fromTo(h2, { letterSpacing: '0.1em' }, { letterSpacing: '0em', duration: 1.6, ease: 'power2.out', immediateRender: false }, at('happiness'));
  [h1, h2, h3].forEach(e => hide(e, TW - 0.25, 0.3));
  const pr = ltext('That is why, at [ZOOD,]|luxury is not a promise|on paper.', 'h2 navy', 170, 250, C2, 'font-size:64px');
  rise(pr, TW + 0.1, { lineGap: [TW + 0.1, at('luxury is not a promise')] }); hide(pr, TX - 0.45, 0.3);
  // a fine line-drawn document draws itself, then gives way to the brand line (no box, no hard shadow)
  const docW = el('<div class="abs" style="left:180px;top:540px;width:340px;height:300px"></div>', C2);
  const docS = svgEl(`<path d="M 30 20 H 200 L 250 70 V 270 H 30 Z"/><path d="M 200 20 V 70 H 250"/>
      <path d="M 60 100 H 200 M 60 132 H 220 M 60 164 H 180 M 60 196 H 210"/>
      <path d="M 70 240 C 90 214 104 214 100 236 S 124 252 138 230 S 160 222 170 240"/><circle cx="214" cy="236" r="16"/>`,
    { w: 340, h: 300, stroke: '#A27063', sw: 1.8 }, docW);
  gsap.set(docW, { autoAlpha: 0 });
  tl.set(docW, { autoAlpha: 1 }, TW + 0.3);
  drawAll(docS, TW + 0.3, 1.1, 0.07);
  tl.fromTo(docW, { y: 20, rotation: -3 }, { y: -12, rotation: 1.5, duration: TX - TW, ease: 'sine.inOut', immediateRender: false }, TW + 0.3);
  tl.to(docW, { autoAlpha: 0, y: -40, filter: 'blur(6px)', duration: 0.45, ease: EASE_IN }, TX - 0.75);
  brandSweep(TX - 0.85, C2, { n: 7, color: 'rgba(162,112,99,.75)' });

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
  const fr = el('<div class="abs" data-ob="frame" style="left:1080px;top:110px;width:680px;height:860px;border-radius:40px;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,.45)"></div>', FRL);
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
  mv(ePr + 0.03, { left: 160, top: 110, width: 680, height: 860, rotationY: 8 }, 0.55);                                   // living: frame glides left
  mv(eLv + 0.07, { left: 0, top: 0, width: 1920, height: 1080, rotationY: 0, ...R(0, 0, 0, 0) }, 0.6);                   // personalization: full screen
  tl.to(shade, { autoAlpha: 1, duration: 0.5 }, tPz - 0.1); tl.to(shade, { autoAlpha: 0, duration: 0.4 }, ePz);
  mv(ePz, { left: 660, top: 90, width: 600, height: 900, ...R(300, 300, 32, 32) }, 0.6);                             // comfort: centred arch
  mv(eCf + 0.06, { left: 0, top: 250, width: 1920, height: 600, ...R(0, 0, 0, 0) }, 0.55);                                   // time: cinematic band
  mv(T0 - 0.35, { left: 1120, top: 120, width: 620, height: 840, ...R(310, 310, 32, 32), boxShadow: '0 40px 90px rgba(80,50,30,.25)' }, 0.9); // arch on cream
  mv(TA - 0.1, { left: 760, top: 330, width: 400, height: 680, ...R(200, 200, 24, 24) }, 0.8);                       // centre of the triptych
  mv(TH - 0.3, { left: 1120, top: 120, width: 620, height: 840, ...R(310, 310, 32, 32) }, 0.8);                      // "happiness"
  tl.to(fr, { rotationY: -10, duration: TW - TH, ease: 'sine.inOut' }, TH + 0.5);
  tl.to(fr, { rotationY: 6, duration: TX - TW, ease: 'sine.inOut' }, TW);
  mv(TX - 0.75, { left: 0, top: 0, width: 1920, height: 1080, rotationY: 0, ...R(0, 0, 0, 0) }, 0.9);                 // full screen: experience
  tl.to(shade, { autoAlpha: 1, duration: 0.8 }, TX - 0.2);
  tl.to(fr, { scale: 1.12, duration: 1.0, ease: 'power2.in' }, T1 - 0.5);
  tl.to(navy, { autoAlpha: 1, duration: 0.8, ease: 'power1.in' }, T1 - 0.45);
  tl.set(FRL, { autoAlpha: 0 }, T1 + 0.4);
  // text that must sit above the frame
  const TOP = zlayer(25); show(TOP, TM - 0.4, T1 - 0.4, 0.01, 0.3);
  [...moreTxt, cf2].forEach(e => TOP.appendChild(e));   // captions always ride above the travelling frame
  rise(ltext('It is an experience|[you live.]', 'h1 cream', 140, 690, TOP), TX + 0.2, { lineGap: [TX + 0.2, at('you live')] });

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
  const top = ctext('Traditionally, owning a property meant…', 'h3 cream', 118, L, 'opacity:.8');
  rise(top, T0 + 0.35); hide(top, TQ - 0.2, 0.4);
  const groups = [['Paperwork.', at('paperwork'), ['doc', 'folder', 'stamp']], ['Spreadsheets.', at('spreadsheets'), ['sheet', 'chart', 'calc']],
    ['Conversations.', at('conversations'), ['chat', 'mail', 'phone']], ['Endless steps.', at('endless steps'), ['stairs', 'clock', 'loop']]];
  const ws = swapWords(groups.map(g => [g[0], g[1]]), L, (s) => ctext(s, 'h1 cream', 480, L), { useRise: true });
  hide(ws[3], TQ - 0.15, 0.4);
  // one large line icon per word draws itself on; each new card lands in front and the earlier ones stack behind
  const BIG = [
    '<path d="M 46 34 H 104 L 124 54 V 132 H 46 Z"/><path d="M 104 34 V 54 H 124"/><path d="M 34 46 V 144 H 112"/><path d="M 60 70 H 108 M 60 86 H 110 M 60 102 H 96"/><circle cx="100" cy="118" r="9"/><path d="M 60 120 C 66 112 72 112 70 120 S 80 126 84 118"/>',
    '<rect x="26" y="34" width="108" height="92" rx="6"/><path d="M 26 56 H 134 M 26 79 H 134 M 26 102 H 134 M 60 34 V 126 M 97 34 V 126"/><path d="M 106 150 V 132 M 118 150 V 120 M 130 150 V 110" stroke-width="5"/>',
    '<path d="M 24 40 H 98 A 10 10 0 0 1 108 50 V 86 A 10 10 0 0 1 98 96 H 56 L 38 112 V 96 H 24 A 10 10 0 0 1 14 86 V 50 A 10 10 0 0 1 24 40 Z"/><path d="M 120 66 H 136 A 10 10 0 0 1 146 76 V 108 A 10 10 0 0 1 136 118 H 130 V 132 L 114 118 H 80 A 10 10 0 0 1 70 108 V 104"/><path d="M 40 68 H 82 M 40 80 H 70"/>',
    '<path d="M 18 138 H 46 V 112 H 74 V 86 H 102 V 60 H 130 V 34 H 146"/><path d="M 116 132 A 30 30 0 1 0 140 104"/><path d="M 140 92 V 106 H 126"/>',
  ];
  const cards = groups.map(([, t], i) => {
    const c = el(`<div class="abs" style="left:810px;top:228px;width:300px;height:300px;border-radius:36px;background:linear-gradient(160deg,#0f3364,#06224a);border:1.5px solid rgba(214,165,140,.45)"></div>`, L);
    const ic = svgEl(BIG[i], { x: 40, y: 40, w: 220, h: 220, vb: '0 0 160 160', stroke: '#E6BFA4', sw: 2.6 }, c);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, y: 70, scale: 0.86 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t - 0.12);
    drawAll(ic, t - 0.05, 0.6, 0.05);
    return c;
  });
  groups.forEach(([, t], k) => cards.slice(0, k).forEach((c, i) => {
    const depth = k - i;
    tl.to(c, { y: -44 * depth, scale: 1 - 0.08 * depth, opacity: Math.max(0.2, 1 - 0.28 * depth), duration: 0.45, ease: 'power3.out' }, t - 0.12);
  }));
  ws.forEach(w => { w.style.top = '600px'; });
  cards.forEach((c, i) => tl.to(c, { y: 322, scale: 0.02, opacity: 0, duration: 0.6, ease: 'power3.in' }, TQ - 0.25 + (3 - i) * 0.05));
  const q = ctext('But what if the entire journey|could come together in [one place?]', 'h2 cream', 400, L);
  rise(q, TQ + 0.35, { lineGap: [TQ + 0.35, at('could come together')] }); hide(q, T1 - 0.4, 0.35);
  const dot = el('<div class="abs" style="left:950px;top:690px;width:20px;height:20px;border-radius:50%;background:#E6BFA4;box-shadow:0 0 40px 12px rgba(230,191,164,.55)"></div>', L);
  gsap.set(dot, { autoAlpha: 0 });
  tl.fromTo(dot, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, TQ + 0.35);
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
  rise(c2, T0 + 0.1); hide(c2, at('a smarter way to discover') - 0.5, 0.3);
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
  hero = phone('ui:01', { parent: L });
  onUI(hero.cur, (d, q) => {
    const im = q.all('img');
    tl.fromTo(im[0], { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: EASE, immediateRender: true }, TZ + 0.9);
    uiRise([q('p')], TZ + 1.25, { y: 16, dur: 0.7 });
    tl.fromTo(im[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', immediateRender: true }, TZ + 1.0);
  });
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
  const tTap = at('tap'), tRot = at('rotate the model'), tCh = at('choose your unit'), tB = at('before the first'), tS = at('see the available');
  chapterLabel('01', 'Discover', T0 + 0.2, tTap - 0.1);
  chapterLabel('01', 'Discover', tS + 0.3, TE - 0.5);

  // radar rings behind the phone (the discovery engine)
  const RR = svgEl([0, 1, 2, 3].map(() => `<circle cx="620" cy="540" r="120" data-nodraw="1"/>`).join(''), { sw: 1.5 }, L);
  gsap.set(RR, { autoAlpha: 0 });
  tl.to(RR, { autoAlpha: 1, duration: 0.4 }, T0 + 0.3);
  RR.querySelectorAll('circle').forEach((c, i) => tl.fromTo(c, { attr: { r: 120 }, opacity: 0.9 }, { attr: { r: 640 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: 2, immediateRender: true }, T0 + 0.3 + i * 0.6));
  tl.to(RR, { autoAlpha: 0, duration: 0.4 }, at('then tap') - 0.3);

  pose(hero, T0 - 0.75, { x: 620, ry: 12, dur: 0.9 });
  const s02 = swap(hero, 'ui:02', T0 - 0.2);
  onUI(s02, (d, q) => {
    tl.fromTo(q('img'), { scale: 1.12 }, { scale: 1, duration: 2.6, ease: 'power2.out', immediateRender: true }, T0 - 0.2);
    const lab = q.all('div').find(e => /^DISCOVER/.test(e.innerText) && e.getBoundingClientRect().height < 60);
    uiRise([lab, q('h1'), q('p'), q('button')].filter(Boolean), T0 + 0.35, { stagger: 0.1, y: 18 });
  });
  const e1 = ltext('Explore every destination|[with complete clarity.]', 'h2 cream', 1000, 280, L);
  rise(e1, T0 + 0.2, { lineGap: [T0 + 0.2, at('with complete clarity')] });
  const lst = ltext('The layouts,|the views,|and the neighborhood|[around you.]', 'h2 cream', 1000, 500, L, 'line-height:1.3');
  const tLy = [at('the layouts'), at('the views'), at('and the neighborhood'), at('around you', 2)];
  rise(lst, tLy[0], { lineGap: tLy });
  tLy.slice(0, 3).forEach((t, i) => focusLine(lst, i, t));
  const s06 = swap(hero, 'ui:06', at('layouts') - 0.1);
  onUI(s06, (d, q) => {
    q.all('.pin').forEach((e, i) => tl.fromTo(e, { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)', immediateRender: true }, at('layouts') + 0.35 + i * 0.09));
    tl.fromTo(q('section'), { y: 120 }, { y: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, at('layouts') + 0.3);
  });
  swap(hero, 'ui:07', at('views') - 0.1);
  tl.to(hero.cur, { scale: 1.18, transformOrigin: '50% 42%', duration: 1.6, ease: 'power2.inOut' }, at('neighborhood'));
  const eNb = after('neighborhood around you');      // both blocks leave before the phone slides to the centre
  hide(e1, eNb - 0.05, 0.2); hide(lst, eNb - 0.05, 0.2);

  // "Then tap" opens the 3D Model View: rotate the model, choose the unit, walk through it
  pose(hero, eNb + 0.1, { x: 960, ry: 0, dur: 0.4, ease: 'power2.inOut' });
  swap(hero, 'ui:10', at('then tap') - 0.15, 'fade');
  tap(hero, 0.5, 0.58, tTap - 0.05);
  const ML = zlayer(60); gsap.set(ML, { autoAlpha: 0 });
  const mv = el('<div class="layer"></div>', ML);
  gclip(mv, 'model', tTap + 0.15, tS, { from: 1.45 });
  el('<div class="layer" style="background:linear-gradient(270deg,rgba(2,12,31,.82),rgba(2,12,31,.55) 28%,rgba(2,12,31,0) 52%)"></div>', mv);
  portalOpen(ML, tTap + 0.15, screenRect(hero, 960), 0.75);
  const tr = ltext('Then tap,|rotate the model,|choose your unit,|and walk through|[your environment.]', 'h3 cream', 1400, 300, ML, 'line-height:1.7;text-shadow:0 4px 24px rgba(0,0,0,.45)');
  const tEn = at('your environment'), tAw = at('and walk through');
  rise(tr, tTap + 0.2, { lineGap: [tTap + 0.2, tRot, tCh, tAw, tEn] });
  focusLine(tr, 0, tTap + 0.2); focusLine(tr, 1, tRot); focusLine(tr, 2, tCh); focusLine(tr, 3, tAw);
  hide(tr, tB - 0.3, 0.3);
  // "Before the first foundation stone is even laid": full-screen Furniture Packages — browse the three styles, choose one
  const PK = el('<div class="layer app" style="background:#0b1a33"></div>', ML);
  gsap.set(PK, { autoAlpha: 0 });
  const tA = tB - 0.05, steps = [[tA, 0], [tB + 0.85, 2], [tB + 1.6, 1]], tSel = tB + 2.05, tEndA = tS + 0.6;
  const heroes = PKG.map(p => el(`<div class="layer" style="background:url('${A('pkg/' + p.img + '.jpg')}') center/cover"></div>`, PK));
  heroes.forEach((h, i) => gsap.set(h, { autoAlpha: i === steps[0][1] ? 1 : 0, zIndex: 0 }));
  el(`<div class="layer" style="z-index:5;background:linear-gradient(90deg,rgba(6,14,32,.86) 0%,rgba(6,14,32,.6) 30%,rgba(6,14,32,0) 56%),linear-gradient(180deg,rgba(6,14,32,.62) 0%,rgba(6,14,32,0) 20%,rgba(6,14,32,0) 62%,rgba(6,14,32,.78) 100%)"></div>`, PK);
  const UIa = el('<div class="layer" style="z-index:6"></div>', PK);
  el(`<div class="gb" style="left:64px;top:44px">${ICO.back}</div>`, UIa);
  el(`<div class="abs" style="left:560px;width:800px;top:46px;text-align:center"><div style="font-size:26px;font-weight:500">Furniture Packages</div><div style="font-size:18px;opacity:.75;margin-top:5px">Unit A4 · Wadi Residence</div></div>`, UIa);
  el(`<div class="abs" style="right:150px;top:53px;display:flex;gap:10px">${['Bedroom', 'Living', 'Dining', 'Kitchen'].map((r, i) => `<span class="rc${i ? '' : ' on'}">${r}</span>`).join('')}</div>`, UIa);
  el(`<div class="gb" style="right:64px;top:44px">${ICO.cube}</div>`, UIa);
  // the chosen style: name, description, price, pieces (as on the app screen)
  const pn = el(`<div class="glass" data-ob="pkg" style="left:120px;top:560px;width:660px;height:360px"></div>`, UIa);
  const nm = PKG.map((p, i) => el(`<div class="abs" style="left:40px;top:34px;width:580px">
      <div style="font-size:16px;letter-spacing:2.6px;opacity:.7">STYLE ${i + 1} OF 3</div>
      <div style="font-size:50px;font-weight:500;letter-spacing:-.8px;margin-top:8px">${p.name}</div>
      <div style="font-size:21px;line-height:30px;opacity:.9;margin-top:8px">${p.desc}</div></div>`, pn));
  const pr = el(`<div class="abs" style="left:40px;top:236px;display:flex;align-items:center;gap:12px;font-size:48px;font-weight:500;letter-spacing:-.7px">${SARi(36)}<span>${money(PKG[0].price)}</span></div>`, pn);
  const meta = el('<div class="abs" style="left:40px;top:302px;font-size:18px;opacity:.72"></div>', pn);
  const go = el(`<div class="abs" style="right:36px;top:250px;width:76px;height:76px;border-radius:50%;background:#fff;color:#0B1F44;display:grid;place-items:center;box-shadow:0 12px 28px rgba(0,0,0,.35)">${ICO.arrow}</div>`, pn);
  // the package menu: all three, single selection
  const MN = el('<div class="abs" style="left:840px;top:760px;width:960px;height:160px"></div>', UIa);
  const opts = PKG.map((p, i) => el(`<div class="opt" data-ob="opt" style="left:${i * 330}px"><div class="on"></div><img src="${A('pkg/' + p.img + '-p.jpg')}">
      <div class="tx"><div class="n" style="font-size:23px;font-weight:500">${p.name}</div>
      <div class="v" style="display:flex;align-items:center;gap:6px;font-size:25px;font-weight:500;margin-top:16px">${SARi(19)}${money(p.price)}</div>
      <div class="m" style="font-size:16px;opacity:.7;margin-top:8px">${p.pieces} · excl. VAT</div></div>
      <div class="ck" style="position:absolute;left:22px;top:22px;box-shadow:0 0 0 3px #fff;width:34px;height:34px;border-radius:50%;background:#2E9E6B;display:grid;place-items:center;opacity:0">${ICO.check}</div></div>`, MN));
  gsap.set(nm, { autoAlpha: 0 });
  steps.forEach(([t, k], j) => {
    const prev = j ? steps[j - 1][1] : null, h = heroes[k];
    if (j) {
      tl.set(h, { zIndex: j }, t);
      tl.fromTo(h, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: false }, t);
      tl.to(nm[prev], { autoAlpha: 0, y: -16, duration: 0.25, ease: EASE_IN }, t);
      const o = { v: PKG[prev].price }, sp = pr.querySelector('span');
      tl.fromTo(o, { v: PKG[prev].price }, { v: PKG[k].price, duration: 0.5, ease: 'power2.out', immediateRender: false, onUpdate: () => { sp.textContent = money(o.v); } }, t + 0.05);
      tl.to(opts[prev].querySelector('.on'), { opacity: 0, duration: 0.3 }, t);
      tl.to(opts[prev].querySelector('.tx'), { color: '#fff', duration: 0.3 }, t);
    }
    tl.fromTo(h, { scale: 1.07 }, { scale: 1, duration: 2.4, ease: 'power1.out', immediateRender: false }, t);
    tl.fromTo(nm[k], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: EASE, immediateRender: false }, t + (j ? 0.15 : 0.3));
    tl.to(opts[k].querySelector('.on'), { opacity: 1, duration: 0.3 }, t);
    tl.to(opts[k].querySelector('.tx'), { color: '#0B1F44', duration: 0.3 }, t);
  });
  htmlAt(meta, steps.map(([t, k]) => [t, `${PKG[k].pieces} · 4 rooms · excl. VAT`]), tEndA);
  tl.fromTo(go, { scale: 1 }, { scale: 0.88, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut', immediateRender: false }, tSel - 0.2);
  tl.fromTo(opts[1].querySelector('.ck'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)', immediateRender: false }, tSel);
  tl.fromTo(PK, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tA);
  tl.fromTo([pn, MN], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: EASE, immediateRender: false }, tA + 0.3);
  brandSweep(tB - 0.05, ML, { n: 8 });
  const bfs = ltext('Before the first foundation|stone is even laid,', 'h2 cream', 120, 170, UIa, 'font-size:66px;font-family:Huwiya');
  rise(bfs, tB + 0.2, { lineGap: [tB + 0.2, at('stone is even laid')] }); hide(bfs, tS - 0.6, 0.3);
  // …and it all closes into the phone, which now lists the available units
  setPoseAt(hero, tS - 1.2, { x: 1400, ry: 0 });
  const s04 = swap(hero, 'ui:04', tS - 1.2, 'fade');
  onUI(s04, (d, q) => { uiRise(q.all('article'), tS + 0.05, { stagger: 0.14, y: 40, dur: 0.6 }); });
  portalClose(ML, tS - 0.3, screenRect(hero, 1400), 0.85);
  pose(hero, tS + 0.45, { x: 1400, ry: -12, dur: 0.9, ease: 'power2.inOut' });
  // P1 (the tower, one floor lit) behind the live unit grid
  const UB = el('<div class="layer"></div>', L); gsap.set(UB, { autoAlpha: 0 });
  gclip(UB, 'p1', tS - 0.6, at('compare them') + 0.5, { from: 3.6 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.88),rgba(2,12,31,.7) 50%,rgba(2,12,31,.55))"></div>', UB);
  tl.set(UB, { autoAlpha: 1 }, tS - 0.6); tl.to(UB, { autoAlpha: 0, duration: 0.6 }, at('compare them') - 0.3);
  const rt = ltext('See the available units|[in real time.]', 'h2 cream', 150, 250, L, 'font-size:64px');
  rise(rt, tS + 0.2, { lineGap: [tS + 0.2, at('in real time')] }); hide(rt, at('compare them') - 0.25, 0.3);
  const G = el('<div class="abs" style="left:155px;top:480px;width:560px;height:330px"></div>', L);
  const gr = rng(4), cells = [];
  for (let rr = 0; rr < 4; rr++) for (let cc = 0; cc < 7; cc++) {
    const c = el(`<div class="abs" style="left:${cc * 78}px;top:${rr * 78}px;width:64px;height:64px;border-radius:12px;border:1.5px solid rgba(214,165,140,.6)"></div>`, G);
    gsap.set(c, { autoAlpha: 0 }); cells.push(c);
    tl.fromTo(c, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, tS + 0.4 + (rr * 7 + cc) * 0.016);
    if (gr() < 0.45) tl.to(c, { background: 'rgba(214,165,140,.85)', duration: 0.25 }, at('in real time') + gr() * 1.0);
  }
  const live = pop(chip('<span class="dot live"></span>Live · 95 units available', 640, 160, L), at('in real time') + 0.3);
  out(live, at('compare them') - 0.25);
  [cells[9], cells[12]].forEach(c => tl.to(c, { boxShadow: '0 0 0 3px #F3D2B8', background: 'rgba(230,191,164,1)', duration: 0.3 }, at('compare them') - 0.1));
  tl.to(G, { autoAlpha: 0, x: -60, duration: 0.35, ease: EASE_IN }, at('compare them') + 0.25);

  // compare — the Compare Units screen, its bars growing, with the two units called out beside the phone
  const tC = at('compare them'), tSb = at('side by side');
  pose(hero, tC - 0.2, { x: 960, ry: 0, dur: 0.8 });
  const cw = swap(hero, 'ui:19', tC);
  onUI(cw, (d, q) => {
    q.all('.dr .fa').forEach((e, i) => tl.fromTo(e, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, duration: 0.6, ease: 'power3.out', immediateRender: true }, tSb + i * 0.07));
    q.all('.dr .fb').forEach((e, i) => tl.fromTo(e, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.6, ease: 'power3.out', immediateRender: true }, tSb + i * 0.07));
  });
  const cm = ltext('Compare them|[side by side.]', 'h2 cream', 150, 130, L);
  rise(cm, tC, { lineGap: [tC, tSb] }); hide(cm, at('filter by') - 0.2, 0.3);
  const unitCard = (u, x, rows, dx) => {
    const c = el(`<div class="card" style="left:${x}px;top:420px;width:380px;padding:26px 30px 22px;border-radius:26px;box-shadow:0 24px 60px rgba(0,0,0,.28)">
        <div style="display:flex;align-items:center;gap:14px"><span style="width:40px;height:40px;border-radius:12px;background:#041E42;color:#F4EEE8;display:inline-flex;align-items:center;justify-content:center;font-size:22px">${u[0]}</span><span style="font-size:34px">Unit ${u}</span></div>
        ${rows.map(([a, b]) => `<div class="ur" style="display:flex;justify-content:space-between;font-size:22px;padding:13px 0;border-top:1px solid rgba(4,30,66,.1);margin-top:${a === rows[0][0] ? 16 : 0}px"><span style="opacity:.6">${a}</span><span>${b}</span></div>`).join('')}</div>`, L);
    gsap.set(c, { autoAlpha: 0 });
    tl.fromTo(c, { autoAlpha: 0, x: dx, scale: 0.92 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out', immediateRender: false }, tSb - 0.15);
    c.querySelectorAll('.ur').forEach((r, i) => tl.fromTo(r, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: EASE, immediateRender: true }, tSb + 0.1 + i * 0.08));
    tl.to(c, { autoAlpha: 0, x: dx * 0.5, duration: 0.35, ease: EASE_IN }, at('filter by') - 0.3);
  };
  unitCard('A4', 300, [['Floor', '3'], ['Bedrooms', '4'], ['Built-up area', '280 m²'], ['Price', 'SAR 1,200,000']], 120);
  unitCard('B7', 1240, [['Floor', '6'], ['Bedrooms', '3'], ['Built-up area', '245 m²'], ['Price', 'SAR 1,100,000']], -120);

  // filter — the price-range screen, with a small UI card for every spoken filter (the client's Filters reference)
  const tF = at('filter by');
  const fw = swap(hero, 'ui:05', tF - 0.05);
  onUI(fw, (d, q) => { tl.fromTo(q('section'), { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, tF + 0.35); });
  const fl2 = ltext('Filter by', 'h1 cream', 150, 128, L);
  rise(fl2, tF); hide(fl2, TE - 0.3, 0.3);
  const FC = (x, y, w, h, inner) => { const c = el(`<div class="card" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:22px 24px;border-radius:20px;box-shadow:0 20px 50px rgba(0,0,0,.25)"><div style="position:absolute;left:50%;top:9px;width:44px;height:4px;margin-left:-22px;border-radius:2px;background:rgba(4,30,66,.12)"></div>${inner}</div>`, L); gsap.set(c, { autoAlpha: 0 }); return c; };
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
  [['Space', at('space'), 532, 352], ['Distance', at('distance'), 1214, 372], ['Family', at('family'), 530, 552], ['Individual', at('individual'), 1214, 592], ['Residential community', at('residential community'), 400, 760]].forEach(([s, t, x, y]) => {
    const c = chip(`<span class="dot"></span>${s}`, x, y, L, 'dark'); pop(c, t, { x: x < 960 ? 60 : -60, scale: 0.9 }); out(c, TE - 0.3);
  });
  [[area, at('space') - 0.1], [rad, at('distance') - 0.1], [beds, at('family') - 0.1], [pref, at('individual') - 0.1], [mapc, at('residential community') - 0.1]].forEach(([c, t]) => { pop(c, t, { y: 30, scale: 0.92 }); out(c, TE - 0.3); });
  const slide = (c, t, to) => { tl.to(c.querySelector('.fill'), { width: to, duration: 0.8, ease: 'power2.inOut' }, t); tl.to(c.querySelector('.kb'), { left: to, duration: 0.8, ease: 'power2.inOut' }, t); };
  slide(area, at('space') + 0.3, '38%'); slide(rad, at('distance') + 0.3, '42%');
  count(beds.querySelector('.bd'), 0, 3, at('family') + 0.3, 0.6); count(beds.querySelector('.bt'), 0, 2, at('family') + 0.45, 0.6);
  pref.querySelectorAll('.cb').forEach((b, i) => { if (i !== 1) tl.to(b, { background: '#041E42', borderColor: '#041E42', duration: 0.2 }, at('individual') + 0.3 + i * 0.15); });
  mapc.querySelectorAll('.mr').forEach((m, i) => tl.fromTo(m, { opacity: 0.25 }, { opacity: 1, duration: 0.25, immediateRender: false }, at('residential community') + 0.2 + i * 0.15));
  tap(hero, 0.5, 0.95, at('residential community') + 0.4);

  // dive through the phone into the empty apartment that furnishes itself (P2)
  const P = zlayer(60); gsap.set(P, { autoAlpha: 0 }); portalHome = P;
  P.style.background = 'radial-gradient(120% 100% at 60% 40%,#c9d3d8,#b9c3c9)';
  const pw = el('<div class="abs" style="left:300px;top:60px;width:1620px;height:911px"></div>', P);
  gclip(pw, 'p2', TE - 0.55, TV + 2.0, { from: 0 });
  portalOpen(P, TE - 0.55, screenRect(hero, 960), 0.85);
  tl.fromTo(pw, { scale: 1.08 }, { scale: 1.0, duration: TV - TE + 1.2, ease: 'power1.out', immediateRender: false }, TE - 0.55);
  rise(ltext('So you can find|your [perfect home,]', 'h1 navy', 120, 110, P), TE, { lineGap: [TE, at('your perfect home')] });
  rise(ltext('not just an empty room.', 'h2 navy', 124, 340, P, 'opacity:.8'), at('not just an empty'));

  // the held beat after "…empty room.": full-screen Package Details — every piece priced, the total, added to the selection
  const tD = after('not just an empty room') - 0.1, tDx = TV - 0.75;
  const PD = zlayer(61, 'app'); gsap.set(PD, { autoAlpha: 0 });
  const im = el(`<div class="layer" style="background:url('${A('pkg/contemporary.jpg')}') center/cover"></div>`, PD);
  el(`<div class="layer" style="background:linear-gradient(90deg,rgba(6,14,32,.8) 0%,rgba(6,14,32,.45) 26%,rgba(6,14,32,0) 44%),linear-gradient(180deg,rgba(6,14,32,.62) 0%,rgba(6,14,32,0) 20%,rgba(6,14,32,0) 75%,rgba(6,14,32,.5) 100%)"></div>`, PD);
  const TG = [['Artwork', 3000, 1320, 316, 1], ['Lamps', 1100, 1025, 594], ['Lounge chair', 6900, 760, 682], ['Nightstands ×2', 3600, 1654, 774, 1], ['King bed', 12400, 1120, 826], ['Wool rug', 2800, 900, 1000]];
  const tags = TG.map(([n, v, x, y, r]) => el(`<div class="tag${r ? ' r' : ''}" data-ob="tag" style="${r ? `right:${W - x - 24}px` : `left:${x - 24}px`};top:${y - 24}px"><i></i>${n}<b>${SARi(15)}${money(v)}</b></div>`, im));
  el(`<div class="gb" style="left:64px;top:44px">${ICO.back}</div>`, PD);
  el(`<div class="abs" style="left:560px;width:800px;top:46px;text-align:center"><div style="font-size:26px;font-weight:500">Contemporary</div><div style="font-size:18px;opacity:.75;margin-top:5px">Tap a tag to see the piece</div></div>`, PD);
  el(`<div class="gb" style="right:64px;top:44px">${ICO.tag}</div>`, PD);
  const dp = el(`<div class="glass" data-ob="pkg" style="left:72px;top:556px;width:604px;height:448px;padding:32px 34px">
      <div style="display:flex;gap:10px">${[['Bedroom', 6], ['Living', 2], ['Dining', 2], ['Kitchen', 2]].map(([r, n], i) => `<span class="rc${i ? '' : ' on'}">${r} <small>${n}</small></span>`).join('')}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:30px;font-size:22px"><span>Master bedroom · 6 pieces</span><b style="display:flex;align-items:center;gap:6px;font-size:25px;font-weight:600">${SARi(19)}<span class="bd">29,800</span></b></div>
      <div style="height:1px;background:rgba(255,255,255,.16);margin-top:22px"></div>
      <div style="font-size:17px;opacity:.72;margin-top:20px">Package total</div>
      <div style="display:flex;align-items:center;gap:12px;font-size:56px;font-weight:500;letter-spacing:-.8px;margin-top:4px">${SARi(40)}<span class="tt">124,775</span></div>
      <div style="font-size:17px;opacity:.72;margin-top:2px">incl. VAT · delivery &amp; installation included</div>
      <div class="bt" style="position:absolute;left:34px;right:34px;bottom:30px;height:62px;border-radius:31px;background:#fff;color:#0B1F44;font-size:20px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 12px 28px rgba(0,0,0,.35)"><span class="b1" style="display:flex;align-items:center;gap:12px">Add Contemporary to my selection ${ICO.arrow}</span></div></div>`, PD);
  const bt = dp.querySelector('.bt'), b1 = dp.querySelector('.b1');
  gsap.set([dp, ...tags], { autoAlpha: 0 });
  const b2 = el(`<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;opacity:0"><span style="width:30px;height:30px;border-radius:50%;background:#2E9E6B;display:grid;place-items:center">${ICO.check}</span>Added to my selection</span>`, bt);
  tl.fromTo(PD, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power3.inOut', immediateRender: false }, tD);
  brandSweep(tD - 0.05, PD, { n: 8 });
  tl.fromTo(im, { scale: 1.08 }, { scale: 1, duration: tDx - tD + 0.6, ease: 'power1.out', immediateRender: false }, tD);
  tl.fromTo(dp, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE, immediateRender: false }, tD + 0.3);
  tags.forEach((g, i) => {
    const t = tD + 0.55 + i * 0.17, r = g.classList.contains('r');
    tl.fromTo(g, { autoAlpha: 0, clipPath: r ? 'inset(0 0 0 calc(100% - 48px) round 24px)' : 'inset(0 calc(100% - 48px) 0 0 round 24px)' },
      { autoAlpha: 1, clipPath: 'inset(0 0% 0 0% round 24px)', duration: 0.45, ease: 'power3.out', immediateRender: false }, t);
    tl.fromTo(g.querySelector('i'), { scale: 0.3 }, { scale: 1, duration: 0.35, ease: 'back.out(2.6)', immediateRender: false }, t);
  });
  count(dp.querySelector('.bd'), 0, 29800, tD + 0.55, 1.1, money);
  count(dp.querySelector('.tt'), 0, 124775, tD + 0.6, 1.4, money);
  const tPr = tD + 2.15;
  tl.fromTo(bt, { scale: 1 }, { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut', immediateRender: false }, tPr);
  tl.to(b1, { opacity: 0, duration: 0.12 }, tPr + 0.12); tl.to(b2, { opacity: 1, duration: 0.2 }, tPr + 0.26);
  tl.to(PD, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.7, ease: 'power3.inOut' }, tDx - 0.15);
  tl.set(PD, { autoAlpha: 0 }, tDx + 0.55);
  tl.set(P, { autoAlpha: 0 }, tD + 0.8);
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
  setPoseAt(p, T0 - 1.7, { x: 1260, ry: 0 });
  const s03 = swap(p, 'ui:03', T0 - 1.7, 'fade');    // done while the Package Details still covers the stage
  onUI(s03, (d, q) => {                              // the phone number types in, then Face ID
    const num = q('#ph'), full = num.value, t1 = T0 - 0.55, step = 0.06;
    tl.fromTo({ p: 0 }, { p: 0 }, { p: 1, duration: full.length * step + 0.3, ease: 'none', immediateRender: true,
      onUpdate: () => { num.value = full.slice(0, Math.max(0, Math.min(full.length, Math.floor((tl.time() - t1) / step) + 1))); } }, t1);
  });
  pose(p, T0 + 0.1, { x: 1260, ry: -12, dur: 0.8, ease: 'power2.inOut' });

  // G2: verifying with Face ID through the platform, in a window beside the phone
  const GW = el('<div class="abs" data-ob="win" style="left:140px;top:380px;width:860px;height:484px;border-radius:30px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.45)"></div>', L);
  gsap.set(GW, { autoAlpha: 0 });
  gclip(GW, 'g2', T0 - 0.5, at('request information'), { from: 0.9 });
  tl.fromTo(GW, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: EASE, immediateRender: false }, T0 - 0.45);
  tl.to(GW, { autoAlpha: 0, x: -60, duration: 0.4, ease: EASE_IN }, at('request information') - 0.4);

  const vt = ltext('Verify your identity|[in seconds.]', 'h2 cream', 150, 120, L);
  rise(vt, T0 + 0.1, { lineGap: [T0 + 0.1, at('in seconds')] }); hide(vt, at('request information') - 0.3, 0.3);
  const scrim = ov(p, '', [0, 0, 1, 1], 'background:rgba(2,12,31,.62);z-index:12');
  const fid = ov(p, `<svg viewBox="0 0 100 100" width="100%" height="100%"><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
    <path d="M8 26V14a6 6 0 0 1 6-6h12M74 8h12a6 6 0 0 1 6 6v12M92 74v12a6 6 0 0 1-6 6H74M26 92H14a6 6 0 0 1-6-6V74"/>
    <path d="M34 36v6M66 36v6M50 40v16h-5M38 66c6 6 18 6 24 0"/></g></svg>`, [0.28, 0.3, 0.44, 0.2], 'z-index:13');
  const scan = ov(p, '', [0.3, 0.31, 0.4, 0.004], 'background:linear-gradient(90deg,transparent,#E6BFA4,transparent);z-index:14;box-shadow:0 0 18px 4px rgba(230,191,164,.6)');
  [scrim, fid, scan].forEach(e => gsap.set(e, { autoAlpha: 0 }));
  const tF = T0 + 0.5;
  tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, tF);
  tl.fromTo(fid, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: EASE, immediateRender: false }, tF + 0.05);
  tl.fromTo(scan, { autoAlpha: 1, top: '31%' }, { top: '49%', duration: 0.45, repeat: 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, tF + 0.2);
  tl.to(scan, { autoAlpha: 0, duration: 0.15 }, tF + 1.1);
  tl.to(fid.querySelector('g'), { stroke: '#E6BFA4', duration: 0.25 }, tF + 1.1);
  tl.to([scrim, fid], { autoAlpha: 0, duration: 0.3 }, tF + 1.35);
  const idv = swap(p, 'ui:33', tF + 1.3, 'fade');
  onUI(idv, (d, q) => { uiRise(q.all('.dr'), tF + 1.5, { stagger: 0.07, y: 14 }); });

  // request · visit · reserve — the reservation is the live "Your Selection" screen, P5 (the furnished plan) behind it
  const tRq = at('request information'), tBk = at('book a dedicated'), tRv = at('reserve your unit');
  pose(p, tRq - 0.4, { x: 1360, ry: -10, dur: 0.7 });
  const pj = swap(p, 'ui:09', tRq - 0.15);
  onUI(pj, (d, q) => { uiRise(q.all('.stat'), tRq + 0.25, { stagger: 0.08, y: 18 }); });
  const rv = ltext('Request information.|Book a dedicated visit.|[And reserve your unit.]', 'h2 cream', 150, 330, L, 'line-height:1.45;font-size:66px');
  rise(rv, tRq, { lineGap: [tRq, tBk, at('and reserve your unit')] });
  focusLine(rv, 0, tRq); focusLine(rv, 1, tBk); focusLine(rv, 2, at('and reserve your unit'));
  hide(rv, at('review your contract') - 0.3, 0.35);
  tap(p, 0.5, 0.94, tRq + 0.2);
  const k1 = pop(chip(`<span class="tick">${ICON.check}</span>Information requested`, 150, 700, L), tRq + 0.4);
  const k2 = pop(chip(`<span class="tick">${ICON.check}</span>Visit booked · Thu 10:00 AM`, 150, 790, L), tBk + 0.4);
  [k1, k2].forEach(k => out(k, tRv - 0.25, 0.3));
  const R5 = el('<div class="layer"></div>', L); gsap.set(R5, { autoAlpha: 0 });
  L.insertBefore(R5, L.children[1]);
  gclip(R5, 'p5', tRv - 0.5, at('review your contract') + 0.6, { from: 1.6 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.9),rgba(2,12,31,.6) 45%,rgba(2,12,31,.25))"></div>', R5);
  tl.to(R5, { autoAlpha: 1, duration: 0.6 }, tRv - 0.5);
  const sel = swap(p, 'ui:32', tRv - 0.2);
  onUI(sel, (d, q) => {
    uiRise(q.all('.card.rm'), tRv + 0.1, { stagger: 0.09 });
    q.all('.wave .sr b').slice(1).forEach((b) => uiCount(d, b.textContent.trim(), tRv + 0.4, 0.9));
    uiCount(d, '1,324,775', tRv + 0.4, 1.0, 1200000);
  });

  // review & sign — the Sales Agreement on the phone opens into P6, signed on the tablet
  const tR = at('review your contract'), tSg = at('then sign it'), tP = at('with a single platform');
  pose(p, tR - 0.55, { x: 1360, ry: 0, dur: 0.45, ease: 'power2.inOut' });
  const sa = swap(p, 'ui:34', tR - 0.5, 'fade');
  onUI(sa, (d, q) => { uiRise(q.all('.cl'), tR - 0.3, { stagger: 0.08, y: 10 }); });
  const SG = zlayer(60); gsap.set(SG, { autoAlpha: 0 });
  gclip(el('<div class="layer"></div>', SG), 'p6', tR + 0.35, tP + 0.2, { from: 0.4 });
  el('<div class="layer" style="background:linear-gradient(180deg,rgba(2,12,31,.62),rgba(2,12,31,.2) 32%,rgba(2,12,31,0) 50%)"></div>', SG);
  portalOpen(SG, tR + 0.35, screenRect(p, 1360), 0.8);
  tl.to(R5, { autoAlpha: 0, duration: 0.3 }, tR + 1.2);
  const sg1 = ltext('Review your contract.', 'h2 cream', 120, 150, L);
  rise(sg1, tR); hide(sg1, tR + 0.3, 0.25);
  const sg2 = ltext('Then sign it digitally|and [securely.]', 'h2 cream', 120, 140, SG);
  rise(sg2, tSg, { lineGap: [tSg, at('and securely')] }); hide(sg2, tP - 0.85, 0.3);
  setPoseAt(p, tP - 0.95, { x: 1400, ry: 0 });
  const s16 = swap(p, 'ui:16', tP - 0.95, 'fade');
  onUI(s16, (d, q) => { uiRise(q.all('.card'), tP - 0.35, { stagger: 0.07, y: 22 }); });
  portalClose(SG, tP - 0.8, screenRect(p, 1400), 0.85);

  // "With a single platform, ZOOD keeps everything with you."
  pose(p, tP + 0.1, { x: 1400, ry: -12, dur: 0.8 });
  const op = ltext('With a single platform,|[ZOOD] keeps everything with you.', 'h2 cream', 150, 300, L, 'font-size:64px');
  rise(op, tP, { lineGap: [tP, at('zood keeps everything')] }); hide(op, at('every payment') - 0.3, 0.3);

  // every payment · every stage · every update — no phone: a journey along the brand line (Payment Milestones data)
  const tEp = at('every payment'), tEs = at('every stage'), tEu = at('every update'), tT = at('track the progress');
  tl.to(p, { x: 700, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, tEp - 0.45);
  const JL = el('<div class="layer"></div>', L); gsap.set(JL, { autoAlpha: 0 });
  tl.to(JL, { autoAlpha: 1, duration: 0.4 }, tEp - 0.35); tl.to(JL, { autoAlpha: 0, duration: 0.4 }, tT - 0.8);
  const ev = ltext('Every payment.|Every stage.|Every update.', 'h2 cream', 150, 120, JL, 'line-height:1.3');
  rise(ev, tEp, { lineGap: [tEp, tEs, tEu] });
  focusLine(ev, 0, tEp); focusLine(ev, 1, tEs); focusLine(ev, 2, tEu);
  const MS = [['Booking', 'Paid'], ['Deposit', 'Paid'], ['Excavation', 'Paid'], ['Foundation', 'Paid'], ['Structure 50%', 'Paid'], ['Structure complete', 'Paid'], ['Facade start', 'Paid'],
    ['Facade complete', 'Due 15 Nov'], ['Interior finishing', 'Feb 2027'], ['MEP & landscaping', 'Apr 2027'], ['Final inspection', 'Q2 2027'], ['Handover', 'Q2 2027']];
  const TR = el('<div class="abs" style="left:0;top:0;width:3400px;height:1080px"></div>', JL);
  const nx = (i) => 240 + i * 250, ny = (i) => 700 + Math.sin(i * 0.9) * 70;
  let dpath = `M ${nx(0) - 260} ${ny(0)}`;
  for (let i = 0; i < MS.length; i++) dpath += i ? ` S ${nx(i) - 125} ${ny(i)} ${nx(i)} ${ny(i)}` : ` L ${nx(0)} ${ny(0)}`;
  const PS = el(`<svg class="abs" width="3400" height="1080" style="left:0;top:0;overflow:visible">${ROSE_GRAD_SVG.replace('id="rg"', 'id="rgJ"')}
      <path d="${dpath}" fill="none" stroke="rgba(244,238,232,.16)" stroke-width="3"/><path class="pv" d="${dpath}" fill="none" stroke="url(#rgJ)" stroke-width="4" stroke-linecap="round"/></svg>`, TR);
  const pv = PS.querySelector('.pv'), PL = pv.getTotalLength();
  gsap.set(pv, { strokeDasharray: PL, strokeDashoffset: PL });
  const lit = (i) => tEp + 0.05 + i * 0.29;
  const fracAt = (i) => { let lo = 0, hi = PL; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; (pv.getPointAtLength(m).x < nx(i) ? lo = m : hi = m); } return lo / PL; };
  for (let i = 0; i <= 7; i++) tl.to(pv, { strokeDashoffset: PL * (1 - fracAt(i)), duration: 0.29, ease: 'none' }, lit(i) - 0.29);
  MS.forEach(([name, st], i) => {
    const paid = i < 7, cur = i === 7, up = i % 2 === 0;
    const n = el(`<div class="abs" style="left:${nx(i) - 22}px;top:${ny(i) - 22}px;width:44px;height:44px;border-radius:50%;border:2px solid ${paid || cur ? '#E6BFA4' : 'rgba(244,238,232,.35)'};background:#041E42;display:flex;align-items:center;justify-content:center">
        <div class="f" style="width:30px;height:30px;border-radius:50%;background:${cur ? 'transparent' : 'linear-gradient(100deg,#B07A63,#E6BFA4)'};display:flex;align-items:center;justify-content:center">${paid ? ICON.check.replace('<svg', '<svg width="16" height="16"') : ''}</div></div>`, TR);
    const lb = el(`<div class="abs" style="left:${nx(i) - 110}px;top:${ny(i) + (up ? -112 : 40)}px;width:220px;text-align:center"><div style="font-size:22px;color:#F4EEE8">${name}</div><div class="label" style="font-size:13px;margin-top:6px;color:${paid ? '#D6A58C' : cur ? '#F3D2B8' : 'rgba(244,238,232,.5)'}">${i + 1} · ${st}</div></div>`, TR);
    const f = n.querySelector('.f');
    if (paid) { gsap.set(f, { scale: 0 }); tl.to(f, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, lit(i)); }
    tl.fromTo(n, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: true }, Math.min(lit(i), tEu) - 0.25);
    tl.fromTo(lb, { autoAlpha: 0, y: up ? 12 : -12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: EASE, immediateRender: true }, Math.min(lit(i), tEu) - 0.15);
    if (cur) [0, 1, 2].forEach(k => {
      const ring = el(`<div class="abs" style="left:${nx(i) - 22}px;top:${ny(i) - 22}px;width:44px;height:44px;border-radius:50%;border:2px solid #E6BFA4"></div>`, TR);
      tl.fromTo(ring, { scale: 1, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.2, repeat: 1, ease: 'power1.out', immediateRender: true }, lit(i) + k * 0.4);
    });
  });
  tl.fromTo(TR, { x: 260 }, { x: -980, duration: tT - tEp + 0.2, ease: 'power1.inOut', immediateRender: true }, tEp - 0.35);
  const pc = el(`<div class="card dark" style="left:1290px;top:110px;width:500px;padding:28px 32px;border-radius:26px">
      <div class="label" style="font-size:14px;color:#D6A58C">Paid to date</div>
      <div style="display:flex;align-items:baseline;gap:14px;margin-top:10px"><span style="font-size:58px;font-weight:300">SAR <span class="n">0</span></span><span style="opacity:.6;font-size:22px">of 1,200,000</span></div>
      <div style="margin-top:16px;height:8px;border-radius:4px;background:rgba(244,238,232,.12)"><div class="b" style="height:8px;width:0;border-radius:4px;background:linear-gradient(90deg,#B07A63,#E6BFA4)"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:20px;opacity:.75"><span><span class="k">0</span> of 12 milestones paid</span><span><span class="pc">0</span>%</span></div></div>`, JL);
  gsap.set(pc, { autoAlpha: 0 }); pop(pc, tEp + 0.1);
  count(pc.querySelector('.n'), 0, 660000, tEp + 0.2, 2.0, v => Math.round(v).toLocaleString('en-US'));
  count(pc.querySelector('.k'), 0, 7, tEp + 0.2, 2.0); count(pc.querySelector('.pc'), 0, 55, tEp + 0.2, 2.0);
  tl.to(pc.querySelector('.b'), { width: '55%', duration: 2.0, ease: 'power2.out' }, tEp + 0.2);
  const upd = pop(chip('<span class="dot live"></span>Update · Milestone 8 · Facade complete · due in 39 days', 0, 920, JL, 'dark'), tEu + 0.1);
  upd.style.left = 'auto'; upd.style.right = '130px';

  // construction tracking
  setPoseAt(p, tT - 0.7, { x: 640, ry: 12 });
  const s15 = swap(p, 'ui:15', tT - 0.7, 'fade');
  onUI(s15, (d, q) => {
    uiCount(d, '68%', tT + 0.3, 1.6);
    uiRise([q('section'), ...q.all('.col')], tT - 0.1, { stagger: 0.06, y: 18 });
  });
  tl.fromTo(p, { x: -260, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', immediateRender: false }, tT - 0.35);
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
  // P9 — the final inspection walk (the clean part of the clip: she checks the counter, smiles, taps the tablet)
  const a9 = el('<div class="layer"></div>', HL);
  gclip(a9, 'p9', TD - 0.1, TL + 0.6, { from: 1.45 });
  gsap.set(a9, { autoAlpha: 0 });
  tl.fromTo(a9, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: false }, TD - 0.1);
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
  // "…protected securely and managed seamlessly." — P7 in a window, the live Home Controls screen beside it
  const sidePhone = (src, x, parent, w = 380) => { const box = el('<div class="layer persp"></div>', parent); const ph = phone(src, { w, x, y: 560, parent: box }); return { box, ph }; };
  const s7 = el('<div class="layer bg-day"></div>', FL);
  tl.fromTo(s7, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: true }, TM0 - 0.4);
  const w7 = el('<div class="abs" data-ob="win" style="left:80px;top:372px;width:1100px;height:619px;border-radius:34px;overflow:hidden;box-shadow:0 40px 90px rgba(60,40,25,.28)"></div>', s7);
  gclip(w7, 'p7', TM0 - 0.4, TC + 0.6, { from: 0.4 });
  tl.fromTo(w7, { scale: 1.06 }, { scale: 1, duration: TC - TM0 + 1, ease: 'none', immediateRender: false }, TM0 - 0.4);
  const em = ltext('Everything that matters to you,|[protected securely]|and managed seamlessly.', 'h2 navy', 80, 56, s7, 'font-size:56px;line-height:1.2');
  rise(em, TM0, { lineGap: [TM0, at('protected securely'), at('and managed seamlessly')] }); hide(em, TC - 0.3, 0.3);
  const hc = sidePhone('ui:23', 1520, s7);
  setPose(hc.ph, { x: 1520, y: 560, ry: -10, s: 1 });
  tl.fromTo(hc.ph, { x: 260, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', immediateRender: true }, TM0 - 0.1);
  onUI(hc.ph.cur, (d, q) => {
    const tiles = q.all('.dv');
    const glow = (e, t) => tl.fromTo(e, { boxShadow: '0 0 0 0 rgba(162,112,99,0)' }, { boxShadow: '0 0 0 4px rgba(162,112,99,.85)', duration: 0.25, yoyo: true, repeat: 1, immediateRender: true }, t);
    glow(tiles[0], TM0 + 1.0); glow(tiles[2], at('and managed seamlessly') + 0.2);
  });
  tap(hc.ph, 0.28, 0.6, TM0 + 1.0); tap(hc.ph, 0.28, 0.75, at('and managed seamlessly') + 0.2);

  // community — the evening event (P11); the live Events Calendar, then Event Booking, on the phone beside it
  const s11 = el('<div class="layer"></div>', FL);
  gclip(s11, 'p11', TC - 0.4, TM + 0.6, { from: 0.4 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.72),rgba(2,12,31,.2) 50%,rgba(2,12,31,.35))"></div>', s11);
  tl.fromTo(s11, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: true }, TC - 0.4);
  lineSweep(TC - 0.5, FL);
  const yc = ltext('And everything your community|brings together, in [one place.]', 'h2 cream', 120, 150, s11, 'font-size:62px');
  rise(yc, TC, { lineGap: [TC, at('brings together')] }); hide(yc, TM - 0.3, 0.3);
  const ev = sidePhone('ui:25', 1520, s11);
  setPose(ev.ph, { x: 1520, y: 560, ry: -10, s: 1 });
  tl.fromTo(ev.ph, { y: 300, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', immediateRender: true }, TC + 0.1);
  onUI(ev.ph.cur, (d, q) => {
    const rows = q.all('body *').filter(e => e.children.length && /going|Free/.test(e.textContent) && e.getBoundingClientRect().height > 50 && e.getBoundingClientRect().height < 110);
    uiRise(rows.slice(0, 3), TC + 0.5, { stagger: 0.15 });
  });
  const eb = swap(ev.ph, 'ui:26', at('in one place', 2) - 0.35);
  tap(ev.ph, 0.72, 0.945, at('in one place', 2) + 0.35);
  tl.to(ev.ph, { y: 300, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, TM - 0.75);

  // More ___ — a window cycles through the community (P11 → P14 → P12 → P13)
  tl.set(sw, { autoAlpha: 0 }, TM0 + 0.6); tl.set(s7, { autoAlpha: 0 }, TC + 0.6);
  const WF = el('<div class="abs" data-ob="win" style="left:1000px;top:110px;width:780px;height:860px;border-radius:40px;overflow:hidden;box-shadow:0 50px 120px rgba(60,40,25,.35)"></div>', FL);
  gsap.set(WF, { autoAlpha: 0 }); tl.set(WF, { autoAlpha: 1 }, at('more connection') - 0.15);
  tl.fromTo(s11, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: 'inset(110px 140px 110px 1000px round 40px)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TM - 0.4);
  const wins = [['p14', at('more connection'), 3.6], ['p12', at('efficiency'), 3.6], ['p13', at('possibilities'), 0.2]];
  wins.forEach(([nm, t, from], i) => {
    const b = el('<div class="abs" style="inset:0;overflow:hidden"></div>', WF);
    gclip(b, nm, t - 0.1, i < 2 ? wins[i + 1][1] + 0.6 : TN + 0.2, { from });
    tl.fromTo(b, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut', immediateRender: true }, t - 0.1);
    tl.fromTo(b, { scale: 1.12 }, { scale: 1.0, duration: 2.2, ease: 'none', immediateRender: false }, t - 0.1);
  });
  tl.set(s11, { autoAlpha: 0 }, at('more connection') + 0.6);
  const mo = ltext('[More]', 'h0', 140, 330, L);
  rise(mo, TM); hide(mo, TN - 0.3, 0.35);
  swapWords([['presence.', at('presence', 2)], ['connection.', at('more connection') + 0.15], ['efficiency.', at('efficiency')], ['possibilities|for the community.', at('possibilities')]], L,
    (s) => ltext(s, 'h1 navy', 140, 540, L, 'font-size:84px'), { useRise: true }).forEach((e, i, a) => { if (i === a.length - 1) hide(e, TN - 0.3, 0.35); });
  tl.to(WF, { autoAlpha: 0, duration: 0.4 }, TN + 0.1);

  // "Everything you need, whenever you need it." — services on request (P15) with the live Service Request screen
  const SV = zlayer(60); show(SV, TN - 0.4, null, 0.01);
  const s15 = el('<div class="layer"></div>', SV);
  gclip(s15, 'p15', TN - 0.4, TA + 0.6, { from: 0.15 });
  el('<div class="layer" style="background:linear-gradient(90deg,rgba(2,12,31,.72),rgba(2,12,31,.2) 50%,rgba(2,12,31,.3))"></div>', s15);
  tl.fromTo(SV, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut', immediateRender: false }, TN - 0.4);
  const en = ltext('Everything you need,|[whenever you need it.]', 'h2 cream', 120, 150, SV);
  rise(en, TN, { lineGap: [TN, at('whenever')] }); hide(en, TA - 0.6, 0.3);
  const sr = sidePhone('ui:28', 1520, SV);
  setPose(sr.ph, { x: 1520, y: 560, ry: -10, s: 1 });
  tl.fromTo(sr.ph, { x: 260, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', immediateRender: true }, TN - 0.1);
  onUI(sr.ph.cur, (d, q) => { uiRise(q.all('.st'), TN + 0.2, { stagger: 0.32 }); });
  tl.to(sr.ph, { x: 260, autoAlpha: 0, duration: 0.4, ease: 'power3.in' }, TA - 0.95);
  // the services scene closes into the hero phone: "As if ZOOD is always with you" — the live Chat screen
  tl.set(p, { autoAlpha: 1, x: 0 }, TA - 1.3);
  setPoseAt(p, TA - 1.3, { x: 1300, ry: 0 });
  const ch = swap(p, 'ui:29', TA - 1.3, 'fade');
  onUI(ch, (d, q) => {
    const msgs = q.all('div.in, div.out').concat(q.all('body *').filter(e => /VIEWING REQUEST|Floor plan\.pdf/.test(e.textContent) && e.children.length > 1 && e.getBoundingClientRect().height < 130));
    msgs.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    uiRise(msgs, TA + 0.1, { stagger: (TD - TA - 0.2) / msgs.length, y: 18 });
  });
  portalClose(SV, TA - 0.75, screenRect(p, 1300), 0.85);
  pose(p, TA + 0.2, { x: 1300, ry: -10, dur: 0.8 });

  const aw = ltext('As if [ZOOD] is|always with you.', 'h2 navy', 160, 380, L);
  rise(aw, TA, { lineGap: [TA, at('always with you')] });
  tl.to(aw, { color: '#F4EEE8', duration: 1.6 }, at('with a real sense'));
  hide(aw, TD - 0.35, 0.35);
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

  // the live Yield screens: overview, then the Yield Manager switching strategy on every spoken option, and Rental Income
  const pb = phone('ui:31', { parent: L });
  const p = hero;
  const yo = swap(p, 'ui:17', TS - 0.3);
  onUI(yo, (d, q) => { uiRise(q.all('body *').filter(e => /Estimated Yield/.test(e.textContent) && e.children.length > 2 && e.getBoundingClientRect().height < 80), TS + 0.3, { stagger: 0.12 }); });
  setPose(pb, { x: 900, y: 1700, ry: 22, s: 0.86 });
  pose(pb, at('long term') - 0.6, { x: 900, y: 540, ry: 22, s: 0.86, dur: 0.9, ease: 'power3.out' });
  pose(p, TS - 0.4, { x: 560, y: 540, ry: 12, s: 1, dur: 0.9, ease: 'power3.inOut' });
  sheen(p, TS + 0.8);
  const mk = ltext('A smarter way to make|your property [work for you.]', 'h2 cream', 1140, 260, L, 'font-size:60px');
  rise(mk, TS, { lineGap: [TS, at('your property work for you')] });
  const caps = [['Long-term leasing.', at('long term')], ['Short stays.', at('short stays')], ['Or selling.', at('or selling')]];
  const ym = swap(p, 'ui:30', at('long term') - 0.45);
  onUI(ym, (d, q) => {
    const btns = q.all('.seg button'), on = q('.seg button.on'), off = btns.find(b => b !== on);
    const ON = { backgroundColor: getComputedStyle(on).backgroundColor, color: getComputedStyle(on).color, boxShadow: getComputedStyle(on).boxShadow };
    const OFF = { backgroundColor: getComputedStyle(off).backgroundColor, color: getComputedStyle(off).color, boxShadow: 'none' };
    caps.forEach(([, t], i) => btns.forEach((b, j) => tl.fromTo(b, { ...(j === i ? OFF : ON) }, { ...(j === i ? ON : OFF), duration: 0.25, immediateRender: false }, t - 0.05)));
    btns.forEach((b, j) => gsap.set(b, j === 0 ? ON : OFF));
    q.all('.cr .f').forEach((f, i) => tl.fromTo(f, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.7, ease: 'power3.out', immediateRender: true }, at('long term') + 0.1 + i * 0.1));
    // the headline figures follow the selected strategy (values from the screen's own comparison rows)
    const tE = at('discover', 2), [t1, t2, t3] = caps.map(c => c[1] - 0.05);
    uiTextAt(uiText(d, '9.4%'), [[t1, '6.1%'], [t2, '9.4%'], [t3, '3.3%']], tE);
    const net = uiText(d, '116,600 net / year') || q.all('body *').find(e => /net \/ year/.test(e.textContent) && e.children.length <= 1);
    uiTextAt(net, [[t1, '75,600 net / year'], [t2, '116,600 net / year'], [t3, '+40,000 once']], tE);
    const badge = q.all('span').find(e => e.textContent.trim().endsWith('Best return'));
    if (badge) { tl.fromTo(badge, { opacity: 0 }, { opacity: 0, duration: 0.01, immediateRender: true }, t1); tl.to(badge, { opacity: 1, duration: 0.25 }, t2); tl.to(badge, { opacity: 0, duration: 0.25 }, t3); }
  });
  onUI(pb.cur, (d) => { uiCount(d, '214,380', at('long term') + 0.2, 1.6); });
  swapWords([...caps, ['You choose in seconds.', at('you choose in seconds')], ['[ZOOD] takes care of the rest.', at('zood takes care of the rest', 2)]], L,
    (s) => ltext(s, 'h3 cream', 1144, 520, L), { useRise: true }).forEach((e, i, a) => { if (i === a.length - 1) hide(e, TX - 0.5, 0.4); });
  hide(mk, TX - 0.5, 0.4);
  // the phone pulls back to the centre; the wall of screens assembles around it
  pose(p, TX - 1.1, { x: 960, y: 540, ry: 0, s: 0.6, dur: 0.75 });
  tl.to(p, { autoAlpha: 0, scale: 0.45, duration: 0.45, ease: 'power2.in' }, TX - 0.4);
  pose(pb, TX - 0.55, { x: 860, y: 1700, dur: 0.6, ease: 'power3.in' });
}

// =====================================================================
// FINALE  wall of screens → bento grid → icon → logo → end card
// =====================================================================
const UIP = (n) => A(`ui/png/${n}.png`);
const ALL = ['02', '06', '10', '19', '05', '04', '03', '09', '21', '20', '16', '15', '18', '25', '30', '31', '07', '01', '23', '28', '29', '22'];
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
    const c = el(`<div class="tile" style="left:${col * 270 + (row % 2) * 120}px;top:${row * 560}px;width:246px;height:535px;border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.55)"><img src="${UIP(src)}" style="width:100%;height:100%;object-fit:cover"></div>`, wall);
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
  const scrTile = (src) => `<img src="${UIP(src)}" style="position:absolute;left:0;top:50%;width:100%;transform:translateY(-50%)">`;
  const lab = (s, dark) => `<div class="label" style="position:absolute;left:26px;bottom:24px;font-size:16px;color:${dark ? '#041E42' : '#F4EEE8'}">${s}</div>`;
  const shadeB = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,12,31,0) 50%,rgba(2,12,31,.75))"></div>';
  T(48, 48, 300, 460, `<img src="${UIP('18')}" style="position:absolute;left:0;top:-8px;width:100%">${shadeB}${lab('Live')}`, '#F4EEE8');
  const t68 = T(48, 526, 300, 506, `<div style="position:absolute;left:30px;top:34px" class="label navy">Construction</div><div class="navy" style="position:absolute;left:24px;bottom:70px;font-size:120px;font-weight:300"><span class="n">0</span>%</div><div class="navy" style="position:absolute;left:30px;bottom:36px;font-size:22px;opacity:.6">Tracked live</div>`, 'linear-gradient(160deg,#EFE4DA,#DBC8B6)');
  T(366, 48, 300, 300, `<div style="position:absolute;inset:0;background:url('${PH('city-view.jpg')}') center 35%/cover"></div>${shadeB}${lab('Discover')}`);
  T(366, 366, 300, 666, scrTile('10'), '#F4EEE8');
  T(684, 48, 552, 300, `<div style="position:absolute;inset:0;background:url('${PH('reception.jpg')}') center/cover"></div>${shadeB}${lab('Create')}`);
  const txt = T(684, 366, 552, 348, '', 'linear-gradient(160deg,#0f3364,#041E42)');
  txt.style.boxShadow = 'inset 0 0 0 1.5px rgba(214,165,140,.35)';
  T(684, 732, 552, 300, `<img src="${UIP('30')}" style="position:absolute;left:-2%;top:-${0.215 * 552 / 0.462 * 1.04}px;width:104%">${lab('Enjoy', true)}`, '#F4EEE8');
  T(1254, 48, 300, 666, scrTile('21'), '#F4EEE8');
  const tStar = T(1254, 732, 300, 300, '', 'radial-gradient(90% 90% at 50% 40%,#FBF7F3,#E9DDD2)');
  { const sb = el('<div class="abs" style="left:-170px;top:-58px;width:1280px;height:720px;transform:scale(.5);transform-origin:0 0"></div>', tStar); gclip(sb, 'star', TDz - 0.4, END, { fit: 'fill' }); }
  const t78 = T(1572, 48, 300, 300, `<div style="position:absolute;left:30px;top:34px" class="label navy">Average yield</div><div class="navy" style="position:absolute;left:24px;bottom:30px;font-size:104px;font-weight:300"><span class="n">0.0</span>%</div>`, 'linear-gradient(160deg,#C4E1F4,#9BCBEB)');
  T(1572, 366, 300, 666, scrTile('06'), '#F4EEE8');
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
