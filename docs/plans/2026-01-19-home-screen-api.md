# Home Screen & API Client Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Home Screen displaying routines fetched from a local API, using a dedicated API client and modular components.

**Architecture:** 
- **Layered Architecture:** UI (Screens/Components) -> API Client -> Axios -> Backend.
- **Componentization:** `RoutineCard` handles display logic, `HomeScreen` handles data fetching and layout.
- **Verification:** Strict Type Checking via `tsc` to ensure contract adherence.

**Tech Stack:** React Native (Expo), TypeScript, Axios.

### Task 1: Project Structure & API Client

**Files:**
- Create: `client/src/api/client.ts`

**Step 1: Create Directory Structure**
Run: `mkdir -p client/src/api`

**Step 2: Create API Client File**
Create `client/src/api/client.ts` with:
- Axios instance configured for `http://localhost:3000`
- `fetchRoutines` helper function

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000',
});

export const fetchRoutines = async () => {
  const response = await client.get('/routines');
  return response.data;
};

export default client;
```

**Step 3: Verify with TSC**
Run: `npx tsc --noEmit` (in `client/` directory)
Expected: Success (no errors)

**Step 4: Commit**
```bash
git add client/src/api/client.ts
git commit -m "feat: add axios client and fetchRoutines helper"
```

### Task 2: RoutineCard Component

**Files:**
- Create: `client/src/components/RoutineCard.tsx`

**Step 1: Create Directory**
Run: `mkdir -p client/src/components`

**Step 2: Create Component**
Create `client/src/components/RoutineCard.tsx` with:
- Props interface (name, exercises list)
- View displaying name and exercise names
- "Start" button (console.log)
- "Delete" button (dummy)

```typescript
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface RoutineProps {
  routine: {
    id: string;
    name: string;
    exercises: { name: string }[];
  };
}

const RoutineCard: React.FC<RoutineProps> = ({ routine }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{routine.name}</Text>
      {routine.exercises.map((ex, idx) => (
        <Text key={idx}>{ex.name}</Text>
      ))}
      <View style={styles.buttons}>
        <Button title="Start" onPress={() => console.log('Start routine', routine.id)} />
        <Button title="Delete" color="red" onPress={() => console.log('Delete routine', routine.id)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, backgroundColor: '#f9f9f9', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});

export default RoutineCard;
```

**Step 3: Verify with TSC**
Run: `npx tsc --noEmit`
Expected: Success

**Step 4: Commit**
```bash
git add client/src/components/RoutineCard.tsx
git commit -m "feat: add RoutineCard component"
```

### Task 3: Home Screen

**Files:**
- Create: `client/src/screens/HomeScreen.tsx`

**Step 1: Create Directory**
Run: `mkdir -p client/src/screens`

**Step 2: Create Screen**
Create `client/src/screens/HomeScreen.tsx` with:
- `useEffect` to call `fetchRoutines`
- `FlatList` to render `RoutineCard`s
- "Create Routine" dummy button

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Button, StyleSheet, Text } from 'react-native';
import { fetchRoutines } from '../api/client';
import RoutineCard from '../components/RoutineCard';

const HomeScreen = () => {
  const [routines, setRoutines] = useState<any[]>([]);

  useEffect(() => {
    fetchRoutines()
      .then(setRoutines)
      .catch(console.error);
  }, []);

  const handleCreate = () => {
    // Dummy implementation
    console.log('Create Routine');
  };

  return (
    <View style={styles.container}>
      <Button title="Create Routine" onPress={handleCreate} />
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RoutineCard routine={item} />}
        ListEmptyComponent={<Text>No routines found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});

export default HomeScreen;
```

**Step 3: Verify with TSC**
Run: `npx tsc --noEmit`
Expected: Success

**Step 4: Commit**
```bash
git add client/src/screens/HomeScreen.tsx
git commit -m "feat: add HomeScreen with data fetching"
```

### Task 4: Integration

**Files:**
- Modify: `client/App.tsx`

**Step 1: Update App.tsx**
Replace `App.tsx` content to render `HomeScreen`.

```typescript
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Step 2: Verify with TSC**
Run: `npx tsc --noEmit`
Expected: Success

**Step 3: Commit**
```bash
git add client/App.tsx
git commit -m "feat: integrate HomeScreen into App"
```
