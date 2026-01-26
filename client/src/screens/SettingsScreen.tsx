import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useStorage } from '../contexts/StorageContext';

import { Colors } from '../constants/colors';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const { refreshData, isRefreshing } = useStorage();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? All cached data will be cleared.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout properly');
                        }
                    }
                }
            ]
        );
    };

    const handleRefresh = async () => {
        try {
            await refreshData();
            Alert.alert('Success', 'Data refreshed and cache updated.');
        } catch (error) {
            Alert.alert('Error', 'Failed to refresh data');
        }
    };

    return (
        <ScrollView style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.[0] || user?.email?.[0] || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.card}>
                    <Text style={styles.description}>
                        Refresh your data from the server to ensure your local cache is up to date.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.button, styles.primaryButton, isRefreshing && styles.disabledButton]} 
                        onPress={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isRefreshing ? 'REFRESHING...' : 'REFRESH DATA'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.versionText}>Version 1.0.1</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Background,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.TextSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 16,
    },
    card: {
        backgroundColor: Colors.Surface,
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.Primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: Colors.TextInverse,
        fontSize: 20,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.TextPrimary,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.TextSecondary,
    },
    description: {
        fontSize: 14,
        color: Colors.TextSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: Colors.Primary,
    },
    primaryButtonText: {
        color: Colors.TextInverse,
        fontWeight: '700',
        letterSpacing: 1,
    },
    disabledButton: {
        opacity: 0.5,
    },
    logoutButton: {
        padding: 12,
        backgroundColor: Colors.Background,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: Colors.Error,
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        color: Colors.TextSecondary,
        marginTop: 20,
        marginBottom: 40,
        fontSize: 12,
    },
});
