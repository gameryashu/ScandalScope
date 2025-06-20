import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Moon, Sun, User, Trophy, History } from 'lucide-react';
import { useStore } from '../store/useStore';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { theme, setTheme, user } = useStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentView('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Flame className="h-8 w-8 text-primary-500" />
              <motion.div
                className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ScandalScope</h1>
              <p className="text-xs text-secondary-400 -mt-1">Cancel Risk Analyzer</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { id: 'home', label: 'Analyze', icon: Flame },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'history', label: 'History', icon: History },
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  currentView === id
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-secondary-300 hover:text-white hover:bg-secondary-700/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </motion.button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary-700/50 hover:bg-secondary-600/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-accent-400" />
              ) : (
                <Moon className="h-5 w-5 text-secondary-400" />
              )}
            </motion.button>

            {/* User Profile */}
            {user ? (
              <motion.div 
                className="flex items-center space-x-3 bg-secondary-700/50 rounded-lg px-3 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="h-8 w-8 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <p className="text-xs text-secondary-400">Score: {user.averageScore}</p>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => setCurrentView('profile')}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};