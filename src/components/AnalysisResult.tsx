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
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getRiskColor, getRiskBgColor, getRiskGradient } from '@/utils/analysis';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { RiskMeter } from '@/components/analysis/RiskMeter';
import { useAnalysis } from '@/hooks/useAnalysis';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

export const AnalysisResult: React.FC = () => {
  const { currentAnalysis, showConfetti, setShowConfetti } = useStore();
  const { analyze } = useAnalysis();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

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
      setCopiedItem(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
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
    
    toast.success('Analysis downloaded successfully!');
  };

  const handleTryAgain = async () => {
    if (!text) return;
    
    setIsRegenerating(true);
    try {
      await analyze(text);
      toast.success('Analysis regenerated!');
    } catch (error) {
      toast.error('Failed to regenerate analysis');
    } finally {
      setIsRegenerating(false);
    }
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
      className="w-full max-w-4xl mx-auto space-y-8"
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
          riskLevel === 'EXTREME' && "animate-pulse border-red-500/50"
        )}
        gradient
      >
        <div className="relative z-10">
          {/* Risk Meter */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <RiskMeter score={cancelScore} animated />
          </motion.div>

          {/* Confidence & Processing Time */}
          <div className="flex justify-center space-x-8 mb-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>{Math.round(confidence * 100)}% confidence</span>
            </div>
            <div className="flex items-center space-x-2">
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
              aria-label="Regenerate analysis"
            >
              {isRegenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Try Again</span>
            </Button>

            <Button
              onClick={shareResult}
              variant="secondary"
              className="flex items-center space-x-2"
              aria-label="Share results"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            
            <Button
              onClick={() => copyToClipboard(`Cancel Risk Score: ${cancelScore}/100 (${riskLevel})`, 'Score')}
              variant="secondary"
              className="flex items-center space-x-2"
              aria-label="Copy score to clipboard"
            >
              {copiedItem === 'Score' ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>Copy Score</span>
            </Button>

            <Button
              onClick={downloadResult}
              variant="ghost"
              className="flex items-center space-x-2"
              aria-label="Download analysis results"
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
              aria-label="Copy roast to clipboard"
            >
              {copiedItem === 'Roast' ? (
                <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
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
              className="space-y-3"
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
                aria-label={`${category} score: ${Math.round(score)}%`}
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
                aria-label="Copy apology to clipboard"
              >
                {copiedItem === 'Apology' ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>Copy Apology</span>
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};