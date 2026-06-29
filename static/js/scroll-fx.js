// Scroll "focus" effect: elements tagged .scroll-scale gently grow as their
// centre approaches the centre of the viewport and shrink as they move away,
// giving the page a top-to-bottom reading rhythm. Cheap (rAF-throttled,
// transform-only) and disabled when the user prefers reduced motion.
document.addEventListener('DOMContentLoaded', function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = Array.from(document.querySelectorAll('.scroll-scale'));
  if (!els.length) return;

  // Peak enlargement at the viewport centre (and equal shrink at the edges).
  // Shared constant — reuse for every element tagged .scroll-scale so the
  // motion stays consistent across the page. ~3x smaller than the first pass.
  const SCROLL_SCALE_GROWTH = 0.017;

  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const center = vh / 2;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue; // skip off-screen
      const elCenter = r.top + r.height / 2;
      const t = Math.min(Math.abs(elCenter - center) / center, 1); // 0 centred → 1 at edge
      // 1 + GROWTH at centre, 1 at the half-way point, 1 - GROWTH at the edges
      const scale = 1 + SCROLL_SCALE_GROWTH * (1 - 2 * t);
      el.style.transform = 'scale(' + scale.toFixed(4) + ')';
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
});
