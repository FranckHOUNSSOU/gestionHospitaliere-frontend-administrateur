export type PatientType = 'nouveau' | 'ancien' | 'critique' | null;

export interface NouveauForm {
  nom: string; prenoms: string; sexe: string;
  dateNaissance: string; lieuNaissance: string;
  nationalite: string; profession: string;
  situationFamiliale: string; numeroCNI: string;
  adresse: string; commune: string; departement: string;
  telephoneMobile: string; telephoneSecondaire: string; email: string;
  contactUrgenceNom: string; contactUrgencePrenoms: string;
  contactUrgenceLienParente: string; contactUrgenceTelephone: string;
  contactUrgenceTelSecondaire: string; contactUrgenceAdresse: string;
}

export interface CritiqueForm {
  nom: string; prenom: string; sexe: string; ageEstime: string;
  accompagnantNom: string; accompagnantTelephone: string; circonstancesAdmission: string;
}

export const emptyNouveau = (): NouveauForm => ({
  nom: '', prenoms: '', sexe: '', dateNaissance: '', lieuNaissance: '',
  nationalite: '', profession: '', situationFamiliale: '', numeroCNI: '',
  adresse: '', commune: '', departement: '', telephoneMobile: '',
  telephoneSecondaire: '', email: '',
  contactUrgenceNom: '', contactUrgencePrenoms: '',
  contactUrgenceLienParente: '', contactUrgenceTelephone: '',
  contactUrgenceTelSecondaire: '', contactUrgenceAdresse: '',
});

export const emptyCritique = (): CritiqueForm => ({
  nom: '', prenom: '', sexe: '', ageEstime: '',
  accompagnantNom: '', accompagnantTelephone: '', circonstancesAdmission: '',
});
