import pdf from 'pdf-parse/lib/pdf-parse.js'
import { PDF_MAX_CHARS } from '../config/env.js'

export async function extractTextFromPdf(buffer) {
  let result
  try {
    result = await pdf(buffer)
  } catch (err) {
    const message = err?.message || 'Failed to parse PDF.'
    throw new Error(message)
  }

  const text = (result.text || '').trim()

  if (!text) {
    throw new Error(
      'No text could be extracted from this PDF. It may be scanned or image-only.',
    )
  }

  return truncateText(text)
}

function truncateText(text) {
  if (text.length <= PDF_MAX_CHARS) return text
  return text.slice(0, PDF_MAX_CHARS) + '\n\n[... document truncated for context limit ...]'
}
