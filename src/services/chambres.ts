import client from './clients';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const TypeChambre = {
  INDIVIDUELLE:    'INDIVIDUELLE',
  DOUBLE:          'DOUBLE',
  COMMUNE:         'COMMUNE',
  SOINS_INTENSIFS: 'SOINS_INTENSIFS',
  SUITE_PRIVEE:    'SUITE_PRIVEE',
} as const;
export type TypeChambre = (typeof TypeChambre)[keyof typeof TypeChambre];

export const StatutChambre = {
  DISPONIBLE:     'DISPONIBLE',
  OCCUPEE:        'OCCUPEE',
  EN_MAINTENANCE: 'EN_MAINTENANCE',
  HORS_SERVICE:   'HORS_SERVICE',
} as const;
export type StatutChambre = (typeof StatutChambre)[keyof typeof StatutChambre];

// ─── Labels ───────────────────────────────────────────────────────────────────

export const TYPE_CHAMBRE_LABELS: Record<TypeChambre, string> = {
  [TypeChambre.INDIVIDUELLE]:    'Individuelle',
  [TypeChambre.DOUBLE]:          'Double',
  [TypeChambre.COMMUNE]:         'Commune',
  [TypeChambre.SOINS_INTENSIFS]: 'Soins intensifs',
  [TypeChambre.SUITE_PRIVEE]:    'Suite privée',
};

export const STATUT_CHAMBRE_LABELS: Record<StatutChambre, string> = {
  [StatutChambre.DISPONIBLE]:     'Disponible',
  [StatutChambre.OCCUPEE]:        'Occupée',
  [StatutChambre.EN_MAINTENANCE]: 'En maintenance',
  [StatutChambre.HORS_SERVICE]:   'Hors service',
};

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

export interface Chambre {
  id: string;
  numero: string;
  designation: string | null;
  etage: string | null;
  type: TypeChambre;
  capacite: number;
  statut: StatutChambre;
  estActive: boolean;
  service: ServiceHospitalier;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChambreDto {
  numero: string;
  designation?: string;
  etage?: string;
  type: TypeChambre;
  capacite: number;
}

export interface UpdateChambreDto {
  numero?: string;
  designation?: string;
  etage?: string;
  estActive?: boolean;
  statut?: StatutChambre;
  type?: TypeChambre;
  capacite?: number;
}

// ─── Pôles & Services ─────────────────────────────────────────────────────────

export const getPoles = async (): Promise<Pole[]> => {
  const res = await client.get<Pole[]>('/poles');
  return res.data;
};

export const getServices = async (poleId: string): Promise<ServiceHospitalier[]> => {
  const res = await client.get<ServiceHospitalier[]>('/services', { params: { poleId } });
  return res.data;
};

// ─── Chambres ─────────────────────────────────────────────────────────────────

/**
 * GET /chambres/service/:serviceId   → filtre direct par service
 * GET /services?poleId=...           → récupère les services du pôle, puis les chambres
 * GET /services                      → récupère tous les services, puis les chambres
 */
export const getChambres = async (
  filters: { serviceId?: string; poleId?: string } = {}
): Promise<Chambre[]> => {
  if (filters.serviceId) {
    const res = await client.get<Chambre[]>(`/chambres/service/${filters.serviceId}`);
    return res.data;
  }

  const params = filters.poleId ? { poleId: filters.poleId } : {};
  const servicesRes = await client.get<ServiceHospitalier[]>('/services', { params });
  const services = servicesRes.data;

  const results = await Promise.allSettled(
    services.map((s) =>
      client.get<Chambre[]>(`/chambres/service/${s.id}`).then((r) => r.data)
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
