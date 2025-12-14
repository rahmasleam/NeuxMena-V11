const Parser = require('rss-parser');
const fs = require('fs');
const parser = new Parser();

const feeds = [
  { name: 'TechCrunch', url: 'https://rss.app/feeds/QuECLd94BZYymuXm.xml' },
  { name: 'The Verge', url: 'https://rss.app/feeds/kbQFmIIkxmghARwP.xml' },
  { name: 'Wired', url: 'https://rss.app/feeds/ryhuzL1yWfePPf8a.xml' },
  { name: 'PitchBook', url: 'https://rss.app/feeds/xdsoNT4bowt9xXAt.xml' },
  { name: 'Crunchbase', url: 'https://rss.app/feeds/3GNKIqni3yaWtZ2g.xml' },
  { name: 'VC LinkedIn', url: 'https://rss.app/feeds/Lx2DptjiB72xD02R.xml' },
  { name: 'MENAbytes', url: 'https://rss.app/feeds/u2NLarkFLra75E5Q.xml' },
  { name: 'Daily Egypt', url: 'https://rss.app/feeds/M8240CPa4y6GPq1A.xml' },
  { name: 'Elmal News', url: 'https://rss.app/feeds/HIhpZO6fuME1qzme.xml' },
  { name: 'Wamda', url: 'https://rss.app/feeds/tkwEU2EqOIvEnUz7.xml' }
];

(async () => {
  console.log('Fetching 10 RSS feeds...');
  const output = { Startups: {}, Latest: [] };
  let allArticles = [];

  // 1. Fetch and Parse all feeds
  await Promise.all(feeds.map(async (feed) => {
    try {
      const res = await parser.parseURL(feed.url);
      
      // Clean and standardise item structure
      const items = res.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        description: item.contentSnippet ? item.contentSnippet.substring(0, 200) + '...' : '',
        source: feed.name
      }));

      // 2. Startups Page Logic: Group ALL articles by Source
      output.Startups[feed.name] = items;

      // Collect for Latest page processing
      allArticles.push(...items);
    } catch (e) {
      console.error(`Error fetching ${feed.name}:`, e.message);
    }
  }));

  // 3. Latest Page Logic: Combine ALL, Sort by Date (Newest), Take Top 10
  output.Latest = allArticles
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)) // Sort Descending
    .slice(0, 10); // Top 10 important/recent

  // 4. Write to JSON
  fs.writeFileSync('articles.json', JSON.stringify(output, null, 2));
  console.log('✅ Success! Data written to articles.json');
})();