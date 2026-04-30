import React, { useState } from 'react';
import { Search, User, Phone, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { patientsData, type Patient } from '../../../data/patients';
import { AVATAR_COLORS, initials } from './shared';

export const AncienPatientSection: React.FC = () => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(null);
    try {
      const data = await patientsData.rechercher(q);
      setResults(data); setSearched(true);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la recherche.');
    } finally { setLoading(false); }
  };

  const reset = () => { setQuery(''); setResults([]); setSearched(false); setError(null); };

  return (
    <div className="adm-card" style={{ overflow: 'hidden' }}>
      <div className="adm-card-head">
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: 'var(--c-green-bg)', color: 'var(--c-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Search size={16} />
        </div>
        <div>
          <p className="adm-card-title">Recherche du dossier existant</p>
          <p className="adm-card-sub">Rechercher par IPP, nom ou prénom</p>
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-bdr)' }}>
        {error && (
          <div className="adm-alert adm-alert-danger" style={{ marginBottom: 10 }}>
            <AlertTriangle size={13} style={{ flexShrink: 0 }} />{error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="adm-search" style={{ flex: 1 }}>
            <span className="adm-search-icon"><Search size={13} /></span>
            <input
              className="adm-search-input"
              placeholder="Rechercher par IPP, nom ou prénom…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          {searched && <button className="adm-btn" onClick={reset}>Effacer</button>}
          <button
            className="adm-btn adm-btn-primary"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            style={{ background: 'var(--c-green)', borderColor: 'var(--c-green)' }}
          >
            <Search size={13} /> {loading ? 'Recherche…' : 'Rechercher'}
          </button>
        </div>
      </div>

      {!searched && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: 'var(--c-surf2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <User size={26} color="var(--c-t3)" />
          </div>
          <p style={{ fontWeight: 700, color: 'var(--c-t0)', marginBottom: 4 }}>Lancez une recherche</p>
          <p style={{ fontSize: 12, color: 'var(--c-t2)' }}>Saisissez un critère ci-dessus pour retrouver un dossier</p>
        </div>
      )}

      {searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: 'var(--c-surf2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <User size={26} color="var(--c-t3)" />
          </div>
          <p style={{ fontWeight: 700, color: 'var(--c-t0)', marginBottom: 4 }}>Aucun patient trouvé</p>
          <p style={{ fontSize: 12, color: 'var(--c-t2)' }}>Aucun résultat pour « {query} »</p>
        </div>
      )}

      {searched && results.length > 0 && (
        <>
          <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--c-t3)', fontWeight: 600, borderBottom: '1px solid var(--c-bdr)' }}>
            {results.length} résultat(s)
          </div>
          {results.map((p, i) => (
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
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
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
              </div>
              {p.statutProfil === 'Incomplet' && (
                <span className="adm-tag adm-t-amber" style={{ fontSize: 10 }}>Incomplet</span>
              )}
              <span className="adm-tag adm-t-blue" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                {p.numeroIpp}
              </span>
              <ChevronRight size={15} color="var(--c-t3)" />
            </div>
          ))}
        </>
      )}
    </div>
  );
};
