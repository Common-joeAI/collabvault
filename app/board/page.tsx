'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Post = {
  id: string; title: string; content: string; genre: string | null;
  lookingFor: string | null; createdAt: string;
  user: { displayName: string; discordHandle: string; avatarUrl: string | null }
}

type Collab = {
  id: string
  title: string
  audioUrl: string
  createdAt: string
  uploader: { displayName: string }
  challenge: {
    genre: string
    theme: string
    artistA: { displayName: string }
    artistB: { displayName: string }
  }
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [collabs, setCollabs] = useState<Collab[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(setUser)
    fetch('/api/posts').then(r => r.json()).then(setPosts)
    fetch('/api/collabs').then(r => r.json()).then(setCollabs)
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>📋 Collab Board</h1>

      {/* COLLABS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {collabs.map(c => (
          <div key={c.id} className="card" style={{ borderLeft: '3px solid #06b6d4' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>🎧 {c.title}</h3>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 10 }}>
              {c.challenge.artistA.displayName} × {c.challenge.artistB.displayName}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <span className="tag tag-purple">{c.challenge.genre}</span>
              <span className="tag tag-cyan">{c.challenge.theme}</span>
            </div>
            <audio controls src={c.audioUrl} style={{ width: '100%' }} />
          </div>
        ))}
      </div>

      {/* POSTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map(p => (
          <div key={p.id} className="card" style={{ borderLeft: '3px solid #7c3aed' }}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
