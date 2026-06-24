const sessions = new Map()

export function createSession(sessionId, data) {
  sessions.set(sessionId, data)
  return data
}

export function getSession(sessionId) {
  return sessions.get(sessionId)
}

export function hasSession(sessionId) {
  return sessions.has(sessionId)
}

export function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId)
  if (!session) return null

  Object.assign(session, updates)
  return session
}
