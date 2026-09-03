/* ============================================================
   Scroll progress, staggered reveals, animated stat counters.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- hero entrance (runs immediately on load) ----------
  document.querySelectorAll(".hero .reveal-up").forEach((el) => {
    el.classList.add("is-visible");
  });

  // ---------- scroll progress bar ----------
  const progressBar = document.getElementById("progressBar");
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ---------- GSAP setup ----------
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // section reveals
    gsap.utils.toArray(".reveal").forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => el.classList.add("is-visible"),
      });
    });

    // stat counters
    gsap.utils.toArray(".stat__num").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const decimals = parseInt(el.getAttribute("data-decimal") || "0", 10);
      const counter = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: reduceMotion ? 0.01 : 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = counter.val.toFixed(decimals) + suffix;
            },
          });
        },
      });
    });

    // subtle project-card lift already handled in CSS; add a light
    // parallax to the case-study block for depth
    gsap.to(".case-study", {
      y: -14,
      ease: "none",
      scrollTrigger: {
        trigger: ".case-study",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  } else {
    // fallback: reveal everything immediately if GSAP failed to load
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".stat__num").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const decimals = parseInt(el.getAttribute("data-decimal") || "0", 10);
      el.textContent = target.toFixed(decimals) + suffix;
    });
  }

  // ---------- smooth-scroll nav links ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
});
