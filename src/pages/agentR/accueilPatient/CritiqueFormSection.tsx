import React, { useState } from 'react';
import { AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { patientsData, type CritiquePayload } from '../../../data/patients';
import { type CritiqueForm, emptyCritique } from './types';
import { Field } from './shared';

export const CritiqueFormSection: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form, setForm]         = useState<CritiqueForm>(emptyCritique());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [createdIpp, setCreatedIpp] = useState<string | null>(null);

  const set = (k: keyof CritiqueForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdmit = async () => {
    setLoading(true); setError(null);
    try {
      const payload: CritiquePayload = {
        ...(form.nom.trim()                    && { nom: form.nom }),
        ...(form.prenom.trim()                 && { prenom: form.prenom }),
        ...(form.sexe                          && { sexe: form.sexe as 'M' | 'F' | 'Autre' }),
        ...(form.ageEstime.trim()              && { ageEstime: Number(form.ageEstime) }),
        ...(form.accompagnantNom.trim()        && { accompagnantNom: form.accompagnantNom }),
        ...(form.accompagnantTelephone.trim()  && { accompagnantTelephone: form.accompagnantTelephone }),
        ...(form.circonstancesAdmission.trim() && { circonstancesAdmission: form.circonstancesAdmission }),
      };
      const result = await patientsData.admettreEnUrgence(payload);
      setCreatedIpp(result.numeroIpp);
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l\'admission.');
    } finally { setLoading(false); }
  };

  if (createdIpp) return (
    <div className="adm-card">
      <div className="adm-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <AlertTriangle size={52} color="var(--c-red)" style={{ marginBottom: 16 }} />
        <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--c-red)', marginBottom: 8 }}>
          Admission critique enregistrée
        </p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', marginBottom: 12 }}>
          IPP provisoire généré — À compléter après stabilisation
        </p>
        <span className="adm-tag adm-t-red" style={{ fontSize: 14, padding: '6px 16px', marginBottom: 24, display: 'inline-block', fontFamily: 'JetBrains Mono, monospace' }}>
          {createdIpp}
        </span>
        <div>
          <button className="adm-btn" onClick={() => { setForm(emptyCritique()); setCreatedIpp(null); }}>
            <RotateCcw size={13} /> Nouvelle admission critique
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="adm-alert adm-alert-danger">
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Admission en état critique</p>
          <p style={{ fontSize: 12, lineHeight: 1.5 }}>
            Le patient sera pris en charge immédiatement. Un numéro IPP provisoire sera généré.
            Un accompagnant devra compléter les informations administratives après stabilisation.
          </p>
        </div>
      </div>

      {error && (
        <div className="adm-alert adm-alert-danger">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />{error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>×</button>
        </div>
      )}

      <div className="adm-form-section">
        <div className="adm-form-section-head">
          <span style={{
            width: 28, height: 28, borderRadius: 7, background: 'var(--c-red-bg)',
            color: 'var(--c-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={14} />
          </span>
          <p className="adm-card-title">
            Informations minimales <span style={{ color: 'var(--c-t3)', fontWeight: 400, fontSize: 11 }}>(si disponibles)</span>
          </p>
          <span className="adm-tag adm-t-green" style={{ marginLeft: 'auto', fontSize: 11 }}>Tout est optionnel</span>
        </div>
        <div className="adm-form-section-body">
          <div className="adm-form-grid adm-form-grid-3">
            <Field label="Nom (si connu)"><input className="adm-input" placeholder="Inconnu si non disponible" value={form.nom} onChange={set('nom')} /></Field>
            <Field label="Prénom (si connu)"><input className="adm-input" placeholder="Inconnu si non disponible" value={form.prenom} onChange={set('prenom')} /></Field>
            <Field label="Sexe (si visible)">
              <select className="adm-input" value={form.sexe} onChange={set('sexe')}>
                <option value="">— Non déterminé —</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </Field>
            <Field label="Âge estimé"><input className="adm-input" placeholder="Ex: 35" value={form.ageEstime} onChange={set('ageEstime')} /></Field>
            <Field label="Accompagnant (nom)"><input className="adm-input" placeholder="Nom de l'accompagnant" value={form.accompagnantNom} onChange={set('accompagnantNom')} /></Field>
            <Field label="Téléphone accompagnant"><input className="adm-input" placeholder="+229 97 00 00 00" value={form.accompagnantTelephone} onChange={set('accompagnantTelephone')} /></Field>
            <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
              <label className="adm-label">Circonstances d'admission</label>
              <textarea
                className="adm-input" rows={3}
                placeholder="Accident, malaise, blessure… (informations des secours ou de l'accompagnant)"
                value={form.circonstancesAdmission} onChange={set('circonstancesAdmission')}
              />
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, padding: '12px 16px',
          borderTop: '1px solid var(--c-bdr)', background: 'var(--c-surf2)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--c-t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} /> Le profil sera marqué « Incomplet » — À compléter par un agent
          </span>
          <button
            className="adm-btn adm-btn-primary"
            onClick={handleAdmit}
            disabled={loading}
            style={{ background: 'var(--c-red)', borderColor: 'var(--c-red)' }}
          >
            <AlertTriangle size={13} />
            {loading ? 'Enregistrement…' : 'Admettre en urgence — Générer IPP provisoire'}
          </button>
        </div>
      </div>
    </div>
  );
};
