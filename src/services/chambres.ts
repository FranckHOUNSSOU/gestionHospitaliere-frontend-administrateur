import client from './clients';

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

export interface Chambre {
  id: string;
  numero: string;
  designation: string | null;
  etage: string | null;
  estActive: boolean;
  service: ServiceHospitalier;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChambreDto {
  numero: string;
  designation?: string;
  etage?: string;
}

export interface UpdateChambreDto {
  numero?: string;
  designation?: string;
  etage?: string;
  estActive?: boolean;
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
