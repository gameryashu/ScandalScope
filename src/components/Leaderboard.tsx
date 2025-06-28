import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Flame, Shield, Users, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { LeaderboardPlaceholder } from '@/components/LeaderboardPlaceholder';
import { Button } from '@/components/ui/Button';

export const Leaderboard: React.FC = () => {
  const { leaderboard, setLeaderboard, user } = useStore();

  useEffect(() => {
    // For now, we'll show the placeholder component
    // In the future, this would fetch real leaderboard data
    setLeaderboard([]);
  }, [setLeaderboard]);

  // Show placeholder for now since we don't have real user data yet
  return <LeaderboardPlaceholder />;
};