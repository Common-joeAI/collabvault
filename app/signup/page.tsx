'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', bio: '', discordHandle: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [welcome, setWelcome] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }
      // Save token to localStorage to bypass Cloudflare cookie issues
      if (data.token) {
        localStorage.setItem('cv_token', data.token)
      }
      // Show welcome popup, then redirect
      setWelcome(form.displayName)
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  // Welcome popup overlay
  if (welcome) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a0f2e, #0d0d1a)',
          border: '1px solid #7c3aed',
          borderRadius: 20,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 420,
          width: '90%',
          boxShadow: '0 0 60px rgba(124,58,237,0.4)',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#a855f7', marginBottom: 8 }}>
            Welcome, {welcome}!
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Your artist profile is ready.<br />
            Please log in to continue.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 40px',
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 0 24px rgba(124,58,237,0.5)',
            }}
          >
            Go to Login →
          </a>
        </div>
      </div>
    )
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
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Password * <span style={{ color: '#6b7280', fontWeight: 400 }}>(min 8 chars)</span>
            </label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
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
