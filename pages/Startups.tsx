
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import NewsCard from '../components/NewsCard';
import AIChat from '../components/AIChat';
import { Rocket, RefreshCw, Layers, Search, Globe, Filter, Briefcase, ChevronDown, X, AlertCircle } from 'lucide-react';

const Startups: React.FC = () => {
  const { groupedStartups, refreshCategoryFeed, startupNews } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');

  // Helper to get ALL current items based on loaded data
  // Prioritize flattening grouped data as it's the source of truth for structure
  const allItems = useMemo(() => {
      const groupedFlat = Object.values(groupedStartups).flat();
      return groupedFlat.length > 0 ? groupedFlat : startupNews;
  }, [groupedStartups, startupNews]);

  // Trigger auto-load if completely empty
  useEffect(() => {
      if (allItems.length === 0) {
          handleSync();
      }
  }, []); // Run once on mount

  const handleSync = async () => {
      setIsSyncing(true);
      await refreshCategoryFeed('startup');
      setIsSyncing(false);
  };

  const handleResetFilters = () => {
      setRegionFilter('All');
      setSourceFilter('All');
      setSectorFilter('All');
      setSearchTerm('');
  };

  // DYNAMIC OPTIONS GENERATORS (Memoized to prevent flickering)
  const regionOptions = useMemo(() => {
      const regions = new Set(allItems.map(i => i.region || 'Global'));
      const opts = ['All'];
      if(regions.has('Egypt')) opts.push('Egypt');
      if(regions.has('MENA')) opts.push('MENA');
      if(regions.has('Global')) opts.push('Global');
      return opts;
  }, [allItems]);

  const sourceOptions = useMemo(() => {
      const sources = Array.from(new Set(allItems.map(i => i.source)));
      return ['All', ...sources.sort()];
  }, [allItems]);

  const sectorOptions = useMemo(() => {
      const sectors = Array.from(new Set(allItems.map(i => i.sector || 'General')));
      return ['All', ...sectors.sort()];
  }, [allItems]);

  // Main Filtering Logic
  const filteredItems = allItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'All' || item.region === regionFilter;
      const matchesSource = sourceFilter === 'All' || item.source === sourceFilter;
      const matchesSector = sectorFilter === 'All' || item.sector === sectorFilter;
      
      return matchesSearch && matchesRegion && matchesSource && matchesSector;
  });

  // Determine display groups
  let displayGroups: { title: string; logo?: string; items: any[] }[] = [];

  if (sourceFilter === 'All') {
      // Group by Source from filtered items
      const groups: Record<string, any[]> = {};
      const logos: Record<string, string> = {};
      
      filteredItems.forEach(item => {
          if (!groups[item.source]) groups[item.source] = [];
          groups[item.source].push(item);
          // Capture logo from first item of source if available
          if (!logos[item.source] && (item as any).logo) logos[item.source] = (item as any).logo;
      });
      
      displayGroups = Object.keys(groups).sort().map(key => ({
          title: key,
          logo: logos[key],
          items: groups[key]
      }));
  } else {
      // Single group view
      const firstItem = filteredItems[0];
      displayGroups = [{ 
          title: sourceFilter, 
          logo: firstItem ? (firstItem as any).logo : undefined,
          items: filteredItems 
      }];
  }

  // Helper for Dropdown Styles
  const selectWrapperClass = "relative flex-1 min-w-[150px]";
  const selectClass = "w-full appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white py-2.5 pl-10 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-500 cursor-pointer transition-shadow text-sm font-medium";
  const iconClass = "absolute left-3 top-3 w-4 h-4 text-slate-400";
  const chevronClass = "absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none";

  return (
    <div className="flex flex-col h-full animate-fadeIn pb-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3">
                <div className="bg-nexus-100 dark:bg-nexus-900/50 p-2 rounded-lg">
                    <Rocket className="w-6 h-6 text-nexus-600 dark:text-nexus-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Startups & News</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive ecosystem coverage.</p>
                </div>
            </div>
            
            <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 text-white hover:bg-nexus-700 bg-nexus-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                title="Sync Latest Data"
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-bold">{isSyncing ? 'Syncing...' : 'Refresh News'}</span>
            </button>
        </div>

        {/* DROPDOWN FILTER MENU BAR */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-20 space-y-4">
            {/* Search Top */}
            <div className="relative w-full">
                <input 
                    type="text" 
                    placeholder="Search headlines, companies, or keywords..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-transparent outline-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:block">Filters:</span>
                
                {/* Region Dropdown */}
                <div className={selectWrapperClass}>
                    <Globe className={iconClass} />
                    <select 
                        value={regionFilter} 
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className={selectClass}
                        disabled={regionOptions.length <= 1}
                    >
                        {regionOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Regions' : opt}</option>)}
                    </select>
                    <ChevronDown className={chevronClass} />
                </div>

                {/* Source Dropdown */}
                <div className={selectWrapperClass}>
                    <Filter className={iconClass} />
                    <select 
                        value={sourceFilter} 
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className={selectClass}
                        disabled={sourceOptions.length <= 1}
                    >
                        {sourceOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Sources' : opt}</option>)}
                    </select>
                    <ChevronDown className={chevronClass} />
                </div>

                {/* Field/Sector Dropdown */}
                <div className={selectWrapperClass}>
                    <Briefcase className={iconClass} />
                    <select 
                        value={sectorFilter} 
                        onChange={(e) => setSectorFilter(e.target.value)}
                        className={selectClass}
                        disabled={sectorOptions.length <= 1}
                    >
                        {sectorOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Fields' : opt}</option>)}
                    </select>
                    <ChevronDown className={chevronClass} />
                </div>

                {/* Reset Button */}
                {(regionFilter !== 'All' || sourceFilter !== 'All' || sectorFilter !== 'All' || searchTerm) && (
                    <button 
                        onClick={handleResetFilters}
                        className="ml-auto px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
                    >
                        <X className="w-4 h-4" /> Clear Filters
                    </button>
                )}
            </div>
        </div>

        {/* Source Groups */}
        <div className="space-y-12">
            {displayGroups.length === 0 && allItems.length > 0 && (
                 <div className="text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-slate-500 dark:text-slate-400">No results found for current filters.</p>
                    <button onClick={handleResetFilters} className="mt-2 text-nexus-600 hover:underline text-sm">Clear Filters</button>
                 </div>
            )}

            {displayGroups.map(group => (
                <div key={group.title} className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        {group.logo && (
                            <img src={group.logo} alt={group.title} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-white" />
                        )}
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white px-4 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                            {group.title}
                        </h2>
                        <div className="h-px flex-1 bg-slate-200 dark:border-slate-700"></div>
                        <span className="text-xs text-slate-400 font-medium">{group.items.length} results</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {group.items.map(item => (
                            <NewsCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* Empty State */}
        {allItems.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 min-h-[300px]">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                    {isSyncing ? "Fetching news..." : "No news sources loaded yet."}
                </p>
                <button onClick={handleSync} disabled={isSyncing} className="px-6 py-2 bg-nexus-600 text-white rounded-lg text-sm hover:bg-nexus-700 transition-colors font-bold shadow-lg flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Syncing..." : "Fetch Latest Data"}
                </button>
            </div>
        )}

        <AIChat contextData={`Page: Startups Full Feed. Showing ${filteredItems.length} filtered articles.`} />
    </div>
  );
};

export default Startups;
