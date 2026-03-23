require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../lib/firebase-admin');
const CONFLICTS = require('../lib/conflicts-data');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── GENERATE BLOG POST ───────────────────────────────────────────
async function generateBlogPost(conflict, newsItems, telegramItems) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const newsSummary = newsItems
    .slice(0, 6)
    .map(n => `- [${n.source}] ${n.title}: ${n.description?.substring(0, 150)}`)
    .join('\n');

  const telegramSummary = telegramItems
    .slice(0, 5)
    .map(t => `- [@${t.channel}] ${t.text?.substring(0, 200)}`)
    .join('\n');

  const videoItems = telegramItems.filter(t => t.hasVideo).slice(0, 3);

  const prompt = `You are a professional conflict journalist writing for a global news tracker website.

Write a comprehensive, factual news update about: "${conflict.name}"
Region: ${conflict.region}
Conflict started: ${conflict.started}
Background: ${conflict.summary}

LATEST NEWS (last 4 hours):
${newsSummary || 'No new RSS articles found.'}

TELEGRAM INTELLIGENCE:
${telegramSummary || 'No new Telegram updates found.'}

Write a JSON response ONLY (no markdown, no explanation):
{
  "headline": "Compelling news headline under 12 words, present tense",
  "subheadline": "One sentence elaborating the main development",
  "summary": "2-3 sentence executive summary for quick reading",
  "body": {
    "latest_developments": "2-3 paragraphs about what happened in last 4-6 hours",
    "background": "1-2 paragraphs of context for new readers",
    "international_reaction": "1 paragraph about how world powers are responding",
    "what_to_watch": "1 paragraph about what to expect next"
  },
  "intensity": 8,
  "intensityReason": "Brief reason for intensity score (1-10)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "metaDescription": "SEO meta description under 160 chars",
  "keyFacts": ["fact1", "fact2", "fact3"],
  "conflictStatus": "escalating|stable|de-escalating|ceasefire|critical"
}

Rules:
- Be factual, not sensational
- If no new developments, summarize recent known situation
- Intensity 1-3=low, 4-6=medium, 7-8=high, 9-10=critical
- Tags should be searchable keywords
- JSON only, no other text`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, videoItems };
  } catch (err) {
    console.error('AI parse error:', err.message);
    // Fallback structure
    return {
      headline: `${conflict.name}: Latest Updates`,
      subheadline: `Ongoing situation in ${conflict.region}`,
      summary: `The conflict in ${conflict.region} continues. Monitor for latest developments.`,
      body: {
        latest_developments: newsItems[0]?.description || 'Monitoring ongoing situation.',
        background: conflict.summary,
        international_reaction: 'International community continues to monitor the situation.',
        what_to_watch: 'Watch for further developments in the coming hours.',
      },
      intensity: 5,
      intensityReason: 'Ongoing conflict',
      tags: conflict.keywords.slice(0, 4),
      metaDescription: `Latest updates on ${conflict.name}. Real-time conflict tracking on WorldConflict.online`,
      keyFacts: [],
      conflictStatus: 'active',
      videoItems: [],
    };
  }
}

// ── GENERATE SLUG ────────────────────────────────────────────────
function generateSlug(headline, conflictId) {
  const date = new Date().toISOString().split('T')[0];
  const slug = headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
  return `${conflictId}-${date}-${slug}`;
}

// ── SAVE POST TO FIREBASE ────────────────────────────────────────
async function savePost(conflict, generated, newsItems, telegramItems) {
  const slug = generateSlug(generated.headline, conflict.id);
  const now = new Date();

  const post = {
    slug,
    conflictId: conflict.id,
    conflictName: conflict.name,
    region: conflict.region,
    headline: generated.headline,
    subheadline: generated.subheadline,
    summary: generated.summary,
    body: generated.body,
    intensity: generated.intensity,
    intensityReason: generated.intensityReason,
    tags: generated.tags,
    metaDescription: generated.metaDescription,
    keyFacts: generated.keyFacts || [],
    conflictStatus: generated.conflictStatus,
    videos: generated.videoItems.map(v => ({
      telegramLink: v.telegramLink,
      channel: v.channel,
      description: v.text?.substring(0, 100),
    })),
    sources: newsItems.slice(0, 5).map(n => ({
      title: n.title,
      url: n.url,
      source: n.source,
    })),
    publishedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    publishedTimestamp: now.getTime(),
    isPublished: true,
  };

  await db.collection('posts').doc(slug).set(post);

  // Update conflict document with latest post
  await db.collection('conflicts').doc(conflict.id).set({
    id: conflict.id,
    name: conflict.name,
    region: conflict.region,
    intensity: generated.intensity,
    status: conflict.status,
    conflictStatus: generated.conflictStatus,
    color: conflict.color,
    countries: conflict.countries,
    lat: conflict.lat,
    lng: conflict.lng,
    lastUpdated: now.toISOString(),
    latestHeadline: generated.headline,
    latestSlug: slug,
    summary: conflict.summary,
    started: conflict.started,
  }, { merge: true });

  return slug;
}

// ── MAIN ─────────────────────────────────────────────────────────
async function runWriter() {
  console.log('\n✍️  WRITER STARTED —', new Date().toLocaleString());
  console.log('─'.repeat(50));

  const cutoff = new Date(Date.now() - 5 * 3600 * 1000).toISOString();

  let postsGenerated = 0;

  for (const conflict of CONFLICTS) {
    if (conflict.status === 'inactive') continue;
    console.log(`\n📝 Writing: ${conflict.name}`);

    // Fetch raw data collected in last 5 hours
    const rawSnap = await db.collection('raw_data')
      .where('conflictId', '==', conflict.id)
      .where('collectedAt', '>', cutoff)
      .limit(30)
      .get();

    const rawItems = rawSnap.docs.map(d => d.data());
    const newsItems = rawItems.filter(r => r.type === 'news');
    const telegramItems = rawItems.filter(r => r.type === 'telegram');

    console.log(`   Data: ${newsItems.length} news, ${telegramItems.length} telegram`);

    // Generate with AI
    const generated = await generateBlogPost(conflict, newsItems, telegramItems);

    // Save to Firebase
    const slug = await savePost(conflict, generated, newsItems, telegramItems);
    console.log(`   ✅ Published: /conflict/${conflict.id}/${slug}`);

    postsGenerated++;

    // Rate limit Gemini API
    await new Promise(r => setTimeout(r, 3000));
  }

  // Update writer status
  await db.collection('system').doc('status').set({
    lastWritten: new Date().toISOString(),
    postsGenerated,
  }, { merge: true });

  console.log(`\n✅ WRITER DONE — ${postsGenerated} posts generated`);
  return postsGenerated;
}

module.exports = { runWriter };

if (require.main === module) {
  runWriter().then(() => process.exit(0)).catch(err => {
    console.error('Writer error:', err);
    process.exit(1);
  });
}
