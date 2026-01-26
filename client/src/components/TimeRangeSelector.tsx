import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type TimeRange = '7d' | '30d' | '90d' | 'all';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

import { Colors } from '../constants/colors';

export default function TimeRangeSelector({ selected, onSelect }: TimeRangeSelectorProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'ALL' },
  ];

  return (
    <View style={styles.container}>
      {ranges.map((range) => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.button,
            selected === range.value && styles.buttonSelected,
          ]}
          onPress={() => onSelect(range.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selected === range.value && styles.buttonTextSelected,
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.Border,
    backgroundColor: Colors.Surface,
    marginHorizontal: 4,
    borderRadius: 2,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: Colors.Primary,
    borderColor: Colors.Primary,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.TextPrimary,
    letterSpacing: 1,
  },
  buttonTextSelected: {
    color: Colors.TextInverse,
  },
});
