import { Alert } from 'react-native';

export interface HandledError {
  userMessage: string;
  shouldLogout: boolean;
  isNetworkError: boolean;
}

export function handleApiError(error: any, context: string): HandledError {
  if (__DEV__) {
    console.error(`[${context}] API Error:`, error);
  }

  // Network error (offline)
  if (!error.response) {
    return {
      userMessage: 'No internet connection. Using cached data.',
      shouldLogout: false,
      isNetworkError: true,
    };
  }

  // Auth error (token invalid/expired)
  if (error.response?.status === 401) {
    return {
      userMessage: 'Your session has expired. Please login again.',
      shouldLogout: true,
      isNetworkError: false,
    };
  }

  // Server error
  if (error.response?.status >= 500) {
    return {
      userMessage: 'Server error. Please try again later.',
      shouldLogout: false,
      isNetworkError: false,
    };
  }

  // Client error (validation, etc.)
  const message = error.response?.data?.error || 'Something went wrong.';
  return {
    userMessage: message,
    shouldLogout: false,
    isNetworkError: false,
  };
}

export function showAlert(error: HandledError) {
  Alert.alert('Error', error.userMessage);
}
