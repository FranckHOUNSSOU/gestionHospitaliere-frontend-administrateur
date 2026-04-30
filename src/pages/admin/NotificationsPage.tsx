import { useState, useMemo } from 'react';

type NotifType = 'info' | 'success' | 'warning' | 'error';
type SortKey   = 'date' | 'type' | 'statut';

interface Notification {
  id: string;
  type: NotifType;
  titre: string;
  message: string;
  lu: boolean;
  date: string;
}

const INITIAL_NOTIFS: Notification[] = [
  {
    id: '1', type: 'error', lu: false, date: '2026-04-30T09:15:00.000Z',
    titre: 'Échec de connexion répété',
    message: 'Tentative de connexion échouée 5 fois consécutives pour admin@hopital.bj.',
  },
  {
    id: '2', type: 'warning', lu: false, date: '2026-04-30T08:30:00.000Z',
    titre: 'Compte inactif détecté',
    message: 'Le compte de Dr. Mèdénou Chantal est inactif depuis 15 jours.',
  },
  {
    id: '3', type: 'info', lu: false, date: '2026-04-29T16:20:00.000Z',
    titre: 'Nouveau compte créé',
    message: "L'agent de renseignement Franck Hounsou a été créé avec succès.",
  },
  {
    id: '4', type: 'success', lu: true, date: '2026-04-29T14:00:00.000Z',
    titre: 'Sauvegarde automatique réussie',
    message: 'La sauvegarde de la base de données a été effectuée sans erreur.',
  },
  {
    id: '5', type: 'info', lu: true, date: '2026-04-28T11:30:00.000Z',
    titre: 'Compte activé',
    message: 'Le compte du médecin Agossou Pierre a été activé par admin.',
  },
  {
    id: '6', type: 'warning', lu: true, date: '2026-04-27T09:00:00.000Z',
    titre: 'Espace disque élevé',
    message: "L'espace disque utilisé dépasse 80 %. Pensez à libérer de l'espace.",
  },
];

const TYPE_CFG: Record<NotifType, { bg: string; color: string; bdr: string; label: string }> = {
  info:    { bg: 'var(--c-accent-bg)', color: 'var(--c-accent)', bdr: 'var(--c-accent-bd)', label: 'Info'          },
  success: { bg: 'var(--c-green-bg)',  color: 'var(--c-green)',  bdr: 'var(--c-green-bd)',  label: 'Succès'        },
  warning: { bg: 'var(--c-amber-bg)',  color: 'var(--c-amber)',  bdr: 'var(--c-amber-bg)',  label: 'Avertissement' },
  error:   { bg: 'var(--c-red-bg)',    color: 'var(--c-red)',    bdr: 'var(--c-red-bg)',    label: 'Erreur'        },
};

