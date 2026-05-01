'use client'
import { useEffect, useState } from 'react'

export default function ChallengeWorkspace({ params }: { params: { id: string } }) {
  const [files, setFiles] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', url: '', note: '' })
  const [submitForm, setSubmitForm] = useState({ title: '', link: '', notes: '' })
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`/api/challenges/${params.id}/files`)
    if (res.ok) setFiles(await res.json())
  }

  useEffect(() => { load() }, [])

  async function addFile(e: any) {
    e.preventDefault()
    const res = await fetch(`/api/challenges/${params.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const d = await res.json(); setError(d.error); return
    }
    setForm({ title: '', url: '', note: '' })
    load()
  }

  async function submitCollab(e: any) {
    e.preventDefault()
    const res = await fetch(`/api/challenges/${params.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitForm),
    })
    const d = await res.json()
    if (!res.ok) { setError(d.error); return }
    alert('Collab submitted!')
    window.location.href = '/dashboard'
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>🧰 Workspace</h1>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Add File</h2>
        <form onSubmit={addFile} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input" placeholder="Title" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <input className="input" placeholder="File Link" value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required />
          <input className="input" placeholder="Note" value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          <button className="btn btn-primary">Add</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Shared Files</h2>
        {files.map(f => (
          <div key={f.id} style={{ marginBottom: 10 }}>
            <a href={f.url} target="_blank">{f.title}</a>
            <div style={{ fontSize: 12 }}>{f.note}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Submit Final Collab</h2>
        <form onSubmit={submitCollab} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input" placeholder="Track Title" value={submitForm.title}
            onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} required />
          <input className="input" placeholder="Audio Link (mp3, soundcloud, etc)" value={submitForm.link}
            onChange={e => setSubmitForm(f => ({ ...f, link: e.target.value }))} required />
          <textarea className="input" placeholder="Notes" value={submitForm.notes}
            onChange={e => setSubmitForm(f => ({ ...f, notes: e.target.value }))} />
          <button className="btn btn-primary">Submit Collab</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
