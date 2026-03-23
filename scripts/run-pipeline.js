require('dotenv').config({ path: '.env.local' });
const { runCollector } = require('./collector');
const { runWriter } = require('./writer');
const { runNotifier } = require('./notifier');

async function runPipeline() {
  const startTime = Date.now();
  console.log('\n' + '═'.repeat(60));
  console.log('  🌍 WORLDCONFLICT PIPELINE STARTED');
  console.log('  ' + new Date().toLocaleString());
  console.log('═'.repeat(60));

  try {
    // Step 1: Collect data
    const collected = await runCollector();
    console.log(`\n[1/3] ✅ Collector: ${collected} items saved\n`);

    // Step 2: Generate blog posts
    const posts = await runWriter();
    console.log(`\n[2/3] ✅ Writer: ${posts} posts generated\n`);

    // Step 3: Send Telegram notifications
    const notified = await runNotifier();
    console.log(`\n[3/3] ✅ Notifier: ${notified} alerts sent\n`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('═'.repeat(60));
    console.log(`  🎉 PIPELINE COMPLETE in ${elapsed}s`);
    console.log('═'.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌ PIPELINE ERROR:', err);
    process.exit(1);
  }
}

runPipeline().then(() => process.exit(0));
