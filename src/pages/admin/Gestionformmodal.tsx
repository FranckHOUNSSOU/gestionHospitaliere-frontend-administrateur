import { useState, useEffect } from 'react';
import {
  createChambre,
  updateChambre,
  getServices,
  TypeChambre,
  StatutChambre,
  TYPE_CHAMBRE_LABELS,
  STATUT_CHAMBRE_LABELS,
} from '../../services/chambres';
import type {
  Chambre,
  Pole,
  ServiceHospitalier,
  CreateChambreDto,
  UpdateChambreDto,
} from '../../services/chambres';

interface ChambreFormModalProps {
  chambre?: Chambre | null;
  poles: Pole[];
  onClose: () => void;
  onSaved: () => void;
}

// ─── Logique capacité par type de chambre ─────────────────────────────────────

/**
 * Certains types de chambre ont une capacité fixe et logique :
 *  - Individuelle  → 1 lit  (par définition : une personne seule)
 *  - Double        → 2 lits (par définition : deux personnes)
 *  - Suite privée  → 1 lit  (chambre haut de gamme, mais individuelle)
 *  - Commune       → libre, min 3  (grande salle partagée)
 *  - Soins intensifs → libre, min 1 (variable selon configuration)
 */
const CAPACITE_FIXE: Partial<Record<TypeChambre, number>> = {
  [TypeChambre.INDIVIDUELLE]: 1,
  [TypeChambre.DOUBLE]:       2,
  [TypeChambre.SUITE_PRIVEE]: 1,
};

const CAPACITE_MIN: Record<TypeChambre, number> = {
  [TypeChambre.INDIVIDUELLE]:    1,
  [TypeChambre.DOUBLE]:          2,
  [TypeChambre.COMMUNE]:         3,
  [TypeChambre.SOINS_INTENSIFS]: 1,
  [TypeChambre.SUITE_PRIVEE]:    1,
};

const CAPACITE_INFO: Partial<Record<TypeChambre, string>> = {
  [TypeChambre.INDIVIDUELLE]:    'Une chambre individuelle accueille toujours 1 patient.',
  [TypeChambre.DOUBLE]:          'Une chambre double accueille exactement 2 patients.',
  [TypeChambre.SUITE_PRIVEE]:    'Une suite privée est réservée à 1 seul patient.',
  [TypeChambre.COMMUNE]:         'Salle commune — minimum 3 lits.',
  [TypeChambre.SOINS_INTENSIFS]: 'En soins intensifs, chaque lit est un poste de surveillance.',
};

const FORM_INITIAL: CreateChambreDto = {
  numero: '', type: TypeChambre.INDIVIDUELLE, capacite: 1, description: '', serviceId: '',
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const label: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280',
  letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#0369A1',
  letterSpacing: '0.09em', textTransform: 'uppercase',
  borderBottom: '1.5px solid #E5E7EB', paddingBottom: 9, marginBottom: 18,
};

const fieldBase: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 14, color: '#111827', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

const fieldWithIcon: React.CSSProperties = { ...fieldBase, paddingLeft: 36 };

const iconPos: React.CSSProperties = {
  position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
  color: '#9CA3AF', fontSize: 14, pointerEvents: 'none', lineHeight: 1,
};

// ─── Composant ────────────────────────────────────────────────────────────────

