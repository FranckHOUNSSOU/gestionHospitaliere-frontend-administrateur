// src/components/auth/RegisterModal.tsx

import { useState } from 'react';
import {
  Modal, Form, Button, Row, Col, Alert, Spinner,
} from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import ToastNotification from '../ui/ToastNotification';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RegisterModal.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface RegisterModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: 'MEDECIN' | 'AGENT_ADMINISTRATIF';
  telephone?: string;
  service?: string;
  numeroOrdre?: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'MEDECIN', label: 'Médecin' },
  { value: 'AGENT_ADMINISTRATIF', label: 'Agent administratif' },
] as const;

const SERVICES = [
  { value: 'Médecine générale', label: 'Médecine générale' },
  { value: 'Pédiatrie', label: 'Pédiatrie' },
  { value: 'Urgences', label: 'Urgences' },
  { value: 'Accueil / Admissions', label: 'Accueil / Admissions' },
  { value: 'Chirurgie', label: 'Chirurgie' },
  { value: 'Gynécologie', label: 'Gynécologie' },
  { value: 'Cardiologie', label: 'Cardiologie' },
  { value: 'Administration', label: 'Administration système' },
];

const VALID_ROLES = ['MEDECIN', 'AGENT_ADMINISTRATIF'] as const;
type ValidRole = typeof VALID_ROLES[number];

const initialForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  role: '' as '' | ValidRole,
  service: '',
  numeroOrdre: '',
  motDePasse: '',
  confirmMotDePasse: '',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidRole(value: string): value is ValidRole {
  return (VALID_ROLES as readonly string[]).includes(value);
}

/**
 * Traduit les messages d'erreur bruts du backend en messages lisibles.
 * On cible les cas métier connus ; les autres passent tels quels.
 */
function traduireErreur(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('email') && (m.includes('exist') || m.includes('déjà') || m.includes('conflit') || m.includes('unique'))) {
    return 'Cette adresse email est déjà utilisée par un autre compte.';
  }
  if (m.includes('forbidden') || m.includes('403') || m.includes('rôle insuffisant') || m.includes('administrateur')) {
    return 'Vous n\'avez pas les droits nécessaires pour créer un compte.';
  }
  if (m.includes('session expirée') || m.includes('reconnect')) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  return message;
}

// ── Composant ──────────────────────────────────────────────────────────────

