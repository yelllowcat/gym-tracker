try {
  require('dotenv').config({
    path: process.env.APP_ENV === 'production' ? '.env.production' : '.env.development'
  });
} catch (error) {
  // Dotenv might not be available during certain build phases, fallback to environment variables
}

module.exports = {
  expo: {
    name: 'Rep',
    slug: 'gym-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1C1C1E'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.david.gymtracker'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1C1C1E'
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.david.gymtracker'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            newArchEnabled: false
          },
          ios: {
            newArchEnabled: false
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: '7112628a-a6ec-45a3-bd3b-1b218d4c7591'
      },
      // Inject environment variables
      apiUrl: process.env.API_URL,
      environment: process.env.APP_ENV || 'development'
    },
    // Removed owner field to allow EAS to infer from login or context
    runtimeVersion: '1.0.0',
    updates: {
      url: 'https://u.expo.dev/7112628a-a6ec-45a3-bd3b-1b218d4c7591'
    }
  }
};
