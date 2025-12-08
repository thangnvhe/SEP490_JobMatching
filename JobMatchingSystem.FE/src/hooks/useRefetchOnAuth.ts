import { useEffect, useRef } from "react";
import { authEventEmitter } from "@/lib/authEventEmitter";

/**
 * Hook để tự động gọi callback khi trạng thái authentication thay đổi.
 * Sử dụng global event emitter - không cần setup thêm gì trong component.
 * 
 * @param callback - Hàm sẽ được gọi khi isAuthenticated thay đổi
 * @param deps - Các dependencies cho callback (để đảm bảo callback luôn up-to-date)
 * 
 * @example
 * // Tự động refetch jobs khi user login/logout
 * useRefetchOnAuth(() => {
 *   fetchJobs();
 * });
 * 
 * @example
 * // Với dependencies
 * useRefetchOnAuth(() => {
 *   fetchJobs({ page, filter });
 * }, [page, filter]);
 */
export function useRefetchOnAuth(
  callback: (isAuthenticated: boolean) => void,
  deps: React.DependencyList = []
) {
  // Use ref to always have latest callback
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    // Subscribe to auth events
    const unsubscribe = authEventEmitter.subscribe((isAuthenticated) => {
      callbackRef.current(isAuthenticated);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);
}
