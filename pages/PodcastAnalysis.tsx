import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Sparkles, Save, FileText, ArrowLeft, BrainCircuit, Globe } from 'lucide-react';
import { analyzePodcast, translateText } from '../services/geminiService';
import AIChat from '../components/AIChat';
import { useNavigate } from 'react-router-dom';
import { PodcastAnalysis } from '../types';

const PodcastAnalysisPage: React.FC = () => {
    const { user, saveAnalysis } = useApp();
    const navigate = useNavigate();

    // Deep Analysis State
    const [analysisUrl, setAnalysisUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Structured Result State
    const [analysisData, setAnalysisData] = useState<Omit<PodcastAnalysis, 'id' | 'date' | 'url'> | null>(null);

    // Translation State
    const [isTranslating, setIsTranslating] = useState(false);
    const [isArabic, setIsArabic] = useState(false);

    const handleDeepAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!analysisUrl) return;
        setIsAnalyzing(true);
        setAnalysisData(null);
        setIsArabic(false); // Reset translation on new analysis
        
        const result = await analyzePodcast(analysisUrl);
        
        if (result) {
            setAnalysisData({
                podcastName: result.podcastName || "Unknown Podcast",
                episodeTitle: result.episodeTitle || "Episode Analysis",
                score: result.score || 0,
                summary: result.summary,
                metrics: result.metrics,
                recommendation: result.recommendation,
                reportContent: "Structured Analysis Generated" 
            });
        } else {
            alert("Analysis failed. Please check the link and try again.");
        }
        setIsAnalyzing(false);
    };

    const handleTranslate = async () => {
        if (!analysisData || isTranslating) return;
        
        // Toggle back to English if already Arabic (would require storing original state, for now simple 1-way to Arabic)
        if (isArabic) return; 

        setIsTranslating(true);
        
        // Translate Fields
        const tSummary = await translateText(analysisData.summary || '', 'ar');
        const tRecommendation = await translateText(analysisData.recommendation || '', 'ar');
        
        const tMetrics = await Promise.all((analysisData.metrics || []).map(async (m) => ({
            name: await translateText(m.name, 'ar'),
            finding: await translateText(m.finding, 'ar')
        })));

        setAnalysisData(prev => prev ? ({
            ...prev,
            summary: tSummary,
            recommendation: tRecommendation,
            metrics: tMetrics
        }) : null);

        setIsArabic(true);
        setIsTranslating(false);
    };

    const handleSaveAnalysis = () => {
        if (!user) {
            navigate('/auth', { state: { from: '/podcast-analysis' } });
            return;
        }
        if (!analysisData) return;

        saveAnalysis({
            id: Date.now().toString(),
            url: analysisUrl,
            podcastName: analysisData.podcastName,
            episodeTitle: analysisData.episodeTitle,
            score: analysisData.score,
            summary: analysisData.summary,
            metrics: analysisData.metrics,
            recommendation: analysisData.recommendation,
            reportContent: analysisData.reportContent,
            date: new Date().toISOString().split('T')[0]
        });
        alert('Analysis saved to your account!');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fadeIn">
            {/* ... Header ... */}
            <div className="flex flex-col gap-4">
                 <button 
                    onClick={() => navigate('/podcasts')} 
                    className="flex items-center gap-2 text-slate-500 hover:text-nexus-600 transition-colors w-fit text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Podcasts
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Podcast Analysis
                    </h1>
                </div>
            </div>

            {/* Main Tool Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-4 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400 hidden md:block shadow-inner">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <div className="flex-1 w-full">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Comprehensive Analysis</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-none bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-indigo-50 dark:border-indigo-900/50">
                            <p className="mb-2 leading-relaxed">
                                This Prompt aims to analyze the Podcast from many angles, such as scientific content, criticisms, clarity of information, the speaker's experience and other things, and then it puts your needs in a table with your hands as a score after summarizing that it's important to listen to it, or Not.
                            </p>
                            <p className="leading-relaxed">
                                You can analyze the Podcasts which you want to listen to, and this will allow you to finish the big content and learn the important thing from it.
                            </p>
                        </div>

                        {/* ... Form ... */}
                        <form onSubmit={handleDeepAnalysis} className="flex flex-col gap-4 mb-6">
                            <input 
                                type="url" 
                                placeholder="Paste Podcast or YouTube Link here..." 
                                value={analysisUrl}
                                onChange={(e) => setAnalysisUrl(e.target.value)}
                                className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white text-base md:text-lg shadow-sm"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={isAnalyzing}
                                className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-indigo-500/30 transition-all self-end"
                            >
                                {isAnalyzing ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : <Bot className="w-6 h-6" />}
                                Analyze
                            </button>
                        </form>

                        {/* Analysis Report */}
                        {analysisData && (
                            <div className="mt-8 animate-fadeIn" dir={isArabic ? 'rtl' : 'ltr'}>
                                <div id="full-report" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-8 shadow-lg">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                                         <h4 className="font-bold text-lg flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                            <FileText className="w-5 h-5" /> Analysis Report
                                        </h4>
                                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                            <div className="text-right">
                                                <div className="text-xs text-slate-500 uppercase font-bold">Overall Score</div>
                                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{analysisData.score}/10</div>
                                            </div>
                                            <button 
                                                onClick={handleTranslate}
                                                disabled={isTranslating || isArabic}
                                                className="text-sm bg-nexus-600 text-white px-4 py-2 rounded-lg hover:bg-nexus-700 transition-colors flex items-center gap-2 font-bold shadow-sm"
                                            >
                                                <Globe className="w-4 h-4" />
                                                {isTranslating ? 'Translating...' : isArabic ? 'Translated to Arabic' : 'Translate to Arabic'}
                                            </button>

                                            <button onClick={handleSaveAnalysis} className="text-sm bg-nexus-600 text-white px-4 py-2 rounded-lg hover:bg-nexus-700 transition-colors flex items-center gap-2 font-bold shadow-sm">
                                        
                                                <Save className="w-4 h-4" /> Save
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Summary */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Executive Summary</h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border-l-4 border-indigo-500">
                                            {analysisData.summary}
                                        </p>
                                    </div>

                                    {/* Metrics Responsive Table */}
                                    {analysisData.metrics && (
                                        <div className="mb-8 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            {/* Desktop Table View */}
                                            <table className="hidden md:table w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        <th className="p-4 border-b border-slate-200 dark:border-slate-700 w-1/3">Metric</th>
                                                        <th className="p-4 border-b border-slate-200 dark:border-slate-700">Findings & Assessment</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analysisData.metrics.map((metric, index) => (
                                                        <tr key={index} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800/50">
                                                            <td className="p-4 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                                                                {metric.name}
                                                            </td>
                                                            <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                                                {metric.finding}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Mobile Card View */}
                                            <div className="md:hidden flex flex-col divide-y divide-slate-200 dark:divide-slate-700">
                                                {analysisData.metrics.map((metric, index) => (
                                                    <div key={index} className="p-4 bg-white dark:bg-slate-900">
                                                        <div className="font-bold text-nexus-600 dark:text-nexus-400 mb-2">{metric.name}</div>
                                                        <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                                            {metric.finding}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                            <BrainCircuit className="w-5 h-5 text-indigo-500" /> Final Recommendation
                                        </h3>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                            {analysisData.recommendation}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AIChat contextData="Page: Podcast Analyzer." />
        </div>
    );
};

export default PodcastAnalysisPage;