import client from './clients';

// Gère les réponses paginées (Spring Boot { content: [...] }) ou tableaux bruts
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const arr = obj['content'] ?? obj['data'] ?? obj['items'] ?? obj['results'];
    if (Array.isArray(arr)) return arr as T[];
  }
  return [];
}

// ─── Labels pôles (noms enum → libellés lisibles) ─────────────────────────────

export const POLE_LABELS: Record<string, string> = {
  'POLE MERE':                 'Pôle Mère',
  'POLE ENFANT':               'Pôle Enfant',
  'POLE DES SERVICES COMMUNS': 'Pôle des Services Communs',
};

export const poleLabel = (nom: string): string => POLE_LABELS[nom] ?? nom;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Pole {
  id: string;
  nom: string;
}

export interface ServiceHospitalier {
  id: string;
  nom: string;
  code: string;
  pole: Pole;
}

export type TypeChambre =
  | 'INDIVIDUELLE'
  | 'DOUBLE'
  | 'COMMUNE'
  | 'SOINS_INTENSIFS'
  | 'SUITE_PRIVEE';

export const TYPE_CHAMBRE_LABELS: Record<TypeChambre, string> = {
  INDIVIDUELLE:    'Individuelle',
  DOUBLE:          'Double',
  COMMUNE:         'Commune',
  SOINS_INTENSIFS: 'Soins intensifs',
  SUITE_PRIVEE:    'Suite privée',
};

export interface Chambre {
  id: string;
  numero: string;
  designation: string | null;
  etage: string | null;
  type: TypeChambre;
  capacite: number;
  estActive: boolean;
  service: ServiceHospitalier;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChambreDto {
  numero: string;
  type: TypeChambre;
  capacite: number;
  designation?: string;
  etage?: string;
}

export interface UpdateChambreDto {
  numero?: string;
  type?: TypeChambre;
  capacite?: number;
  designation?: string;
  etage?: string;
  estActive?: boolean;
}

// ─── Pôles & Services ─────────────────────────────────────────────────────────

export const getPoles = async (): Promise<Pole[]> => {
  const res = await client.get('/poles');
  return toArray<Pole>(res.data);
};

export const getServices = async (poleId: string): Promise<ServiceHospitalier[]> => {
  const res = await client.get('/services', { params: { poleId } });
  return toArray<ServiceHospitalier>(res.data);
};

// ─── Chambres ─────────────────────────────────────────────────────────────────

export const getChambres = async (
  filters: { serviceId?: string; poleId?: string } = {}
): Promise<Chambre[]> => {
  if (filters.serviceId) {
    const res = await client.get(`/chambres/service/${filters.serviceId}`);
    return toArray<Chambre>(res.data);
  }

  const params = filters.poleId ? { poleId: filters.poleId } : {};
  const servicesRes = await client.get('/services', { params });
  const services = toArray<ServiceHospitalier>(servicesRes.data);

  const results = await Promise.allSettled(
    services.map((s) =>
      client.get(`/chambres/service/${s.id}`).then((r) => toArray<Chambre>(r.data))
    )
  );

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
};

export const getChambre = async (id: string): Promise<Chambre> => {
  const res = await client.get<Chambre>(`/chambres/${id}`);
  return res.data;
};

export const createChambre = async (
  serviceId: string,
  dto: CreateChambreDto
): Promise<Chambre> => {
  const res = await client.post<Chambre>(`/chambres/service/${serviceId}`, dto);
  return res.data;
};

export const updateChambre = async (
  id: string,
  dto: UpdateChambreDto
): Promise<Chambre> => {
  const res = await client.patch<Chambre>(`/chambres/${id}`, dto);
  return res.data;
};

export const deleteChambre = async (id: string): Promise<void> => {
  await client.delete(`/chambres/${id}`);
};
