import React, { useState } from 'react';
import { Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  UserPlus, UserCheck, AlertTriangle, Search,
  User, Phone, Users, MapPin, ChevronRight,
  CheckCircle, Info, RotateCcw, Calendar,
} from 'lucide-react';
import { api, type PatientBackend } from './api';

/* ─── Types locaux ─── */
type PatientType = 'nouveau' | 'ancien' | 'critique' | null;

interface NouveauForm {
  nom: string; prenoms: string; sexe: string;
  dateNaissance: string; lieuNaissance: string;
  nationalite: string; profession: string;
  situationFamiliale: string; numeroCNI: string;
  adresse: string; commune: string; departement: string;
  telephoneMobile: string; telephoneSecondaire: string; email: string;
  contactUrgenceNom: string; contactUrgencePrenoms: string;
  contactUrgenceLienParente: string; contactUrgenceTelephone: string;
  contactUrgenceTelSecondaire: string; contactUrgenceAdresse: string;
}

interface CritiqueForm {
  nom: string; prenom: string; sexe: string; ageEstime: string;
  accompagnantNom: string; accompagnantTelephone: string; circonstancesAdmission: string;
}

const emptyNouveau = (): NouveauForm => ({
  nom: '', prenoms: '', sexe: '', dateNaissance: '', lieuNaissance: '',
  nationalite: '', profession: '', situationFamiliale: '', numeroCNI: '',
  adresse: '', commune: '', departement: '', telephoneMobile: '',
  telephoneSecondaire: '', email: '',
  contactUrgenceNom: '', contactUrgencePrenoms: '',
  contactUrgenceLienParente: '', contactUrgenceTelephone: '',
  contactUrgenceTelSecondaire: '', contactUrgenceAdresse: '',
});

const emptyCritique = (): CritiqueForm => ({
  nom: '', prenom: '', sexe: '', ageEstime: '',
  accompagnantNom: '', accompagnantTelephone: '', circonstancesAdmission: '',
});

/* ─── Minimal custom CSS (uniquement ce que Bootstrap ne couvre pas) ─── */
const CUSTOM_STYLE = `
  body { background: #f4f6fb !important; }

  .ap-type-card {
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    cursor: pointer;
    transition: all .18s ease;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 4px rgba(0,0,0,.07);
    height: 100%;
  }
  .ap-type-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); transform: translateY(-2px); }
  .ap-type-card.sel-blue   { border-color: #2563eb; background: #eff6ff; }
  .ap-type-card.sel-green  { border-color: #16a34a; background: #f0fdf4; }
  .ap-type-card.sel-red    { border-color: #dc2626; background: #fef2f2; }

  .ap-avatar {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
  }

  .ap-patient-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer; transition: background .12s;
  }
  .ap-patient-row:last-child { border-bottom: none; }
  .ap-patient-row:hover { background: #f8fafc; }
`;

const AVATAR_COLORS = ['#2563eb', '#16a34a', '#7c3aed', '#ea580c', '#dc2626'];
const initials = (n: string, p: string) =>
  `${n[0] ?? '?'}${p[0] ?? ''}`.toUpperCase();

/* ─── Composant champ générique ─── */
const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label, required, children,
}) => (
  <div className="mb-3">
    <label className="form-label fw-semibold text-secondary" style={{ fontSize: 12 }}>
      {label}{required && <span className="text-danger"> *</span>}
    </label>
    {children}
  </div>
);

