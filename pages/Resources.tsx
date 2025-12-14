import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import AIChat from '../components/AIChat';
import { Link as LinkIcon, ExternalLink, PlusCircle, Globe, Search, Newspaper, Layout } from 'lucide-react';
import { ResourceItem } from '../types';

const Resources: React.FC = () => {
  const { language, resources, addResource, addItem } = useApp();
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'source' | 'article'>('source');
  
  // Resource Form State
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<ResourceItem['type']>('News');
  const [newDesc, setNewDesc] = useState('');

  // Article Form State
  const [articleTitle, setArticleTitle] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [articleSource, setArticleSource] = useState('');
  const [articleDesc, setArticleDesc] = useState('');

  const filteredResources = resources.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    const newItem: ResourceItem = {
        id: Date.now().toString(),
        name: newName,
        url: newUrl,
        type: newType,
        description: newDesc
    };

    addResource(newItem);
    setNewName('');
    setNewUrl('');
    setNewDesc('');
    alert(language === 'ar' ? "تم إضافة المصدر بنجاح" : "Source added successfully!");
  };

  const handleAddArticle = (e: React.FormEvent) => {
      e.preventDefault();
      if (!articleTitle || !articleUrl) return;

      const newItem = {
          title: articleTitle,
          url: articleUrl,
          source: articleSource || 'User Added',
          description: articleDesc,
          date: new Date().toISOString().split('T')[0], // Today
          region: 'Global', 
          category: 'Tech',
          imageUrl: `https://picsum.photos/800/400?random=${Date.now()}`,
          tags: ['Community']
      };

      addItem('latest', newItem);
      setArticleTitle('');
      setArticleUrl('');
      setArticleSource('');
      setArticleDesc('');
      alert(language === 'ar' ? "تم نشر الخبر في صفحة الأخبار" : "Article added to Latest News feed!");
  };

  const getBadgeColor = (type: string) => {
      switch(type) {
          case 'News': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
          case 'Startup': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
          case 'Event': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
          case 'Podcast': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
          default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
      }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LinkIcon className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                    {t.sections.resourcesTitle}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage sources and contribute to the news feed.</p>
             </div>
             
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

        {/* Clear Section for Adding Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-4 flex gap-4">
                <button 
                    onClick={() => setActiveTab('source')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'source' ? 'bg-nexus-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    <Globe className="w-4 h-4" /> Add New Source
                </button>
                <button 
                    onClick={() => setActiveTab('article')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'article' ? 'bg-nexus-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    <Newspaper className="w-4 h-4" /> Add News Article
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'source' ? (
                    <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-fadeIn">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Source Name</label>
                            <input 
                                type="text" 
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Wired Middle East"
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Website URL</label>
                            <input 
                                type="url" 
                                required
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
                            <select 
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as any)}
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="News">News</option>
                                <option value="Startup">Startup</option>
                                <option value="Event">Event</option>
                                <option value="Podcast">Podcast</option>
                                <option value="Newsletter">Newsletter</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <button type="submit" className="w-full py-2.5 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 transition-colors font-medium flex items-center justify-center gap-2">
                                <PlusCircle className="w-4 h-4" /> Save Source
                            </button>
                        </div>
                        <div className="md:col-span-4 mt-2">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description (Optional)</label>
                            <input 
                                type="text" 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Brief description of this resource..."
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAddArticle} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Publish to "Latest News" Feed</h4>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Article Title</label>
                            <input 
                                type="text" 
                                required
                                value={articleTitle}
                                onChange={(e) => setArticleTitle(e.target.value)}
                                placeholder="Headline of the news..."
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Link URL</label>
                            <input 
                                type="url" 
                                required
                                value={articleUrl}
                                onChange={(e) => setArticleUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Source Name</label>
                            <input 
                                type="text" 
                                value={articleSource}
                                onChange={(e) => setArticleSource(e.target.value)}
                                placeholder="e.g. TechCrunch, BBC"
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Summary / Description</label>
                            <input 
                                type="text" 
                                value={articleDesc}
                                onChange={(e) => setArticleDesc(e.target.value)}
                                placeholder="Short summary of the news..."
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-2 mt-2">
                             <button type="submit" className="w-full py-3 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 transition-colors font-medium flex items-center justify-center gap-2">
                                <PlusCircle className="w-4 h-4" /> Publish to App Feed
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-700`}>
                            <Globe className="w-6 h-6 text-nexus-600 dark:text-nexus-400" />
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${getBadgeColor(item.type)}`}>
                            {item.type.toUpperCase()}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-nexus-600 dark:group-hover:text-nexus-400 transition-colors">
                        {item.name}
                    </h3>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                        {item.description || 'No description available.'}
                    </p>

                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            ))}
        </div>
        <AIChat contextData={`Page: Resources. Listing ${filteredResources.length} trusted sources.`} />
    </div>
  );
};

export default Resources;