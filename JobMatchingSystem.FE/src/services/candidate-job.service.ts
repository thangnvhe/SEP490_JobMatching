import { CandidateJob } from "@/models/job"
import { BaseApiServices } from "./base-api.service"
import { BaseResponse, PaginatedResponse, PaginationParamsInput } from "@/models/base"

export const CandidateJobServices = {
    getAll: (params: Record<string, any>) => BaseApiServices.getAll<CandidateJob[]>('/CandidateJob', params),
    getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CandidateJob>('/CandidateJob', params),
    getById: (id: string) => BaseApiServices.getById<CandidateJob>('/CandidateJob', id),
    create: (candidateJob: Pick<CandidateJob, 'jobId' | 'cvId'>) => BaseApiServices.create<CandidateJob>('/CandidateJob', candidateJob),
    update: (id: string, candidateJob: CandidateJob) => BaseApiServices.update<CandidateJob>('/CandidateJob', id, candidateJob),
    delete: (id: string) => BaseApiServices.delete<CandidateJob>('/CandidateJob', id),
    //
    getMyCandidateJobs: (params: PaginationParamsInput) => BaseApiServices.custom<PaginatedResponse<CandidateJob>>('get', `/CandidateJob/me`, params),
    getCandidateJobById: (id: number) => BaseApiServices.custom<BaseResponse<CandidateJob>>('get', `/CandidateJob/${id}`),
    getCandidateJobs: () => BaseApiServices.custom<BaseResponse<CandidateJob[]>>('get', `/CandidateJob`),
    approveCandidateJob: (id: number) => BaseApiServices.custom<BaseResponse<CandidateJob>>('post', `/CandidateJob/${id}/approve`),
    rejectCandidateJob: (id: number) => BaseApiServices.custom<BaseResponse<CandidateJob>>('post', `/CandidateJob/${id}/reject`),
}