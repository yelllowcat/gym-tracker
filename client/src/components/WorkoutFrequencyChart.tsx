import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '../constants/colors';

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
    backgroundColor: Colors.Surface,
    backgroundGradientFrom: Colors.Surface,
    backgroundGradientTo: Colors.Surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Colors.Primary (White) with opacity
    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`, // Colors.TextSecondary
    style: {
      borderRadius: 4,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.SurfaceHighlight,
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
        yAxisLabel=""
        yAxisSuffix=""
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
    borderTopColor: Colors.Separator,
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
