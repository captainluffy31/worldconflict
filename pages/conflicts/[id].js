import Head from 'next/head';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PostCard from '../../components/ui/PostCard';

function intensityLabel(score) {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export default function ConflictPage({ conflict, posts }) {
  if (!conflict) return (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h2>Conflict not found</h2>
      <Link href="/">← Back to home</Link>
    </div>
  );

  const level = intensityLabel(conflict.intensity || 5);
  const yearsActive = conflict.started
    ? Math.floor((Date.now() - new Date(conflict.started).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <>
      <Head>
        <title>{conflict.name} — Latest Updates | WorldConflict.online</title>
        <meta name="description" content={`Follow real-time updates on ${conflict.name}. ${conflict.summary}`} />
        <meta name="keywords" content={`${conflict.name}, ${conflict.countries?.join(', ')}, conflict tracker, war news`} />
        <meta property="og:title" content={`${conflict.name} — WorldConflict.online`} />
        <meta property="og:description" content={conflict.summary} />
        <link rel="canonical" href={`https://worldconflict.online/conflicts/${conflict.id}`} />
      </Head>

      <Navbar />

      <main>
        {/* ── CONFLICT HEADER ───────────────────────────────── */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background accent */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '4px',
            background: conflict.color || '#EF4444',
          }} />

          <div className="container">
            {/* BREADCRUMB */}
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
              <span>›</span>
              <Link href="/conflicts" style={{ color: 'var(--text-muted)' }}>Conflicts</Link>
              <span>›</span>
              <span style={{ color: 'var(--text-secondary)' }}>{conflict.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ maxWidth: '680px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span className={`badge badge-${level}`}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                    {level.charAt(0).toUpperCase() + level.slice(1)} Intensity
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{conflict.region}</span>
                </div>

                <h1 style={{ marginBottom: '16px' }}>{conflict.name}</h1>
                <p style={{ fontSize: '16px', lineHeight: 1.7 }}>{conflict.summary}</p>
              </div>

              {/* CONFLICT STATS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                minWidth: '220px',
              }}>
                {[
                  { label: 'Status', value: conflict.status?.toUpperCase() || 'ACTIVE' },
                  { label: 'Intensity', value: `${conflict.intensity || '?'}/10` },
                  { label: 'Started', value: conflict.started ? format(new Date(conflict.started), 'MMM yyyy') : 'Unknown' },
                  { label: 'Years Active', value: yearsActive !== null ? `${yearsActive}+ yrs` : 'Unknown' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COUNTRIES INVOLVED */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Involved:</span>
              {(conflict.countries || []).map(c => (
                <span key={c} style={{
                  fontSize: '12px', padding: '3px 10px',
                  borderRadius: '4px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── POSTS ─────────────────────────────────────────── */}
        <div className="container" style={{ padding: '40px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '4px', height: '24px', background: conflict.color || '#EF4444', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '20px' }}>All Reports</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({posts.length} reports)</span>
          </div>

          {posts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📡</div>
              <h3 style={{ marginBottom: '8px' }}>Collecting data...</h3>
              <p>First report will be generated in the next update cycle.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {posts.map((post, i) => (
                <PostCard key={post.slug} post={post} size={i === 0 ? 'large' : 'normal'} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { db: adminDb } = require('../../lib/firebase-admin');
    const { id } = params;

    const [conflictSnap, postsSnap] = await Promise.all([
      adminDb.collection('conflicts').doc(id).get(),
      adminDb.collection('posts')
        .where('conflictId', '==', id)
        .where('isPublished', '==', true)
        .orderBy('publishedTimestamp', 'desc')
        .limit(20)
        .get(),
    ]);

    if (!conflictSnap.exists) return { notFound: true };

    return {
      props: {
        conflict: JSON.parse(JSON.stringify({ id: conflictSnap.id, ...conflictSnap.data() })),
        posts: JSON.parse(JSON.stringify(postsSnap.docs.map(d => d.data()))),
      },
    };
  } catch (err) {
    console.error('Conflict page error:', err.message);
    return { notFound: true };
  }
}
