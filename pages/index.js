import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ConflictCard from '../components/ui/ConflictCard';
import PostCard from '../components/ui/PostCard';

export default function Home({ initialConflicts, initialPosts, systemStatus }) {
  const [conflicts, setConflicts] = useState(initialConflicts || []);
  const [posts, setPosts] = useState(initialPosts || []);
  const [lastUpdated, setLastUpdated] = useState(systemStatus?.lastWritten);

  const breakingPosts = posts.filter(p => p.intensity >= 8).slice(0, 3);
  const criticalConflicts = conflicts.filter(c => c.intensity >= 7);
  const monitoringConflicts = conflicts.filter(c => c.intensity < 7);

  return (
    <>
      <Head>
        <title>WorldConflict.online — Real-time Global Conflict Tracker</title>
        <meta name="description" content="Track active wars and conflicts worldwide. Updated every 4 hours from verified Telegram channels and news sources. Iran-Israel, Russia-Ukraine, Sudan, Myanmar and more." />
        <meta name="keywords" content="world conflict tracker, war news, russia ukraine war, israel iran conflict, sudan war, global conflicts 2025" />
        <meta property="og:title" content="WorldConflict.online — Real-time Global Conflict Tracker" />
        <meta property="og:description" content="Track active wars and conflicts worldwide. Updated every 4 hours." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://worldconflict.online" />
        <link rel="canonical" href="https://worldconflict.online" />
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "WorldConflict.online",
          "url": "https://worldconflict.online",
          "description": "Real-time global conflict and war tracker",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://worldconflict.online/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}} />
      </Head>

      <Navbar breakingNews={breakingPosts} />

      <main>
        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '48px 0 40px',
        }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Live Monitoring
                  </span>
                </div>
                <h1 style={{ marginBottom: '16px', lineHeight: 1.15 }}>
                  Global Conflict<br />
                  <span style={{ color: 'var(--accent-red)' }}>Tracker</span>
                </h1>
                <p style={{ fontSize: '17px', lineHeight: 1.7, marginBottom: '24px' }}>
                  Real-time coverage of active wars and conflicts worldwide. Updated every 4 hours from verified Telegram intelligence channels and leading news outlets.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/conflicts" className="btn btn-primary">
                    View All Conflicts
                  </Link>
                  <a href="https://t.me/worldconflictonline" target="_blank" rel="noopener" className="btn btn-ghost">
                    ✈️ Telegram Alerts
                  </a>
                </div>
              </div>

              {/* STATS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                minWidth: '240px',
              }}>
                {[
                  { label: 'Active Conflicts', value: conflicts.length, color: '#EF4444' },
                  { label: 'Critical Situations', value: criticalConflicts.length, color: '#F97316' },
                  { label: 'Reports Today', value: posts.filter(p => {
                    const today = new Date(); today.setHours(0,0,0,0);
                    return new Date(p.publishedAt) >= today;
                  }).length, color: '#3B82F6' },
                  { label: 'Update Cycle', value: '4 hrs', color: '#10B981' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CRITICAL CONFLICTS ────────────────────────────── */}
        <section style={{ padding: '48px 0 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '4px', height: '24px', background: '#EF4444', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)' }}>Critical Conflicts</h2>
              <span style={{
                fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.1)',
                color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '20px', padding: '2px 10px', letterSpacing: '0.05em',
              }}>
                {criticalConflicts.length} ACTIVE
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '48px',
            }}>
              {criticalConflicts.map(c => (
                <ConflictCard key={c.id} conflict={c} />
              ))}
            </div>
          </div>
        </section>

        {/* ── LATEST REPORTS ────────────────────────────────── */}
        <section style={{ padding: '0 0 48px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '4px', height: '24px', background: '#3B82F6', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)' }}>Latest Reports</h2>
              </div>
              <Link href="/latest" className="btn btn-ghost" style={{ fontSize: '13px', padding: '7px 14px' }}>
                View all →
              </Link>
            </div>

            {/* FEATURED POST */}
            {posts[0] && (
              <div style={{ marginBottom: '20px' }}>
                <PostCard post={posts[0]} size="large" />
              </div>
            )}

            {/* POST GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px',
            }}>
              {posts.slice(1, 7).map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* ── MONITORING CONFLICTS ──────────────────────────── */}
        {monitoringConflicts.length > 0 && (
          <section style={{
            padding: '40px 0',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
          }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '4px', height: '24px', background: '#F59E0B', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)' }}>Under Monitoring</h2>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '14px',
              }}>
                {monitoringConflicts.map(c => (
                  <ConflictCard key={c.id} conflict={c} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '12px' }}>How We Track Conflicts</h2>
            <p style={{ marginBottom: '40px' }}>
              Our automated system monitors 30+ verified Telegram intelligence channels and leading news outlets, processes the data with AI, and publishes comprehensive reports every 4 hours.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
            }}>
              {[
                { icon: '📡', title: 'Data Collection', desc: 'Telegram channels + RSS feeds monitored 24/7' },
                { icon: '🤖', title: 'AI Analysis', desc: 'Gemini AI filters, verifies and structures content' },
                { icon: '✍️', title: 'Report Writing', desc: 'Full articles auto-generated with context' },
                { icon: '🔔', title: 'Instant Alerts', desc: 'Breaking news sent to Telegram channel' },
              ].map((step, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 16px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{step.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer lastUpdated={lastUpdated} />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const admin = require('firebase-admin');
    const { db: adminDb } = require('../lib/firebase-admin');

    const [conflictsSnap, postsSnap, statusSnap] = await Promise.all([
      adminDb.collection('conflicts').orderBy('intensity', 'desc').get(),
      adminDb.collection('posts').where('isPublished', '==', true).orderBy('publishedTimestamp', 'desc').limit(12).get(),
      adminDb.collection('system').doc('status').get(),
    ]);

    const conflicts = conflictsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const posts = postsSnap.docs.map(d => d.data());
    const systemStatus = statusSnap.exists ? statusSnap.data() : {};

    return {
      props: {
        initialConflicts: JSON.parse(JSON.stringify(conflicts)),
        initialPosts: JSON.parse(JSON.stringify(posts)),
        systemStatus: JSON.parse(JSON.stringify(systemStatus)),
      },
    };
  } catch (err) {
    console.error('Home SSR error:', err.message);
    return { props: { initialConflicts: [], initialPosts: [], systemStatus: {} } };
  }
}
