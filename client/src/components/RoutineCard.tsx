import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Routine } from '../api/client';

interface RoutineCardProps {
  routine: Routine;
  onDelete?: (id: string) => void;
  onStart?: (routine: Routine) => void;
}

export default function RoutineCard({ routine, onDelete, onStart }: RoutineCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{routine.name}</Text>
      <View style={styles.exerciseList}>
        {routine.exercises.map((ex, index) => (
          <Text key={index} style={styles.exercise}>
            • {ex.name}
          </Text>
        ))}
      </View>
      <View style={styles.actions}>
        <Button title="Start" onPress={() => onStart && onStart(routine)} />
        <View style={{ width: 10 }} />
        <Button
          title="Delete"
          color="red"
          onPress={() => onDelete && onDelete(routine.id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseList: {
    marginBottom: 12,
  },
  exercise: {
    fontSize: 14,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
