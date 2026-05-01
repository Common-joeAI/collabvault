import Link from 'next/link'
import { requireUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await requireUser()

  const cards = [
    {
      href: '/board',
      icon: '📋',
      title: 'Collab Board',
      desc: 'Post a request, browse active collabs, and find artists who match your workflow.',
      cta: 'Open Board',
    },
    {
      href: '/roulette',
      icon: '🎡',
      title: 'Roulette Match',
      desc: 'Spin for a random partner, genre, and theme when you want a creative challenge.',
      cta: 'Spin Roulette',
    },
    {
      href: '/artists',
      icon: '👥',
      title: 'Artist Directory',
      desc: 'Find other CollabVault members and check their style, bio, and Discord handle.',
      cta: 'Browse Artists',
    },
    {
      href: '/profile',
      icon: '⚙️',
      title: 'Your Profile',
      desc: 'Keep your artist name, Discord handle, bio, genres, and themes up to date.',
      cta: 'Edit Profile',
    },
  ]

  return (
    <div style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div className="card" style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(124,58,237,0.24), rgba(6,182,212,0.12))' }}>
        <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Signed in as</p>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 8 }}>Welcome, {user.displayName}</h1>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, maxWidth: 720 }}>
          This is your CollabVault workspace. From here you can post collab requests, spin the roulette challenge, browse artists, and manage your profile.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {cards.map(card => (
          <Link key={card.href} href={card.href} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ fontSize: 34, marginBottom: 14 }}>{card.icon}</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>{card.title}</h2>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{card.desc}</p>
            <span className="btn btn-primary btn-sm">{card.cta}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
