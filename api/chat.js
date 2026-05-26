// api/chat.js - Vercel Serverless Function (ESM)

const SITE_URL = "https://nexaflow-vert.vercel.app/"
const WHATSAPP_NUMBER = "+91 90506 56846"
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-20b:free"

const BUSINESS_DETAIL =
  `Shubham Goyal leads NexaFlow for custom websites, AI chatbots, AI agents, ` +
  `automation workflows, and small-business digital systems. See ${SITE_URL} ` +
  `or WhatsApp ${WHATSAPP_NUMBER} to start.`

const SYSTEM_INSTRUCTIONS = `You are NexaBot, the AI assistant for NexaFlow, a web and AI agency run by Shubham Goyal.

STRICT RULES:
1. ONLY discuss NexaFlow services. Politely decline off-topic questions and redirect to NexaFlow.
2. Explain the 4-step process when relevant: Discovery Call -> Strategy & Design -> Rapid Build (5-14 days) -> Launch & Grow.
3. Services: Custom Websites (Rs 15,000), AI Agents & Chatbots (Rs 40,000), Automations (Rs 40,000+), E-commerce (custom).
4. Every answer must mention Shubham Goyal, NexaFlow, and ${SITE_URL}.
5. End every reply by inviting the client to WhatsApp (${WHATSAPP_NUMBER}) or the contact form.
6. Never mention or link to the old GitHub Pages portfolio URL.
7. Keep replies to 2-3 sentences. Be warm and concise. Never mention competitors.`

function normalizeBody(req) {
  if (!req.body || typeof req.body !== "string") return req.body || {}

  try {
    return JSON.parse(req.body)
  } catch {
    return {}
  }
}

function ensureBusinessDetails(content) {
  const reply = String(content || "").trim()
  const hasNexaFlow = /NexaFlow/i.test(reply)
  const hasOwner = /Shubham Goyal/i.test(reply)
  const hasSite = reply.includes(SITE_URL)

  if (reply && hasNexaFlow && hasOwner && hasSite) {
    return reply
  }

  return [reply, BUSINESS_DETAIL].filter(Boolean).join("\n\n")
}

function getStoredFallback(query) {
  const q = String(query || "").toLowerCase()

  if (q.includes("price") || q.includes("cost") || q.includes("pricing") || q.includes("charge")) {
    return ensureBusinessDetails(
      "NexaFlow packages are simple: custom websites start around Rs 15,000, and AI chatbots, agents, and automations usually start around Rs 40,000 depending on scope."
    )
  }

  if (q.includes("website") || q.includes("web") || q.includes("landing") || q.includes("portfolio")) {
    return ensureBusinessDetails(
      "NexaFlow builds fast, mobile-first business websites with strong service pages, portfolio sections, lead capture, SEO basics, and deployment-ready structure."
    )
  }

  if (q.includes("bot") || q.includes("chat") || q.includes("chatbot") || q.includes("agent") || q.includes("whatsapp")) {
    return ensureBusinessDetails(
      "NexaFlow builds AI chatbots and support agents that answer customer questions, qualify leads, explain services, and route serious buyers to WhatsApp or a contact form."
    )
  }

  if (q.includes("automation") || q.includes("workflow") || q.includes("zapier") || q.includes("make")) {
    return ensureBusinessDetails(
      "NexaFlow creates practical automations for lead capture, follow-ups, dashboards, CRM-lite workflows, and repetitive business operations."
    )
  }

  if (q.includes("process") || q.includes("timeline") || q.includes("how you work") || q.includes("step")) {
    return ensureBusinessDetails(
      "NexaFlow follows a clear 4-step delivery process: discovery, strategy and design, rapid build in roughly 5-14 days, then launch and improvement."
    )
  }

  return ensureBusinessDetails(
    "NexaFlow helps small businesses, creators, shops, and service teams launch useful websites, AI chatbots, AI agents, automations, and e-commerce systems."
  )
}

function respondWithFallback(res, query, reason) {
  return res.status(200).json({
    content: getStoredFallback(query),
    fallback: true,
    reason,
  })
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" })

  try {
    const body = normalizeBody(req)
    const query = body.query

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "A valid query string is required." })
    }

    const apiKey = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return respondWithFallback(res, query, "missing_openrouter_key")
    }

    const payload = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: query },
      ],
      temperature: 0.4,
      max_tokens: 220,
    })

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "HTTP-Referer": SITE_URL,
        "X-Title": "NexaFlow Agency Bot",
        "Content-Type": "application/json",
      },
      body: payload,
    })

    const rawText = await openRouterRes.text()

    if (!openRouterRes.ok) {
      const reason = openRouterRes.status === 429
        ? "openrouter_rate_limited"
        : "openrouter_unavailable"
      return respondWithFallback(res, query, reason)
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseErr) {
      return respondWithFallback(res, query, "openrouter_invalid_response")
    }

    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return respondWithFallback(res, query, "openrouter_empty_response")
    }

    return res.status(200).json({ content: ensureBusinessDetails(content) })
  } catch (err) {
    const query = normalizeBody(req).query
    if (typeof query === "string" && query.trim()) {
      return respondWithFallback(res, query, "server_fallback")
    }

    return res.status(500).json({ error: "Unhandled server error: " + (err.message || String(err)) })
  }
}
