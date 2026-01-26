import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CalendarDay } from '../api/client';

interface StreakCalendarProps {
  calendarData: CalendarDay[];
  onDayPress?: (date: string) => void;
}

import { Colors } from '../constants/colors';

export default function StreakCalendar({ calendarData, onDayPress }: StreakCalendarProps) {
  if (calendarData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WORKOUT CALENDAR</Text>
        <Text style={styles.emptyText}>No workout data to display yet.</Text>
      </View>
    );
  }

  // Get intensity color
  const getIntensityColor = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return Colors.Surface; // Very light gray (was #F2F2F7) -> now Surface
      case 1:
        return '#3A3A3C'; // Light gray -> Dark gray
      case 2:
        return '#636366'; // Medium gray
      case 3:
        return '#8E8E93'; // Dark gray -> Light gray
      case 4:
        return Colors.Primary; // Black -> White
      default:
        return Colors.Surface;
    }
  };

  // Group calendar data by weeks (7 days each)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  // Get day labels (Mon, Tue, Wed, etc.)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Get today's date for highlighting
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORKOUT CALENDAR</Text>
      <Text style={styles.subtitle}>Last 12 weeks</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        <View style={styles.calendarGrid}>
          {/* Day labels column */}
          <View style={styles.dayLabelsColumn}>
            <View style={styles.cornerCell} />
            {dayLabels.map((label, index) => (
              <View key={index} style={styles.dayLabelCell}>
                <Text style={styles.dayLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Calendar weeks */}
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekColumn}>
              {/* Week number header */}
              <View style={styles.weekHeaderCell}>
                <Text style={styles.weekLabel}>W{weekIndex + 1}</Text>
              </View>

              {/* Days in the week */}
              {week.map((day, dayIndex) => {
                const isToday = day.date === today;
                
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.dayCell,
                      { backgroundColor: getIntensityColor(day.intensity) },
                      isToday && styles.todayCell,
                    ]}
                    onPress={() => onDayPress && onDayPress(day.date)}
                    activeOpacity={0.7}
                  >
                    {isToday && <View style={styles.todayIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>LESS</Text>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <View
            key={intensity}
            style={[
              styles.legendCell,
              { backgroundColor: getIntensityColor(intensity) },
            ]}
          />
        ))}
        <Text style={styles.legendLabel}>MORE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 4,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.TextPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.TextSecondary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.TextSecondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  scrollContainer: {
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
  },
  dayLabelsColumn: {
    marginRight: 4,
  },
  cornerCell: {
    width: 20,
    height: 20,
    marginBottom: 2,
  },
  dayLabelCell: {
    width: 20,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.TextSecondary,
  },
  weekColumn: {
    marginRight: 2,
  },
  weekHeaderCell: {
    width: 14,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  weekLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.TextSecondary,
  },
  dayCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    borderColor: Colors.TextPrimary,
    borderWidth: 1.5,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.TextInverse,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.TextSecondary,
    marginHorizontal: 6,
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
});
