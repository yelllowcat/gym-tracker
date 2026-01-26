import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Workout } from '../api/client';
import { useStorage } from '../contexts/StorageContext';

type RootStackParamList = {
  WorkoutDetail: { workoutId: string };
};

import { Colors } from '../constants/colors';

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { storageProvider } = useStorage();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      const data = await storageProvider.getWorkouts();
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
    return `${diffMins} MIN`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
        <Text style={styles.duration}>{formatDuration(item.startedAt, item.endedAt)}</Text>
      </View>
      <Text style={styles.name}>{item.name.toUpperCase()}</Text>
      <Text style={styles.exercisesCount}>
        {item._count?.exercises ?? item.exercises?.length ?? 0} EXERCISES COMPLETED
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HISTORY</Text>
      </View>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>NO WORKOUTS RECORDED YET.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    color: Colors.TextPrimary,
  },
  list: {
    padding: 24,
  },
  card: {
    backgroundColor: Colors.Surface,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Border,
    borderBottomColor: Colors.Border,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    color: Colors.TextPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  duration: {
    color: Colors.TextSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.TextPrimary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  exercisesCount: {
    color: Colors.TextSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.TextSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  }
});
