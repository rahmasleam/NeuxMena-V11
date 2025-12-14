
import React, { useState } from 'react';
import { ExternalLink, Bookmark, Globe, Bot, Quote } from 'lucide-react';
import { FeedItem } from '../types';
import { useApp } from '../context/AppContext';
import { generateSummary, translateText } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';

interface NewsCardProps {
  item: FeedItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const { language, favorites, toggleFavorite } = useApp();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const t = TRANSLATIONS[language];
  const isSaved = favorites.includes(item.id);
  const navigate = useNavigate();

  const handleSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSummarizing(true);
    const result = await generateSummary(`${item.title}\n${item.description}`, language);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedTitle) {
      setTranslatedTitle(null);
      setTranslatedDesc(null);
      setTranslatedSummary(null);
      return;
    }
    const targetLang = language === 'en' ? 'ar' : 'en';

    // Parallel translation
    const [tTitle, tDesc] = await Promise.all([
      translateText(item.title, targetLang),
      translateText(item.description, targetLang)
    ]);

    setTranslatedTitle(tTitle);
    setTranslatedDesc(tDesc);

    if (summary) {
      const tSummary = await translateText(summary, targetLang);
      setTranslatedSummary(tSummary);
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  }

  const handleReadClick = () => {
    navigate(`/article/${item.id}`);
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      onClick={handleReadClick}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img src={item.imageUrl || (item as any).logo} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
        <span className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm uppercase font-bold tracking-wide`}>
          {(item as any).category || (item as any).type || (item as any).topic || (item as any).frequency || 'News'}
        </span>
        {item.region === 'Egypt' && (
          <span className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} px-2 py-1 bg-egypt-red text-white text-xs font-bold rounded-md shadow-sm`}>
            EGYPT
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold text-nexus-600 dark:text-nexus-400 uppercase tracking-wider bg-nexus-50 dark:bg-nexus-900/30 px-2 py-0.5 rounded">{item.source}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{item.date}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-nexus-600 dark:group-hover:text-nexus-400 transition-colors">
          {language === 'ar' && translatedTitle ? translatedTitle : (language === 'ar' && item.titleAr ? item.titleAr : item.title)}
        </h3>

        <div className="prose prose-sm dark:prose-invert max-w-none flex-1 mb-4">
            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 font-medium">
            {translatedDesc || item.description}
            </p>
        </div>

        {summary && (
          <div className="mb-4 p-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-indigo-900/20 rounded-xl text-sm text-slate-800 dark:text-slate-200 border border-indigo-100 dark:border-slate-600 shadow-inner relative overflow-hidden">
            <Quote className="absolute top-2 right-2 w-8 h-8 text-indigo-200 dark:text-slate-600 opacity-20 -rotate-12" />
            <div className="flex items-center gap-2 mb-2 font-bold text-indigo-700 dark:text-indigo-300">
              <Bot className="w-4 h-4" /> {t.common.aiSummary}
            </div>
            <p className="whitespace-pre-line leading-relaxed font-serif text-[15px] opacity-90 relative z-10">{translatedSummary || summary}</p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={handleFavorite} className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isSaved ? 'text-nexus-600 dark:text-nexus-400 fill-current' : 'text-slate-400 dark:text-slate-500'}`}>
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleSummary}
              disabled={isSummarizing}
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors ${summary ? 'text-nexus-600 dark:text-nexus-400' : 'text-slate-400 dark:text-slate-500 hover:text-nexus-600'}`}
              title={t.common.aiSummary}
            >
              {isSummarizing ? <span className="animate-spin block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"></span> : <Bot className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleExternalLink}
            className="inline-flex items-center gap-1 text-sm font-medium text-nexus-600 dark:text-nexus-400 hover:text-nexus-700 dark:hover:text-nexus-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-nexus-50 dark:hover:bg-nexus-900/20"
          >
            {t.common.readMore}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
