import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Flame, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Leaderboard: React.FC = () => {
  const { leaderboard, setLeaderboard } = useStore();

  useEffect(() => {
    // Mock leaderboard data
    const mockUsers = [
      {
        id: '1',
        username: 'CancelKing',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        totalAnalyses: 156,
        averageScore: 89,
        badges: ['🔥 Controversy Master', '💀 Cancel Survivor', '⚡ Risk Taker'],
        streak: 12,
      },
      {
        id: '2',
        username: 'SafeSpaceQueen',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
        totalAnalyses: 203,
        averageScore: 15,
        badges: ['🛡️ Safety First', '😇 Angel Mode', '🕊️ Peace Keeper'],
        streak: 45,
      },
      {
        id: '3',
        username: 'EdgeLord2024',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        totalAnalyses: 89,
        averageScore: 76,
        badges: ['⚠️ Warning Zone', '🎭 Drama Queen', '🌶️ Spicy Takes'],
        streak: 8,
      },
      {
        id: '4',
        username: 'ModerateMarvin',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
        totalAnalyses: 134,
        averageScore: 42,
        badges: ['⚖️ Balanced', '🤔 Thoughtful', '📊 Data Driven'],
        streak: 23,
      },
      {
        id: '5',
        username: 'ChaosCreator',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
        totalAnalyses: 67,
        averageScore: 94,
        badges: ['💥 Chaos Agent', '🔥 Flame Starter', '⚡ Lightning Rod'],
        streak: 3,
      },
    ];

    setLeaderboard(mockUsers);
  }, [setLeaderboard]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-secondary-400">#{index + 1}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-success-400';
    if (score < 40) return 'text-accent-400';
    if (score < 60) return 'text-warning-400';
    if (score < 80) return 'text-primary-400';
    return 'text-danger-400';
  };

  const getScoreBg = (score: number) => {
    if (score < 20) return 'bg-success-500/20';
    if (score < 40) return 'bg-accent-500/20';
    if (score < 60) return 'bg-warning-500/20';
    if (score < 80) return 'bg-primary-500/20';
    return 'bg-danger-500/20';
  };

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
          Cancel Risk Leaderboard
        </h1>
        <p className="text-secondary-300 text-lg">
          See who's living dangerously and who's playing it safe
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Flame className="h-8 w-8 text-danger-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-danger-400">94</div>
          <div className="text-sm text-secondary-400">Highest Risk</div>
        </motion.div>

        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Shield className="h-8 w-8 text-success-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-success-400">15</div>
          <div className="text-sm text-secondary-400">Safest Score</div>
        </motion.div>

        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TrendingUp className="h-8 w-8 text-accent-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-accent-400">649</div>
          <div className="text-sm text-secondary-400">Total Analyses</div>
        </motion.div>
      </div>

      {/* Leaderboard */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
          Top Risk Takers
        </h2>

        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30' 
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/30'
                  : 'bg-secondary-700/30 border-secondary-600/30'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {getRankIcon(index)}
                </div>

                {/* Avatar */}
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border-2 border-secondary-600"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {user.username}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Flame className="h-3 w-3 text-primary-400" />
                      <span className="text-xs text-secondary-400">{user.streak}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="text-xs bg-secondary-600/50 text-secondary-300 px-2 py-1 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-secondary-400">
                    {user.totalAnalyses} analyses
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(user.averageScore)}`}>
                    {user.averageScore}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getScoreBg(user.averageScore)} ${getScoreColor(user.averageScore)}`}>
                    Avg Score
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Challenge Section */}
      <motion.div
        className="card bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Think you can beat the leaderboard?
          </h3>
          <p className="text-secondary-300 mb-4">
            Submit your most controversial takes and climb the ranks!
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
    </motion.div>
  );
};