export interface SavedCV {
  id: number;
  recruiterId: number;
  cvId: number;
  // Note: Backend chỉ trả về basic fields, không có navigation properties
}

export interface SaveCVRequest {
  cvId: number;
}