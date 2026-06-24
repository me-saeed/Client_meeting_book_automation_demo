import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

import {
  OLLAMA_MODEL,
  buildQaMessages,
  buildSummaryMessages,
  chatCompletion,
  checkOllamaHealth,
} from './ollamaService.js'
import { extractTextFromPdf } from './pdfService.js'

const app = express()
const PORT = process.env.PORT || 8000
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
})

const sessions = new Map()

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next()

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ detail: 'File exceeds 20 MB limit.' })
    }

    return res.status(400).json({ detail: err.message || 'Upload failed.' })
  })
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    const ollama = await checkOllamaHealth()
    const models = (ollama.models || []).map((m) => m.name)
    res.json({
      status: 'ok',
      ollama: 'connected',
      model: OLLAMA_MODEL,
      available_models: models,
    })
  } catch (err) {
    res.json({
      status: 'degraded',
      ollama: 'unreachable',
      model: OLLAMA_MODEL,
      error: err.message,
    })
  }
})

app.post(
  '/api/upload',
  handleUpload,
  asyncHandler(async (req, res) => {
    const file = req.file

    if (!file) {
      return res.status(400).json({ detail: 'No file uploaded.' })
    }

    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ detail: 'Only PDF files are supported.' })
    }

    const documentText = await extractTextFromPdf(file.buffer)
    const sessionId = uuidv4()

    sessions.set(sessionId, {
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
  }),
)

app.post(
  '/api/summarize',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body || {}
    const session = sessions.get(sessionId)

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
  }),
)

app.post(
  '/api/chat',
  asyncHandler(async (req, res) => {
    const { sessionId, message } = req.body || {}

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ detail: 'Session not found. Upload a PDF first.' })
    }

    const question = (message || '').trim()
    if (!question) {
      return res.status(400).json({ detail: 'Message cannot be empty.' })
    }

    const session = sessions.get(sessionId)

    let reply
    try {
      reply = await chatCompletion(
        buildQaMessages(
          session.documentText,
          session.filename,
          question,
          session.history,
        ),
      )
    } catch (err) {
      return res.status(502).json({ detail: `Ollama request failed: ${err.message}` })
    }

    session.history.push({ role: 'user', content: question })
    session.history.push({ role: 'assistant', content: reply })

    res.json({ reply, role: 'assistant' })
  }),
)

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  if (!res.headersSent) {
    res.status(500).json({ detail: err.message || 'Internal server error.' })
  }
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF Agent API running at http://localhost:${PORT}`)
  console.log(`Ollama model: ${OLLAMA_MODEL}`)
})

server.requestTimeout = 600_000
server.headersTimeout = 610_000
server.keepAliveTimeout = 620_000
