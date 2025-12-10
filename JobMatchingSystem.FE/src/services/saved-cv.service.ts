import { BaseApiServices } from './base-api.service';
import { SavedCV } from '../models/saved-cv';
import { BaseResponse } from '../models/base';

export const SavedCVService = {
  // GET /SavedCV - lấy tất cả saved CVs của recruiter
  getAllSavedCVs: () => 
    BaseApiServices.getAll<SavedCV[]>('SavedCV'),
  
  // GET /SavedCV/{id} - lấy saved CV theo ID
  getSavedCVById: (id: number) => 
    BaseApiServices.getById<SavedCV>('SavedCV', id.toString()),
  
  // POST /SavedCV - lưu CV mới
  saveCV: (cvId: number) => 
    BaseApiServices.custom<BaseResponse<string>>('post', `SavedCV?cvId=${cvId}`, {}),
  
  // DELETE /SavedCV/{id} - xóa saved CV
  deleteSavedCV: (id: number) => 
    BaseApiServices.delete<string>('SavedCV', id.toString())
};