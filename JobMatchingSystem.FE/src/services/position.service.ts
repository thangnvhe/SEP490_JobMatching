import { Position } from "@/models/position";
import { BaseApiServices } from "./base-api.service";
import { PaginationParamsInput } from "@/models/base";

export const PositionService = {
    getAll: () => BaseApiServices.getAll<Position[]>('/Position'),
    getAllWithPagination: (params: PaginationParamsInput) => 
        BaseApiServices.getAllWithPagination<Position>('/Position/paged', params),
    getById: (id: string) => BaseApiServices.getById<Position>('/Position', id),
    create: (data: Omit<Position, 'positionId'>) => 
        BaseApiServices.create<Position>('/Position', data),
    update: (id: string, data: Partial<Omit<Position, 'positionId'>>) => 
        BaseApiServices.update<Position>('/Position', id, data),
    delete: (id: string) => BaseApiServices.delete<Position>('/Position', id),
}
