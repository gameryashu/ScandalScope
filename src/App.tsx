import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { AnalysisInput } from '@/components/AnalysisInput';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Leaderboard } from '@/components/Leaderboard';
import { History } from '@/components/History';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useStore, useCurrentAnalysis, useTheme } from '@/store/useStore';
import { useToast } from '@/hooks/useToast';
import { ScreenReader } from '@/utils/accessibility';

function App() {
  const [currentView, setCurrentView] = React.useState('home');
  const currentAnalysis = useCurrentAnalysis();
  const theme = useTheme();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  // Announce view changes to screen readers
  useEffect(() => {
    const viewNames = {
      home: 'Analysis page',
      leaderboard: 'Leaderboard page',
      history: 'History page',
    };
    
    ScreenReader.announce(`Navigated to ${viewNames[currentView as keyof typeof viewNames] || currentView}`);
  }, [currentView]);

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
            <AnimatePresence mode="wait">
              {currentAnalysis && (
                <motion.div
                  key={currentAnalysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalysisResult />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>

        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        <main 
          className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
          role="main"
          aria-label="Main content"
        >
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

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </ErrorBoundary>
  );
}

export default App;