import React from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Latest from './pages/Latest';
import Startups from './pages/Startups';
import Events from './pages/Events';
import MarketAnalysis from './pages/MarketAnalysis';
import IndustryAnalysis from './pages/IndustryAnalysis';
import Podcasts from './pages/Podcasts';
import PodcastAnalysis from './pages/PodcastAnalysis';
import Newsletters from './pages/Newsletters';
import Partners from './pages/Partners';
import AIAssistant from './pages/AIAssistant';
import Auth from './pages/Auth';
import Saved from './pages/Saved';
import Resources from './pages/Resources';
import ArticleDetail from './pages/ArticleDetail';
import Admin from './pages/Admin';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route path="/" element={<Latest />} />
      <Route path="/article/:id" element={<ArticleDetail />} />
      <Route path="/startups" element={<Startups />} />
      <Route path="/events" element={<Events />} />
      <Route path="/market" element={<MarketAnalysis />} />
      <Route path="/industry-analysis" element={<IndustryAnalysis />} />
      <Route path="/podcasts" element={<Podcasts />} />
      <Route path="/podcast-analysis" element={<PodcastAnalysis />} />
      <Route path="/newsletters" element={<Newsletters />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/resources" element={<Resources />} />
      
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;