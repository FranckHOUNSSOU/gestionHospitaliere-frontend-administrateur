import { useCallback, useEffect, useState } from 'react';
import client from '../../api/clients';

// ── Types ──────────────────────────────────────────────────────────────────────

type Periode = 'AUJOURD_HUI' | 'HIER' | 'MOIS_EN_COURS' | 'MOIS_DERNIER' | 'CUSTOM';
type LogModule = 'AUTH' | 'PATIENT' | 'SEJOUR' | 'MEDECIN' | 'CHAMBRE' | 'RENDEZVOUS' | 'FACTURATION' | 'SYSTEME';

interface ActivityLog {
  id: string;
  actorId: string | null;
  actorNom: string | null;
  actorRole: string | null;
  action: string;
  description: string;
  module: LogModule;
  cible: string | null;
  cibleId: string | null;
  createdAt: string;
}

interface LogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

interface Stats {
  total: number;
  aujourd_hui: number;
  cette_semaine: number;
}

// ── Configs visuelles ─────────────────────────────────────────────────────────

const MODULE_CONFIG: Record<LogModule, { label: string; color: string; bg: string; border: string }> = {
  AUTH:        { label: 'Auth',        color: 'var(--c-accent)',  bg: 'var(--c-accent-bg)',  border: 'var(--c-accent-bd)'  },
  PATIENT:     { label: 'Patient',     color: 'var(--c-green)',   bg: 'var(--c-green-bg)',   border: 'var(--c-green-bd)'   },
  SEJOUR:      { label: 'Séjour',      color: '#7c3aed',          bg: '#ede9fe',             border: '#c4b5fd'             },
  MEDECIN:     { label: 'Médecin',     color: 'var(--c-accent)',  bg: 'var(--c-accent-bg)',  border: 'var(--c-accent-bd)'  },
  CHAMBRE:     { label: 'Chambre',     color: 'var(--c-amber)',   bg: 'var(--c-amber-bg)',   border: 'var(--c-amber)'      },
  RENDEZVOUS:  { label: 'Rendez-vous', color: '#0891b2',          bg: '#e0f7fa',             border: '#67e8f9'             },
  FACTURATION: { label: 'Facturation', color: '#d97706',          bg: '#fef3c7',             border: '#fcd34d'             },
  SYSTEME:     { label: 'Système',     color: 'var(--c-t3)',      bg: 'var(--c-surf3)',      border: 'var(--c-bdr)'        },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CONNEXION:           <IconLogin />,
  DECONNEXION:         <IconLogout />,
  CREATION_COMPTE:     <IconUser />,
  SUPPRESSION_COMPTE:  <IconTrash />,
  ACTIVATION_COMPTE:   <IconCheck />,
  DESACTIVATION_COMPTE:<IconBan />,
  DEBLOCAGE_COMPTE:    <IconUnlock />,
  REINITIALISATION_MDP:<IconKey />,
  CHANGEMENT_ROLE:     <IconRole />,
  MODIFICATION_COMPTE: <IconEdit />,
  CREATION_PATIENT:    <IconPlus />,
  ACCUEIL_PATIENT:     <IconUser />,
  ADMISSION_URGENCE:   <IconAlert />,
  MODIFICATION_PATIENT:<IconEdit />,
  OUVERTURE_SEJOUR:    <IconFile />,
  CLOTURE_SEJOUR:      <IconCheck />,
  MOUVEMENT_PATIENT:   <IconMove />,
  AJOUT_DIAGNOSTIC:    <IconSteth />,
  AJOUT_PRESCRIPTION:  <IconPill />,
  CREATION_RENDEZVOUS: <IconCalendar />,
  SUPPRESSION_RENDEZVOUS:<IconTrash />,
  CREATION_PROFIL_MEDECIN:<IconUser />,
};

const PERIODES: { key: Periode; label: string }[] = [
  { key: 'AUJOURD_HUI',   label: "Aujourd'hui" },
  { key: 'HIER',          label: 'Hier' },
  { key: 'MOIS_EN_COURS', label: 'Mois en cours' },
  { key: 'MOIS_DERNIER',  label: 'Mois dernier' },
  { key: 'CUSTOM',        label: 'Personnalisé' },
];

// ── Composant principal ────────────────────────────────────────────────────────

