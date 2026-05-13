import { useState, useEffect } from 'react';
import {
  createChambre,
  updateChambre,
  getServices,
  poleLabel,
  TYPE_CHAMBRE_LABELS,
} from '../../../services/chambres';
import type {
  Chambre,
  Pole,
  ServiceHospitalier,
  TypeChambre,
  CreateChambreDto,
  UpdateChambreDto,
} from '../../../services/chambres';

interface ChambreFormState {
  numero:      string;
  designation: string;
  etage:       string;
  serviceId:   string;
  type:        TypeChambre;
  capacite:    string;
}

interface ChambreFormModalProps {
  chambre?: Chambre | null;
  poles:    Pole[];
  onClose:  () => void;
  onSaved:  () => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  label: {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280',
    letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 11, fontWeight: 700, color: '#0369A1',
    letterSpacing: '0.09em', textTransform: 'uppercase',
    borderBottom: '1.5px solid #E5E7EB', paddingBottom: 9, marginBottom: 18,
  } as React.CSSProperties,

  field: {
    width: '100%', padding: '10px 12px 10px 36px',
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: 14, color: '#111827', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  } as React.CSSProperties,

  fieldPlain: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: 14, color: '#111827', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  } as React.CSSProperties,

  fieldDisabled: {
    opacity: 0.5, cursor: 'not-allowed', background: '#F9FAFB',
  } as React.CSSProperties,

  icon: {
    position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
    color: '#9CA3AF', fontSize: 14, pointerEvents: 'none', lineHeight: 1,
  } as React.CSSProperties,
};

// ─── Composant ────────────────────────────────────────────────────────────────

