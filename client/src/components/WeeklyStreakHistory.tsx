import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WeekData } from '../api/client';

interface WeeklyStreakHistoryProps {
  weeklyHistory: WeekData[];
  weeklyGoal: number;
}

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
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 16,
  },
  weekItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
    color: '#000',
    marginBottom: 2,
  },
  workoutCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusContainer: {
    marginLeft: 12,
  },
  checkMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  crossMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossMarkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
  },
  toggleButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3A3A3C',
    letterSpacing: 0.5,
  },
});
