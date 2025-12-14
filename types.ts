
export type Language = 'en' | 'ar';
export type Region = 'Global' | 'Egypt' | 'MENA' | 'All';
export type Category = 'Latest' | 'Startups' | 'Events' | 'Podcasts' | 'Newsletters' | 'Market' | 'Partners';

export interface BaseItem {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  source: string;
  url: string;
  date: string;
  region: Region;
  imageUrl: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  type: 'News' | 'Startup' | 'Event' | 'Podcast' | 'Newsletter' | 'Other' | 'Tech' | 'Investment' | 'Business';
  region?: string;
  description?: string;
  imageUrl?: string;
}

export interface NewsItem extends BaseItem {
  category: 'Tech' | 'Startup' | 'Economy';
  sector?: string;
  tags: string[];
}

export interface EventItem extends BaseItem {
  location: string;
  startDate: string;
  endDate: string;
  registrationLink: string;
  isVirtual: boolean;
  type: 'Conference' | 'Hackathon' | 'Workshop' | 'Meetup' | 'Exhibition';
}

export interface PodcastItem extends BaseItem {
  duration: string;
  audioUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  anghamiUrl?: string;
  channelUrl?: string;
  summaryPoints: string[];
  language: 'ar' | 'en';
  topic: string;
  latestEpisodeTitle?: string;
  recentEpisodes?: any[];
}

export interface NewsletterItem extends BaseItem {
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  subscribeLink: string;
}

export type FeedItem = NewsItem | EventItem | PodcastItem | NewsletterItem;

export interface MarketMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  currency?: string;
  type: 'Index' | 'Crypto' | 'Currency';
}

export interface PartnerItem {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  contactEmail: string;
  type: 'Global' | 'Egypt';
  services: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface PodcastAnalysis {
  id: string;
  url: string;
  podcastName: string;
  episodeTitle: string;
  score: number;
  reportContent?: string;
  summary?: string;
  metrics?: { name: string; finding: string }[];
  recommendation?: string;
  date: string;
}

export interface TrendAnalysis {
  date: string;
  executiveSummary: string;
  topics: {
    category: string;
    topic: string;
    summary: string;
    sentiment: string;
  }[];
}

// Industry Analysis Types - Expanded for Detailed Reports
export interface SectorMetric {
  name: string; // e.g. "Fintech"
  growth: number;
  companies: number;
  investment: number;
  color: string;
  source: string;
  url: string;
  lastUpdated: string;
  // New Strategic Fields
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  pestle?: {
    political: string;
    economic: string;
    social: string;
    technological: string;
    legal: string;
    environmental: string;
  };
}

export interface MarketSizeItem {
  name: string;
  value: number;
  color: string;
  label: string;
  source: string;
  url: string;
}

export interface GrowthItem {
  year: string;
  value: number;
}

export interface CompetitorItem {
  name: string;
  share: number;
  type: string;
  strength: string;
  source: string;
  url: string;
}

export interface IndustryData {
  sectors: SectorMetric[];
  marketSizing: MarketSizeItem[];
  growthForecast: GrowthItem[];
  competitors: CompetitorItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[];
  preferences: {
    notifications: boolean;
    regions: Region[];
  };
  savedChats: any[];
  savedAnalyses: PodcastAnalysis[];
}
