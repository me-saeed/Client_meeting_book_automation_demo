export function errorHandler(err, _req, res, _next) {
  console.error('Unhandled error:', err)

  if (!res.headersSent) {
    res.status(500).json({ detail: err.message || 'Internal server error.' })
  }
}
