(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("top-navbar");
    if (!navbar) return;
    document.body.removeAttribute("data-bs-spy");
    const sections = [];
    for (const link of navbar.querySelectorAll("a.nav-link")) {
      if (!link.hash) continue;
      let el = document.querySelector(link.hash);
      if (!el) continue;
      el = el.closest(".section-holder") || el;
      sections.push({ link, el });
    }
    if (sections.length === 0) return;
    sections.sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
    const clear = () => {
      navbar.querySelectorAll("a.nav-link.active").forEach((a) => a.classList.remove("active"));
    };
    let pending = false;
    const update = () => {
      pending = false;
      const line = window.scrollY + navbar.offsetHeight + 20;
      let current = null;
      for (const s of sections) {
        const top = s.el.getBoundingClientRect().top + window.scrollY;
        if (top <= line) current = s;
        else break;
      }
      clear();
      if (current) current.link.classList.add("active");
    };
    const schedule = () => {
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(update);
      }
    };
    const io = new IntersectionObserver(schedule, { threshold: [0, 0.5, 1] });
    for (const { el } of sections) io.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
  });
})();
