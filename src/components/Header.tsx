import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Moon, Sun, Home, Trophy, History, Menu, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { theme, setTheme } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navigationItems = [
    { id: 'home', label: 'Analyze', icon: Home },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavClick('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Flame className="h-8 w-8 text-purple-500" />
              <motion.div
                className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ScandalScope
              </h1>
              <p className="text-xs text-gray-400 -mt-1">V2.0</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => handleNavClick(id)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300',
                  currentView === id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-400" />
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2 border-t border-gray-700/50">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => handleNavClick(id)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300',
                  currentView === id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};