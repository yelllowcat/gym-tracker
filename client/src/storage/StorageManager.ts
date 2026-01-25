import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { StorageProvider, StorageMode, SyncData } from './types';
import { LocalStorageProvider } from './LocalStorageProvider';
import { CloudStorageProvider } from './CloudStorageProvider';

const STORAGE_KEYS = {
    ROUTINES: '@gym_tracker_routines',
    WORKOUTS: '@gym_tracker_workouts',
};

/**
 * Storage Manager
 * Manages storage mode switching and data migration between local and cloud
 */
export class StorageManager {
    private currentProvider: StorageProvider;
    private mode: StorageMode;
    private authToken?: string;

    constructor(mode: StorageMode, authToken?: string) {
        this.mode = mode;
        this.authToken = authToken;
        this.currentProvider = this.createProvider(mode, authToken);
    }

    private createProvider(mode: StorageMode, authToken?: string): StorageProvider {
        if (mode === 'local') {
            return new LocalStorageProvider();
        } else {
            if (!authToken) {
                throw new Error('Auth token required for cloud storage');
            }
            return new CloudStorageProvider(authToken);
        }
    }

    /**
     * Get the current storage provider
     */
    getProvider(): StorageProvider {
        return this.currentProvider;
    }

    /**
     * Get current storage mode
     */
    getMode(): StorageMode {
        return this.mode;
    }

    /**
     * Switch storage mode
     */
    async switchMode(newMode: StorageMode, authToken?: string): Promise<void> {
        if (newMode === this.mode) {
            return; // Already in this mode
        }

        if (newMode === 'cloud' && !authToken) {
            throw new Error('Auth token required for cloud storage');
        }

        this.mode = newMode;
        this.authToken = authToken;
        this.currentProvider = this.createProvider(newMode, authToken);
    }

    /**
     * Migrate data from local to cloud
     * Uploads all local data to the cloud
     */
    async migrateToCloud(authToken: string): Promise<void> {
        console.log('Starting migration to cloud...');

        // Get all local data
        const localProvider = new LocalStorageProvider();
        const [routines, workouts] = await Promise.all([
            localProvider.getRoutines(),
            localProvider.getWorkouts(),
        ]);

        console.log(`Migrating ${routines.length} routines and ${workouts.length} workouts to cloud`);

        // Upload to cloud
        const response = await client.post('/sync/upload', {
            routines,
            workouts,
        }, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        console.log('Migration to cloud complete:', response.data);

        // Switch to cloud provider
        await this.switchMode('cloud', authToken);
    }

    /**
     * Migrate data from cloud to local
     * Downloads all cloud data to local storage
     */
    async migrateToLocal(): Promise<void> {
        console.log('Starting migration to local...');

        // Download from cloud
        const response = await client.get('/sync/download');
        const { routines, workouts } = response.data as SyncData;

        console.log(`Migrating ${routines.length} routines and ${workouts.length} workouts to local`);

        // Save to AsyncStorage
        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines)),
            AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts)),
        ]);

        console.log('Migration to local complete');

        // Switch to local provider
        await this.switchMode('local');
    }

    /**
     * Clear all local data
     */
    async clearLocalData(): Promise<void> {
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.ROUTINES),
            AsyncStorage.removeItem(STORAGE_KEYS.WORKOUTS),
        ]);
        console.log('Local data cleared');
    }

    /**
     * Get sync data for backup/export
     */
    async getSyncData(): Promise<SyncData> {
        const [routines, workouts] = await Promise.all([
            this.currentProvider.getRoutines(),
            this.currentProvider.getWorkouts(),
        ]);

        return { routines, workouts };
    }

    /**
     * Import sync data (for restore/import)
     */
    async importSyncData(data: SyncData): Promise<void> {
        if (this.mode === 'local') {
            // Save to AsyncStorage
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(data.routines)),
                AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(data.workouts)),
            ]);
        } else {
            // Upload to cloud
            await client.post('/sync/upload', data);
        }
        console.log('Data imported successfully');
    }
}
