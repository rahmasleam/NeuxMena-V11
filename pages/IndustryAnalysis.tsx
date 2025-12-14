
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart } from 'recharts';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import AIChat from '../components/AIChat';
import { TrendingUp, DollarSign, Building, Cpu, Globe, BrainCircuit, Layers, Target, Shield, Users, AlertTriangle, Zap, Search, ExternalLink, RefreshCw, BarChart2, CheckCircle, MinusCircle } from 'lucide-react';
import { analyzeMarketData } from '../services/geminiService';

const IndustryAnalysis: React.FC = () => {
    const { language, theme, industryData } = useApp();
    const t = TRANSLATIONS[language];
    const [activeSectorName, setActiveSectorName] = useState('Fintech');
    const [aiInsight, setAiInsight] = useState('Analyzing sector data...');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { sectors, marketSizing, growthForecast, competitors } = industryData;

    // Find active sector object
    const activeSector = sectors.find(s => s.name.includes(activeSectorName)) || sectors[0];

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!activeSector) return;
            setAiInsight(language === 'ar' ? 'جاري تحليل البيانات...' : 'Analyzing sector data...');
            
            const prompt = language === 'ar'
                ? `قدم ملخصًا تنفيذيًا لقطاع ${activeSector.name} في منطقة الشرق الأوسط وشمال إفريقيا باللغة العربية. النمو: ${activeSector.growth}%، الاستثمار: $${activeSector.investment} مليون.`
                : `Provide executive summary for ${activeSector.name} in MENA in English. Growth: ${activeSector.growth}%. Inv: $${activeSector.investment}M.`;

            const result = await analyzeMarketData(prompt);
            setAiInsight(result);
        };
        fetchAnalysis();
    }, [activeSectorName, activeSector, language]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    }

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                        {t.nav.industry}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Strategic Market Intelligence.</p>
                </div>
                <div className="flex items-center gap-3">
                     <button 
                        onClick={handleRefresh}
                        className="p-2 text-slate-500 hover:text-nexus-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                        {sectors.map(s => (
                            <button
                                key={s.name}
                                onClick={() => setActiveSectorName(s.name.split(' ')[0])}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    activeSectorName === s.name.split(' ')[0]
                                    ? 'bg-nexus-600 text-white shadow-sm' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {s.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Insight Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit className="w-32 h-32" /></div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-nexus-400 mb-2 z-10 relative">
                    <BrainCircuit className="w-5 h-5" /> Executive Summary: {activeSector?.name}
                </h3>
                <p className="text-lg font-light leading-relaxed opacity-90 z-10 relative italic" dir={language === 'ar' ? 'rtl' : 'ltr'}>"{aiInsight}"</p>
            </div>

            {/* SECTOR CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sectors.map((sector) => (
                    <div key={sector.name} className={`bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow ${activeSectorName === sector.name.split(' ')[0] ? 'border-nexus-500 bg-nexus-50 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">{sector.name}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Growth</span>
                                <span className="font-bold text-green-600">+{sector.growth}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Vol.</span>
                                <span className="font-bold text-slate-800 dark:text-white">${sector.investment}M</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Companies</span>
                                <span className="font-bold text-slate-800 dark:text-white">{sector.companies}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DYNAMIC SWOT & PESTLE for Active Sector */}
            {activeSector && activeSector.swot && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SWOT Analysis */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-6 h-6 text-nexus-600" />
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">SWOT Analysis: {activeSector.name}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
                                <h4 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Strengths</h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                                    {activeSector.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1"><MinusCircle className="w-3 h-3"/> Weaknesses</h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                                    {activeSector.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1"><Target className="w-3 h-3"/> Opportunities</h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                                    {activeSector.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/50">
                                <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Threats</h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                                    {activeSector.swot.threats.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* PESTLE Analysis */}
                    {activeSector.pestle && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Globe className="w-6 h-6 text-nexus-600" />
                                <h3 className="font-bold text-xl text-slate-800 dark:text-white">PESTLE Factors</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(activeSector.pestle).map(([key, value]) => (
                                    <div key={key} className="flex gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 flex-shrink-0 uppercase">
                                            {key.charAt(0)}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-sm text-slate-800 dark:text-white capitalize">{key}</h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* SECTOR PERFORMANCE MATRIX CHART */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sectors}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="investment" name="Investment ($M)" barSize={40} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="growth" name="Growth (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <AIChat contextData={`Page: Industry Analysis (${activeSector?.name}). Reviewing Market Assessment, Sizing, and Dynamics.`} />
        </div>
    );
};

export default IndustryAnalysis;
