
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Mail, Globe, ExternalLink, RefreshCw, BookOpen, Tag, Info, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import AIChat from '../components/AIChat';
import { useNavigate } from 'react-router-dom';
import { generateSummary } from '../services/geminiService';

// --- SUB-COMPONENT: Newsletter Card ---
const NewsletterCard = ({ item, t }: { item: any, t: any }) => {
    const { language } = useApp();
    const navigate = useNavigate();
    
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    const handleToggleSummary = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // If summary exists, toggle visibility
        if (summary) {
            setShowSummary(!showSummary);
            return;
        }

        // Generate Summary
        setIsSummarizing(true);
        try {
            const result = await generateSummary(`Newsletter Item: ${item.title}. \n\n${item.description}`, language);
            setSummary(result);
            setShowSummary(true);
        } catch (error) {
            console.error("Summary failed", error);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full group">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                        <div>
                            <h4 className="font-bold text-xs text-nexus-600 dark:text-nexus-400 uppercase tracking-wide">{item.source}</h4>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>
                    </div>
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {(item as any).sector || 'General'}
                    </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 group-hover:text-nexus-600 transition-colors cursor-pointer" onClick={() => navigate(`/article/${item.id}`)}>
                    {item.title}
                </h3>
                
                <div className="prose prose-sm dark:prose-invert max-w-none flex-1 relative">
                    {/* Toggle between Description and Summary */}
                    {showSummary && summary ? (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                <Bot className="w-3 h-3" /> AI Summary
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                {summary}
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-4 font-serif">
                            {item.description}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3">
                {/* AI Summary Button - Merged into actions */}
                <div className="col-span-2 flex gap-2">
                     <button 
                        onClick={handleToggleSummary}
                        disabled={isSummarizing}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium border ${showSummary ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'}`}
                    >
                        {isSummarizing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Bot className={`w-4 h-4 ${showSummary ? 'fill-current' : ''}`} />
                        )}
                        {isSummarizing ? 'Thinking...' : showSummary ? 'Original Text' : 'AI Summary'}
                    </button>
                </div>

                <button 
                    onClick={() => navigate(`/article/${item.id}`)}
                    className="flex items-center justify-center gap-2 py-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 transition-colors text-sm font-medium"
                >
                    <BookOpen className="w-4 h-4" /> {t.common.readHere}
                </button>
                <a 
                    href={item.subscribeLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                    {t.common.subscribe} <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
};

const Newsletters: React.FC = () => {
    const { language, regionFilter, setRegionFilter, newsletters, refreshCategoryFeed } = useApp();
    const t = TRANSLATIONS[language];
    const [topicFilter, setTopicFilter] = useState('All');
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (newsletters.length === 0) {
            handleSync();
        }
    }, []);

    // AUTO-RESET FILTER LOGIC
    useEffect(() => {
        if (topicFilter !== 'All') {
            const count = newsletters.filter(n => (n as any).sector === topicFilter).length;
            if (count === 0 && newsletters.length > 0) {
                const timer = setTimeout(() => {
                    setTopicFilter('All');
                }, 500); 
                return () => clearTimeout(timer);
            }
        }
    }, [topicFilter, newsletters]);

    const handleSync = async () => {
        setIsSyncing(true);
        await refreshCategoryFeed();
        setIsSyncing(false);
    };

    // DYNAMIC TOPIC OPTIONS
    const topicOptions = useMemo(() => {
        const availableSectors = Array.from(new Set(newsletters.map(n => (n as any).sector || 'General')));
        const baseOptions = [{ label: t.common.all, value: 'All' }];
        
        const dynamic = availableSectors
            .filter(s => s) // Remove empty/null
            .sort()
            .map(s => ({ label: s, value: s }));
            
        return [...baseOptions, ...dynamic];
    }, [newsletters, t.common.all]);

    const filtered = newsletters.filter(n => {
        const regionMatch = regionFilter === 'All' || n.region === regionFilter || (regionFilter === 'Egypt' && n.region === 'Egypt');
        const sector = (n as any).sector || 'General';
        
        // Exact match or fallback for Tech
        let topicMatch = topicFilter === 'All' || sector === topicFilter;
        if (topicFilter === 'Tech' && (sector === 'AI' || sector === 'Proptech' || sector === 'Deep Tech')) {
             topicMatch = true; 
        }

        return regionMatch && topicMatch;
    });

    const regionOptions = [
        { label: 'All Regions', value: 'All' },
        { label: 'Global', value: 'Global' },
        { label: 'Egypt', value: 'Egypt' }
    ];

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                        {t.sections.newslettersTitle}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Curated insights automatically categorized for you.</p>
                 </div>
                 <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="p-2 text-slate-500 hover:text-nexus-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-2"
                >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-medium">{isSyncing ? 'Syncing...' : 'Sync Latest'}</span>
                </button>
             </div>

             <div className="flex flex-col md:flex-row gap-4">
                 <FilterBar activeValue={regionFilter} onSelect={(v) => setRegionFilter(v as any)} options={regionOptions} icon={<Globe className="w-4 h-4" />} />
                 {/* Only show topic filter if options exist */}
                 {topicOptions.length > 1 && (
                    <FilterBar activeValue={topicFilter} onSelect={setTopicFilter} options={topicOptions} icon={<Tag className="w-4 h-4" />} />
                 )}
             </div>

             {filtered.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
                    <Info className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 mb-4">No newsletters found for this specific filter right now.</p>
                    <button onClick={() => setTopicFilter('All')} className="px-4 py-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 transition-colors">
                        View All Newsletters
                    </button>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filtered.map(item => (
                         <NewsletterCard key={item.id} item={item} t={t} />
                     ))}
                 </div>
             )}
             <AIChat contextData="Page: Newsletters." />
        </div>
    );
};

export default Newsletters;
