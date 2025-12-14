
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Calendar, MapPin, Video, ExternalLink, Users, Globe, Ticket, Clock, ArrowRight } from 'lucide-react';
import AIChat from '../components/AIChat';
import FilterBar from '../components/FilterBar';

const Events: React.FC = () => {
  const { language, regionFilter, setRegionFilter, events } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const t = TRANSLATIONS[language];

  // Dynamic Type Filters based on data
  const typeOptions = useMemo(() => {
      const availableTypes = Array.from(new Set(events.map(e => e.type)));
      const baseOptions = [
          { label: t.common.all, value: 'All' }
      ];
      
      const mappedTypes = availableTypes.map(type => ({
          label: type + 's', // Pluralize roughly
          value: type
      }));

      return [...baseOptions, ...mappedTypes];
  }, [events, t.common.all]);

  const filteredEvents = events.filter(item => {
    const regionMatch = regionFilter === 'All' || item.region === regionFilter || (regionFilter === 'Egypt' && item.region === 'MENA');
    const typeMatch = typeFilter === 'All' || item.type === typeFilter;
    return regionMatch && typeMatch;
  });

  const regionOptions = [
      { label: 'All Regions', value: 'All' },
      { label: 'Global', value: 'Global' },
      { label: 'Egypt', value: 'Egypt' }
  ];

  const getTypeColor = (type: string) => {
      switch (type) {
          case 'Conference': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
          case 'Hackathon': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
          case 'Meetup': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
          case 'Workshop': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
          default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      }
  };

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                    {t.sections.eventsTitle}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Discover, connect, and register for upcoming tech gatherings.</p>
             </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
             <FilterBar activeValue={regionFilter} onSelect={(v) => setRegionFilter(v as any)} options={regionOptions} icon={<Globe className="w-4 h-4" />} />
             {/* Only show Type filter if there is more than just 'All' */}
             {typeOptions.length > 1 && (
                <FilterBar activeValue={typeFilter} onSelect={setTypeFilter} options={typeOptions} icon={<Users className="w-4 h-4" />} />
             )}
        </div>

        <div className="space-y-6">
            {filteredEvents.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No upcoming events found matching your criteria.</p>
                    <button onClick={() => {setRegionFilter('All'); setTypeFilter('All');}} className="mt-4 text-nexus-600 hover:underline text-sm">Clear Filters</button>
                 </div>
            ) : filteredEvents.map(event => {
                const startDate = new Date(event.startDate);
                const isOneDay = event.startDate === event.endDate;
                
                return (
                <div key={event.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow group">
                    {/* Date Box */}
                    <div className="md:w-36 bg-nexus-50 dark:bg-nexus-900/20 text-nexus-700 dark:text-nexus-300 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 group-hover:bg-nexus-600 group-hover:text-white transition-colors duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                        <span className="text-4xl font-black tracking-tighter">{startDate.getDate()}</span>
                        <span className="text-sm font-bold uppercase tracking-widest mt-1">{startDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xs mt-2 opacity-80">{startDate.getFullYear()}</span>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                <div className="flex gap-2 items-center">
                                     <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${getTypeColor(event.type)}`}>{event.type}</span>
                                     {event.isVirtual && <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md flex items-center gap-1"><Video className="w-3 h-3" /> Virtual</span>}
                                     {event.region === 'Egypt' && <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md">Egypt</span>}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-nexus-600 transition-colors">{event.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{isOneDay ? '1 Day Event' : `${new Date(event.endDate).getDate() - startDate.getDate() + 1} Days Duration`}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{event.description}</p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-xs text-slate-400 font-medium">Organized by <span className="text-slate-700 dark:text-slate-300 font-bold">{event.source}</span></span>
                            <a 
                                href={event.registrationLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-nexus-600 text-white rounded-xl hover:bg-nexus-700 transition-all shadow-md hover:shadow-lg font-bold text-sm"
                            >
                                <Ticket className="w-4 h-4" />
                                Register Now
                            </a>
                        </div>
                    </div>
                </div>
            )})}
        </div>

        {/* Sources Footer */}
        <div className="mt-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4">Find more events on</h4>
            <div className="flex flex-wrap gap-4">
                {['Meetup.com', 'Eventbrite', 'LinkedIn Events', 'DevPost', 'Luma'].map(source => (
                    <div key={source} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm">
                        <ExternalLink className="w-3 h-3 text-slate-400" /> {source}
                    </div>
                ))}
            </div>
        </div>

        <AIChat contextData={`Page: Events. Listing ${filteredEvents.length} events.`} />
    </div>
  );
};

export default Events;
