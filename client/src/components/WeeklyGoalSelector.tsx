import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface WeeklyGoalSelectorProps {
  currentGoal: number;
  onSelectGoal: (goal: number) => void;
}

import { Colors } from '../constants/colors';

export default function WeeklyGoalSelector({ currentGoal, onSelectGoal }: WeeklyGoalSelectorProps) {
  const goalOptions = [2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>WEEKLY GOAL</Text>
      <View style={styles.optionsContainer}>
        {goalOptions.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.optionButton,
              currentGoal === goal && styles.optionButtonSelected,
            ]}
            onPress={() => onSelectGoal(goal)}
          >
            <Text
              style={[
                styles.optionText,
                currentGoal === goal && styles.optionTextSelected,
              ]}
            >
              {goal}
            </Text>
            <Text
              style={[
                styles.optionSubtext,
                currentGoal === goal && styles.optionSubtextSelected,
              ]}
            >
              {goal === 1 ? 'workout' : 'workouts'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.TextSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: Colors.Surface,
  },
  optionButtonSelected: {
    backgroundColor: Colors.Primary,
    borderColor: Colors.Primary,
  },
  optionText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.TextPrimary,
    marginBottom: 2,
  },
  optionTextSelected: {
    color: Colors.TextInverse,
  },
  optionSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.TextSecondary,
    textTransform: 'uppercase',
  },
  optionSubtextSelected: {
    color: Colors.TextInverse,
  },
});
