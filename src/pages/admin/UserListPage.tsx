import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { User, UserRole } from '../../types/user';
import { useUsers } from '../../hooks/useUsers';
import RegisterModal from '../../components/admin/auth/RegisterModal';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRATEUR:      'Administrateur',
  MEDECIN:             'Médecin',
  AGENT_ADMINISTRATIF: 'Agent adm.',
  AGENT_RENSEIGNEMENT: 'Agent renseignement',
};

const ROLE_BADGE: Record<UserRole, { bg: string; color: string }> = {
  MEDECIN:             { bg: '#d1fae5', color: '#065f46' },
  AGENT_ADMINISTRATIF: { bg: '#dbeafe', color: '#1e40af' },
  AGENT_RENSEIGNEMENT: { bg: '#f3e8ff', color: '#7e22ce' },
  ADMINISTRATEUR:      { bg: '#ede9fe', color: '#5b21b6' },
};

const STATUS_COLOR = (actif: boolean) => actif ? '#10b981' : '#ef4444';
const STATUS_LABEL = (actif: boolean) => actif ? 'Actif' : 'Inactif';

const initials = (prenom: string, nom: string) =>
  (prenom[0] + nom[0]).toUpperCase();

const AVATAR_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#fce7f3', color: '#9d174d' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#ede9fe', color: '#5b21b6' },
  { bg: '#fee2e2', color: '#991b1b' },
];
const avatarColor = (nom: string) =>
  AVATAR_COLORS[nom.charCodeAt(0) % AVATAR_COLORS.length];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

