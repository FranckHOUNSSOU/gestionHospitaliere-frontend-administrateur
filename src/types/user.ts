
export type UserRole = 'ADMINISTRATEUR' | 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT';

export interface UserPole {
  id: string;
  nom: string;
}

export interface UserService {
  id: string;
  nom: string;
  code: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  pole: UserPole | null;
  service: UserService | null;
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
  poleId: string;
}

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT';
  telephone?: string;
  poleId?: string;
  serviceId?: string;
  numeroOrdre?: string;
}
