import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import EditRoutineScreen from './src/screens/EditRoutineScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { StorageProvider } from './src/contexts/StorageContext';
import AuthLoadingScreen from './src/components/AuthLoadingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'REP' }} />
      <Stack.Screen 
        name="ActiveWorkout" 
        component={ActiveWorkoutScreen} 
        options={{ title: 'Active Workout' }} 
      />
      <Stack.Screen 
        name="CreateRoutine" 
        component={CreateRoutineScreen} 
        options={{ title: 'Create Routine' }} 
      />
      <Stack.Screen 
        name="EditRoutine" 
        component={EditRoutineScreen} 
        options={{ title: 'Edit Routine' }} 
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

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#D1D1D6',
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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
        options={{ title: 'REP' }} 
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
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack} 
        options={{ title: 'Settings' }} 
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <StorageProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </StorageProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
