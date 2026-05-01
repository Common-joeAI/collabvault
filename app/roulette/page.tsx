'use client'
import { useEffect, useState, useRef } from 'react'

type Challenge = {
  id: string; genre: string; theme: string; status: string; createdAt: string;
  artistA: { displayName: string; discordHandle: string }
  artistB: { displayName: string; discordHandle: string }
}
type WheelOptions = { genres: { value: string }[]; themes: { value: string }[] }

export default function RoulettePage() {
  const [user, setUser] = useState<{ id: string; displayName: string } | null>(null)
  const [options, setOptions] = useState<WheelOptions>({ genres: [], themes: [] })
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Challenge | null>(null)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newOption, setNewOption] = useState({ type: 'genre', value: '' })
  const [addMsg, setAddMsg] = useState('')
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(setUser)
    fetch('/api/wheel/options').then(r => r.json()).then(setOptions)
    fetch('/api/challenges').then(r => r.ok ? r.json() : []).then(setChallenges)
  }, [])

  async function spin() {
    setSpinning(true); setError(''); setResult(null)
    // Animate wheel
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)'
      wheelRef.current.style.transform = `rotate(${720 + Math.random() * 360}deg)`
    }
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch('/api/wheel/spin', { method: 'POST' })
    const data = await res.json()
    setSpinning(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
    setChallenges(c => [data, ...c])
    // Reset wheel
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none'
      wheelRef.current.style.transform = 'rotate(0deg)'
    }
  }

  async function addOption(e: React.FormEvent) {
    e.preventDefault(); setAddMsg('')
    const res = await fetch('/api/wheel/options', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOption),
    })
    const data = await res.json()
    if (!res.ok) { setAddMsg(data.error); return }
    setAddMsg('Added!')
    setNewOption(n => ({ ...n, value: '' }))
    fetch('/api/wheel/options').then(r => r.json()).then(setOptions)
    setTimeout(() => setAddMsg(''), 2000)
  }

  const segments = ['🎵', '🎸', '🥁', '🎹', '🎺', '🎻', '🎤', '🎧']

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>🎡 Collab Roulette</h1>
        <p style={{ color: '#9ca3af' }}>Spin to get matched with a random artist, genre & theme</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        {/* Wheel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            {/* Pointer */}
            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, fontSize: 28 }}>▼</div>
            {/* Wheel visual */}
            <div ref={wheelRef} style={{
              width: 280, height: 280, borderRadius: '50%',
              background: 'conic-gradient(#7c3aed 0deg 45deg, #a855f7 45deg 90deg, #06b6d4 90deg 135deg, #0891b2 135deg 180deg, #7c3aed 180deg 225deg, #a855f7 225deg 270deg, #06b6d4 270deg 315deg, #0891b2 315deg 360deg)',
              border: '4px solid #2a2a3f', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, boxShadow: '0 0 40px rgba(124,58,237,0.4)',
            }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%', background: '#0a0a0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>🎡</div>
            </div>
          </div>

          {user ? (
            <button className="btn btn-primary" onClick={spin} disabled={spinning}
              style={{ fontSize: 18, padding: '14px 48px', width: '100%', justifyContent: 'center',
                boxShadow: spinning ? 'none' : '0 0 30px rgba(124,58,237,0.5)' }}>
              {spinning ? '⚡ Spinning...' : '🎡 SPIN'}
            </button>
          ) : (
            <a href="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
              Login to Spin
            </a>
          )}
          {error && <p className="error">{error}</p>}

          {result && (
            <div className="card" style={{ width: '100%', borderColor: '#7c3aed', background: '#1a0f2e', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>🎊</span>
                <h3 style={{ fontWeight: 800, color: '#a855f7', marginTop: 4 }}>Challenge Spun!</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Matched with</span>
                  <strong style={{ color: '#e2e2f0' }}>{result.artistB.displayName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Genre</span>
                  <span className="tag tag-purple">{result.genre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Theme</span>
                  <span className="tag tag-cyan">{result.theme}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, textAlign: 'center' }}>
                ✅ Both artists notified via Discord!
              </p>
            </div>
          )}
        </div>

        {/* Wheel options + challenges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Current options preview */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700 }}>Wheel Options</h3>
              {user && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(s => !s)}>
                  {showAdd ? 'Cancel' : '+ Add'}
                </button>
              )}
            </div>

            {showAdd && (
              <form onSubmit={addOption} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <select className="input" style={{ width: 100 }} value={newOption.type}
                  onChange={e => setNewOption(n => ({ ...n, type: e.target.value }))}>
                  <option value="genre">Genre</option>
                  <option value="theme">Theme</option>
                </select>
                <input className="input" placeholder="New option..." value={newOption.value}
                  onChange={e => setNewOption(n => ({ ...n, value: e.target.value }))} required />
                <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>Add</button>
              </form>
            )}
            {addMsg && <p className={addMsg === 'Added!' ? 'success' : 'error'} style={{ marginBottom: 8 }}>{addMsg}</p>}

            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>GENRES ({options.genres.length})</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {options.genres.slice(0, 8).map(g => <span key={g.value} className="tag tag-purple">{g.value}</span>)}
                {options.genres.length > 8 && <span className="tag" style={{ background: '#1a1a28', color: '#6b7280' }}>+{options.genres.length - 8} more</span>}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>THEMES ({options.themes.length})</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {options.themes.slice(0, 6).map(t => <span key={t.value} className="tag tag-cyan">{t.value}</span>)}
                {options.themes.length > 6 && <span className="tag" style={{ background: '#1a1a28', color: '#6b7280' }}>+{options.themes.length - 6} more</span>}
              </div>
            </div>
          </div>

          {/* My challenges */}
          {user && challenges.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>My Challenges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {challenges.slice(0, 5).map(c => (
                  <div key={c.id} style={{ padding: '10px 12px', background: '#1a1a28', borderRadius: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{c.artistA.displayName} × {c.artistB.displayName}</strong>
                      <span style={{ color: '#22c55e', fontSize: 11 }}>{c.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="tag tag-purple">{c.genre}</span>
                      <span className="tag tag-cyan">{c.theme}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