export default function LogsPage() {
  const [logs, setLogs]           = useState<ActivityLog[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [erreur, setErreur]       = useState<string | null>(null);

  const [periode, setPeriode]     = useState<Periode>('AUJOURD_HUI');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin]     = useState('');
  const [module, setModule]       = useState<LogModule | ''>('');

  const LIMIT = 50;

  const charger = useCallback(async (p = 1) => {
    setLoading(true); setErreur(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: String(LIMIT) };
      if (periode !== 'CUSTOM') params.periode = periode;
      else {
        if (dateDebut) params.dateDebut = dateDebut;
        if (dateFin)   params.dateFin   = dateFin;
      }
      if (module) params.module = module;

      const qs = new URLSearchParams(params).toString();
      const res = await client.get<LogsResponse>(`/activity-logs?${qs}`);
      setLogs(res.data.data);
      setTotal(res.data.total);
      setPage(p);
    } catch (e: unknown) {
      setErreur((e as Error).message ?? 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, [periode, dateDebut, dateFin, module]);

  const chargerStats = useCallback(async () => {
    try {
      const res = await client.get<Stats>('/activity-logs/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { charger(1); chargerStats(); }, [charger, chargerStats]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="adm-main">

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-page-title">Journaux d'activité</h1>
        <p className="adm-page-sub">Traçabilité complète de toutes les actions effectuées sur la plateforme</p>
      </div>

      {/* Cartes statistiques */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <StatCard icon={<IconFile />} label="Total des événements" value={stats.total.toLocaleString('fr-FR')} color="var(--c-accent)" />
          <StatCard icon={<IconClock />} label="Aujourd'hui"          value={stats.aujourd_hui.toLocaleString('fr-FR')} color="var(--c-green)" />
          <StatCard icon={<IconCalendar />} label="7 derniers jours"  value={stats.cette_semaine.toLocaleString('fr-FR')} color="var(--c-amber)" />
        </div>
      )}

      {/* Filtres */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Chips période */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
              Période
            </span>
            {PERIODES.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriode(p.key)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: periode === p.key ? 'var(--c-accent)' : 'var(--c-surf2)',
                  color:      periode === p.key ? '#fff' : 'var(--c-t2)',
                  borderColor: periode === p.key ? 'var(--c-accent)' : 'var(--c-bdr)',
                  transition: 'all .15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date custom */}
          {periode === 'CUSTOM' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={labelSt}>Du</span>
                <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={inputSt} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={labelSt}>Au</span>
                <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} style={inputSt} />
              </div>
            </div>
          )}

          {/* Filtre module + bouton */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={labelSt}>Module</span>
              <select value={module} onChange={e => setModule(e.target.value as LogModule | '')} style={{ ...inputSt, paddingRight: 28 }}>
                <option value="">Tous les modules</option>
                {(Object.keys(MODULE_CONFIG) as LogModule[]).map(k => (
                  <option key={k} value={k}>{MODULE_CONFIG[k].label}</option>
                ))}
              </select>
            </div>
            <button className="adm-btn adm-btn-primary" onClick={() => charger(1)} disabled={loading} style={{ fontSize: 12 }}>
              {loading ? 'Chargement…' : 'Appliquer'}
            </button>
            <button className="adm-btn" onClick={() => { setPeriode('AUJOURD_HUI'); setModule(''); setDateDebut(''); setDateFin(''); }} style={{ fontSize: 12 }}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Erreur */}
      {erreur && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: 'var(--c-red-bg)', color: 'var(--c-red)',
          border: '1px solid var(--c-red)', fontSize: 12,
        }}>
          {erreur}
        </div>
      )}

      {/* Tableau */}
      <div className="adm-card">
        <div className="adm-card-head" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="adm-card-title">Événements</p>
            <p className="adm-card-sub">
              {loading ? 'Chargement…' : `${total.toLocaleString('fr-FR')} événement${total !== 1 ? 's' : ''} trouvé${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="adm-btn" onClick={() => charger(page)} style={{ fontSize: 11 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4 }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualiser
          </button>
        </div>

        <div className="adm-card-body" style={{ padding: 0 }}>
          {!loading && logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--c-t3)', fontSize: 13 }}>
              <div style={{ marginBottom: 10 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--c-bdr2)" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              Aucun événement pour cette période
            </div>
          ) : (
            <table className="adm-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 150 }}>Horodatage</th>
                  <th style={{ width: 80 }}>Module</th>
                  <th style={{ width: 130 }}>Acteur</th>
                  <th>Événement</th>
                  <th style={{ width: 120 }}>Cible</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const mod = MODULE_CONFIG[log.module] ?? MODULE_CONFIG.SYSTEME;
                  const icon = ACTION_ICONS[log.action];
                  return (
                    <tr key={log.id}>
                      {/* Horodatage */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--c-t0)', fontWeight: 600, display: 'block' }}>
                          {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--c-t3)' }}>
                          {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>

                      {/* Module badge */}
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                          fontSize: 10, fontWeight: 700,
                          background: mod.bg, color: mod.color, border: `1px solid ${mod.border}`,
                        }}>
                          {mod.label}
                        </span>
                      </td>

                      {/* Acteur */}
                      <td>
                        {log.actorNom ? (
                          <div>
                            <span style={{ fontSize: 12, color: 'var(--c-t0)', fontWeight: 500 }}>{log.actorNom}</span>
                            {log.actorRole && (
                              <span style={{ display: 'block', fontSize: 10, color: 'var(--c-t3)' }}>
                                {ROLE_LABELS[log.actorRole] ?? log.actorRole}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--c-t3)' }}>Système</span>
                        )}
                      </td>

                      {/* Description */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {icon && (
                            <div style={{
                              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                              background: mod.bg, color: mod.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {icon}
                            </div>
                          )}
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-t2)', display: 'block', marginBottom: 2 }}>
                              {ACTION_LABELS[log.action] ?? log.action}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--c-t3)', lineHeight: 1.4 }}>
                              {log.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cible */}
                      <td style={{ fontSize: 11, color: 'var(--c-t2)', maxWidth: 120 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.cible ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t2)',
          }}>
            <span>Page {page} / {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="adm-btn" onClick={() => charger(page - 1)} disabled={page <= 1 || loading} style={{ fontSize: 11, padding: '4px 10px' }}>← Préc.</button>
              <button className="adm-btn" onClick={() => charger(page + 1)} disabled={page >= totalPages || loading} style={{ fontSize: 11, padding: '4px 10px' }}>Suiv. →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles inline ──────────────────────────────────────────────────────────────

const labelSt: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

const inputSt: React.CSSProperties = {
  padding: '7px 12px', borderRadius: 8, fontSize: 12,
  border: '1px solid var(--c-bdr)', background: 'var(--c-surf2)',
  color: 'var(--c-t0)', outline: 'none', fontFamily: 'Roboto, system-ui, sans-serif',
};

// ── Labels ─────────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATEUR:      'Admin',
  MEDECIN:             'Médecin',
  AGENT_ADMINISTRATIF: 'Ag. Administratif',
  AGENT_RENSEIGNEMENT: 'Ag. Renseignement',
};

const ACTION_LABELS: Record<string, string> = {
  CONNEXION:              'Connexion',
  DECONNEXION:            'Déconnexion',
  CREATION_COMPTE:        'Création de compte',
  SUPPRESSION_COMPTE:     'Suppression de compte',
  ACTIVATION_COMPTE:      'Activation de compte',
  DESACTIVATION_COMPTE:   'Désactivation de compte',
  DEBLOCAGE_COMPTE:       'Déblocage de compte',
  REINITIALISATION_MDP:   'Réinitialisation MDP',
  CHANGEMENT_ROLE:        'Changement de rôle',
  MODIFICATION_COMPTE:    'Modification de compte',
  CREATION_PATIENT:       'Création patient',
  ACCUEIL_PATIENT:        'Accueil patient',
  ADMISSION_URGENCE:      'Admission urgence',
  MODIFICATION_PATIENT:   'Modification patient',
  OUVERTURE_SEJOUR:       'Ouverture séjour',
  CLOTURE_SEJOUR:         'Clôture séjour',
  MOUVEMENT_PATIENT:      'Mouvement patient',
  AJOUT_DIAGNOSTIC:       'Diagnostic ajouté',
  AJOUT_PRESCRIPTION:     'Prescription ajoutée',
  CREATION_RENDEZVOUS:    'RDV créé',
  SUPPRESSION_RENDEZVOUS: 'RDV supprimé',
  CREATION_PROFIL_MEDECIN:'Profil médecin créé',
};

// ── Sous-composants ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="adm-card" style={{ padding: 0 }}>
      <div className="adm-card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: color + '20', color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-t0)', lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: 11, color: 'var(--c-t3)', marginTop: 3 }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

// ── Icônes SVG ─────────────────────────────────────────────────────────────────

function IconLogin()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>; }
function IconLogout()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconUser()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IconTrash()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>; }
function IconCheck()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>; }
function IconBan()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function IconUnlock()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>; }
function IconKey()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>; }
function IconRole()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IconEdit()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function IconPlus()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconAlert()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconFile()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IconMove()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>; }
function IconSteth()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>; }
function IconPill()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/><circle cx="18" cy="18" r="4"/><path d="m15.5 18 5 0"/></svg>; }
function IconCalendar() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconClock()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
