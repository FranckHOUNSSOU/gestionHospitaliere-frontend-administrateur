import {
  useAdminStats, useAdminUsers, useAdminLogs,
  useServicesStatus, useBlockUser, useActivateUser,
} from '../../hooks/useAdminData';
import type { AdminUser, ActivityLog } from '../../types/admin.types';
import './Dashboard.css';

const LOG_DOT: Record<string, string> = {
  success: 'adm-ld-green',
  info:    'adm-ld-blue',
  warning: 'adm-ld-amber',
  danger:  'adm-ld-red',
};

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRATEUR:      'Admin',
  MEDECIN:             'Médecin',
  AGENT_ADMINISTRATIF: 'Agent adm.',
};

const ROLE_COLOR: Record<string, string> = {
  ADMINISTRATEUR:      'adm-t-red',
  MEDECIN:             'adm-t-blue',
  AGENT_ADMINISTRATIF: 'adm-t-amber',
};

const STATUS_LABEL: Record<string, string> = {
  active:   'Actif',
  inactive: 'Inactif',
  blocked:  'Bloqué',
};

const STATUS_COLOR: Record<string, string> = {
  active:   'adm-t-green',
  inactive: 'adm-t-gray',
  blocked:  'adm-t-red',
};

const SVC_LABEL: Record<string, string> = {
  online: 'En ligne', active: 'Actif', offline: 'Hors ligne',
};

const SVC_COLOR: Record<string, string> = {
  online: 'adm-t-green', active: 'adm-t-green', offline: 'adm-t-red',
};

const fmt = (d: string | null) => d
  ? new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  : '—';

const BARS = [
  { l: 'L',   h: 42 },
  { l: 'M',   h: 58 },
  { l: 'Me',  h: 35 },
  { l: 'J',   h: 65 },
  { l: 'V',   h: 50 },
  { l: 'S',   h: 18 },
  { l: 'Auj', h: 44, today: true },
];

export const Dashboard = () => {
  const { data: stats }    = useAdminStats();
  const { data: users }    = useAdminUsers();
  const { data: logs }     = useAdminLogs();
  const { data: services } = useServicesStatus();
  const blockUser          = useBlockUser();
  const activateUser       = useActivateUser();

  return (
    <div className="adm-main">

      <div className="adm-page-h">
        <p className="adm-page-title">Tableau de bord administrateur</p>
        <p className="adm-page-sub">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
          })}
          {' · '}Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </p>
      </div>

      {/* KPI */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi adm-kpi-blue">
          <p className="adm-kpi-lbl">Utilisateurs actifs</p>
          <p className="adm-kpi-val">{stats?.activeUsers ?? '—'}</p>
          <p className="adm-kpi-note adm-note-up">↑ 2 nouveaux ce mois</p>
        </div>
        <div className="adm-kpi adm-kpi-green">
          <p className="adm-kpi-lbl">Connexions aujourd'hui</p>
          <p className="adm-kpi-val">{stats?.logins24h ?? '—'}</p>
          <p className="adm-kpi-note adm-note-neutral">Normale pour un lundi</p>
        </div>
        <div className="adm-kpi adm-kpi-amber">
          <p className="adm-kpi-lbl">Alertes sécurité</p>
          <p className="adm-kpi-val">{stats?.securityAlerts ?? '—'}</p>
          <p className="adm-kpi-note adm-note-down">↑ Tentatives refusées</p>
        </div>
        <div className="adm-kpi adm-kpi-red">
          <p className="adm-kpi-lbl">Sauvegarde système</p>
          <p className="adm-kpi-val" style={{ fontSize: 20 }}>02:00 AM</p>
          <p className="adm-kpi-note adm-note-up">✓ Dernière réussie</p>
        </div>
      </div>

      {/* Grille */}
      <div className="adm-grid">

        {/* TABLE */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title">Comptes utilisateurs</p>
              <p className="adm-card-sub">{users?.length ?? 0} comptes actifs</p>
            </div>
            <button className="adm-btn adm-btn-primary">+ Nouveau compte</button>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: AdminUser) => (
                <tr key={u.id}>
                  <td>
                    <p className="adm-cell-name">{u.name}</p>
                    <p className="adm-cell-mono">{u.email}</p>
                  </td>
                  <td>
                    <span className={`adm-tag ${ROLE_COLOR[u.role] ?? 'adm-t-gray'}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-tag ${STATUS_COLOR[u.status] ?? 'adm-t-gray'}`}>
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </td>
                  <td><p className="adm-cell-mono">{fmt(u.lastLogin)}</p></td>
                  <td>
                    <div className="adm-act-row">
                      <span className="adm-act">Modifier</span>
                      {u.status === 'active'
                        ? <span className="adm-act adm-act-danger" onClick={() => blockUser.mutate(u.id)}>Bloquer</span>
                        : <span className="adm-act" onClick={() => activateUser.mutate(u.id)}>Activer</span>
                      }
                    </div>
                  </td>
                </tr>
              ))}
              {(users ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>
                    Aucun utilisateur
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* LOGS */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title">Journaux d'activité</p>
              <p className="adm-card-sub">Dernières 24 heures</p>
            </div>
            <button className="adm-btn">Voir tout</button>
          </div>
          <div className="adm-card-body">
            {logs?.map((log: ActivityLog) => (
              <div key={log.id} className="adm-log">
                <div className={`adm-log-dot ${LOG_DOT[log.type]}`} />
                <div>
                  <p className="adm-log-msg">
                    <strong>{log.userName}</strong> {log.action}
                  </p>
                  <p className="adm-log-time">{fmt(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DROITE */}
        <div className="adm-right">
          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Connexions / semaine</p>
            </div>
            <div className="adm-card-body">
              <div className="adm-bars">
                {BARS.map(b => (
                  <div key={b.l} className="adm-bar-col">
                    <div className={`adm-bar${b.today ? ' adm-bar-today' : ''}`}
                      style={{ height: b.h }} />
                    <p className="adm-bar-lbl">{b.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">État des services</p>
            </div>
            <div className="adm-card-body">
              {services?.map(s => (
                <div key={s.name} className="adm-svc">
                  <p className="adm-svc-name">{s.name}</p>
                  <span className={`adm-tag ${SVC_COLOR[s.status] ?? 'adm-t-gray'}`}>
                    {SVC_LABEL[s.status] ?? s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-action-row">
            <button className="adm-btn adm-btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}>
              Sauvegarder
            </button>
            <button className="adm-btn"
              style={{ flex: 1, justifyContent: 'center' }}>
              Rapport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};