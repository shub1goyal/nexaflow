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
    '*[Shubham Goyal — Freelancer] New Enquiry*',
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
    '_Sent via contact form_',
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

// ---- Live OpenRouter AI Agent Chat Drawer ---------------------------
window.toggleAgentDrawer = function toggleAgentDrawer(isOpen) {
  const drawer = document.getElementById('agent-drawer')
  if (!drawer) return
  if (isOpen) {
    drawer.classList.remove('translate-x-full')
    document.getElementById('agent-input')?.focus()
  } else {
    drawer.classList.add('translate-x-full')
  }
}

window.handleAgentSubmit = async function handleAgentSubmit(e) {
  e.preventDefault()
  
  const inputEl = document.getElementById('agent-input')
  const messagesContainer = document.getElementById('agent-messages')
  const loadingEl = document.getElementById('agent-loading')
  if (!inputEl || !messagesContainer || !loadingEl) return

  const userQuery = inputEl.value.trim()
  if (!userQuery) return
  
  // Clear input
  inputEl.value = ''

  // Append user message
  appendMessage('user', userQuery)
  
  // Show loading indicator
  loadingEl.classList.remove('hidden')
  messagesContainer.scrollTop = messagesContainer.scrollHeight

  try {
    const responseText = await callOpenRouterAPI(userQuery)
    loadingEl.classList.add('hidden')
    appendMessage('ai', responseText)
  } catch (error) {
    console.warn("OpenRouter API error, falling back to simulator:", error)
    loadingEl.classList.add('hidden')
    
    // Switch to highly realistic fallback simulation
    const simulatedReply = getSimulatedAgentReply(userQuery)
    appendMessage('ai', simulatedReply)
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('agent-messages')
  if (!container) return
  
  const msgWrapper = document.createElement('div')
  msgWrapper.className = 'flex gap-3 items-start ' + (role === 'user' ? 'justify-end max-w-[85%] ml-auto' : 'max-w-[85%]')

  const innerHTML = role === 'user' 
    ? `
      <div class="p-3.5 rounded-2xl rounded-tr-none bg-primary/10 border border-primary/20 text-xs text-on-surface leading-relaxed font-sans">
        ${text}
      </div>
      <div class="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
        <span class="material-symbols-outlined text-primary text-xs select-none">person</span>
      </div>
    `
    : `
      <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/25">
        <span class="material-symbols-outlined text-primary text-xs select-none">smart_toy</span>
      </div>
      <div class="p-3.5 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-xs text-on-surface-muted leading-relaxed font-sans">
        ${text}
      </div>
    `

  msgWrapper.innerHTML = innerHTML
  container.appendChild(msgWrapper)
  
  // Smooth scroll to bottom
  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  })
}

async function callOpenRouterAPI(query) {
  const API_URL = "/api/chat"
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Server returned status ${response.status}`)
  }

  const data = await response.json()
  return data.content
}

function getSimulatedAgentReply(query) {
  const q = query.toLowerCase()
  
  if (q.includes('price') || q.includes('cost') || q.includes('pricing') || q.includes('charge')) {
    return "At NexaFlow, we have transparent, highly competitive packages: Custom Websites start at ₹15,000, and Growth/AI Automations start at ₹40,000. Let's schedule a free 30-min audit to outline a precise custom roadmap for your business!"
  }
  if (q.includes('website') || q.includes('web') || q.includes('custom website')) {
    return "NexaFlow builds blazing-fast, mobile-first websites using Vite + Tailwind CSS. Our starter site is ₹15,000, fully SEO-optimized, and built to convert visitors. We deploy in 5-14 days!"
  }
  if (q.includes('bot') || q.includes('chat') || q.includes('chatbot') || q.includes('whatsapp')) {
    return "NexaFlow designs custom WhatsApp Business API chatbots and smart web support agents. They qualify leads, handle bookings 24/7, and automatically sync data directly to your CRM."
  }
  if (q.includes('automation') || q.includes('make') || q.includes('zapier') || q.includes('workflow')) {
    return "NexaFlow builds automated pipelines using Make.com, Zapier, and custom serverless functions. We eliminate manual tasks, save clients 15+ hours a week, and integrate lead captures straight into Notion."
  }
  if (q.includes('work') || q.includes('process') || q.includes('how you work') || q.includes('step')) {
    return "NexaFlow works in a rapid 4-step process: 1. Free Discovery Call (discuss goals) ➔ 2. Strategy & Wireframe (within 48 hours) ➔ 3. Rapid Development (built in 5-14 days) ➔ 4. Launch & Grow (support & optimization). Fast and reliable!"
  }
  
  // Refuse general/unrelated queries
  if (q.includes('code') || q.includes('python') || q.includes('javascript') || q.includes('html') || q.includes('write') || q.includes('how to')) {
    return "I am pre-programmed to discuss NexaFlow agency and Shubham Goyal's professional development services only. If you'd like us to build a custom website, AI agent, or business automation for you, let's connect for a free audit!"
  }
  
  return "NexaFlow specializes in custom web builds, advanced AI agents, and workflow automations to help small businesses compete like enterprises. We work fast (launch in 5-14 days). Let's book a free 30-minute audit call via WhatsApp!"
}

