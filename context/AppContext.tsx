
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Region, ChatMessage, NewsItem, EventItem, PodcastItem, NewsletterItem, MarketMetric, PartnerItem, ResourceItem, PodcastAnalysis, IndustryData, TrendAnalysis, FeedItem } from '../types';
import { EVENTS, PODCASTS, NEWSLETTERS, MARKET_DATA_INDICES, PARTNERS, RESOURCES, INDUSTRY_DATA } from '../constants';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { analyzeTrends } from '../services/geminiService';
import { fetchStartupsFeed, fetchPodcastsFeed, fetchNewslettersFeed } from '../utils/rssFetcher';

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  regionFilter: Region | 'All';
  setRegionFilter: (r: Region | 'All') => void;
  savedChats: { id: string; title: string; messages: ChatMessage[]; date: string }[];
  saveCurrentChat: (messages: ChatMessage[]) => void;
  savedAnalyses: PodcastAnalysis[];
  saveAnalysis: (analysis: PodcastAnalysis) => void;
  deleteAnalysis: (id: string) => void;
  addItem: (category: string, item: any) => void;
  updateItem: (category: string, item: any) => void;
  deleteItem: (id: string, category: string) => void;
  addResource: (item: ResourceItem) => void;
  getItemById: (id: string) => any | null;
  refreshCategoryFeed: (category?: 'latest' | 'startup' | 'podcasts') => Promise<void>;

  // Data State
  latestNews: FeedItem[];
  startupNews: NewsItem[]; // This acts as the general news pool now
  groupedStartups: Record<string, NewsItem[]>;
  events: EventItem[];
  podcasts: PodcastItem[];
  newsletters: NewsletterItem[];
  marketIndices: MarketMetric[];
  partners: PartnerItem[];
  resources: ResourceItem[];
  industryData: IndustryData;
  dailyTrends: TrendAnalysis | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // PERSISTENT STATE INITIALIZATION
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('nexus_language') as Language) || 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nexus_theme') as 'light' | 'dark') || 'light';
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // MOCK USER PERSISTENCE (For demo/guest)
  const [mockUser, setMockUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('nexus_mock_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_favorites') || '[]'); } catch { return []; }
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('nexus_notifications') === 'true';
  });

  const [regionFilter, setRegionFilter] = useState<Region | 'All'>('All');

  // SAVED ITEMS
  const [savedChats, setSavedChats] = useState<{ id: string; title: string; messages: ChatMessage[]; date: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_saved_chats') || '[]'); } catch { return []; }
  });

  const [savedAnalyses, setSavedAnalyses] = useState<PodcastAnalysis[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_saved_analyses') || '[]'); } catch { return []; }
  });

  // DATA CONTENT STATE
  const [latestNews, setLatestNews] = useState<FeedItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_latest_news') || '[]'); } catch { return []; }
  });

  const [startupNews, setStartupNews] = useState<NewsItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_startup_news') || '[]'); } catch { return []; }
  });

  const [groupedStartups, setGroupedStartups] = useState<Record<string, NewsItem[]>>({});

  const [events, setEvents] = useState<EventItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_events') || JSON.stringify(EVENTS)); } catch { return EVENTS; }
  });

  const [podcasts, setPodcasts] = useState<PodcastItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_podcasts') || JSON.stringify(PODCASTS)); } catch { return PODCASTS; }
  });

  const [newsletters, setNewsletters] = useState<NewsletterItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_newsletters') || JSON.stringify(NEWSLETTERS)); } catch { return NEWSLETTERS; }
  });

  const [marketIndices, setMarketIndices] = useState<MarketMetric[]>(MARKET_DATA_INDICES);
  const [partners, setPartners] = useState<PartnerItem[]>(PARTNERS);
  const [industryData, setIndustryData] = useState<IndustryData>(INDUSTRY_DATA);
  const [dailyTrends, setDailyTrends] = useState<TrendAnalysis | null>(null);

  // RESOURCES (Sources configuration)
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_resources') || JSON.stringify(RESOURCES)); } catch { return RESOURCES; }
  });

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Real Firebase User
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          favorites: [],
          preferences: { notifications: true, regions: ['Global'] },
          savedChats: [],
          savedAnalyses: []
        };
        setUser(userData);
        setIsAdmin(firebaseUser.email === 'admin@edafaa.com');
      } else {
        // Fallback to Mock User (if guest login was used)
        setUser(mockUser);
        setIsAdmin(mockUser?.email === 'admin@edafaa.com');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [mockUser]);

  // PERSISTENCE EFFECTS
  useEffect(() => { localStorage.setItem('nexus_language', language); }, [language]);
  useEffect(() => { 
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('nexus_theme', theme); 
  }, [theme]);
  useEffect(() => { localStorage.setItem('nexus_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('nexus_notifications', String(notificationsEnabled)); }, [notificationsEnabled]);
  useEffect(() => { localStorage.setItem('nexus_saved_chats', JSON.stringify(savedChats)); }, [savedChats]);
  useEffect(() => { localStorage.setItem('nexus_saved_analyses', JSON.stringify(savedAnalyses)); }, [savedAnalyses]);
  
  // Data Persistence
  useEffect(() => { localStorage.setItem('nexus_latest_news', JSON.stringify(latestNews)); }, [latestNews]);
  useEffect(() => { localStorage.setItem('nexus_startup_news', JSON.stringify(startupNews)); }, [startupNews]);
  useEffect(() => { localStorage.setItem('nexus_podcasts', JSON.stringify(podcasts)); }, [podcasts]);
  useEffect(() => { localStorage.setItem('nexus_newsletters', JSON.stringify(newsletters)); }, [newsletters]);
  useEffect(() => { localStorage.setItem('nexus_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('nexus_resources', JSON.stringify(resources)); }, [resources]);

  // AUTOMATIC REFRESH ON MOUNT OR DAILY
  useEffect(() => {
     const lastUpdate = localStorage.getItem('nexus_last_update');
     const now = Date.now();
     const oneHour = 60 * 60 * 1000;

     // Force refresh if never updated or updated more than 1 hour ago
     if (!lastUpdate || (now - parseInt(lastUpdate)) > oneHour || resources.length > 0) {
        refreshCategoryFeed();
     }
  }, []); 

  // ACTIONS
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const login = async (email: string, pass: string) => {
    if (email.endsWith('@nexus.demo')) {
      const mock: User = { 
          id: 'guest_123', name: 'Guest User', email, favorites: [], 
          preferences: { notifications: true, regions: ['Global'] }, savedChats: [], savedAnalyses: [] 
      };
      setMockUser(mock);
      localStorage.setItem('nexus_mock_user', JSON.stringify(mock));
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name });
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setMockUser(null);
    localStorage.removeItem('nexus_mock_user');
    setUser(null);
  };

  const saveCurrentChat = (messages: ChatMessage[]) => {
    const title = messages[1]?.content.substring(0, 30) + "..." || "New Chat";
    const newChat = { id: Date.now().toString(), title, messages, date: new Date().toISOString() };
    setSavedChats(prev => [newChat, ...prev]);
  };

  const saveAnalysis = (analysis: PodcastAnalysis) => {
      setSavedAnalyses(prev => [analysis, ...prev]);
  };

  const deleteAnalysis = (id: string) => {
      setSavedAnalyses(prev => prev.filter(a => a.id !== id));
  };

  const addItem = (category: string, item: any) => {
      if (category === 'podcasts') setPodcasts(prev => [item, ...prev]);
      if (category === 'newsletters') setNewsletters(prev => [item, ...prev]);
      if (category === 'events') setEvents(prev => [item, ...prev]);
      if (category === 'latest') setStartupNews(prev => [item, ...prev]); // Add manual articles to news flow
  };

  const updateItem = (category: string, item: any) => {
      // Logic for editing items would go here
  };

  const deleteItem = (id: string, category: string) => {
      if (category === 'resources') setResources(prev => prev.filter(i => i.id !== id));
      if (category === 'startup') setStartupNews(prev => prev.filter(i => i.id !== id));
      if (category === 'podcasts') setPodcasts(prev => prev.filter(i => i.id !== id));
      if (category === 'newsletters') setNewsletters(prev => prev.filter(i => i.id !== id));
  };

  const addResource = (item: ResourceItem) => {
      setResources(prev => [...prev, item]);
  };

  const getItemById = (id: string) => {
    return [...latestNews, ...startupNews, ...podcasts, ...events, ...newsletters].find(i => i.id === id) || null;
  };

  // CORE: RSS FETCHING LOGIC - Updated
  const refreshCategoryFeed = async (category?: 'latest' | 'startup' | 'podcasts') => {
    console.log("Refreshing Feeds...");
    
    // Fetch EVERYTHING in parallel to ensure consistency across pages
    const [newsData, podcastData, newsletterData] = await Promise.all([
        fetchStartupsFeed(resources),
        fetchPodcastsFeed(resources),
        fetchNewslettersFeed(resources)
    ]);

    // Update Startups/News State
    setLatestNews(newsData.latest);
    setStartupNews(Object.values(newsData.startups).flat()); // Combine all sources
    setGroupedStartups(newsData.startups);
    
    // Update Podcasts State
    setPodcasts(podcastData);

    // Update Newsletters State
    setNewsletters(newsletterData);

    // Save timestamp
    localStorage.setItem('nexus_last_update', Date.now().toString());

    // Analyze Trends (Optional, if we have new articles)
    if (newsData.latest.length > 0) {
        const trends = await analyzeTrends(newsData.latest.slice(0, 10) as NewsItem[]);
        if (trends) setDailyTrends(trends);
    }
  };

  return (
    <AppContext.Provider value={{
      user, isAdmin, loading, theme, toggleTheme, language, toggleLanguage,
      favorites, toggleFavorite, notificationsEnabled, toggleNotifications,
      login, signup, resetPassword, logout,
      regionFilter, setRegionFilter,
      savedChats, saveCurrentChat, savedAnalyses, saveAnalysis, deleteAnalysis,
      addItem, updateItem, deleteItem, addResource, getItemById,
      refreshCategoryFeed,
      latestNews, startupNews, groupedStartups, events, podcasts, newsletters, marketIndices, partners, resources, industryData, dailyTrends
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
