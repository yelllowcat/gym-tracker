import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakStatsCardProps {
  currentStreak: number;
  longestStreak: number;
  currentWeekProgress: number;
  weeklyGoal: number;
}

import { Colors } from '../constants/colors';

export default function StreakStatsCard({
  currentStreak,
  longestStreak,
  currentWeekProgress,
  weeklyGoal,
}: StreakStatsCardProps) {
  const progressPercentage = (currentWeekProgress / weeklyGoal) * 100;
  const isGoalMet = currentWeekProgress >= weeklyGoal;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STREAK PROGRESS</Text>

      {/* Current Streak */}
      <View style={styles.streakContainer}>
        <View style={styles.streakBadge}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>
            {currentStreak === 1 ? 'WEEK' : 'WEEKS'}
          </Text>
        </View>
      </View>

      {/* This Week Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>THIS WEEK</Text>
          <Text style={styles.progressText}>
            {currentWeekProgress}/{weeklyGoal} WORKOUTS
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: isGoalMet ? Colors.Primary : Colors.TextSecondary,
                },
              ]}
            />
        </View>

        {isGoalMet && (
          <Text style={styles.goalMetText}>✓ GOAL MET!</Text>
        )}
      </View>

      {/* Longest Streak */}
      {longestStreak > 0 && (
        <View style={styles.bestStreakContainer}>
          <Text style={styles.bestStreakLabel}>PERSONAL BEST</Text>
          <Text style={styles.bestStreakValue}>
            {longestStreak} {longestStreak === 1 ? 'week' : 'weeks'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 4,
    padding: 20,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.TextPrimary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  streakBadge: {
    backgroundColor: Colors.Primary,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 160,
  },
  fireEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.TextInverse,
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.TextInverse,
    letterSpacing: 1,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.TextSecondary,
    letterSpacing: 1,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.TextPrimary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.Background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalMetText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.TextPrimary,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bestStreakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
  bestStreakLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.TextSecondary,
    letterSpacing: 1,
  },
  bestStreakValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.TextPrimary,
  },
});
