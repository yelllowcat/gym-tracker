import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchWorkouts, Workout } from '../api/client';

interface DurationTrendsChartProps {
  timeRange: string;
}

export default function DurationTrendsChart({ timeRange }: DurationTrendsChartProps) {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkouts();
      
      // Filter by time range
      const now = new Date();
      const filtered = data.filter(w => {
        const workoutDate = new Date(w.startedAt);
        const diffDays = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (timeRange) {
          case '7d':
            return diffDays <= 7;
          case '30d':
            return diffDays <= 30;
          case '90d':
            return diffDays <= 90;
          case 'all':
          default:
            return true;
        }
      });

      setWorkouts(filtered.filter(w => w.endedAt)); // Only workouts with duration
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WORKOUT DURATION</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WORKOUT DURATION</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No completed workouts available in this time range.
          </Text>
        </View>
      </View>
    );
  }

  // Calculate durations in minutes
  const durations = workouts.map(w => {
    const start = new Date(w.startedAt).getTime();
    const end = new Date(w.endedAt!).getTime();
    return Math.round((end - start) / 60000); // Convert to minutes
  });

  // Prepare chart data (take last 10 workouts max for readability)
  const recentWorkouts = workouts.slice(-10);
  const recentDurations = durations.slice(-10);

  const labels = recentWorkouts.map((w, i) => {
    const date = new Date(w.startedAt);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    // Show every other label to avoid crowding
    if (recentWorkouts.length > 7 && i % 2 !== 0) {
      return '';
    }
    return `${month} ${day}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: recentDurations,
        strokeWidth: 2,
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
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#000',
      fill: '#FFF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F2F2F7',
      strokeWidth: 1,
    },
  };

  const screenWidth = Dimensions.get('window').width - 48;

  const avgDuration = Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORKOUT DURATION</Text>
      <Text style={styles.subtitle}>Time spent per session</Text>

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
        yAxisSuffix="m"
        fromZero={false}
      />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>AVERAGE</Text>
          <Text style={styles.statValue}>{avgDuration}m</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SHORTEST</Text>
          <Text style={styles.statValue}>{minDuration}m</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LONGEST</Text>
          <Text style={styles.statValue}>{maxDuration}m</Text>
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
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