export default function RegisterModal({ show, onHide, onSuccess }: RegisterModalProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const set = (field: keyof typeof initialForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setForm(initialForm);
    setError('');
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ── Validation ──────────────────────────────────────────────────────
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setError('Nom, prénom et email sont obligatoires.');
      return;
    }

    // Vérifie que le rôle est bien une valeur acceptée (pas la chaîne vide)
    if (!isValidRole(form.role)) {
      setError('Veuillez sélectionner un rôle.');
      return;
    }

    if (!form.motDePasse) {
      setError('Le mot de passe est obligatoire.');
      return;
    }
    if (form.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.motDePasse !== form.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // ── Construction du body (rôle garanti valide ici) ──────────────────
    const body: CreateUserDto = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      motDePasse: form.motDePasse,
      role: form.role,                           // TypeScript sait que c'est ValidRole
      ...(form.telephone  && { telephone:   form.telephone.trim() }),
      ...(form.service    && { service:     form.service }),
      ...(form.numeroOrdre && { numeroOrdre: form.numeroOrdre.trim() }),
    };

    // ── Appel API ───────────────────────────────────────────────────────
    setLoading(true);
    try {
      await apiClient.post('/auth/users', body);

      const nomComplet = `${form.prenom.trim()} ${form.nom.trim()}`;
      handleClose();

      setToastMessage(`Compte de ${nomComplet} créé. Pensez à l'activer.`);
      setToastVisible(true);

      onSuccess?.();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.';
      setError(traduireErreur(raw));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastNotification
        show={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
        type="success"
        duration={4500}
      />

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        backdrop="static"
        className="register-modal"
      >
        <Modal.Header closeButton className="register-modal__header">
          <Modal.Title className="register-modal__title">
            Créer un compte utilisateur
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="register-modal__body">
          <Form onSubmit={handleSubmit} noValidate>

            <p className="register-modal__subtitle">
              Le compte sera créé avec le statut <strong>inactif</strong>.
              Vous devrez l'activer manuellement depuis la gestion des utilisateurs.
            </p>

            {error && (
              <Alert variant="danger" className="register-modal__alert">
                {error}
              </Alert>
            )}

            <div className="register-modal__section-label">Informations personnelles</div>

            <Row className="g-3 mb-3">
              <Col xs={12} sm={6}>
                <Form.Group controlId="regNom">
                  <Form.Label className="register-modal__label">Nom</Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <Form.Control
                      type="text" placeholder="ADJOVI"
                      value={form.nom}
                      onChange={e => set('nom', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group controlId="regPrenom">
                  <Form.Label className="register-modal__label">Prénom</Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <Form.Control
                      type="text" placeholder="Kokou"
                      value={form.prenom}
                      onChange={e => set('prenom', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={12} sm={6}>
                <Form.Group controlId="regEmail">
                  <Form.Label className="register-modal__label">Email professionnel</Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <Form.Control
                      type="email" placeholder="exemple@hopital.bj"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group controlId="regTel">
                  <Form.Label className="register-modal__label">
                    Téléphone <span className="register-modal__optional"></span>
                  </Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <Form.Control
                      type="tel" placeholder="+229 01 XX XX XX XX"
                      value={form.telephone}
                      onChange={e => set('telephone', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="register-modal__section-label">Rôle et service</div>

            <Row className="g-3 mb-3">
              <Col xs={12} sm={6}>
                <Form.Group controlId="regRole">
                  <Form.Label className="register-modal__label">Rôle</Form.Label>
                  <Form.Select
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                    className="register-modal__select"
                  >
                    <option value="">Sélectionner</option>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group controlId="regService">
                  <Form.Label className="register-modal__label">
                    Service / Spécialité <span className="register-modal__optional">(optionnel)</span>
                  </Form.Label>
                  <Form.Select
                    value={form.service}
                    onChange={e => set('service', e.target.value)}
                    className="register-modal__select"
                  >
                    <option value="">Sélectionner</option>
                    {SERVICES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={12}>
                <Form.Group controlId="regNumero">
                  <Form.Label className="register-modal__label">
                    Numéro d'ordre / Matricule <span className="register-modal__optional">(optionnel)</span>
                  </Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <Form.Control
                      type="text"
                      placeholder="Ex : OM-00142 (médecins) ou MAT-0012"
                      value={form.numeroOrdre}
                      onChange={e => set('numeroOrdre', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="register-modal__section-label">Sécurité du compte</div>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6}>
                <Form.Group controlId="regMdp">
                  <Form.Label className="register-modal__label">Mot de passe</Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <Form.Control
                      type="password" placeholder="Minimum 8 caractères"
                      value={form.motDePasse}
                      onChange={e => set('motDePasse', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group controlId="regConfirm">
                  <Form.Label className="register-modal__label">Confirmer le mot de passe</Form.Label>
                  <div className="register-modal__input-wrap">
                    <svg className="register-modal__input-icon" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <Form.Control
                      type="password" placeholder="Répéter le mot de passe"
                      value={form.confirmMotDePasse}
                      onChange={e => set('confirmMotDePasse', e.target.value)}
                      className="register-modal__input"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="register-modal__footer">
              <Button
                variant="outline-secondary"
                onClick={handleClose}
                className="register-modal__btn-cancel"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="register-modal__btn-primary"
                disabled={loading}
              >
                {loading
                  ? <><Spinner animation="border" size="sm" className="me-2"/>Création...</>
                  : 'Créer le compte'
                }
              </Button>
            </div>

          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}