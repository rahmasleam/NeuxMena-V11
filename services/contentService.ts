import { NewsItem } from '../types';
import { RSS_CONFIG } from '../constants';

const CORS_PROXY = "https://corsproxy.io/?";

// Helper: Identify topics based on keywords
const identifyTopics = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const topics: string[] = [];

    // Check against config keywords
    if (RSS_CONFIG.KEYWORDS.TECH.some(k => lowerText.includes(k))) topics.push('Tech');
    if (RSS_CONFIG.KEYWORDS.AI.some(k => lowerText.includes(k))) topics.push('AI');
    if (RSS_CONFIG.KEYWORDS.BUSINESS.some(k => lowerText.includes(k))) topics.push('Business');
    if (RSS_CONFIG.KEYWORDS.ENTREPRENEUR.some(k => lowerText.includes(k))) topics.push('Entrepreneur');
    if (RSS_CONFIG.KEYWORDS.FINTECH.some(k => lowerText.includes(k))) topics.push('Fintech');
    if (RSS_CONFIG.KEYWORDS.INVESTMENT.some(k => lowerText.includes(k))) topics.push('Investment');

    return topics;
};

// Helper: Extract image from RSS item
const extractImage = (item: Element, content: string): string => {
    // 1. Try media:content or media:thumbnail
    const media = item.getElementsByTagName('media:content')[0] || item.getElementsByTagName('media:thumbnail')[0];
    if (media && media.getAttribute('url')) return media.getAttribute('url')!;

    // 2. Try enclosure
    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) return enclosure.getAttribute('url')!;

    // 3. Try parsing <img> tag from content:encoded or description
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];

    // 4. Fallback image
    return `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
};

export const fetchAllFeeds = async (): Promise<{ latest: NewsItem[], startup: NewsItem[] }> => {
    const allLatest: NewsItem[] = [];
    const allStartups: NewsItem[] = [];
    const seenUrls = new Set<string>();
    
    // Time threshold: Last 24 Hours
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    console.log("Starting RSS Sync...");

    const promises = RSS_CONFIG.FEEDS.map(async (feed) => {
        try {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`);
            if (!response.ok) throw new Error('Network error');
            
            const text = await response.text();
            const xml = new DOMParser().parseFromString(text, "text/xml");
            const items = Array.from(xml.querySelectorAll("item"));

            items.forEach(item => {
                // 1. Extract Basic Info
                const title = item.querySelector("title")?.textContent || "";
                const link = item.querySelector("link")?.textContent || "";
                const pubDateStr = item.querySelector("pubDate")?.textContent || "";
                const desc = item.querySelector("description")?.textContent || "";
                const contentEncoded = item.getElementsByTagName("content:encoded")[0]?.textContent || "";
                
                // 2. Date Filtering (Strictly Today/Last 24h)
                const pubDate = new Date(pubDateStr);
                if (isNaN(pubDate.getTime()) || pubDate < oneDayAgo) {
                    return; // Skip old articles
                }

                // 3. De-duplication
                if (seenUrls.has(link)) return;
                seenUrls.add(link);

                // 4. Topic Filtering
                const fullText = `${title} ${desc}`;
                const topics = identifyTopics(fullText);
                
                // Skip if no relevant topics found (Strict Filter)
                if (topics.length === 0) return;

                // 5. Build News Item
                const newsItem: NewsItem = {
                    id: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    title: title.replace('<![CDATA[', '').replace(']]>', '').trim(),
                    description: desc.replace(/<[^>]*>/g, '').substring(0, 160) + (desc.length > 160 ? "..." : ""),
                    url: link,
                    source: feed.name,
                    date: pubDate.toISOString().split('T')[0], // YYYY-MM-DD
                    region: feed.region as any,
                    category: 'Tech', // Default, will refine below
                    sector: topics.includes('Fintech') ? 'Fintech' : topics.includes('AI') ? 'AI' : 'General',
                    imageUrl: extractImage(item, desc + contentEncoded),
                    tags: topics
                };

                // 6. Categorization (Latest vs Startups)
                const isStartupContext = feed.type === 'Startup' || feed.type === 'Investment' || topics.includes('Entrepreneur') || topics.includes('Startup');
                
                if (isStartupContext) {
                    newsItem.category = 'Startup';
                    allStartups.push(newsItem);
                } else {
                    newsItem.category = feed.type === 'Business' ? 'Economy' : 'Tech';
                    allLatest.push(newsItem);
                }
            });

        } catch (e) {
            console.warn(`Failed to fetch RSS for ${feed.name}:`, e);
        }
    });

    await Promise.all(promises);

    // Sort by Date (Newest First)
    const sortByDate = (a: NewsItem, b: NewsItem) => new Date(b.date).getTime() - new Date(a.date).getTime();

    console.log(`Sync Complete. Found ${allLatest.length} Latest, ${allStartups.length} Startups.`);

    return {
        latest: allLatest.sort(sortByDate),
        startup: allStartups.sort(sortByDate)
    };
};
