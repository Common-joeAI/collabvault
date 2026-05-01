'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Post = {
  id: string; title: string; content: string; genre: string | null;
  lookingFor: string | null; createdAt: string;
  user: { displayName: string; discordHandle: string; avatarUrl: string | null }
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [form, setForm] = useState({ title: '', content: '', genre: '', lookingFor: '' })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(setUser)
    loadPosts()
  }, [])

  async function loadPosts() {
    const res = await fetch('/api/posts')
    setPosts(await res.json())
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ title: '', content: '', genre: '', lookingFor: '' })
    setShowForm(false); setLoading(false)
    loadPosts()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>📋 Collab Board</h1>
          <p style={{ color: '#9ca3af', marginTop: 4 }}>Find artists to collaborate with</p>
        </div>
        {user ? (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Post Request'}
          </button>
        ) : (
          <Link href="/login" className="btn btn-primary">Login to Post</Link>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>New Collab Request</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input className="input" placeholder="Title (e.g. Looking for a dark ambient collab)" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <textarea className="input" rows={3} placeholder="Describe what you're working on, your vibe, what you need..."
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              style={{ resize: 'vertical' }} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="input" placeholder="Genre (optional)" value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} />
              <input className="input" placeholder="Looking for (e.g. vocalist, producer)" value={form.lookingFor}
                onChange={e => setForm(f => ({ ...f, lookingFor: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? 'Posting...' : 'Post Request'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
            No posts yet. Be the first to post a collab request!
          </div>
        )}
        {posts.map(p => (
          <div key={p.id} className="card" style={{ borderLeft: '3px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h3 style={{ fontWeight: 700, fontSize: 17 }}>{p.title}</h3>
              <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', marginLeft: 12 }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 14, fontSize: 14 }}>{p.content}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {p.genre && <span className="tag tag-purple">{p.genre}</span>}
              {p.lookingFor && <span className="tag tag-cyan">👀 {p.lookingFor}</span>}
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9ca3af' }}>
                by <strong style={{ color: '#a855f7' }}>{p.user.displayName}</strong>
                <span style={{ marginLeft: 8, color: '#6b7280' }}>@{p.user.discordHandle}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
