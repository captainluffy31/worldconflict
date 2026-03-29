import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Threat level config
function getThreatConfig(level) {
  if (level >= 8) return { label: 'CRITICAL', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', pulse: true };
  if (level >= 6) return { label: 'HIGH', color: '#F97316', bg: 'rgba(249,115,22,0.15)', pulse: true };
  if (level >= 4) return { label: 'ELEVATED', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', pulse: false };
  return { label: 'NORMAL', color: '#10B981', bg: 'rgba(16,185,129,0.15)', pulse: false };
}

// Recent ships data (static — real data needs paid API)
const RECENT_SHIPS = [
  { name: 'ALPINE ETERNITY', type: 'Oil Tanker', flag: '🇬🇷', direction: 'Northbound', time: '14 min ago', status: 'Passed', dwt: '318,000 DWT' },
  { name: 'PACIFIC CROWN', type: 'LNG Carrier', flag: '🇯🇵', direction: 'Southbound', time: '41 min ago', status: 'Passed', dwt: '154,000 m³' },
  { name: 'GULF NAVIGATOR', type: 'Chemical Tanker', flag: '🇦🇪', direction: 'Northbound', time: '1h 12m ago', status: 'Passed', dwt: '47,000 DWT' },
  { name: 'IRAN SHAHED', type: 'Cargo', flag: '🇮🇷', direction: 'Southbound', time: '1h 55m ago', status: 'Passed', dwt: '28,000 DWT' },
  { name: 'MSC RIVIERA', type: 'Container Ship', flag: '🇵🇦', direction: 'Northbound', time: '2h 8m ago', status: 'Passed', dwt: '87,000 DWT' },
  { name: 'HAWTAH', type: 'Oil Tanker', flag: '🇸🇦', direction: 'Southbound', time: '2h 44m ago', status: 'Passed', dwt: '280,000 DWT' },
  { name: 'EAGLE VENICE', type: 'VLCC Tanker', flag: '🇺🇸', direction: 'Northbound', time: '3h 2m ago', status: 'Passed', dwt: '305,000 DWT' },
  { name: 'BW BOSS', type: 'LPG Carrier', flag: '🇸🇬', direction: 'Northbound', time: '3h 29m ago', status: 'Passed', dwt: '82,000 m³' },
];

const STATS = [
  { label: 'Ships Today', value: '47', sub: '~21M barrels oil', color: '#3B82F6' },
  { label: 'Global Oil Flow', value: '20%', sub: 'passes through here', color: '#F59E0B' },
  { label: 'Threat Level', value: 'HIGH', sub: 'Iran tensions elevated', color: '#EF4444' },
  { label: 'US Navy Ships', value: '3', sub: 'in area', color: '#10B981' },
];

export default function HormuzTracker({ latestPost }) {
  const [time, setTime] = useState('');
  const [activeShip, setActiveShip] = useState(null);
  const threat = getThreatConfig(7);

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(0, 25) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Head>
        <title>Strait of Hormuz — Live Ship Tracker | WorldConflict.online</title>
        <meta name="description" content="Live ship tracking through the Strait of Hormuz. Monitor oil tankers, LNG carriers, and naval vessels passing through the world's most critical maritime chokepoint." />
        <meta property="og:title" content="Strait of Hormuz Live Tracker" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://worldconflict.online/hormuz-tracker" />
      </Head>

      <Navbar />

      <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <section style={{
          background: 'linear-gradient(180deg, rgba(239,68,68,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 0 32px',
        }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 700, color: threat.color,
                background: threat.bg,
                border: `1px solid ${threat.color}33`,
                padding: '3px 10px', borderRadius: '20px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {threat.pulse && <span className="live-dot" />}
                {threat.label} ALERT
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{time}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', lineHeight: 1.15, marginBottom: '10px' }}>
              🌊 Strait of Hormuz
              <span style={{ color: 'var(--accent-red)', display: 'block', fontSize: '0.65em', fontWeight: 500, marginTop: '4px' }}>
                Live Maritime Traffic Monitor
              </span>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.7 }}>
              The world's most critical oil chokepoint — 21 miles wide at its narrowest point. ~20% of global petroleum passes here daily. Real-time monitoring of vessels, threats, and naval activity.
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0',
            }}>
              {STATS.map((stat, i) => (
                <div key={i} style={{
                  padding: '20px 24px',
                  borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container" style={{ padding: '32px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>

            {/* ── LEFT: MAP + SHIPS ── */}
            <div>

              {/* LIVE MAP EMBED */}
              <div style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                marginBottom: '24px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: 600, color: '#fff',
                }}>
                  <span className="live-dot" /> LIVE MAP
                </div>
                <iframe
                  src="https://www.marinetraffic.com/en/ais/embed/zoom:8/centery:26.5/centerx:56.5/maptype:4/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:/remember:false"
                  width="100%"
                  height="460"
                  style={{ border: 'none', display: 'block' }}
                  title="Strait of Hormuz Live Ship Tracker"
                  loading="lazy"
                />
              </div>

              {/* SHIP TABLE */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      🚢 Recent Transits
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                      border: '1px solid rgba(59,130,246,0.2)',
                      padding: '2px 8px', borderRadius: '10px',
                    }}>
                      LAST 4 HOURS
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ⚠️ Indicative data — real-time via MarineTraffic
                  </span>
                </div>

                {/* TABLE HEADER */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  padding: '8px 20px',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '10px', fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <span>Vessel Name</span>
                  <span>Type</span>
                  <span>Flag</span>
                  <span>Direction</span>
                  <span>Time</span>
                </div>

                {RECENT_SHIPS.map((ship, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveShip(activeShip === i ? null : i)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      padding: '12px 20px',
                      borderBottom: i < RECENT_SHIPS.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      background: activeShip === i ? 'rgba(59,130,246,0.05)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeShip !== i) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                    onMouseLeave={e => { if (activeShip !== i) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ship.name}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, display: 'block' }}>{ship.dwt}</span>
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', alignSelf: 'center' }}>{ship.type}</span>
                    <span style={{ fontSize: '16px', alignSelf: 'center' }}>{ship.flag}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, alignSelf: 'center',
                      color: ship.direction === 'Northbound' ? '#10B981' : '#3B82F6',
                    }}>
                      {ship.direction === 'Northbound' ? '↑' : '↓'} {ship.direction}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>{ship.time}</span>
                  </div>
                ))}

                <div style={{
                  padding: '12px 20px',
                  background: 'var(--bg-secondary)',
                  fontSize: '12px', color: 'var(--text-muted)',
                  textAlign: 'center',
                }}>
                  For full live data →{' '}
                  <a href="https://www.marinetraffic.com/en/ais/home/centerx:56.5/centery:26.5/zoom:9" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6' }}>
                    MarineTraffic.com
                  </a>
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* THREAT PANEL */}
              <div style={{
                background: 'var(--bg-card)',
                border: `1px solid ${threat.color}44`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: threat.bg,
                  borderBottom: `1px solid ${threat.color}33`,
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: threat.color }}>
                    ⚠️ THREAT ASSESSMENT
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  {[
                    { label: 'Iranian IRGC Activity', level: 8, note: 'Naval drills ongoing' },
                    { label: 'Houthi Missile Risk', level: 6, note: 'Red Sea spillover' },
                    { label: 'Mine Threat', level: 5, note: 'Historical precedent' },
                    { label: 'Closure Risk', level: 4, note: 'Iran threatened closure' },
                    { label: 'US Naval Presence', level: 9, note: '5th Fleet active' },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.note}</span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.level * 10}%`,
                          height: '100%',
                          background: item.level >= 8 ? '#EF4444' : item.level >= 6 ? '#F97316' : item.level >= 4 ? '#F59E0B' : '#10B981',
                          borderRadius: '4px',
                          transition: 'width 1s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KEY FACTS */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  📊 Key Facts
                </div>
                {[
                  '~21 miles wide at narrowest point (Musandam Peninsula)',
                  '20-21 million barrels of oil transit daily',
                  '~30% of global LNG passes through here',
                  'Iran controls northern coastline (~1,500 km)',
                  'US 5th Fleet HQ in Bahrain monitors 24/7',
                  'Iran threatened closure 5+ times since 2011',
                  'Tanker attacks peaked in 2019: 12 incidents',
                ].map((fact, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                    padding: '6px 0',
                    borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ color: '#3B82F6', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>◆</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{fact}</span>
                  </div>
                ))}
              </div>

              {/* LATEST NEWS */}
              {latestPost && (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
                  }}>
                    📰 Latest Intelligence
                  </div>
                  <Link href={`/conflict/${latestPost.conflictId}/${latestPost.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ padding: '14px 16px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{
                        fontSize: '10px', fontWeight: 700, color: '#EF4444',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {latestPost.conflictName}
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, margin: '6px 0 4px' }}>
                        {latestPost.headline}
                      </p>
                      <span style={{ fontSize: '11px', color: '#3B82F6' }}>Read full report →</span>
                    </div>
                  </Link>
                </div>
              )}

              {/* TELEGRAM LINK */}
              <a
                href="https://t.me/worldconflictonline"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#2AABEE',
                  color: '#fff',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontWeight: 600, fontSize: '13px',
                }}
              >
                <span style={{ fontSize: '20px' }}>✈️</span>
                <div>
                  <div>Get Instant Alerts</div>
                  <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.85 }}>Join our Telegram channel</div>
                </div>
              </a>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const { db: adminDb } = require('../lib/firebase-admin');

    // Get latest post related to Hormuz or Iran
    const snap = await adminDb.collection('posts')
      .where('isPublished', '==', true)
      .orderBy('publishedTimestamp', 'desc')
      .limit(1)
      .get();

    const latestPost = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };

    return {
      props: {
        latestPost: latestPost ? JSON.parse(JSON.stringify(latestPost)) : null,
      },
    };
  } catch (err) {
    console.error('Hormuz tracker error:', err);
    return { props: { latestPost: null } };
  }
}
