import { v4 as uuidv4 } from 'uuid'

import { OLLAMA_MODEL, buildQaMessages, buildSummaryMessages, chatCompletion } from '../services/ollama.service.js'
import { extractTextFromPdf } from '../services/pdf.service.js'
import { createSession, getSession } from '../services/session.service.js'

export async function uploadPdf(req, res) {
  const file = req.file

  if (!file) {
    return res.status(400).json({ detail: 'No file uploaded.' })
  }

  if (!file.originalname.toLowerCase().endsWith('.pdf')) {
    return res.status(400).json({ detail: 'Only PDF files are supported.' })
  }

  const documentText = await extractTextFromPdf(file.buffer)
  const sessionId = uuidv4()

  createSession(sessionId, {
    filename: file.originalname,
    documentText,
    summary: null,
    history: [],
  })

  res.json({
    sessionId,
    filename: file.originalname,
    charCount: documentText.length,
  })
}

export async function summarizePdf(req, res) {
  const { sessionId } = req.body || {}
  const session = getSession(sessionId)

  if (!session) {
    return res.status(404).json({ detail: 'Session not found. Upload a PDF first.' })
  }

  if (session.summary) {
    return res.json({ summary: session.summary })
  }

  let summary
  try {
    summary = await chatCompletion(
      buildSummaryMessages(session.documentText, session.filename),
    )
  } catch (err) {
    return res.status(502).json({
      detail: `Ollama request failed. Is Ollama running with model '${OLLAMA_MODEL}'? ${err.message}`,
    })
  }

  session.summary = summary
  res.json({ summary })
}

export async function chat(req, res) {
  const { sessionId, message } = req.body || {}
  const session = getSession(sessionId)

  if (!session) {
    return res.status(404).json({ detail: 'Session not found. Upload a PDF first.' })
  }

  const question = (message || '').trim()
  if (!question) {
    return res.status(400).json({ detail: 'Message cannot be empty.' })
  }

  let reply
  try {
    reply = await chatCompletion(
      buildQaMessages(session.documentText, session.filename, question, session.history),
    )
  } catch (err) {
    return res.status(502).json({ detail: `Ollama request failed: ${err.message}` })
  }

  session.history.push({ role: 'user', content: question })
  session.history.push({ role: 'assistant', content: reply })

  res.json({ reply, role: 'assistant' })
}
