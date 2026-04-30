import { useState, useEffect, useMemo } from 'react';
import {
  getChambres,
  getPoles,
  getServices,
  TypeChambre,
  StatutChambre,
  TYPE_CHAMBRE_LABELS,
  STATUT_CHAMBRE_LABELS,
} from '../../services/chambres';
import type { Chambre, Pole, ServiceHospitalier } from '../../services/chambres';
import ChambreFormModal from './Gestionformmodal';
import DeleteChambreModal from './Deletechambremodal';

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<StatutChambre, { bg: string; color: string; dot: string }> = {
  [StatutChambre.DISPONIBLE]:     { bg: '#ECFDF5', color: '#166534', dot: '#22C55E' },
  [StatutChambre.OCCUPEE]:        { bg: '#FFF7ED', color: '#9A3412', dot: '#F97316' },
  [StatutChambre.EN_MAINTENANCE]: { bg: '#FEFCE8', color: '#854D0E', dot: '#EAB308' },
  [StatutChambre.HORS_SERVICE]:   { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
};

const StatutBadge = ({ statut }: { statut: StatutChambre }) => {
  const c = STATUT_CFG[statut];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {STATUT_CHAMBRE_LABELS[statut]}
    </span>
  );
};

const TYPE_CFG: Record<TypeChambre, { bg: string; color: string }> = {
  [TypeChambre.INDIVIDUELLE]:    { bg: '#EFF6FF', color: '#1D4ED8' },
  [TypeChambre.DOUBLE]:          { bg: '#F0FDF4', color: '#15803D' },
  [TypeChambre.COMMUNE]:         { bg: '#FAF5FF', color: '#7C3AED' },
  [TypeChambre.SOINS_INTENSIFS]: { bg: '#FFF1F2', color: '#BE123C' },
  [TypeChambre.SUITE_PRIVEE]:    { bg: '#FFFBEB', color: '#B45309' },
};

