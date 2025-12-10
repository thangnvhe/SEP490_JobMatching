import { CVProfile } from "@/models/cv-profile";
import { BaseApiServices } from "./base-api.service";
import { BaseResponse } from "@/models/base";

export const CVProfileService = {
    getAll: () => BaseApiServices.getAll<CVProfile[]>('/CVProfile'),
    getById: (id: string) => BaseApiServices.getById<CVProfile>('/CVProfile', id),
    create: (profile: CVProfile) => BaseApiServices.create<CVProfile>('/CVProfile', profile),
    update: (id: string, profile: CVProfile) => BaseApiServices.update<CVProfile>('/CVProfile', id, profile),
    delete: (id: string) => BaseApiServices.delete<CVProfile>('/CVProfile', id),
    getMyProfile: () => BaseApiServices.custom<BaseResponse<CVProfile>>("get", "/CVProfile/me"),
}