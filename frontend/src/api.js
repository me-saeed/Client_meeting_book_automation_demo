const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function parseErrorDetail(data, fallback) {
  if (!data?.detail) return fallback
  return Array.isArray(data.detail) ? data.detail[0]?.msg || fallback : data.detail
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(parseErrorDetail(data, fallbackMessage))
  }
  return data
}

async function apiFetch(path, options, fallbackMessage) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error(
      `${fallbackMessage}: could not reach the backend at ${API_BASE}. Is it running on port 8000?`,
    )
  }
  return parseResponse(response, fallbackMessage)
}

export async function uploadPdf(file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch(
    '/upload',
    { method: 'POST', body: formData },
    'Upload failed',
  )
}

export async function summarizePdf(sessionId) {
  return apiFetch(
    '/summarize',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    },
    'Summary failed',
  )
}

export async function sendMessage(sessionId, message) {
  return apiFetch(
    '/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message }),
    },
    'Chat request failed',
  )
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return response.json()
}
