import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Workouts' }} />
      <Stack.Screen 
        name="ActiveWorkout" 
        component={ActiveWorkoutScreen} 
        options={{ 
          title: 'Active Workout',
          presentation: 'fullScreenModal'
        }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Workouts" component={WorkoutsStack} options={{ headerShown: false }} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
