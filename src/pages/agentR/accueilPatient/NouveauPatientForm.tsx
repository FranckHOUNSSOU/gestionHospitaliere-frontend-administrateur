import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronRight, Info, RotateCcw } from 'lucide-react';
import { patientsData, type AccueilPayload } from '../../../data/patients';
import { type NouveauForm, emptyNouveau } from './types';
import { Field, SectionHeader } from './shared';

export const NouveauPatientForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState<NouveauForm>(emptyNouveau());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIpp, setCreatedIpp] = useState<string | null>(null);

  const set = (k: keyof NouveauForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const required: (keyof NouveauForm)[] = [
      'nom', 'prenoms', 'sexe', 'dateNaissance', 'adresse', 'telephoneMobile',
      'contactUrgenceNom', 'contactUrgencePrenoms', 'contactUrgenceLienParente', 'contactUrgenceTelephone',
    ];
    if (required.some(k => !form[k].trim())) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true); setError(null);
    try {
      const payload: AccueilPayload = {
        nom: form.nom, prenom: form.prenoms, sexe: form.sexe as 'M' | 'F' | 'Autre',
        dateNaissance: form.dateNaissance, adresse: form.adresse,
        telephoneMobile: form.telephoneMobile,
        contactUrgenceNom: form.contactUrgenceNom, contactUrgencePrenom: form.contactUrgencePrenoms,
        contactUrgenceLienParente: form.contactUrgenceLienParente,
        contactUrgenceTelephone: form.contactUrgenceTelephone,
        ...(form.lieuNaissance       && { lieuNaissance: form.lieuNaissance }),
        ...(form.nationalite         && { nationalite: form.nationalite }),
        ...(form.telephoneSecondaire && { telephoneFixe: form.telephoneSecondaire }),
        ...(form.email               && { email: form.email }),
      };
      const result = await patientsData.accueillir(payload);
      setCreatedIpp(result.numeroIpp);
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  if (createdIpp) return (
    <div className="adm-card">
      <div className="adm-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <CheckCircle size={52} color="var(--c-green)" style={{ marginBottom: 16 }} />
        <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--c-t0)', marginBottom: 8 }}>
          Patient enregistré avec succès
        </p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', marginBottom: 12 }}>Numéro IPP généré automatiquement</p>
        <span className="adm-tag adm-t-blue" style={{ fontSize: 14, padding: '6px 16px', marginBottom: 24, display: 'inline-block' }}>
          {createdIpp}
        </span>
        <div>
          <button className="adm-btn" onClick={() => { setForm(emptyNouveau()); setCreatedIpp(null); }}>
            <RotateCcw size={13} /> Nouvel enregistrement
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div className="adm-alert adm-alert-danger">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Bloc 1 — Identité */}
      <div className="adm-form-section">
        <SectionHeader
          num="1" color="var(--c-accent)" title="Identité du patient"
          right={<span style={{ fontSize: 11, color: 'var(--c-red)' }}>Champs obligatoires *</span>}
        />
        <div className="adm-form-section-body">
          <div className="adm-form-grid adm-form-grid-3">
            <Field label="Nom" required><input className="adm-input" placeholder="Ex: HOUNSOU" value={form.nom} onChange={set('nom')} /></Field>
            <Field label="Prénom(s)" required><input className="adm-input" placeholder="Ex: Franck Serge" value={form.prenoms} onChange={set('prenoms')} /></Field>
            <Field label="Sexe" required>
              <select className="adm-input" value={form.sexe} onChange={set('sexe')}>
                <option value="">— Choisir —</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </Field>
            <Field label="Date de naissance" required><input type="date" className="adm-input" value={form.dateNaissance} onChange={set('dateNaissance')} /></Field>
            <Field label="Lieu de naissance"><input className="adm-input" placeholder="Ex: Cotonou" value={form.lieuNaissance} onChange={set('lieuNaissance')} /></Field>
            <Field label="Nationalité"><input className="adm-input" placeholder="Ex: Béninoise" value={form.nationalite} onChange={set('nationalite')} /></Field>
            <Field label="Profession"><input className="adm-input" placeholder="Ex: Enseignant" value={form.profession} onChange={set('profession')} /></Field>
            <Field label="Situation familiale">
              <select className="adm-input" value={form.situationFamiliale} onChange={set('situationFamiliale')}>
                <option value="">— Choisir —</option>
                <option value="celibataire">Célibataire</option>
                <option value="marie">Marié(e)</option>
                <option value="divorce">Divorcé(e)</option>
                <option value="veuf">Veuf / Veuve</option>
              </select>
            </Field>
            <Field label="N° CNI / Passeport"><input className="adm-input" placeholder="Ex: BJ20240001234" value={form.numeroCNI} onChange={set('numeroCNI')} /></Field>
          </div>
        </div>
      </div>

      {/* Bloc 2 — Coordonnées */}
      <div className="adm-form-section">
        <SectionHeader num="2" color="var(--c-green)" title="Coordonnées" />
        <div className="adm-form-section-body">
          <div className="adm-form-grid adm-form-grid-3">
            <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
              <label className="adm-label">Adresse complète <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input className="adm-input" placeholder="Ex: Quartier Cadjèhoun, Rue 23, Porte 15" value={form.adresse} onChange={set('adresse')} />
            </div>
            <Field label="Commune"><input className="adm-input" placeholder="Ex: Cotonou" value={form.commune} onChange={set('commune')} /></Field>
            <Field label="Département"><input className="adm-input" placeholder="Ex: Littoral" value={form.departement} onChange={set('departement')} /></Field>
            <Field label="Email"><input type="email" className="adm-input" placeholder="Ex: patient@email.com" value={form.email} onChange={set('email')} /></Field>
            <Field label="Téléphone mobile" required><input className="adm-input" placeholder="+229 97 00 00 00" value={form.telephoneMobile} onChange={set('telephoneMobile')} /></Field>
            <Field label="Téléphone secondaire"><input className="adm-input" placeholder="+229 97 00 00 00" value={form.telephoneSecondaire} onChange={set('telephoneSecondaire')} /></Field>
          </div>
        </div>
      </div>

      {/* Bloc 3 — Contact d'urgence */}
      <div className="adm-form-section">
        <SectionHeader num="3" color="#d97706" title="Contact d'urgence" />
        <div className="adm-form-section-body">
          <div className="adm-form-grid adm-form-grid-3">
            <Field label="Nom" required><input className="adm-input" placeholder="Ex: HOUNSOU" value={form.contactUrgenceNom} onChange={set('contactUrgenceNom')} /></Field>
            <Field label="Prénom(s)" required><input className="adm-input" placeholder="Ex: Marie" value={form.contactUrgencePrenoms} onChange={set('contactUrgencePrenoms')} /></Field>
            <Field label="Lien de parenté" required>
              <select className="adm-input" value={form.contactUrgenceLienParente} onChange={set('contactUrgenceLienParente')}>
                <option value="">— Choisir —</option>
                <option value="Conjoint(e)">Conjoint(e)</option>
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Frère">Frère</option>
                <option value="Sœur">Sœur</option>
                <option value="Enfant">Enfant</option>
                <option value="Ami(e)">Ami(e)</option>
                <option value="Autre">Autre</option>
              </select>
            </Field>
            <Field label="Téléphone" required><input className="adm-input" placeholder="+229 97 00 00 00" value={form.contactUrgenceTelephone} onChange={set('contactUrgenceTelephone')} /></Field>
            <Field label="Téléphone secondaire"><input className="adm-input" placeholder="+229 97 00 00 00" value={form.contactUrgenceTelSecondaire} onChange={set('contactUrgenceTelSecondaire')} /></Field>
            <Field label="Adresse"><input className="adm-input" placeholder="Ex: Cotonou, Akpakpa" value={form.contactUrgenceAdresse} onChange={set('contactUrgenceAdresse')} /></Field>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, padding: '12px 16px',
          borderTop: '1px solid var(--c-bdr)', background: 'var(--c-surf2)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--c-t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} /> Le profil sera soumis pour validation
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="adm-btn" onClick={() => setForm(emptyNouveau())} disabled={loading}>
              <RotateCcw size={13} /> Réinitialiser
            </button>
            <button className="adm-btn adm-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enregistrement…' : <>Enregistrer le patient <ChevronRight size={13} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
