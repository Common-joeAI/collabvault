'use client'
import { useEffect, useState } from 'react'

type User = { id: string; displayName: string; email: string; bio: string | null; discordHandle: string; genres: string; themes: string }

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({ displayName: '', bio: '', discordHandle: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/me').then(r => {
      if (!r.ok) {
        // Hard redirect — avoids client-side nav race with cookie
        window.location.href = '/login'
        return null
      }
      return r.json()
    }).then(u => {
      if (!u) return
      setUser(u)
      setForm({ displayName: u.displayName, bio: u.bio || '', discordHandle: u.discordHandle })
    })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 28 }}>My Profile</h1>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
          }}>
            {user.displayName[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user.displayName}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{user.email}</div>
          </div>
        </div>

        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Display Name</label>
            <input className="input" value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Discord Handle</label>
            <input className="input" value={form.discordHandle}
              onChange={e => setForm(f => ({ ...f, discordHandle: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Bio</label>
            <textarea className="input" rows={4} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {saved && <span className="success">✓ Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
