
import type { UserFilters } from '../types/user';
import type { User } from '../types/user';
import type { CreateUserPayload } from '../types/user';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Récupère le token JWT depuis le localStorage
// Adapte cette ligne selon comment ton contexte Auth stocke le token
const getToken = (): string => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Non authentifié');
  return token;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export const userService = {

  // GET /api/auth/users — liste avec filtres optionnels
  async getUsers(filters: Partial<UserFilters>): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters.role)   params.set('role',   filters.role);
    if (filters.actif)  params.set('actif',  filters.actif);
    if (filters.service) params.set('service', filters.service);

    const url = `${BASE_URL}/auth/users${params.toString() ? '?' + params : ''}`;
    const res = await fetch(url, { headers: authHeaders() });

    if (res.status === 401) throw new Error('Session expirée, veuillez vous reconnecter');
    if (res.status === 403) throw new Error('Accès réservé aux administrateurs');
    if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');

    return res.json();
  },

  // POST /api/auth/users — crée un compte (inactif par défaut)
  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.status === 409) throw new Error('Cet email est déjà utilisé');
    if (!res.ok) throw new Error('Erreur lors de la création du compte');
    return res.json();
  },

  // PATCH /api/auth/users/:id/activer — active le compte
  async activateUser(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}/activer`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Impossible d'activer ce compte");
  },

  // PATCH /api/auth/users/:id/desactiver — désactive le compte
  async deactivateUser(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}/desactiver`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Impossible de désactiver ce compte");
  },

  // PATCH /api/auth/users/:id/role — change le rôle
  async updateRole(id: string, role: 'MEDECIN' | 'AGENT_ADMINISTRATIF'): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Impossible de modifier le rôle');
  },

  // PATCH /api/auth/users/:id/reset-password
  async resetPassword(id: string, nouveauMotDePasse: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}/reset-password`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ nouveauMotDePasse }),
    });
    if (!res.ok) throw new Error('Impossible de réinitialiser le mot de passe');
  },

  // DELETE /api/auth/users/:id
  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Impossible de supprimer ce compte');
  },
};