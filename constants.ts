
import { NewsItem, EventItem, PodcastItem, MarketMetric, PartnerItem, NewsletterItem, ResourceItem, IndustryData } from './types';

// ==========================================
// CENTRAL DATA SOURCE
// ==========================================

const getDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const RSS_CONFIG = {
  FEEDS: [
    // News Sources
    { name: 'TechCrunch', url: 'https://rss.app/feeds/Y3UVayjmNQsGy0v6.xml', region: 'Global', type: 'Tech' },
    { name: 'The Verge', url: 'https://rss.app/feeds/GMjQhyRPTvhv69hf.xml', region: 'Global', type: 'Tech' },
    { name: 'Forbes Entrepreneurs', url: 'https://rss.app/feeds/Z2KIzmJoLYdDR9UO.xml', region: 'Global', type: 'Entrepreneur' },
    { name: 'PitchBook', url: 'https://rss.app/feeds/tkvH7ZnTH8X0aZyO.xml', region: 'Global', type: 'Investment' },
    { name: 'Crunchbase', url: 'https://rss.app/feeds/tv1D4SVkMVRck6gL.xml', region: 'Global', type: 'Startup' },
    { name: 'Venture Capitalist LinkedIn', url: 'https://rss.app/feeds/BvI3QLXgaMOs4E7W.xml', region: 'Global', type: 'Investment' },
    { name: 'MENAbytes', url: 'https://rss.app/feeds/PhdCDLclhFDQKt8f.xml', region: 'MENA', type: 'Startup' },
    { name: 'Daily Egypt', url: 'https://rss.app/feeds/y4LBQquJF8duk1v0.xml', region: 'Egypt', type: 'Business' },
    { name: 'Al Mal News', url: 'https://rss.app/feeds/yW923F5ipN9MRX5Y.xml', region: 'Egypt', type: 'Business' },
    { name: 'Wamda', url: 'https://rss.app/feeds/srqRc8ZilsSDGqDG.xml', region: 'MENA', type: 'Startup' },
    
    // Newsletter Sources
    { name: 'العربية Business', url: 'https://rss.app/feeds/9eown3t06ltIvdeq.xml', region: 'MENA', type: 'Newsletter' },
    { name: 'مجلة رواد الأعمال', url: 'https://rss.app/feeds/v4ClijJktdYAzePk.xml', region: 'MENA', type: 'Newsletter' },
    { name: 'Fintechgate', url: 'https://rss.app/feeds/PU1kKCc3cnQYEy9k.xml', region: 'Global', type: 'Newsletter' },
    { name: 'skynewsarabia', url: 'https://rss.app/feeds/KKAsZtTyr5arZF0f.xml', region: 'MENA', type: 'Newsletter' },
    { name: 'صحيفة الاقتصادية', url: 'https://rss.app/feeds/esZ4uUrHCpps75R6.xml', region: 'MENA', type: 'Newsletter' },
    { name: 'Riadynews', url: 'https://rss.app/feeds/Usv7cy8TcBDqtiDi.xml', region: 'MENA', type: 'Newsletter' },
    { name: 'Financial Times Fintech', url: 'https://rss.app/feeds/B7csEaSrOBZtEq6n.xml', region: 'Global', type: 'Newsletter' },
    { name: 'Daily News Egypt Business', url: 'https://rss.app/feeds/VoKQjuunA2BwCssi.xml', region: 'Egypt', type: 'Newsletter' },
    { name: 'أموال الغد', url: 'https://rss.app/feeds/q3Vd3Bn3NPZWoRlv.xml', region: 'Egypt', type: 'Newsletter' },
    { name: 'CoinDesk', url: 'https://rss.app/feeds/lcpUpjEmBYkm9GLC.xml', region: 'Global', type: 'Newsletter' },
    
    // Podcast Video Sources
    { name: 'Startup Sync', url: 'https://rss.app/feeds/ky6zeQbiMIh4ZEw9.xml', region: 'Global', type: 'Podcast' },
    { name: 'The AI Voice', url: 'https://rss.app/feeds/7ziJjjujTdy5b4XR.xml', region: 'Global', type: 'Podcast' },
    { name: 'GLASSROOM', url: 'https://rss.app/feeds/LfUs7Gy4iHufe7Se.xml', region: 'Global', type: 'Podcast' },
    { name: 'Business Bel Arabi', url: 'https://rss.app/feeds/gr04wht9GYgSlHiy.xml', region: 'MENA', type: 'Podcast' },
    { name: 'GTalks', url: 'https://rss.app/feeds/bkbfKCqlnVjyBlzX.xml', region: 'MENA', type: 'Podcast' },
    { name: 'BidonWaraq', url: 'https://rss.app/feeds/SE6RHtahK5CwVMqU.xml', region: 'MENA', type: 'Podcast' },
    { name: 'cnnbusinessar', url: 'https://rss.app/feeds/6jrJqDJBtYPXyQb1.xml', region: 'MENA', type: 'Podcast' },
    { name: '7akiBusiness', url: 'https://rss.app/feeds/MrAFrVoFPa3XwIOt.xml', region: 'MENA', type: 'Podcast' },
    { name: 'This Week in Startups', url: 'https://rss.app/feeds/LHjUdhAPg5Jrm3Kt.xml', region: 'Global', type: 'Podcast' },
    { name: 'The Diary Of A CEO', url: 'https://rss.app/feeds/WM6AG7Xg3FfCF75i.xml', region: 'Global', type: 'Podcast' }
  ],
  KEYWORDS: {
    TECH: ['hardware', "moore's law", 'robotaxi', 'ar/vr', 'aws', 'chips', 'silicon', 'meta glasses', 'waymo', 'gelsinger', 'apple', 'nvidia', 'tech', 'technology'],
    AI: ['ai agents', 'chatgpt', 'synthetic', 'meta ai', 'yoodli', 'llm', 'generative', 'openai', 'anthropic', 'intelligence', 'ai', 'artificial intelligence'],
    BUSINESS: ['netflix', 'deal', 'market analysis', 'energy storage', 'esim', 'warner', 'acquisition', 'merger', 'revenue', 'business', 'stock', 'economy'],
    ENTREPRENEUR: ['founder', 'refound', 'beeple', 'limitless', 'startup story', 'bootstrapping', 'entrepreneur'],
    FINTECH: ['fintech', 'valuation', 'series a', 'series b', 'seed', 'secondary sale', 'funding', 'payment', 'bank', 'invest'],
    INVESTMENT: ['valuation', 'capital', 'venture', 'equity', 'spacex', 'pitchbook', 'investor', '$', 'fund', 'raising']
  }
};

