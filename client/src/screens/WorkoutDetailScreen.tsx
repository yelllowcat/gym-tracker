import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Workout } from '../api/client';
import { useStorage } from '../contexts/StorageContext';

type RootStackParamList = {
  WorkoutDetail: { workoutId: string };
};

type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

export default function WorkoutDetailScreen() {
  const route = useRoute<WorkoutDetailRouteProp>();
  const { storageProvider } = useStorage();
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const data = await storageProvider.getWorkout(workoutId);
      setWorkout(data);
    } catch (error) {
      console.error('Failed to fetch workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  };

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} MINUTES`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>WORKOUT NOT FOUND.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>{workout.name.toUpperCase()}</Text>
        <Text style={styles.date}>{formatDate(workout.startedAt)}</Text>
        <View style={styles.divider} />
        <Text style={styles.duration}>TOTAL TIME: {formatDuration(workout.startedAt, workout.endedAt)}</Text>
      </View>

      {workout.exercises?.map((exercise, index) => (
        <View key={index} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{exercise.name.toUpperCase()}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>SET</Text>
              <Text style={styles.headerCell}>KG</Text>
              <Text style={styles.headerCell}>REPS</Text>
              <Text style={styles.headerCell}>RIR</Text>
            </View>
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={[styles.row, setIndex % 2 === 1 && styles.alternateRow]}>
                <Text style={styles.cell}>{setIndex + 1}</Text>
                <Text style={styles.cell}>{set.weight}</Text>
                <Text style={styles.cell}>{set.reps}</Text>
                <Text style={styles.cell}>{set.rir ?? '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 16,
  },
  divider: {
    height: 4,
    width: 40,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  duration: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1.5,
  },
  exerciseCard: {
    marginBottom: 32,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
    letterSpacing: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  alternateRow: {
    backgroundColor: '#F9F9FB',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
});
