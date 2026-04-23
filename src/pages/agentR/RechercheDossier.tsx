import React, { useState, useRef } from 'react';
import { Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  Search, User, ChevronRight, FileText,
  Calendar, Phone, X, Filter,
} from 'lucide-react';
import { api, type PatientBackend } from './api';

/* ─── Minimal custom CSS ─── */
const STYLE = `
  body { background: #f4f6fb !important; }

  .rd-result-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer; transition: background .12s;
  }
  .rd-result-row:last-child { border-bottom: none; }
  .rd-result-row:hover { background: #f8fafc; }

  .rd-avatar {
    width: 42px; height: 42px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
`;

const AVATAR_COLORS = ['#2563eb', '#16a34a', '#7c3aed', '#ea580c', '#dc2626'];
const initials = (nom: string, prenom: string) =>
  `${nom[0] ?? '?'}${prenom[0] ?? ''}`.toUpperCase();

/* ─── Composant ─── */
const RechercheDossier: React.FC = () => {
  const [searchType, setSearchType] = useState('nom');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<PatientBackend[]>([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [error, setError]           = useState<string | null>(null);

  /* Debounce ref pour la recherche auto */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setError(null);
    try {
      const data = await api.get<PatientBackend[]>(
        `/patients/recherche?q=${encodeURIComponent(q.trim())}`
      );
      setResults(data);
      setSearched(true);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(val), 400);
    } else if (!val.trim()) {
      setSearched(false); setResults([]);
    }
  };

  const reset = () => {
    setQuery(''); setResults([]); setSearched(false); setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const placeholder =
    searchType === 'ipp' ? 'Ex: IPP-2024-0001'    :
    searchType === 'tel' ? 'Ex: +229 97 00 11 22'  :
    searchType === 'ddn' ? 'Ex: 08/03/1988'        :
                           'Ex: HOUNSOU ou Franck';

  return (
    <>
      <style>{STYLE}</style>
      <Container fluid style={{ background: '#f4f6fb', minHeight: '100vh', padding: '24px' }}>

        {/* En-tête */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1" style={{ fontSize: 18 }}>Recherche Dossier</h5>
          <div className="text-muted" style={{ fontSize: 13 }}>
            Retrouvez un patient par IPP, nom, prénom, téléphone ou date de naissance
          </div>
        </div>

        {/* Carte de recherche */}
        <div className="card border-0 shadow-sm mb-3 overflow-hidden">
          <div className="card-header bg-light border-bottom d-flex align-items-center gap-3 py-3">
            <div className="bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36 }}><Search size={17}/></div>
            <div>
              <div className="fw-bold" style={{ fontSize: 14 }}>Recherche de dossier</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Saisie automatique à partir de 2 caractères
              </div>
            </div>
          </div>

          <div className="card-body d-flex gap-2 flex-wrap">
            {/* Sélecteur type */}
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 200, width: 'auto' }}
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
            >
              <option value="nom">Par Nom / Prénom</option>
              <option value="ipp">Par IPP</option>
              <option value="tel">Par Téléphone</option>
              <option value="ddn">Par Date de naissance</option>
            </select>

            {/* Champ de saisie */}
            <div className="position-relative flex-grow-1">
              <Search size={13} className="position-absolute text-muted"
                style={{ left: 10, top: '50%', transform: 'translateY(-50%)' }}/>
              <input
                className="form-control form-control-sm ps-4 pe-4"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && runSearch(query)}
              />
              {query && (
                <button
                  onClick={reset}
                  className="btn btn-link p-0 position-absolute text-muted"
                  style={{ right: 8, top: '50%', transform: 'translateY(-50%)', lineHeight: 1 }}
                >
                  <X size={14}/>
                </button>
              )}
            </div>

            {/* Bouton Rechercher */}
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              onClick={() => runSearch(query)}
              disabled={loading || !query.trim()}
            >
              {loading
                ? <><Spinner size="sm" animation="border"/> Recherche…</>
                : <><Search size={13}/> Rechercher</>}
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
            {error}
          </Alert>
        )}

        {/* État initial */}
        {!searched && !loading && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="bg-light rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 56, height: 56 }}>
                <FileText size={26} className="text-muted"/>
              </div>
              <div className="fw-bold mb-1">Lancez une recherche</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                Saisissez un critère de recherche ci-dessus pour retrouver un dossier patient
              </div>
            </div>
          </div>
        )}

        {/* Spinner intermédiaire */}
        {loading && !searched && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3"/>
              <div className="text-muted" style={{ fontSize: 13 }}>Recherche en cours…</div>
            </div>
          </div>
        )}

        {/* Résultats */}
        {searched && (
          <>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-muted fw-semibold" style={{ fontSize: 13 }}>
                {results.length > 0
                  ? `${results.length} résultat(s) pour « ${query} »`
                  : `Aucun résultat pour « ${query} »`}
              </div>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={reset}>
                <Filter size={11}/> Nouvelle recherche
              </button>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden">
              {results.length === 0 ? (
                <div className="card-body text-center py-5">
                  <div className="bg-light rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: 56, height: 56 }}>
                    <User size={26} className="text-muted"/>
                  </div>
                  <div className="fw-bold mb-1">Aucun patient trouvé</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Vérifiez l'orthographe ou essayez un autre critère de recherche
                  </div>
                </div>
              ) : (
                results.map((p, i) => (
                  <div key={p.id} className="rd-result-row">
                    <div className="rd-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {initials(p.nom, p.prenom)}
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold" style={{ fontSize: 13 }}>
                        {p.nom}, {p.prenom}
                      </div>
                      <div className="d-flex gap-3 flex-wrap mt-1" style={{ fontSize: 11, color: '#64748b' }}>
                        <span className="d-flex align-items-center gap-1">
                          <User size={10}/>{p.sexe === 'F' ? 'Féminin' : 'Masculin'}
                        </span>
                        {p.dateNaissance && (
                          <span className="d-flex align-items-center gap-1">
                            <Calendar size={10}/>{p.dateNaissance}
                          </span>
                        )}
                        {p.telephoneMobile && (
                          <span className="d-flex align-items-center gap-1">
                            <Phone size={10}/>{p.telephoneMobile}
                          </span>
                        )}
                      </div>
                      {p.createdAt && (
                        <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                          Enregistré le : {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      {p.statutProfil === 'Incomplet' && (
                        <Badge bg="warning" text="dark" style={{ fontSize: 10 }}>
                          Incomplet
                        </Badge>
                      )}
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold"
                        style={{ fontSize: 11 }}>
                        {p.numeroIpp}
                      </span>
                      <ChevronRight size={16} className="text-muted"/>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default RechercheDossier;