export const TRANSLATIONS = {
  en: {
    nav: {
      latest: 'Latest',
      startups: 'News',
      events: 'Events',
      podcasts: 'Podcasts',
      podcastAnalysis: 'Podcast Analysis',
      newsletters: 'Newsletters',
      market: 'Market Analysis',
      industry: 'Industry Analysis',
      partners: 'Partners',
      resources: 'Resources',
      aiAssistant: 'AI Assistant',
      saved: 'Saved Items',
      login: 'Login',
      logout: 'Logout',
      admin: 'Admin Panel'
    },
    common: {
      searchPlaceholder: 'Search...',
      readMore: 'Read Source',
      aiSummary: 'AI Summary',
      aiTranslate: 'Translate to Arabic',
      save: 'Save',
      saved: 'Saved',
      register: 'Register Now',
      listen: 'Listen Episode',
      subscribe: 'Subscribe',
      contact: 'Contact',
      marketInsights: 'AI Market Insights',
      chatTitle: 'InfoHub AI Assistant',
      filter: 'Filter',
      apply: 'Apply',
      all: 'All',
      generateAudio: 'Generate Audio',
      playAudio: 'Play Summary',
      refresh: 'Refresh',
      videos: 'Videos',
      channels: 'Channels',
      articles: 'Articles',
      podcasts: 'Podcasts',
      events: 'Events',
      newsletters: 'Newsletters',
      summary: 'Summary',
      readFullArticle: 'Read Full Article',
      translate: 'Translate',
      mostImportantNews: 'Most Important News',
      importantPodcasts: 'Important Podcasts',
      upcomingHighBenefit: 'Upcoming High Benefit',
      podcastAnalyzer: 'Podcast Analyzer',
      podcastAnalyzerDesc: 'Get deep insights and summaries',
      curatedEpisodes: 'Curated Episodes',
      readHere: 'Read Here',
    },
    sections: {
      latestTitle: 'Global & Egyptian Tech News',
      startupsTitle: 'News Ecosystem',
      eventsTitle: 'Tech Events Calendar',
      marketTitle: 'Financial & Market Data',
      podcastsTitle: 'Tech & Business Podcasts',
      newslettersTitle: 'Curated Newsletters',
      partnersTitle: 'Our Partners',
      resourcesTitle: 'Platform Resources & Sources',
      authTitle: 'Welcome to InfoHub',
      aiPageTitle: 'AI Knowledge Assistant',
      topStoriesDesc: 'Top 12 Most Important Stories.'
    }
  },
  ar: {
    nav: {
      latest: 'أحدث الأخبار',
      startups: 'الأخبار',
      events: 'الفعاليات',
      podcasts: 'بودكاست',
      podcastAnalysis: 'تحليل البودكاست',
      newsletters: 'النشرات البريدية',
      market: 'تحليل السوق',
      industry: 'تحليل القطاعات',
      partners: 'الشركاء',
      resources: 'المصادر',
      aiAssistant: 'المساعد الذكي',
      saved: 'المحفوظات',
      login: 'دخول',
      logout: 'خروج',
      admin: 'لوحة التحكم'
    },
    common: {
      searchPlaceholder: 'بحث...',
      readMore: 'اقرأ المصدر',
      aiSummary: 'ملخص ذكي',
      aiTranslate: 'ترجم للإنجليزية',
      save: 'حفظ',
      saved: 'محفوظ',
      register: 'سجل الآن',
      listen: 'استمع للحلقة',
      subscribe: 'اشترك',
      contact: 'تواصل',
      marketInsights: 'رؤى السوق الذكية',
      chatTitle: 'مساعد InfoHub الذكي',
      filter: 'تصفية',
      apply: 'تطبيق',
      all: 'الكل',
      generateAudio: 'توليد صوت',
      playAudio: 'تشغيل الملخص',
      refresh: 'تحديث',
      videos: 'فيديوهات',
      channels: 'قنوات',
      articles: 'مقالات',
      podcasts: 'بودكاست',
      events: 'فعاليات',
      newsletters: 'نشرات بريدية',
      summary: 'ملخص',
      readFullArticle: 'اقرأ المقال كاملاً',
      translate: 'ترجم',
      mostImportantNews: 'أهم الأخبار',
      importantPodcasts: 'بودكاست هام',
      upcomingHighBenefit: 'فعاليات ذات قيمة عالية',
      podcastAnalyzer: 'مححل البودكاست',
      podcastAnalyzerDesc: 'احصل على رؤى وملخصات عميقة',
      curatedEpisodes: 'حلقات مختارة',
      readHere: 'اقرأ هنا',
    },
    sections: {
      latestTitle: 'أخبار التكنولوجيا العالمية والمصرية',
      startupsTitle: 'منظومة الأخبار',
      eventsTitle: 'تقويم الفعاليات التقنية',
      marketTitle: 'البيانات المالية والسوقية',
      podcastsTitle: 'بودكاست التكنولوجيا والأعمال',
      newslettersTitle: 'نشرات بريدية مختارة',
      partnersTitle: 'شركاؤنا',
      resourcesTitle: 'موارد ومنصات المنصة',
      authTitle: 'مرحباً بك في InfoHub',
      aiPageTitle: 'المساعد المعرفي الذكي',
      topStoriesDesc: 'أهم 12 خبر وقصة اليوم.'
    }
  }
};

