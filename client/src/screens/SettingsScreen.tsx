import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useStorage } from '../contexts/StorageContext';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { user, isAuthenticated, logout } = useAuth();
    const { storageMode, setStorageMode, isSyncing } = useStorage();

    const handleLogout = async () => {
        try {
            // Switch back to local before logging out to ensure consistent state
            await setStorageMode('local');
            await logout();
            Alert.alert('Logged Out', 'You have been logged out. Your data remains on this device.');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout properly');
        }
    };

    const handleSyncToggle = async () => {
        if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to enable cloud sync');
            navigation.navigate('Login' as never);
            return;
        }

        try {
            const newMode = storageMode === 'local' ? 'cloud' : 'local';
            await setStorageMode(newMode);
            Alert.alert('Success', `Switched to ${newMode} storage`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to switch storage mode');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                {isAuthenticated ? (
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
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.description}>
                            Log in to sync your workouts across devices and backup your data.
                        </Text>
                        <View style={styles.authButtons}>
                            <TouchableOpacity 
                                style={[styles.button, styles.primaryButton]}
                                onPress={() => navigation.navigate('Login' as never)}
                            >
                                <Text style={styles.primaryButtonText}>Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton]}
                                onPress={() => navigation.navigate('Register' as never)}
                            >
                                <Text style={styles.secondaryButtonText}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data & Sync</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.settingLabel}>Cloud Sync</Text>
                            <Text style={styles.settingDescription}>
                                {storageMode === 'cloud' 
                                    ? 'Your data is synced to the cloud' 
                                    : 'Data is stored only on this device'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={[
                                styles.toggleButton, 
                                storageMode === 'cloud' && styles.toggleButtonActive
                            ]}
                            onPress={handleSyncToggle}
                            disabled={isSyncing}
                        >
                            <View style={[
                                styles.toggleCircle,
                                storageMode === 'cloud' && styles.toggleCircleActive
                            ]} />
                        </TouchableOpacity>
                    </View>
                    {isSyncing && (
                        <Text style={styles.syncStatus}>Syncing data...</Text>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 16,
    },
    card: {
        backgroundColor: '#FFF',
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
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
    },
    description: {
        fontSize: 15,
        color: '#3A3A3C',
        marginBottom: 16,
        lineHeight: 20,
    },
    authButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#000',
    },
    secondaryButton: {
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    primaryButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#000',
        fontWeight: '600',
    },
    logoutButton: {
        padding: 12,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    settingDescription: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 4,
    },
    toggleButton: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E5E5EA',
        padding: 2,
    },
    toggleButtonActive: {
        backgroundColor: '#34C759',
    },
    toggleCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFF',
    },
    toggleCircleActive: {
        transform: [{ translateX: 20 }],
    },
    syncStatus: {
        marginTop: 12,
        fontSize: 12,
        color: '#8E8E93',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    versionText: {
        textAlign: 'center',
        color: '#8E8E93',
        marginTop: 20,
        marginBottom: 40,
        fontSize: 12,
    },
});
