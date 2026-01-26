import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routine } from '../api/client';
import { useStorage } from '../contexts/StorageContext';

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

import { Colors } from '../constants/colors';

export default function ActiveWorkoutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<ActiveWorkoutRouteProp>();
  const { storageProvider } = useStorage();
  const { routine } = route.params;
  const startTime = React.useRef(new Date()).current;
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    const currentSet = { ...newExercises[exerciseIndex].sets[setIndex], [field]: value };
    
    // Auto-complete if all fields are filled
    if (field !== 'completed') {
      const { weight, reps, rir } = currentSet;
      currentSet.completed = !!(weight && reps && rir);
    }

    newExercises[exerciseIndex].sets[setIndex] = currentSet;
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
      await storageProvider.saveWorkout(workoutData);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
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
            </View>

            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={[styles.setRow, set.completed && styles.completedRow]}>
                <Text style={[styles.setText, { flex: 0.8 }]}>{setIndex + 1}</Text>
                
                <TextInput
                  placeholderTextColor={Colors.TextSecondary}
                  style={[
                    styles.input,
                    focusedField === `${exerciseIndex}-${setIndex}-weight` && styles.inputFocused
                  ]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'weight', text)}
                  onFocus={() => setFocusedField(`${exerciseIndex}-${setIndex}-weight`)}
                  onBlur={() => setFocusedField(null)}
                />
                
                <TextInput
                  placeholderTextColor={Colors.TextSecondary}
                  style={[
                    styles.input,
                    focusedField === `${exerciseIndex}-${setIndex}-reps` && styles.inputFocused
                  ]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'reps', text)}
                  onFocus={() => setFocusedField(`${exerciseIndex}-${setIndex}-reps`)}
                  onBlur={() => setFocusedField(null)}
                />
                
                <TextInput
                  placeholderTextColor={Colors.TextSecondary}
                  style={[
                    styles.input,
                    focusedField === `${exerciseIndex}-${setIndex}-rir` && styles.inputFocused
                  ]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.rir}
                  onChangeText={(text) => updateSet(exerciseIndex, setIndex, 'rir', text)}
                  onFocus={() => setFocusedField(`${exerciseIndex}-${setIndex}-rir`)}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exerciseIndex)}>
              <Text style={styles.addSetText}>+ ADD SET</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 60 }]}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  finishText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.TextPrimary,
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
    color: Colors.TextPrimary,
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
    color: Colors.TextSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Surface,
  },
  completedRow: {
    backgroundColor: Colors.Surface,
    borderRadius: 4,
  },
  setText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.TextPrimary,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TextPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  inputFocused: {
    borderColor: Colors.Primary,
    backgroundColor: Colors.SurfaceHighlight,
  },
  checkButton: {
    height: 32,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Background,
  },
  checkButtonActive: {
    backgroundColor: Colors.Primary,
    borderColor: Colors.Primary,
  },
  checkMarkText: {
    color: Colors.TextInverse,
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
    borderColor: Colors.Border,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  addSetText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.TextSecondary,
    letterSpacing: 1,
  },
});
