export interface ServicePlan {
  id: number;
  name: string;
  description: string;
  price: number;
  jobPostAdditional?: number;
  highlightJobDays?: number;
  highlightJobDaysCount?: number;
  extensionJobDays?: number;
  extensionJobDaysCount?: number;
  cvSaveAdditional?: number;
}

export interface CreateServicePlanRequest {
  name: string;
  description: string;
  price: number;
  jobPostAdditional?: number;
  highlightJobDays?: number;
  highlightJobDaysCount?: number;
  extensionJobDays?: number;
  extensionJobDaysCount?: number;
  cvSaveAdditional?: number;
}

export interface UpdateServicePlanRequest extends CreateServicePlanRequest {
  id: number;
}