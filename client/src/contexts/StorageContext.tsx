import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { CachedCloudStorageProvider } from '../storage/CachedCloudStorageProvider';
import { StorageProvider as IStorageProvider } from '../storage/types';
import { useAuth } from './AuthContext';

export interface StorageContextType {
    storageProvider: IStorageProvider;
    refreshData: () => Promise<void>;
    isRefreshing: boolean;
}

export const StorageContext = createContext<StorageContextType | null>(null);

interface StorageProviderProps {
    children: ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [storageProvider, setStorageProvider] = useState<IStorageProvider | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isAuthenticated && token) {
            setStorageProvider(new CachedCloudStorageProvider(token));
        } else {
            setStorageProvider(null);
        }
    }, [token, isAuthenticated]);

    const refreshData = async () => {
        if (!storageProvider || !(storageProvider instanceof CachedCloudStorageProvider)) return;
        setIsRefreshing(true);
        try {
            await storageProvider.clearCache();
            // Force re-fetch of routines and workouts to populate cache
            await storageProvider.getRoutines();
            await storageProvider.getWorkouts();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const value: StorageContextType = {
        storageProvider: storageProvider!,
        refreshData,
        isRefreshing,
    };

    // If we are authenticated but provider isn't ready yet, return null
    // AppContent in App.tsx handles the high-level loading state
    if (isAuthenticated && !storageProvider) {
        return null;
    }

    return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

export const useStorage = () => {
    const context = React.useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};
