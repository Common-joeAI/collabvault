import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎡</div>
      <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, background: 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        CollabVault
      </h1>
      <p style={{ fontSize: 20, color: '#9ca3af', maxWidth: 520, margin: '0 auto 40px' }}>
        Where AI music artists connect, post collab requests, and get matched by the roulette wheel.
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
        <Link href="/signup" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
          Join as an Artist
        </Link>
        <Link href="/board" className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
          Browse the Board
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
        {[
          { icon: '📋', title: 'Collab Board', desc: 'Post what you\'re working on and find other AI artists to create with.' },
          { icon: '🎡', title: 'Roulette Challenges', desc: 'Spin the wheel — get matched with a random artist, genre, and theme.' },
          { icon: '👥', title: 'Artist Directory', desc: 'Browse all artists, see their styles and drop them a message on Discord.' },
        ].map(f => (
          <div key={f.title} className="card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
