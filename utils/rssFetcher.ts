
import { NewsItem, ResourceItem, PodcastItem, NewsletterItem } from '../types';

const IMPORTANT_KEYWORDS = [
    'launch', 'unveil', 'acquire', 'acquisition', 'billion', 'million', 
    'ipo', 'series a', 'series b', 'unicorn', 'funding', 'raise', 
    'apple', 'google', 'openai', 'meta', 'nvidia', 'amazon', 'egypt', 'saudi'
];

// --- ROBUST PROXY FETCHING ---
const fetchWithProxy = async (targetUrl: string): Promise<string | null> => {
    // Strategy: Try robust proxies in order of reliability/speed
    const strategies = [
        // 1. CorsProxy.io (Fast, reliable for raw content)
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        // 2. AllOrigins (Good for XML headers)
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        // 3. CodeTabs (Good fallback)
        (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    for (const strategy of strategies) {
        try {
            const proxyUrl = strategy(targetUrl);
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 8000); 
            
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);

            if (response.ok) {
                const text = await response.text();
                // Basic validation to ensure we didn't get an HTML error page from the proxy
                if (text.trim().startsWith('<?xml') || text.includes('<rss') || text.includes('<feed') || text.includes('<channel')) {
                    return text;
                }
            }
        } catch (e) {
            // Silently continue to next strategy
        }
    }
    
    console.error(`All proxies failed for: ${targetUrl}`);
    return null;
};

// --- HELPER FUNCTIONS ---

const extractImage = (content: string, title?: string, item?: Element): string => {
    // 1. Try Media Content / Thumbnail
    if (item) {
        const mediaGroup = item.getElementsByTagName('media:group')[0];
        if (mediaGroup) {
            const thumbnail = mediaGroup.getElementsByTagName('media:thumbnail')[0];
            if (thumbnail && thumbnail.getAttribute('url')) return thumbnail.getAttribute('url')!;
        }
        const mediaContent = item.getElementsByTagName('media:content')[0];
        if (mediaContent && mediaContent.getAttribute('url')) return mediaContent.getAttribute('url')!;
        
        const itunesImage = item.getElementsByTagName('itunes:image')[0];
        if (itunesImage && itunesImage.getAttribute('href')) return itunesImage.getAttribute('href')!;
        
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) {
            return enclosure.getAttribute('url')!;
        }
    }

    // 2. Try to find actual image in content (HTML)
    if (content) {
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) return imgMatch[1];
    }
    
    // 3. Fallback to UI Avatar
    try {
        const safeTitle = title ? Array.from(title).slice(0, 20).join('') : 'News';
        const name = encodeURIComponent(safeTitle);
        return `https://ui-avatars.com/api/?name=${name}&background=0284c7&color=fff&size=400&font-size=0.33&bold=true`;
    } catch (e) {
        return `https://ui-avatars.com/api/?name=News&background=0284c7&color=fff&size=400&font-size=0.33&bold=true`;
    }
};

