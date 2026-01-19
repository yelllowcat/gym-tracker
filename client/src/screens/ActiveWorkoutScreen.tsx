import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { saveWorkout, Routine } from '../api/client';

type RootStackParamList = {
  ActiveWorkout: { routine: Routine };
};

type ActiveWorkoutRouteProp = RouteProp<RootStackParamList, 'ActiveWorkout'>;

interface WorkoutSet {
  weight: string;
  reps: string;
  rir: string;
  completed: boolean;
}

interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export default function ActiveWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute<ActiveWorkoutRouteProp>();
  const { routine } = route.params;
  const startTime = React.useRef(new Date()).current;

  // Initialize exercises with one empty set each
  const [exercises, setExercises] = useState<WorkoutExercise[]>(
    routine.exercises.map(ex => ({
      name: ex.name,
      sets: [{ weight: '', reps: '', rir: '', completed: false }]
    }))
  );

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ weight: '', reps: '', rir: '', completed: false });
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(newExercises);
  };

  const handleFinish = async () => {
    const endTime = new Date();
    const workoutData = {
      name: routine.name,
      routineId: routine.id,
      startedAt: startTime.toISOString(),
      endedAt: endTime.toISOString(),
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.filter(s => s.completed).map(s => ({
            weight: Number(s.weight),
            reps: Number(s.reps),
            rir: Number(s.rir)
        }))
      }))
    };

    try {
      await saveWorkout(workoutData);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{routine.name}</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: exercise, index: exerciseIndex }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.headerRow}>
              <Text style={styles.colHeader}>W (kg)</Text>
              <Text style={styles.colHeader}>Reps</Text>
              <Text style={styles.colHeader}>RIR</Text>
              <Text style={styles.colHeader}>Done</Text>
            </View>
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'weight', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'reps', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.rir}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'rir', text)}
                />
                <TouchableOpacity
                  style={[styles.checkbox, set.completed && styles.checked]}
                  onPress={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                >
                  {set.completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>
            ))}
            <Button title="Add Set" onPress={() => addSet(exerciseIndex)} />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <Button title="Finish Workout" onPress={handleFinish} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  colHeader: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  checkbox: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4caf50',
  },
  checkmark: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
