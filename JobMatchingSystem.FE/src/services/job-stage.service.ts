import type { JobStage } from "@/models/job-stage";
import { BaseApiServices } from "./base-api.service";
import type { BaseResponse } from "@/models/base";

export const JobStageServices = {
    getById: (id: number) => BaseApiServices.custom<BaseResponse<JobStage>>("get", `/JobStage/${id}`),
    create: (jobStage: JobStage) => BaseApiServices.create<JobStage>("/JobStage", jobStage),
    update: (id: number, jobStage: JobStage) => BaseApiServices.update<JobStage>("/JobStage", id, jobStage),
    delete: (id: number) => BaseApiServices.delete<JobStage>("/JobStage", id),
    // Lấy danh sách vòng tuyển dụng theo jobId
    getJobStagesByJobId: (jobId: number) => BaseApiServices.custom<BaseResponse<JobStage[]>>("get", `/JobStage/by-job/${jobId}`),
};