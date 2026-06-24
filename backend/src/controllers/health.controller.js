import { OLLAMA_MODEL, checkOllamaHealth } from '../services/ollama.service.js'

export async function getHealth(_req, res) {
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
}
