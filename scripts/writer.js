require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../lib/firebase-admin');
const CONFLICTS = require('../lib/conflicts-data');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── GENERATE BLOG POST ───────────────────────────────────────────
async function generateBlogPost(conflict, newsItems, telegramItems) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const newsSummary = newsItems
    .slice(0, 8)
    .map(n => `- [${n.source}] ${n.title}: ${n.description?.substring(0, 300)}`)
    .join('\n');

  const telegramSummary = telegramItems
    .slice(0, 6)
    .map(t => `- [@${t.channel}] ${t.text?.substring(0, 300)}`)
    .join('\n');

  const videoItems = telegramItems.filter(t => t.hasVideo).slice(0, 3);

  const prompt = `You are a senior war correspondent and conflict analyst writing for WorldConflict.online — a premium global conflict tracking publication read by diplomats, journalists, and policy makers worldwide.

Your writing style: BBC World Service meets Foreign Affairs magazine. Authoritative, precise, deeply contextual, and gripping without being sensational.

CONFLICT: "${conflict.name}"
Region: ${conflict.region}
Conflict started: ${conflict.started}
Background context: ${conflict.summary}

LATEST NEWS SOURCES (last 4-6 hours):
${newsSummary || 'No new RSS articles found — write based on most recent known situation.'}

TELEGRAM INTELLIGENCE REPORTS:
${telegramSummary || 'No new Telegram updates — write based on most recent known situation.'}

Write an in-depth, comprehensive conflict report as a JSON object ONLY (no markdown, no explanation, no extra text).

Requirements for each field:
- "headline": Punchy, specific, present-tense headline under 12 words. Must reference actual development, not generic.
- "subheadline": One sharp sentence that adds crucial detail the headline omits.
- "summary": 3-4 sentences. Cover WHO did WHAT, WHERE, WHY it matters, and immediate consequences. This is the hook — make it gripping.
- "body.latest_developments": MINIMUM 4-5 detailed paragraphs. Cover: specific military/political actions with locations and names, casualty figures if available, territorial changes, key statements from officials, chronological breakdown of events in the last 6 hours. Use specific details — not vague generalities.
- "body.background": 2-3 solid paragraphs giving essential historical and geopolitical context. Explain root causes, key factions involved, how the conflict evolved to this point. Essential for readers new to this conflict.
- "body.international_reaction": 2 paragraphs. Name specific countries, organizations (UN, NATO, EU, AU etc), and their exact positions or statements. Include any sanctions, diplomatic moves, or military aid decisions.
- "body.what_to_watch": 2 paragraphs. Identify 3-4 specific upcoming flashpoints, diplomatic meetings, deadlines, or military objectives that will shape this conflict in the next 24-72 hours. Be specific and analytical.
- "intensity": Integer 1-10 based on active casualties, territorial changes, and escalation risk.
- "intensityReason": 2 sentences explaining the intensity score with specific evidence.
- "tags": 6-8 highly searchable keywords including country names, faction names, key locations.
- "metaDescription": SEO description under 160 chars, include conflict name and key development.
- "keyFacts": Array of 5-7 specific, verifiable facts with numbers/dates where possible (casualties, distances, dates, troop numbers etc).
- "conflictStatus": One of: "escalating"|"stable"|"de-escalating"|"ceasefire"|"critical"

JSON format:
{
  "headline": "...",
  "subheadline": "...",
  "summary": "...",
  "body": {
    "latest_developments": "...",
    "background": "...",
    "international_reaction": "...",
    "what_to_watch": "..."
  },
  "intensity": 8,
  "intensityReason": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "metaDescription": "...",
  "keyFacts": ["fact1", "fact2", "fact3", "fact4", "fact5"],
  "conflictStatus": "escalating"
}

STRICT RULES:
- Output JSON only — zero other text
- Every body section must be DETAILED and SUBSTANTIVE — minimum 150 words each
- Use specific names, locations, dates, and figures wherever possible
- If no new data available, write the most detailed, accurate summary of the current known situation
- Never write vague filler like "the situation continues" — always be specific
- Write at a level that would satisfy a foreign policy professional

${conflict.id === 'usa-global-standing' ? `
SPECIAL TONE INSTRUCTIONS FOR THIS CONFLICT:
This is a satirical-but-factual analysis of US foreign policy chaos. Use dry wit and sharp sarcasm in headlines and summaries — think The Economist meets The Daily Show.
- Headline must be sarcastic/ironic — e.g. "America First: Everyone Else Also Leaving", "Trump Discovers Allies Were Actually Useful", "US Tariffs Hit Everyone Including Countries That Don't Exist Yet"
- Subheadline should twist the knife with a factual-but-absurd follow-up
- Summary should be gripping and slightly sardonic — factual but with raised eyebrow energy
- Body sections should be factual and detailed but written with dry wit
- keyFacts should include genuinely absurd-but-true facts with dollar amounts and dates
- Do NOT be partisan — be equally sarcastic about all sides, focus on the geopolitical absurdity
` : ''}`;


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
      summary: `The conflict in ${conflict.region} continues with significant developments. International observers are monitoring the situation closely as key stakeholders weigh their options. The humanitarian situation remains a concern for aid organizations operating in the region.`,
      body: {
        latest_developments: newsItems[0]?.description || 'Monitoring ongoing situation.',
        background: conflict.summary,
        international_reaction: 'International community continues to monitor the situation.',
        what_to_watch: 'Watch for further developments in the coming hours.',
      },
      intensity: 5,
      intensityReason: 'Ongoing conflict with no major escalation reported in recent hours.',
      tags: conflict.keywords.slice(0, 6),
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