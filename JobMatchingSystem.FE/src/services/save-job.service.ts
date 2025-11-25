import { SavedJob } from "@/models/job"
import { BaseApiServices } from "./base-api.service"
import { BaseResponse, PaginationParamsInput } from "@/models/base"

export const SaveJobServices = {
    getAll: (params: Record<string, any>) => BaseApiServices.getAll<SavedJob[]>('/SavedJob', params),
    getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<SavedJob>('/SavedJob', params),
    delete: (id: number) => BaseApiServices.delete<SavedJob>('/SavedJob', id),
    getMySavedJobs: () => BaseApiServices.custom<BaseResponse<SavedJob[]>>('get', `/SavedJob`),
    getSavedJobsById: (id: number) => BaseApiServices.custom<BaseResponse<SavedJob[]>>('get', `/SavedJob/${id}`),
    deleteSavedJob: (id: number) => BaseApiServices.custom<BaseResponse<SavedJob>>('delete', `/SavedJob/${id}`),
}