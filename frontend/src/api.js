const API_BASE = '/api'

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

export async function uploadPdf(file) {
  const formData = new FormData()
  formData.append('file', file)

  let response
  try {
    response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error(
      'Upload failed: could not reach the server. Make sure the backend is running on port 8000.',
    )
  }

  return parseResponse(response, 'Upload failed')
}

export async function sendMessage(sessionId, message) {
  let response
  try {
    response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message }),
    })
  } catch {
    throw new Error('Chat request failed: could not reach the server.')
  }

  return parseResponse(response, 'Chat request failed')
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return response.json()
}
