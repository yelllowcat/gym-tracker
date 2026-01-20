import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{routine.name.toUpperCase()}</Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.finishText}>FINISH</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: exercise, index: exerciseIndex }) => (
          <View style={styles.exerciseSection}>
            <Text style={styles.exerciseName}>{exercise.name.toUpperCase()}</Text>
            
            <View style={styles.gridHeader}>
              <Text style={[styles.colLabel, { flex: 0.8 }]}>SET</Text>
              <Text style={styles.colLabel}>KG</Text>
              <Text style={styles.colLabel}>REPS</Text>
              <Text style={styles.colLabel}>RIR</Text>
              <Text style={[styles.colLabel, { flex: 0.8 }]}>DONE</Text>
            </View>

            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={[styles.setRow, set.completed && styles.completedRow]}>
                <Text style={[styles.setText, { flex: 0.8 }]}>{setIndex + 1}</Text>
                
                <TextInput
                  placeholderTextColor="#D1D1D6"
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'weight', text)}
                />
                
                <TextInput
                  placeholderTextColor="#D1D1D6"
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'reps', text)}
                />
                
                <TextInput
                  placeholderTextColor="#D1D1D6"
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.rir}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'rir', text)}
                />

                <TouchableOpacity
                  style={[styles.checkButton, set.completed && styles.checkButtonActive, { flex: 0.8 }]}
                  onPress={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                >
                  {set.completed ? (
                    <Text style={styles.checkMarkText}>✓</Text>
                  ) : (
                    <View style={styles.checkMarkPlaceholder} />
                  )}
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exerciseIndex)}>
              <Text style={styles.addSetText}>+ ADD SET</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#000',
  },
  finishText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  list: {
    padding: 24,
    paddingBottom: 60,
  },
  exerciseSection: {
    marginBottom: 40,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 20,
    letterSpacing: 1,
  },
  gridHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  colLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  completedRow: {
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
  },
  setText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  checkButton: {
    height: 32,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  checkMarkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  checkMarkPlaceholder: {
    width: 10,
    height: 10,
  },
  addSetButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  addSetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1,
  },
});
