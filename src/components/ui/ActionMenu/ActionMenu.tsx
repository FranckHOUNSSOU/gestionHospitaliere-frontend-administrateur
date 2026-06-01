import { useState, useRef } from 'react';
import type { User } from '../../../types/user';

interface ActionMenuProps {
  user: User;
  onActivate:   (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}

export function ActionMenu({ user, onActivate, onDeactivate, onDelete }: ActionMenuProps) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 200);
    }
    setOpen(o => !o);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setOpen(false); }
  };

  return (
    <div className="adm-action-menu">
      <button
        ref={triggerRef}
        className="adm-action-menu-trigger"
        onClick={handleToggle}
        disabled={busy}
        title="Actions"
      >
        {busy ? '…' : '⋯'}
      </button>
      {open && (
        <>
          <div className="adm-action-menu-overlay" onClick={() => setOpen(false)} />
          <div
            className="adm-action-menu-dropdown"
            style={openUp ? { top: 'auto', bottom: '110%' } : undefined}
          >
            {user.actif ? (
              <button
                className="adm-action-menu-item adm-action-menu-item--danger"
                onClick={() => run(() => onDeactivate(user.id))}
              >
                Désactiver le compte
              </button>
            ) : (
              <button
                className="adm-action-menu-item"
                style={{ color: 'var(--c-green)' }}
                onClick={() => run(() => onActivate(user.id))}
              >
                Activer le compte
              </button>
            )}
            <div className="adm-action-menu-divider" />
            <button
              className="adm-action-menu-item adm-action-menu-item--danger"
              onClick={() => {
                if (window.confirm(`Supprimer définitivement ${user.prenom} ${user.nom} ?`)) {
                  run(() => onDelete(user.id));
                }
              }}
            >
              Supprimer le compte
            </button>
          </div>
        </>
      )}
    </div>
  );
}
