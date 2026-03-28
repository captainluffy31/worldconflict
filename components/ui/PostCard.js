import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, size = 'normal' }) {
  // ✅ FIX: Server aur client ka time alag hota hai — isliye pehle static date dikhao
  // phir client side pe timeAgo set karo
  const [timeAgo, setTimeAgo] = useState('Recently');

  useEffect(() => {
    if (post.publishedAt) {
      setTimeAgo(formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }));
    }
  }, [post.publishedAt]);

  const isLarge = size === 'large';

  return (
    <Link href={`/conflict/${post.conflictId}/${post.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: isLarge ? '24px' : '18px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'var(--transition)',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* META */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#EF4444',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'rgba(239,68,68,0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            {post.region || post.conflictName}
          </span>
          {post.videos?.length > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#3B82F6',
              background: 'rgba(59,130,246,0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(59,130,246,0.2)',
            }}>
              🎥 {post.videos.length} video{post.videos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* HEADLINE */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: isLarge ? '20px' : '15px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          flex: 1,
        }}>
          {post.headline}
        </h3>

        {/* SUMMARY */}
        {isLarge && post.summary && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {post.summary}
          </p>
        )}

        {/* BOTTOM */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          paddingTop: '10px',
          marginTop: 'auto',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo}</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-red)' }}>
            Read →
          </span>
        </div>
      </article>
    </Link>
  );
}