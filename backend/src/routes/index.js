import { Router } from 'express'

import * as healthController from '../controllers/health.controller.js'
import * as pdfController from '../controllers/pdf.controller.js'
import { handlePdfUpload } from '../middleware/upload.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/health', asyncHandler(healthController.getHealth))
router.post('/upload', handlePdfUpload, asyncHandler(pdfController.uploadPdf))
router.post('/summarize', asyncHandler(pdfController.summarizePdf))
router.post('/chat', asyncHandler(pdfController.chat))

export default router
