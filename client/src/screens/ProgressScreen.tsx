import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchWorkouts } from '../api/client';

export default function ProgressScreen() {
  const [workoutCount, setWorkoutCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const data = await fetchWorkouts();
      setWorkoutCount(data.length);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Coming Soon</Text>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Workouts</Text>
        <Text style={styles.statValue}>{workoutCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  }
});
