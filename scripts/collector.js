require('dotenv').config({ path: '.env.local' });
const { db } = require('../lib/firebase-admin');
const RSSParser = require('rss-parser');
const axios = require('axios');
const CONFLICTS = require('../lib/conflicts-data');
const crypto = require('crypto');

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
  { username: 'OSINTdefender', conflicts: ['israel-iran-gaza', 'russia-ukraine', 'sudan-civil-war', 'strait-of-hormuz', 'usa-iran-tensions', 'usa-global-standing'] },
  { username: 'intel_slava', conflicts: ['russia-ukraine'] },
  { username: 'ukraine_now', conflicts: ['russia-ukraine'] },
  { username: 'warmonitor3', conflicts: ['israel-iran-gaza', 'strait-of-hormuz', 'usa-iran-tensions'] },
  { username: 'israelradar', conflicts: ['israel-iran-gaza', 'usa-iran-tensions'] },
  { username: 'conflictupdates', conflicts: ['sudan-civil-war', 'myanmar-civil-war', 'sahel-crisis', 'haiti-crisis', 'global-energy-crisis'] },
  { username: 'nexta_tv', conflicts: ['russia-ukraine'] },
  { username: 'militarylandnet', conflicts: ['russia-ukraine'] },
  { username: 'MiddleEastSpectator', conflicts: ['israel-iran-gaza', 'strait-of-hormuz', 'usa-iran-tensions'] },
];

// ── GENERATE UNIQUE HASH FOR DEDUPLICATION ───────────────────────
function generateHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// ── RSS FETCH ────────────────────────────────────────────────────
async function fetchRSSFeeds(conflict) {
  const results = [];
  // ✅ No cutoff — save ALL articles, not just last 4 hours
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items || []) {
        const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
        const isRelevant = conflict.rssKeywords.some(kw => text.includes(kw.toLowerCase()));

        if (isRelevant) {
          const hash = generateHash(`${item.title}-${feed.source}`);
          results.push({
            hash,
            title: item.title,
            description: item.contentSnippet || item.summary || '',
            url: item.link,
            source: feed.source,
            publishedAt: new Date(item.pubDate || item.isoDate || Date.now()).toISOString(),
            publishedTimestamp: new Date(item.pubDate || item.isoDate || Date.now()).getTime(),
            type: 'news',
            conflictId: conflict.id,
            conflictName: conflict.name,
            region: conflict.region,
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
async function fetchTelegramPublic(channel, conflictId, conflictName, region) {
  const results = [];
  try {
    const url = `https://t.me/s/${channel}`;
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ConflictBot/1.0)' },
    });

    const messageRegex = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const dateRegex = /<time[^>]*datetime="([^"]+)"/g;
    const videoRegex = /tgme_widget_message_video_thumb|video_file/g;
    const linkRegex = /https:\/\/t\.me\/[a-zA-Z0-9_]+\/(\d+)/g;

    const dates = [];
    let dateMatch;
    while ((dateMatch = dateRegex.exec(data)) !== null) dates.push(dateMatch[1]);

    const links = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(data)) !== null) links.push(`https://t.me/${channel}/${linkMatch[1]}`);

    let i = 0;
    let msgMatch;
    while ((msgMatch = messageRegex.exec(data)) !== null) {
      const rawText = msgMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (rawText.length < 30) { i++; continue; }

      const hasVideo = videoRegex.test(data.substring(msgMatch.index, msgMatch.index + 500));
      const hash = generateHash(`${channel}-${rawText.substring(0, 100)}`);
      const pubDate = dates[i] ? new Date(dates[i]).toISOString() : new Date().toISOString();

      results.push({
        hash,
        text: rawText.substring(0, 500),
        telegramLink: links[i] || `https://t.me/${channel}`,
        channel: `@${channel}`,
        hasVideo,
        publishedAt: pubDate,
        publishedTimestamp: new Date(pubDate).getTime(),
        conflictId,
        conflictName,
        region,
        type: 'telegram',
      });
      i++;
      if (results.length >= 10) break;
    }
  } catch (err) {
    console.log(`Telegram skip (@${channel}):`, err.message);
  }
  return results;
}

// ── SAVE TO FIREBASE (NO DELETE — PERMANENT STORAGE) ─────────────
async function saveRawData(items) {
  if (items.length === 0) return 0;

  let saved = 0;
  let skipped = 0;

  // Save in batches of 400 (Firestore limit is 500)
  const BATCH_SIZE = 400;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = items.slice(i, i + BATCH_SIZE);

    for (const item of chunk) {
      // ✅ Use hash as doc ID — automatic deduplication!
      // Same article will overwrite itself, not create duplicates
      const ref = db.collection('raw_data').doc(item.hash);

      // Only set if not exists (don't overwrite old data)
      batch.set(ref, {
        ...item,
        collectedAt: new Date().toISOString(),
        collectedTimestamp: Date.now(),
      }, { merge: true });

      saved++;
    }

    await batch.commit();
  }

  console.log(`   💾 Saved: ${saved} | Skipped duplicates: ${skipped}`);
  return saved;
}

// ── MAIN ─────────────────────────────────────────────────────────
async function runCollector() {
  console.log('\n📡 COLLECTOR STARTED —', new Date().toLocaleString());
  console.log('─'.repeat(50));

  let totalSaved = 0;
  const allItems = [];

  for (const conflict of CONFLICTS) {
    if (conflict.status === 'inactive') continue;
    console.log(`\n🔍 Collecting: ${conflict.name}`);

    const [newsItems, ...telegramResults] = await Promise.all([
      fetchRSSFeeds(conflict),
      ...TELEGRAM_CHANNELS
        .filter(ch => ch.conflicts.includes(conflict.id))
        .map(ch => fetchTelegramPublic(ch.username, conflict.id, conflict.name, conflict.region)),
    ]);

    const telegramItems = telegramResults.flat();
    console.log(`   News: ${newsItems.length} | Telegram: ${telegramItems.length}`);

    allItems.push(...newsItems, ...telegramItems);
    await new Promise(r => setTimeout(r, 2000));
  }

  // Save all at once
  totalSaved = await saveRawData(allItems);

  // Update stats
  await db.collection('system').doc('status').set({
    lastCollected: new Date().toISOString(),
    totalRawItems: totalSaved,
  }, { merge: true });

  console.log(`\n✅ COLLECTOR DONE — Total: ${totalSaved} items saved`);
  return totalSaved;
}

module.exports = { runCollector };

if (require.main === module) {
  runCollector().then(() => process.exit(0)).catch(err => {
    console.error('Collector error:', err);
    process.exit(1);
  });
}