
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, Rocket, Calendar, Mic, Mail, BarChart2, Users, UserCircle, Bell, LogIn, LogOut, Menu, X, Sparkles, Sun, Moon, Link as LinkIcon, ShieldCheck, BrainCircuit, Layers, ChevronDown, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, language, toggleLanguage, logout, notificationsEnabled, toggleNotifications, theme, toggleTheme, favorites } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  // Group Labels
  const labels = {
    insights: language === 'ar' ? 'تحليلات' : 'Insights',
    content: language === 'ar' ? 'محتوى' : 'Content',
    network: language === 'ar' ? 'المجتمع' : 'Network'
  };

  // Navigation Structure
  const navStructure = [
    { type: 'link', to: '/', label: t.nav.latest, icon: Newspaper },
    // Removed Startups from top level
    {
      label: labels.insights,
      icon: BarChart2,
      items: [
        { to: '/market', label: t.nav.market, icon: BarChart2 },
        { to: '/industry-analysis', label: t.nav.industry, icon: Layers },
      ]
    },
    {
      type: 'dropdown',
      label: labels.content,
      icon: Layers, // Changed Icon for Content
      items: [
        { to: '/startups', label: t.nav.startups, icon: Newspaper }, // Moved here
        { to: '/podcasts', label: t.nav.podcasts, icon: Mic },
        { to: '/podcast-analysis', label: t.nav.podcastAnalysis, icon: BrainCircuit },
        { to: '/newsletters', label: t.nav.newsletters, icon: Mail },
        { to: '/events', label: t.nav.events, icon: Calendar },
      ]
    },
    {
      type: 'dropdown',
      label: labels.network,
      icon: Users,
      items: [
        { to: '/partners', label: t.nav.partners, icon: Users },
      ]
    }
  ];

  if (isAdmin) {
    navStructure.push({ type: 'link', to: '/admin', label: t.nav.admin, icon: ShieldCheck } as any);
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* Navbar */}
      <header className="flex-none bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">

            {/* LEFT: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-nexus-600 rounded-lg flex items-center justify-center shadow-lg shadow-nexus-500/30">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
                  Info<span className="text-nexus-600 dark:text-nexus-400">Hub</span>
                </span>
              </Link>
            </div>

            {/* CENTER: Desktop Nav (Left Aligned) */}
            <nav className="hidden xl:flex flex-1 items-center justify-start space-x-1 space-x-reverse px-8">
              {navStructure.map((item: any, idx) => {
                if (item.type === 'link') {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors mx-1 flex items-center gap-1 ${isActive
                          ? 'bg-nexus-50 dark:bg-nexus-900/50 text-nexus-600 dark:text-nexus-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  );
                } else {
                  return (
                    <div key={idx} className="relative group mx-1">
                      <button className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        <ChevronDown className="w-3 h-3 opacity-70" />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute top-full left-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                        {item.items.map((sub: any) => (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            className={({ isActive }) =>
                              `block px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${isActive
                                ? 'bg-nexus-50 dark:bg-nexus-900/30 text-nexus-600 dark:text-nexus-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`
                            }
                          >
                            <sub.icon className="w-4 h-4 opacity-70" />
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )
                }
              })}

              {/* Special AI Link */}
              <NavLink
                to="/ai-assistant"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors mx-1 flex items-center gap-1 ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`
                }
              >
                <Sparkles className="w-4 h-4" />
                {t.nav.aiAssistant}
              </NavLink>
            </nav>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/saved"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-nexus-600 dark:hover:text-nexus-400 transition-colors relative"
                  title={t.nav.saved}
                >
                  <Bookmark className={`w-5 h-5 ${favorites.length > 0 ? 'fill-nexus-600 text-nexus-600 dark:text-nexus-400' : ''}`} />
                  {favorites.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-nexus-600 rounded-full"></span>}
                </Link>

                <button
                  onClick={toggleTheme}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-nexus-600 dark:hover:text-nexus-400 transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleLanguage}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-nexus-600 dark:hover:text-nexus-400 transition-colors"
                  title="Switch Language"
                >
                  <span className="font-bold text-xs border border-slate-300 dark:border-slate-600 rounded px-1">{language === 'en' ? 'AR' : 'EN'}</span>
                </button>

                <button
                  onClick={toggleNotifications}
                  className={`p-2 transition-colors relative ${notificationsEnabled ? 'text-nexus-600 dark:text-nexus-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notificationsEnabled && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>

                {user ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1">
                        {user.name}
                        {isAdmin && <ShieldCheck className="w-3 h-3 text-nexus-600" />}
                      </span>
                      <button onClick={logout} className="text-xs text-red-500 hover:underline">{t.nav.logout}</button>
                    </div>
                    <UserCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-1 px-4 py-2 bg-nexus-600 text-white rounded-lg text-sm font-medium hover:bg-nexus-700 transition-colors shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    {t.nav.login}
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="xl:hidden flex items-center">
                <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 mr-1 md:hidden">
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button onClick={toggleLanguage} className="p-2 mr-2 text-slate-500 dark:text-slate-400 md:hidden">
                  <span className="font-bold text-xs border border-slate-300 dark:border-slate-600 rounded px-1">{language === 'en' ? 'AR' : 'EN'}</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 absolute w-full z-50 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
              {/* Saved Items Link Mobile */}
              <NavLink
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${isActive
                    ? 'bg-nexus-50 dark:bg-nexus-900/50 text-nexus-600 dark:text-nexus-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`
                }
              >
                <Bookmark className="w-5 h-5" />
                {t.nav.saved}
              </NavLink>
              {/* Flatten structure for mobile */}
              {navStructure.map((item: any, idx) => {
                if (item.type === 'link') {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${isActive
                          ? 'bg-nexus-50 dark:bg-nexus-900/50 text-nexus-600 dark:text-nexus-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                } else {
                  return (
                    <div key={idx} className="py-2">
                      <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{item.label}</div>
                      {item.items.map((sub: any) => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-3 py-2 pl-6 rounded-md text-base font-medium flex items-center gap-2 ${isActive
                              ? 'bg-nexus-50 dark:bg-nexus-900/50 text-nexus-600 dark:text-nexus-400'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`
                          }
                        >
                          <sub.icon className="w-5 h-5 opacity-70" />
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )
                }
              })}

              <NavLink
                to="/ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`
                }
              >
                <Sparkles className="w-5 h-5" />
                {t.nav.aiAssistant}
              </NavLink>
              <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                {user ? (
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-red-500 flex items-center gap-2">
                    <LogOut className="w-5 h-5" /> {t.nav.logout}
                  </button>
                ) : (
                  <button onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-nexus-600 dark:text-nexus-400 flex items-center gap-2">
                    <LogIn className="w-5 h-5" /> {t.nav.login}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-smooth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
