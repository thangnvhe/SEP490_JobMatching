import type { User } from '@/models/user';
import { BaseServices } from './base.service';

export const UserServices = {
  getAll: (params?: any) => BaseServices.getAll<User[]>('/users', params),
  getById: (id: string) => BaseServices.getById<User>(id, '/users'),
  create: (user: Partial<User>) => BaseServices.create<User>(user, '/users'),
  update: (id: string, data: Partial<User>) => BaseServices.update<User>(id, data, '/users'),
  delete: (id: string) => BaseServices.delete(id, '/users'),
  changeStatus: (id: string, isActive: boolean) => BaseServices.update<User>(id, { isActive }, '/users')
};
