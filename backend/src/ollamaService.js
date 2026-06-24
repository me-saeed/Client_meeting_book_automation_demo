import 'dotenv/config'

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '')
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b'
const SUMMARY_MAX_CHARS = 3_000
const QA_MAX_CHARS = 3_000
const MAX_HISTORY_MESSAGES = 6
const OLLAMA_TIMEOUT_MS = 300_000

function truncateForPrompt(text, maxChars) {
  if (text.length <= maxChars) return text
  return (
    text.slice(0, maxChars) +
    '\n\n[... document truncated for model context limit ...]'
  )
}

function trimHistory(history) {
  return history.slice(-MAX_HISTORY_MESSAGES)
}

export async function checkOllamaHealth() {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
  if (!response.ok) throw new Error(`Ollama returned ${response.status}`)
  return response.json()
}

export async function chatCompletion(messages) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.3,
          num_ctx: 4096,
        },
      }),
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Ollama request timed out. Try a smaller PDF or a faster model.')
    }
    throw new Error(
      `Cannot reach Ollama at ${OLLAMA_BASE_URL}. Make sure Ollama is running.`,
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Ollama returned ${response.status}`)
  }

  const data = await response.json()
  return (data.message?.content || '').trim()
}

export function buildSummaryMessages(documentText, filename) {
  return [
    {
      role: 'system',
      content:
        'You are a helpful document analyst. Summarize PDF documents clearly and accurately. Use markdown with headings and bullet points.',
    },
    {
      role: 'user',
      content: `Summarize this PDF titled '${filename}'. Include the main topic, key points, and conclusions.\n\n${truncateForPrompt(documentText, SUMMARY_MAX_CHARS)}`,
    },
  ]
}

export function buildQaMessages(documentText, filename, question, history) {
  return [
    {
      role: 'system',
      content: `Answer questions about '${filename}' using only the document below. If the answer is not in the document, say so.`,
    },
    {
      role: 'user',
      content: `Document:\n${truncateForPrompt(documentText, QA_MAX_CHARS)}`,
    },
    ...trimHistory(history),
    { role: 'user', content: question },
  ]
}
