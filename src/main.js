// ============================================================
// NexaFlow — main.js
// ============================================================
import './style.css'

// ---- Particle Canvas -----------------------------------------------
;(function initParticles() {
  const canvas = document.getElementById('canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let particles = []

  function resize() {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  class Particle {
    constructor() { this.reset() }
    reset() {
      this.x     = Math.random() * canvas.width
      this.y     = Math.random() * canvas.height
      this.vx    = (Math.random() - 0.5) * 0.3
      this.vy    = (Math.random() - 0.5) * 0.3
      this.r     = Math.random() * 1.2 + 0.3
      this.alpha = Math.random() * 0.4 + 0.1
    }
    update() {
      this.x += this.vx
      this.y += this.vy
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height)
        this.reset()
    }
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(168,85,247,${this.alpha})`
      ctx.fill()
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle())

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x
        const dy   = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(168,85,247,${0.08 * (1 - dist / 120)})`
          ctx.lineWidth   = 0.5
          ctx.stroke()
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => { p.update(); p.draw() })
    drawLines()
    requestAnimationFrame(animate)
  }
  animate()
})()

// ---- Parallax Grid -------------------------------------------------
document.addEventListener('mousemove', e => {
  const grid = document.querySelector('.bg-dot-grid')
  if (!grid) return
  const x = (e.clientX / window.innerWidth  - 0.5) * 15
  const y = (e.clientY / window.innerHeight - 0.5) * 15
  grid.style.transform = `translate(${x}px, ${y}px)`
})

// ---- Navbar Scroll -------------------------------------------------
const navbar = document.getElementById('navbar')
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60)
})

// ---- Mobile Menu ---------------------------------------------------
const menuToggle = document.getElementById('menu-toggle')
const mobileMenu = document.getElementById('mobile-menu')

menuToggle?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open')
})
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'))
})

// ---- Scroll Reveal -------------------------------------------------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
    }
  })
}, { threshold: 0.15 })

document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el))

// ---- Stat Count-Up -------------------------------------------------
function animateCount(el) {
  if (el.dataset.animated) return
  el.dataset.animated = 'true'
  const target   = parseInt(el.dataset.target)
  const suffix   = el.dataset.suffix || '+'
  const duration = 1800
  const step     = target / (duration / 16)
  let current    = 0
  const timer    = setInterval(() => {
    current = Math.min(current + step, target)
    el.textContent = Math.round(current) + suffix
    if (current >= target) clearInterval(timer)
  }, 16)
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(animateCount)
    }
  })
}, { threshold: 0.3 })

document.querySelectorAll('[data-target]').forEach(el => {
  const section = el.closest('section') || el.parentElement
  if (section) statObserver.observe(section)
})

// ---- Active Nav Highlight ------------------------------------------
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.nav-link')

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => (l.style.color = ''))
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`)
      if (active) active.style.color = '#a855f7'
    }
  })
}, { threshold: 0.5 })

sections.forEach(s => navObserver.observe(s))

// ---- Contact Form → WhatsApp ---------------------------------------
const WA_NUMBER = '919050656846'

const SERVICE_LABELS = {
  'website':    'Custom Website',
  'ai-agent':   'AI Agent',
  'automation': 'Business Automation',
  'ecommerce':  'E-commerce Store',
  'chatbot':    'Chatbot & Support AI',
  'creator':    'Content Creator Tools',
  'full':       'Full Digital Stack',
  '':           'Not specified',
}

window.handleFormSubmit = function handleFormSubmit(e) {
  e.preventDefault()

  const btn  = document.getElementById('submit-btn')
  const text = document.getElementById('submit-text')
  const icon = document.getElementById('submit-icon')

  // Read form values
  const name    = document.getElementById('name').value.trim()
  const phone   = document.getElementById('phone').value.trim()
  const email   = document.getElementById('email').value.trim()
  const service = document.getElementById('service').value
  const message = document.getElementById('message').value.trim()

  // Build clean WhatsApp message — NO emoji to avoid encoding issues
  // WhatsApp markdown: *bold*, _italic_, ~strikethrough~
  const waMsg = [
    '*[NexaFlow] New Enquiry*',
    '',
    `*Name:*    ${name}`,
    `*Email:*   ${email}`,
    `*Phone:*   ${phone || 'Not provided'}`,
    `*Service:* ${SERVICE_LABELS[service] ?? service}`,
    '',
    '*Message:*',
    message,
    '',
    '---',
    '_Sent via NexaFlow.ai contact form_',
  ].join('\n')

  // Update button state
  btn.disabled      = true
  text.textContent  = 'Opening WhatsApp...'
  icon.textContent  = 'chat'

  setTimeout(() => {
    // Show success UI
    document.getElementById('contact-form').classList.add('hidden')
    document.getElementById('form-success').classList.remove('hidden')

    // Open WhatsApp — encodeURIComponent handles all special chars safely
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, 800)
}
