
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { User } from '../../types/user';
import type { UserRole } from '../../types/user';
import { useUsers } from '../../hooks/useUsers';
import RegisterModal from '../../components/admin/auth/RegisterModal'; 

// Transforme "AGENT_ADMINISTRATIF" → "Agent adm." pour l'affichage
const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRATEUR:      'Administrateur',
  MEDECIN:             'Médecin',
  AGENT_ADMINISTRATIF: 'Agent adm.',
};

// Couleurs des badges de rôle (fond + texte)
const ROLE_BADGE: Record<UserRole, { bg: string; color: string }> = {
  MEDECIN:             { bg: '#d1fae5', color: '#065f46' },
  AGENT_ADMINISTRATIF: { bg: '#dbeafe', color: '#1e40af' },
  ADMINISTRATEUR:      { bg: '#ede9fe', color: '#5b21b6' },
};

// Couleur du point de statut actif/inactif
const STATUS_COLOR = (actif: boolean) => actif ? '#10b981' : '#ef4444';
const STATUS_LABEL = (actif: boolean) => actif ? 'Actif' : 'Inactif';

// Génère les initiales pour l'avatar (ex: "DK" pour Koné Diabaté)
const initials = (prenom: string, nom: string) =>
  (prenom[0] + nom[0]).toUpperCase();

// Génère une couleur d'avatar déterministe selon le nom
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

// Formate une date ISO → "12/01/2025"
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR');