const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// IMPROVED: Smart Local Classifier
const identifySector = (text: string): string => {
    const lower = text.toLowerCase();
    
    // Core Sectors
    if (lower.match(/\b(fintech|bank|payment|wallet|crypto|blockchain|bfsi|financial|currency|trading)\b/)) return 'Fintech';
    if (lower.match(/\b(ai|artificial intelligence|llm|gpt|generative|machine learning|robot|neural|algorithm|automation)\b/)) return 'AI';
    if (lower.match(/\b(software|hardware|cyber|cloud|saas|app|platform|digital|tech|gadget|mobile|data|internet)\b/)) return 'Tech';
    if (lower.match(/\b(startup|founder|entrepreneur|accelerator|incubator|bootstrapping|pitch|unicorn|scaleup|sme)\b/)) return 'Entrepreneur';
    if (lower.match(/\b(invest|fund|venture|capital|equity|raise|series|ipo|acquisition|merger|valuation|exit|vc)\b/)) return 'Investment';
    if (lower.match(/\b(health|medtech|doctor|pharma|biotech)\b/)) return 'Healthtech';
    if (lower.match(/\b(proptech|real estate|property|construction|housing)\b/)) return 'Proptech';
    if (lower.match(/\b(deep tech|quantum|space|science|energy|climate|agritech)\b/)) return 'Deep Tech';
    
    // Podcast & Business Specific Topics (Expanded)
    if (lower.match(/\b(marketing|brand|seo|growth|sales|customer|ad|advertising|pr)\b/)) return 'Marketing';
    if (lower.match(/\b(leadership|management|culture|hiring|team|strategy|ceo|executive|career)\b/)) return 'Leadership';
    if (lower.match(/\b(productivity|habits|mindset|psychology|focus|efficiency|work)\b/)) return 'Productivity';
    if (lower.match(/\b(e-commerce|retail|shop|amazon|shopify|marketplace|logistics)\b/)) return 'E-commerce';
    if (lower.match(/\b(saas|b2b|subscription|enterprise)\b/)) return 'SaaS';
    if (lower.match(/\b(social media|creator|content|influencer)\b/)) return 'Creator Economy';

    if (lower.match(/\b(business|market|economy|trade|revenue|profit|stock|corporate|industry)\b/)) return 'Business';
    
    return 'Tech'; // Default fallback
};

// IMPROVED: Region Detection
const identifyRegion = (text: string, sourceRegion: string | undefined): 'Global' | 'Egypt' | 'MENA' => {
    // 1. Use Source Config Preference First
    if (sourceRegion === 'Egypt') return 'Egypt';
    if (sourceRegion === 'MENA') return 'MENA';
    if (sourceRegion === 'Global') return 'Global';

    const lower = text.toLowerCase();
    // 2. Keyword Fallback
    if (lower.match(/\b(egypt|cairo|giza|alexandria|egx|le|pound|egyptian|sisi|madbouly)\b/)) return 'Egypt';
    if (lower.match(/\b(saudi|uae|dubai|riyadh|qatar|kuwait|mena|middle east|arab|gulf|jeddah|abu dhabi|oman|bahrain)\b/)) return 'MENA';
    
    return 'Global';
};

// IMPROVED: Language Detection
const identifyLanguage = (text: string, item?: Element): 'ar' | 'en' => {
    // 1. Check RSS Language Tag (Most reliable for whole feed)
    if (item) {
        // Try item level
        const langTag = item.getElementsByTagName('language')[0] || item.getElementsByTagName('dc:language')[0];
        if (langTag && langTag.textContent) {
            const l = langTag.textContent.toLowerCase();
            if (l.startsWith('ar')) return 'ar';
            if (l.startsWith('en')) return 'en';
        }
    }

    // 2. Check Unicode chars in title/desc
    const arabicPattern = /[\u0600-\u06FF]/;
    // Count arabic chars to be sure it's not just one symbol
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    // If more than 20% of text or more than 5 distinct chars are Arabic
    return (arabicChars > 5) ? 'ar' : 'en';
};

// --- SEPARATE FETCHERS ---

