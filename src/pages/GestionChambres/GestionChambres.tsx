import { useState, useEffect, useMemo } from 'react';
import {
  getChambres,
  getPoles,
  getServices,
  poleLabel,
} from '../../services/chambres';
import type { Chambre, Pole, ServiceHospitalier } from '../../services/chambres';
import ChambreFormModal from './Gestionformmodal/Gestionformmodal';
import DeleteChambreModal from './Deletechambremodal/Deletechambremodal';

// ─── Badge Statut actif/inactif ───────────────────────────────────────────────

const ActiveBadge = ({ estActive }: { estActive: boolean }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: estActive ? '#ECFDF5' : '#FEF2F2',
    color:      estActive ? '#166534' : '#991B1B',
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
      background: estActive ? '#22C55E' : '#EF4444',
    }} />
    {estActive ? 'Active' : 'Inactive'}
  </span>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const GestionChambres = () => {
  const [chambres, setChambres]   = useState<Chambre[]>([]);
  const [poles, setPoles]         = useState<Pole[]>([]);
  const [services, setServices]   = useState<ServiceHospitalier[]>([]);
  const [loading, setLoading]     = useState(true);

  const [filterPole,    setFilterPole]    = useState('');
  const [filterService, setFilterService] = useState('');
  const [search,        setSearch]        = useState('');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget,    setEditTarget]    = useState<Chambre | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<Chambre | null>(null);

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
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.numero.toLowerCase().includes(q) ||
      (c.designation ?? '').toLowerCase().includes(q) ||
      (c.etage ?? '').toLowerCase().includes(q) ||
      c.service.nom.toLowerCase().includes(q) ||
      poleLabel(c.service.pole.nom).toLowerCase().includes(q)
    );
  }), [chambres, search]);

  const stats = useMemo(() => ({
    total:     chambres.length,
    actives:   chambres.filter((c) => c.estActive).length,
    inactives: chambres.filter((c) => !c.estActive).length,
    services:  new Set(chambres.map((c) => c.service.id)).size,
  }), [chambres]);

  const handleSaved   = () => { setShowFormModal(false); setEditTarget(null); fetchChambres(); };
  const handleDeleted = () => { setDeleteTarget(null); fetchChambres(); };
  const openCreate    = () => { setEditTarget(null); setShowFormModal(true); };
  const openEdit      = (c: Chambre) => { setEditTarget(c); setShowFormModal(true); };
  const hasFilters    = !!(filterPole || filterService || search);

  const resetFilters  = () => { setFilterPole(''); setFilterService(''); setSearch(''); };

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
    <div style={{
      padding: '28px 32px', background: '#F8FAFC',
      minHeight: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>

      {/* ── Titre + Bouton ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24,
      }}>
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
          { label: 'TOTAL CHAMBRES',  value: stats.total,     bg: '#EFF8FF', border: '#BAE6FD', color: '#0369A1', icon: 'bi-door-open'     },
          { label: 'ACTIVES',         value: stats.actives,   bg: '#F0FDF4', border: '#BBF7D0', color: '#15803D', icon: 'bi-check-circle'   },
          { label: 'INACTIVES',       value: stats.inactives, bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C', icon: 'bi-x-circle'       },
          { label: 'SERVICES COUVERTS', value: stats.services, bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C', icon: 'bi-diagram-3'    },
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

      {/* ── Recherche + Filtres ── */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
        padding: '16px 20px', marginBottom: 20,
      }}>
        {/* Recherche */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', fontSize: 13,
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, désignation, étage, service, pôle..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
              border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14,
              color: '#111827', background: '#FAFAFA', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Filtre pôle */}
          <select style={selectSt} value={filterPole} onChange={(e) => setFilterPole(e.target.value)}>
            <option value="">Tous les pôles</option>
            {poles.map((p) => <option key={p.id} value={p.id}>{poleLabel(p.nom)}</option>)}
          </select>

          {/* Filtre service (dépend du pôle) */}
          <select
            style={{
              ...selectSt,
              opacity: !filterPole ? 0.55 : 1,
              cursor: !filterPole ? 'not-allowed' : 'pointer',
            }}
            value={filterService}
            disabled={!filterPole}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="">
              {!filterPole ? 'Sélectionnez un pôle d\'abord' : 'Tous les services'}
            </option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={resetFilters}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB',
                background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <i className="bi bi-x" />
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
                ? 'Créez votre première chambre en cliquant sur « Nouvelle chambre ».'
                : 'Aucun résultat pour ces critères de recherche.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E5E7EB' }}>
                  <th style={thSt}>N° CHAMBRE</th>
                  <th style={thSt}>DÉSIGNATION</th>
                  <th style={thSt}>ÉTAGE</th>
                  <th style={thSt}>PÔLE / SERVICE</th>
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
                    {/* N° Chambre */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0C4A6E', fontFamily: 'monospace' }}>
                        {c.numero}
                      </span>
                    </td>

                    {/* Désignation */}
                    <td style={{ padding: '13px 16px', maxWidth: 180 }}>
                      {c.designation ? (
                        <span style={{ fontSize: 13, color: '#374151' }}>{c.designation}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#D1D5DB' }}>—</span>
                      )}
                    </td>

                    {/* Étage */}
                    <td style={{ padding: '13px 16px' }}>
                      {c.etage ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 500, color: '#374151',
                          background: '#F1F5F9', borderRadius: 6, padding: '3px 8px',
                        }}>
                          <i className="bi bi-layers" style={{ fontSize: 10 }} />
                          {c.etage}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#D1D5DB' }}>—</span>
                      )}
                    </td>

                    {/* Pôle / Service */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                        {c.service.nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        {poleLabel(c.service.pole.nom)}
                      </div>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: '13px 16px' }}>
                      <ActiveBadge estActive={c.estActive} />
                    </td>

                    {/* Actions */}
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
            background: '#FAFAFA', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
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
