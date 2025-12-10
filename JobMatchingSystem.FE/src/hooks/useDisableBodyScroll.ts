import { useEffect } from "react";

/**
 * Custom hook để disable scroll của body khi dialog/modal mở
 * @param isOpen - Trạng thái mở/đóng của dialog
 */
export function useDisableBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}

