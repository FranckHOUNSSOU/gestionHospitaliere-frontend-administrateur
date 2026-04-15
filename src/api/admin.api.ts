import client from './clients';
import type {
  AdminStats, AdminUser,
  ActivityLog, ServiceStatus
} from '../types/admin.types';

export const adminApi = {

  getStats: (): Promise<AdminStats> =>
    client.get('/admin/stats').then(r => r.data),

  getUsers: (): Promise<AdminUser[]> =>
    client.get('/admin/users').then(r => r.data),

  createUser: (payload: {
    name: string; email: string;
    password: string; role: string;
  }): Promise<AdminUser> =>
    client.post('/admin/users', payload).then(r => r.data),

  updateUser: (id: string, payload: Partial<AdminUser>): Promise<AdminUser> =>
    client.patch(`/admin/users/${id}`, payload).then(r => r.data),

  blockUser: (id: string): Promise<AdminUser> =>
    client.patch(`/admin/users/${id}/block`).then(r => r.data),

  activateUser: (id: string): Promise<AdminUser> =>
    client.patch(`/admin/users/${id}/activate`).then(r => r.data),

  getLogs: (): Promise<ActivityLog[]> =>
    client.get('/admin/logs').then(r => r.data),

  getServices: (): Promise<ServiceStatus[]> =>
    client.get('/admin/services').then(r => r.data),
};