// 1. STARTUPS & NEWS FEED
export const fetchStartupsFeed = async (feeds: ResourceItem[]): Promise<{ latest: NewsItem[], startups: Record<string, NewsItem[]> }> => {
    const allArticles: NewsItem[] = [];
    const startupsGrouped: Record<string, NewsItem[]> = {};

    const validFeeds = feeds.filter(r => 
        (r.type === 'News' || r.type === 'Startup' || r.type === 'Tech' || r.type === 'Business' || r.type === 'Investment') 
        && r.rssUrl
    );

    validFeeds.forEach(f => { startupsGrouped[f.name] = []; });

    const promises = validFeeds.map(async (feed) => {
        if (!feed.rssUrl) return;
        const xmlText = await fetchWithProxy(feed.rssUrl);
        if (!xmlText) return; 

        try {
            const xml = new DOMParser().parseFromString(xmlText, "text/xml");
            
            // Extract Channel Logo if available
            let channelLogo = '';
            const imageNode = xml.querySelector("channel > image > url");
            if (imageNode && imageNode.textContent) {
                channelLogo = imageNode.textContent;
            }

            const items = Array.from(xml.querySelectorAll("item"));

            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "";
                let link = item.querySelector("link")?.textContent || "";
                
                if (!link && item.querySelector("link")) {
                    link = item.querySelector("link")?.getAttribute("href") || "";
                }

                // Robust Date Parsing
                const pubDateStr = item.querySelector("pubDate")?.textContent || item.querySelector("dc\\:date")?.textContent || "";
                let date = new Date().toISOString().split('T')[0];
                if (pubDateStr) {
                    const parsedDate = new Date(pubDateStr);
                    if (!isNaN(parsedDate.getTime())) {
                        date = parsedDate.toISOString().split('T')[0];
                    }
                }

                let desc = item.querySelector("description")?.textContent || "";
                const contentEncoded = item.getElementsByTagName("content:encoded")[0]?.textContent || "";
                
                const cleanTitle = title.replace('<![CDATA[', '').replace(']]>', '').trim();
                let cleanDesc = (desc || contentEncoded).replace(/<[^>]*>/g, '').trim();
                cleanDesc = cleanDesc.replace('<![CDATA[', '').replace(']]>', '').substring(0, 200) + "...";

                if (!cleanTitle) return; 

                const fullText = (cleanTitle + " " + cleanDesc);
                const sector = identifySector(fullText);
                const finalRegion = identifyRegion(fullText, feed.region);

                const newsItem: NewsItem = {
                    id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    title: cleanTitle,
                    description: cleanDesc,
                    url: link,
                    source: feed.name,
                    date: date,
                    region: finalRegion,
                    category: (feed.type === 'Startup' || feed.type === 'Investment') ? 'Startup' : 'Tech',
                    sector: sector,
                    imageUrl: extractImage(desc + contentEncoded, cleanTitle, item),
                    tags: [sector],
                    ...({ logo: channelLogo } as any)
                };

                allArticles.push(newsItem);
                if (startupsGrouped[feed.name]) startupsGrouped[feed.name].push({ ...newsItem });
            });
        } catch (e) { 
            console.error(`XML Parse Error ${feed.name}`, e); 
        }
    });

    await Promise.all(promises);

    const scoredArticles = allArticles.map(item => {
        let score = 0;
        const today = new Date().toISOString().split('T')[0];
        if (item.date === today) score += 10;
        if (IMPORTANT_KEYWORDS.some(k => item.title.toLowerCase().includes(k))) score += 5;
        if (item.imageUrl && !item.imageUrl.includes('ui-avatars')) score += 2;
        return { item, score };
    });
    scoredArticles.sort((a, b) => b.score - a.score);

    return {
        latest: scoredArticles.slice(0, 20).map(x => x.item), // Increased limit
        startups: startupsGrouped
    };
};

