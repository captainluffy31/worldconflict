import Head from 'next/head';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ConflictCard from '../../components/ui/ConflictCard';

export default function ConflictsPage({ conflicts }) {
  const byRegion = conflicts.reduce((acc, c) => {
    if (!acc[c.region]) acc[c.region] = [];
    acc[c.region].push(c);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>All Active Conflicts 2025 | WorldConflict.online</title>
        <meta name="description" content="Complete list of all active wars and conflicts monitored worldwide in 2025. Iran-Israel, Russia-Ukraine, Sudan, Myanmar, Sahel and more." />
        <link rel="canonical" href="https://worldconflict.online/conflicts" />
      </Head>
      <Navbar />
      <main>
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div className="container">
            <h1 style={{ marginBottom: '8px' }}>All Active Conflicts</h1>
            <p style={{ fontSize: '16px' }}>
              Monitoring {conflicts.length} conflicts across {Object.keys(byRegion).length} regions. Updated every 4 hours.
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 20px 60px' }}>
          {Object.entries(byRegion).map(([region, regionConflicts]) => (
            <div key={region} style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '22px', background: regionConflicts[0]?.color || '#EF4444', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '18px' }}>{region}</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 10px' }}>
                  {regionConflicts.length} conflict{regionConflicts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {regionConflicts.map(c => <ConflictCard key={c.id} conflict={c} />)}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const { db: adminDb } = require('../../lib/firebase-admin');
    const snap = await adminDb.collection('conflicts').orderBy('intensity', 'desc').get();
    const conflicts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { props: { conflicts: JSON.parse(JSON.stringify(conflicts)) } };
  } catch (err) {
    return { props: { conflicts: [] } };
  }
}
