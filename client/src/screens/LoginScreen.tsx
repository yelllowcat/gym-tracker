import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function LoginScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            // After successful login, App.tsx will automatically switch to MainTabs
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.header}>
                <Text style={styles.brandName}>REP</Text>
                <Text style={styles.tagline}>TRAIN. TRACK. PROGRESS.</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.TextSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor={Colors.TextSecondary}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons 
                            name={showPassword ? 'eye-off' : 'eye'} 
                            size={22} 
                            color={Colors.TextSecondary} 
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.TextInverse} />
                    ) : (
                        <Text style={styles.buttonText}>LOGIN</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                        <Text style={styles.link}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Background,
        padding: 20,
    },
    form: {
        marginTop: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    brandName: {
        fontSize: 64,
        fontWeight: '900',
        color: Colors.TextPrimary,
        letterSpacing: 4,
    },
    tagline: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.TextSecondary,
        letterSpacing: 2,
        marginTop: -5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: Colors.TextPrimary,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.Border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: Colors.Surface,
        color: Colors.TextPrimary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.Border,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: Colors.Surface,
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: Colors.TextPrimary,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        backgroundColor: Colors.Primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.TextInverse,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: Colors.TextSecondary,
    },
    link: {
        color: Colors.Primary,
        fontWeight: '600',
    },
});
