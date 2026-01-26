import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorage } from '../contexts/StorageContext';

interface ExerciseInput {
  name: string;
  targetSets: string;
  targetReps: string;
}

import { Colors } from '../constants/colors';

export default function CreateRoutineScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { storageProvider } = useStorage();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: '', targetSets: '3', targetReps: '10' }
  ]);

  const addExercise = () => {
    setExercises([...exercises, { name: '', targetSets: '3', targetReps: '10' }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length === 1) {
      Alert.alert('Error', 'At least one exercise is required');
      return;
    }
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: keyof ExerciseInput, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Routine name is required');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim() !== '');
    if (validExercises.length === 0) {
      Alert.alert('Error', 'Add at least one exercise with a name');
      return;
    }

    try {
      const routineData = {
        name: name.trim(),
        exercises: validExercises.map(ex => ({
          name: ex.name.trim(),
          targetSets: parseInt(ex.targetSets) || 3,
          targetReps: parseInt(ex.targetReps) || 10
        }))
      };

      await storageProvider.createRoutine(routineData);
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to create routine:', error);
      const errorMessage = error.response?.data?.error || error.message || JSON.stringify(error);
      Alert.alert('Error', `Failed to save: ${errorMessage}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>ROUTINE NAME</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. UPPER BODY"
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors.TextSecondary}
        />

        <Text style={styles.sectionTitle}>EXERCISES</Text>
        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.exerciseNumber}>EXERCISE #{index + 1}</Text>
              <TouchableOpacity onPress={() => removeExercise(index)}>
                <Text style={styles.removeText}>REMOVE</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="NAME"
              value={exercise.name}
              onChangeText={(val) => updateExercise(index, 'name', val)}
              placeholderTextColor={Colors.TextSecondary}
            />

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.subLabel}>TARGET SETS</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={exercise.targetSets}
                  onChangeText={(val) => updateExercise(index, 'targetSets', val)}
                  placeholderTextColor={Colors.TextSecondary}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.subLabel}>TARGET REPS</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={exercise.targetReps}
                  onChangeText={(val) => updateExercise(index, 'targetReps', val)}
                  placeholderTextColor={Colors.TextSecondary}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addExercise}>
          <Text style={styles.addButtonText}>+ ADD EXERCISE</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>SAVE ROUTINE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 12,
    color: Colors.TextPrimary,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 32,
    marginBottom: 16,
    color: Colors.TextPrimary,
    letterSpacing: 1,
    borderBottomWidth: 2,
    borderBottomColor: Colors.TextPrimary,
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  mainInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.TextPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 2,
    padding: 12,
    fontSize: 14,
    color: Colors.TextPrimary,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.TextSecondary,
  },
  removeText: {
    color: Colors.TextSecondary,
    fontWeight: '800',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  field: {
    flex: 0.48,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.TextSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  addButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  addButtonText: {
    color: Colors.TextSecondary,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.Background,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
  saveButton: {
    backgroundColor: Colors.Primary,
    paddingVertical: 16,
    borderRadius: 2,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.TextInverse,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
