import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchExerciseHistory, ExerciseHistory } from '../api/client';

interface ExerciseProgressChartProps {
  exerciseName: string;
  timeRange: string;
}

import { Colors } from '../constants/colors';

export default function ExerciseProgressChart({ exerciseName, timeRange }: ExerciseProgressChartProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExerciseHistory | null>(null);

  useEffect(() => {
    loadData();
  }, [exerciseName, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const history = await fetchExerciseHistory(exerciseName, timeRange);
      setData(history);
    } catch (error) {
      console.error('Failed to load exercise history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{exerciseName.toUpperCase()}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      </View>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{exerciseName.toUpperCase()}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available for this exercise in the selected time range.</Text>
        </View>
      </View>
    );
  }

  // Prepare chart data
  const weights = data.history.map(d => d.maxWeight);
  const labels = data.history.map((d, i) => {
    const date = new Date(d.date);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    // Show every nth label to avoid crowding
    if (data.history.length > 7 && i % Math.ceil(data.history.length / 7) !== 0) {
      return '';
    }
    return `${month} ${day}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: weights,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.Surface,
    backgroundGradientFrom: Colors.Surface,
    backgroundGradientTo: Colors.Surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
    style: {
      borderRadius: 4,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.TextPrimary,
      fill: Colors.Surface,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.Border,
      strokeWidth: 1,
    },
  };

  const screenWidth = Dimensions.get('window').width - 48; // Account for padding

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{exerciseName.toUpperCase()}</Text>
        {data.personalRecord && (
          <View style={styles.prBadge}>
            <Text style={styles.prLabel}>PR</Text>
            <Text style={styles.prValue}>{data.personalRecord.weight}kg</Text>
          </View>
        )}
      </View>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        yAxisSuffix="kg"
        fromZero={false}
      />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>AVG WEIGHT</Text>
          <Text style={styles.statValue}>
            {Math.round(data.history.reduce((sum, d) => sum + d.avgWeight, 0) / data.history.length)}kg
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SESSIONS</Text>
          <Text style={styles.statValue}>{data.history.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TOTAL REPS</Text>
          <Text style={styles.statValue}>
            {data.history.reduce((sum, d) => sum + d.totalReps, 0)}
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.TextPrimary,
    letterSpacing: 1,
  },
  prBadge: {
    backgroundColor: Colors.Primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.TextInverse,
    letterSpacing: 0.5,
    marginRight: 6,
  },
  prValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.TextInverse,
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
    borderTopColor: Colors.Border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.TextSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TextPrimary,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.TextSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