// 2. PODCASTS FEED
export const fetchPodcastsFeed = async (feeds: ResourceItem[]): Promise<PodcastItem[]> => {
    const allPodcasts: PodcastItem[] = [];
    const validFeeds = feeds.filter(r => r.type === 'Podcast' && r.rssUrl);

    const promises = validFeeds.map(async (feed) => {
        if (!feed.rssUrl) return;
        const xmlText = await fetchWithProxy(feed.rssUrl);
        if (!xmlText) return;

        try {
            const xml = new DOMParser().parseFromString(xmlText, "text/xml");
            const items = Array.from(xml.querySelectorAll("item, entry"));

            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "";
                let link = item.querySelector("link")?.textContent || "";
                if (!link) {
                    const linkNode = item.querySelector("link");
                    if (linkNode && linkNode.getAttribute("href")) link = linkNode.getAttribute("href")!;
                }

                const pubDateStr = item.querySelector("pubDate")?.textContent || item.querySelector("published")?.textContent || "";
                let date = new Date().toISOString().split('T')[0];
                if (pubDateStr) {
                    const parsedDate = new Date(pubDateStr);
                    if (!isNaN(parsedDate.getTime())) {
                        date = parsedDate.toISOString().split('T')[0];
                    }
                }

                let desc = item.querySelector("description")?.textContent || "";
                const mediaGroup = item.getElementsByTagName("media:group")[0];
                if (mediaGroup) {
                    const mediaDesc = mediaGroup.getElementsByTagName("media:description")[0];
                    if (mediaDesc) desc = mediaDesc.textContent || "";
                }
                
                const cleanTitle = title.replace('<![CDATA[', '').replace(']]>', '').trim();
                const cleanDesc = desc.replace(/<[^>]*>/g, '').substring(0, 180) + "...";
                
                const fullText = (cleanTitle + " " + cleanDesc);
                const topic = identifySector(fullText);
                const lang = identifyLanguage(fullText, item); // Pass item for <language> check
                
                // Override region based on language
                const region = lang === 'ar' ? 'MENA' : 'Global';

                const videoIdNode = item.getElementsByTagName("yt:videoId")[0];
                const videoId = videoIdNode ? videoIdNode.textContent : extractYouTubeId(link);
                
                let youtubeUrl = undefined;
                let audioUrl = undefined;
                let imageUrl = '';

                if (videoId) {
                    youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    imageUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; 
                } else {
                    const enclosure = item.querySelector("enclosure");
                    if (enclosure && enclosure.getAttribute("type")?.includes("audio")) {
                        audioUrl = enclosure.getAttribute("url") || undefined;
                    }
                    imageUrl = extractImage(desc, cleanTitle, item);
                }

                allPodcasts.push({
                    id: `pod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    title: cleanTitle,
                    description: cleanDesc,
                    url: link,
                    source: feed.name,
                    date: date,
                    region: region,
                    imageUrl: imageUrl,
                    duration: 'N/A',
                    summaryPoints: [topic, lang === 'ar' ? 'Arabic' : 'English'],
                    language: lang,
                    topic: topic,
                    youtubeUrl: youtubeUrl,
                    audioUrl: audioUrl,
                    channelUrl: feed.url
                });
            });
        } catch (e) { console.error(`Podcast Parse Error ${feed.name}`, e); }
    });

    await Promise.all(promises);
    return allPodcasts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 3. NEWSLETTERS FEED
export const fetchNewslettersFeed = async (feeds: ResourceItem[]): Promise<NewsletterItem[]> => {
    const allNewsletters: NewsletterItem[] = [];
    const validFeeds = feeds.filter(r => r.type === 'Newsletter' && r.rssUrl);

    const promises = validFeeds.map(async (feed) => {
        if (!feed.rssUrl) return;
        const xmlText = await fetchWithProxy(feed.rssUrl);
        if (!xmlText) return;

        try {
            const xml = new DOMParser().parseFromString(xmlText, "text/xml");
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 5); // Increased to top 5

            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "";
                let link = item.querySelector("link")?.textContent || "";
                let desc = item.querySelector("description")?.textContent || "";
                
                const cleanTitle = title.replace('<![CDATA[', '').replace(']]>', '').trim();
                const cleanDesc = desc.replace(/<[^>]*>/g, '').substring(0, 150) + "...";
                
                let date = new Date().toISOString().split('T')[0];
                const pubDateStr = item.querySelector("pubDate")?.textContent || "";
                if (pubDateStr) {
                    const parsedDate = new Date(pubDateStr);
                    if (!isNaN(parsedDate.getTime())) {
                        date = parsedDate.toISOString().split('T')[0];
                    }
                }

                const fullText = (cleanTitle + " " + cleanDesc);
                const region = identifyRegion(fullText, feed.region);
                const sector = identifySector(fullText);

                allNewsletters.push({
                    id: `nl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    title: cleanTitle,
                    description: cleanDesc,
                    source: feed.name,
                    url: link,
                    date: date,
                    region: region,
                    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(feed.name)}&background=10b981&color=fff&size=200`,
                    frequency: 'Weekly',
                    subscribeLink: link,
                    ...({ sector } as any)
                });
            });
        } catch (e) { console.error(`Newsletter Parse Error ${feed.name}`, e); }
    });

    await Promise.all(promises);
    return allNewsletters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
