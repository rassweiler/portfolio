/*
  Home-page section highlight (project-level replacement).

  The toha theme relies on Bootstrap 5's body ScrollSpy
  (layouts/index.html: <body data-bs-spy="scroll" data-bs-target="#top-navbar">)
  to highlight the "current" home-section link. That mechanism highlights a
  link as soon as *any part* of its section overlaps the top viewport band, so
  one section can be highlighted while another section is what fills the
  viewport (theme issue hugo-themes/toha#1009, still unfixed upstream).

  This script re-runs highlighting on every scroll tick using the classic
  scroll-spy rule: the current section is the last one (in page order) whose
  header has passed a line ~navbar-height below the top of the viewport.
  Tracked sections = every `a.nav-link` in #top-navbar with a resolvable
  #href (Home included: #home resolves to the hero div, which is outside the
  .section-holder loop and is measured as itself). The footer is not tracked.
  A section without a nav link (e.g. Recent Posts, showOnNavbar: false)
  never activates a link -- the highlight holds on the previous section
  while it is in view, which is the right reading of "where am I?".
*/
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('top-navbar')
  if (!navbar) return

  /* The theme's Bootstrap body-ScrollSpy initializes from the
     data-bs-spy="scroll" attribute on <body> at window-load time, and
     would keep writing its own (buggy) .active marks on top of ours.
     Strip the attribute now (before load) so its data-API init finds
     nothing and never starts. This script owns the highlighting. */
  document.body.removeAttribute('data-bs-spy')

  const sections = [] // { link, el, top } in page order
  for (const link of navbar.querySelectorAll('a.nav-link')) {
    if (!link.hash) continue
    let el = document.querySelector(link.hash)
    if (!el) continue
    /* Anchor clicks land on the first element with that id, which for some
       sections is a thin <span> inside the section title. Track the whole
       section instead. */
    el = el.closest('.section-holder') || el
    sections.push({ link: link, el: el })
  }
  if (sections.length === 0) return
  sections.sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top)

  const clear = () => {
    navbar.querySelectorAll('a.nav-link.active').forEach(a => a.classList.remove('active'))
  }

  let pending = false
  const update = () => {
    pending = false
    /* Reference line, in page coordinates: a bit below the fixed navbar so
       the newly-arrived header is already out from under it when the
       highlight flips. */
    const line = window.scrollY + navbar.offsetHeight + 20
    let current = null
    for (const s of sections) {
      const top = s.el.getBoundingClientRect().top + window.scrollY
      if (top <= line) current = s // sections sorted by page position
      else break
    }
    clear()
    if (current) current.link.classList.add('active')
  }

  const schedule = () => {
    if (!pending) {
      pending = true
      window.requestAnimationFrame(update)
    }
  }

  /* Also update on layout shifts (images loading, etc.) without scrolling. */
  const io = new IntersectionObserver(schedule, { threshold: [0, 0.5, 1] })
  for (const { el } of sections) io.observe(el)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })

  update()
})
