import type { Todo } from './types'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null as T
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export const api = {
  getTodos:    ()                        => request<Todo[]>('GET',    '/api/todos'),
  createTodo:  (text: string)            => request<Todo>('POST',   '/api/todos', { text }),
  toggleTodo:  (id: number)              => request<Todo>('PATCH',  `/api/todos/${id}/toggle`),
  deleteTodo:  (id: number)              => request<null>('DELETE', `/api/todos/${id}`),
}
