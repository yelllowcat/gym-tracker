import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AUTH_TOKEN_KEY = '@gym_tracker_auth_token';

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
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (storedToken) {
                // Set auth header
                client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // Verify token by fetching user data
                // Note: This is optional - app works offline without authentication
                try {
                    const response = await client.get('/auth/me');
                    setUser(response.data);
                    setToken(storedToken);
                    console.log('✅ Token verified, user authenticated');
                } catch (error: any) {
                    // Token might be invalid OR server might be unreachable
                    // Don't remove token immediately - could just be offline
                    console.log('⚠️ Could not verify token (offline or invalid):', error.message);
                    // Keep token stored for potential future use
                    // User will need to login again when they want to use cloud features
                    delete client.defaults.headers.common['Authorization'];
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

            // Store token
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);

            // Set auth header
            client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // Update state
            setToken(newToken);
            setUser(newUser);
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const register = async (email: string, password: string, name?: string) => {
        try {
            const response = await client.post('/auth/register', { email, password, name });
            const { token: newToken, user: newUser } = response.data;

            // Store token
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);

            // Set auth header
            client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // Update state
            setToken(newToken);
            setUser(newUser);
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.response?.data?.error || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            // Remove token from storage
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);

            // Remove auth header
            delete client.defaults.headers.common['Authorization'];

            // Clear state
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
        isAuthenticated: !!user && !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
