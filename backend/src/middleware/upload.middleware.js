import multer from 'multer'
import { MAX_UPLOAD_BYTES } from '../config/env.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
})

export function handlePdfUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next()

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ detail: 'File exceeds 20 MB limit.' })
    }

    return res.status(400).json({ detail: err.message || 'Upload failed.' })
  })
}
