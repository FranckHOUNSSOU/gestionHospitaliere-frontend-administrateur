// src/data/patients.ts
// Tout ce qui concerne les patients : types + fonctions d'accès au backend.
// Les composants importent uniquement depuis ce fichier — jamais le client directement.

import client from '../api/clients';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContactUrgence {
  nom: string;
  prenom: string;
  lienParente: string;
  telephone: string;
}

export interface Patient {
  id: string;
  numeroIpp: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  dateNaissance: string | null;
  adresse: string | null;
  telephoneMobile: string | null;
  email: string | null;
  statutProfil: 'Complet' | 'Incomplet';
  creePar: { id: string; nom: string; prenom: string } | null;
  contactsUrgence: ContactUrgence[];
  createdAt: string;
}

export interface AccueilPayload {
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  dateNaissance: string;
  adresse: string;
  telephoneMobile: string;
  contactUrgenceNom: string;
  contactUrgencePrenom: string;
  contactUrgenceLienParente: string;
  contactUrgenceTelephone: string;
  // Optionnels
  nomJeuneFille?: string;
  lieuNaissance?: string;
  nationalite?: string;
  langue?: string;
  ville?: string;
  pays?: string;
  telephoneFixe?: string;
  email?: string;
}

export interface CritiquePayload {
  nom?: string;
  prenom?: string;
  sexe?: 'M' | 'F' | 'Autre';
  dateNaissance?: string;
  ageEstime?: number;
  accompagnantNom?: string;
  accompagnantTelephone?: string;
  circonstancesAdmission?: string;
}

export type CompleterProfilPayload = Partial<AccueilPayload & {
  nomJeuneFille: string;
  lieuNaissance: string;
  nationalite: string;
  langue: string;
  ville: string;
  pays: string;
  telephoneFixe: string;
}>;

// ── Fonctions d'accès ────────────────────────────────────────────────────────

export const patientsData = {

  /** Recherche par nom, prénom ou IPP (max 20 résultats) */
  rechercher: async (q: string): Promise<Patient[]> => {
    const { data } = await client.get<Patient[]>(
      `/patients/recherche?q=${encodeURIComponent(q.trim())}`,
    );
    return data;
  },

  /** Accueillir un nouveau patient avec identité complète */
  accueillir: async (payload: AccueilPayload): Promise<Patient> => {
    const { data } = await client.post<Patient>('/patients/accueil', payload);
    return data;
  },

  /** Admettre un patient critique / inconnu (tous les champs optionnels) */
  admettreEnUrgence: async (payload: CritiquePayload): Promise<Patient> => {
    const { data } = await client.post<Patient>('/patients/critique', payload);
    return data;
  },

  /** Compléter le profil d'un dossier incomplet (passe statutProfil à Complet) */
  completerProfil: async (id: string, payload: CompleterProfilPayload): Promise<Patient> => {
    const { data } = await client.patch<Patient>(`/patients/${id}/completer`, payload);
    return data;
  },

  /** Récupérer la liste complète des patients */
  listerTous: async (): Promise<Patient[]> => {
    const { data } = await client.get<Patient[]>('/patients');
    return data;
  },

  /** Récupérer le dossier complet d'un patient par son id */
  getDossier: async (id: string): Promise<Patient> => {
    const { data } = await client.get<Patient>(`/patients/${id}/dossier`);
    return data;
  },
};
