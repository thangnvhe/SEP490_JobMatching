import type { User } from '@/models/user';
import { BaseServices } from './base.service';

class UserService {
  getAllUsers = () => BaseServices.getAll<User[]>(null, '/users');
  getUserById = (id: string) => BaseServices.getById<User>(id, '/users');
  updateUser = (id: string, data: Partial<User>) => BaseServices.update<User>(id, data, '/users');
  deleteUser = (id: string) => BaseServices.delete(id, '/users');
  changeUserStatus = (id: string, isActive: boolean) => BaseServices.update<User>(id, { isActive }, '/users');
}
export const userService = new UserService();
