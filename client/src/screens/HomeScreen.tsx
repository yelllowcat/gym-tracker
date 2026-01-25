import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Routine } from '../api/client';
import { useStorage } from '../contexts/StorageContext';
import RoutineCard from '../components/RoutineCard';

type RootStackParamList = {
  ActiveWorkout: { routine: Routine };
  CreateRoutine: undefined;
  EditRoutine: { routineId: string };
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { storageProvider } = useStorage();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const loadRoutines = async () => {
    try {
      const data = await storageProvider.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRoutines();
    });
    return unsubscribe;
  }, [navigation]);

  const handleCreateRoutine = () => {
    navigation.navigate('CreateRoutine');
  };

  const handleEditRoutine = (id: string) => {
    navigation.navigate('EditRoutine', { routineId: id });
  };

  const handleDeleteRoutine = async (id: string) => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await storageProvider.deleteRoutine(id);
              loadRoutines();
            } catch (error) {
              console.error('Failed to delete routine:', error);
              Alert.alert('Error', 'Failed to delete routine');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoutineCard 
            routine={item}
            onEdit={handleEditRoutine}
            onDelete={handleDeleteRoutine} 
            onStart={(routine) => navigation.navigate('ActiveWorkout', { routine })}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.createButton} onPress={handleCreateRoutine}>
            <Text style={styles.createButtonText}>+ CREATE NEW ROUTINE</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  list: {
    padding: 20,
    paddingTop: 40,
  },
  createButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    paddingVertical: 20,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
