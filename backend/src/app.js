import cors from 'cors'
import express from 'express'

import { errorHandler } from './middleware/error.middleware.js'
import routes from './routes/index.js'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use('/api', routes)
app.use(errorHandler)

export default app
