// api/chat.js — Vercel Serverless Function (ESM)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" })

  try {
    const body = req.body || {}
    const query = body.query

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "A valid query string is required." })
    }

    const apiKey = process.env.OPENROUTER_KEY
    if (!apiKey) {
      return res.status(500).json({ error: "OPENROUTER_KEY not set in Vercel environment variables." })
    }

    const SYSTEM_INSTRUCTIONS = `You are NexaBot, the AI assistant for NexaFlow — a premium web & AI agency run by Shubham Goyal.

STRICT RULES:
1. ONLY discuss NexaFlow services. Politely decline off-topic questions and redirect to NexaFlow.
2. Explain the 4-step process: Discovery Call → Strategy & Design → Rapid Build (5-14 days) → Launch & Grow.
3. Services: Custom Websites (₹15,000), AI Agents & Chatbots (₹40,000), Automations (₹40,000+), E-commerce (custom).
4. End every reply by inviting the client to WhatsApp (+91 90506 56846) or the contact form.
5. Keep replies to 2-3 sentences. Be warm and concise. Never mention competitors.`

    const payload = JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: query }
      ]
    })

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "HTTP-Referer": "https://nexaflow-vert.vercel.app",
        "X-Title": "NexaFlow Agency Bot",
        "Content-Type": "application/json"
      },
      body: payload
    })

    const rawText = await openRouterRes.text()

    if (!openRouterRes.ok) {
      return res.status(500).json({
        error: "OpenRouter API error: " + openRouterRes.status,
        detail: rawText.substring(0, 300)
      })
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseErr) {
      return res.status(500).json({ error: "Failed to parse OpenRouter response", raw: rawText.substring(0, 300) })
    }

    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return res.status(500).json({ error: "Empty content from OpenRouter", raw: rawText.substring(0, 300) })
    }

    return res.status(200).json({ content })

  } catch (err) {
    return res.status(500).json({ error: "Unhandled server error: " + (err.message || String(err)) })
  }
}
