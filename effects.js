/* ════════════════════════════════════════════════════════════════
   MEA CULPA LAB — Motion layer v5.1
   Cursore custom · tilt 3D · parallax · bottoni magnetici · nav hide
   Vanilla JS, nessuna dipendenza. Si disattiva con
   prefers-reduced-motion e su dispositivi touch.
   ════════════════════════════════════════════════════════════════ */
(() => {
  const fine    = matchMedia('(pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => innerWidth > 900;

  /* ── Nav auto-hide: scompare scendendo, riappare salendo ────── */
  const nav = document.getElementById('nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (nav) nav.classList.toggle('nav-hidden', y > 420 && y > lastY && Math.abs(y - lastY) > 4);
    lastY = y;
  }, { passive: true });

  if (reduced) return;

  /* ── Cursore custom (dot + anello con inerzia) ──────────────── */
  if (fine) {
    const dot  = document.createElement('div'); dot.className  = 'cur-dot';
    const ring = document.createElement('div'); ring.className = 'cur-ring';
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my, sc = 1, cs = 1;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
      sc = e.target.closest('a,button,.work-toggle,.svc-toggle,input,select,textarea') ? 2.1 : 1;
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * .15; ry += (my - ry) * .15; cs += (sc - cs) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px) scale(${cs.toFixed(3)})`;
      requestAnimationFrame(loop);
    })();
  }

  /* ── Tilt 3D sulle card al passaggio del mouse ──────────────── */
  const TILT = [
    '.sec-card', '.extra-card', '.promise-item', '.mat-card', '.team-card',
    '.vm-card', '.app-card', '.chi-img', '.svc-side-img', '.work-img-wrap',
    '.proj-media .main-img', '.storia-img-wrap'
  ].join(',');
  if (fine) document.querySelectorAll(TILT).forEach(el => {
    let raf = null;
    el.addEventListener('mousemove', e => {
      if (!desktop()) return;
      const r  = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - .5;
      const py = (e.clientY - r.top)  / r.height - .5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transition = 'transform .1s linear';
        el.style.transform  =
          `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-3px) scale(1.015)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = 'transform .55s cubic-bezier(.2,.6,.2,1)';
      el.style.transform  = '';
    });
  });

  /* ── Bottoni magnetici ───────────────────────────────────────── */
  if (fine) document.querySelectorAll('.blob-cta,.nav-cta,.btn,.submit,.btn-solid,.btn-ghost').forEach(el => {
    el.addEventListener('mousemove', e => {
      if (!desktop()) return;
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      el.style.translate = `${(dx * .18).toFixed(1)}px ${(dy * .26).toFixed(1)}px`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'translate .5s cubic-bezier(.2,.6,.2,1)';
      el.style.translate  = '0px 0px';
      setTimeout(() => { el.style.transition = ''; }, 520);
    });
  });

  /* ── Parallax su scroll ──────────────────────────────────────── */
  // [selettore, velocità, modalità, scala-compensazione]
  // 'hero' = deriva legata a scrollY (contenuto hero che resta indietro)
  // 'mid'  = offset rispetto al centro viewport (immagini dentro card)
  const PRLX = [
    ['#hero > div', .16, 'hero', 1],
    ['.page-hero > div',           .13, 'hero', 1],
    ['.chi-img-inner',            -.09, 'mid',  1.18],
    ['.storia-img',               -.05, 'mid',  1.1],
    ['.vm-img',                   -.06, 'mid',  1.14],
    ['.mat-img',                  -.06, 'mid',  1.14],
    ['.team-photo',               -.05, 'mid',  1.12],
  ];
  const items = [];
  PRLX.forEach(([sel, speed, mode, scale]) =>
    document.querySelectorAll(sel).forEach(el => items.push({ el, speed, mode, scale })));
  let ticking = false;
  function parallax() {
    ticking = false;
    const vh = innerHeight;
    items.forEach(p => {
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) return;
      const off = p.mode === 'hero'
        ? scrollY * p.speed
        : (r.top + r.height / 2 - vh / 2) * p.speed;
      p.el.style.transform =
        `translate3d(0, ${off.toFixed(1)}px, 0)` + (p.scale !== 1 ? ` scale(${p.scale})` : '');
    });
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  parallax();
})();
