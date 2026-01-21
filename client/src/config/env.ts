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
  // Hardcode production URL to ensure connection
  // const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
  const apiUrl = 'https://gym-tracker.fun';
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
