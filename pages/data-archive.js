import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const TYPE_CONFIG = {
  news: { label: '📰 News', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  telegram: { label: '✈️ Telegram', color: '#2AABEE', bg: 'rgba(42,171,238,0.1)' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }) + ' IST';
}

function formatDateKey(iso) {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function DataArchive({ groupedData, conflicts, stats }) {
  const [selectedConflict, setSelectedConflict] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  // Filter data
  const filteredDates = Object.entries(groupedData)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => {
      const filtered = items.filter(item => {
        const matchConflict = selectedConflict === 'all' || item.conflictId === selectedConflict;
        const matchType = selectedType === 'all' || item.type === selectedType;
        const matchDate = selectedDate === 'all' || date === selectedDate;
        const matchSearch = !searchQuery ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.source?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchConflict && matchType && matchDate && matchSearch;
      });
      return [date, filtered];
    })
    .filter(([, items]) => items.length > 0);

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const totalFiltered = filteredDates.reduce((sum, [, items]) => sum + items.length, 0);

  return (
    <>
      <Head>
        <title>Data Archive — WorldConflict.online</title>
        <meta name="description" content="Complete archive of all collected conflict intelligence data, organized by date and category." />
      </Head>

      <Navbar />

      <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <section style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '32px 0',
        }}>
          <div className="container">
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '8px' }}>
              🗄️ Intelligence Data Archive
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Complete historical record of all collected news and Telegram intelligence — date-wise, category-wise.
            </p>

            {/* STATS ROW */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Records', value: stats.total.toLocaleString(), color: '#3B82F6' },
                { label: 'News Articles', value: stats.news.toLocaleString(), color: '#10B981' },
                { label: 'Telegram Posts', value: stats.telegram.toLocaleString(), color: '#2AABEE' },
                { label: 'Conflicts Tracked', value: stats.conflicts, color: '#F59E0B' },
                { label: 'Days of Data', value: stats.days, color: '#8B5CF6' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '100px',
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container" style={{ padding: '24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

            {/* ── SIDEBAR FILTERS ── */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              position: 'sticky',
              top: '20px',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                🔍 Filters
              </div>

              {/* SEARCH */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px', color: 'var(--text-primary)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* TYPE FILTER */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Data Type
                </div>
                {[
                  { value: 'all', label: '🌐 All Types' },
                  { value: 'news', label: '📰 News Only' },
                  { value: 'telegram', label: '✈️ Telegram Only' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setSelectedType(opt.value)}
                    style={{
                      padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '12px', marginBottom: '3px',
                      background: selectedType === opt.value ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: selectedType === opt.value ? '#3B82F6' : 'var(--text-secondary)',
                      fontWeight: selectedType === opt.value ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>

              {/* CONFLICT FILTER */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Conflict
                </div>
                <div
                  onClick={() => setSelectedConflict('all')}
                  style={{
                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '12px', marginBottom: '3px',
                    background: selectedConflict === 'all' ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: selectedConflict === 'all' ? '#3B82F6' : 'var(--text-secondary)',
                    fontWeight: selectedConflict === 'all' ? 600 : 400,
                  }}
                >
                  🌐 All Conflicts
                </div>
                {conflicts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConflict(c.id)}
                    style={{
                      padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '12px', marginBottom: '3px',
                      background: selectedConflict === c.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: selectedConflict === c.id ? '#3B82F6' : 'var(--text-secondary)',
                      fontWeight: selectedConflict === c.id ? 600 : 400,
                    }}
                  >
                    {c.name}
                    <span style={{ float: 'right', fontSize: '10px', color: 'var(--text-muted)' }}>{c.count}</span>
                  </div>
                ))}
              </div>

              {/* DATE FILTER */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Date
                </div>
                <div
                  onClick={() => setSelectedDate('all')}
                  style={{
                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '12px', marginBottom: '3px',
                    background: selectedDate === 'all' ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: selectedDate === 'all' ? '#3B82F6' : 'var(--text-secondary)',
                    fontWeight: selectedDate === 'all' ? 600 : 400,
                  }}
                >
                  📅 All Dates
                </div>
                {Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '11px', marginBottom: '3px',
                      background: selectedDate === date ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: selectedDate === date ? '#3B82F6' : 'var(--text-secondary)',
                      fontWeight: selectedDate === date ? 600 : 400,
                    }}
                  >
                    {date}
                    <span style={{ float: 'right', fontSize: '10px', color: 'var(--text-muted)' }}>
                      {groupedData[date].length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div>
              {/* Results count */}
              <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{totalFiltered.toLocaleString()}</strong> records
                {searchQuery && <> matching "<strong style={{ color: '#3B82F6' }}>{searchQuery}</strong>"</>}
              </div>

              {filteredDates.length === 0 ? (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '60px',
                  textAlign: 'center', color: 'var(--text-muted)',
                }}>
                  No data found for selected filters.
                </div>
              ) : (
                filteredDates.map(([date, items]) => (
                  <div key={date} style={{ marginBottom: '16px' }}>
                    {/* DATE HEADER */}
                    <div
                      onClick={() => toggleDate(date)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: expandedDates[date] ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          📅 {formatDateKey(date + 'T00:00:00')}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: 700,
                          background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                          border: '1px solid rgba(59,130,246,0.2)',
                          padding: '2px 8px', borderRadius: '10px',
                        }}>
                          {items.length} records
                        </span>
                        {/* Mini breakdown */}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          📰 {items.filter(i => i.type === 'news').length} news
                          · ✈️ {items.filter(i => i.type === 'telegram').length} telegram
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {expandedDates[date] ? '▲' : '▼'}
                      </span>
                    </div>

                    {/* ITEMS */}
                    {expandedDates[date] && (
                      <div style={{
                        border: '1px solid var(--border)',
                        borderTop: 'none',
                        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                        overflow: 'hidden',
                      }}>
                        {items.map((item, idx) => {
                          const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.news;
                          return (
                            <div key={idx} style={{
                              padding: '14px 16px',
                              borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                              background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)',
                            }}>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>

                                {/* TYPE BADGE */}
                                <span style={{
                                  fontSize: '10px', fontWeight: 700,
                                  background: typeConf.bg, color: typeConf.color,
                                  border: `1px solid ${typeConf.color}33`,
                                  padding: '2px 8px', borderRadius: '4px',
                                  flexShrink: 0, marginTop: '2px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {typeConf.label}
                                </span>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {/* TITLE / TEXT */}
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' }}>
                                    {item.type === 'news' ? item.title : item.text?.substring(0, 120) + '...'}
                                  </div>

                                  {/* DESCRIPTION */}
                                  {item.type === 'news' && item.description && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                                      {item.description.substring(0, 200)}
                                      {item.description.length > 200 ? '...' : ''}
                                    </div>
                                  )}
                                  {item.type === 'telegram' && item.text?.length > 120 && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                                      {item.text.substring(120, 350)}
                                      {item.text.length > 350 ? '...' : ''}
                                    </div>
                                  )}

                                  {/* META ROW */}
                                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{
                                      fontSize: '10px', fontWeight: 700,
                                      color: '#EF4444',
                                      background: 'rgba(239,68,68,0.1)',
                                      padding: '1px 7px', borderRadius: '4px',
                                      border: '1px solid rgba(239,68,68,0.2)',
                                    }}>
                                      {item.conflictName || item.conflictId}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      {item.type === 'news' ? `📰 ${item.source}` : `✈️ ${item.channel}`}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      🕒 {formatDate(item.publishedAt)}
                                    </span>
                                    {item.hasVideo && (
                                      <span style={{ fontSize: '10px', color: '#3B82F6' }}>🎥 Has Video</span>
                                    )}
                                    {(item.url || item.telegramLink) && (
                                      <a
                                        href={item.url || item.telegramLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '11px', color: '#3B82F6', textDecoration: 'none' }}
                                      >
                                        View Source →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
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
    const { db: adminDb } = require('../../lib/firebase-admin');

    // ✅ Fetch ALL raw_data — no limit, no time cutoff
    const snap = await adminDb.collection('raw_data')
      .orderBy('publishedTimestamp', 'desc')
      .get();

    const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Group by date (YYYY-MM-DD)
    const groupedData = {};
    const conflictCounts = {};

    for (const item of allItems) {
      const date = item.publishedAt
        ? item.publishedAt.substring(0, 10)
        : item.collectedAt?.substring(0, 10) || 'unknown';

      if (!groupedData[date]) groupedData[date] = [];
      groupedData[date].push(item);

      // Count per conflict
      if (item.conflictId) {
        conflictCounts[item.conflictId] = conflictCounts[item.conflictId] || { id: item.conflictId, name: item.conflictName || item.conflictId, count: 0 };
        conflictCounts[item.conflictId].count++;
      }
    }

    const stats = {
      total: allItems.length,
      news: allItems.filter(i => i.type === 'news').length,
      telegram: allItems.filter(i => i.type === 'telegram').length,
      conflicts: Object.keys(conflictCounts).length,
      days: Object.keys(groupedData).length,
    };

    const conflicts = Object.values(conflictCounts).sort((a, b) => b.count - a.count);

    return {
      props: {
        groupedData: JSON.parse(JSON.stringify(groupedData)),
        conflicts,
        stats,
      },
    };
  } catch (err) {
    console.error('Data archive error:', err);
    return {
      props: { groupedData: {}, conflicts: [], stats: { total: 0, news: 0, telegram: 0, conflicts: 0, days: 0 } },
    };
  }
}
