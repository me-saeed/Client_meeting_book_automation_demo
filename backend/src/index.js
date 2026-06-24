import app from './app.js'
import { OLLAMA_MODEL, PORT } from './config/env.js'

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF Agent API running at http://localhost:${PORT}`)
  console.log(`Ollama model: ${OLLAMA_MODEL}`)
})

server.requestTimeout = 600_000
server.headersTimeout = 610_000
server.keepAliveTimeout = 620_000
