import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AnalyticsStats, StreakData } from '../api/client';
import { useStorage } from '../contexts/StorageContext';
import { getWeeklyGoal, setWeeklyGoal } from '../utils/storage';
import TimeRangeSelector, { TimeRange } from '../components/TimeRangeSelector';
import ExercisePicker from '../components/ExercisePicker';
import ExerciseProgressChart from '../components/ExerciseProgressChart';
import PersonalRecordsCard from '../components/PersonalRecordsCard';
import WorkoutFrequencyChart from '../components/WorkoutFrequencyChart';
import DurationTrendsChart from '../components/DurationTrendsChart';
import StreakStatsCard from '../components/StreakStatsCard';
import StreakCalendar from '../components/StreakCalendar';
import WeeklyStreakHistory from '../components/WeeklyStreakHistory';
import WeeklyGoalSelector from '../components/WeeklyGoalSelector';

export default function ProgressScreen() {
  const { storageProvider } = useStorage();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [weeklyGoal, setWeeklyGoalState] = useState(3);

  // Load weekly goal from storage on mount
  useEffect(() => {
    loadWeeklyGoal();
  }, []);

  const loadWeeklyGoal = async () => {
    const savedGoal = await getWeeklyGoal();
    setWeeklyGoalState(savedGoal);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [timeRange, weeklyGoal])
  );

  const loadStats = async () => {
    setLoading(true);
    try {
      const [analyticsData, streakInfo] = await Promise.all([
        storageProvider.getAnalytics(timeRange),
        storageProvider.getStreakData(weeklyGoal),
      ]);
      
      setStats(analyticsData);
      setStreakData(streakInfo);

      // Auto-select top 3 exercises if none selected
      if (selectedExercises.length === 0 && analyticsData.exerciseStats.length > 0) {
        const topThree = analyticsData.exerciseStats
          .slice(0, 3)
          .map(ex => ex.exerciseName);
        setSelectedExercises(topThree);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exerciseName: string) => {
    setSelectedExercises([...selectedExercises, exerciseName]);
  };

  const handleRemoveExercise = (exerciseName: string) => {
    setSelectedExercises(selectedExercises.filter(e => e !== exerciseName));
  };

  const handleChangeWeeklyGoal = async (newGoal: number) => {
    try {
      await setWeeklyGoal(newGoal);
      setWeeklyGoalState(newGoal);
      // Reload streak data with new goal
      loadStats();
    } catch (error) {
      console.error('Failed to save weekly goal:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PROGRESS</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>LOADING ANALYTICS...</Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PROGRESS</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Unable to load analytics. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROGRESS</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />

        {/* Stats Overview */}
        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TOTAL SESSIONS</Text>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVG DURATION</Text>
            <Text style={styles.statValue}>{stats.avgDuration}m</Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={[styles.statBox, { backgroundColor: '#000' }]}>
            <Text style={[styles.statLabel, { color: '#8E8E93' }]}>TOTAL VOLUME</Text>
            <Text style={[styles.statValue, { color: '#FFF', fontSize: 28 }]}>
              {(stats.totalVolume / 1000).toFixed(1)}k
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>EXERCISES</Text>
            <Text style={styles.statValue}>{stats.exerciseStats.length}</Text>
          </View>
        </View>

        {/* Weekly Goal Selector */}
        <WeeklyGoalSelector
          currentGoal={weeklyGoal}
          onSelectGoal={handleChangeWeeklyGoal}
        />

        {/* Streak Stats Card */}
        {streakData && (
          <StreakStatsCard
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            currentWeekProgress={streakData.currentWeekProgress}
            weeklyGoal={streakData.weeklyGoal}
          />
        )}

        {/* Streak Calendar */}
        {streakData && streakData.calendarData.length > 0 && (
          <StreakCalendar calendarData={streakData.calendarData} />
        )}

        {/* Personal Records */}
        {stats.exerciseStats.length > 0 && (
          <PersonalRecordsCard exercises={stats.exerciseStats} maxRecords={5} />
        )}

        {/* Exercise Picker */}
        {stats.exerciseStats.length > 0 && (
          <ExercisePicker
            exercises={stats.exerciseStats}
            selectedExercises={selectedExercises}
            onSelect={handleAddExercise}
            onRemove={handleRemoveExercise}
            maxSelections={5}
          />
        )}

        {/* Exercise Progress Charts */}
        {selectedExercises.map(exerciseName => (
          <ExerciseProgressChart
            key={exerciseName}
            exerciseName={exerciseName}
            timeRange={timeRange}
          />
        ))}

        {/* Workout Frequency Chart */}
        {stats.workoutsByWeek.length > 0 && (
          <WorkoutFrequencyChart workoutsByWeek={stats.workoutsByWeek} />
        )}

        {/* Duration Trends Chart */}
        <DurationTrendsChart timeRange={timeRange} />

        {/* Weekly Streak History */}
        {streakData && streakData.weeklyHistory.length > 0 && (
          <WeeklyStreakHistory
            weeklyHistory={streakData.weeklyHistory}
            weeklyGoal={streakData.weeklyGoal}
          />
        )}

        {/* Empty state for no workouts */}
        {stats.totalWorkouts === 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>GET STARTED</Text>
            <Text style={styles.infoText}>
              Complete your first workout to start tracking your progress. Charts and insights will appear here as you log more sessions.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#000',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 0.48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#F2F2F7',
    padding: 24,
    borderRadius: 4,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3A3A3C',
    fontWeight: '500',
  },
});
