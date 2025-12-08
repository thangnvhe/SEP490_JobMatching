type AuthEventCallback = (isAuthenticated: boolean) => void;

class AuthEventEmitter {
  private listeners: Set<AuthEventCallback> = new Set();

  /**
   * Đăng ký callback để nhận thông báo khi auth state thay đổi
   */
  subscribe(callback: AuthEventCallback): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Emit event đến tất cả listeners
   */
  emit(isAuthenticated: boolean): void {
    this.listeners.forEach((callback) => {
      try {
        callback(isAuthenticated);
      } catch (error) {
        console.error("Error in auth event listener:", error);
      }
    });
  }

  /**
   * Xóa tất cả listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const authEventEmitter = new AuthEventEmitter();

