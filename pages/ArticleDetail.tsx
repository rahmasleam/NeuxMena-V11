
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft, ExternalLink, Bookmark, Bot, Globe, Calendar, User, Maximize2, Minimize2, BookOpen, Loader2, Volume2, StopCircle, Languages, Quote } from 'lucide-react';
import { generateSummary, translateText, getArticleContent, generateSpeech } from '../services/geminiService';
import AIChat from '../components/AIChat';

const ArticleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getItemById, language, favorites, toggleFavorite } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();
    const [item, setItem] = useState<any | null>(null);
    const [aiContent, setAiContent] = useState<string>('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedTitle, setTranslatedTitle] = useState('');
    const [translatedDesc, setTranslatedDesc] = useState('');
    
    // AI Summary State
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [translatedSummary, setTranslatedSummary] = useState<string>('');
    const [showTranslatedSummary, setShowTranslatedSummary] = useState(false);
    
    // Reader Mode State
    const [isReaderMode, setIsReaderMode] = useState(false);
    const [articleText, setArticleText] = useState<string>('');
    const [isLoadingText, setIsLoadingText] = useState(false);
    
    // Full Article Translation
    const [isTranslatingArticle, setIsTranslatingArticle] = useState(false);
    const [translatedArticleText, setTranslatedArticleText] = useState<string>('');
    const [showTranslatedArticle, setShowTranslatedArticle] = useState(false);

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    useEffect(() => {
        if (id) {
            const found = getItemById(id);
            if (found) {
                setItem(found);
                // Auto-generate summary when article loads
                generateArticleSummary(found);
            } else {
                navigate('/'); 
            }
        }
        return () => stopAudio();
    }, [id, getItemById, navigate]);

    // AUTO TRANSLATE for Arabic Users
    useEffect(() => {
        if (language === 'ar' && item && !translatedTitle && !isTranslating) {
            handleTranslate();
        }
    }, [language, item]);

    const generateArticleSummary = async (articleItem: any) => {
        setIsGeneratingSummary(true);
        const prompt = `Provide a concise, professional summary (3-5 key points) for this article. Use markdown bullets: "${articleItem.title}. ${articleItem.description}"`;
        const summary = await generateSummary(prompt, language);
        setAiSummary(summary);
        setIsGeneratingSummary(false);
    };

    const handleGenerateInsight = async () => {
        if (!item) return;
        setAiContent('Analyzing content and generating business insights...');
        const prompt = `Analyze this news for a business investor or entrepreneur: "${item.title}. ${item.description}". Provide 3 key takeaways and 1 actionable insight.`;
        const summary = await generateSummary(prompt, language);
        setAiContent(summary);
    };

    const handleTranslateSummary = async () => {
        if (!aiSummary) return;
        
        if (showTranslatedSummary) {
            setShowTranslatedSummary(false);
            return;
        }

        if (translatedSummary) {
            setShowTranslatedSummary(true);
            return;
        }

        const translated = await translateText(aiSummary, language === 'en' ? 'ar' : 'en');
        setTranslatedSummary(translated);
        setShowTranslatedSummary(true);
    };

    const handleTranslate = async () => {
        if (!item) return;
        if (translatedTitle) {
            setTranslatedTitle('');
            setTranslatedDesc('');
            return;
        }
        setIsTranslating(true);
        const targetLang = language === 'en' ? 'ar' : 'en';
        const tTitle = await translateText(item.title, targetLang);
        const tDesc = await translateText(item.description, targetLang);
        setTranslatedTitle(tTitle);
        setTranslatedDesc(tDesc);
        setIsTranslating(false);
    };

    const handleToggleReaderMode = async () => {
        if (isReaderMode) {
            setIsReaderMode(false);
            stopAudio();
            return;
        }
        
        setIsReaderMode(true);
        if (!articleText && item) {
            setIsLoadingText(true);
            const content = await getArticleContent(item.url || item.website || item.registrationLink);
            setArticleText(content);
            setIsLoadingText(false);
        }
    };
    
    const handleTranslateArticle = async () => {
        if (!articleText) return;
        
        if (showTranslatedArticle) {
            setShowTranslatedArticle(false);
            return;
        }

        if (translatedArticleText) {
            setShowTranslatedArticle(true);
            return;
        }

        setIsTranslatingArticle(true);
        const translated = await translateText(articleText, 'ar');
        setTranslatedArticleText(translated);
        setShowTranslatedArticle(true);
        setIsTranslatingArticle(false);
    };

    const playAudio = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        const textSource = showTranslatedArticle ? translatedArticleText : articleText;
        if (!textSource) return;
        
        setIsPlaying(true);
        const textToRead = textSource.substring(0, 800) + "..."; 
        const base64Audio = await generateSpeech(textToRead);

        if (base64Audio) {
            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                setAudioContext(ctx);
                
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const dataInt16 = new Int16Array(bytes.buffer);
                const frameCount = dataInt16.length;
                const buffer = ctx.createBuffer(1, frameCount, 24000); 
                const channelData = buffer.getChannelData(0);
                for (let i = 0; i < frameCount; i++) {
                    channelData[i] = dataInt16[i] / 32768.0;
                }

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => setIsPlaying(false);
                source.start();
            } catch (e) {
                console.error(e);
                setIsPlaying(false);
            }
        } else {
            setIsPlaying(false);
            alert("Could not generate audio.");
        }
    };

    const stopAudio = () => {
        if (audioContext) {
            audioContext.close();
            setAudioContext(null);
        }
        setIsPlaying(false);
    };

    if (!item) return <div className="p-10 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Loading article...</div>;

    const displayTitle = translatedTitle ? translatedTitle : ((language === 'ar' && item.titleAr) ? item.titleAr : item.title);
    const displayDesc = translatedDesc ? translatedDesc : ((language === 'ar' && item.descriptionAr) ? item.descriptionAr : item.description);

    let sourceLink = '#';
    if (item.url && (item.url.startsWith('http') || item.url.startsWith('https'))) {
        sourceLink = item.url;
    } else if (item.website) {
        sourceLink = item.website;
    } else if (item.registrationLink) {
        sourceLink = item.registrationLink;
    }

    const displaySource = item.source || item.name || 'Source';
    const textToDisplay = showTranslatedArticle ? translatedArticleText : articleText;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-20">
            {/* Nav */}
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-slate-500 hover:text-nexus-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex gap-2">
                     <button 
                        onClick={() => toggleFavorite(item.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${favorites.includes(item.id) ? 'bg-nexus-50 border-nexus-200 text-nexus-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                     >
                        <Bookmark className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                        {favorites.includes(item.id) ? 'Saved' : 'Save'}
                     </button>
                     <button 
                        onClick={handleToggleReaderMode}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isReaderMode ? 'bg-nexus-600 text-white border-nexus-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                     >
                        {isReaderMode ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                        {isReaderMode ? 'Close Reader' : 'Full Reader Mode'}
                     </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content Area */}
                <div className="flex-1">
                    {isReaderMode ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[90vh] flex flex-col fixed inset-0 z-50 m-4 lg:m-8">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center sticky top-0 z-10">
                                <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-nexus-600"/>
                                    Reading: {displayTitle.substring(0, 40)}...
                                </h2>
                                <div className="flex items-center gap-3">
                                     {articleText && !isLoadingText && (
                                        <>
                                            <button 
                                                onClick={handleTranslateArticle}
                                                disabled={isTranslatingArticle}
                                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${showTranslatedArticle ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                            >
                                                <Languages className="w-4 h-4" />
                                                {isTranslatingArticle ? 'Translating...' : showTranslatedArticle ? 'Original' : 'Translate Article'}
                                            </button>
                                            <button 
                                                onClick={playAudio}
                                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-nexus-100 text-nexus-600 hover:bg-nexus-200'}`}
                                            >
                                                {isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                                {isPlaying ? 'Stop' : 'Listen'}
                                            </button>
                                        </>
                                    )}
                                     <button onClick={handleToggleReaderMode} className="p-1 hover:bg-slate-200 rounded-full"><Minimize2 className="w-5 h-5"/></button>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50 dark:bg-slate-900" dir={showTranslatedArticle ? 'rtl' : 'ltr'}>
                                {isLoadingText ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                                        <Loader2 className="w-12 h-12 text-nexus-600 animate-spin" />
                                        <p className="text-slate-500 font-medium">Extracting clean article content...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-3xl mx-auto font-serif leading-loose">
                                        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white leading-tight">{displayTitle}</h1>
                                        {textToDisplay.split('\n').map((line, i) => {
                                            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>;
                                            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                                            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-5 mb-2">{line.replace('### ', '')}</h3>;
                                            if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-2">{line.replace('- ', '')}</li>;
                                            if (!line.trim()) return <br key={i}/>;
                                            return <p key={i} className="mb-6 text-slate-800 dark:text-slate-200">{line}</p>;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* AI Summary Section - Enhanced Visuals */}
                            {!isReaderMode && aiSummary && (
                                <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border-l-4 border-indigo-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                                    <Quote className="absolute top-4 right-4 w-12 h-12 text-indigo-50 dark:text-slate-700 -rotate-12" />
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                            <Bot className="w-5 h-5" /> {t.common.summary}
                                        </h3>
                                        <div className="flex gap-2">
                                            {aiSummary && (
                                                <button 
                                                    onClick={handleTranslateSummary}
                                                    className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    {showTranslatedSummary ? 'Show Original' : t.common.translate}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {isGeneratingSummary ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                            <span className="ml-2 text-slate-500 text-sm">Generating intelligent summary...</span>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none relative z-10" dir={showTranslatedSummary ? 'rtl' : 'ltr'}>
                                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                                                {showTranslatedSummary ? translatedSummary : aiSummary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
                            <div className="relative h-64 md:h-80 w-full group">
                                <img src={item.imageUrl || item.logo || 'https://picsum.photos/800/400'} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-nexus-600 text-white text-xs px-2 py-1 rounded font-bold uppercase">{item.category || item.type || 'News'}</span>
                                        {item.region && <span className="bg-white/20 text-white backdrop-blur-sm text-xs px-2 py-1 rounded">{item.region}</span>}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 shadow-sm">
                                        {displayTitle}
                                    </h1>
                                    <div className="flex items-center gap-4 text-slate-300 text-sm">
                                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {displaySource}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {item.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                     <button 
                                        onClick={handleTranslate}
                                        disabled={isTranslating}
                                        className="text-sm text-nexus-600 hover:underline flex items-center gap-1"
                                     >
                                        <Globe className="w-4 h-4" />
                                        {isTranslating ? 'Translating...' : (translatedTitle ? 'Show Original' : 'Translate Details')}
                                     </button>
                                </div>

                                <div className="prose prose-sm md:prose-lg dark:prose-invert max-w-none mb-8">
                                    <p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                                        {displayDesc}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm italic border-l-4 border-slate-300 pl-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-r-lg">
                                       Click "Full Reader Mode" to copy/extract the full content within the app.
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={handleToggleReaderMode}
                                    className="w-full py-4 bg-nexus-600 hover:bg-nexus-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 transform hover:-translate-y-1"
                                >
                                    <BookOpen className="w-5 h-5" /> Full Reader Mode
                                </button>
                            </div>
                        </div>
                        </>
                    )}
                </div>

                {/* Sidebar / AI Tools */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                         <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-nexus-600" /> AI Insights
                        </h3>
                        {aiContent ? (
                            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-nexus-50 dark:bg-nexus-900/20 p-3 rounded-lg border border-nexus-100 dark:border-nexus-800">
                                {aiContent}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500 mb-3">Get business takeaways for this content.</p>
                                <button 
                                    onClick={handleGenerateInsight}
                                    className="w-full py-2 bg-nexus-50 dark:bg-slate-700 border border-nexus-200 dark:border-slate-600 rounded-lg text-nexus-700 dark:text-nexus-300 font-medium text-sm hover:bg-nexus-100 transition-colors"
                                >
                                    Generate Analysis
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase text-slate-500">Source Info</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-400">Publisher</div>
                                <div className="font-medium">{displaySource}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Original Link</div>
                                <a href={sourceLink} target="_blank" rel="noreferrer" className="text-sm text-nexus-600 hover:underline break-all block">
                                    {sourceLink}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Rights Footer (Global) */}
            {!isReaderMode && (
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 text-center">
                     <p className="text-sm text-slate-500">
                        Content rights belong to <span className="font-bold text-slate-700 dark:text-slate-300">{displaySource}</span>. 
                        <a href={sourceLink} target="_blank" rel="noreferrer" className="ml-1 text-nexus-600 hover:underline">
                            View Original Source
                        </a>
                     </p>
                </div>
            )}

            <AIChat contextData={`Reading Article: ${item.title}. Source: ${displaySource}.`} />
        </div>
    );
};

export default ArticleDetail;
