import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import handler from './chat.js'

const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_OPENROUTER_KEY = process.env.OPENROUTER_KEY
const ORIGINAL_OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  restoreEnv('OPENROUTER_KEY', ORIGINAL_OPENROUTER_KEY)
  restoreEnv('OPENROUTER_API_KEY', ORIGINAL_OPENROUTER_API_KEY)
})

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

async function invoke(body) {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
    end() {
      return this
    },
  }

  await handler({ method: 'POST', body }, res)
  return res
}

function assertNexaFlowReply(content) {
  assert.match(content, /NexaFlow/)
  assert.match(content, /Shubham Goyal/)
  assert.match(content, /https:\/\/nexaflow-vert\.vercel\.app\//)
}

test('returns a stored NexaFlow fallback when the OpenRouter key is missing', async () => {
  delete process.env.OPENROUTER_KEY
  delete process.env.OPENROUTER_API_KEY
  globalThis.fetch = async () => {
    throw new Error('fetch should not be called without a key')
  }

  const res = await invoke({ query: 'What does NexaFlow build?' })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.fallback, true)
  assertNexaFlowReply(res.body.content)
})

test('returns a stored NexaFlow fallback when OpenRouter is rate limited', async () => {
  process.env.OPENROUTER_KEY = 'test-key'
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: { message: 'rate limited' } }),
    { status: 429, headers: { 'Content-Type': 'application/json' } },
  )

  const res = await invoke({ query: 'How much does a chatbot cost?' })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.fallback, true)
  assertNexaFlowReply(res.body.content)
})

test('returns a stored NexaFlow fallback when the OpenRouter model is unavailable', async () => {
  process.env.OPENROUTER_KEY = 'test-key'
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: { message: 'No endpoints found' } }),
    { status: 404, headers: { 'Content-Type': 'application/json' } },
  )

  const res = await invoke({ query: 'What does NexaFlow build?' })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.fallback, true)
  assert.equal(res.body.reason, 'openrouter_unavailable')
  assertNexaFlowReply(res.body.content)
})

test('normalizes successful AI answers with NexaFlow owner and site details', async () => {
  process.env.OPENROUTER_KEY = 'test-key'
  globalThis.fetch = async () => new Response(
    JSON.stringify({
      choices: [{ message: { content: 'We build conversion-focused websites and AI automations.' } }],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )

  const res = await invoke({ query: 'What do you build?' })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.fallback, undefined)
  assertNexaFlowReply(res.body.content)
})

test('uses a current OpenRouter free model by default', async () => {
  process.env.OPENROUTER_KEY = 'test-key'
  let requestedModel
  globalThis.fetch = async (_url, init) => {
    requestedModel = JSON.parse(init.body).model
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: 'NexaFlow by Shubham Goyal can help. https://nexaflow-vert.vercel.app/' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const res = await invoke({ query: 'What do you build?' })

  assert.equal(res.statusCode, 200)
  assert.equal(requestedModel, 'openai/gpt-oss-20b:free')
  assert.notEqual(requestedModel, 'mistralai/mistral-7b-instruct:free')
})
