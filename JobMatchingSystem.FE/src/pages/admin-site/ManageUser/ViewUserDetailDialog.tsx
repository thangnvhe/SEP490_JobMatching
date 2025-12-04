import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "@/models/user";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CompanyServices } from "@/services/company.service";
import { Company } from "@/models/company";

interface ViewUserDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const ViewUserDetailDialog: React.FC<ViewUserDetailDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") {
      return "Chưa cập nhật";
    }
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return "Chưa cập nhật";
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") {
      return "Chưa cập nhật";
    }
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", {
        locale: vi,
      });
    } catch {
      return "Chưa cập nhật";
    }
  };

  const getAllCompanies = useCallback(async () => {
    try {
      const response = await CompanyServices.getAll();
      setCompanies(response.result);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []);

  const getRoleLabel = (role?: string) => {
    if (!role) return "Chưa cập nhật";
    const roleMap: Record<string, string> = {
      Admin: "Quản trị viên",
      admin: "Quản trị viên",
      Recruiter: "Nhà tuyển dụng",
      recruiter: "Nhà tuyển dụng",
      Candidate: "Ứng viên",
      candidate: "Ứng viên",
      HiringManager: "Quản lý tuyển dụng",
      hiringmanager: "Quản lý tuyển dụng",
    };
    return roleMap[role] || role;
  };

  const getInitials = (fullName: string | null | undefined): string => {
    if (!fullName || !fullName.trim()) return "?";
    const firstChar = fullName.trim().charAt(0).toUpperCase();
    return firstChar;
  };

  const getCompanyName = (companyId: number | null | undefined): string => {
    if (!companyId) return "Không có";
    const company = companies.find((c) => c.id === companyId);
    return company?.name || "Không tìm thấy";
  };

  useEffect(() => {
    if (isOpen && user?.companyId) {
      getAllCompanies();
    }
  }, [isOpen, user?.companyId, getAllCompanies]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>
            Thông tin đầy đủ về người dùng trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-semibold text-primary">
                  {getInitials(user.fullName)}
                </span>
              </div>
            )}
          </div>

          {/* Thông tin người dùng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Họ và tên
              </label>
              <p className="text-sm font-medium">
                {user.fullName || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tên đăng nhập
              </label>
              <p className="text-sm font-medium">
                {user.userName || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-sm font-medium">
                {user.email || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Số điện thoại
              </label>
              <p className="text-sm font-medium">
                {user.phoneNumber || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Địa chỉ
              </label>
              <p className="text-sm font-medium">
                {user.address || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Giới tính
              </label>
              <p className="text-sm font-medium">
                {user.gender === null
                  ? "Chưa cập nhật"
                  : user.gender
                  ? "Nam"
                  : "Nữ"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Ngày sinh
              </label>
              <p className="text-sm font-medium">{formatDate(user.birthday)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Vai trò
              </label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Trạng thái
              </label>
              <div className="mt-1">
                <Badge
                  className={
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Điểm đánh giá
              </label>
              <p className="text-sm font-medium">
                {user.score !== null && user.score !== undefined
                  ? user.score
                  : "Chưa có"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Công ty
              </label>
              <p className="text-sm font-medium">
                {getCompanyName(user.companyId)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Ngày tạo
              </label>
              <p className="text-sm font-medium">
                {formatDateTime(user.createdAt)}
              </p>
            </div>
            {user.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ngày cập nhật
                </label>
                <p className="text-sm font-medium">
                  {formatDateTime(user.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
