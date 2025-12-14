import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import NewsCard from '../components/NewsCard';
import { Bookmark, Calendar, Mic, Mail, Users, ExternalLink, BrainCircuit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Saved: React.FC = () => {
    const { language, favorites, toggleFavorite, latestNews, startupNews, events, podcasts, newsletters, partners, savedAnalyses, deleteAnalysis } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();
    const [showAnalyses, setShowAnalyses] = useState(true);

    // Aggregate all items
    const allItems = [
        ...latestNews,
        ...startupNews,
        ...events,
        ...podcasts,
        ...newsletters,
        ...partners
    ];

    // Deduplicate items by ID
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
    const savedItems = uniqueItems.filter(item => favorites.includes(item.id));

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                    {t.nav.saved}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your personal library of content and reports.</p>
            </div>

            {/* Saved Podcast Analyses Section */}
            {savedAnalyses.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 shadow-sm">
                    <button
                        onClick={() => setShowAnalyses(!showAnalyses)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Podcast Reports ({savedAnalyses.length})</h3>
                        </div>
                        {showAnalyses ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {showAnalyses && (
                        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Desktop Table */}
                            <table className="hidden md:table w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Podcast</th>
                                        <th className="p-4 font-semibold">Episode</th>
                                        <th className="p-4 font-semibold">Score</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {savedAnalyses.map(analysis => (
                                        <tr key={analysis.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-900 dark:text-white">{analysis.podcastName}</td>
                                            <td className="p-4 text-slate-700 dark:text-slate-300">{analysis.episodeTitle}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${analysis.score >= 8 ? 'bg-green-100 text-green-700' :
                                                        analysis.score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {analysis.score}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2 items-center">
                                                <button
                                                    onClick={() => window.open(analysis.url, '_blank')}
                                                    className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors font-medium"
                                                >
                                                    Open Link
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteAnalysis(analysis.id); }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Cards */}
                            <div className="md:hidden flex flex-col divide-y divide-slate-200 dark:divide-slate-700">
                                {savedAnalyses.map(analysis => (
                                    <div key={analysis.id} className="p-4 bg-white dark:bg-slate-900 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{analysis.podcastName}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{analysis.episodeTitle}</div>
                                            </div>
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${analysis.score >= 8 ? 'bg-green-100 text-green-700' :
                                                    analysis.score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {analysis.score}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-2">
                                            <button
                                                onClick={() => window.open(analysis.url, '_blank')}
                                                className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded font-medium flex-1 text-center"
                                            >
                                                Open Link
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteAnalysis(analysis.id); }}
                                                className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 my-8"></div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Saved Content</h3>

            {savedItems.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No saved articles or events yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedItems.map(item => {
                        // Determine type - News and Startups use NewsCard
                        if ('sector' in item || ('category' in item && typeof (item as any).category === 'string')) {
                            return <NewsCard key={item.id} item={item as any} />;
                        }

                        // Generic Card for other types (Events, Podcasts, etc.)
                        return (
                            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col relative group transition-all hover:shadow-md h-full">
                                <button
                                    onClick={() => toggleFavorite(item.id)}
                                    className="absolute top-4 right-4 p-2 text-nexus-600 dark:text-nexus-400 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"
                                    title="Remove from saved"
                                >
                                    <Bookmark className="w-4 h-4 fill-current" />
                                </button>

                                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {'startDate' in item ? <Calendar className="w-4 h-4" /> :
                                        'duration' in item ? <Mic className="w-4 h-4" /> :
                                            'frequency' in item ? <Mail className="w-4 h-4" /> :
                                                <Users className="w-4 h-4" />
                                    }
                                    {'startDate' in item ? 'Event' : 'duration' in item ? 'Podcast' : 'frequency' in item ? 'Newsletter' : 'Partner'}
                                </div>

                                {((item as any).imageUrl || (item as any).logo) && (
                                    <div className="h-40 w-full mb-4 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <img src={(item as any).imageUrl || (item as any).logo} alt={(item as any).title || (item as any).name} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                    {(item as any).title || (item as any).name}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-1">
                                    {(item as any).description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <a
                                        href={(item as any).url || (item as any).website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium text-nexus-600 dark:text-nexus-400 hover:text-nexus-700 dark:hover:text-nexus-300 transition-colors"
                                    >
                                        Open Link
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Saved;