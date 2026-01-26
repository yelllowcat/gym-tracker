import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';

export default function AuthLoadingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.TextPrimary} />
      </View>
      <View style={[styles.tabBar, { height: 60 + insets.bottom, paddingBottom: 8 + insets.bottom }]}>
        <View style={styles.tabItem} />
        <View style={styles.tabItem} />
        <View style={styles.tabItem} />
        <View style={styles.tabItem} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    width: 40,
    height: 40,
    backgroundColor: Colors.Surface,
    borderRadius: 8,
  }
});
