import client from '../api/clients';
import type { User, UserFilters, CreateUserPayload } from '../types/user';

export const utilisateursData = {

  lister: async (filters: Partial<UserFilters>): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters.role)    params.set('role',    filters.role);
    if (filters.actif)   params.set('actif',   filters.actif);
    if (filters.poleId) params.set('poleId', filters.poleId);
    const query = params.toString() ? `?${params}` : '';
    const { data } = await client.get<User[]>(`/auth/users${query}`);
    return data;
  },

  creer: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await client.post<User>('/auth/users', payload);
    return data;
  },

  activer: async (id: string): Promise<void> => {
    await client.patch(`/auth/users/${id}/activer`);
  },

  desactiver: async (id: string): Promise<void> => {
    await client.patch(`/auth/users/${id}/desactiver`);
  },

  changerRole: async (id: string, role: 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT'): Promise<void> => {
    await client.patch(`/auth/users/${id}/role`, { role });
  },

  reinitialiserMotDePasse: async (id: string, nouveauMotDePasse: string): Promise<void> => {
    await client.patch(`/auth/users/${id}/reset-password`, { nouveauMotDePasse });
  },

  supprimer: async (id: string): Promise<void> => {
    await client.delete(`/auth/users/${id}`);
  },
};
