import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import lessonsRouter from './routes/lessons.js'
import eventsRouter from './routes/events.js'
import usersRouter from './routes/users.js'
import toolsRouter from './routes/tools.js'
import postsRouter from './routes/posts.js'
import kpisRouter from './routes/kpis.js'
import questionsRouter from './routes/questions.js'
import articlesRouter from './routes/articles.js'
import categoriesRouter from './routes/categories.js'
import postCategoriesRouter from './routes/post-categories.js'
import tracksRouter from './routes/tracks.js'
import authRouter from './routes/auth.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'https://am-circle.vercel.app', 'https://app.airlignmastery.pt']

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)
app.use(express.json())

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
// Servir avatares
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')))
// Servir imagens de posts
app.use('/uploads/posts/images', express.static(path.join(__dirname, '../uploads/posts/images')))
// Servir arquivos de posts
app.use('/uploads/posts/files', express.static(path.join(__dirname, '../uploads/posts/files')))
// Servir imagens de eventos
app.use('/uploads/events/images', express.static(path.join(__dirname, '../uploads/events/images')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API AirLigner Mastery está funcionando' })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/lessons', lessonsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/users', usersRouter)
app.use('/api/tools', toolsRouter)
app.use('/api/posts', postsRouter)
app.use('/api/kpis', kpisRouter)
app.use('/api/questions', questionsRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/post-categories', postCategoriesRouter)
app.use('/api/tracks', tracksRouter)

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})


