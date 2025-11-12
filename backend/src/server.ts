import cors from 'cors'
import express, { Request, Response } from 'express'
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client'

type Note = {
  id: string
  title: string
  content: string
  createdAt: string
}

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

const register = new Registry()
collectDefaultMetrics({ register })

const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Count of HTTP requests received',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [register],
})

const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
})

const notes: Note[] = [
  {
    id: 'seed-1',
    title: 'Bienvenue',
    content: 'Épinglez vos idées et relisez-les plus tard.',
    createdAt: new Date().toISOString(),
  },
]

app.use((req, res, next) => {
  const end = requestDuration.startTimer({ method: req.method, route: req.path })
  res.on('finish', () => {
    const status = res.statusCode.toString()
    requestCounter.inc({ method: req.method, route: req.path, status })
    end({ status })
  })
  next()
})

app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.get('/notes', (_req, res) => {
  res.json(notes)
})

app.post('/notes', (req, res) => {
  const { title, content } = req.body as Partial<Pick<Note, 'title' | 'content'>>

  if (!title || !content) {
    res.status(400).json({ error: 'title and content are required' })
    return
  }

  const newNote: Note = {
    id: `note-${Date.now()}`,
    title,
    content,
    createdAt: new Date().toISOString(),
  }

  notes.unshift(newNote)
  res.status(201).json(newNote)
})

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType)
  res.send(await register.metrics())
})

app.use((_req, res) => {
  res.status(404).json({ error: 'not found' })
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})

