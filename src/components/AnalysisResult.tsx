import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Flame, 
  Copy, 
  Share2, 
  Download,
  TrendingUp,
  MessageSquare,
  Heart,
  BarChart3
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getRiskColor, getRiskBgColor } from '../utils/analysis';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

export const AnalysisResult: React.FC = () => {
  const { currentAnalysis, showConfetti, setShowConfetti } = useStore();

  useEffect(() => {
    if (currentAnalysis && currentAnalysis.riskLevel === 'SAFE') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [currentAnalysis, setShowConfetti]);

  if (!currentAnalysis) return null;

  const { cancelScore, riskLevel, roast, apology, categories, recommendations } = currentAnalysis;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const shareResult = () => {
    const shareText = `I just got a ${cancelScore}/100 cancel risk score on ScandalScope! 🔥 ${roast}`;
    if (navigator.share) {
      navigator.share({
        title: 'My ScandalScope Result',
        text: shareText,
        url: window.location.href,
      });
    } else {
      copyToClipboard(shareText, 'Share text');
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'SAFE': return <Shield className="h-8 w-8 text-success-400" />;
      case 'MILD': return <TrendingUp className="h-8 w-8 text-accent-400" />;
      case 'MODERATE': return <AlertTriangle className="h-8 w-8 text-warning-400" />;
      case 'HIGH': return <Flame className="h-8 w-8 text-primary-400" />;
      case 'EXTREME': return <Flame className="h-8 w-8 text-danger-400" />;
      default: return <BarChart3 className="h-8 w-8 text-secondary-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-success-400';
    if (score < 40) return 'text-accent-400';
    if (score < 60) return 'text-warning-400';
    if (score < 80) return 'text-primary-400';
    return 'text-danger-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Main Score Card */}
      <motion.div
        className={`card ${getRiskBgColor(riskLevel)} border-2 ${
          riskLevel === 'EXTREME' ? 'border-danger-500 animate-pulse-glow' : 
          riskLevel === 'HIGH' ? 'border-primary-500' :
          riskLevel === 'MODERATE' ? 'border-warning-500' :
          riskLevel === 'MILD' ? 'border-accent-500' :
          'border-success-500'
        }`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="text-center">
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            {getRiskIcon()}
          </motion.div>
          
          <motion.div
            className={`text-6xl font-bold mb-2 ${getScoreColor(cancelScore)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {cancelScore}
          </motion.div>
          
          <div className="text-2xl font-semibold text-white mb-2">
            Cancel Risk Score
          </div>
          
          <motion.div
            className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getRiskBgColor(riskLevel)} ${getRiskColor(riskLevel)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            {riskLevel} RISK
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <motion.button
            onClick={shareResult}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </motion.button>
          
          <motion.button
            onClick={() => copyToClipboard(`Cancel Risk Score: ${cancelScore}/100 (${riskLevel})`, 'Score')}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="h-4 w-4" />
            <span>Copy Score</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Roast Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Flame className="h-5 w-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">The Roast 🔥</h3>
            <p className="text-secondary-200 leading-relaxed">{roast}</p>
            <motion.button
              onClick={() => copyToClipboard(roast, 'Roast')}
              className="mt-3 text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
            >
              <Copy className="h-3 w-3" />
              <span>Copy roast</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Categories Breakdown */}
      <motion.div
        className="card"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 text-accent-400 mr-2" />
          Risk Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(categories).map(([category, score], index) => (
            <motion.div
              key={category}
              className="bg-secondary-700/30 rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="text-sm text-secondary-300 capitalize mb-1">
                {category.replace('_', ' ')}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-secondary-600 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getScoreColor(score)}`}
                    style={{ backgroundColor: `hsl(${120 - score * 1.2}, 70%, 50%)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                  />
                </div>
                <span className="text-sm font-medium text-white">
                  {Math.round(score)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 text-success-400 mr-2" />
          Recommendations
        </h3>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 p-3 bg-secondary-700/30 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <div className="w-2 h-2 bg-success-400 rounded-full" />
              <span className="text-secondary-200">{rec}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Apology Generator */}
      {cancelScore > 50 && (
        <motion.div
          className="card bg-warning-500/10 border border-warning-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Heart className="h-5 w-5 text-warning-400 mr-2" />
            Emergency Apology Generator
          </h3>
          <div className="bg-secondary-700/30 rounded-lg p-4 mb-4">
            <p className="text-secondary-200 italic leading-relaxed">"{apology}"</p>
          </div>
          <motion.button
            onClick={() => copyToClipboard(apology, 'Apology')}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="h-4 w-4" />
            <span>Copy Apology</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};