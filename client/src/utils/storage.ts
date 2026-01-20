import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEKLY_GOAL_KEY = '@gym_tracker_weekly_goal';
const DEFAULT_WEEKLY_GOAL = 3;

export const getWeeklyGoal = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(WEEKLY_GOAL_KEY);
    if (value !== null) {
      const goal = parseInt(value, 10);
      // Validate the stored value
      if (goal >= 1 && goal <= 7) {
        return goal;
      }
    }
  } catch (error) {
    console.error('Error reading weekly goal:', error);
  }
  return DEFAULT_WEEKLY_GOAL;
};

export const setWeeklyGoal = async (goal: number): Promise<void> => {
  try {
    // Validate the goal
    if (goal < 1 || goal > 7) {
      throw new Error('Weekly goal must be between 1 and 7');
    }
    await AsyncStorage.setItem(WEEKLY_GOAL_KEY, goal.toString());
  } catch (error) {
    console.error('Error saving weekly goal:', error);
    throw error;
  }
};