const TypeBadge = ({ type }: { type: TypeChambre }) => {
  const c = TYPE_CFG[type];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color,
      letterSpacing: '0.02em',
    }}>
      {TYPE_CHAMBRE_LABELS[type]}
    </span>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const GestionChambres = () => {
  const [chambres, setChambres]   = useState<Chambre[]>([]);
  const [poles, setPoles]         = useState<Pole[]>([]);
  const [services, setServices]   = useState<ServiceHospitalier[]>([]);
  const [loading, setLoading]     = useState(true);

  const [filterPole, setFilterPole]       = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterType, setFilterType]       = useState('');
  const [filterStatut, setFilterStatut]   = useState('');
  const [search, setSearch]               = useState('');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget]       = useState<Chambre | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Chambre | null>(null);

  const fetchChambres = async () => {
    setLoading(true);
    try {
      const data = await getChambres(
        filterService ? { serviceId: filterService }
          : filterPole ? { poleId: filterPole }
          : {}
      );
      setChambres(data);
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchChambres(); }, [filterPole, filterService]);
  useEffect(() => { getPoles().then(setPoles).catch(() => {}); }, []);
  useEffect(() => {
    if (!filterPole) { setServices([]); setFilterService(''); return; }
    getServices(filterPole).then(setServices).catch(() => {});
    setFilterService('');
  }, [filterPole]);

  const filtered = useMemo(() => chambres.filter((c) => {
    if (filterType   && c.type   !== filterType)   return false;
    if (filterStatut && c.statut !== filterStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.numero.toLowerCase().includes(q) &&
          !c.service.nom.toLowerCase().includes(q) &&
          !c.service.pole.nom.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [chambres, filterType, filterStatut, search]);

  const stats = useMemo(() => ({
    total:       chambres.length,
    disponible:  chambres.filter((c) => c.statut === StatutChambre.DISPONIBLE).length,
    occupee:     chambres.filter((c) => c.statut === StatutChambre.OCCUPEE).length,
    maintenance: chambres.filter((c) => c.statut === StatutChambre.EN_MAINTENANCE).length,
  }), [chambres]);

  const handleSaved   = () => { setShowFormModal(false); setEditTarget(null); fetchChambres(); };
  const handleDeleted = () => { setDeleteTarget(null); fetchChambres(); };
  const openCreate    = () => { setEditTarget(null); setShowFormModal(true); };
  const openEdit      = (c: Chambre) => { setEditTarget(c); setShowFormModal(true); };
  const hasFilters    = !!(filterPole || filterService || filterType || filterStatut || search);

  const resetFilters = () => {
    setFilterPole(''); setFilterService('');
    setFilterType(''); setFilterStatut(''); setSearch('');
  };

  // ─── Styles communs ───────────────────────────────────────────────────────

  const selectSt: React.CSSProperties = {
    padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: 13, color: '#374151', background: '#fff',
    outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
    flex: 1, minWidth: 0,
  };

  const thSt: React.CSSProperties = {
    padding: '11px 16px', textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em',
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* ── Titre + Bouton ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#0F172A', letterSpacing: '-0.3px' }}>
            Gestion des chambres
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748B' }}>
            Créez, modifiez et gérez les chambres par pôle et service
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: '#0EA5E9', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
          }}
        >
          <i className="bi bi-plus-lg" />
          Nouvelle chambre
        </button>
      </div>

      {/* ── Cartes statistiques ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL CHAMBRES',  value: stats.total,       bg: '#EFF8FF', border: '#BAE6FD', color: '#0369A1', icon: 'bi-building' },
          { label: 'DISPONIBLES',     value: stats.disponible,  bg: '#F0FDF4', border: '#BBF7D0', color: '#15803D', icon: 'bi-check-circle' },
          { label: 'OCCUPÉES',        value: stats.occupee,     bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C', icon: 'bi-door-open' },
          { label: 'EN MAINTENANCE',  value: stats.maintenance, bg: '#FEFCE8', border: '#FEF08A', color: '#A16207', icon: 'bi-tools' },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, border: `1.5px solid ${s.border}`,
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>
                {s.label}
              </span>
              <i className={`bi ${s.icon}`} style={{ fontSize: 16, color: s.color, opacity: 0.6 }} />
            </div>
            <span style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Zone de recherche + filtres ── */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
        padding: '16px 20px', marginBottom: 20,
      }}>
        {/* Ligne 1 : Recherche */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', fontSize: 13,
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Patient, service, salle..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
              border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14,
              color: '#111827', background: '#FAFAFA', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Ligne 2 : Filtres */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={selectSt} value={filterPole} onChange={(e) => setFilterPole(e.target.value)}>
            <option value="">Tous les pôles</option>
            {poles.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>

          <select
            style={{ ...selectSt, opacity: !filterPole ? 0.55 : 1, cursor: !filterPole ? 'not-allowed' : 'pointer' }}
            value={filterService}
            disabled={!filterPole}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="">Tous les services</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>

          <select style={selectSt} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tous les types</option>
            {Object.values(TypeChambre).map((t) => (
              <option key={t} value={t}>{TYPE_CHAMBRE_LABELS[t]}</option>
            ))}
          </select>

          <select style={selectSt} value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            {Object.values(StatutChambre).map((s) => (
              <option key={s} value={s}>{STATUT_CHAMBRE_LABELS[s]}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={resetFilters}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB',
                background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              <i className="bi bi-x me-1" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
            <div className="spinner-border spinner-border-sm me-2" />
            <span style={{ fontSize: 14 }}>Chargement des chambres...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🛏️</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: 15 }}>
              Aucune chambre trouvée
            </p>
            <p style={{ margin: '4px 0 0', color: '#9CA3AF', fontSize: 13 }}>
              {chambres.length === 0
                ? 'Créez votre première chambre.'
                : 'Modifiez vos critères de recherche.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E5E7EB' }}>
                  <th style={thSt}>N° CHAMBRE</th>
                  <th style={thSt}>TYPE</th>
                  <th style={thSt}>PÔLE / SERVICE</th>
                  <th style={thSt}>CAPACITÉ</th>
                  <th style={thSt}>STATUT</th>
                  <th style={{ ...thSt, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0C4A6E' }}>
                        {c.numero}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <TypeBadge type={c.type} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                        {c.service.nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
                        {c.service.pole.nom}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        {c.capacite} lit{c.capacite > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <StatutBadge statut={c.statut} />
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEdit(c)}
                          style={{
                            padding: '6px 12px', borderRadius: 7,
                            border: '1.5px solid #E5E7EB', background: '#fff',
                            color: '#0369A1', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          style={{
                            padding: '6px 12px', borderRadius: 7,
                            border: '1.5px solid #FEE2E2', background: '#FFF5F5',
                            color: '#EF4444', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          <i className="bi bi-trash3" style={{ fontSize: 11 }} />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '10px 20px', borderTop: '1px solid #F1F5F9',
            background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              {filtered.length} chambre{filtered.length > 1 ? 's' : ''}
              {filtered.length !== chambres.length && ` (sur ${chambres.length})`}
            </span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showFormModal && (
        <ChambreFormModal
          chambre={editTarget}
          poles={poles}
          onClose={() => { setShowFormModal(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteChambreModal
          chambre={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default GestionChambres;