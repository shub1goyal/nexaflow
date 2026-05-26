// api/test.js — Minimal diagnostic endpoint
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    method: req.method,
    bodyType: typeof req.body,
    body: req.body,
    version: "v7"
  })
}
