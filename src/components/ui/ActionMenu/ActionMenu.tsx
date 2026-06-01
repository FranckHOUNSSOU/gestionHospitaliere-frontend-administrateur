import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '../../../types/user';

interface ActionMenuProps {
  user: User;
  onActivate:   (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}

type DropPos = { top?: number; bottom?: number; right: number };

export function ActionMenu({ user, onActivate, onDeactivate, onDelete }: ActionMenuProps) {
  const [open, setOpen]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [pos, setPos]       = useState<DropPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      setPos(
        spaceBelow < 200
          ? { bottom: window.innerHeight - r.top + 4, right: window.innerWidth - r.right }
          : { top: r.bottom + 4,                      right: window.innerWidth - r.right }
      );
    }
    setOpen(o => !o);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setOpen(false); }
  };

  const dropdown = open && pos ? createPortal(
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        onClick={() => setOpen(false)}
      />
      <div
        className="adm-action-menu-dropdown"
        style={{
          position: 'fixed',
          top:    pos.top    !== undefined ? pos.top    : 'auto',
          bottom: pos.bottom !== undefined ? pos.bottom : 'auto',
          right:  pos.right,
          left:   'auto',
          zIndex: 10000,
        }}
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
    </>,
    document.body
  ) : null;

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
      {dropdown}
    </div>
  );
}
