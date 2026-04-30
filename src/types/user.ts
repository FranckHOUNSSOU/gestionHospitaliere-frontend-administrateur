
export type UserRole = 'ADMINISTRATEUR' | 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT';

// L'API renvoie actif: boolean — pas de statut "Bloqué" dans ce backend
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  service: string | null;
  telephone: string | null;
  numeroOrdre: string | null;
  actif: boolean;
  createdAt: string;
  createur?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface UserFilters {
  role: UserRole | '';
  actif: 'true' | 'false' | '';
  service: string;
}

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT';
  telephone?: string;
  service?: string;
  numeroOrdre?: string;
}