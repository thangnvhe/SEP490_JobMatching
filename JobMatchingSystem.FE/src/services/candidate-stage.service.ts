import { BaseResponse } from "@/models/base";
import { BaseApiServices } from "./base-api.service";
import { CandidateStage } from "@/models/candidate-stage";

export const CandidateStageServices = {
    getById: (candidateStageId: number) =>
        BaseApiServices.getById<CandidateStage>(`/CandidateStage`, candidateStageId),

    
    getCandidatesByJobStageId: (jobStageId: number, status: string, sortBy: string, isDescending: string) =>
        BaseApiServices.custom<BaseResponse<CandidateStage[]>>("get", `/CandidateStage/jobStage/${jobStageId}?status=${status}&sortBy=${sortBy}&isDescending=${isDescending}`),
    updateScheduleCandidateStage: (candidateStageId: number, schedule: string, interviewLocation: string, googleMeetLink: string) =>
        BaseApiServices.custom<BaseResponse<CandidateStage>>("put", `/CandidateStage/${candidateStageId}/schedule`, { schedule, interviewLocation, googleMeetLink }),
    // result chỉ có Pass or Fail 
    updateCandidateStageResult: (candidateStageId: number, result: string, hiringManagerFeedback: string, jobStageId: number) =>
        BaseApiServices.custom<BaseResponse<CandidateStage>>("put", `/CandidateStage/${candidateStageId}/result`, { result, hiringManagerFeedback, jobStageId }),
}