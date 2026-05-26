// api/chat.js — Vercel Serverless Function (ESM — compatible with "type": "module")

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const { query } = req.body || {}
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "A valid query string is required." })
  }

  const apiKey = process.env.OPENROUTER_KEY
  if (!apiKey) {
    console.error("[NexaBot] OPENROUTER_KEY is missing from Vercel environment variables.")
    return res.status(500).json({ error: "AI service not configured — OPENROUTER_KEY missing." })
  }

  const SYSTEM_INSTRUCTIONS = `You are NexaBot, the AI assistant for NexaFlow — a premium web & AI agency run by Shubham Goyal.

STRICT RULES:
1. ONLY discuss NexaFlow services. Politely decline all off-topic questions and redirect to NexaFlow.
2. Explain NexaFlow's 4-step process:
   - Step 1: Free Discovery Call (30 min, no commitment)
   - Step 2: Strategy & Design (custom plan + wireframe in 48 hours)
   - Step 3: Rapid Development (delivered in 5–14 days using Vite + Tailwind)
   - Step 4: Launch & Grow (ongoing support, tracking, tech partnership)
3. Services & starting prices:
   - Custom Websites: ₹15,000 (7-day delivery)
   - AI Agents & Chatbots: ₹40,000
   - Business Automations: ₹40,000+
   - E-commerce Stores: Custom quote
4. End every response by inviting the client to book a free audit on WhatsApp (+91 90506 56846) or via the contact form.
5. Keep replies to 2–3 sentences. Be warm, professional, concise. Never mention competitors.`

  try {
    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://nexaflow-vert.vercel.app",
        "X-Title": "NexaFlow Agency Bot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTIONS },
          { role: "user",   content: query }
        ]
      })
    })

    const responseText = await openRouterRes.text()
    console.log(`[NexaBot] OpenRouter status: ${openRouterRes.status}`)
    console.log(`[NexaBot] OpenRouter raw response: ${responseText.substring(0, 500)}`)

    if (!openRouterRes.ok) {
      throw new Error(`OpenRouter error ${openRouterRes.status}: ${responseText}`)
    }

    const data = JSON.parse(responseText)
    const content = data?.choices?.[0]?.message?.content?.trim()

    if (!content) {
      throw new Error(`Empty content from OpenRouter. Full response: ${responseText}`)
    }

    return res.status(200).json({ content })

  } catch (error) {
    console.error("[NexaBot] Error:", error.message)
    return res.status(500).json({ error: error.message })
  }
}
