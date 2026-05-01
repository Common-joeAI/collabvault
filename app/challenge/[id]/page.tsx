'use client'
import { useEffect, useState } from 'react'

type Challenge = {
  id: string
  artistA: { displayName: string; discordHandle: string }
  artistB: { displayName: string; discordHandle: string }
  genre: string
  theme: string
  status: string
}

export default function ChallengeWorkspace({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', url: '', note: '' })
  const [submitForm, setSubmitForm] = useState({ title: '', link: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function readJson(res: Response) {
    try { return await res.json() } catch { return {} }
  }

  async function load() {
    setError('')
    setLoading(true)

    const challengeRes = await fetch(`/api/challenges/${params.id}`)
    if (!challengeRes.ok) {
      window.location.href = '/dashboard'
      return
    }

    setChallenge(await challengeRes.json())

    const filesRes = await fetch(`/api/challenges/${params.id}/files`)
    if (!filesRes.ok) {
      const data = await readJson(filesRes)
      setError(data.error || 'Could not load workspace files.')
      setLoading(false)
      return
    }

    setFiles(await filesRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addFile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch(`/api/challenges/${params.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await readJson(res)
    if (!res.ok) { setError(data.error || 'Could not add file.'); return }
    setForm({ title: '', url: '', note: '' })
    load()
  }

  async function submitCollab(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch(`/api/challenges/${params.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitForm),
    })
    const data = await readJson(res)
    if (!res.ok) { setError(data.error || 'Could not submit collab.'); return }
    window.location.href = '/dashboard'
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>Loading private workspace...</div>
  }

  const isClosed = challenge?.status !== 'active'

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>🧰 Private Workspace</h1>

      {challenge && (
        <div className="card" style={{ marginBottom: 24, borderColor: '#7c3aed' }}>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Visible only to matched artists until publish</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
            {challenge.artistA.displayName} × {challenge.artistB.displayName}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="tag tag-purple">Genre: {challenge.genre}</span>
            <span className="tag tag-cyan">Theme: {challenge.theme}</span>
            <span className="tag" style={{ background: '#1a1a28', color: '#9ca3af' }}>Status: {challenge.status}</span>
          </div>
        </div>
      )}

      {error && <p className="error" style={{ marginBottom: 16 }}>{error}</p>}

      {!isClosed && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Add File or Resource Link</h2>
          <form onSubmit={addFile} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <input className="input" placeholder="File Link" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required />
            <input className="input" placeholder="Note" value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add to Workspace</button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Shared Files</h2>
        {files.length === 0 && <p style={{ color: '#6b7280' }}>No files shared yet.</p>}
        {files.map(f => (
          <div key={f.id} style={{ marginBottom: 12, padding: 12, background: '#1a1a28', borderRadius: 8 }}>
            <a href={f.url} target="_blank" rel="noreferrer">{f.title}</a>
            {f.note && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{f.note}</div>}
            {f.uploader && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Shared by {f.uploader.displayName}</div>}
          </div>
        ))}
      </div>

      {!isClosed && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Submit Final Collab</h2>
          <form onSubmit={submitCollab} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Track Title" value={submitForm.title}
              onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} required />
            <input className="input" placeholder="Audio Link (MP3, SoundCloud, etc.)" value={submitForm.link}
              onChange={e => setSubmitForm(f => ({ ...f, link: e.target.value }))} required />
            <textarea className="input" placeholder="Notes" value={submitForm.notes}
              onChange={e => setSubmitForm(f => ({ ...f, notes: e.target.value }))} />
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Publish Collab</button>
          </form>
        </div>
      )}
    </div>
  )
}
