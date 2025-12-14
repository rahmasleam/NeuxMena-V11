
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import NewsCard from '../components/NewsCard';
import AIChat from '../components/AIChat';
import { RefreshCw, Zap, TrendingUp, Mic, Calendar, Mail, ExternalLink, MapPin, Play, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Latest: React.FC = () => {
    const { language, latestNews, startupNews, podcasts, newsletters, events, refreshCategoryFeed } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);

    // Filter by type/category - Use startupNews for articles
    const topArticles = startupNews.slice(0, 6);
    const topNewsletters = newsletters.slice(0, 4);
    const topPodcasts = podcasts.filter(p => p.youtubeUrl).slice(0, 4);
    const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).slice(0, 3);

    const handleManualSync = async () => {
        setIsSyncing(true);
        await refreshCategoryFeed();
        setIsSyncing(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn pb-20">
            <div className="flex-1 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Zap className="w-9 h-9 text-yellow-500 fill-current" />
                            {t.sections.latestTitle}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">{t.sections.topStoriesDesc}</p>
                    </div>
                    <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium text-sm border border-indigo-200 dark:border-indigo-800"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? (language === 'ar' ? 'جاري التحديث...' : 'Fetching Real-Time Data...') : t.common.refresh}
                    </button>
                </div>

                {/* 1. TOP ARTICLES SECTION */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md">
                        <TrendingUp className="w-5 h-5" />
                        {t.common.articles}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topArticles.length === 0 ? (
                            <div className="col-span-3 text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500">No articles available. Click refresh.</p>
                            </div>
                        ) : (
                            topArticles.map((item, index) => (
                                <NewsCard key={item.id} item={item} />
                            ))
                        )}
                    </div>
                </div>

                {/* 2. EVENTS SECTION (Upcoming High Benefit) */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md">
                        <Calendar className="w-5 h-5" />
                        {t.common.upcomingHighBenefit}
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {upcomingEvents.length === 0 ? <p className="text-slate-500 text-center w-full col-span-3">No upcoming events found.</p> : upcomingEvents.map(event => (
                                <div key={event.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full" onClick={() => window.open(event.registrationLink, '_blank')}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full text-xs font-bold">
                                            {event.type}
                                        </span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {new Date(event.startDate).getDate()} {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">{event.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                                        <MapPin className="w-3 h-3" /> {event.location}
                                    </div>
                                    <button className="mt-auto w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                                        <Ticket className="w-4 h-4" /> Register Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. PODCASTS SECTION */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md">
                        <Mic className="w-5 h-5" />
                        {t.common.importantPodcasts}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topPodcasts.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group cursor-pointer" onClick={() => window.open(item.youtubeUrl || item.url, '_blank')}>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Play className="w-10 h-10 text-white fill-current" />
                                    </div>
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                                        VIDEO
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">{item.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-2">{item.topic} • {item.source}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. NEWSLETTERS SECTION */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md">
                        <Mail className="w-5 h-5" />
                        {language === 'ar' ? t.common.mostImportantNews : t.common.newsletters}
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topNewsletters.slice(0, 4).map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(`/article/${item.id}`)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">{item.source}</span>
                                        <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors">{item.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AIChat contextData={`Page: Latest News. Showing top articles, newsletters, podcasts, and events.`} />
        </div>
    );
};

export default Latest;
