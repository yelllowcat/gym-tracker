import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExerciseStat } from '../api/client';

interface PersonalRecordsCardProps {
  exercises: ExerciseStat[];
  maxRecords?: number;
}

import { Colors } from '../constants/colors';

export default function PersonalRecordsCard({ exercises, maxRecords = 5 }: PersonalRecordsCardProps) {
  // Sort by max weight descending and take top records
  const topRecords = exercises
    .slice()
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, maxRecords);

  if (topRecords.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>PERSONAL RECORDS</Text>
        <Text style={styles.emptyText}>
          Complete workouts to track your personal records.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PERSONAL RECORDS</Text>
      <Text style={styles.subtitle}>Top {topRecords.length} exercises by max weight</Text>

      {topRecords.map((exercise, index) => {
        const lastPerformedDate = new Date(exercise.lastPerformed);
        const formattedDate = lastPerformedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <View key={exercise.exerciseName} style={styles.recordItem}>
            <View style={styles.recordRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.recordInfo}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <Text style={styles.recordDate}>Last performed: {formattedDate}</Text>
            </View>
            <View style={styles.recordWeight}>
              <Text style={styles.weightValue}>{exercise.maxWeight}</Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>
        );
      })}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.TextSecondary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.TextSecondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  recordRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.Primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.TextInverse,
  },
  recordInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.TextPrimary,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 11,
    color: Colors.TextSecondary,
  },
  recordWeight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.TextPrimary,
  },
  weightUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.TextSecondary,
    marginLeft: 2,
  },
});
