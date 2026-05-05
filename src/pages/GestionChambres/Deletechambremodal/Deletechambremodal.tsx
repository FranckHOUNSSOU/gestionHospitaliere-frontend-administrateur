import { useState } from 'react';
import { deleteChambre, poleLabel } from '../../../services/chambres';
import type { Chambre } from '../../../services/chambres';

interface DeleteChambreModalProps {
  chambre: Chambre;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteChambreModal = ({ chambre, onClose, onDeleted }: DeleteChambreModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteChambre(chambre.id);
      onDeleted();
    } catch (e: any) {
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 1050 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1055,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px', borderBottom: '1px solid #F1F5F9',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: '#111827' }}>
                Supprimer la chambre
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
                Cette action est irréversible.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 6 }}
            >
              <i className="bi bi-x-lg" style={{ fontSize: 16 }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px' }}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, color: '#B91C1C', fontSize: 13,
              }}>
                <i className="bi bi-exclamation-circle-fill" />
                {error}
              </div>
            )}
            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              Vous êtes sur le point de supprimer la chambre{' '}
              <strong style={{ color: '#0C4A6E' }}>{chambre.numero}</strong>
              {' '}({chambre.service.nom} — {poleLabel(chambre.service.pole.nom)}).
              Voulez-vous continuer ?
            </p>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 28px', borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            background: '#FAFAFA', borderRadius: '0 0 12px 12px',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 22px', borderRadius: 8, cursor: 'pointer',
                border: '1.5px solid #E5E7EB', background: '#fff',
                color: '#374151', fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '9px 22px', borderRadius: 8, border: 'none',
                background: loading ? '#FCA5A5' : '#EF4444',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Suppression...</>
                : <><i className="bi bi-trash3" /> Supprimer</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteChambreModal;