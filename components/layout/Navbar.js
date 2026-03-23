import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../pages/_app';

export default function Navbar({ breakingNews = [] }) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/conflicts', label: 'All Conflicts' },
    { href: '/latest', label: 'Latest Updates' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      {/* BREAKING TICKER */}
      {breakingNews.length > 0 && (
        <div style={{
          background: '#DC2626',
          padding: '6px 0',
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 101,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: 'rgba(0,0,0,0.25)',
              padding: '2px 10px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginLeft: '16px',
              borderRadius: '3px',
              letterSpacing: '0.08em',
            }}>BREAKING</span>
            <div className="ticker-wrap">
              <span className="ticker-content">
                {breakingNews.map((n, i) => (
                  <span key={i}>
                    <Link href={`/conflict/${n.conflictId}/${n.slug}`} style={{ color: '#fff' }}>
                      {n.headline}
                    </Link>
                    <span style={{ margin: '0 32px', opacity: 0.5 }}>◆</span>
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN NAV */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled
          ? 'var(--bg-overlay)'
          : 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          gap: '24px',
        }}>
          {/* LOGO */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#DC2626',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>🌍</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>WorldConflict</div>
              <div style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>.online</div>
            </div>
          </Link>

          {/* NAV LINKS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
          }} className="nav-links">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: router.pathname === link.href
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                background: router.pathname === link.href
                  ? 'var(--bg-card)'
                  : 'transparent',
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* LIVE INDICATOR */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#10B981',
            }}>
              <span className="live-dot" />
              LIVE
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'var(--transition)',
                color: 'var(--text-primary)',
              }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
      `}</style>
    </>
  );
}
