import React, { useState, useRef } from 'react';
import {
  Search, User, ChevronRight, FileText,
  Calendar, Phone, X, Filter, AlertTriangle,
} from 'lucide-react';
import { patientsData, type Patient } from '../../data/patients';

const AVATAR_COLORS = ['#388bfd', '#3fb950', '#7c3aed', '#d29922', '#f85149'];
const initials = (nom: string, prenom: string) =>
  `${nom[0] ?? '?'}${prenom[0] ?? ''}`.toUpperCase();

const RechercheDossier: React.FC = () => {
  const [searchType, setSearchType] = useState('nom');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<Patient[]>([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setError(null);
    try {
      const data = await patientsData.rechercher(q.trim());
      setResults(data); setSearched(true);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la recherche.');
    } finally { setLoading(false); }
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
    searchType === 'ipp' ? 'Ex: IPP-2024-0001'     :
    searchType === 'tel' ? 'Ex: +229 97 00 11 22'   :
    searchType === 'ddn' ? 'Ex: 08/03/1988'         :
                           'Ex: HOUNSOU ou Franck';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* En-tête */}
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Recherche Dossier</p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', margin: '4px 0 0' }}>
          Retrouvez un patient par IPP, nom, prénom, téléphone ou date de naissance
        </p>
      </div>

      {/* Carte de recherche */}
      <div className="adm-card" style={{ overflow: 'hidden' }}>
        <div className="adm-card-head">
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--c-amber-bg)', color: 'var(--c-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Search size={16} />
          </div>
          <div>
            <p className="adm-card-title">Recherche de dossier</p>
            <p className="adm-card-sub">Saisie automatique à partir de 2 caractères</p>
          </div>
        </div>

        <div className="adm-card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="adm-input"
            style={{ width: 'auto', minWidth: 190, flexShrink: 0 }}
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
          >
            <option value="nom">Par Nom / Prénom</option>
            <option value="ipp">Par IPP</option>
            <option value="tel">Par Téléphone</option>
            <option value="ddn">Par Date de naissance</option>
          </select>

          <div className="adm-search" style={{ flex: 1, minWidth: 200 }}>
            <span className="adm-search-icon"><Search size={13} /></span>
            <input
              className="adm-search-input"
              placeholder={placeholder}
              value={query}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && runSearch(query)}
            />
            {query && (
              <button
                onClick={reset}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)',
                  display: 'flex', alignItems: 'center', padding: 2,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            className="adm-btn adm-btn-primary"
            onClick={() => runSearch(query)}
            disabled={loading || !query.trim()}
          >
            <Search size={13} /> {loading ? 'Recherche…' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="adm-alert adm-alert-danger">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* État initial */}
      {!searched && !loading && (
        <div className="adm-card">
          <div className="adm-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12, background: 'var(--c-surf2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            }}>
              <FileText size={26} color="var(--c-t3)" />
            </div>
            <p style={{ fontWeight: 700, color: 'var(--c-t0)', marginBottom: 4 }}>Lancez une recherche</p>
            <p style={{ fontSize: 12, color: 'var(--c-t2)' }}>
              Saisissez un critère de recherche ci-dessus pour retrouver un dossier patient
            </p>
          </div>
        </div>
      )}

      {/* Chargement */}
      {loading && !searched && (
        <div className="adm-card">
          <div className="adm-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', margin: '0 auto 14px',
              border: '3px solid var(--c-bdr)', borderTopColor: 'var(--c-accent)',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: 'var(--c-t2)' }}>Recherche en cours…</p>
          </div>
        </div>
      )}

      {/* Résultats */}
      {searched && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--c-t2)', fontWeight: 600 }}>
              {results.length > 0
                ? `${results.length} résultat(s) pour « ${query} »`
                : `Aucun résultat pour « ${query} »`}
            </span>
            <button className="adm-btn" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={11} /> Nouvelle recherche
            </button>
          </div>

          <div className="adm-card" style={{ overflow: 'hidden' }}>
            {results.length === 0 ? (
              <div className="adm-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12, background: 'var(--c-surf2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                }}>
                  <User size={26} color="var(--c-t3)" />
                </div>
                <p style={{ fontWeight: 700, color: 'var(--c-t0)', marginBottom: 4 }}>Aucun patient trouvé</p>
                <p style={{ fontSize: 12, color: 'var(--c-t2)' }}>
                  Vérifiez l'orthographe ou essayez un autre critère de recherche
                </p>
              </div>
            ) : (
              results.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderBottom: '1px solid var(--c-bdr)',
                    cursor: 'pointer', transition: 'background .1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}>
                    {initials(p.nom, p.prenom)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-t0)', marginBottom: 4 }}>
                      {p.nom}, {p.prenom}
                    </p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: 'var(--c-t3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={10} />{p.sexe === 'F' ? 'Féminin' : 'Masculin'}
                      </span>
                      {p.dateNaissance && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={10} />{p.dateNaissance}
                        </span>
                      )}
                      {p.telephoneMobile && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={10} />{p.telephoneMobile}
                        </span>
                      )}
                    </div>
                    {p.createdAt && (
                      <p style={{ fontSize: 11, color: 'var(--c-t3)', marginTop: 3 }}>
                        Enregistré le {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {p.statutProfil === 'Incomplet' && (
                      <span className="adm-tag adm-t-amber" style={{ fontSize: 10 }}>Incomplet</span>
                    )}
                    <span className="adm-tag adm-t-blue" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                      {p.numeroIpp}
                    </span>
                    <ChevronRight size={15} color="var(--c-t3)" />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RechercheDossier;