const formatLogin = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const hh  = String(d.getHours()).padStart(2, '0');
  const mm  = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${mon} ${hh}:${mm}`;
};

// ─── Menu d'actions (3 points) ───────────────────────────────────────────────

function ActionMenu({
  user, onActivate, onDeactivate, onDelete,
}: {
  user: User;
  onActivate:   (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setOpen(false); }
  };

  return (
    <div className="adm-action-menu">
      <button
        className="adm-action-menu-trigger"
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        title="Actions"
      >
        {busy ? '…' : '⋯'}
      </button>
      {open && (
        <>
          <div className="adm-action-menu-overlay" onClick={() => setOpen(false)} />
          <div className="adm-action-menu-dropdown">
            {user.actif ? (
              <button className="adm-action-menu-item adm-action-menu-item--danger"
                onClick={() => run(() => onDeactivate(user.id))}>
                Désactiver le compte
              </button>
            ) : (
              <button className="adm-action-menu-item"
                style={{ color: 'var(--c-green)' }}
                onClick={() => run(() => onActivate(user.id))}>
                Activer le compte
              </button>
            )}
            <div className="adm-action-menu-divider" />
            <button className="adm-action-menu-item adm-action-menu-item--danger"
              onClick={() => {
                if (window.confirm(`Supprimer définitivement ${user.prenom} ${user.nom} ?`)) {
                  run(() => onDelete(user.id));
                }
              }}>
              Supprimer le compte
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const PER_PAGE = 10;

export function UserListPage() {
  const {
    users: allUsers, totalAll, loading, error,
    filters, search, setSearch, updateFilter,
    activateUser, deactivateUser, deleteUser,
  } = useUsers();

  const { dark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);

  const users      = allUsers.filter(u => u.role !== 'ADMINISTRATEUR');
  const totalPages = Math.ceil(users.length / PER_PAGE);
  const paginated  = users.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const cardBg     = dark ? '#23232a' : '#fff';
  const cardBorder = dark ? '#27272a' : '#e5e7eb';
  const textMain   = dark ? '#e5e7eb' : '#111827';
  const textMuted  = dark ? '#a1a1aa' : '#6b7280';
  const headBg     = dark ? '#1e2a3a' : '#3b83f618';

  return (
    <div className="adm-main">

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textMain, marginBottom: 4 }}>
            Comptes utilisateurs
          </h1>
          <p style={{ fontSize: 13, color: textMuted }}>
            Liste des comptes utilisateurs créés
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="adm-btn adm-btn-primary">
          + Nouveau compte
        </button>
      </div>

      {/* Barre de filtres */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <input
          placeholder="Rechercher…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            flex: '1 1 200px', maxWidth: 280,
            padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${cardBorder}`, fontSize: 13,
            background: cardBg, color: textMain, outline: 'none',
          }}
        />
        <select
          value={filters.role}
          onChange={e => { updateFilter('role', e.target.value); setPage(0); }}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: `1px solid ${cardBorder}`, fontSize: 13,
            background: filters.role ? '#4f46e5' : cardBg,
            color: filters.role ? '#fff' : textMuted,
            cursor: 'pointer',
          }}
        >
          <option value="">Tous les rôles</option>
          <option value="MEDECIN">Médecin</option>
          <option value="AGENT_ADMINISTRATIF">Agent adm.</option>
          <option value="ADMINISTRATEUR">Administrateur</option>
          <option value="AGENT_RENSEIGNEMENT">Agent renseignement</option>
        </select>
        <select
          value={filters.actif}
          onChange={e => { updateFilter('actif', e.target.value); setPage(0); }}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: `1px solid ${cardBorder}`, fontSize: 13,
            background: filters.actif ? '#4f46e5' : cardBg,
            color: filters.actif ? '#fff' : textMuted,
            cursor: 'pointer',
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          background: '#4f46e5', color: '#fff', fontSize: 13, fontWeight: 600,
        }}>
          <span>{totalAll}</span>
          <span style={{ fontWeight: 400, fontSize: 11 }}>comptes</span>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16,
          background: 'var(--c-red-bg)', color: 'var(--c-red)', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tableau */}
      <div style={{
        background: cardBg, borderRadius: 14,
        border: `1px solid ${cardBorder}`, overflow: 'hidden',
        boxShadow: dark ? '0 1px 3px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: headBg, borderBottom: `1px solid ${cardBorder}` }}>
              {['Utilisateur', "N° d'ordre", 'Rôle', 'Statut', 'Dernière connexion', 'Création', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '11px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, color: textMuted,
                  letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 13 }}>
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 13 }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
            {!loading && paginated.map((user, idx) => {
              const av    = avatarColor(user.nom);
              const badge = ROLE_BADGE[user.role];
              return (
                <tr key={user.id} style={{
                  borderBottom: idx < paginated.length - 1 ? `1px solid ${cardBorder}` : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = dark ? '#2a2a35' : '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Utilisateur */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: av.bg, color: av.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {initials(user.prenom, user.nom)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: textMain }}>
                          {user.prenom} {user.nom}
                        </div>
                        <div style={{ fontSize: 11, color: textMuted }}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* N° d'ordre */}
                  <td style={{ padding: '13px 16px' }}>
                    {user.numeroOrdre
                      ? <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>{user.numeroOrdre}</span>
                      : <span style={{ fontSize: 13, color: '#d1d5db' }}>—</span>
                    }
                  </td>

                  {/* Rôle */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 600,
                      background: badge.bg, color: badge.color,
                    }}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>

                  {/* Statut */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: STATUS_COLOR(user.actif), flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 13, color: textMain }}>
                        {STATUS_LABEL(user.actif)}
                      </span>
                    </div>
                  </td>

                  {/* Dernière connexion */}
                  <td style={{ padding: '13px 16px', fontSize: 12, color: textMuted }}>
                    {formatLogin(user.createdAt)}
                  </td>

                  {/* Date de création */}
                  <td style={{ padding: '13px 16px', fontSize: 12, color: textMuted }}>
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                    <ActionMenu
                      user={user}
                      onActivate={activateUser}
                      onDeactivate={deactivateUser}
                      onDelete={deleteUser}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px', borderTop: `1px solid ${cardBorder}`,
            background: cardBg,
          }}>
            <span style={{ fontSize: 12, color: textMuted }}>
              {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, users.length)} sur {users.length}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} style={{
                  width: 30, height: 30, borderRadius: 6, border: `1px solid ${cardBorder}`,
                  background: i === page ? '#4f46e5' : cardBg,
                  color: i === page ? '#fff' : textMuted,
                  fontSize: 12, cursor: 'pointer', fontWeight: i === page ? 600 : 400,
                }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <RegisterModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

export default UserListPage;
