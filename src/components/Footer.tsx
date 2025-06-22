import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Coffee } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-20 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold gradient-text mb-4">ScandalScope</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              The ultimate AI-powered cancel risk analyzer. Get roasted, get real, get ready for the internet's judgment.
            </p>
            <div className="flex items-center space-x-4">
              <motion.a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Coffee className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Cancel Risk Analysis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Roast Generator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Apology Templates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Leaderboard</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ScandalScope. All rights reserved. Use responsibly.
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-purple-400" />
            <span>and a lot of controversy</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};