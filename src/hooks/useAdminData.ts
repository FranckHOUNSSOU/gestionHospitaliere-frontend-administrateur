import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30_000,
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

export const useBlockUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.blockUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.activateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

export const useAdminLogs = () =>
  useQuery({
    queryKey: ['admin-logs'],
    queryFn: adminApi.getLogs,
    refetchInterval: 15_000,
  });

export const useServicesStatus = () =>
  useQuery({
    queryKey: ['admin-services'],
    queryFn: adminApi.getServices,
    refetchInterval: 60_000,
  });