const SORT_OPTS: { key: SortKey; label: string }[] = [
  { key: 'date',   label: 'Date'   },
  { key: 'type',   label: 'Type'   },
  { key: 'statut', label: 'Statut' },
];

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)    return "À l'instant";
  if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)}h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState<Notification[]>(INITIAL_NOTIFS);
  const [sort, setSort]       = useState<SortKey>('date');
  const [filter, setFilter]   = useState<NotifType | ''>('');

  const unreadCount = notifs.filter(n => !n.lu).length;

  const markRead    = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, lu: true } : n));
  const markAllRead = ()           => setNotifs(ns => ns.map(n => ({ ...n, lu: true })));
  const remove      = (id: string) => setNotifs(ns => ns.filter(n => n.id !== id));

  const visible = useMemo(() => {
    const list = filter ? notifs.filter(n => n.type === filter) : [...notifs];
    list.sort((a, b) => {
      // Non-lus toujours en premier
      if (!a.lu && b.lu) return -1;
      if (a.lu && !b.lu) return  1;
      // Puis tri secondaire selon le critère choisi
      if (sort === 'date')   return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'type')   return a.type.localeCompare(b.type);
      if (sort === 'statut') return Number(a.lu) - Number(b.lu);
      return 0;
    });
    return list;
  }, [notifs, sort, filter]);

  return (
    <div className="adm-main">

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="adm-page-title">Notifications</h1>
          <p className="adm-page-sub">
            {unreadCount > 0
              ? `${unreadCount} non lue(s) — affichées en premier`
              : 'Toutes les notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="adm-btn" onClick={markAllRead}>
            <CheckIcon /> Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres + tri */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>

        {/* Filtre par type */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['', 'info', 'success', 'warning', 'error'] as const).map(t => (
            <Chip
              key={t}
              label={t === '' ? 'Toutes' : TYPE_CFG[t].label}
              active={filter === t}
              color={t !== '' ? TYPE_CFG[t].color : undefined}
              activeBg={t !== '' ? TYPE_CFG[t].bg : undefined}
              onClick={() => setFilter(t)}
            />
          ))}
        </div>

        {/* Tri */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--c-t3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Trier par :
          </span>
          {SORT_OPTS.map(o => (
            <Chip key={o.key} label={o.label} active={sort === o.key} onClick={() => setSort(o.key)} />
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="adm-card" style={{ overflow: 'hidden' }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-t3)', fontSize: 13 }}>
            Aucune notification
          </div>
        ) : (
          visible.map((n, i) => {
            const cfg = TYPE_CFG[n.type];
            const unreadBg = 'var(--c-accent-bg)';
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < visible.length - 1 ? '1px solid var(--c-bdr)' : 'none',
                  background: !n.lu ? unreadBg : 'transparent',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                onMouseLeave={e => (e.currentTarget.style.background = !n.lu ? unreadBg : 'transparent')}
              >
                {/* Point lu / non-lu */}
                <div style={{ paddingTop: 5, flexShrink: 0 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: !n.lu ? 'var(--c-accent)' : 'transparent',
                    border: `2px solid ${!n.lu ? 'var(--c-accent)' : 'var(--c-bdr)'}`,
                    transition: 'all .2s',
                  }} />
                </div>

                {/* Point couleur type */}
                <div style={{ paddingTop: 6, flexShrink: 0 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color }} />
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 13, fontWeight: n.lu ? 400 : 600, color: 'var(--c-t0)', lineHeight: 1 }}>
                      {n.titre}
                    </p>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: cfg.bg, color: cfg.color, flexShrink: 0,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--c-t2)', lineHeight: 1.5, marginBottom: 5 }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: 10.5, color: 'var(--c-t3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatDate(n.date)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignSelf: 'center' }}>
                  {!n.lu && (
                    <IconBtn title="Marquer comme lu" onClick={() => markRead(n.id)}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </IconBtn>
                  )}
                  <IconBtn title="Supprimer" onClick={() => remove(n.id)} danger>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </IconBtn>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function Chip({ label, active, color, activeBg, onClick }: {
  label: string; active: boolean;
  color?: string; activeBg?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${active ? (color ?? 'var(--c-accent)') : 'var(--c-bdr)'}`,
        background: active ? (activeBg ?? 'var(--c-accent-bg)') : 'var(--c-surf2)',
        color: active ? (color ?? 'var(--c-accent)') : 'var(--c-t2)',
        transition: 'all .15s',
      }}
    >
      {label}
    </button>
  );
}

function IconBtn({ title, onClick, danger, children }: {
  title: string; onClick: () => void; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        border: '1px solid var(--c-bdr)',
        background: danger ? 'var(--c-red-bg)' : 'var(--c-surf2)',
        cursor: 'pointer',
        color: danger ? 'var(--c-red)' : 'var(--c-t2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-surf3)';
        if (!danger) (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-t0)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = danger ? 'var(--c-red-bg)' : 'var(--c-surf2)';
        (e.currentTarget as HTMLButtonElement).style.color = danger ? 'var(--c-red)' : 'var(--c-t2)';
      }}
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}
