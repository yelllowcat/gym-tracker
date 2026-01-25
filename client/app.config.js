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
    slug: 'rep',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.david.gymtracker'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
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
    owner: 'vdavid_23',
    runtimeVersion: {
      policy: 'appVersion'
    },
    updates: {
      url: 'https://u.expo.dev/7112628a-a6ec-45a3-bd3b-1b218d4c7591'
    }
  }
};
