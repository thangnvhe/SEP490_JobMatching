import type { User } from '@/models/user';

// JWT token utilities
export class JWTUtils {
  /**
   * Decode JWT token without verification (client-side only)
   */
  static decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get user info from token
   */
  static getUserFromToken(token: string): Partial<User> | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      return {
        id: decoded.sub || decoded.userId || decoded.id,
        userName: decoded.username || decoded.unique_name,
        email: decoded.email,
        fullName: decoded.given_name || decoded.fullName,
        role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}