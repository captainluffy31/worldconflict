import Head from 'next/head';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About | WorldConflict.online</title>
        <meta name="description" content="WorldConflict.online is an independent, automated global conflict tracking portal. Learn how we collect and process conflict data." />
        <link rel="canonical" href="https://worldconflict.online/about" />
      </Head>
      <Navbar />
      <main>
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div className="container">
            <h1 style={{ marginBottom: '8px' }}>About WorldConflict.online</h1>
            <p style={{ fontSize: '16px' }}>Independent, automated global conflict monitoring.</p>
          </div>
        </div>

        <div className="container-narrow" style={{ padding: '48px 20px 80px' }}>
          {[
            {
              title: 'What We Do',
              content: 'WorldConflict.online is an independent, automated platform that tracks active wars and armed conflicts worldwide. We collect data from verified Telegram intelligence channels, major news outlets, and open-source intelligence (OSINT) sources — then use AI to process, verify, and publish comprehensive reports every 4 hours.',
            },
            {
              title: 'Our Data Sources',
              content: 'We monitor 30+ public Telegram channels operated by verified war correspondents, OSINT researchers, and intelligence monitors. We also aggregate RSS feeds from Reuters, BBC, Al Jazeera, The Guardian, and other leading international news organisations. All sources are publicly accessible.',
            },
            {
              title: 'How Automated Updates Work',
              content: 'Our pipeline runs every 4 hours via automated GitHub Actions. The system collects raw data from all sources, filters and verifies it using Google Gemini AI, then generates structured news reports. These are automatically published to our website and sent as alerts to our Telegram channel.',
            },
            {
              title: 'Accuracy & Limitations',
              content: 'While we strive for accuracy, this site uses automated AI-assisted journalism. Information may be incomplete, delayed, or occasionally inaccurate. We recommend verifying critical information from official government or major news sources. Reports are clearly marked as auto-generated.',
            },
            {
              title: 'Independence',
              content: 'WorldConflict.online is fully independent with no political, governmental, or corporate affiliations. We do not take sides in any conflict. Our goal is to provide clear, factual information to researchers, journalists, students, and concerned citizens worldwide.',
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>{section.title}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.8 }}>{section.content}</p>
              {i < 4 && <div style={{ height: '1px', background: 'var(--border)', marginTop: '24px' }} />}
            </div>
          ))}

          {/* TECH STACK */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '36px',
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Technology Stack</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { name: 'Next.js 14', role: 'Website framework' },
                { name: 'Firebase', role: 'Real-time database' },
                { name: 'Gemini AI', role: 'Content generation' },
                { name: 'GitHub Actions', role: 'Automation scheduler' },
                { name: 'Vercel', role: 'Hosting & CDN' },
                { name: 'Telegram API', role: 'Data collection' },
              ].map((tech, i) => (
                <div key={i} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>{tech.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tech.role}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
          }}>
            <strong style={{ color: '#EF4444', display: 'block', marginBottom: '6px' }}>Important Disclaimer</strong>
            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.7 }}>
              All reports on this site are auto-generated using artificial intelligence. This site does not employ human journalists. Information should not be relied upon as the sole source for critical decisions. Always consult official sources and qualified journalists for verification.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
