// api/chat.js — Vercel Serverless Function (CommonJS)

module.exports = async function handler(req, res) {
  // Allow CORS for local dev and production
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
    console.error("[NexaBot] OPENROUTER_KEY is not set in Vercel Environment Variables!")
    return res.status(500).json({
      error: "AI service is not configured. Please set OPENROUTER_KEY in Vercel project settings."
    })
  }

  const SYSTEM_INSTRUCTIONS = `You are NexaBot, Shubham Goyal's premium AI Agency Assistant for NexaFlow agency.

CRITICAL RULES:
1. ONLY discuss NexaFlow agency and Shubham Goyal's services. Politely refuse all unrelated questions and redirect back to NexaFlow.
2. Teach clients how NexaFlow works — the 4-step rapid process:
   - Step 1: Free Discovery Call (30-min call to understand their business goals, no commitment).
   - Step 2: Strategy & Design (custom plan and wireframe drafted within 48 hours).
   - Step 3: Rapid Development (built in 5–14 days using modern frameworks like Vite + Tailwind CSS).
   - Step 4: Launch & Grow (ongoing support, performance monitoring, and tech partnership).
3. NexaFlow services and starting prices:
   - Custom Websites: ₹15,000 (7-day delivery)
   - AI Agents & Chatbots: ₹40,000
   - Business Automations (Make.com, Zapier, custom): ₹40,000+
   - E-commerce Stores: Custom quote
4. Always end responses by encouraging the client to book a free 30-minute audit on WhatsApp (+91 90506 56846) or via the contact form.
5. Keep all replies within 2–3 sentences. Be professional, warm, and concise. Never hallucinate facts or mention competitors.`

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
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTIONS },
          { role: "user",   content: query }
        ]
      })
    })

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text()
      console.error(`[NexaBot] OpenRouter error ${openRouterRes.status}:`, errText)
      throw new Error(`OpenRouter responded with status ${openRouterRes.status}: ${errText}`)
    }

    const data = await openRouterRes.json()
    const content = data?.choices?.[0]?.message?.content?.trim()

    if (!content) {
      console.error("[NexaBot] Empty content from OpenRouter. Full response:", JSON.stringify(data))
      throw new Error("OpenRouter returned an empty response.")
    }

    return res.status(200).json({ content })

  } catch (error) {
    console.error("[NexaBot] Fatal error in serverless handler:", error.message)
    return res.status(500).json({ error: error.message || "Unexpected server error." })
  }
}
