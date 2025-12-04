import React from 'react';
import { useAppSelector } from '@/store';
import type { UserRole } from '@/models/user';

/**
 * Extended role type bao gồm cả "Guest" cho người chưa đăng nhập
 */
export type ExtendedRole = UserRole | 'Guest';

/**
 * Chuẩn hóa role thành viết hoa chữ cái đầu
 * Ví dụ: "candidate" -> "Candidate", "ADMIN" -> "Admin", "guest" -> "Guest"
 */
const capitalizeRole = (role: string): string => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

interface RoleGuardProps {
  /** 
   * Các role được phép xem nội dung.
   * Sử dụng "Guest" để cho phép người chưa đăng nhập xem.
   */
  allowedRoles: ExtendedRole | ExtendedRole[];
  /** Nội dung hiển thị khi có quyền */
  children: React.ReactNode;
  /** Nội dung hiển thị khi không có quyền (mặc định: không hiển thị gì) */
  fallback?: React.ReactNode;
}

/**
 * RoleGuard - Component để kiểm tra quyền truy cập dựa trên role
 * 
 * @description
 * Component này dùng để ẩn/hiện nội dung dựa trên role của user.
 * Role được lấy từ global state (Redux store).
 * Sử dụng "Guest" để cho phép người chưa đăng nhập xem.
 * 
 * @example
 * // Chỉ Admin thấy
 * <RoleGuard allowedRoles="Admin">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * // Nhiều role được phép
 * <RoleGuard allowedRoles={['Admin', 'Recruiter']}>
 *   <ManageSection />
 * </RoleGuard>
 * 
 * @example
 * // Chỉ Guest (chưa đăng nhập) thấy
 * <RoleGuard allowedRoles="Guest">
 *   <Link to="/contact-recruiter">Nhà tuyển dụng</Link>
 * </RoleGuard>
 * 
 * @example
 * // Guest hoặc Candidate thấy
 * <RoleGuard allowedRoles={['Guest', 'Candidate']}>
 *   <PublicContent />
 * </RoleGuard>
 * 
 * @example
 * // Với fallback content
 * <RoleGuard allowedRoles="Admin" fallback={<p>Bạn không có quyền truy cập</p>}>
 *   <SecretContent />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { role, isAuthenticated } = useAppSelector(state => state.authState);

  // Chuẩn hóa allowedRoles thành mảng và viết hoa chữ cái đầu
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const normalizedAllowedRoles = rolesArray.map(r => capitalizeRole(r));

  // Kiểm tra nếu cho phép Guest
  const allowsGuest = normalizedAllowedRoles.includes('Guest');

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    // Nếu cho phép Guest thì hiển thị, không thì hiển thị fallback
    return allowsGuest ? <>{children}</> : <>{fallback}</>;
  }

  // Đã đăng nhập - kiểm tra role
  const currentRole = capitalizeRole(role || '');

  // Kiểm tra role hiện tại có trong danh sách cho phép không (không tính Guest)
  const hasPermission = normalizedAllowedRoles.includes(currentRole);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ============================================================
// Hooks để sử dụng linh hoạt hơn
// ============================================================

/**
 * Hook để kiểm tra user có role cụ thể không
 * @param roles - Role hoặc mảng các role cần kiểm tra (bao gồm cả "Guest")
 * @returns true nếu user có một trong các role được chỉ định
 */
export const useHasRole = (roles: ExtendedRole | ExtendedRole[]): boolean => {
  const { role, isAuthenticated } = useAppSelector(state => state.authState);
  
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const normalizedAllowedRoles = rolesArray.map(r => capitalizeRole(r));
  
  // Nếu chưa đăng nhập, chỉ trả về true nếu cho phép Guest
  if (!isAuthenticated) {
    return normalizedAllowedRoles.includes('Guest');
  }
  
  // Đã đăng nhập - kiểm tra role
  const currentRole = capitalizeRole(role || '');
  return normalizedAllowedRoles.includes(currentRole);
};

/**
 * Hook để lấy role hiện tại của user
 * @returns Role hiện tại, "Guest" nếu chưa đăng nhập, hoặc null nếu không xác định
 */
export const useCurrentRole = (): ExtendedRole | null => {
  const { role, isAuthenticated } = useAppSelector(state => state.authState);
  
  if (!isAuthenticated) return 'Guest';
  if (!role) return null;
  
  return capitalizeRole(role) as ExtendedRole;
};

/**
 * Hook kiểm tra user có phải guest (chưa đăng nhập) không
 * @returns true nếu user chưa đăng nhập
 */
export const useIsGuest = (): boolean => {
  const { isAuthenticated } = useAppSelector(state => state.authState);
  return !isAuthenticated;
};

/**
 * Hook kiểm tra user đã đăng nhập chưa
 * @returns true nếu user đã đăng nhập
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAppSelector(state => state.authState);
  return isAuthenticated;
};

export default RoleGuard;
