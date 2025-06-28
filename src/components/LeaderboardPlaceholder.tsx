import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Flame, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  roastCount: number;
  averageIntensity: number;
  favoriteMode: string;
  streak: number;
  rank: number;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'RoastMaster3000',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    roastCount: 247,
    averageIntensity: 8.5,
    favoriteMode: 'savage',
    streak: 15,
    rank: 1,
  },
  {
    id: '2',
    username: 'GenZRoaster',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    roastCount: 189,
    averageIntensity: 7.2,
    favoriteMode: 'genz',
    streak: 8,
    rank: 2,
  },
  {
    id: '3',
    username: 'TherapistBurns',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    roastCount: 156,
    averageIntensity: 4.8,
    favoriteMode: 'therapist',
    streak: 22,
    rank: 3,
  },
  {
    id: '4',
    username: 'HRNightmare',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    roastCount: 134,
    averageIntensity: 3.2,
    favoriteMode: 'hr',
    streak: 5,
    rank: 4,
  },
  {
    id: '5',
    username: 'FriendlyFire',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    roastCount: 98,
    averageIntensity: 5.5,
    favoriteMode: 'friendly',
    streak: 12,
    rank: 5,
  },
];

export const LeaderboardPlaceholder: React.FC = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getModeColor = (mode: string) => {
    const colors = {
      savage: 'from-red-500 to-orange-600',
      genz: 'from-pink-500 to-purple-600',
      therapist: 'from-green-500 to-teal-600',
      hr: 'from-blue-500 to-indigo-600',
      friendly: 'from-yellow-500 to-orange-500',
    };
    return colors[mode as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Roast Leaderboard
        </h1>
        <p className="text-gray-300 text-lg">
          Top roasters and their legendary burns
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
          <Flame className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-400">1,247</div>
          <div className="text-sm text-gray-400">Total Roasts</div>
        </motion.div>

        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">156</div>
          <div className="text-sm text-gray-400">Active Roasters</div>
        </motion.div>

        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-400">6.8</div>
          <div className="text-sm text-gray-400">Avg Intensity</div>
        </motion.div>
      </div>

      {/* Leaderboard */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
          Top Roasters This Week
        </h2>

        <div className="space-y-4">
          {mockLeaderboardData.map((user, index) => (
            <motion.div
              key={user.id}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]',
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30' 
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/30'
                  : 'bg-gray-700/30 border-gray-600/30'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>

                {/* Avatar */}
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border-2 border-gray-600"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {user.username}
                    </h3>
                    <Badge
                      variant="default"
                      size="sm"
                      className={cn(
                        'text-xs',
                        `bg-gradient-to-r ${getModeColor(user.favoriteMode)}`
                      )}
                    >
                      {user.favoriteMode}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{user.roastCount} roasts</span>
                    <span>Intensity: {user.averageIntensity}/10</span>
                    <span className="flex items-center space-x-1">
                      <Flame className="h-3 w-3" />
                      <span>{user.streak} streak</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">
                    {user.roastCount}
                  </div>
                  <div className="text-xs text-gray-400">
                    Total Roasts
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Join Challenge */}
      <motion.div
        className="card bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">
          Ready to Join the Leaderboard?
        </h3>
        <p className="text-gray-300 mb-4">
          Start roasting and climb your way to the top! Generate your first roast to get started.
        </p>
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Start Roasting
        </motion.button>
      </motion.div>
    </div>
  );
};