import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageManager } from '../storage/StorageManager';
import { StorageProvider as IStorageProvider, StorageMode } from '../storage/types';
import { useAuth } from './AuthContext';

const STORAGE_MODE_KEY = '@gym_tracker_storage_mode';

export interface StorageContextType {
    storageMode: StorageMode;
    storageProvider: IStorageProvider;
    storageManager: StorageManager;
    isSyncing: boolean;
    setStorageMode: (mode: StorageMode) => Promise<void>;
    refreshProvider: () => void;
}

export const StorageContext = createContext<StorageContextType | null>(null);

interface StorageProviderProps {
    children: ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [storageMode, setStorageModeState] = useState<StorageMode>('local');
    const [storageManager, setStorageManager] = useState<StorageManager>(
        new StorageManager('local')
    );
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadStorageMode();
    }, []);

    // Update storage manager when auth token changes
    useEffect(() => {
        if (storageMode === 'cloud' && token) {
            setStorageManager(new StorageManager('cloud', token));
        }
    }, [token]);

    const loadStorageMode = async () => {
        try {
            const savedMode = await AsyncStorage.getItem(STORAGE_MODE_KEY);
            if (savedMode === 'cloud' || savedMode === 'local') {
                setStorageModeState(savedMode);
                // If cloud mode but no token, fall back to local
                if (savedMode === 'cloud' && !token) {
                    console.log('Cloud mode saved but no token, falling back to local');
                    setStorageModeState('local');
                    await AsyncStorage.setItem(STORAGE_MODE_KEY, 'local');
                } else {
                    setStorageManager(new StorageManager(savedMode, token || undefined));
                }
            }
        } catch (error) {
            console.error('Error loading storage mode:', error);
        }
    };

    const setStorageMode = async (mode: StorageMode) => {
        if (mode === storageMode) {
            return; // Already in this mode
        }

        // Validate cloud mode requires authentication
        if (mode === 'cloud' && !isAuthenticated) {
            throw new Error('You must be logged in to use cloud storage');
        }

        setIsSyncing(true);
        try {
            // Perform migration
            if (mode === 'cloud' && storageMode === 'local') {
                console.log('Migrating from local to cloud...');
                await storageManager.migrateToCloud(token!);
            } else if (mode === 'local' && storageMode === 'cloud') {
                console.log('Migrating from cloud to local...');
                await storageManager.migrateToLocal();
            }

            // Save preference
            await AsyncStorage.setItem(STORAGE_MODE_KEY, mode);

            // Update state
            setStorageModeState(mode);
            setStorageManager(new StorageManager(mode, token || undefined));

            console.log(`Storage mode switched to ${mode}`);
        } catch (error) {
            console.error('Error switching storage mode:', error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    };

    const refreshProvider = () => {
        // Force refresh of storage provider (useful after auth changes)
        setStorageManager(new StorageManager(storageMode, token || undefined));
    };

    const value: StorageContextType = {
        storageMode,
        storageProvider: storageManager.getProvider(),
        storageManager,
        isSyncing,
        setStorageMode,
        refreshProvider,
    };

    return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

// Custom hook for using storage context
export const useStorage = () => {
    const context = React.useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};
