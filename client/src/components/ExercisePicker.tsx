import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { ExerciseStat } from '../api/client';

interface ExercisePickerProps {
  exercises: ExerciseStat[];
  selectedExercises: string[];
  onSelect: (exerciseName: string) => void;
  onRemove: (exerciseName: string) => void;
  maxSelections?: number;
}

export default function ExercisePicker({
  exercises,
  selectedExercises,
  onSelect,
  onRemove,
  maxSelections = 5,
}: ExercisePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const availableExercises = exercises.filter(
    (ex) => !selectedExercises.includes(ex.exerciseName)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>TRACKED EXERCISES</Text>
        {selectedExercises.length < maxSelections && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.addButton}>+ ADD</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedExercises.length === 0 ? (
        <Text style={styles.emptyText}>No exercises selected. Tap + ADD to track exercises.</Text>
      ) : (
        <View style={styles.pillContainer}>
          {selectedExercises.map((exerciseName) => (
            <View key={exerciseName} style={styles.pill}>
              <Text style={styles.pillText}>{exerciseName}</Text>
              <TouchableOpacity
                onPress={() => onRemove(exerciseName)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.removeButton}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT EXERCISE</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>CLOSE</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {availableExercises.length === 0 ? (
                <Text style={styles.emptyText}>All exercises are already selected.</Text>
              ) : (
                availableExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.exerciseName}
                    style={styles.exerciseItem}
                    onPress={() => {
                      onSelect(exercise.exerciseName);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    <Text style={styles.exerciseStats}>
                      {exercise.totalSets} sets · Max {exercise.maxWeight}kg
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  addButton: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 6,
  },
  removeButton: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  modalClose: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  modalList: {
    padding: 20,
  },
  exerciseItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  exerciseStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
