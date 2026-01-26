import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { apiEvents } from '../api/client';
import { tokenManager } from '../utils/tokenManager';

const AUTH_TOKEN_KEY = '@gym_tracker_auth_token';
const CACHE_KEYS = {
    ROUTINES: '@gym_tracker_cache_routines',
    WORKOUTS: '@gym_tracker_cache_workouts',
};

export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();

        const handleUnauthorized = () => {
            console.log('API unauthorized event received, logging out');
            logout();
        };

        apiEvents.on('unauthorized', handleUnauthorized);

        return () => {
            tokenManager.stopAutoRefresh();
            apiEvents.off('unauthorized', handleUnauthorized);
        };
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (storedToken) {
                // Set auth header
                client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // Verify token by fetching user data
                try {
                    const response = await client.get('/auth/me');
                    setUser(response.data);
                    setToken(storedToken);
                    
                    // Start auto-refresh
                    tokenManager.startAutoRefresh(storedToken, async (newToken) => {
                        if (newToken) {
                            setToken(newToken);
                            await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
                            client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                        } else {
                            await logout();
                        }
                    });
                } catch (error: any) {
                    // If it's a network error, we trust the token for now (Lenient mode 1.b)
                    if (!error.response) {
                        setToken(storedToken);
                        console.log('Offline: trusting cached token');
                    } else {
                        // Token is definitely invalid (401, 403, etc)
                        console.error('Stored token is invalid:', error);
                        await logout();
                    }
                }
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await client.post('/auth/login', { email, password });
            const { token: newToken, user: newUser } = response.data;

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
            client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            setToken(newToken);
            setUser(newUser);

            tokenManager.startAutoRefresh(newToken, async (t) => {
                if (t) {
                    setToken(t);
                    await AsyncStorage.setItem(AUTH_TOKEN_KEY, t);
                    client.defaults.headers.common['Authorization'] = `Bearer ${t}`;
                } else {
                    await logout();
                }
            });
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else if (error.request) {
                throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
            }
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (email: string, password: string, name?: string) => {
        try {
            const response = await client.post('/auth/register', { email, password, name });
            const { token: newToken, user: newUser } = response.data;

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
            client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            setToken(newToken);
            setUser(newUser);

            tokenManager.startAutoRefresh(newToken, async (t) => {
                if (t) {
                    setToken(t);
                    await AsyncStorage.setItem(AUTH_TOKEN_KEY, t);
                    client.defaults.headers.common['Authorization'] = `Bearer ${t}`;
                } else {
                    await logout();
                }
            });
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else if (error.request) {
                throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
            }
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            tokenManager.stopAutoRefresh();
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(CACHE_KEYS.ROUTINES);
            await AsyncStorage.removeItem(CACHE_KEYS.WORKOUTS);
            delete client.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token, 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
