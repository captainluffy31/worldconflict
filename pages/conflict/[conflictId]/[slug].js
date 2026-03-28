import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
// ✅ FIX 2: PostCard import add kiya
import PostCard from '../../../components/ui/PostCard';

function IntensityBar({ score }) {
  const colors = ['#10B981','#10B981','#10B981','#F59E0B','#F59E0B','#F59E0B','#F97316','#F97316','#EF4444','#EF4444'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{
            width: '16px', height: '6px',
            borderRadius: '3px',
            background: i < score ? colors[i] : 'var(--border)',
            transition: 'all 0.2s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
        {score}/10
      </span>
    </div>
  );
}

function TelegramEmbed({ video }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: '#2AABEE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '14px', flexShrink: 0,
        }}>✈️</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2AABEE' }}>
            {video.channel}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Telegram · Verified Source
          </div>
        </div>
        <a
          href={video.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#2AABEE', color: '#fff',
            padding: '6px 12px', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ▶ Watch
        </a>
      </div>
      {video.description && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          {video.description}
        </p>
      )}
      <script async src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-post={video.telegramLink?.replace('https://t.me/', '')}
        data-width="100%"
        data-userpic="false"
      />
    </div>
  );
}

export default function PostPage({ post, relatedPosts }) {
  if (!post) return (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h2>Post not found</h2>
      <Link href="/">← Back to home</Link>
    </div>
  );

  const publishDate = post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy · HH:mm') + ' UTC' : '';

  return (
    <>
      <Head>
        <title>{post.headline} | WorldConflict.online</title>
        <meta name="description" content={post.metaDescription || post.summary} />
        <meta name="keywords" content={(post.tags || []).join(', ')} />
        <meta property="og:title" content={post.headline} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:section" content={post.region} />
        {(post.tags || []).map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={`https://worldconflict.online/conflict/${post.conflictId}/${post.slug}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": post.headline,
          "description": post.summary,
          "datePublished": post.publishedAt,
          "dateModified": post.updatedAt,
          "author": { "@type": "Organization", "name": "WorldConflict.online" },
          "publisher": {
            "@type": "Organization",
            "name": "WorldConflict.online",
            "url": "https://worldconflict.online"
          },
          "keywords": (post.tags || []).join(', '),
        })}} />
      </Head>

      <Navbar />

      <main>
        <div className="container-narrow" style={{ padding: '40px 20px 60px' }}>

          {/* BREADCRUMB */}
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>›</span>
            <Link href={`/conflicts/${post.conflictId}`} style={{ color: 'var(--text-muted)' }}>{post.conflictName}</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-secondary)' }}>Report</span>
          </div>

          {/* ARTICLE HEADER */}
          <header style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.2)',
                padding: '3px 10px', borderRadius: '4px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {post.conflictName}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{post.region}</span>
              {post.videos?.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                  border: '1px solid rgba(59,130,246,0.2)',
                  padding: '3px 10px', borderRadius: '4px',
                }}>
                  🎥 {post.videos.length} Video{post.videos.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', lineHeight: 1.2, marginBottom: '12px' }}>
              {post.headline}
            </h1>

            {post.subheadline && (
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                {post.subheadline}
              </p>
            )}

            {/* META ROW */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-dot" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>Auto-generated report</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{publishDate}</span>
              <div style={{ marginLeft: 'auto' }}>
                <IntensityBar score={post.intensity || 5} />
              </div>
            </div>
          </header>

          {/* SUMMARY BOX */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid #EF4444',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            padding: '20px 24px',
            marginBottom: '32px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Quick Summary
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.7, margin: 0, color: 'var(--text-primary)' }}>
              {post.summary}
            </p>
          </div>

          {/* KEY FACTS */}
          {post.keyFacts?.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              marginBottom: '32px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                📊 Key Facts
              </div>
              {post.keyFacts.map((fact, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '6px 0',
                  borderBottom: i < post.keyFacts.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ color: '#EF4444', fontSize: '14px', flexShrink: 0 }}>◆</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{fact}</span>
                </div>
              ))}
            </div>
          )}

          {/* ARTICLE BODY */}
          <article style={{ marginBottom: '40px' }}>
            {post.body && Object.entries(post.body).map(([section, content]) => {
              const titles = {
                latest_developments: '🔴 Latest Developments',
                background: '📖 Background & Context',
                international_reaction: '🌐 International Reaction',
                what_to_watch: '👁️ What to Watch',
              };
              if (!content) return null;
              return (
                <div key={section} style={{ marginBottom: '28px' }}>
                  <h2 style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {titles[section] || section}
                  </h2>
                  <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    {content}
                  </p>
                </div>
              );
            })}
          </article>

          {/* TELEGRAM VIDEOS */}
          {post.videos?.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '18px',
                fontFamily: 'var(--font-display)',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)',
              }}>
                🎥 Video Evidence
              </h2>
              {post.videos.map((video, i) => (
                <TelegramEmbed key={i} video={video} />
              ))}
            </div>
          )}

          {/* SOURCES */}
          {post.sources?.length > 0 && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              marginBottom: '40px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Sources
              </div>
              {post.sources.map((src, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '6px 0',
                  borderBottom: i < post.sources.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    background: 'var(--bg-card)', color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    padding: '1px 7px', borderRadius: '4px',
                    flexShrink: 0,
                  }}>
                    {src.source}
                  </span>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: '13px', color: 'var(--text-link)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {src.title}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TAGS */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '12px', padding: '4px 12px',
                  borderRadius: '20px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* DISCLAIMER */}
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            padding: '14px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            lineHeight: 1.7,
          }}>
            <strong>Disclaimer:</strong> This report is auto-generated using AI from public Telegram channels and news sources. Information may be incomplete. Always verify critical information from official sources.
          </div>
        </div>

        {/* RELATED POSTS */}
        {relatedPosts?.length > 0 && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            padding: '40px 0',
          }}>
            <div className="container">
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>More on {post.conflictName}</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '14px',
              }}>
                {relatedPosts.map(p => (
                  <PostCard key={p.id || p.slug} post={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { db: adminDb } = require('../../../lib/firebase-admin');
    const { conflictId, slug } = params;

    // ✅ FIX 3: Doc ID se nahi, slug field se query kar rahe hain
    const [postSnap, relatedSnap] = await Promise.all([
      adminDb.collection('posts').where('slug', '==', slug).limit(1).get(),
      adminDb.collection('posts')
        .where('conflictId', '==', conflictId)
        .where('isPublished', '==', true)
        .orderBy('publishedTimestamp', 'desc')
        .limit(4)
        .get(),
    ]);

    if (postSnap.empty) return { notFound: true };

    const postDoc = postSnap.docs[0];
    const post = { id: postDoc.id, ...postDoc.data() };

    const relatedPosts = relatedSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.slug !== slug);

    return {
      props: {
        post: JSON.parse(JSON.stringify(post)),
        relatedPosts: JSON.parse(JSON.stringify(relatedPosts)),
      },
    };
  } catch (err) {
    console.error('Post page error FULL:', err);
    return { notFound: true };
  }
}
