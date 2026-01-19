import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchWorkouts, Workout } from '../api/client';

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      const data = await fetchWorkouts();
      // Sort by date descending
      data.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      setWorkouts(data);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    }
  };

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => console.log('Workout details:', item)}
    >
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
        <Text style={styles.duration}>{formatDuration(item.startedAt, item.endedAt)}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.exercises}>{item.exercises.length} Exercises</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No workouts recorded yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    color: '#666',
    fontSize: 14,
  },
  duration: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exercises: {
    color: '#888',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  }
});
