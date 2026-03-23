import Link from 'next/link';

export default function Footer({ lastUpdated }) {
  const conflicts = [
    { id: 'israel-iran-gaza', name: 'Israel — Iran & Gaza' },
    { id: 'russia-ukraine', name: 'Russia — Ukraine' },
    { id: 'sudan-civil-war', name: 'Sudan Civil War' },
    { id: 'myanmar-civil-war', name: 'Myanmar' },
    { id: 'sahel-crisis', name: 'Sahel Crisis' },
    { id: 'china-taiwan', name: 'China — Taiwan' },
  ];

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      marginTop: '60px',
      padding: '48px 0 24px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}>
          {/* BRAND */}
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              🌍 WorldConflict.online
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
              Real-time global conflict tracking. Updated every 4 hours from verified sources. Independent, ad-free journalism.
            </p>
            {lastUpdated && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#10B981',
                fontWeight: 600,
              }}>
                <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                Last updated: {new Date(lastUpdated).toLocaleString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                })} UTC
              </div>
            )}
          </div>

          {/* CONFLICTS */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Active Conflicts
            </div>
            {conflicts.map(c => (
              <Link key={c.id} href={`/conflicts/${c.id}`} style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                padding: '4px 0',
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}>
                {c.name}
              </Link>
            ))}
          </div>

          {/* LINKS */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Navigation
            </div>
            {[
              { href: '/', label: 'Home' },
              { href: '/conflicts', label: 'All Conflicts' },
              { href: '/latest', label: 'Latest Updates' },
              { href: '/about', label: 'About Us' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                padding: '4px 0',
                textDecoration: 'none',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* TELEGRAM */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Stay Updated
            </div>
            <a
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'worldconflictonline'}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2AABEE',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              ✈️ Telegram Alerts
            </a>
            <p style={{ fontSize: '12px', lineHeight: 1.6 }}>
              Get instant notifications for breaking conflict updates.
            </p>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <span>© 2025 WorldConflict.online — Independent conflict monitoring</span>
          <span>Data sourced from public Telegram channels & verified news outlets</span>
        </div>
      </div>
    </footer>
  );
}
