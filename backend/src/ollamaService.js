import 'dotenv/config'

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '')
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b'
const SUMMARY_MAX_CHARS = 12_000
const QA_MAX_CHARS = 12_000
const OLLAMA_TIMEOUT_MS = 300_000

function truncateForPrompt(text, maxChars) {
  if (text.length <= maxChars) return text
  return (
    text.slice(0, maxChars) +
    '\n\n[... document truncated for model context limit ...]'
  )
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
          num_ctx: 8192,
        },
      }),
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Ollama request timed out. Try a smaller PDF or a faster model.')
    }
    throw err
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
        'You are a helpful document analyst. Summarize PDF documents clearly and accurately. Use markdown formatting with headings and bullet points when helpful.',
    },
    {
      role: 'user',
      content: `Summarize the following PDF document titled '${filename}'. Include: main topic, key points, and any notable conclusions.\n\n--- DOCUMENT START ---\n${truncateForPrompt(documentText, SUMMARY_MAX_CHARS)}\n--- DOCUMENT END ---`,
    },
  ]
}

export function buildQaMessages(documentText, filename, question, history) {
  const messages = [
    {
      role: 'system',
      content: `You answer questions about the PDF '${filename}' using only the provided document context. If the answer is not in the document, say you cannot find it in the PDF. Be concise and accurate.`,
    },
    {
      role: 'user',
      content: `Document context:\n--- DOCUMENT START ---\n${truncateForPrompt(documentText, QA_MAX_CHARS)}\n--- DOCUMENT END ---`,
    },
    {
      role: 'assistant',
      content: 'I have read the document and am ready to answer questions about it.',
    },
    ...history.map(({ role, content }) => ({ role, content })),
    { role: 'user', content: question },
  ]

  return messages
}
