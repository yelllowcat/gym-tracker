import client from '../api/client';

// Simple base64 decoder for JWT payload
const base64Decode = (str: string) => {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  for (let i = 0; i < base64.length; i += 4) {
    const chunk = 
      (chars.indexOf(base64[i]) << 18) |
      (chars.indexOf(base64[i + 1]) << 12) |
      (chars.indexOf(base64[i + 2]) << 6) |
      chars.indexOf(base64[i + 3]);

    output += String.fromCharCode((chunk >> 16) & 0xff);
    if (base64[i + 2] !== '=') output += String.fromCharCode((chunk >> 8) & 0xff);
    if (base64[i + 3] !== '=') output += String.fromCharCode(chunk & 0xff);
  }

  return output;
};

export class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  private decodeToken(token: string) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(base64Decode(payload));
      return decoded;
    } catch (e) {
      return null;
    }
  }

  startAutoRefresh(token: string, onRefresh: (newToken: string | null) => void) {
    this.stopAutoRefresh();

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return;

    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    
    // Refresh 5 minutes before expiry
    const refreshTime = expiryTime - 5 * 60 * 1000;
    const delay = refreshTime - now;

    if (delay > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          // Attempt to refresh token using the current token
          const response = await client.post('/auth/refresh-token');
          const newToken = response.data.token;
          onRefresh(newToken);
          this.startAutoRefresh(newToken, onRefresh);
        } catch (error) {
          console.error('Token refresh failed:', error);
          onRefresh(null); // Force logout
        }
      }, delay);
    } else if (expiryTime > now) {
      // If we are already within the 5 minute window, refresh immediately
      this.refreshTimer = setTimeout(async () => {
        try {
          const response = await client.post('/auth/refresh-token');
          onRefresh(response.data.token);
        } catch (error) {
          onRefresh(null);
        }
      }, 0);
    }
  }

  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const tokenManager = new TokenManager();
