import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { AnalysisInput } from './components/AnalysisInput';
import { AnalysisResult } from './components/AnalysisResult';
import { Leaderboard } from './components/Leaderboard';
import { History } from './components/History';
import { Footer } from './components/Footer';
import { useStore } from './store/useStore';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const { currentAnalysis, theme } = useStore();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderContent = () => {
    switch (currentView) {
      case 'leaderboard':
        return <Leaderboard />;
      case 'history':
        return <History />;
      default:
        return (
          <div className="space-y-8">
            <AnalysisInput />
            <AnimatePresence>
              {currentAnalysis && <AnalysisResult />}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float" />
      </div>

      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;