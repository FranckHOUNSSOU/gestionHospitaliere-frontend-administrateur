import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminData } from '../data/admin';

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminData.getStats,
    refetchInterval: 30_000,
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: adminData.getUsers,
  });

export const useBlockUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminData.blockUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminData.activateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminData.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

export const useAdminLogs = () =>
  useQuery({
    queryKey: ['admin-logs'],
    queryFn: adminData.getLogs,
    refetchInterval: 15_000,
  });

export const useServicesStatus = () =>
  useQuery({
    queryKey: ['admin-services'],
    queryFn: adminData.getServices,
    refetchInterval: 60_000,
  });