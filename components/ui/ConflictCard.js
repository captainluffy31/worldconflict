import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

function intensityLabel(score) {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 5) return 'medium';
  if (score >= 3) return 'low';
  return 'monitoring';
}

function intensityText(score) {
  if (score >= 9) return 'Critical';
  if (score >= 7) return 'High';
  if (score >= 5) return 'Medium';
  if (score >= 3) return 'Low';
  return 'Monitoring';
}

export default function ConflictCard({ conflict, featured = false }) {
  const level = intensityLabel(conflict.intensity || 5);
  const timeAgo = conflict.lastUpdated
    ? formatDistanceToNow(new Date(conflict.lastUpdated), { addSuffix: true })
    : 'Recently';

  return (
    <Link href={`/conflicts/${conflict.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: featured ? '24px' : '18px',
        cursor: 'pointer',
        transition: 'var(--transition)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = conflict.color || '#EF4444';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* COLOR ACCENT */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: conflict.color || '#EF4444',
        }} />

        {/* TOP ROW */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}>
              {conflict.region}
            </div>
            <h3 style={{
              fontSize: featured ? '18px' : '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1.25,
            }}>
              {conflict.name}
            </h3>
          </div>

          {/* INTENSITY BADGE */}
          <span className={`badge badge-${level}`} style={{ flexShrink: 0, marginTop: '2px' }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'currentColor',
              display: 'inline-block',
            }} />
            {intensityText(conflict.intensity || 5)}
          </span>
        </div>

        {/* LATEST HEADLINE */}
        {conflict.latestHeadline && (
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            flex: 1,
          }}>
            {conflict.latestHeadline}
          </p>
        )}

        {/* COUNTRIES */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(conflict.countries || []).map(c => (
            <span key={c} style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {c}
            </span>
          ))}
        </div>

        {/* BOTTOM ROW */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          paddingTop: '10px',
          marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#10B981' }}>
            <span className="live-dot" />
            {timeAgo}
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: conflict.color || '#EF4444',
          }}>
            Read updates →
          </span>
        </div>
      </div>
    </Link>
  );
}
