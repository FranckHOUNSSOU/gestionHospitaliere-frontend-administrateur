import { useEffect, useState, useCallback } from 'react';
import client from '../../api/clients';
import { useAuth } from '../../context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CompteBloque {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  tentativesConnexion: number;
  compteBloque: boolean;
  derniereConnexion: string | null;
  pole: { id: string; nom: string } | null;
}

// ── Composant principal ────────────────────────────────────────────────────────

export default function SecurityPage() {
  const { user: admin } = useAuth();
  const [comptes, setComptes]         = useState<CompteBloque[]>([]);
  const [loading, setLoading]         = useState(true);
  const [erreur, setErreur]           = useState<string | null>(null);

  // modal état
  const [cible, setCible]             = useState<CompteBloque | null>(null);
  const [mdpAdmin, setMdpAdmin]       = useState('');
  const [showMdp, setShowMdp]         = useState(false);
  const [nouveauMdp, setNouveauMdp]   = useState('');
  const [showNouv, setShowNouv]       = useState(false);
  const [confMdp, setConfMdp]         = useState('');
  const [showConf, setShowConf]       = useState(false);
  const [modalErr, setModalErr]       = useState<string | null>(null);
  const [modalOk, setModalOk]         = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    try {
      const res = await client.get<CompteBloque[]>('/auth/users');
      const bloques = res.data.filter(u => u.compteBloque === true);
      setComptes(bloques);
    } catch (e: unknown) {
      setErreur((e as Error).message ?? 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrirModal = (c: CompteBloque) => {
    setCible(c);
    setMdpAdmin(''); setNouveauMdp(''); setConfMdp('');
    setModalErr(null); setModalOk(null);
    setShowMdp(false); setShowNouv(false); setShowConf(false);
  };

  const fermerModal = () => {
    if (submitting) return;
    setCible(null);
  };

  const handleDebloquer = async () => {
    if (!cible || !admin) return;
    setModalErr(null); setModalOk(null);

    if (!mdpAdmin.trim()) {
      setModalErr('Veuillez saisir votre mot de passe administrateur.'); return;
    }
    if (nouveauMdp && nouveauMdp.length < 8) {
      setModalErr('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return;
    }
    if (nouveauMdp && nouveauMdp !== confMdp) {
      setModalErr('Les mots de passe ne correspondent pas.'); return;
    }

    setSubmitting(true);
    try {
      const body: { motDePasseAdmin: string; nouveauMotDePasse?: string } = {
        motDePasseAdmin: mdpAdmin,
      };
      if (nouveauMdp) body.nouveauMotDePasse = nouveauMdp;

      const res = await client.patch<{ message: string }>(
        `/auth/users/${cible.id}/debloquer`,
        body,
      );
      setModalOk(res.data.message);
      setComptes(prev => prev.filter(c => c.id !== cible.id));
    } catch (e: unknown) {
      setModalErr((e as Error).message ?? 'Erreur lors du déblocage.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="adm-main">

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-page-title">Sécurité plateforme</h1>
        <p className="adm-page-sub">
          Comptes bloqués suite à 5 tentatives de connexion échouées consécutives
        </p>
      </div>

      {/* Carte principale */}
      <div className="adm-card">
        <div className="adm-card-head" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="adm-card-title">Comptes verrouillés</p>
            <p className="adm-card-sub">
              {loading ? 'Chargement…' : `${comptes.length} compte${comptes.length !== 1 ? 's' : ''} bloqué${comptes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            className="adm-btn adm-btn-primary"
            onClick={charger}
            disabled={loading}
            style={{ fontSize: 12 }}
          >
            {loading ? 'Actualisation…' : 'Actualiser'}
          </button>
        </div>

        <div className="adm-card-body" style={{ padding: 0 }}>
          {erreur && (
            <div style={{ padding: '12px 16px' }}>
              <AlertBand type="error" message={erreur} onClose={() => setErreur(null)} />
            </div>
          )}

          {!loading && comptes.length === 0 && !erreur && (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              color: 'var(--c-t3)', fontSize: 13,
            }}>
              <div style={{ marginBottom: 12 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="var(--c-green)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              Aucun compte verrouillé — la plateforme est sécurisée.
            </div>
          )}

          {comptes.length > 0 && (
            <table className="adm-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Pôle</th>
                  <th>Tentatives</th>
                  <th>Dernière connexion</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--c-t0)' }}>
                        {c.prenom} {c.nom}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--c-t3)' }}>{c.email}</div>
                    </td>
                    <td>
                      <RoleBadge role={c.role} />
                    </td>
                    <td style={{ color: 'var(--c-t2)' }}>
                      {c.pole?.nom ?? <span style={{ color: 'var(--c-t3)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'var(--c-red-bg)', color: 'var(--c-red)',
                        border: '1px solid var(--c-red)',
                        borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      }}>
                        {c.tentativesConnexion}/5
                      </span>
                    </td>
                    <td style={{ color: 'var(--c-t3)', fontSize: 11 }}>
                      {c.derniereConnexion
                        ? new Date(c.derniereConnexion).toLocaleString('fr-FR')
                        : '—'
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="adm-btn adm-btn-primary"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                        onClick={() => ouvrirModal(c)}
                      >
                        Débloquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal déblocage */}
      {cible && (
        <Modal onClose={fermerModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* En-tête modal */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--c-amber-bg)', border: '1px solid var(--c-amber)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="var(--c-amber)" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-t0)', marginBottom: 2 }}>
                  Débloquer le compte
                </p>
                <p style={{ fontSize: 12, color: 'var(--c-t3)' }}>
                  {cible.prenom} {cible.nom} &middot; {cible.email}
                </p>
              </div>
            </div>

            {modalErr && <AlertBand type="error"   message={modalErr} onClose={() => setModalErr(null)} />}
            {modalOk  && <AlertBand type="success" message={modalOk}  onClose={() => { setModalOk(null); fermerModal(); }} />}

            {!modalOk && (
              <>
                {/* Confirmation identité admin */}
                <div style={{
                  background: 'var(--c-surf2)', border: '1px solid var(--c-bdr)',
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-t2)', marginBottom: 10,
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Confirmation de votre identité
                  </p>
                  <label style={labelSt}>Votre mot de passe administrateur</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showMdp ? 'text' : 'password'}
                      value={mdpAdmin}
                      onChange={e => setMdpAdmin(e.target.value)}
                      placeholder="••••••••"
                      style={inputSt(!mdpAdmin && !!modalErr)}
                      autoFocus
                    />
                    <EyeBtn open={showMdp} toggle={() => setShowMdp(v => !v)} />
                  </div>
                </div>

                {/* Nouveau mot de passe (optionnel) */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-t2)', marginBottom: 10,
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Nouveau mot de passe <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--c-t3)' }}>(optionnel)</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={labelSt}>Nouveau mot de passe</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNouv ? 'text' : 'password'}
                          value={nouveauMdp}
                          onChange={e => setNouveauMdp(e.target.value)}
                          placeholder="Laisser vide pour conserver l'actuel"
                          style={inputSt(false)}
                        />
                        <EyeBtn open={showNouv} toggle={() => setShowNouv(v => !v)} />
                      </div>
                    </div>
                    {nouveauMdp && (
                      <div>
                        <label style={labelSt}>Confirmer le nouveau mot de passe</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showConf ? 'text' : 'password'}
                            value={confMdp}
                            onChange={e => setConfMdp(e.target.value)}
                            placeholder="••••••••"
                            style={inputSt(confMdp.length > 0 && confMdp !== nouveauMdp)}
                          />
                          <EyeBtn open={showConf} toggle={() => setShowConf(v => !v)} />
                        </div>
                        {confMdp.length > 0 && confMdp !== nouveauMdp && (
                          <p style={{ fontSize: 11, color: 'var(--c-red)', marginTop: 4 }}>
                            Les mots de passe ne correspondent pas
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                  <button
                    className="adm-btn"
                    onClick={fermerModal}
                    disabled={submitting}
                    style={{ fontSize: 12 }}
                  >
                    Annuler
                  </button>
                  <button
                    className="adm-btn adm-btn-primary"
                    onClick={handleDebloquer}
                    disabled={submitting || !mdpAdmin.trim() || (!!nouveauMdp && nouveauMdp !== confMdp)}
                    style={{
                      fontSize: 12,
                      opacity: (submitting || !mdpAdmin.trim() || (!!nouveauMdp && nouveauMdp !== confMdp)) ? 0.5 : 1,
                      cursor: (submitting || !mdpAdmin.trim() || (!!nouveauMdp && nouveauMdp !== confMdp)) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Déblocage…' : 'Confirmer le déblocage'}
                  </button>
                </div>
              </>
            )}

            {modalOk && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="adm-btn adm-btn-primary" onClick={fermerModal} style={{ fontSize: 12 }}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Styles inline partagés ─────────────────────────────────────────────────────

const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 10.5, fontWeight: 600,
  color: 'var(--c-t3)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 6,
};

const inputSt = (hasErr: boolean): React.CSSProperties => ({
  width: '100%', padding: '8px 40px 8px 12px', borderRadius: 8, fontSize: 13,
  border: `1px solid ${hasErr ? 'var(--c-red)' : 'var(--c-bdr)'}`,
  background: 'var(--c-surf2)', color: 'var(--c-t0)', outline: 'none',
  fontFamily: 'Roboto, system-ui, sans-serif',
});

// ── Sous-composants ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--c-surf)', borderRadius: 12,
        border: '1px solid var(--c-bdr)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        width: '100%', maxWidth: 480, padding: 24,
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function AlertBand({ type, message, onClose }: {
  type: 'error' | 'success'; message: string; onClose: () => void;
}) {
  const isErr = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 8,
      background: isErr ? 'var(--c-red-bg)' : 'var(--c-green-bg)',
      color: isErr ? 'var(--c-red)' : 'var(--c-green)',
      border: `1px solid ${isErr ? 'var(--c-red)' : 'var(--c-green-bd)'}`,
      fontSize: 12,
    }}>
      {isErr
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
      }
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}>×</button>
    </div>
  );
}

function EyeBtn({ open, toggle }: { open: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} style={{
      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--c-t3)', display: 'flex', alignItems: 'center', padding: 2,
    }}>
      {open ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    MEDECIN:             { bg: 'var(--c-accent-bg)', color: 'var(--c-accent)',  border: 'var(--c-accent-bd)' },
    AGENT_ADMINISTRATIF: { bg: 'var(--c-green-bg)',  color: 'var(--c-green)',   border: 'var(--c-green-bd)'  },
    AGENT_RENSEIGNEMENT: { bg: 'var(--c-amber-bg)',  color: 'var(--c-amber)',   border: 'var(--c-amber)'     },
    ADMINISTRATEUR:      { bg: 'var(--c-red-bg)',    color: 'var(--c-red)',     border: 'var(--c-red)'       },
  };
  const s = colors[role] ?? { bg: 'var(--c-surf3)', color: 'var(--c-t2)', border: 'var(--c-bdr)' };
  const labels: Record<string, string> = {
    MEDECIN: 'Médecin', AGENT_ADMINISTRATIF: 'Ag. administratif',
    AGENT_RENSEIGNEMENT: 'Ag. renseignement', ADMINISTRATEUR: 'Administrateur',
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 12,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {labels[role] ?? role}
    </span>
  );
}

