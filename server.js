import express from 'express'
import { readFileSync, existsSync } from 'node:fs'
import { getAllTodos, createTodo, toggleTodo, deleteTodo } from './db.js'

const app = express()
// In dev mode Blend starts the API on API_PORT (default 3001) so it can
// coexist with the Vite dev server on PORT (DEV_PORT). In prod they merge:
// Express serves dist/ + /api on a single PORT.
const PORT = parseInt(process.env.API_PORT ?? process.env.PORT ?? '3000', 10)

app.use(express.json())
// Serve Vite build output in production; no-op in dev (Vite serves its own assets)
app.use(express.static('dist'))

// ── REST API ──────────────────────────────────────────────────────────────────

app.get('/api/todos', async (req, res) => {
  res.json(await getAllTodos())
})

app.post('/api/todos', async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'text is required' })
  res.status(201).json(await createTodo(text))
})

app.patch('/api/todos/:id/toggle', async (req, res) => {
  const todo = await toggleTodo(parseInt(req.params.id, 10))
  if (!todo) return res.status(404).json({ error: 'not found' })
  res.json(todo)
})

app.delete('/api/todos/:id', async (req, res) => {
  await deleteTodo(parseInt(req.params.id, 10))
  res.status(204).end()
})

// ── Health check (required by Blend / Fly.io) ─────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// ── SPA fallback (serve index.html for all non-API routes in prod) ────────────
// In dev mode this is never hit because Vite handles all non-/api requests.
app.get('*', (req, res) => {
  const index = 'dist/index.html'
  if (existsSync(index)) {
    res.send(readFileSync(index, 'utf8'))
  } else {
    res.status(404).send('Not found — run "npm run build" first')
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`red-todo-app listening on http://0.0.0.0:${PORT}`)
})