const ChambreFormModal = ({ chambre, poles, onClose, onSaved }: ChambreFormModalProps) => {
  const isEdit = !!chambre;

  const [form, setForm] = useState<CreateChambreDto>(
    chambre
      ? {
          numero: chambre.numero, type: chambre.type,
          capacite: chambre.capacite, description: chambre.description ?? '',
          serviceId: chambre.service.id,
        }
      : FORM_INITIAL
  );
  const [statut, setStatut]               = useState<StatutChambre>(chambre?.statut ?? StatutChambre.DISPONIBLE);
  const [selectedPoleId, setSelectedPoleId] = useState<string>(chambre?.service.pole.id ?? '');
  const [services, setServices]           = useState<ServiceHospitalier[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  // Quand le type change → on applique la capacité fixe si applicable
  useEffect(() => {
    const fixe = CAPACITE_FIXE[form.type];
    if (fixe !== undefined) {
      setForm((f) => ({ ...f, capacite: fixe }));
    } else {
      // Si on passe à Commune ou Soins intensifs, on s'assure que le min est respecté
      setForm((f) => ({
        ...f,
        capacite: Math.max(f.capacite, CAPACITE_MIN[form.type]),
      }));
    }
  }, [form.type]);

  useEffect(() => {
    if (!selectedPoleId) { setServices([]); return; }
    getServices(selectedPoleId).then(setServices).catch(() => setServices([]));
  }, [selectedPoleId]);

  const handlePoleChange = (poleId: string) => {
    setSelectedPoleId(poleId);
    setForm((f) => ({ ...f, serviceId: '' }));
  };

  const handleSubmit = async () => {
    if (!form.numero.trim()) { setError('Le numéro de chambre est obligatoire.'); return; }
    if (!form.serviceId)     { setError('Veuillez sélectionner un service.');      return; }
    setLoading(true); setError('');
    try {
      if (isEdit && chambre) {
        await updateChambre(chambre.id, { ...form, statut } as UpdateChambreDto);
      } else {
        await createChambre(form);
      }
      onSaved();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const capaciteFixe  = CAPACITE_FIXE[form.type] !== undefined;
  const capaciteInfo  = CAPACITE_INFO[form.type];

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Conteneur centré */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1055,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 600,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: '24px 28px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#111827', lineHeight: 1.3 }}>
                {isEdit ? 'Modifier la chambre' : 'Créer une chambre'}
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
                {isEdit
                  ? `Modifiez les informations de la chambre ${chambre!.numero}.`
                  : 'Remplissez les informations pour ajouter une nouvelle chambre.'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9CA3AF', padding: 6, borderRadius: 6,
                display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 12,
              }}
            >
              <i className="bi bi-x-lg" style={{ fontSize: 16 }} />
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                padding: '10px 14px', background: '#FEF2F2',
                border: '1px solid #FECACA', borderRadius: 8,
                color: '#B91C1C', fontSize: 13,
              }}>
                <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* ────── IDENTIFICATION ────── */}
            <p style={sectionTitle}>Identification</p>

            <div className="row g-3" style={{ marginBottom: 24 }}>

              {/* Numéro */}
              <div className="col-7">
                <label style={label}>
                  Numéro de chambre <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-hash" style={iconPos} />
                  <input
                    style={fieldWithIcon}
                    value={form.numero}
                    placeholder="ex : CH-101"
                    onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                  />
                </div>
              </div>

              {/* Capacité */}
              <div className="col-5">
                <label style={label}>
                  Capacité (lits) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-person" style={iconPos} />
                  <input
                    style={{
                      ...fieldWithIcon,
                      background: capaciteFixe ? '#F9FAFB' : '#fff',
                      color: capaciteFixe ? '#6B7280' : '#111827',
                      cursor: capaciteFixe ? 'not-allowed' : 'text',
                    }}
                    type="number"
                    min={CAPACITE_MIN[form.type]}
                    max={20}
                    value={form.capacite}
                    disabled={capaciteFixe}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacite: Math.max(CAPACITE_MIN[f.type], +e.target.value) }))
                    }
                  />
                </div>
                {/* Info contextuelle */}
                {capaciteInfo && (
                  <p style={{
                    margin: '5px 0 0', fontSize: 11, color: capaciteFixe ? '#0369A1' : '#6B7280',
                    display: 'flex', alignItems: 'flex-start', gap: 4, lineHeight: 1.4,
                  }}>
                    <i className={`bi ${capaciteFixe ? 'bi-lock-fill' : 'bi-info-circle'}`}
                       style={{ fontSize: 10, marginTop: 2, flexShrink: 0 }} />
                    {capaciteInfo}
                  </p>
                )}
              </div>

              {/* Type de chambre */}
              <div className="col-12">
                <label style={label}>
                  Type de chambre <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-tag" style={iconPos} />
                  <select
                    style={fieldWithIcon}
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TypeChambre }))}
                  >
                    {Object.values(TypeChambre).map((t) => (
                      <option key={t} value={t}>{TYPE_CHAMBRE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ────── LOCALISATION ────── */}
            <p style={sectionTitle}>Localisation</p>

            <div className="row g-3" style={{ marginBottom: isEdit ? 24 : 0 }}>
              {/* Pôle */}
              <div className="col-12">
                <label style={label}>
                  Pôle <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-building" style={iconPos} />
                  <select
                    style={fieldWithIcon}
                    value={selectedPoleId}
                    onChange={(e) => handlePoleChange(e.target.value)}
                  >
                    <option value="">— Sélectionner un pôle —</option>
                    {poles.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
              </div>

              {/* Service */}
              <div className="col-12">
                <label style={label}>
                  Service <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-diagram-3" style={iconPos} />
                  <select
                    style={{
                      ...fieldWithIcon,
                      opacity: !selectedPoleId ? 0.5 : 1,
                      cursor: !selectedPoleId ? 'not-allowed' : 'pointer',
                    }}
                    value={form.serviceId}
                    disabled={!selectedPoleId}
                    onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
                  >
                    <option value="">— Sélectionner un service —</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ────── STATUT (modification uniquement) ────── */}
            {isEdit && (
              <>
                <p style={sectionTitle}>Statut</p>
                <div className="row g-3" style={{ marginBottom: 0 }}>
                  <div className="col-12">
                    <label style={label}>Statut de la chambre</label>
                    <div style={{ position: 'relative' }}>
                      <i className="bi bi-circle-half" style={iconPos} />
                      <select
                        style={fieldWithIcon}
                        value={statut}
                        onChange={(e) => setStatut(e.target.value as StatutChambre)}
                      >
                        {Object.values(StatutChambre).map((s) => (
                          <option key={s} value={s}>{STATUT_CHAMBRE_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ────── Description ────── */}
            <div style={{ marginTop: 24 }}>
              <label style={label}>Description (optionnel)</label>
              <textarea
                style={{ ...fieldBase, resize: 'vertical', minHeight: 84, lineHeight: 1.6 }}
                value={form.description}
                placeholder="Notes, particularités..."
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '16px 28px', borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            background: '#FAFAFA', borderRadius: '0 0 12px 12px', flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 22px', borderRadius: 8, cursor: 'pointer',
                border: '1.5px solid #E5E7EB', background: '#fff',
                color: '#374151', fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '9px 24px', borderRadius: 8, border: 'none',
                background: loading ? '#7DD3FC' : '#0EA5E9',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Enregistrement...</>
              ) : isEdit ? 'Mettre à jour' : 'Créer la chambre'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChambreFormModal;