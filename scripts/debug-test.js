require('dotenv').config({ path: '.env.local' });

async function runTest() {
  console.log('\n🔍 WORLDCONFLICT DEBUG TEST');
  console.log('='.repeat(50));

  console.log('\n[1] Checking environment variables...');
  const vars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'GEMINI_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID',
  ];
  vars.forEach(v => {
    const val = process.env[v];
    if (!val) {
      console.log('   MISSING: ' + v);
    } else {
      console.log('   OK: ' + v + ' = ' + val.substring(0, 25) + '...');
    }
  });

  console.log('\n[2] Testing Firebase...');
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    const db = admin.firestore();

    await db.collection('conflicts').doc('israel-iran-gaza').set({
      id: 'israel-iran-gaza',
      name: 'Israel — Iran and Gaza',
      region: 'Middle East',
      intensity: 9,
      status: 'active',
      color: '#DC2626',
      countries: ['Israel', 'Iran', 'Palestine'],
      lastUpdated: new Date().toISOString(),
      latestHeadline: 'Ongoing conflict in Gaza with Iranian involvement',
      summary: 'Ongoing conflict between Israel and Hamas in Gaza, with Iran-linked escalations.',
      started: '2023-10-07',
      lat: 31.5,
      lng: 34.8,
    }, { merge: true });
    console.log('   OK: Conflict saved to Firebase!');

    await db.collection('posts').doc('israel-iran-first-post').set({
      slug: 'israel-iran-first-post',
      conflictId: 'israel-iran-gaza',
      conflictName: 'Israel — Iran and Gaza',
      region: 'Middle East',
      headline: 'Israel-Gaza Conflict: Latest Developments and Regional Tensions',
      subheadline: 'Ongoing military operations continue as international community seeks ceasefire',
      summary: 'The conflict between Israel and Hamas in Gaza continues with significant humanitarian impact. Iranian proxy groups remain actively involved across the region.',
      body: {
        latest_developments: 'Israeli military operations in Gaza continue targeting Hamas infrastructure. The humanitarian situation remains critical with ongoing international pressure for a ceasefire agreement.',
        background: 'The conflict began on October 7, 2023 when Hamas launched a large-scale attack on southern Israel. Israel responded with a comprehensive military campaign in Gaza.',
        international_reaction: 'The United States continues to support Israel while calling for civilian protection. Arab nations are pushing for immediate ceasefire negotiations through UN channels.',
        what_to_watch: 'Watch for ceasefire negotiations progress, Hezbollah activity in northern Israel, and Iranian response to regional developments.',
      },
      intensity: 9,
      tags: ['Israel', 'Gaza', 'Hamas', 'Iran', 'Middle East', 'conflict'],
      metaDescription: 'Latest updates on the Israel-Gaza conflict and Iranian involvement. Real-time tracking on WorldConflict.online',
      keyFacts: [
        'Conflict started October 7, 2023',
        'Over 1 million displaced in Gaza',
        'Iran-linked groups active across region',
        'International ceasefire efforts ongoing',
      ],
      conflictStatus: 'critical',
      videos: [],
      sources: [],
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedTimestamp: Date.now(),
      isPublished: true,
      notified: false,
    });
    console.log('   OK: Post saved to Firebase!');

    await db.collection('conflicts').doc('russia-ukraine').set({
      id: 'russia-ukraine',
      name: 'Russia — Ukraine',
      region: 'Eastern Europe',
      intensity: 9,
      status: 'active',
      color: '#2563EB',
      countries: ['Russia', 'Ukraine'],
      lastUpdated: new Date().toISOString(),
      latestHeadline: 'Russia-Ukraine war continues with heavy fighting on multiple fronts',
      summary: 'Full-scale Russian invasion of Ukraine ongoing since February 2022.',
      started: '2022-02-24',
      lat: 49.0,
      lng: 32.0,
    }, { merge: true });

    await db.collection('posts').doc('russia-ukraine-first-post').set({
      slug: 'russia-ukraine-first-post',
      conflictId: 'russia-ukraine',
      conflictName: 'Russia — Ukraine',
      region: 'Eastern Europe',
      headline: 'Russia-Ukraine War: Frontline Updates and Military Developments',
      subheadline: 'Heavy fighting continues across multiple fronts in eastern Ukraine',
      summary: 'The Russia-Ukraine war continues with intense fighting across eastern Ukraine. Both sides report significant military activity along the 1,000km frontline.',
      body: {
        latest_developments: 'Russian forces continue pressure in the Donetsk region while Ukrainian forces conduct defensive operations. Drone and missile strikes reported on both sides.',
        background: 'Russia launched a full-scale invasion of Ukraine on February 24, 2022. The conflict has resulted in massive casualties and displacement of millions of Ukrainians.',
        international_reaction: 'NATO allies continue to provide military and financial support to Ukraine. Diplomatic efforts for negotiations remain stalled.',
        what_to_watch: 'Monitor frontline movements in Donetsk, Western military aid packages, and potential escalation with NATO nations.',
      },
      intensity: 9,
      tags: ['Russia', 'Ukraine', 'war', 'NATO', 'Donetsk', 'Eastern Europe'],
      metaDescription: 'Latest updates on the Russia-Ukraine war. Real-time conflict tracking on WorldConflict.online',
      keyFacts: [
        'War started February 24, 2022',
        'Over 10 million Ukrainians displaced',
        'NATO continues military support to Ukraine',
        'Heavy fighting in Donetsk region',
      ],
      conflictStatus: 'critical',
      videos: [],
      sources: [],
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedTimestamp: Date.now() - 1000,
      isPublished: true,
      notified: false,
    });
    console.log('   OK: Russia-Ukraine post saved!');

    await db.collection('system').doc('status').set({
      lastCollected: new Date().toISOString(),
      lastWritten: new Date().toISOString(),
      totalSaved: 10,
      postsGenerated: 2,
    }, { merge: true });
    console.log('   OK: System status updated!');

  } catch (err) {
    console.log('   FIREBASE ERROR: ' + err.message);
  }

  console.log('\n[3] Testing Gemini AI...');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Reply with exactly: GEMINI OK');
    console.log('   OK: Gemini works! -', result.response.text().trim());
  } catch (err) {
    console.log('   GEMINI ERROR: ' + err.message);
  }

  console.log('\n[4] Testing RSS...');
  try {
    const RSSParser = require('rss-parser');
    const parser = new RSSParser();
    const feed = await parser.parseURL('https://feeds.bbci.co.uk/news/world/rss.xml');
    console.log('   OK: RSS works! Items:', feed.items.length);
  } catch (err) {
    console.log('   RSS ERROR: ' + err.message);
  }

  console.log('\n='.repeat(50));
  console.log('TEST COMPLETE! Now check your website.\n');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
