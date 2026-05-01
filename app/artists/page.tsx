'use client'
import { useEffect, useState } from 'react'

type Artist = {
  id: string; displayName: string; bio: string | null;
  avatarUrl: string | null; discordHandle: string;
  genres: string; themes: string; createdAt: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/artists').then(r => r.json()).then(setArtists)
  }, [])

  const filtered = artists.filter(a =>
    a.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (a.bio || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>👥 Artist Directory</h1>
        <input className="input" placeholder="Search artists..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(a => {
          let genres: string[] = []
          try { genres = JSON.parse(a.genres) } catch {}
          return (
            <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {a.displayName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{a.displayName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>@{a.discordHandle}</div>
                </div>
              </div>

              {a.bio && (
                <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6, flex: 1 }}>
                  {a.bio.length > 120 ? a.bio.slice(0, 120) + '…' : a.bio}
                </p>
              )}

              {genres.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {genres.slice(0, 4).map(g => <span key={g} className="tag tag-purple">{g}</span>)}
                </div>
              )}

              <div style={{ fontSize: 12, color: '#4b5563', marginTop: 'auto' }}>
                Joined {new Date(a.createdAt).toLocaleDateString()}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#6b7280' }}>
            No artists found yet. Be the first to sign up!
          </div>
        )}
      </div>
    </div>
  )
}
