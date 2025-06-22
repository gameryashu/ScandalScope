import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Trash2, Share2, Calendar, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getRiskColor, getRiskBgColor } from '@/utils/analysis';
import { format } from 'date-fns';

export const History: React.FC = () => {
  const { analysisHistory, setCurrentAnalysis } = useStore();

  const handleViewAnalysis = (analysis: any) => {
    setCurrentAnalysis(analysis);
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-emerald-400';
    if (score < 40) return 'text-yellow-400';
    if (score < 60) return 'text-orange-400';
    if (score < 80) return 'text-red-400';
    return 'text-red-600';
  };

  if (analysisHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="card text-center py-12">
          <HistoryIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Analysis History</h2>
          <p className="text-gray-400 mb-6">
            Start analyzing some text to see your history here!
          </p>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Analyzing
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const averageScore = Math.round(
    analysisHistory.reduce((sum, analysis) => sum + analysis.cancelScore, 0) / analysisHistory.length
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Analysis History
        </h1>
        <p className="text-gray-300 text-lg">
          Your journey through the cancel risk landscape
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
            {averageScore}
          </div>
          <div className="text-sm text-gray-400">Average Score</div>
        </motion.div>

        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HistoryIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">
            {analysisHistory.length}
          </div>
          <div className="text-sm text-gray-400">Total Analyses</div>
        </motion.div>

        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Calendar className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-400">
            {Math.max(...analysisHistory.map(a => a.cancelScore))}
          </div>
          <div className="text-sm text-gray-400">Highest Score</div>
        </motion.div>
      </div>

      {/* History List */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {analysisHistory.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            className="card hover:bg-gray-800/70 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleViewAnalysis(analysis)}
          >
            <div className="flex items-start space-x-4">
              {/* Score Badge */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-xl ${getRiskBgColor(analysis.riskLevel)} flex items-center justify-center`}>
                <div className={`text-xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.cancelScore}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRiskBgColor(analysis.riskLevel)} ${getRiskColor(analysis.riskLevel)}`}>
                    {analysis.riskLevel} RISK
                  </span>
                  <span className="text-sm text-gray-400">
                    {format(new Date(analysis.timestamp), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>

                <p className="text-gray-200 mb-2 line-clamp-2">
                  {analysis.text}
                </p>

                <p className="text-gray-300 text-sm italic line-clamp-1">
                  "{analysis.roast}"
                </p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex space-x-2">
                <motion.button
                  className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Delete functionality
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};