// RESOURCES
export const RESOURCES: ResourceItem[] = RSS_CONFIG.FEEDS.map((f, i) => ({
  id: `r_${i}`,
  name: f.name,
  url: f.url.replace('https://rss.app/feeds/', 'https://site.com/'),
  rssUrl: f.url,
  type: f.type as any,
  region: f.region,
  description: `Official RSS Feed for ${f.name}`
}));

export const LATEST_NEWS: NewsItem[] = [];
export const STARTUP_NEWS: NewsItem[] = [];

// EVENTS
export const EVENTS: EventItem[] = [
  {
    id: 'e_eg_1',
    title: 'RiseUp Summit 2025',
    description: 'The largest entrepreneurship event in the Middle East at the Grand Egyptian Museum. Networking, panels, and startup showcase.',
    location: 'Giza, Egypt',
    startDate: getDate(30),
    endDate: getDate(32),
    registrationLink: 'https://riseupsummit.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'RiseUp',
    url: 'https://riseupsummit.com',
    imageUrl: 'https://ui-avatars.com/api/?name=RiseUp+Summit&background=000&color=fff&size=400',
    date: getDate(30),
    type: 'Conference'
  },
  {
    id: 'e_eg_2',
    title: 'Cairo ICT 2025',
    description: 'The leading technology expo in Africa and the Middle East featuring Fintech, AI, and Cloud sectors.',
    location: 'EIEC, Cairo',
    startDate: getDate(120),
    endDate: getDate(123),
    registrationLink: 'https://cairoict.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'Cairo ICT',
    url: 'https://cairoict.com',
    imageUrl: 'https://ui-avatars.com/api/?name=Cairo+ICT&background=0D8ABC&color=fff&size=400',
    date: getDate(120),
    type: 'Conference'
  },
  {
    id: 'e_gl_1',
    title: 'LEAP 2026',
    description: 'The global tech event that is reshaping the world with over 100,000 attendees in Riyadh.',
    location: 'Riyadh, KSA',
    startDate: getDate(60),
    endDate: getDate(63),
    registrationLink: 'https://onegiantleap.com',
    isVirtual: false,
    region: 'MENA',
    source: 'LEAP',
    url: 'https://onegiantleap.com',
    imageUrl: 'https://ui-avatars.com/api/?name=LEAP&background=6366f1&color=fff&size=400',
    date: getDate(60),
    type: 'Conference'
  },
  {
    id: 'e_gl_2',
    title: 'Web Summit 2025',
    description: 'Where the tech world meets. The essential global gathering for startups and investors.',
    location: 'Lisbon, Portugal',
    startDate: getDate(200),
    endDate: getDate(203),
    registrationLink: 'https://websummit.com',
    isVirtual: false,
    region: 'Global',
    source: 'Web Summit',
    url: 'https://websummit.com',
    imageUrl: 'https://ui-avatars.com/api/?name=Web+Summit&background=000&color=fff&size=400',
    date: getDate(200),
    type: 'Conference'
  },
  {
    id: 'e_eg_3',
    title: 'Techne Summit Alexandria',
    description: 'Investment & Entrepreneurship event in the Mediterranean connecting startups with investors.',
    location: 'Alexandria, Egypt',
    startDate: getDate(90),
    endDate: getDate(92),
    registrationLink: 'https://technesummit.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'Techne',
    url: 'https://technesummit.com',
    imageUrl: 'https://ui-avatars.com/api/?name=Techne&background=f59e0b&color=fff&size=400',
    date: getDate(90),
    type: 'Conference'
  },
  {
    id: 'e_gl_4',
    title: 'Global AI Hackathon',
    description: '48-hour challenge to build the next generation of GenAI applications.',
    location: 'Online',
    startDate: getDate(15),
    endDate: getDate(17),
    registrationLink: 'https://devpost.com',
    isVirtual: true,
    region: 'Global',
    source: 'DevPost',
    url: 'https://devpost.com',
    imageUrl: 'https://ui-avatars.com/api/?name=AI+Hack&background=10b981&color=fff&size=400',
    date: getDate(15),
    type: 'Hackathon'
  },
  {
    id: 'e_eg_4',
    title: 'React Cairo Meetup',
    description: 'Monthly meetup for React.js developers in Cairo. Topics: React Server Components and Next.js 15.',
    location: 'Greek Campus, Cairo',
    startDate: getDate(10),
    endDate: getDate(10),
    registrationLink: 'https://meetup.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'Meetup',
    url: 'https://meetup.com',
    imageUrl: 'https://ui-avatars.com/api/?name=React+Cairo&background=61dafb&color=000&size=400',
    date: getDate(10),
    type: 'Meetup'
  },
  {
    id: 'e_gl_5',
    title: 'Product Management Workshop',
    description: 'Deep dive into product strategy and roadmapping for SaaS products.',
    location: 'Zoom (Virtual)',
    startDate: getDate(45),
    endDate: getDate(45),
    registrationLink: 'https://eventbrite.com',
    isVirtual: true,
    region: 'Global',
    source: 'ProductSchool',
    url: 'https://productschool.com',
    imageUrl: 'https://ui-avatars.com/api/?name=PM+Workshop&background=ec4899&color=fff&size=400',
    date: getDate(45),
    type: 'Workshop'
  }
];

