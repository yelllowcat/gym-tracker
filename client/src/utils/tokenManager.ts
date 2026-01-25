import client from '../api/client';

export class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  private decodeToken(token: string) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
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
