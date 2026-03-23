const SITE_URL = 'https://worldconflict.online';

function generateSitemap(conflicts, posts) {
  const staticPages = ['', '/conflicts', '/latest', '/about'];

  const staticUrls = staticPages.map(path => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>hourly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  const conflictUrls = conflicts.map(c => `
  <url>
    <loc>${SITE_URL}/conflicts/${c.id}</loc>
    <lastmod>${c.lastUpdated || new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  const postUrls = posts.map(p => `
  <url>
    <loc>${SITE_URL}/conflict/${p.conflictId}/${p.slug}</loc>
    <lastmod>${p.updatedAt || p.publishedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${conflictUrls}
${postUrls}
</urlset>`;
}

export default async function handler(req, res) {
  try {
    const { db } = require('../../lib/firebase-admin');

    const [conflictsSnap, postsSnap] = await Promise.all([
      db.collection('conflicts').get(),
      db.collection('posts').where('isPublished', '==', true).orderBy('publishedTimestamp', 'desc').limit(100).get(),
    ]);

    const conflicts = conflictsSnap.docs.map(d => d.data());
    const posts = postsSnap.docs.map(d => d.data());

    const sitemap = generateSitemap(conflicts, posts);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(sitemap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
