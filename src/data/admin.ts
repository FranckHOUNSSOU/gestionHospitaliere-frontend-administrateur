import client from '../api/clients';
import type { AdminStats, AdminUser, ActivityLog, ServiceStatus } from '../types/admin.types';

interface BackendUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
  derniereConnexion: string | null;
  createdAt: string;
}

interface BackendService {
  id: string;
  nom: string;
  estActif: boolean;
}

function toAdminUser(u: BackendUser): AdminUser {
  const roleMap: Record<string, AdminUser['role']> = {
    ADMINISTRATEUR:      'admin',
    MEDECIN:             'doctor',
    AGENT_ADMINISTRATIF: 'agent',
    AGENT_RENSEIGNEMENT: 'agent',
  };
  return {
    id:        u.id,
    name:      `${u.prenom} ${u.nom}`,
    email:     u.email,
    role:      roleMap[u.role] ?? 'agent',
    status:    u.actif ? 'active' : 'inactive',
    lastLogin: u.derniereConnexion,
    createdAt: u.createdAt,
  };
}

export const adminData = {

  getStats: async (): Promise<AdminStats> => {
    const { data } = await client.get<BackendUser[]>('/auth/users');
    return {
      activeUsers:    data.filter(u => u.actif).length,
      logins24h:      0,
      securityAlerts: 0,
    };
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await client.get<BackendUser[]>('/auth/users');
    return data.map(toAdminUser);
  },

  createUser: async (payload: {
    name: string; email: string; password: string; role: string;
  }): Promise<AdminUser> => {
    const parts  = payload.name.trim().split(/\s+/);
    const prenom = parts[0] ?? '';
    const nom    = parts.slice(1).join(' ') || prenom;
    const roleMap: Record<string, string> = {
      admin:  'ADMINISTRATEUR',
      doctor: 'MEDECIN',
      agent:  'AGENT_ADMINISTRATIF',
    };
    const { data } = await client.post<BackendUser>('/auth/users', {
      prenom,
      nom,
      email:      payload.email,
      motDePasse: payload.password,
      role:       roleMap[payload.role] ?? payload.role,
    });
    return toAdminUser(data);
  },

  updateUser: async (id: string, payload: Partial<AdminUser>): Promise<AdminUser> => {
    const { data } = await client.patch<BackendUser>(`/auth/users/${id}`, payload);
    return toAdminUser(data);
  },

  blockUser: async (id: string): Promise<void> => {
    await client.patch(`/auth/users/${id}/desactiver`);
  },

  activateUser: async (id: string): Promise<void> => {
    await client.patch(`/auth/users/${id}/activer`);
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    return [];
  },

  getServices: async (): Promise<ServiceStatus[]> => {
    const { data } = await client.get<BackendService[]>('/services');
    return data.map(s => ({
      name:   s.nom,
      status: s.estActif ? 'active' : 'offline',
    }));
  },
};
