import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Custom404() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌍</div>
          <h1 style={{ fontSize: '48px', marginBottom: '12px', color: 'var(--accent-red)' }}>404</h1>
          <h2 style={{ marginBottom: '16px' }}>Page Not Found</h2>
          <p style={{ marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
            This page doesn't exist. The conflict report may have been removed or the URL may be incorrect.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">← Back to Home</Link>
            <Link href="/latest" className="btn btn-ghost">Latest Updates</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
