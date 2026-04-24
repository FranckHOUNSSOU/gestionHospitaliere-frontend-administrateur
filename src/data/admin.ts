import client from '../api/clients';
import type { AdminStats, AdminUser, ActivityLog, ServiceStatus } from '../types/admin.types';

export const adminData = {

  getStats: async (): Promise<AdminStats> => {
    const { data } = await client.get<AdminStats>('/admin/stats');
    return data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await client.get<AdminUser[]>('/admin/users');
    return data;
  },

  createUser: async (payload: {
    name: string; email: string; password: string; role: string;
  }): Promise<AdminUser> => {
    const { data } = await client.post<AdminUser>('/admin/users', payload);
    return data;
  },

  updateUser: async (id: string, payload: Partial<AdminUser>): Promise<AdminUser> => {
    const { data } = await client.patch<AdminUser>(`/admin/users/${id}`, payload);
    return data;
  },

  blockUser: async (id: string): Promise<AdminUser> => {
    const { data } = await client.patch<AdminUser>(`/admin/users/${id}/block`);
    return data;
  },

  activateUser: async (id: string): Promise<AdminUser> => {
    const { data } = await client.patch<AdminUser>(`/admin/users/${id}/activate`);
    return data;
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    const { data } = await client.get<ActivityLog[]>('/admin/logs');
    return data;
  },

  getServices: async (): Promise<ServiceStatus[]> => {
    const { data } = await client.get<ServiceStatus[]>('/admin/services');
    return data;
  },
};
