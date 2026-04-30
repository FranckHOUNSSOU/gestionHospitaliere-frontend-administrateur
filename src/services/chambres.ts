

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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pole {
  id: string;
  nom: string;
}

export interface ServiceHospitalier {
  id: string;
  nom: string;
  abreviation: string;
  pole: Pole;
}

export interface Chambre {
  id: string;
  numero: string;
  type: TypeChambre;
  statut: StatutChambre;
  capacite: number;
  description?: string;
  service: ServiceHospitalier;
}

export interface CreateChambreDto {
  numero: string;
  type: TypeChambre;
  capacite: number;
  description?: string;
  serviceId: string;
}

export interface UpdateChambreDto extends Partial<CreateChambreDto> {
  statut?: StatutChambre;
}

// ─── Données statiques ────────────────────────────────────────────────────────

export const POLES_STATIQUES: Pole[] = [
  { id: 'pole-enfant',          nom: 'Pôle enfant' },
  { id: 'pole-mere',            nom: 'Pôle mère' },
  { id: 'pole-services-commun', nom: 'Pôle des services commun' },
];

/**
 * Services par pôle.
 * Chaque service référence son pôle parent pour que les composants
 * puissent reconstruire l'objet complet (service.pole.nom, etc.).
 */
export const SERVICES_STATIQUES: ServiceHospitalier[] = [
  // ── Pôle enfant ──────────────────────────────────────────────────────────
  {
    id: 'SP',
    nom: 'Service pédiatrie',
    abreviation: 'SP',
    pole: { id: 'pole-enfant', nom: 'Pôle enfant' },
  },
  {
    id: 'SCP',
    nom: 'Service chirurgie pédiatrique',
    abreviation: 'SCP',
    pole: { id: 'pole-enfant', nom: 'Pôle enfant' },
  },

  // ── Pôle mère ─────────────────────────────────────────────────────────────
  {
    id: 'SOGM',
    nom: "Service d'oncologie gynécologique et mammaire",
    abreviation: 'SOGM',
    pole: { id: 'pole-mere', nom: 'Pôle mère' },
  },
  {
    id: 'SGO',
    nom: 'Service gynécologique obstétrique',
    abreviation: 'SGO',
    pole: { id: 'pole-mere', nom: 'Pôle mère' },
  },

  // ── Pôle des services commun ──────────────────────────────────────────────
  {
    id: 'SIM',
    nom: "Service d'imagerie médicale",
    abreviation: 'SIM',
    pole: { id: 'pole-services-commun', nom: 'Pôle des services commun' },
  },
  {
    id: 'SL',
    nom: 'Service de laboratoire',
    abreviation: 'SL',
    pole: { id: 'pole-services-commun', nom: 'Pôle des services commun' },
  },
  {
    id: 'SAR',
    nom: 'Service anesthésie et réanimation',
    abreviation: 'SAR',
    pole: { id: 'pole-services-commun', nom: 'Pôle des services commun' },
  },
  {
    id: 'SMPR',
    nom: 'Service médecine physique et réadaptation',
    abreviation: 'SMPR',
    pole: { id: 'pole-services-commun', nom: 'Pôle des services commun' },
  },
  {
    id: 'SSH',
    nom: 'Service social hospitalier',
    abreviation: 'SSH',
    pole: { id: 'pole-services-commun', nom: 'Pôle des services commun' },
  },
  {
    id: 'SND',
    nom: 'Service nutrition et diététique',
    abreviation: 'SND',
    pole: { id: 'pole-services-commun', nom: 'Pôle des services commun' },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retourne tous les pôles (simulé asynchrone pour compatibilité API). */
export const getPoles = async (): Promise<Pole[]> =>
  Promise.resolve([...POLES_STATIQUES]);

/** Retourne les services d'un pôle donné. */
export const getServices = async (poleId: string): Promise<ServiceHospitalier[]> =>
  Promise.resolve(
    SERVICES_STATIQUES.filter((s) => s.pole.id === poleId)
  );

/** Retourne un service par son id. */
export const getServiceById = (serviceId: string): ServiceHospitalier | undefined =>
  SERVICES_STATIQUES.find((s) => s.id === serviceId);

// ─── Stockage en mémoire (remplace le backend REST) ──────────────────────────

let chambresStore: Chambre[] = [];
let nextId = 1;

/** Retourne toutes les chambres, filtrées optionnellement par service ou pôle. */
export const getChambres = async (
  filters: { serviceId?: string; poleId?: string } = {}
): Promise<Chambre[]> => {
  let result = [...chambresStore];
  if (filters.serviceId) {
    result = result.filter((c) => c.service.id === filters.serviceId);
  } else if (filters.poleId) {
    result = result.filter((c) => c.service.pole.id === filters.poleId);
  }
  return Promise.resolve(result);
};

/** Crée une chambre et l'ajoute au store. */
export const createChambre = async (dto: CreateChambreDto): Promise<Chambre> => {
  const service = getServiceById(dto.serviceId);
  if (!service) throw new Error('Service introuvable.');

  const chambre: Chambre = {
    id: String(nextId++),
    numero: dto.numero.trim(),
    type: dto.type,
    statut: StatutChambre.DISPONIBLE,
    capacite: dto.capacite,
    description: dto.description,
    service,
  };
  chambresStore.push(chambre);
  return Promise.resolve(chambre);
};

/** Met à jour une chambre existante. */
export const updateChambre = async (
  id: string,
  dto: UpdateChambreDto
): Promise<Chambre> => {
  const idx = chambresStore.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Chambre introuvable.');

  const service = dto.serviceId
    ? getServiceById(dto.serviceId) ?? chambresStore[idx].service
    : chambresStore[idx].service;

  chambresStore[idx] = {
    ...chambresStore[idx],
    ...(dto.numero    !== undefined && { numero:      dto.numero.trim() }),
    ...(dto.type      !== undefined && { type:        dto.type }),
    ...(dto.statut    !== undefined && { statut:      dto.statut }),
    ...(dto.capacite  !== undefined && { capacite:    dto.capacite }),
    ...(dto.description !== undefined && { description: dto.description }),
    service,
  };
  return Promise.resolve(chambresStore[idx]);
};

/** Supprime une chambre du store. */
export const deleteChambre = async (id: string): Promise<void> => {
  const idx = chambresStore.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Chambre introuvable.');
  chambresStore.splice(idx, 1);
  return Promise.resolve();
};