// PODCAST CHANNELS
export const PODCAST_CHANNELS = [
  { name: 'Startup Sync', channelUrl: 'https://www.youtube.com/@StartupSyncPodcast', rssUrl: 'https://rss.app/feeds/ky6zeQbiMIh4ZEw9.xml', language: 'ar', topic: 'Startup', imageUrl: 'https://yt3.googleusercontent.com/G_ZtaCyX2hEFXq4QB9WhhQCaP4YPqdqbLXR2okdrf8AAuCJEQcMc1iCbwRkUb3NKqIz20_AWeg=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'The AI Voice', channelUrl: 'https://www.youtube.com/@aivoicepodcast', rssUrl: 'https://rss.app/feeds/7ziJjjujTdy5b4XR.xml', language: 'ar', topic: 'AI', imageUrl: 'https://yt3.googleusercontent.com/XJFwmS1my357HSG7ynPTFudvOYGom9upv2d6Y9WfCpqC6oHjCMJ2wAGbcYrT0dMkcKMJGQTQxXg=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'GLASSROOM', channelUrl: 'https://www.youtube.com/@GLASSROOMPodcast', rssUrl: 'https://rss.app/feeds/LfUs7Gy4iHufe7Se.xml', language: 'ar', topic: 'Tech', imageUrl: 'https://yt3.googleusercontent.com/-LjA71OfEMw40_db6w4y2gBaiUJ9zJv6FYjWZveVajSzf8BvEuO-OOODAyF5nDPr53pTNb0DsQ=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'Business Bel Arabi', channelUrl: 'https://www.youtube.com/@Businessbelarabi', rssUrl: 'https://rss.app/feeds/gr04wht9GYgSlHiy.xml', language: 'ar', topic: 'Business', imageUrl: 'https://yt3.googleusercontent.com/lIeQlq6iC1Z541PawJgtgAmDo1xEFptdEZkJhyl_J78KrcrH7IRdibsqZA3g2BJ08zmwuORyjes=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'GTalks', channelUrl: 'https://www.youtube.com/@G.Talks.Official', rssUrl: 'https://rss.app/feeds/bkbfKCqlnVjyBlzX.xml', language: 'ar', topic: 'Entrepreneurship', imageUrl: 'https://yt3.googleusercontent.com/LlI1Gqh9es5J8KlLOdkJYNbpRD_w1owIZPnlsq6aCjenp9dT1JjyNaoqCQ1-HgVVLyrl94H9ng=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'BidonWaraq', channelUrl: 'https://www.youtube.com/@BidonWaraq', rssUrl: 'https://rss.app/feeds/SE6RHtahK5CwVMqU.xml', language: 'ar', topic: 'Business', imageUrl: 'https://yt3.googleusercontent.com/0-Zfkk-eQom9oa07PUtWemXngKsS9FprWdXMamMJJY5m0PRA0XGkoD0l0MGWV-rzOEjwcaLmYQ=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'cnnbusinessar', channelUrl: 'https://www.youtube.com/@cnnbusinessar', rssUrl: 'https://rss.app/feeds/6jrJqDJBtYPXyQb1.xml', language: 'ar', topic: 'Business', imageUrl: 'https://yt3.googleusercontent.com/Eg_l0faiVrkjZgd63eu-nL9lfkd6AMD9Ri9jcCFO3OdzbAzAbj7lh9iOJkNQrthRDP4god00=s160-c-k-c0x00ffffff-no-rj' },
  { name: '7aki Business', channelUrl: 'https://www.youtube.com/@7akiBusiness', rssUrl: 'https://rss.app/feeds/MrAFrVoFPa3XwIOt.xml', language: 'ar', topic: 'Business', imageUrl: 'https://yt3.googleusercontent.com/Fqgk_MmGm2UHgPPdxnIsCCX1xbL58Rtdja5JFG-8BdS7oR0pHFbA86zINlI6oZKHKxOJ4_9N=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'This Week in Startups', channelUrl: 'https://www.youtube.com/@startups', rssUrl: 'https://rss.app/feeds/LHjUdhAPg5Jrm3Kt.xml', language: 'en', topic: 'Startup', imageUrl: 'https://yt3.googleusercontent.com/7ws8ldqZZk014JeYLjV6CRZPvCkm4W1NW9IX2b42VKr4u38KtIyqjcwttXYe6f4GH553iBf3fA=s160-c-k-c0x00ffffff-no-rj' },
  { name: 'The Diary Of A CEO', channelUrl: 'https://www.youtube.com/@TheDiaryOfACEO', rssUrl: 'https://rss.app/feeds/WM6AG7Xg3FfCF75i.xml', language: 'en', topic: 'Business', imageUrl: 'https://yt3.googleusercontent.com/JHCZDz37bsTmwoE1o4LEodF5vhsHfk29kCEauDTFr27-7hHXsHHvvWGzcG77v32ERrkpfInkGQ=s160-c-k-c0x00ffffff-no-rj' }
];

export const PODCASTS: PodcastItem[] = [];

export const NEWSLETTERS: NewsletterItem[] = [
  {
    id: 'nl1',
    title: 'العربية Business',
    description: 'أخبار الاقتصاد والأعمال من العربية',
    source: 'Al Arabiya',
    url: 'https://www.alarabiya.net/aswaq',
    date: getDate(0),
    region: 'MENA',
    imageUrl: 'https://ui-avatars.com/api/?name=Al+Arabiya&background=ef4444&color=fff',
    frequency: 'Daily',
    subscribeLink: 'https://www.alarabiya.net/aswaq'
  },
  {
    id: 'nl2',
    title: 'Enterprise Egypt',
    description: 'The essential morning read for business and finance in Egypt.',
    source: 'Enterprise',
    url: 'https://enterprise.press',
    date: getDate(0),
    region: 'Egypt',
    imageUrl: 'https://ui-avatars.com/api/?name=Enterprise&background=000&color=fff',
    frequency: 'Daily',
    subscribeLink: 'https://enterprise.press/subscribe'
  }
];

export const MARKET_DATA_INDICES: MarketMetric[] = [
  { name: 'EGX 30', value: 28500.45, change: 1.2, trend: 'up', currency: 'pts', type: 'Index' },
  { name: 'NASDAQ', value: 16340.20, change: 0.8, trend: 'up', currency: 'USD', type: 'Index' }
];

export const MARKET_DATA_CRYPTO: MarketMetric[] = [
  { name: 'Bitcoin', value: 64200.00, change: -1.5, trend: 'down', currency: 'USD', type: 'Crypto' }
];

export const MARKET_DATA_CURRENCY: MarketMetric[] = [
  { name: 'USD/EGP', value: 47.85, change: -0.1, trend: 'neutral', currency: 'EGP', type: 'Currency' }
];

export const PARTNERS: PartnerItem[] = [
  {
    id: 'pt1',
    name: 'ITIDA',
    logo: 'https://ui-avatars.com/api/?name=ITIDA&background=0D8ABC&color=fff',
    website: 'https://itida.gov.eg',
    type: 'Egypt',
    description: 'Information Technology Industry Development Agency',
    contactEmail: 'info@itida.gov.eg',
    services: ['Grants', 'Training', 'Export Support']
  }
];

export const INDUSTRY_DATA: IndustryData = {
  sectors: [
    {
      name: 'Fintech',
      growth: 18.2, companies: 350, investment: 1200, color: '#10b981',
      source: 'CB Insights', url: 'https://www.cbinsights.com', lastUpdated: '2025-11-01',
      swot: {
        strengths: ['High mobile penetration in MENA', 'Supportive regulatory sandboxes'],
        weaknesses: ['Fragmented regulatory landscape across borders', 'Cash dominance in some regions'],
        opportunities: ['Unbanked population adoption', 'Embedded finance in retail'],
        threats: ['Cybersecurity attacks', 'Global big tech entry']
      },
      pestle: {
        political: 'Central Bank digitalization initiatives.',
        economic: 'Currency fluctuation driving crypto/stablecoin interest.',
        social: 'Youth demographic shifting to digital wallets.',
        technological: 'Open Banking API standardization.',
        legal: 'Data localization laws.',
        environmental: 'Green Fintech initiatives.'
      }
    },
    // ... (Keep existing sectors)
    {
      name: 'AI & ML',
      growth: 24.5, companies: 120, investment: 850, color: '#6366f1',
      source: 'Gartner', url: 'https://www.gartner.com', lastUpdated: '2025-10-15',
      swot: {
        strengths: ['Strong engineering talent pool in Egypt', 'Government AI strategies (SDAIA)'],
        weaknesses: ['Lack of local high-performance compute infra', 'Data scarcity in Arabic'],
        opportunities: ['Arabic LLM development', 'AI in public sector efficiency'],
        threats: ['Brain drain to US/Europe', 'Ethical AI regulations']
      },
      pestle: {
        political: 'National AI Strategies (Egypt/KSA/UAE).',
        economic: 'Cost savings automation.',
        social: 'Job displacement concerns.',
        technological: 'GenAI breakthroughs.',
        legal: 'IP rights for AI generated content.',
        environmental: 'Energy consumption of data centers.'
      }
    },
    {
      name: 'Proptech',
      growth: 15.8, companies: 85, investment: 420, color: '#f59e0b',
      source: 'Magnitt', url: 'https://magnitt.com', lastUpdated: '2025-11-10',
      swot: {
        strengths: ['Booming real estate market in KSA & Egypt', 'High demand for property management solutions'],
        weaknesses: ['Slow adoption by traditional developers', 'High regulatory hurdles for fractional ownership'],
        opportunities: ['Smart cities integration (NEOM, New Capital)', 'VR/AR for property viewing'],
        threats: ['Interest rate hikes affecting mortgages', 'Economic instability impacting construction costs']
      },
      pestle: {
        political: 'Mega-projects driving demand.',
        economic: 'Inflation impacting housing affordability.',
        social: 'Urbanization trends.',
        technological: 'IoT in building management.',
        legal: 'Real estate registration digitalization.',
        environmental: 'Sustainable building requirements.'
      }
    },
    {
      name: 'Deep Tech',
      growth: 21.0, companies: 45, investment: 600, color: '#ec4899',
      source: 'DeepTech MENA', url: 'https://example.com', lastUpdated: '2025-11-05',
      swot: {
        strengths: ['University R&D partnerships', 'Government backing for sovereign capabilities'],
        weaknesses: ['Long R&D cycles', 'Scarcity of specialized VC funding'],
        opportunities: ['Climate tech solutions', 'Space tech initiatives'],
        threats: ['Global supply chain disruptions', 'IP theft risks']
      },
      pestle: {
        political: 'Strategic autonomy goals.',
        economic: 'Diversification from oil.',
        social: 'Education reform focus.',
        technological: 'Quantum computing research.',
        legal: 'Patent law reforms.',
        environmental: 'Carbon capture technologies.'
      }
    }
  ],
  marketSizing: [
    { name: 'TAM', value: 50, color: '#e2e8f0', label: '$50B Global Potential', source: 'Statista', url: 'https://www.statista.com' },
    { name: 'SAM', value: 20, color: '#94a3b8', label: '$20B MENA Market', source: 'Statista', url: 'https://www.statista.com' },
    { name: 'SOM', value: 5, color: '#0ea5e9', label: '$5B Target Share', source: 'Statista', url: 'https://www.statista.com' },
  ],
  growthForecast: [
    { year: '2023', value: 1.2 },
    { year: '2024', value: 1.5 },
    { year: '2025', value: 2.1 },
    { year: '2026', value: 2.8 },
    { year: '2027', value: 3.9 },
  ],
  competitors: [
    { name: 'Fawry', share: 35, type: 'Leader', strength: 'Distribution', source: 'EGX', url: 'https://egx.com.eg' },
    { name: 'Paymob', share: 20, type: 'Challenger', strength: 'Tech Stack', source: 'Crunchbase', url: 'https://crunchbase.com' },
    { name: 'InstaPay', share: 15, type: 'Disruptor', strength: 'UX', source: 'CBE', url: 'https://cbe.org.eg' },
    { name: 'Others', share: 30, type: 'Fragmented', strength: 'Niche', source: 'Report', url: 'https://example.com' }
  ]
};
