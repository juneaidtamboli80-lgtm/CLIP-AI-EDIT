import express, { Request } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'

const app = express()
const port = Number(process.env.PORT || 4000)
const maxMb = Math.max(1, Number(process.env.MAX_UPLOAD_MB || 500))
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(v => v.trim())
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true)
  return callback(new Error('Origin not allowed by CORS'))
} }))
app.use(express.json({ limit: '1mb' }))

type StoredProject = { id: string; name: string; originalName: string; size: number; mimeType: string; createdAt: string; status: 'uploaded' }
const projects = new Map<string, StoredProject>()
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '')
    cb(null, `${randomUUID()}${ext}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Only video files are accepted'))
    cb(null, true)
  }
})

app.get('/api/health', (_req, res) => res.json({
  status: 'ok', service: 'clip-ai-api', phase: 1, timestamp: new Date().toISOString()
}))
app.get('/api/projects', (_req, res) => res.json({ projects: [...projects.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt)) }))
app.post('/api/uploads', (req: Request, res, next) => {
  upload.single('video')(req, res, err => {
    if (err) return next(err)
    if (!req.file) return res.status(400).json({ error: 'No video file received' })
    const project: StoredProject = {
      id: randomUUID(), name: req.file.originalname, originalName: req.file.originalname,
      size: req.file.size, mimeType: req.file.mimetype, createdAt: new Date().toISOString(), status: 'uploaded'
    }
    projects.set(project.id, project)
    res.status(201).json({ project, message: 'Video uploaded successfully' })
  })
})
app.use((err: Error, _req: Request, res: express.Response, _next: express.NextFunction) => {
  const message = err.message || 'Unexpected server error'
  const tooLarge = message.toLowerCase().includes('file too large')
  res.status(tooLarge ? 413 : 400).json({ error: tooLarge ? `Video exceeds the ${maxMb} MB upload limit` : message })
})
app.listen(port, '0.0.0.0', () => console.log(`CLIP AI API listening on ${port}`))
