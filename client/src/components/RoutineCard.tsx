import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Routine } from '../api/client';
import { Colors } from '../constants/colors';

interface RoutineCardProps {
  routine: Routine;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onStart?: (routine: Routine) => void;
}

export default function RoutineCard({ routine, onDelete, onEdit, onStart }: RoutineCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{routine.name.toUpperCase()}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit && onEdit(routine.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.actionButton}
          >
            <Text style={styles.editText}>EDIT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete && onDelete(routine.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.exerciseList}>
        {routine.exercises.map((ex, index) => (
          <Text key={index} style={styles.exercise}>
            {ex.name} <Text style={styles.exerciseDetails}>({ex.targetSets}x{ex.targetReps})</Text>
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onStart && onStart(routine)}
      >
        <Text style={styles.startButtonText}>START WORKOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.Surface,
    padding: 20,
    marginVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.TextPrimary,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  editText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.TextPrimary,
    letterSpacing: 0.5,
  },
  deleteText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.TextSecondary,
    letterSpacing: 0.5,
  },
  exerciseList: {
    marginBottom: 20,
  },
  exercise: {
    fontSize: 15,
    color: Colors.TextPrimary,
    marginBottom: 4,
    fontWeight: '500',
  },
  exerciseDetails: {
    color: Colors.TextSecondary,
    fontSize: 13,
  },
  startButton: {
    backgroundColor: Colors.Primary,
    paddingVertical: 14,
    borderRadius: 2,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