// Formate une date ISO → "14/04 08:42" (dernière connexion)
const formatLogin = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const day  = String(d.getDate()).padStart(2, '0');
  const mon  = String(d.getMonth() + 1).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const mm   = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${mon}\n${hh}:${mm}`;
};



// ─── Composant : Menu d'actions (3 points) ───────────────────────────────────

function ActionMenu({
  user,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  user: User;
  onActivate:   (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setOpen(false); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        style={{
          background: 'none', border: '1px solid #e5e7eb',
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
          fontSize: 16, color: '#6b7280',
          transition: 'background 0.1s',
        }}
        title="Actions"
      >
        {busy ? '…' : '⋯'}
      </button>

      {open && (
        <>
          {/* Ferme le menu si on clique ailleurs */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          />
          <div style={{
            position: 'absolute', right: 0, top: '110%',
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 20, minWidth: 190, overflow: 'hidden',
          }}>
            {/* Activer / Désactiver */}
            {user.actif ? (
              <MenuBtn
                label="Désactiver le compte"
                color="#dc2626"
                onClick={() => run(() => onDeactivate(user.id))}
              />
            ) : (
              <MenuBtn
                label="Activer le compte"
                color="#059669"
                onClick={() => run(() => onActivate(user.id))}
              />
            )}
            <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
            <MenuBtn
              label="Supprimer le compte"
              color="#ef4444"
              onClick={() => {
                if (window.confirm(`Supprimer définitivement ${user.prenom} ${user.nom} ?`)) {
                  run(() => onDelete(user.id));
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MenuBtn({
  label, color, onClick,
}: { label: string; color: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', textAlign: 'left', padding: '9px 14px',
        background: hover ? '#f9fafb' : 'transparent',
        border: 'none', cursor: 'pointer', fontSize: 13,
        color, fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function UserListPage() {
  const {
    users: allUsers, totalAll, loading, error,
    filters, search, setSearch, updateFilter,
    activateUser, deactivateUser, deleteUser,
  } = useUsers();

  const { dark } = useTheme();
  const [showModal, setShowModal] = useState(false);

  // Filtrer pour masquer les administrateurs
  const users = allUsers.filter(u => u.role !== 'ADMINISTRATEUR');

  // Styles dynamiques selon le thème
  const bgMain = dark ? '#18181b' : '#f8fafc';
  const colorMain = dark ? '#f3f4f6' : '#111827';
  const cardBg = dark ? '#23232a' : '#fff';
  const cardBorder = dark ? '#27272a' : '#e5e7eb';
  const cardShadow = dark ? '0 1px 3px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.05)';
  const tableHeadBg = dark ? '#3b82f6' : '#3b83f650';
  const tableHeadColor = dark ? '#a1a1aa' : '#6b7280';
//#3b82f6
  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 0,
      margin: 0,
      background: bgMain,
      color: colorMain,
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── En-tête ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ padding:10,marginLeft: 15, marginTop: 25, fontSize: 30, fontWeight: 600, color: '#111827' }}>
            Comptes utilisateurs
          </h1>
          <p style={{ marginLeft: 30, fontSize: 13, color: '#6b7280' }}>
            Liste des comptes utilisateurs créés
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, border: 'none', margin: 45, marginLeft: 0,
            background: '#4f46e5', color: '#fff',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 1px 4px rgba(79,70,229,0.3)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
          onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
        >
          <span style={{fontSize: 18, lineHeight: 1 }}>+</span>
          Nouveau compte
        </button>
      </div>

      {/* ── Barre de filtres ── */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
        alignItems: 'center', marginBottom: 20,
      }}>
        {/* Recherche */}
        <div style={{ marginLeft:30,position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, color: '#9ca3af',
          }}></span>
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '9px 12px 9px 34px',
              borderRadius: 8, border: '1px solid #e5e7eb',
              fontSize: 14, fontFamily: 'inherit',
              background: '#fff', outline: 'none',
            }}
          />
        </div>

        {/* Filtre rôle */}
        <select
          value={filters.role}
          onChange={e => updateFilter('role', e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 8,
            border: '1px solid #e5e7eb', fontSize: 14,
            background: filters.role ? '#4f46e5' : '#fff',
            color: filters.role ? '#fff' : '#374151',
            fontFamily: 'inherit', cursor: 'pointer',
            fontWeight: filters.role ? 500 : 400,
          }}
        >
          <option value=""  style = {{ fontSize:13 }}>Tous les rôles</option>
          <option value="MEDECIN"  style = {{ fontSize:13 }}>Médecin</option>
          <option value="AGENT_ADMINISTRATIF"  style = {{ fontSize:13 }}>Agent adm.</option>
          <option value="ADMINISTRATEUR" style = {{ fontSize:13 }}>Administrateur</option>
        </select>

        {/* Filtre statut */}
        <select
          value={filters.actif}
          onChange={e => updateFilter('actif', e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 8,
            border: '1px solid #e5e7eb', fontSize: 14,
            background: filters.actif ? '#4f46e5' : '#fff',
            color: filters.actif ? '#fff' : '#374151',
            fontFamily: 'inherit', cursor: 'pointer',
            fontWeight: filters.actif ? 500 : 400,
          }}
        >
          <option value=""  style = {{ fontSize:13 }}>Tous les statuts</option>
          <option value="true"  style = {{ fontSize:13 }}>Actif</option>
          <option value="false" style = {{ fontSize:13 }}>Inactif</option>
          <option value="false" style = {{ fontSize:13 }}>Bloqué</option>
        </select>

        {/* Compteur */}
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center',
          gap: 6, padding: '9px 14px', borderRadius: 8,
          background: '#4f46e5', color: '#ffffff',
          fontSize: 14, fontWeight: 600,marginRight:25,
        }}>
          <span>{totalAll}</span>
          <span style={{ fontWeight: 400, fontSize: 12, color: '#fff' }}>comptes</span>
        </div>
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16,
          background: '#fee2e2', color: '#991b1b', fontSize: 14,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Tableau ── */}
      <div style={{
        background: cardBg, borderRadius: 14,
        border: `1px solid ${cardBorder}`,
        overflow: 'hidden',
        boxShadow: cardShadow,
        width: '96%',
        marginLeft: 30,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: tableHeadBg, borderBottom: `1px solid ${cardBorder}` }}>
              {[
                'Utilisateur', "N° d'ordre", 'Rôle',
                'Statut', 'Dernière connexion', 'Date de création', '',
              ].map((h, i) => (
                <th key={i} style={{
                  padding: '11px 16px', textAlign: 'left',
                  fontSize: 12, fontWeight: 600, color: tableHeadColor,
                  letterSpacing: '0.02em', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  Chargement…
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}

            {!loading && users.map((user, idx) => {
              const av = avatarColor(user.nom);
              const badge = ROLE_BADGE[user.role];
              const login = formatLogin(user.createdAt); // remplace par lastLogin si disponible

              return (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: idx < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Utilisateur : avatar + nom + email */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: av.bg, color: av.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, flexShrink: 0,
                      }}>
                        {initials(user.prenom, user.nom)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                          {user.prenom} {user.nom}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* N° d'ordre */}
                  <td style={{ padding: '14px 16px' }}>
                    {user.numeroOrdre ? (
                      <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>
                        {user.numeroOrdre}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: '#d1d5db' }}>—</span>
                    )}
                  </td>

                  {/* Rôle */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 500,
                      background: badge.bg, color: badge.color,
                    }}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>

                  {/* Statut */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: STATUS_COLOR(user.actif),
                        display: 'inline-block', flexShrink: 0,
                      }}/>
                      <span style={{ fontSize: 13, color: '#374151' }}>
                        {STATUS_LABEL(user.actif)}
                      </span>
                    </div>
                  </td>

                  {/* Dernière connexion */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 12, color: '#6b7280',
                      whiteSpace: 'pre-line', lineHeight: 1.4,
                    }}>
                      {login}
                    </span>
                  </td>

                  {/* Date de création */}
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px' }}>
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
      </div>

      {/* ── Modal création ── */}
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