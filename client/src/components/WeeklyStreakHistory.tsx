import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WeekData } from '../api/client';

interface WeeklyStreakHistoryProps {
  weeklyHistory: WeekData[];
  weeklyGoal: number;
}

import { Colors } from '../constants/colors';

export default function WeeklyStreakHistory({ weeklyHistory, weeklyGoal }: WeeklyStreakHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (weeklyHistory.length === 0) {
    return null;
  }

  // Show first 4 weeks by default, all when expanded
  const displayedWeeks = expanded ? weeklyHistory : weeklyHistory.slice(0, 4);
  const hasMore = weeklyHistory.length > 4;

  // Format week range (e.g., "Jan 13-19")
  const formatWeekRange = (weekStartDate: string): string => {
    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WEEKLY HISTORY</Text>
      <Text style={styles.subtitle}>Goal: {weeklyGoal} workouts per week</Text>

      {displayedWeeks.map((week, index) => (
        <View
          key={week.weekStartDate}
          style={[
            styles.weekItem,
            index === displayedWeeks.length - 1 && styles.lastItem,
          ]}
        >
          <View style={styles.weekInfo}>
            <Text style={styles.weekRange}>{formatWeekRange(week.weekStartDate)}</Text>
            <Text style={styles.workoutCount}>
              {week.workoutCount} {week.workoutCount === 1 ? 'workout' : 'workouts'}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            {week.metGoal ? (
              <View style={styles.checkMark}>
                <Text style={styles.checkMarkText}>✓</Text>
              </View>
            ) : (
              <View style={styles.crossMark}>
                <Text style={styles.crossMarkText}>✗</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      {hasMore && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.toggleButtonText}>
            {expanded ? 'SHOW LESS' : `SHOW ALL (${weeklyHistory.length})`}
          </Text>
        </TouchableOpacity>
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
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.TextPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.TextSecondary,
    marginBottom: 16,
  },
  weekItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  weekInfo: {
    flex: 1,
  },
  weekRange: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TextPrimary,
    marginBottom: 2,
  },
  workoutCount: {
    fontSize: 12,
    color: Colors.TextSecondary,
  },
  statusContainer: {
    marginLeft: 12,
  },
  checkMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.Primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.TextInverse,
  },
  crossMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossMarkText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TextSecondary,
  },
  toggleButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.TextSecondary,
    letterSpacing: 0.5,
  },
});
