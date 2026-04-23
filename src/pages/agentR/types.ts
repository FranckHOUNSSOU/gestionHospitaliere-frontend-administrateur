// ── Types for Agent de Renseignement ──────────────────────────

export type PatientType = 'nouveau' | 'ancien' | 'critique' | null;

export interface PatientIdentite {
  nom: string;
  prenoms: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  profession: string;
  situationFamiliale: string;
  numeroCNI: string;
}

export interface PatientCoordonnees {
  adresse: string;
  commune: string;
  departement: string;
  telephone: string;
  telephoneSecondaire: string;
  email: string;
}

export interface ContactUrgence {
  nomPrenom: string;
  lienParente: string;
  telephone: string;
  telephoneSecondaire: string;
  adresse: string;
}

export interface NouveauPatientForm {
  identite: PatientIdentite;
  coordonnees: PatientCoordonnees;
  contactUrgence: ContactUrgence;
}

export interface CritiqueForm {
  nom: string;
  prenom: string;
  sexe: string;
  ageEstime: string;
  accompagnantNom: string;
  accompagnantTel: string;
  circonstances: string;
}

export interface PatientResult {
  id: string;
  ipp: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  telephone: string;
  derniereVisite: string;
}