// ─── api.ts ───────────────────────────────────────────────────────────────
// Utilitaire centralisé pour tous les appels au backend.
// Remplacez BASE_URL par votre variable d'environnement si besoin.
import axios from 'axios';
const BASE_URL = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
});

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(err?.message ?? `Erreur ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  post: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>),

  patch: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>),

  get: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}${path}`, { headers: getHeaders() }).then(
      handleResponse<T>,
    ),
};

// ─── Types retournés par le backend ───────────────────────────────────────
export interface PatientBackend {
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
  contactsUrgence: {
    nom: string;
    prenom: string;
    lienParente: string;
    telephone: string;
  }[];
  createdAt: string;
}