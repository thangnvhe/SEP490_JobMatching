import { BaseApiServices } from './base-api.service';
import { BaseResponse } from '../models/base';
import { InviteJobApplicationRequest } from '../models/invitation';

export const InvitationService = {
  inviteCandidateForJob: async (request: InviteJobApplicationRequest): Promise<BaseResponse<void>> => {
    return await BaseApiServices.custom<BaseResponse<void>>(
      'post',
      '/invitation/invite-candidate',
      request
    );
  }
};