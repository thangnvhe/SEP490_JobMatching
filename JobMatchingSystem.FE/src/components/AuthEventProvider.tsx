import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { authEventEmitter } from "@/lib/authEventEmitter";

/**
 * Provider component để theo dõi auth state và emit event khi thay đổi.
 * Đặt component này ở cấp cao nhất của app (trong Provider.tsx hoặc App.tsx).
 * 
 * Khi isAuthenticated thay đổi (login/logout), tất cả subscribers sẽ được thông báo.
 */
export function AuthEventProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.authState);
  const prevAuthState = useRef<boolean | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Bỏ qua lần mount đầu tiên
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevAuthState.current = isAuthenticated;
      return;
    }

    // Chỉ emit khi isAuthenticated thực sự thay đổi
    if (prevAuthState.current !== isAuthenticated) {
      prevAuthState.current = isAuthenticated;
      authEventEmitter.emit(isAuthenticated);
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

