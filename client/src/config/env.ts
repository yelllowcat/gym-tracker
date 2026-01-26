import Constants from 'expo-constants';

interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment configuration
 * Falls back to localhost if no env vars are set
 */
function getConfig(): AppConfig {
  // Use local network IP for development testing
  // Change this to your computer's IP address or use the emulator localhost alias
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://gym-tracker.fun';
  // const apiUrl = 'http://10.0.2.2:3000'; // Use this for Android Emulator
  // const apiUrl = 'http://192.168.1.89:3000'; // Local Development
  const environment = Constants.expoConfig?.extra?.environment || 'development';

  return {
    apiUrl,
    environment: environment as 'development' | 'production',
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
  };
}

const config = getConfig();

// Debug logging in development
if (__DEV__) {
  console.log('🔧 Environment Config:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
  });
}

export default config;
