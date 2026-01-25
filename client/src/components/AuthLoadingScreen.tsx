import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export default function AuthLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#000" />
      </View>
      <View style={styles.tabBar}>
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
    backgroundColor: '#FFF',
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
    borderTopColor: '#D1D1D6',
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    width: 40,
    height: 40,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  }
});
