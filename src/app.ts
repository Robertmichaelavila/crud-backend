import express from 'express'
import routes from './routes/routes'
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

const app = express();

app.set('trust proxy', 1)

app.use(helmet())

app.use(cors({ 
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  credentials: true
}))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}))

app.use(cookieParser())

app.use(express.json({ limit: '10kb' }))

app.use(routes)
app.use(errorHandler)

export default app