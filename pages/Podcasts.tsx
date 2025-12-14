
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, PODCAST_CHANNELS } from '../constants';
import { PlayCircle, Mic, Search, Headphones, Globe, ExternalLink, Bot, Volume2, X, FileText, List, Video, Youtube, Sparkles, ArrowRight, Music, Play, ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';
import AIChat from '../components/AIChat';
import { generateSummary, translateText } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

// --- SUB-COMPONENT: Podcast Card ---
const PodcastCard = ({ item, openSummaryModal }: { item: any, openSummaryModal: (item: any, isVideo: boolean) => void }) => {
    const { language } = useApp();
    
    // Local State for AI Features
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedData, setTranslatedData] = useState<{ title: string, description: string } | null>(null);
    
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    const handleTranslate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (translatedData) {
            setTranslatedData(null); // Toggle off
            return;
        }

        setIsTranslating(true);
        const targetLang = language === 'en' ? 'ar' : 'en';
        
        try {
            const [tTitle, tDesc] = await Promise.all([
                translateText(item.title, targetLang),
                translateText(item.description, targetLang)
            ]);
            setTranslatedData({ title: tTitle, description: tDesc });
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleGenerateSummary = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showSummary && summary) {
            setShowSummary(false); // Toggle visibility
            return;
        }
        
        if (summary) {
            setShowSummary(true); // Just show if already generated
            return;
        }

        setIsSummarizing(true);
        try {
            const result = await generateSummary(`Podcast Episode: ${item.title}. \n\nDescription: ${item.description}`, language);
            setSummary(result);
            setShowSummary(true);
        } catch (error) {
            console.error("Summary failed", error);
        } finally {
            setIsSummarizing(false);
        }
    };

    const isVideo = !!item.youtubeUrl;
    const displayTitle = translatedData ? translatedData.title : (language === 'ar' && item.titleAr ? item.titleAr : item.title);
    const displayDesc = translatedData ? translatedData.description : (language === 'ar' && item.descriptionAr ? item.descriptionAr : item.description);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full group hover:border-nexus-300 dark:hover:border-nexus-600 transition-all">
            {/* Thumbnail Section */}
            <div className="relative h-48 bg-black cursor-pointer group" onClick={() => openSummaryModal(item, isVideo)}>
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className={`w-12 h-12 ${isVideo ? 'bg-red-600' : 'bg-green-600'} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        {isVideo ? <Play className="w-6 h-6 text-white fill-current ml-1" /> : <Headphones className="w-6 h-6 text-white" />}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-200 mb-1">
                        <span className={`${isVideo ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-0.5 rounded font-bold`}>
                            {isVideo ? 'VIDEO' : 'AUDIO'}
                        </span>
                        <span>{item.duration}</span>
                        <span>• {item.date}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3 flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.source}</h4>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">{item.topic}</span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                        {displayTitle}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {displayDesc}
                    </p>

                    {/* AI Summary Box */}
                    {showSummary && summary && (
                        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg animate-fadeIn">
                             <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                <Bot className="w-3 h-3" /> AI Summary
                             </div>
                             <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {summary}
                             </p>
                        </div>
                    )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex gap-2">
                         <button 
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${translatedData ? 'bg-nexus-100 text-nexus-700 dark:bg-nexus-900 dark:text-nexus-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                        >
                            <Globe className={`w-3 h-3 ${isTranslating ? 'animate-spin' : ''}`} /> 
                            {isTranslating ? 'Translating...' : (translatedData ? (language === 'en' ? 'Original' : 'الأصل') : (language === 'en' ? 'Arabic' : 'English'))}
                        </button>
                        
                        <button 
                            onClick={handleGenerateSummary}
                            disabled={isSummarizing}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${showSummary ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                        >
                            <Bot className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
                            {isSummarizing ? 'Thinking...' : 'Summary'}
                        </button>
                    </div>

                    <div className="flex gap-2 mt-1">
                        <button 
                            onClick={() => openSummaryModal(item, isVideo)}
                            className="flex-1 py-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            <PlayCircle className="w-4 h-4" /> Play
                        </button>
                        <a 
                            href={item.youtubeUrl || item.spotifyUrl || item.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Open Source"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Podcasts: React.FC = () => {
    const { language, podcasts } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [topicFilter, setTopicFilter] = useState('All');
    const [langFilter, setLangFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'episodes' | 'channels'>('episodes');
    
    // Modal State
    const [selectedPodcast, setSelectedPodcast] = useState<any | null>(null);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    const getYoutubeId = (url: string | undefined): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredPodcasts = useMemo(() => {
        return podcasts.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTopic = topicFilter === 'All' || p.topic === topicFilter;
            const matchesLang = langFilter === 'All' || p.language === langFilter;
            return matchesSearch && matchesTopic && matchesLang;
        });
    }, [podcasts, searchTerm, topicFilter, langFilter]);

    // Dynamic Options based on Data
    const topicOptions = useMemo(() => {
        const uniqueTopics = Array.from(new Set(podcasts.map(p => p.topic).filter(Boolean)));
        const base = [{ label: 'All Fields', value: 'All' }];
        const dynamic = uniqueTopics.sort().map(topic => ({ label: topic, value: topic }));
        return [...base, ...dynamic];
    }, [podcasts]);

    const langOptions = useMemo(() => {
        const uniqueLangs = Array.from(new Set(podcasts.map(p => p.language).filter(Boolean)));
        const base = [{ label: 'All Languages', value: 'All' }];
        const dynamic = uniqueLangs.map(lang => ({ 
            label: lang === 'ar' ? 'Arabic' : 'English', 
            value: lang 
        }));
        return [...base, ...dynamic];
    }, [podcasts]);

    const openSummaryModal = (podcast: any, isVideo: boolean) => {
        setSelectedPodcast(podcast);
        setIsPlayingVideo(isVideo);
    };

    const closeModal = () => {
        setSelectedPodcast(null);
        setIsPlayingVideo(false);
    };

    // Styling Constants
    const selectWrapperClass = "relative flex-1 min-w-[160px]";
    const selectClass = "w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-2.5 pl-10 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-500 cursor-pointer transition-shadow text-sm font-medium";
    const iconClass = "absolute left-3 top-3 w-4 h-4 text-slate-400";
    const chevronClass = "absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none";

    return (
        <div className="space-y-8 relative pb-20 animate-fadeIn">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mic className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                        {t.sections.podcastsTitle}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.common.curatedEpisodes}</p>
                 </div>
                 
                 {/* Search Bar */}
                 <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder={t.common.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                 </div>
             </div>

            {/* Link to Deep Analysis Page */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">{t.common.podcastAnalyzer}</h3>
                        <p className="text-indigo-100 text-sm opacity-90">{t.common.podcastAnalyzerDesc}</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/podcast-analysis')}
                    className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    {language === 'ar' ? 'جرب الأداة' : 'Try Tool'} <ArrowRight className="w-4 h-4" />
                </button>
            </div>

             {/* DROPDOWN FILTER BAR */}
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Field/Topic Dropdown */}
                    {topicOptions.length > 1 && (
                        <div className={selectWrapperClass}>
                            <Headphones className={iconClass} />
                            <select
                                value={topicFilter}
                                onChange={(e) => setTopicFilter(e.target.value)}
                                className={selectClass}
                            >
                                {topicOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className={chevronClass} />
                        </div>
                    )}

                    {/* Language Dropdown */}
                    {langOptions.length > 1 && (
                        <div className={selectWrapperClass}>
                            <Globe className={iconClass} />
                            <select
                                value={langFilter}
                                onChange={(e) => setLangFilter(e.target.value)}
                                className={selectClass}
                            >
                                {langOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className={chevronClass} />
                        </div>
                    )}
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full md:w-auto">
                    <button
                        onClick={() => setViewMode('episodes')}
                        className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                            viewMode === 'episodes'
                                ? 'bg-white dark:bg-slate-600 text-nexus-600 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden md:inline">{t.common.podcasts}</span>
                    </button>
                    <button
                        onClick={() => setViewMode('channels')}
                        className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                            viewMode === 'channels'
                                ? 'bg-white dark:bg-slate-600 text-nexus-600 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Video className="w-4 h-4" />
                        <span className="hidden md:inline">{t.common.channels}</span>
                    </button>
                </div>
             </div>

             {/* MAIN CONTENT AREA */}
             
             {/* MODE 1: EPISODES LIST */}
             {viewMode === 'episodes' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                     {filteredPodcasts.length === 0 ? (
                         <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                             <p className="text-slate-500">No episodes found matching your filters.</p>
                             <button onClick={() => { setTopicFilter('All'); setLangFilter('All'); setSearchTerm(''); }} className="mt-2 text-nexus-600 hover:underline">Clear all filters</button>
                         </div>
                     ) : (
                         filteredPodcasts.map(item => (
                             <PodcastCard key={item.id} item={item} openSummaryModal={openSummaryModal} />
                         ))
                     )}
                 </div>
             )}

             {/* MODE 2: CHANNELS DIRECTORY */}
             {viewMode === 'channels' && (
                 <div className="animate-fadeIn">
                     <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <List className="w-6 h-6 text-nexus-600" />
                            Featured Channels Directory
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Direct access to top tech and business creators.</p>
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                         {PODCAST_CHANNELS.map(channel => (
                             <div 
                                key={channel.name} 
                                className="flex flex-col items-center text-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-nexus-400 dark:hover:border-nexus-500 hover:shadow-lg transition-all group relative overflow-hidden"
                             >
                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 
                                 <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-slate-100 dark:border-slate-700 group-hover:border-nexus-300 transition-colors shadow-md relative z-10">
                                     <img src={channel.imageUrl} alt={channel.name} className="w-full h-full object-cover" />
                                 </div>
                                 
                                 <h4 className="font-bold text-base text-slate-800 dark:text-white mb-1 group-hover:text-nexus-600 transition-colors relative z-10">{channel.name}</h4>
                                 
                                 <div className="flex flex-col gap-1 items-center mb-4 relative z-10">
                                     <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{channel.topic}</span>
                                     <span className="text-[10px] text-slate-500 dark:text-slate-500">{channel.language === 'ar' ? 'Arabic' : 'English'}</span>
                                 </div>
                                 
                                 <a 
                                    href={channel.channelUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 relative z-10 shadow-sm"
                                 >
                                     <Youtube className="w-4 h-4" /> Visit Channel
                                 </a>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

             <AIChat contextData={`Page: Podcasts. Listing ${filteredPodcasts.length} episodes.`} />

             {/* Smart Summary / Player Modal */}
             {selectedPodcast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-slate-700">
                        {/* Video/Media Side */}
                        <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative">
                            {isPlayingVideo && getYoutubeId(selectedPodcast.youtubeUrl || selectedPodcast.url || selectedPodcast.audioUrl) ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    className="aspect-video md:h-full"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedPodcast.youtubeUrl || selectedPodcast.url || selectedPodcast.audioUrl)}?autoplay=1`} 
                                    title={selectedPodcast.title} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="p-10 text-center">
                                    <div className="w-24 h-24 bg-nexus-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Headphones className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-2">{selectedPodcast.title}</h3>
                                    <p className="text-slate-400 mb-6">Audio Podcast • {selectedPodcast.duration}</p>
                                    <div className="flex gap-4 justify-center">
                                         {selectedPodcast.spotifyUrl && (
                                             <a href={selectedPodcast.spotifyUrl} target="_blank" rel="noreferrer" className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
                                                 <Music className="w-5 h-5" /> Open Spotify
                                             </a>
                                         )}
                                          {selectedPodcast.url && (
                                             <a href={selectedPodcast.url} target="_blank" rel="noreferrer" className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                                                 <ExternalLink className="w-5 h-5" /> Source Link
                                             </a>
                                         )}
                                    </div>
                                </div>
                            )}
                            <button 
                                onClick={closeModal} 
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 md:hidden z-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Info Side */}
                        <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-[50vh] md:h-auto">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 dark:text-white truncate">Episode Details</h3>
                                <button onClick={closeModal} className="hidden md:block hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-nexus-600 mb-1">{selectedPodcast.source}</div>
                                    <h2 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2">{selectedPodcast.title}</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedPodcast.description}</p>
                                </div>

                                {selectedPodcast.summaryPoints && selectedPodcast.summaryPoints.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Key Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPodcast.summaryPoints.map((pt: string, idx: number) => (
                                                <span key={idx} className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                                    {pt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <button 
                                    onClick={() => navigate('/podcast-analysis')}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <BrainCircuit className="w-5 h-5" /> Analyze Deeply with AI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default Podcasts;
