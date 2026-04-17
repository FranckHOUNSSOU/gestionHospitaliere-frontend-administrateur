// src/components/ui/ToastNotification.tsx

import { useEffect, useState } from 'react';
import './ToastNotification.css';

interface ToastNotificationProps {
  show: boolean;
  message: string;
  onClose: () => void;
  /** Durée avant fermeture automatique en ms — défaut 4000ms */
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

export default function ToastNotification({
  show,
  message,
  onClose,
  duration = 4000,
  type = 'success',
}: ToastNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Fermeture avec animation de sortie
  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      onClose();
    }, 280);
  };

  // Affichage / masquage selon la prop show
  useEffect(() => {
    if (show) {
      setVisible(true);
      setLeaving(false);
    } else {
      if (visible) handleClose();
    }
  }, [show]);

  // Fermeture automatique après `duration` ms
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, [visible, duration]);

  if (!visible) return null;

  const icons = {
    success: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };

  return (
    <div className={`toast-notif toast-notif--${type} ${leaving ? 'toast-notif--leaving' : 'toast-notif--entering'}`}>
      {/* Barre de progression */}
      <div
        className="toast-notif__progress"
        style={{ animationDuration: `${duration}ms` }}
      />

      {/* Icône */}
      <div className="toast-notif__icon">
        {icons[type]}
      </div>

      {/* Message */}
      <span className="toast-notif__message">{message}</span>

      {/* Croix de fermeture */}
      <button
        className="toast-notif__close"
        onClick={handleClose}
        aria-label="Fermer la notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}