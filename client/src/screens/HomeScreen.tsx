import React, { useEffect, useState } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchRoutines, createRoutine, Routine } from '../api/client';
import RoutineCard from '../components/RoutineCard';

type RootStackParamList = {
  ActiveWorkout: { routine: Routine };
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const loadRoutines = async () => {
    try {
      const data = await fetchRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleCreateRoutine = async () => {
    try {
      const newRoutine = {
        name: `New Routine ${routines.length + 1}`,
        exercises: [{ name: 'Push-up' }, { name: 'Squat' }],
      };
      await createRoutine(newRoutine);
      loadRoutines();
    } catch (error) {
      console.error('Failed to create routine:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Button title="Create Routine" onPress={handleCreateRoutine} />
      </View>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoutineCard 
            routine={item} 
            onDelete={(id) => console.log('Delete', id)} 
            onStart={(routine) => navigation.navigate('ActiveWorkout', { routine })}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  list: {
    padding: 16,
  },
});
