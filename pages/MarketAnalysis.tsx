

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { MarketMetric } from '../types';
import { analyzeMarketData, fetchRealMarketData } from '../services/geminiService';
import { TrendingUp, TrendingDown, BrainCircuit, Activity, DollarSign, Bitcoin, Newspaper, ArrowRight, RefreshCw } from 'lucide-react';
import AIChat from '../components/AIChat';

const MarketAnalysis: React.FC = () => {
    const { language, marketIndices: initialIndices, theme, latestNews } = useApp();
    const t = TRANSLATIONS[language];
    const today = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const [insight, setInsight] = useState<string>("Initializing market data stream and generating AI analysis...");
    const [activeTab, setActiveTab] = useState<'Indices' | 'Crypto' | 'Currency'>('Indices');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Filter news for market/economy
    const marketNews = latestNews.filter(n => {
        if ('category' in n) {
             return n.category === 'Economy' || ('sector' in n && n.sector === 'Fintech');
        }
        return false;
    });

    // State
    const [indices, setIndices] = useState(initialIndices);
    const [crypto, setCrypto] = useState<MarketMetric[]>([
        { name: 'Bitcoin', value: 64200.00, change: -1.5, trend: 'down', currency: 'USD', type: 'Crypto' },
        { name: 'Ethereum', value: 3200.50, change: 0.5, trend: 'up', currency: 'USD', type: 'Crypto' },
        { name: 'Solana', value: 145.20, change: 2.1, trend: 'up', currency: 'USD', type: 'Crypto' }
    ]);
    const [currency, setCurrency] = useState<MarketMetric[]>([
        { name: 'USD/EGP', value: 47.85, change: -0.1, trend: 'neutral', currency: 'EGP', type: 'Currency' },
        { name: 'EUR/EGP', value: 51.20, change: 0.2, trend: 'up', currency: 'EGP', type: 'Currency' },
        { name: 'Gold (21k)', value: 3150, change: 0.0, trend: 'neutral', currency: 'EGP', type: 'Currency' }
    ]);

    // Data Load & Analysis Effect
    useEffect(() => {
        const loadAndAnalyze = async () => {
            setIsRefreshing(true);
            const realData = await fetchRealMarketData();
            
            // Update Data States if real data found
            if (realData) {
                if (realData.egpRate) {
                    setCurrency(prev => [
                        { ...prev[0], value: realData.egpRate.value, change: realData.egpRate.change, trend: realData.egpRate.trend as any },
                        prev[1], 
                        { ...prev[2], value: realData.goldEg?.value || prev[2].value, trend: realData.goldEg?.trend || 'neutral' as any, name: 'Gold (21k)' }
                    ]);
                }
                if (realData.nasdaq) {
                    setIndices(prev => [
                        prev[0], 
                        { ...prev[1], value: realData.nasdaq.value, change: realData.nasdaq.change, trend: realData.nasdaq.trend as any }
                    ]);
                }
                if (realData.btc) {
                    setCrypto(prev => [
                        { ...prev[0], value: realData.btc.value, change: realData.btc.change, trend: realData.btc.trend as any },
                        { ...prev[1], value: realData.eth?.value || prev[1].value },
                        prev[2]
                    ]);
                }
                setLastUpdated(new Date().toLocaleTimeString());
            }

            // Generate Insight based on current language
            const contextData = JSON.stringify({
                egp: currency[0].value,
                gold: currency[2].value,
                btc: crypto[0].value,
                nasdaq: indices[1].value
            });

            const prompt = language === 'ar' 
                ? `قم بتحليل بيانات السوق هذه (مصر والعالم) وقدم رؤية موجزة في جملتين باللغة العربية: ${contextData}`
                : `Analyze this market data (Egypt & Global) and give 2 sentences of insight in English: ${contextData}`;

            const aiAnalysis = await analyzeMarketData(prompt);
            setInsight(aiAnalysis);
            
            setIsRefreshing(false);
        };

        loadAndAnalyze();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]); // Re-run when language changes

    // Live Jitter Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const randomize = (data: MarketMetric[]) => data.map(item => ({
                ...item,
                value: item.value * (1 + (Math.random() * 0.001 - 0.0005)), 
            }));
            setIndices(randomize);
            setCrypto(randomize);
            setCurrency(randomize);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getCurrentData = () => {
        if (activeTab === 'Indices') return indices;
        if (activeTab === 'Crypto') return crypto;
        return currency;
    }

    const renderTabButton = (tab: 'Indices' | 'Crypto' | 'Currency', icon: React.ReactNode) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors border-b-2 ${activeTab === tab
                ? 'border-nexus-600 text-nexus-600 dark:text-nexus-400 bg-nexus-50 dark:bg-nexus-900/30'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
        >
            {icon}
            {tab}
        </button>
    );

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                    {t.sections.marketTitle}
                </h1>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full animate-pulse border border-green-100 dark:border-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Live Data Stream Active
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRefreshing(prev => !prev)} 
                        disabled={isRefreshing}
                        className={`p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-nexus-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isRefreshing ? 'animate-spin text-nexus-600' : ''}`}
                        title="Refresh Market Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="text-right">
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full mb-1">
                            {today}
                        </div>
                        {lastUpdated && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 pr-1">
                                Updated: {lastUpdated}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Insight Box */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-xl shadow-lg relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-nexus-400 mb-2">
                        <BrainCircuit className="w-5 h-5" />
                        {t.common.marketInsights}
                    </h3>
                    <p className="text-lg leading-relaxed font-light italic opacity-90" dir={language === 'ar' ? 'rtl' : 'ltr'}>"{insight}"</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart & Tabs - Takes 2/3 */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row transition-colors">
                        <div className="flex md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex-row md:flex-col overflow-x-auto md:overflow-visible">
                            {renderTabButton('Indices', <Activity className="w-4 h-4" />)}
                            {renderTabButton('Crypto', <Bitcoin className="w-4 h-4" />)}
                            {renderTabButton('Currency', <DollarSign className="w-4 h-4" />)}
                        </div>

                        <div className="flex-1 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-slate-800 dark:text-white">{activeTab} Overview</h3>
                            </div>
                            <div className="space-y-4">
                                {getCurrentData().map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.trend === 'up' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                                                {item.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.currency}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            <p className={`text-sm font-medium flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-96 transition-colors flex flex-col">
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-4">Volume Analysis</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getCurrentData()}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                            borderRadius: '8px',
                                            border: theme === 'dark' ? '1px solid #334155' : 'none',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Market News Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Newspaper className="w-5 h-5 text-nexus-600" />
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Latest Headlines</h3>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {marketNews.length > 0 ? (
                                <>
                                    {marketNews.slice(0, 4).map(item => (
                                        <div key={item.id} className="group cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
                                            <div className="flex gap-3">
                                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 group-hover:text-nexus-600 transition-colors">{item.title}</h4>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{item.source}</span>
                                                        <span>• {item.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full mt-2 py-2 text-sm text-nexus-600 dark:text-nexus-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1">
                                        View All News <ArrowRight className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-6 text-slate-500">
                                    No recent economy news.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AIChat contextData={`Page: Market Analysis. Viewing ${activeTab}.`} />
        </div>
    );
};

export default MarketAnalysis;