require('dotenv').config({ path: '.env.local' });
const TelegramBot = require('node-telegram-bot-api');
const { db } = require('../lib/firebase-admin');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const CHANNEL = process.env.TELEGRAM_CHANNEL_ID;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://worldconflict.online';

// ── INTENSITY EMOJI ──────────────────────────────────────────────
function intensityEmoji(score) {
  if (score >= 9) return '🔴 CRITICAL';
  if (score >= 7) return '🟠 HIGH';
  if (score >= 5) return '🟡 MEDIUM';
  return '🟢 LOW';
}

function statusEmoji(status) {
  const map = {
    escalating: '📈 Escalating',
    critical: '💥 Critical',
    stable: '⚖️ Stable',
    'de-escalating': '📉 De-escalating',
    ceasefire: '🕊️ Ceasefire',
    active: '⚔️ Active',
  };
  return map[status] || '⚔️ Active';
}

// ── SEND POST ALERT ──────────────────────────────────────────────
async function sendPostAlert(post) {
  const url = `${SITE_URL}/conflict/${post.conflictId}/${post.slug}`;

  const message = `*${post.conflictName} — UPDATE*

📌 *${post.headline}*
${post.subheadline}

${post.summary}

${intensityEmoji(post.intensity)} | ${statusEmoji(post.conflictStatus)}

📊 *Key Facts:*
${(post.keyFacts || []).map(f => `• ${f}`).join('\n') || '• See full report'}

${post.videos?.length > 0 ? `🎥 *${post.videos.length} video(s) available on site*` : ''}

🔗 [Read Full Report](${url})

_WorldConflict.online — Updated every 4 hours_`;

  await bot.sendMessage(CHANNEL, message, {
    parse_mode: 'Markdown',
    disable_web_page_preview: false,
  });
}

// ── SEND BREAKING ALERT ──────────────────────────────────────────
async function sendBreakingAlert(post) {
  const url = `${SITE_URL}/conflict/${post.conflictId}/${post.slug}`;

  const message = `🚨 *BREAKING — ${post.conflictName.toUpperCase()}*

⚡ *${post.headline}*

${post.summary}

🔗 [FULL COVERAGE](${url})

_WorldConflict.online_`;

  await bot.sendMessage(CHANNEL, message, {
    parse_mode: 'Markdown',
    disable_web_page_preview: false,
  });
}

// ── MAIN ─────────────────────────────────────────────────────────
async function runNotifier() {
  console.log('\n🔔 NOTIFIER STARTED —', new Date().toLocaleString());
  console.log('─'.repeat(50));

  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // Get posts published in last 30 minutes that haven't been notified
  const postsSnap = await db.collection('posts')
    .where('publishedAt', '>', cutoff)
    .where('isPublished', '==', true)
    .where('notified', '==', false)
    .limit(10)
    .get();

  if (postsSnap.empty) {
    console.log('No new posts to notify');
    return 0;
  }

  let notified = 0;

  for (const doc of postsSnap.docs) {
    const post = doc.data();

    try {
      if (post.intensity >= 8) {
        await sendBreakingAlert(post);
        console.log(`🚨 BREAKING alert sent: ${post.headline}`);
      } else {
        await sendPostAlert(post);
        console.log(`✅ Alert sent: ${post.headline}`);
      }

      // Mark as notified
      await doc.ref.update({ notified: true, notifiedAt: new Date().toISOString() });
      notified++;

      // Avoid Telegram rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error('Telegram error:', err.message);
    }
  }

  console.log(`\n✅ NOTIFIER DONE — ${notified} alerts sent`);
  return notified;
}

module.exports = { runNotifier };

if (require.main === module) {
  runNotifier().then(() => process.exit(0)).catch(err => {
    console.error('Notifier error:', err);
    process.exit(1);
  });
}
