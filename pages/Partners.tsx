import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, Mail, Globe } from 'lucide-react';
import AIChat from '../components/AIChat';

const Partners: React.FC = () => {
    const { language, partners } = useApp();
    const t = TRANSLATIONS[language];

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                    {t.sections.partnersTitle}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Connecting you with the ecosystem leaders.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {partners.map(p => (
                     <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
                         <div className="w-full md:w-32 h-32 flex-shrink-0 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center p-4 border border-slate-100 dark:border-slate-600 group-hover:border-nexus-200 dark:group-hover:border-nexus-500">
                             <img src={p.logo} alt={p.name} className="max-w-full max-h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                         </div>
                         
                         <div className="flex-1">
                             <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{p.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${p.type === 'Egypt' ? 'bg-egypt-red/10 text-egypt-red' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                                    {p.type.toUpperCase()}
                                </span>
                             </div>
                             
                             <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{p.description}</p>
                             
                             <div className="flex flex-wrap gap-2 mb-4">
                                {p.services.map((s, i) => (
                                    <span key={i} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{s}</span>
                                ))}
                             </div>

                             <div className="flex gap-3">
                                <a href={p.website} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-nexus-50 dark:bg-nexus-900/30 text-nexus-600 dark:text-nexus-400 rounded-lg hover:bg-nexus-100 dark:hover:bg-nexus-900/50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                    <Globe className="w-4 h-4" /> Website
                                </a>
                                <a href={`mailto:${p.contactEmail}`} className="flex-1 text-center py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4" /> {t.common.contact}
                                </a>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
             <AIChat contextData="Page: Partners." />
        </div>
    );
};

export default Partners;