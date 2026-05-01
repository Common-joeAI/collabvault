'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Nav() {
  const [user, setUser] = useState<{ displayName: string } | null>(null)
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(u => setUser(u))
  }, [path])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  return (
    <nav style={{
      background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid #2a2a3f',
      padding: '0 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <span style={{ fontSize: 22 }}>🎡</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: '#a855f7' }}>CollabVault</span>
      </Link>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {user ? (
          <>
            <Link href="/board" className="btn btn-outline btn-sm">Board</Link>
            <Link href="/roulette" className="btn btn-outline btn-sm">Roulette 🎡</Link>
            <Link href="/artists" className="btn btn-outline btn-sm">Artists</Link>
            <Link href="/profile" className="btn btn-outline btn-sm">Profile</Link>
            <button onClick={logout} className="btn btn-sm" style={{ background: '#1a1a28', color: '#6b7280', border: '1px solid #2a2a3f' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
