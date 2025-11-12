export type Note = {
  id: string
  title: string
  content: string
  createdAt: string
}

export type CreateNotePayload = {
  title: string
  content: string
}

const apiBaseUrl = (() => {
  const candidate = import.meta.env.VITE_API_URL
  const sanitize = (value: string) => value.replace(/\/$/, '')

  if (typeof candidate === 'string' && candidate.length > 0) {
    return sanitize(candidate)
  }

  const fallback =
    typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000'

  return sanitize(fallback)
})()

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ error: 'Une erreur est survenue côté serveur.' }))
    const errorText =
      typeof message === 'object' && message && 'error' in message && typeof message.error === 'string'
        ? message.error
        : response.statusText
    throw new Error(errorText || 'Requête échouée')
  }
  return response.json() as Promise<T>
}

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch(`${apiBaseUrl}/notes`)
  return handleResponse<Note[]>(response)
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const response = await fetch(`${apiBaseUrl}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse<Note>(response)
}

