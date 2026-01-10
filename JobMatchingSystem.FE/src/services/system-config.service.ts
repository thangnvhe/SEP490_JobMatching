import { SystemConfig, CreateSystemConfigDto, UpdateSystemConfigDto } from "@/models/system-config";
import { BaseApiServices } from "./base-api.service";

/**
 * Service quản lý các API liên quan đến System Config
 * Theo nguyên tắc Single Responsibility: chỉ xử lý các API calls cho System Config
 */
export const SystemConfigService = {
  /**
   * Lấy tất cả các system config
   */
  getAllConfigs: () => 
    BaseApiServices.getAll<SystemConfig[]>('/SystemConfig'),

  /**
   * Tạo mới một system config
   */
  createConfig: (data: CreateSystemConfigDto) => 
    BaseApiServices.create<SystemConfig>('/SystemConfig', data),

  /**
   * Cập nhật một system config theo ID
   */
  updateConfig: (id: number, data: UpdateSystemConfigDto) => 
    BaseApiServices.update<SystemConfig>('/SystemConfig', id, data),

  /**
   * Xóa một system config theo ID
   */
  deleteConfig: (id: number) => 
    BaseApiServices.delete<SystemConfig>('/SystemConfig', id),
};
