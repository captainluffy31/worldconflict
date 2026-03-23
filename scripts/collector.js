require('dotenv').config({ path: '.env.local' });
const { db } = require('../lib/firebase-admin');
const RSSParser = require('rss-parser');
const axios = require('axios');
const CONFLICTS = require('../lib/conflicts-data');

const parser = new RSSParser();

// ── RSS FEEDS ────────────────────────────────────────────────────
const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times' },
  { url: 'https://feeds.reuters.com/reuters/worldNews', source: 'Reuters' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post' },
];

// ── TELEGRAM PUBLIC CHANNELS ────────────────────────────────────
const TELEGRAM_CHANNELS = [
  { username: 'OSINTdefender', conflicts: ['israel-iran-gaza', 'russia-ukraine', 'sudan-civil-war'] },
  { username: 'intel_slava', conflicts: ['russia-ukraine'] },
  { username: 'ukraine_now', conflicts: ['russia-ukraine'] },
  { username: 'warmonitor3', conflicts: ['israel-iran-gaza'] },
  { username: 'israelradar', conflicts: ['israel-iran-gaza'] },
  { username: 'conflictupdates', conflicts: ['sudan-civil-war', 'myanmar-civil-war', 'sahel-crisis', 'haiti-crisis'] },
  { username: 'nexta_tv', conflicts: ['russia-ukraine'] },
  { username: 'militarylandnet', conflicts: ['russia-ukraine'] },
];

// ── NEWSAPI ─────────────────────────────────────────────────────
async function fetchNewsAPI(keywords) {
  try {
    const query = keywords.slice(0, 3).join(' OR ');
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${process.env.NEWS_API_KEY}`;
    const { data } = await axios.get(url, { timeout: 10000 });
    return data.articles || [];
  } catch (err) {
    console.log('NewsAPI skip:', err.message);
    return [];
  }
}

// ── RSS FETCH ────────────────────────────────────────────────────
async function fetchRSSFeeds(conflict) {
  const results = [];
  const cutoff = Date.now() - 4 * 3600 * 1000; // last 4 hours

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items || []) {
        const pubDate = new Date(item.pubDate || item.isoDate).getTime();
        if (pubDate < cutoff) continue;

        const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
        const isRelevant = conflict.rssKeywords.some(kw => text.includes(kw.toLowerCase()));

        if (isRelevant) {
          results.push({
            title: item.title,
            description: item.contentSnippet || item.summary || '',
            url: item.link,
            source: feed.source,
            publishedAt: new Date(item.pubDate || item.isoDate).toISOString(),
            type: 'news',
          });
        }
      }
    } catch (err) {
      console.log(`RSS skip (${feed.source}):`, err.message);
    }
  }
  return results;
}

// ── TELEGRAM PUBLIC SCRAPER ──────────────────────────────────────
async function fetchTelegramPublic(channel, conflictId) {
  const results = [];
  try {
    // Use Telegram's public preview endpoint
    const url = `https://t.me/s/${channel}`;
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ConflictBot/1.0)' },
    });

    // Extract messages using regex from the HTML
    const messageRegex = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const dateRegex = /<time[^>]*datetime="([^"]+)"/g;
    const videoRegex = /tgme_widget_message_video_thumb|video_file/g;
    const linkRegex = /https:\/\/t\.me\/[a-zA-Z0-9_]+\/(\d+)/g;

    let msgMatch;
    const cutoff = Date.now() - 4 * 3600 * 1000;

    const dates = [];
    let dateMatch;
    while ((dateMatch = dateRegex.exec(data)) !== null) {
      dates.push(dateMatch[1]);
    }

    const links = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(data)) !== null) {
      links.push(`https://t.me/${channel}/${linkMatch[1]}`);
    }

    let i = 0;
    while ((msgMatch = messageRegex.exec(data)) !== null) {
      const rawText = msgMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (rawText.length < 30) { i++; continue; }

      const pubDate = dates[i] ? new Date(dates[i]).getTime() : Date.now();
      if (pubDate < cutoff) { i++; continue; }

      const hasVideo = videoRegex.test(data.substring(msgMatch.index, msgMatch.index + 500));

      results.push({
        text: rawText.substring(0, 500),
        telegramLink: links[i] || `https://t.me/${channel}`,
        channel: `@${channel}`,
        hasVideo,
        publishedAt: dates[i] ? new Date(dates[i]).toISOString() : new Date().toISOString(),
        conflictId,
        type: 'telegram',
      });
      i++;
      if (results.length >= 5) break;
    }
  } catch (err) {
    console.log(`Telegram skip (@${channel}):`, err.message);
  }
  return results;
}

// ── SAVE TO FIREBASE ─────────────────────────────────────────────
async function saveRawData(conflictId, newsItems, telegramItems) {
  const batch = db.batch();
  const collectedAt = new Date().toISOString();
  let count = 0;

  for (const item of newsItems) {
    const ref = db.collection('raw_data').doc();
    batch.set(ref, { ...item, conflictId, collectedAt });
    count++;
  }

  for (const item of telegramItems) {
    const ref = db.collection('raw_data').doc();
    batch.set(ref, { ...item, conflictId, collectedAt });
    count++;
  }

  if (count > 0) await batch.commit();
  return count;
}

// ── MAIN ─────────────────────────────────────────────────────────
async function runCollector() {
  console.log('\n📡 COLLECTOR STARTED —', new Date().toLocaleString());
  console.log('─'.repeat(50));

  let totalSaved = 0;

  for (const conflict of CONFLICTS) {
    if (conflict.status === 'inactive') continue;
    console.log(`\n🔍 Collecting: ${conflict.name}`);

    // Fetch from all sources in parallel
    const [newsItems, ...telegramResults] = await Promise.all([
      fetchRSSFeeds(conflict),
      ...TELEGRAM_CHANNELS
        .filter(ch => ch.conflicts.includes(conflict.id))
        .map(ch => fetchTelegramPublic(ch.username, conflict.id)),
    ]);

    const telegramItems = telegramResults.flat();

    console.log(`   News: ${newsItems.length} | Telegram: ${telegramItems.length}`);

    const saved = await saveRawData(conflict.id, newsItems, telegramItems);
    totalSaved += saved;

    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }

  // Update last collection timestamp
  await db.collection('system').doc('status').set({
    lastCollected: new Date().toISOString(),
    totalSaved,
  }, { merge: true });

  console.log(`\n✅ COLLECTOR DONE — Saved ${totalSaved} items`);
  return totalSaved;
}

module.exports = { runCollector };

if (require.main === module) {
  runCollector().then(() => process.exit(0)).catch(err => {
    console.error('Collector error:', err);
    process.exit(1);
  });
}
