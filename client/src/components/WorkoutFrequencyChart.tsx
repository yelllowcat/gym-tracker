import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface WorkoutFrequencyChartProps {
  workoutsByWeek: { week: string; count: number }[];
}

export default function WorkoutFrequencyChart({ workoutsByWeek }: WorkoutFrequencyChartProps) {
  if (workoutsByWeek.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WORKOUT FREQUENCY</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No workout data available. Complete workouts to see frequency trends.
          </Text>
        </View>
      </View>
    );
  }

  // Take last 8 weeks max for readability
  const recentWeeks = workoutsByWeek.slice(-8);

  const chartData = {
    labels: recentWeeks.map(w => w.week.replace('Week ', 'W')),
    datasets: [
      {
        data: recentWeeks.map(w => w.count),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
    style: {
      borderRadius: 4,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F2F2F7',
      strokeWidth: 1,
    },
    barPercentage: 0.6,
  };

  const screenWidth = Dimensions.get('window').width - 48;

  const totalWorkouts = recentWeeks.reduce((sum, w) => sum + w.count, 0);
  const avgPerWeek = Math.round((totalWorkouts / recentWeeks.length) * 10) / 10;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORKOUT FREQUENCY</Text>
      <Text style={styles.subtitle}>Workouts per week</Text>

      <BarChart
        data={chartData}
        width={screenWidth}
        height={200}
        chartConfig={chartConfig}
        style={styles.chart}
        withInnerLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
        showValuesOnTopOfBars={true}
        flatColor={true}
      />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>AVG/WEEK</Text>
          <Text style={styles.statValue}>{avgPerWeek}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TOTAL</Text>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>WEEKS</Text>
          <Text style={styles.statValue}>{recentWeeks.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