const ChambreFormModal = ({ chambre, poles, onClose, onSaved }: ChambreFormModalProps) => {
  const isEdit = !!chambre;

  const [form, setForm] = useState<ChambreFormState>(
    chambre
      ? {
          numero:      chambre.numero,
          designation: chambre.designation ?? '',
          etage:       chambre.etage ?? '',
          serviceId:   chambre.service.id,
          type:        chambre.type,
          capacite:    String(chambre.capacite),
        }
      : { numero: '', designation: '', etage: '', serviceId: '', type: 'INDIVIDUELLE', capacite: '1' }
  );
  const [estActive, setEstActive]           = useState<boolean>(chambre?.estActive ?? true);
  const [selectedPoleId, setSelectedPoleId] = useState<string>(chambre?.service.pole.id ?? '');
  const [services, setServices]             = useState<ServiceHospitalier[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState('');

  useEffect(() => {
    if (!selectedPoleId) { setServices([]); return; }
    setLoadingServices(true);
    getServices(selectedPoleId)
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [selectedPoleId]);

  const handlePoleChange = (poleId: string) => {
    setSelectedPoleId(poleId);
    setForm((f) => ({ ...f, serviceId: '' }));
  };

  const set = (k: keyof ChambreFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.numero.trim())  { setError('Le numéro de chambre est obligatoire.'); return; }
    if (form.numero.trim().length > 20) { setError('Le numéro ne doit pas dépasser 20 caractères.'); return; }
    if (!form.serviceId)      { setError('Veuillez sélectionner un service.'); return; }
    const capaciteNum = parseInt(form.capacite, 10);
    if (!form.capacite || isNaN(capaciteNum) || capaciteNum < 1) {
      setError('La capacité doit être un entier positif (≥ 1).'); return;
    }

    setSaving(true);
    try {
      const dto: CreateChambreDto = {
        numero:   form.numero.trim(),
        type:     form.type,
        capacite: capaciteNum,
        ...(form.designation.trim() && { designation: form.designation.trim() }),
        ...(form.etage.trim()       && { etage: form.etage.trim() }),
      };

      if (isEdit && chambre) {
        const updateDto: UpdateChambreDto = { ...dto, estActive };
        await updateChambre(chambre.id, updateDto);
      } else {
        await createChambre(form.serviceId, dto);
      }
      onSaved();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Une erreur est survenue.'));
    } finally {
      setSaving(false);
    }
  };

  const serviceDisabled = !selectedPoleId || loadingServices;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Centrage */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1055,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{
          background: '#fff', borderRadius: 14, width: '100%', maxWidth: 580,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: '22px 28px 18px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg,#0EA5E9,#0369A1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className="bi bi-door-open" style={{ fontSize: 18, color: '#fff' }} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: '#0F172A', lineHeight: 1.2 }}>
                  {isEdit ? 'Modifier la chambre' : 'Nouvelle chambre'}
                </h5>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748B' }}>
                  {isEdit
                    ? `Modifiez les informations de la chambre ${chambre!.numero}`
                    : 'Renseignez les informations pour créer une chambre'}
                </p>
              </div>
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

            {/* Erreur */}
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

            {/* ── IDENTIFICATION ── */}
            <p style={S.sectionTitle}>
              <i className="bi bi-tag me-1" />
              Identification
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>

              {/* Numéro */}
              <div>
                <label style={S.label}>
                  Numéro de chambre <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-hash" style={S.icon} />
                  <input
                    style={S.field}
                    value={form.numero}
                    maxLength={20}
                    placeholder="ex : CH-101"
                    onChange={set('numero')}
                  />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                  20 caractères maximum
                </p>
              </div>

              {/* Désignation */}
              <div>
                <label style={S.label}>Désignation</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-card-text" style={S.icon} />
                  <input
                    style={S.field}
                    value={form.designation}
                    maxLength={100}
                    placeholder="ex : Chambre de soins intensifs"
                    onChange={set('designation')}
                  />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                  Description courte de la chambre (optionnel)
                </p>
              </div>

              {/* Type + Capacité */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={S.label}>
                    Type de chambre <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-grid" style={S.icon} />
                    <select style={S.field} value={form.type} onChange={set('type')}>
                      {(Object.keys(TYPE_CHAMBRE_LABELS) as TypeChambre[]).map(t => (
                        <option key={t} value={t}>{TYPE_CHAMBRE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={S.label}>
                    Capacité (lits) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-person-plus" style={S.icon} />
                    <input
                      type="number"
                      min={1}
                      style={S.field}
                      value={form.capacite}
                      placeholder="ex : 2"
                      onChange={set('capacite')}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ── LOCALISATION ── */}
            <p style={S.sectionTitle}>
              <i className="bi bi-geo-alt me-1" />
              Localisation
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: isEdit ? 28 : 0 }}>

              {/* Étage */}
              <div>
                <label style={S.label}>Étage</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-layers" style={S.icon} />
                  <input
                    style={S.field}
                    value={form.etage}
                    maxLength={20}
                    placeholder="ex : 2ème étage, RDC, Sous-sol"
                    onChange={set('etage')}
                  />
                </div>
              </div>

              {/* Pôle */}
              <div>
                <label style={S.label}>
                  Pôle hospitalier <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-building" style={S.icon} />
                  <select
                    style={S.field}
                    value={selectedPoleId}
                    onChange={(e) => handlePoleChange(e.target.value)}
                  >
                    <option value="">— Sélectionner un pôle —</option>
                    {poles.map((p) => (
                      <option key={p.id} value={p.id}>{poleLabel(p.nom)}</option>
                    ))}
                  </select>
                </div>
                {poles.length === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#F59E0B' }}>
                    <i className="bi bi-exclamation-triangle me-1" />
                    Aucun pôle disponible — créez d'abord un pôle.
                  </p>
                )}
              </div>

              {/* Service */}
              <div>
                <label style={S.label}>
                  Service <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-diagram-3" style={{
                    ...S.icon,
                    color: serviceDisabled ? '#D1D5DB' : '#9CA3AF',
                  }} />
                  <select
                    style={{
                      ...S.field,
                      ...(serviceDisabled ? S.fieldDisabled : {}),
                    }}
                    value={form.serviceId}
                    disabled={serviceDisabled}
                    onChange={set('serviceId')}
                  >
                    <option value="">
                      {loadingServices
                        ? 'Chargement...'
                        : !selectedPoleId
                          ? '— Sélectionnez d\'abord un pôle —'
                          : services.length === 0
                            ? '— Aucun service dans ce pôle —'
                            : '— Sélectionner un service —'}
                    </option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </div>
                {selectedPoleId && !loadingServices && services.length === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#F59E0B' }}>
                    <i className="bi bi-exclamation-triangle me-1" />
                    Aucun service trouvé pour ce pôle.
                  </p>
                )}
                {!selectedPoleId && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                    <i className="bi bi-info-circle me-1" />
                    Sélectionnez un pôle pour voir les services disponibles.
                  </p>
                )}
              </div>

            </div>

            {/* ── STATUT (modification uniquement) ── */}
            {isEdit && (
              <>
                <p style={S.sectionTitle}>
                  <i className="bi bi-toggle-on me-1" />
                  Statut
                </p>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: estActive ? '#F0FDF4' : '#FEF2F2',
                  border: `1.5px solid ${estActive ? '#BBF7D0' : '#FECACA'}`,
                  borderRadius: 10, transition: 'all .2s',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: estActive ? '#166534' : '#991B1B' }}>
                      {estActive ? 'Chambre active' : 'Chambre inactive'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
                      {estActive
                        ? 'La chambre est opérationnelle et visible dans le système'
                        : 'La chambre est désactivée et masquée des listes opérationnelles'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEstActive((v) => !v)}
                    style={{
                      position: 'relative', width: 48, height: 26,
                      borderRadius: 13, border: 'none', cursor: 'pointer',
                      background: estActive ? '#22C55E' : '#D1D5DB',
                      transition: 'background .2s', flexShrink: 0, marginLeft: 16,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3,
                      left: estActive ? 25 : 3,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      transition: 'left .2s',
                    }} />
                  </button>
                </div>
              </>
            )}

          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            background: '#FAFAFA', borderRadius: '0 0 14px 14px', flexShrink: 0,
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
              disabled={saving}
              style={{
                padding: '9px 24px', borderRadius: 8, border: 'none',
                background: saving ? '#7DD3FC' : '#0EA5E9',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background .15s',
              }}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm"
                    style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Enregistrement...
                </>
              ) : isEdit ? (
                <><i className="bi bi-check2" /> Mettre à jour</>
              ) : (
                <><i className="bi bi-plus-lg" /> Créer la chambre</>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChambreFormModal;
