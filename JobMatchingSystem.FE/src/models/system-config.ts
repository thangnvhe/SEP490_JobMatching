/**
 * Model cho System Config
 * Đại diện cho cấu hình hệ thống
 */
export interface SystemConfig {
  id: number;
  type: string;
  name: string;
  value: string;
}

/**
 * DTO cho việc tạo mới System Config
 */
export interface CreateSystemConfigDto {
  type: string;
  name: string;
  value: string;
}

/**
 * DTO cho việc cập nhật System Config
 */
export interface UpdateSystemConfigDto {
  value: string;
}

/**
 * Enum các loại System Config
 * Sử dụng const object thay vì enum để tương thích với erasableSyntaxOnly
 */
export const SystemConfigType = {
  JOB: 'job',
  REPORT_COMPANY: 'report_company',
  REPORT_REPORTER: 'report_reporter',
  EDUCATION_LEVEL: 'education_level',
  SAVE_CV: 'save_cv',
} as const;

export type SystemConfigType = typeof SystemConfigType[keyof typeof SystemConfigType];
