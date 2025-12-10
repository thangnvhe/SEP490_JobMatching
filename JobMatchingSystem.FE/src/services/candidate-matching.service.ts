import { BaseApiServices } from './base-api.service';
import { CandidateSearchFilters, CandidateSearchResponse } from '../models/candidate-matching';
import { BaseResponse } from '../models/base';

export const CandidateMatchingService = {
  getCandidatesForJob: async (filters: CandidateSearchFilters): Promise<BaseResponse<CandidateSearchResponse>> => {
    const params = new URLSearchParams();
    
    params.append('jobId', filters.jobId);
    
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString());
    }
    if (filters.size !== undefined) {
      params.append('size', filters.size.toString());
    }
    if (filters.minExperience !== undefined) {
      params.append('minExperience', filters.minExperience.toString());
    }
    if (filters.maxExperience !== undefined) {
      params.append('maxExperience', filters.maxExperience.toString());
    }
    if (filters.requiredSkills && filters.requiredSkills.length > 0) {
      params.append('requiredSkills', filters.requiredSkills.join(','));
    }
    if (filters.educationLevelId !== undefined) {
      params.append('educationLevelId', filters.educationLevelId.toString());
    }

    const response = await BaseApiServices.getAll<CandidateSearchResponse>(
      `/jobmatching/candidates-for-job?${params.toString()}`
    );
    return response;
  }
};