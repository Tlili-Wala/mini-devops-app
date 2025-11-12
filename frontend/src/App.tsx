import { useEffect, useState, type FormEvent, type JSX } from 'react'
import { createNote, fetchNotes, type Note } from './lib/api'

type NoteFormState = {
  title: string
  content: string
}

const createEmptyFormState = (): NoteFormState => ({
  title: '',
  content: '',
})

function App(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([])
  const [form, setForm] = useState<NoteFormState>(createEmptyFormState)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setError(null)
        const data = await fetchNotes()
        setNotes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de récupérer les notes.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadNotes()
  }, [])

  const hasNotes = notes.length > 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = form.title.trim()
    const trimmedContent = form.content.trim()

    if (!trimmedTitle || !trimmedContent) {
      setError('Merci de renseigner un titre et un contenu.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createNote({ title: trimmedTitle, content: trimmedContent })
      setNotes((current) => [created, ...current])
      setForm(createEmptyFormState())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’enregistrer la note.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-10">
        <header className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              Note Pinner
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Ajoutez vos idées en quelques secondes. Les notes sont conservées en mémoire le temps
              de la session pour simplifier ce mini-projet DevOps.
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-emerald-300">
            API observée par Prometheus
          </span>
        </header>

        <section className="grid gap-6 rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-900/30 lg:grid-cols-[340px,1fr]">
          <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="title">
                Titre
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 outline-none ring-emerald-500/50 transition focus:border-emerald-400 focus:ring-2"
                type="text"
                placeholder="Idée du jour..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="content">
                Contenu
              </label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({ ...current, content: event.target.value }))
                }
                className="h-32 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 outline-none ring-emerald-500/50 transition focus:border-emerald-400 focus:ring-2"
                placeholder="Décrivez votre note ici..."
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40 disabled:text-emerald-900/80"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement…' : 'Ajouter la note'}
            </button>
            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}
          </form>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{hasNotes ? `${notes.length} note(s)` : 'Aucune note pour le moment.'}</span>
              {isLoading && <span className="animate-pulse text-emerald-300">Chargement…</span>}
            </div>
            <div className="space-y-4">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-4 shadow-sm shadow-slate-900/40"
                >
                  <header className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-100">{note.title}</h2>
                    <time className="text-xs text-slate-400">
                      {new Date(note.createdAt).toLocaleString()}
                    </time>
                  </header>
                  <p className="text-sm leading-relaxed text-slate-300">{note.content}</p>
                </article>
              ))}
              {!isLoading && !hasNotes && (
                <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  Ajoutez votre première note pour remplir ce tableau.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
