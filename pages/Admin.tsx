
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { PlusCircle, Link as LinkIcon, Trash2, ShieldCheck, LayoutDashboard, FileText, Database, AlertCircle, Bot, ArrowRight, Check, Zap, Edit, DownloadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reviewContent, fetchLatestFromSource } from '../services/geminiService';

const Admin: React.FC = () => {
    const { language, user, isAdmin, addItem, updateItem, deleteItem, addResource, latestNews, startupNews, resources, events, podcasts, newsletters, marketIndices, partners } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'manage'>('dashboard');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [targetPage, setTargetPage] = useState<string>('latest');
    const [subMode, setSubMode] = useState<string>('single'); // single, rss, channel, playlist

    // Unified Form State
    const [formData, setFormData] = useState({
        title: '',
        url: '', // This acts as Link, RSS URL, Channel URL depending on mode
        description: '',
        source: '',
        region: 'Global',
        // Type Specifics
        startDate: '',
        endDate: '',
        location: '',
        duration: '',
        frequency: '',
        sector: '',
        marketValue: '',
        marketTrend: 'up',
        logoUrl: '',
        contactEmail: '',
        summaryPoints: '',
        youtubeUrl: '',
        spotifyUrl: ''
    });

    // Reset form when switching pages/modes
    useEffect(() => {
        setFormData(prev => ({ ...prev, title: '', url: '', description: '', source: '', youtubeUrl: '', spotifyUrl: '', logoUrl: '' }));
    }, [targetPage, subMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper to get YouTube RSS
    const getYouTubeRSS = async (url: string, type: 'channel' | 'playlist'): Promise<string | null> => {
        try {
            if (type === 'channel') {
                const idMatch = url.match(/\/channel\/(UC[\w-]+)/);
                if (idMatch) return `https://www.youtube.com/feeds/videos.xml?channel_id=${idMatch[1]}`;
                if (url.includes('@')) {
                    alert("Correction: For best results, please use the full Channel ID URL (e.g. youtube.com/channel/UC...)\nWe will try to add it but it might not work without the ID.");
                    return null;
                }
            } else if (type === 'playlist') {
                const idMatch = url.match(/[?&]list=([^&]+)/);
                if (idMatch) return `https://www.youtube.com/feeds/videos.xml?playlist_id=${idMatch[1]}`;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Handle Resource/RSS Additions
        if (
            (targetPage === 'latest' || targetPage === 'startup' || targetPage === 'events') ||
            (targetPage === 'podcasts' && ['rss', 'channel', 'playlist'].includes(subMode)) ||
            (targetPage === 'newsletters' && subMode === 'rss')
        ) {
            let finalRssUrl = formData.url;
            let type = targetPage === 'startup' ? 'Startup' : targetPage === 'podcasts' ? 'Podcast' : targetPage === 'events' ? 'Event' : 'News';

            if (targetPage === 'podcasts') {
                if (subMode === 'channel') {
                    const rss = await getYouTubeRSS(formData.url, 'channel');
                    if (!rss) return alert("Could not extract Channel ID. Please use a URL like youtube.com/channel/UC...");
                    finalRssUrl = rss;
                } else if (subMode === 'playlist') {
                    const rss = await getYouTubeRSS(formData.url, 'playlist');
                    if (!rss) return alert("Could not extract Playlist ID.");
                    finalRssUrl = rss;
                }
            }

            const newResource = {
                id: `res_${Date.now()}`,
                name: formData.title || 'New Source', // Title acts as Source Name
                url: formData.url, // Original Link
                rssUrl: finalRssUrl,
                type: type as any,
                description: formData.description || `Added via Admin as ${subMode}`,
                imageUrl: formData.logoUrl // Added: Store the channel/source logo if provided
            };

            addResource(newResource);
            alert("Data Source Added! It will be scanned in the next background update.");
            setFormData({ ...formData, title: '', url: '', description: '', logoUrl: '' });
            return;
        }

        // 2. Handle Single Item Additions (Manual)
        const finalData: any = {
            id: editingId || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            url: formData.url,
            source: formData.source || 'Admin',
            region: formData.region,
            date: new Date().toISOString().split('T')[0],
            imageUrl: `https://picsum.photos/800/400?random=${Date.now()}`
        };

        if (targetPage === 'podcasts' && subMode === 'single') {
            finalData.category = 'Podcasts';
            finalData.duration = formData.duration || 'N/A';
            finalData.youtubeUrl = formData.youtubeUrl;
            finalData.spotifyUrl = formData.spotifyUrl;
            // Add to Podcasts
            addItem('podcasts', finalData);
        } else if (targetPage === 'newsletters' && subMode === 'newspaper') {
            finalData.category = 'Newsletters';
            finalData.frequency = formData.frequency || 'Weekly';
            // Add to Newsletters
            addItem('newsletters', finalData);
        }

        alert("Content Added Successfully!");
        setFormData({ ...formData, title: '', url: '', description: '' });
        setEditingId(null);
    };

    // Render Sub-Selection for Podcasts
    const renderPodcastOptions = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
                { id: 'single', label: 'Single Episode', icon: <Bot className="w-4 h-4" /> },
                { id: 'rss', label: 'RSS Feed', icon: <LinkIcon className="w-4 h-4" /> },
                { id: 'channel', label: 'YouTube Channel', icon: <ArrowRight className="w-4 h-4" /> },
                { id: 'playlist', label: 'YT Playlist', icon: <LayoutDashboard className="w-4 h-4" /> }
            ].map(opt => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSubMode(opt.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${subMode === opt.id ? 'bg-nexus-600 text-white border-nexus-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-nexus-300'}`}
                >
                    {opt.icon}
                    <span className="text-xs font-bold">{opt.label}</span>
                </button>
            ))}
        </div>
    );

    // Render Sub-Selection for Newsletters
    const renderNewsletterOptions = () => (
        <div className="grid grid-cols-2 gap-4 mb-6">
            {[
                { id: 'rss', label: 'RSS Feed Link', icon: <LinkIcon className="w-4 h-4" /> },
                { id: 'newspaper', label: 'Newspaper Link', icon: <FileText className="w-4 h-4" /> },
            ].map(opt => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSubMode(opt.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${subMode === opt.id ? 'bg-nexus-600 text-white border-nexus-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-nexus-300'}`}
                >
                    {opt.icon}
                    <span className="text-xs font-bold">{opt.label}</span>
                </button>
            ))}
        </div>
    );

    const inputClass = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-nexus-500 outline-none";

    if (!user || (!isAdmin && user.email !== 'admin@edafaa.com')) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-nexus-900 to-nexus-700 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-nexus-300" />
                        Admin Dashboard
                    </h1>
                    <p className="text-nexus-100 mt-2 opacity-90">Welcome, {user.name} ({user.email})</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-1 overflow-x-auto">
                {['dashboard', 'add', 'manage'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); }}
                        className={`pb-3 px-4 font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'text-nexus-600 border-b-2 border-nexus-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab === 'add' ? 'Manual Add / Import' : tab}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[500px]">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Latest News', count: latestNews.length, color: 'blue' },
                            { label: 'Startups', count: startupNews.length, color: 'purple' },
                            { label: 'Podcasts', count: podcasts.length, color: 'pink' },
                            { label: 'Active Sources', count: resources.length, color: 'green' }
                        ].map((stat, i) => (
                            <div key={i} className={`p-6 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl border border-${stat.color}-100`}>
                                <div className="font-bold text-slate-700 dark:text-slate-300">{stat.label}</div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.count}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MANUAL ADD TAB */}
                {activeTab === 'add' && (
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* 1. Target Page Selection */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">1. Select Target Page</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {['latest', 'startup', 'podcasts', 'newsletters', 'events'].map(page => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => { setTargetPage(page); setSubMode('single'); }}
                                            className={`p-4 rounded-xl border capitalize font-bold transition-all ${targetPage === page ? 'bg-nexus-100 dark:bg-nexus-900 border-nexus-500 text-nexus-800 dark:text-nexus-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}
                                        >
                                            {page === 'latest' ? 'Latest News' : page}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Sub-Selection Logic */}
                            <div className="animate-fadeIn">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">2. Configuration ({targetPage})</h3>

                                {targetPage === 'podcasts' && renderPodcastOptions()}
                                {targetPage === 'newsletters' && renderNewsletterOptions()}

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
                                    {/* DYNAMIC FORM FIELDS */}

                                    {/* CASE: ADDING A RESOURCE (RSS/CHANNEL/ETC) */}
                                    {((targetPage === 'latest' || targetPage === 'startup' || targetPage === 'events') ||
                                        (targetPage === 'podcasts' && subMode !== 'single') ||
                                        (targetPage === 'newsletters' && subMode === 'rss')) && (
                                            <>
                                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex gap-3 text-green-800 dark:text-green-200 mb-4">
                                                    <Zap className="w-5 h-5 flex-shrink-0" />
                                                    <p className="text-sm">
                                                        You are adding a <strong>Live Data Source</strong> for {targetPage}.
                                                        {subMode === 'channel' && " YouTube Channels will be converted to RSS automatically."}
                                                        {subMode === 'playlist' && " YouTube Playlists will be converted to RSS automatically."}
                                                        <br />This will automatically fetch new content from this source daily.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Source Name (e.g. "TechCrunch" or "MKBHD")
                                                    </label>
                                                    <input name="title" value={formData.title} onChange={handleInputChange} required className={inputClass} placeholder="Name of source..." />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        {subMode === 'channel' ? 'YouTube Channel URL (e.g. /channel/UC...)' :
                                                            subMode === 'playlist' ? 'YouTube Playlist URL' :
                                                                'RSS Feed URL'}
                                                    </label>
                                                    <input name="url" type="url" value={formData.url} onChange={handleInputChange} required className={inputClass} placeholder="https://..." />
                                                </div>

                                                {(targetPage === 'podcasts' && subMode === 'channel') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                            Channel Logo / Image URL
                                                        </label>
                                                        <input name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} className={inputClass} placeholder="https://..." />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                    {/* CASE: SINGLE MANUAL ENTRY (Podcast Single, Newspaper Link) */}
                                    {(targetPage === 'podcasts' && subMode === 'single') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Podcast Title</label>
                                                <input name="title" value={formData.title} onChange={handleInputChange} required className={inputClass} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input name="youtubeUrl" placeholder="YouTube URL" value={formData.youtubeUrl} onChange={handleInputChange} className={inputClass} />
                                                <input name="spotifyUrl" placeholder="Spotify URL" value={formData.spotifyUrl} onChange={handleInputChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                                                <input name="duration" placeholder="e.g. 45 min" value={formData.duration} onChange={handleInputChange} className={inputClass} />
                                            </div>
                                        </>
                                    )}

                                    {(targetPage === 'newsletters' && subMode === 'newspaper') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Newspaper/Newsletter Name</label>
                                                <input name="title" value={formData.title} onChange={handleInputChange} required className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Link</label>
                                                <input name="url" type="url" value={formData.url} onChange={handleInputChange} required className={inputClass} placeholder="https://..." />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
                                                <select name="frequency" value={formData.frequency} onChange={handleInputChange} className={inputClass}>
                                                    <option value="Daily">Daily</option>
                                                    <option value="Weekly">Weekly</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                </div>

                                <button type="submit" className="w-full mt-6 py-4 bg-nexus-600 text-white rounded-xl hover:bg-nexus-700 font-bold flex items-center justify-center gap-2 shadow-lg">
                                    <PlusCircle className="w-5 h-5" />
                                    {((targetPage === 'latest' || targetPage === 'startup') || (targetPage === 'podcasts' && subMode !== 'single')) ? 'Add Source' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* MANAGE TAB */}
                {activeTab === 'manage' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* 1. Manage GLOBAL Sources (RSS/Channels) */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-nexus-100 dark:border-nexus-900">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-nexus-700 dark:text-nexus-300">
                                <Database className="w-5 h-5" /> Global Data Sources
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                These sources (RSS Feeds, YouTube Channels) automatically populate your "Latest", "Startups", and "Podcasts" pages every hour.
                            </p>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                {resources.map((res: any) => (
                                    <div key={res.id} className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400 overflow-hidden">
                                                {res.imageUrl ? <img src={res.imageUrl} alt={res.name} className="w-full h-full object-cover" /> : res.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                    {res.name}
                                                    <span className="text-[10px] uppercase bg-nexus-100 dark:bg-nexus-900 text-nexus-600 px-2 py-0.5 rounded-full">{res.type}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 truncate max-w-[300px]">{res.rssUrl || res.url}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete source: ${res.name}?`)) deleteItem(res.id, 'resources');
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                                            title="Delete Source"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                                {resources.length === 0 && <div className="p-8 text-center text-slate-500">No sources added yet.</div>}
                            </div>
                        </div>

                        {/* 2. Manage Individual Category Items */}
                        <div className="grid grid-cols-1 gap-6">
                            <h2 className="text-xl font-bold mt-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <LayoutDashboard className="w-5 h-5" /> Manage Page Content
                            </h2>

                            {[
                                { title: 'Startups & News Items', data: startupNews, cat: 'startup' },
                                { title: 'Podcasts (Episodes)', data: podcasts, cat: 'podcasts' },
                                { title: 'Newsletters', data: newsletters, cat: 'newsletters' }
                            ].map((section) => (
                                <div key={section.cat} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200">{section.title}</h3>
                                        <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full">{section.data.length} Items</span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {section.data.map((item: any) => (
                                            <div key={item.id} className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <div className="flex-1 mr-4">
                                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.title || item.name}</div>
                                                    <div className="text-xs text-slate-400 capitalize">{item.source || 'Manual Entry'} • {item.date || 'No Date'}</div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete item: ${item.title || item.name}?`)) deleteItem(item.id, section.cat);
                                                    }}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {section.data.length === 0 && <div className="p-4 text-center text-xs text-slate-400">No items found.</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
