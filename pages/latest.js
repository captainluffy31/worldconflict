import Head from 'next/head';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCard from '../components/ui/PostCard';

export default function LatestPage({ posts }) {
  return (
    <>
      <Head>
        <title>Latest Conflict Updates | WorldConflict.online</title>
        <meta name="description" content="Latest real-time updates on global conflicts. Auto-updated every 4 hours from verified sources." />
        <link rel="canonical" href="https://worldconflict.online/latest" />
      </Head>
      <Navbar />
      <main>
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="live-dot" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Live Feed
              </span>
            </div>
            <h1 style={{ marginBottom: '8px' }}>Latest Updates</h1>
            <p style={{ fontSize: '16px' }}>
              {posts.length} reports published. Auto-updated every 4 hours.
            </p>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} size={i === 0 ? 'large' : 'normal'} />
            ))}
          </div>
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
              <h3>Pipeline starting up...</h3>
              <p>First reports will appear after the initial data collection run.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const { db: adminDb } = require('../lib/firebase-admin');
    const snap = await adminDb.collection('posts')
      .where('isPublished', '==', true)
      .orderBy('publishedTimestamp', 'desc')
      .limit(24)
      .get();
    const posts = snap.docs.map(d => d.data());
    return { props: { posts: JSON.parse(JSON.stringify(posts)) } };
  } catch (err) {
    return { props: { posts: [] } };
  }
}
