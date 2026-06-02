import { useState, useEffect, useRef } from 'react'
import { api } from './api'
import type { Todo } from './types'

function formatDate(iso: string): string {
  const d = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'))
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}) {
  return (
    <li className={`todo-item${todo.done ? ' done' : ''}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={!!todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span className="todo-text">{todo.text}</span>
      <span className="todo-date">{formatDate(todo.created_at)}</span>
      <button
        className="todo-delete"
        title="Delete"
        onClick={() => onDelete(todo.id)}
      >
        ✕
      </button>
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [inputDisabled, setInputDisabled] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.getTodos()
      .then(setTodos)
      .catch(() => setLoadError('⚠️ Could not load todos. Is the server running?'))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text) return
    setInputDisabled(true)
    try {
      const todo = await api.createTodo(text)
      setTodos(prev => [todo, ...prev])
      setInputValue('')
    } catch (err) {
      alert('Could not add todo: ' + (err as Error).message)
    } finally {
      setInputDisabled(false)
      inputRef.current?.focus()
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const updated = await api.toggleTodo(id)
      setTodos(prev => prev.map(t => t.id === id ? updated : t))
    } catch (err) {
      alert('Could not update todo: ' + (err as Error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTodo(id)
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert('Could not delete todo: ' + (err as Error).message)
    }
  }

  const done  = todos.filter(t => t.done).length
  const total = todos.length

  return (
    <>
      {/* ⚠️ CHANGE ME BANNER — edit or remove in src/App.tsx */}
      <div className="change-me-banner">
        ⚠️&nbsp; This app is painfully ugly.&nbsp;
        <strong>Customize it on&nbsp;<a href="https://blend.dev" target="_blank" rel="noreferrer">Blend</a></strong>
        &nbsp;— change the colors, font, layout, anything!&nbsp; ⚠️
      </div>

      <header>
        <h1>📝 Red Todo App</h1>
        <p>The world's most customizable (and least attractive) todo list.</p>
      </header>

      <main>
        <form className="add-form" onSubmit={handleAdd}>
          <input
            ref={inputRef}
            type="text"
            className="todo-input"
            placeholder="What needs doing? (Type &amp; press Enter)"
            autoComplete="off"
            maxLength={500}
            value={inputValue}
            disabled={inputDisabled}
            onChange={e => setInputValue(e.target.value)}
          />
          <button type="submit">+ Add</button>
        </form>

        {total > 0 && (
          <div className="stats">
            <span>{total} todo{total !== 1 ? 's' : ''}</span>
            <span>{done} done ✓</span>
          </div>
        )}

        {loadError ? (
          <div className="empty-state">{loadError}</div>
        ) : total === 0 ? (
          <div className="empty-state">No todos yet — add one above! 👆</div>
        ) : (
          <ul className="todo-list">
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      <footer>
        Red Todo App — powered by Node.js + SQLite
      </footer>
    </>
  )
}
