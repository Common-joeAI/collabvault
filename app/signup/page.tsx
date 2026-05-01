'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', bio: '', discordHandle: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return }
      window.location.href = '/board'
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎡</div>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Join CollabVault</h1>
        <p style={{ color: '#9ca3af', marginTop: 8 }}>Create your artist profile and start collaborating</p>
      </div>

      <div className="card">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Display Name *</label>
            <input className="input" placeholder="Your artist name" value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Email *</label>
            <input className="input" type="email" placeholder="you@email.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Password *</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Discord Handle *</label>
            <input className="input" placeholder="yourname (no @)" value={form.discordHandle}
              onChange={e => setForm(f => ({ ...f, discordHandle: e.target.value }))} required />
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Used to notify you of collab challenges</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Bio</label>
            <textarea className="input" rows={3} placeholder="Tell other artists about your style..."
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create Artist Profile'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
