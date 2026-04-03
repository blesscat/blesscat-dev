// Count-up animation for .count-up elements
function animateCountUp(el: HTMLElement) {
  const target = parseFloat(el.dataset.target || '0')
  const decimals = parseInt(el.dataset.decimals || '0')
  const suffix = el.dataset.suffix || ''
  const duration = 1100
  const start = performance.now()
  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.textContent = (target * ease).toFixed(decimals) + suffix
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const counters = document.querySelectorAll<HTMLElement>('.count-up')
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCountUp(entry.target as HTMLElement)
      io.unobserve(entry.target)
    }
  })
}, { threshold: 0.4 })
counters.forEach(el => io.observe(el))