/* ─── Stat Cards ─── */
const StatCards: React.FC<{ stats: { enregistres: number; anciens: number; nouveaux: number; critiques: number } }> = ({ stats }) => {
  const items = [
    { val: stats.enregistres, label: "Patients enregistrés aujourd'hui", color: 'primary',   icon: <UserPlus size={20}/>     },
    { val: stats.anciens,     label: 'Anciens patients accueillis',        color: 'success',   icon: <UserCheck size={20}/>    },
    { val: stats.nouveaux,    label: 'Nouveaux patients créés',            color: 'warning',   icon: <UserPlus size={20}/>     },
    { val: stats.critiques,   label: 'Admissions critiques',               color: 'danger',    icon: <AlertTriangle size={20}/> },
  ];
  return (
    <Row className="g-3 mb-3">
      {items.map(s => (
        <Col key={s.label} xs={6} lg={3}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3 p-3">
              <div className={`bg-${s.color} bg-opacity-10 text-${s.color} rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`}
                style={{ width: 46, height: 46 }}>
                {s.icon}
              </div>
              <div>
                <div className="fw-bold fs-4 lh-1">{s.val}</div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

/* ─── Sélecteur de type ─── */
const TypeSelector: React.FC<{ selected: PatientType; onSelect: (t: PatientType) => void }> = ({
  selected, onSelect,
}) => {
  const types = [
    { key: 'nouveau',  label: 'Nouveau patient',  desc: "Première visite, création du profil avec pièce d'identité", icon: <UserPlus size={26}/>, cls: 'blue',  badgeCls: 'primary', badge: 'NEW'      },
    { key: 'ancien',   label: 'Ancien patient',   desc: 'Recherche par IPP ou nom dans le système',                   icon: <UserCheck size={26}/>, cls: 'green', badgeCls: 'success', badge: 'EXISTANT' },
    { key: 'critique', label: 'État critique',    desc: 'Prise en charge immédiate, procédure administrative différée',icon: <AlertTriangle size={26}/>, cls: 'red', badgeCls: 'danger',  badge: 'URGENCE'  },
  ];
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header bg-white border-bottom d-flex align-items-center gap-3 py-3">
        <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36 }}><Users size={18}/></div>
        <div>
          <div className="fw-bold" style={{ fontSize: 14 }}>Accueil d'un patient</div>
          <div className="text-muted" style={{ fontSize: 12 }}>Sélectionnez la situation du patient</div>
        </div>
      </div>
      <div className="card-body">
        <Row className="g-3">
          {types.map(t => {
            const selCls = selected === t.key ? `sel-${t.cls}` : '';
            const iconBg = t.cls === 'blue' ? '#dbeafe' : t.cls === 'green' ? '#dcfce7' : '#fee2e2';
            const iconColor = t.cls === 'blue' ? '#1d4ed8' : t.cls === 'green' ? '#15803d' : '#b91c1c';
            return (
              <Col key={t.key} md={4}>
                <div className={`ap-type-card ${selCls}`}
                  onClick={() => onSelect(selected === t.key ? null : t.key as PatientType)}>
                  <Badge bg={t.badgeCls} className="position-absolute top-0 end-0 m-2"
                    style={{ fontSize: 10, letterSpacing: '.5px' }}>{t.badge}</Badge>
                  <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: 52, height: 52, background: iconBg, color: iconColor }}>
                    {t.icon}
                  </div>
                  <div className="fw-bold mb-1" style={{ fontSize: 15 }}>{t.label}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{t.desc}</div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

/* ─── Formulaire Nouveau Patient ─── */
const NouveauPatientForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState<NouveauForm>(emptyNouveau());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIpp, setCreatedIpp] = useState<string | null>(null);

  const set = (k: keyof NouveauForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const required: (keyof NouveauForm)[] = [
      'nom', 'prenoms', 'sexe', 'dateNaissance',
      'adresse', 'telephoneMobile',
      'contactUrgenceNom', 'contactUrgencePrenoms',
      'contactUrgenceLienParente', 'contactUrgenceTelephone',
    ];
    const missing = required.filter(k => !form[k].trim());
    if (missing.length) { setError('Veuillez remplir tous les champs obligatoires.'); return; }

    setLoading(true); setError(null);
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenoms,
        sexe: form.sexe as 'M' | 'F' | 'Autre',
        dateNaissance: form.dateNaissance,
        lieuNaissance: form.lieuNaissance || undefined,
        nationalite: form.nationalite || undefined,
        adresse: form.adresse,
        telephoneMobile: form.telephoneMobile,
        telephoneFixe: form.telephoneSecondaire || undefined,
        email: form.email || undefined,
        contactUrgenceNom: form.contactUrgenceNom,
        contactUrgencePrenom: form.contactUrgencePrenoms,
        contactUrgenceLienParente: form.contactUrgenceLienParente,
        contactUrgenceTelephone: form.contactUrgenceTelephone,
      };
      const result = await api.post<PatientBackend>('/patients/accueil', payload);
      setCreatedIpp(result.numeroIpp);
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  if (createdIpp) return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5">
        <CheckCircle size={52} color="#16a34a" className="mb-3"/>
        <h6 className="fw-bold">Patient enregistré avec succès</h6>
        <p className="text-muted mb-1">Numéro IPP généré automatiquement</p>
        <Badge bg="primary" className="fs-6 px-3 py-2 mb-4">{createdIpp}</Badge>
        <div>
          <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
            onClick={() => { setForm(emptyNouveau()); setCreatedIpp(null); }}>
            <RotateCcw size={14}/> Nouvel enregistrement
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column gap-3">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Bloc 1 — Identité */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-light border-bottom d-flex align-items-center gap-2 py-3">
          <span className="badge bg-primary rounded-3 px-2 py-2" style={{ fontSize: 12 }}>1</span>
          <span className="fw-bold" style={{ fontSize: 13 }}>Identité du patient</span>
          <span className="ms-auto text-danger" style={{ fontSize: 11 }}>Champs obligatoires *</span>
        </div>
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}><Field label="Nom" required><input className="form-control form-control-sm" placeholder="Ex: HOUNSOU" value={form.nom} onChange={set('nom')}/></Field></Col>
            <Col md={4}><Field label="Prénom(s)" required><input className="form-control form-control-sm" placeholder="Ex: Franck Serge" value={form.prenoms} onChange={set('prenoms')}/></Field></Col>
            <Col md={4}><Field label="Sexe" required>
              <select className="form-select form-select-sm" value={form.sexe} onChange={set('sexe')}>
                <option value="">— Choisir —</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </Field></Col>
            <Col md={4}><Field label="Date de naissance" required><input type="date" className="form-control form-control-sm" value={form.dateNaissance} onChange={set('dateNaissance')}/></Field></Col>
            <Col md={4}><Field label="Lieu de naissance"><input className="form-control form-control-sm" placeholder="Ex: Cotonou" value={form.lieuNaissance} onChange={set('lieuNaissance')}/></Field></Col>
            <Col md={4}><Field label="Nationalité"><input className="form-control form-control-sm" placeholder="Ex: Béninoise" value={form.nationalite} onChange={set('nationalite')}/></Field></Col>
            <Col md={4}><Field label="Profession"><input className="form-control form-control-sm" placeholder="Ex: Enseignant" value={form.profession} onChange={set('profession')}/></Field></Col>
            <Col md={4}><Field label="Situation familiale">
              <select className="form-select form-select-sm" value={form.situationFamiliale} onChange={set('situationFamiliale')}>
                <option value="">— Choisir —</option>
                <option value="celibataire">Célibataire</option>
                <option value="marie">Marié(e)</option>
                <option value="divorce">Divorcé(e)</option>
                <option value="veuf">Veuf / Veuve</option>
              </select>
            </Field></Col>
            <Col md={4}><Field label="N° CNI / Passeport"><input className="form-control form-control-sm" placeholder="Ex: BJ20240001234" value={form.numeroCNI} onChange={set('numeroCNI')}/></Field></Col>
          </Row>
        </div>
      </div>

      {/* Bloc 2 — Coordonnées */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-light border-bottom d-flex align-items-center gap-2 py-3">
          <span className="badge bg-success rounded-3 px-2 py-2" style={{ fontSize: 12 }}>2</span>
          <span className="fw-bold" style={{ fontSize: 13 }}>Coordonnées</span>
        </div>
        <div className="card-body">
          <Row className="g-3">
            <Col md={12}><Field label="Adresse complète" required><input className="form-control form-control-sm" placeholder="Ex: Quartier Cadjèhoun, Rue 23, Porte 15" value={form.adresse} onChange={set('adresse')}/></Field></Col>
            <Col md={4}><Field label="Commune"><input className="form-control form-control-sm" placeholder="Ex: Cotonou" value={form.commune} onChange={set('commune')}/></Field></Col>
            <Col md={4}><Field label="Département"><input className="form-control form-control-sm" placeholder="Ex: Littoral" value={form.departement} onChange={set('departement')}/></Field></Col>
            <Col md={4}><Field label="Email"><input type="email" className="form-control form-control-sm" placeholder="Ex: patient@email.com" value={form.email} onChange={set('email')}/></Field></Col>
            <Col md={6}><Field label="Téléphone mobile" required><input className="form-control form-control-sm" placeholder="+229 97 00 00 00" value={form.telephoneMobile} onChange={set('telephoneMobile')}/></Field></Col>
            <Col md={6}><Field label="Téléphone secondaire"><input className="form-control form-control-sm" placeholder="+229 97 00 00 00" value={form.telephoneSecondaire} onChange={set('telephoneSecondaire')}/></Field></Col>
          </Row>
        </div>
      </div>

      {/* Bloc 3 — Contact d'urgence */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-light border-bottom d-flex align-items-center gap-2 py-3">
          <span className="badge rounded-3 px-2 py-2" style={{ fontSize: 12, background: '#ea580c' }}>3</span>
          <span className="fw-bold" style={{ fontSize: 13 }}>Contact d'urgence</span>
        </div>
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}><Field label="Nom" required><input className="form-control form-control-sm" placeholder="Ex: HOUNSOU" value={form.contactUrgenceNom} onChange={set('contactUrgenceNom')}/></Field></Col>
            <Col md={4}><Field label="Prénom(s)" required><input className="form-control form-control-sm" placeholder="Ex: Marie" value={form.contactUrgencePrenoms} onChange={set('contactUrgencePrenoms')}/></Field></Col>
            <Col md={4}><Field label="Lien de parenté" required>
              <select className="form-select form-select-sm" value={form.contactUrgenceLienParente} onChange={set('contactUrgenceLienParente')}>
                <option value="">— Choisir —</option>
                <option value="Conjoint(e)">Conjoint(e)</option>
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Frère">Frère</option>
                <option value="Sœur">Sœur</option>
                <option value="Enfant">Enfant</option>
                <option value="Ami(e)">Ami(e)</option>
                <option value="Autre">Autre</option>
              </select>
            </Field></Col>
            <Col md={4}><Field label="Téléphone" required><input className="form-control form-control-sm" placeholder="+229 97 00 00 00" value={form.contactUrgenceTelephone} onChange={set('contactUrgenceTelephone')}/></Field></Col>
            <Col md={4}><Field label="Téléphone secondaire"><input className="form-control form-control-sm" placeholder="+229 97 00 00 00" value={form.contactUrgenceTelSecondaire} onChange={set('contactUrgenceTelSecondaire')}/></Field></Col>
            <Col md={4}><Field label="Adresse"><input className="form-control form-control-sm" placeholder="Ex: Cotonou, Akpakpa" value={form.contactUrgenceAdresse} onChange={set('contactUrgenceAdresse')}/></Field></Col>
          </Row>
        </div>
        <div className="card-footer bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="text-muted d-flex align-items-center gap-2" style={{ fontSize: 12 }}>
            <Info size={14}/> Le profil sera soumis pour validation
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
              onClick={() => setForm(emptyNouveau())} disabled={loading}>
              <RotateCcw size={13}/> Réinitialiser
            </button>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              onClick={handleSubmit} disabled={loading}>
              {loading ? <><Spinner size="sm" animation="border"/> Enregistrement…</> : <>Enregistrer le patient <ChevronRight size={13}/></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Ancien Patient ─── */
const AncienPatientSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientBackend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(null);
    try {
      const data = await api.get<PatientBackend[]>(`/patients/recherche?q=${encodeURIComponent(q)}`);
      setResults(data);
      setSearched(true);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setQuery(''); setResults([]); setSearched(false); setError(null); };

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="card-header bg-light border-bottom d-flex align-items-center gap-3 py-3">
        <div className="bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36 }}><Search size={16}/></div>
        <div>
          <div className="fw-bold" style={{ fontSize: 14 }}>Recherche du dossier existant</div>
          <div className="text-muted" style={{ fontSize: 12 }}>Rechercher par IPP, nom ou prénom</div>
        </div>
      </div>

      <div className="p-3 border-bottom">
        {error && <Alert variant="danger" className="mb-2 py-2" onClose={() => setError(null)} dismissible>{error}</Alert>}
        <div className="d-flex gap-2">
          <div className="position-relative flex-grow-1">
            <Search size={13} className="position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)' }}/>
            <input
              className="form-control form-control-sm ps-4"
              placeholder="Rechercher par IPP, nom ou prénom..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          {searched && (
            <button className="btn btn-outline-secondary btn-sm" onClick={reset}>
              Effacer
            </button>
          )}
          <button className="btn btn-success btn-sm d-flex align-items-center gap-2"
            onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? <Spinner size="sm" animation="border"/> : <Search size={13}/>}
            Rechercher
          </button>
        </div>
      </div>

      {!searched && !loading && (
        <div className="text-center py-5">
          <div className="bg-light rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 56, height: 56 }}><User size={26} className="text-muted"/></div>
          <div className="fw-bold mb-1">Lancez une recherche</div>
          <div className="text-muted" style={{ fontSize: 13 }}>Saisissez un critère ci-dessus pour retrouver un dossier</div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="text-center py-5">
          <div className="bg-light rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 56, height: 56 }}><User size={26} className="text-muted"/></div>
          <div className="fw-bold mb-1">Aucun patient trouvé</div>
          <div className="text-muted" style={{ fontSize: 13 }}>Aucun résultat pour « {query} »</div>
        </div>
      )}

      {searched && results.length > 0 && (
        <>
          <div className="px-3 py-2 text-muted fw-semibold" style={{ fontSize: 12 }}>
            {results.length} résultat(s) trouvé(s)
          </div>
          {results.map((p, i) => (
            <div key={p.id} className="ap-patient-row">
              <div className="ap-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                {initials(p.nom, p.prenom)}
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="fw-bold" style={{ fontSize: 13 }}>{p.nom}, {p.prenom}</div>
                <div className="d-flex gap-3 flex-wrap mt-1" style={{ fontSize: 11, color: '#64748b' }}>
                  <span className="d-flex align-items-center gap-1"><User size={10}/>{p.sexe === 'F' ? 'Féminin' : 'Masculin'}</span>
                  {p.dateNaissance && <span className="d-flex align-items-center gap-1"><Calendar size={10}/>{p.dateNaissance}</span>}
                  {p.telephoneMobile && <span className="d-flex align-items-center gap-1"><Phone size={10}/>{p.telephoneMobile}</span>}
                </div>
              </div>
              {p.statutProfil === 'Incomplet' && (
                <Badge bg="warning" text="dark" className="me-2" style={{ fontSize: 10 }}>Incomplet</Badge>
              )}
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold me-1" style={{ fontSize: 11 }}>
                {p.numeroIpp}
              </span>
              <ChevronRight size={16} className="text-muted"/>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

/* ─── Formulaire Critique ─── */
const CritiqueFormSection: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState<CritiqueForm>(emptyCritique());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIpp, setCreatedIpp] = useState<string | null>(null);

  const set = (k: keyof CritiqueForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdmit = async () => {
    setLoading(true); setError(null);
    try {
      const payload: Record<string, any> = {};
      if (form.nom.trim())                      payload.nom                    = form.nom;
      if (form.prenom.trim())                   payload.prenom                 = form.prenom;
      if (form.sexe)                            payload.sexe                   = form.sexe;
      if (form.ageEstime.trim())                payload.ageEstime              = Number(form.ageEstime);
      if (form.accompagnantNom.trim())          payload.accompagnantNom        = form.accompagnantNom;
      if (form.accompagnantTelephone.trim())    payload.accompagnantTelephone  = form.accompagnantTelephone;
      if (form.circonstancesAdmission.trim())   payload.circonstancesAdmission = form.circonstancesAdmission;

      const result = await api.post<PatientBackend>('/patients/critique', payload);
      setCreatedIpp(result.numeroIpp);
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l\'admission.');
    } finally {
      setLoading(false);
    }
  };

  if (createdIpp) return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5">
        <AlertTriangle size={52} color="#dc2626" className="mb-3"/>
        <h6 className="fw-bold text-danger">Admission critique enregistrée</h6>
        <p className="text-muted mb-1">IPP provisoire généré — À compléter après stabilisation</p>
        <Badge bg="danger" className="fs-6 px-3 py-2 mb-4">{createdIpp}</Badge>
        <div>
          <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
            onClick={() => { setForm(emptyCritique()); setCreatedIpp(null); }}>
            <RotateCcw size={14}/> Nouvelle admission critique
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column gap-3">
      <div className="rounded-3 p-3 d-flex gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
        <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }}/>
        <div>
          <div className="fw-bold text-danger mb-1" style={{ fontSize: 13 }}>Admission en état critique</div>
          <div className="text-danger" style={{ fontSize: 12, lineHeight: 1.5 }}>
            Le patient sera pris en charge immédiatement. Un numéro IPP provisoire sera généré.
            Un accompagnant devra compléter les informations administratives après stabilisation.
          </div>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-light border-bottom d-flex align-items-center gap-2 py-3">
          <span className="badge bg-danger rounded-3 d-flex align-items-center justify-content-center p-1">
            <AlertTriangle size={13}/>
          </span>
          <span className="fw-bold" style={{ fontSize: 13 }}>Informations minimales (si disponibles)</span>
          <span className="ms-auto text-success fw-semibold" style={{ fontSize: 11 }}>Tout est optionnel</span>
        </div>
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}><Field label="Nom (si connu)"><input className="form-control form-control-sm" placeholder="Inconnu si non disponible" value={form.nom} onChange={set('nom')}/></Field></Col>
            <Col md={4}><Field label="Prénom (si connu)"><input className="form-control form-control-sm" placeholder="Inconnu si non disponible" value={form.prenom} onChange={set('prenom')}/></Field></Col>
            <Col md={4}><Field label="Sexe (si visible)">
              <select className="form-select form-select-sm" value={form.sexe} onChange={set('sexe')}>
                <option value="">— Non déterminé —</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </Field></Col>
            <Col md={4}><Field label="Âge estimé"><input className="form-control form-control-sm" placeholder="Ex: 35" value={form.ageEstime} onChange={set('ageEstime')}/></Field></Col>
            <Col md={4}><Field label="Accompagnant (nom)"><input className="form-control form-control-sm" placeholder="Nom de l'accompagnant" value={form.accompagnantNom} onChange={set('accompagnantNom')}/></Field></Col>
            <Col md={4}><Field label="Téléphone accompagnant"><input className="form-control form-control-sm" placeholder="+229 97 00 00 00" value={form.accompagnantTelephone} onChange={set('accompagnantTelephone')}/></Field></Col>
            <Col md={12}><Field label="Circonstances d'admission">
              <textarea className="form-control form-control-sm" rows={3}
                placeholder="Accident, malaise, blessure… (informations des secours ou de l'accompagnant)"
                value={form.circonstancesAdmission} onChange={set('circonstancesAdmission')}/>
            </Field></Col>
          </Row>
        </div>
        <div className="card-footer bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="text-muted d-flex align-items-center gap-2" style={{ fontSize: 12 }}>
            <Info size={14}/> Le profil sera marqué « Incomplet » — À compléter par un agent
          </span>
          <button className="btn btn-danger btn-sm d-flex align-items-center gap-2"
            onClick={handleAdmit} disabled={loading}>
            {loading
              ? <><Spinner size="sm" animation="border"/> Enregistrement…</>
              : <><AlertTriangle size={13}/> Admettre en urgence — Générer IPP provisoire</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Composant Principal ─── */
const AccueilPatient: React.FC = () => {
  const [patientType, setPatientType] = useState<PatientType>(null);
  const [stats, setStats] = useState({ enregistres: 24, anciens: 18, nouveaux: 6, critiques: 2 });

  const handleSuccess = () => {
    setStats(s => ({
      ...s,
      enregistres: s.enregistres + 1,
      nouveaux: patientType === 'nouveau' ? s.nouveaux + 1 : s.nouveaux,
      critiques: patientType === 'critique' ? s.critiques + 1 : s.critiques,
    }));
  };

  return (
    <>
      <style>{CUSTOM_STYLE}</style>
      <Container fluid style={{ background: '#f4f6fb', minHeight: '100vh', padding: '24px' }}>
        <div className="mb-4">
          <h5 className="fw-bold mb-1" style={{ fontSize: 18 }}>Accueil Patient</h5>
          <div className="text-muted" style={{ fontSize: 13 }}>
            Enregistrement et prise en charge des patients entrants
          </div>
        </div>

        <StatCards stats={stats}/>
        <TypeSelector selected={patientType} onSelect={setPatientType}/>

        {patientType === 'nouveau'  && <NouveauPatientForm  onSuccess={handleSuccess}/>}
        {patientType === 'ancien'   && <AncienPatientSection/>}
        {patientType === 'critique' && <CritiqueFormSection onSuccess={handleSuccess}/>}
      </Container>
    </>
  );
};

export default AccueilPatient;