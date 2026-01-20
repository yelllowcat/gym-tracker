import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import EditRoutineScreen from './src/screens/EditRoutineScreen';
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
          title: 'Active Workout'
        }} 
      />
      <Stack.Screen 
        name="CreateRoutine" 
        component={CreateRoutineScreen} 
        options={{ 
          title: 'Create Routine'
        }} 
      />
      <Stack.Screen 
        name="EditRoutine" 
        component={EditRoutineScreen} 
        options={{ 
          title: 'Edit Routine'
        }} 
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HistoryHome" component={HistoryScreen} options={{ title: 'History' }} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Workout Detail' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false,
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: '#D1D1D6',
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
          }
        }}
      >
        <Tab.Screen 
          name="WorkoutsTab" 
          component={WorkoutsStack} 
          options={{ title: 'Workouts' }} 
        />
        <Tab.Screen 
          name="HistoryTab" 
          component={HistoryStack} 
          options={{ title: 'History' }} 
        />
        <Tab.Screen 
          name="ProgressTab" 
          component={ProgressScreen} 
          options={{ title: 'Progress' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
