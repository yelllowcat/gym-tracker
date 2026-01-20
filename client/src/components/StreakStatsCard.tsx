import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakStatsCardProps {
  currentStreak: number;
  longestStreak: number;
  currentWeekProgress: number;
  weeklyGoal: number;
}

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
                backgroundColor: isGoalMet ? '#000' : '#8E8E93',
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
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
    padding: 20,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 20,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  streakBadge: {
    backgroundColor: '#000',
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
    color: '#FFF',
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
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
    color: '#8E8E93',
    letterSpacing: 1,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F2F2F7',
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
    color: '#000',
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
    borderTopColor: '#F2F2F7',
  },
  bestStreakLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  bestStreakValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});
