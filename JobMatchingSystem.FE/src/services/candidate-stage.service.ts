import { BaseResponse } from "@/models/base";
import { BaseApiServices } from "./base-api.service";
import { CandidateStage } from "@/models/candidate-stage";

export const CandidateStageServices = {
    getCandidatesByJobStageId: (jobStageId: number, status: string, sortBy: string, isDescending: string) =>
        BaseApiServices.custom<BaseResponse<CandidateStage[]>>("get", `/CandidateStage/jobStage/${jobStageId}?status=${status}&sortBy=${sortBy}&isDescending=${isDescending}`),
}