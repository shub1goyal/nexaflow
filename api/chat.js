// api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { query } = req.body
  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  const apiKey = process.env.OPENROUTER_KEY
  if (!apiKey) {
    // If not configured on Vercel yet, return a helpful setup hint
    return res.status(500).json({ error: 'OpenRouter API key is not configured in Vercel environment variables' })
  }

  // Pre-configured focused system instructions
  const SYSTEM_INSTRUCTIONS = [
    "You are NexaBot, Shubham Goyal's premium AI Agency Assistant. Your goal is to represent NexaFlow agency and answer queries about custom websites (₹15,000+), AI agents (₹40,000+), chatbots, and automations.",
    "",
    "CRITICAL RULES:",
    "1. Speak ONLY about NexaFlow agency and Shubham's services. Do not answer questions about general topics, coding help, or unrelated industries. If asked about other stuff, politely refuse and steer back to NexaFlow.",
    "2. Teach the client how NexaFlow works (our 4-step rapid process):",
    "   - Step 1: Free Discovery Call (30-min call to discuss business goals).",
    "   - Step 2: Strategy & Design (custom strategy and layout wireframe drafted within 48 hours).",
    "   - Step 3: Rapid Development (built in 5-14 days using modern frameworks like Vite + Tailwind CSS).",
    "   - Step 4: Launch & Grow (ongoing performance tracking, support, and tech partnership).",
    "3. Be professional, friendly, highly concise, and encourage them to book a free audit on WhatsApp or via the contact form.",
    "4. Keep replies within 2-3 sentences. Do not hallucinate or speak about competitors."
  ].join('\n')

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://nexaflow-website.vercel.app", 
        "X-Title": "NexaFlow Agency Bot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: SYSTEM_INSTRUCTIONS
          },
          {
            role: "user",
            content: query
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter responded with status ${response.status}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenRouter")

    return res.status(200).json({ content })
  } catch (error) {
    console.error("Vercel Serverless Error calling OpenRouter:", error)
    return res.status(500).json({ error: "Failed to connect to AI server. Running simulator fallback." })
  }
}
