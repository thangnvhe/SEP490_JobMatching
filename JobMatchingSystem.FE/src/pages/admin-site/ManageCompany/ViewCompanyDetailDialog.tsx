import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Company } from "@/models/company";

interface ViewCompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export function ViewCompanyDetailDialog({
  open,
  onOpenChange,
  company,
}: ViewCompanyDetailDialogProps) {

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

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Chờ duyệt";
      case 1:
        return "Đã duyệt";
      case 2:
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết doanh nghiệp</DialogTitle>
          <DialogDescription>
            Thông tin đầy đủ về doanh nghiệp trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Logo */}
          <div className="flex justify-center">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>

          {/* Thông tin doanh nghiệp */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tên doanh nghiệp
              </label>
              <p className="text-sm font-medium">
                {company.name || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-sm font-medium">
                {company.email || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Số điện thoại
              </label>
              <p className="text-sm font-medium">
                {company.phoneContact || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Website
              </label>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate"
                  title={company.website}
                >
                  <span className="truncate">{company.website}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-sm font-medium">Chưa cập nhật</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Địa chỉ
              </label>
              <p className="text-sm font-medium">
                {company.address || "Chưa cập nhật"}
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Mô tả
              </label>
              <p className="text-sm font-medium">
                {company.description || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mã số thuế
              </label>
              <p className="text-sm font-medium">
                {company.taxCode || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Điểm tín nhiệm
              </label>
              <p className="text-sm font-medium">
                {company.score !== null && company.score !== undefined
                  ? company.score
                  : "Chưa có"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Trạng thái duyệt
              </label>
              <div className="mt-1">
                <Badge
                  className={
                    company.status === 1
                      ? "bg-green-100 text-green-800"
                      : company.status === 2
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {getStatusLabel(company.status)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Trạng thái hoạt động
              </label>
              <div className="mt-1">
                <Badge
                  className={
                    company.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {company.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                </Badge>
              </div>
            </div>
            {company.rejectReason && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Lý do từ chối
                </label>
                <p className="text-sm font-medium text-red-600">
                  {company.rejectReason}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Ngày tạo
              </label>
              <p className="text-sm font-medium">
                {formatDateTime(company.createdAt)}
              </p>
            </div>
            {company.licenseFile && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Giấy phép kinh doanh
                </label>
                <div className="mt-1">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open(company.licenseFile)}
                    className="text-blue-600 h-auto p-0 font-semibold hover:no-underline hover:text-blue-800"
                  >
                    Xem giấy phép <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
