import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3,
  Clock,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useCurrentAnalysis, useStore } from '@/store/useStore';
import { getRiskColor, getRiskBgColor, getRiskGradient } from '@/utils/analysis';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import Confetti from 'react-confetti';

export const AnalysisResult: React.FC = () => {
  const currentAnalysis = useCurrentAnalysis();
  const { showConfetti, setShowConfetti } = useStore();
  const { analyze } = useAnalysis();
  const { success: showSuccess, error: showError } = useToast();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  useEffect(() => {
    if (currentAnalysis && currentAnalysis.riskLevel === 'SAFE') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [currentAnalysis, setShowConfetti]);

  if (!currentAnalysis) return null;

  const { 
    cancelScore, 
    riskLevel, 
    roast, 
    apology, 
    categories, 
    recommendations,
    confidence,
    processingTime,
    timestamp,
    text
  } = currentAnalysis;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${type} copied to clipboard!`);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const shareResult = async () => {
    const shareText = `I just got a ${cancelScore}/100 cancel risk score on ScandalScope! 🔥 ${roast}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ScandalScope Result',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        await copyToClipboard(shareText, 'Share text');
      }
    } else {
      await copyToClipboard(shareText, 'Share text');
    }
  };

  const downloadResult = () => {
    const data = {
      score: cancelScore,
      riskLevel,
      roast,
      categories,
      timestamp: new Date(timestamp).toISOString(),
      originalText: text,
      recommendations,
      confidence,
      processingTime,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandalscope-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Analysis downloaded successfully!');
  };

  const handleTryAgain = async () => {
    if (!text) return;
    
    setIsRegenerating(true);
    try {
      await analyze(text);
      showSuccess('Analysis regenerated!');
    } catch (error) {
      showError('Failed to regenerate analysis');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getRiskIcon = () => {
    const iconClass = "h-8 w-8";
    switch (riskLevel) {
      case 'SAFE': return <Shield className={cn(iconClass, "text-emerald-400")} />;
      case 'MILD': return <TrendingUp className={cn(iconClass, "text-yellow-400")} />;
      case 'MODERATE': return <AlertTriangle className={cn(iconClass, "text-orange-400")} />;
      case 'HIGH': return <Flame className={cn(iconClass, "text-red-400")} />;
      case 'EXTREME': return <Flame className={cn(iconClass, "text-red-600 animate-pulse")} />;
      default: return <BarChart3 className={cn(iconClass, "text-gray-400")} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-emerald-400';
    if (score < 40) return 'text-yellow-400';
    if (score < 60) return 'text-orange-400';
    if (score < 80) return 'text-red-400';
    return 'text-red-600';
  };

  const getProgressColor = (score: number): 'success' | 'warning' | 'danger' => {
    if (score < 40) return 'success';
    if (score < 70) return 'warning';
    return 'danger';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
      data-testid="analysis-result"
    >
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Main Score Card */}
      <Card 
        className={cn(
          "text-center relative overflow-hidden",
          `bg-gradient-to-br ${getRiskGradient(riskLevel)}`,
          riskLevel === 'EXTREME' && "animate-pulse border-red-500/50"
        )}
        gradient
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 animate-gradient-x" />
        </div>

        <div className="relative z-10">
          {/* Risk Icon */}
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            {getRiskIcon()}
          </motion.div>
          
          {/* Score Display */}
          <motion.div
            className={cn("text-7xl font-bold mb-4", getScoreColor(cancelScore))}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            data-testid="cancel-score"
          >
            {cancelScore}
          </motion.div>
          
          <div className="text-2xl font-semibold text-white mb-4">
            Cancel Risk Score
          </div>
          
          {/* Risk Level Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="mb-6"
          >
            <Badge 
              variant={riskLevel === 'SAFE' ? 'success' : riskLevel === 'EXTREME' ? 'danger' : 'warning'}
              size="lg"
              className="text-lg font-bold px-6 py-2"
            >
              {riskLevel} RISK
            </Badge>
          </motion.div>

          {/* Confidence & Processing Time */}
          <div className="flex justify-center space-x-6 mb-6 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{Math.round(confidence * 100)}% confidence</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{processingTime}ms</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={handleTryAgain}
              disabled={isRegenerating}
              variant="primary"
              className="flex items-center space-x-2"
            >
              {isRegenerating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Try Again</span>
            </Button>

            <Button
              onClick={shareResult}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            
            <Button
              onClick={() => copyToClipboard(`Cancel Risk Score: ${cancelScore}/100 (${riskLevel})`, 'Score')}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Score</span>
            </Button>

            <Button
              onClick={downloadResult}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Roast Section */}
      <Card className="relative overflow-hidden" data-testid="roast-content">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
            <Flame className="h-6 w-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              The Roast 
              <Zap className="h-5 w-5 text-yellow-400 ml-2" />
            </h3>
            <motion.p 
              className="text-gray-200 leading-relaxed text-lg mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {roast}
            </motion.p>
            <Button
              onClick={() => copyToClipboard(roast, 'Roast')}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy roast
            </Button>
          </div>
        </div>
      </Card>

      {/* Categories Breakdown */}
      <Card>
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
          Risk Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([category, score], index) => (
            <motion.div
              key={category}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300 capitalize">
                  {category.replace('_', ' ')}
                </span>
                <Badge 
                  variant={score > 70 ? 'danger' : score > 40 ? 'warning' : 'success'}
                  size="sm"
                >
                  {Math.round(score)}%
                </Badge>
              </div>
              <Progress
                value={score}
                color={getProgressColor(score)}
                className="h-2"
              />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card>
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <MessageSquare className="h-6 w-6 text-emerald-400 mr-3" />
          Recommendations
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-200 leading-relaxed">{rec}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Emergency Apology Generator */}
      <AnimatePresence>
        {cancelScore > 50 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Heart className="h-6 w-6 text-yellow-400 mr-3" />
                Emergency Apology Generator
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700/50">
                <p className="text-gray-200 italic leading-relaxed">"{apology}"</p>
              </div>
              <Button
                onClick={() => copyToClipboard(apology, 'Apology')}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Apology</span>
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};