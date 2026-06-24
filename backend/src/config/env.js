import 'dotenv/config'

export const PORT = Number(process.env.PORT) || 8000
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

export const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '')
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b'
export const OLLAMA_TIMEOUT_MS = 300_000

export const SUMMARY_MAX_CHARS = 3_000
export const QA_MAX_CHARS = 3_000
export const MAX_HISTORY_MESSAGES = 6
export const PDF_MAX_CHARS = 120_000
