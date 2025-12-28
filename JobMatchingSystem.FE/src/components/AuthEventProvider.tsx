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
    // Lần mount đầu tiên: emit event nếu đã authenticated (restore auth thành công)
    // Điều này đảm bảo các component subscribe sau khi mount vẫn nhận được trạng thái hiện tại
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevAuthState.current = isAuthenticated;
      // Emit event khi mount nếu đã authenticated (restore auth thành công)
      if (isAuthenticated) {
        authEventEmitter.emit(isAuthenticated);
      }
      return;
    }

    // Các lần sau: chỉ emit khi isAuthenticated thực sự thay đổi
    if (prevAuthState.current !== isAuthenticated) {
      prevAuthState.current = isAuthenticated;
      authEventEmitter.emit(isAuthenticated);
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

