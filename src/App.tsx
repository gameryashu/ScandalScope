import React, { useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { AnalysisInput } from '@/components/AnalysisInput';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Footer } from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useStore } from '@/store/useStore';
import { initializePerformanceMonitoring } from '@/utils/performance';
import { Toaster } from 'react-hot-toast';

// Lazy load heavy components
const Leaderboard = React.lazy(() => import('@/components/Leaderboard'));
const History = React.lazy(() => import('@/components/History'));

function App() {
  const { currentAnalysis, theme, setTheme } = useStore();
  const [currentView, setCurrentView] = React.useState('home');

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();

    // Apply theme
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // System theme detection
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  const renderContent = () => {
    switch (currentView) {
      case 'leaderboard':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading leaderboard..." />}>
            <Leaderboard />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading history..." />}>
            <History />
          </Suspense>
        );
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
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
        </div>

        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        <main 
          className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
          role="main"
          aria-label="Main content"
        >
          <div className="max-w-4xl mx-auto">
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
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;