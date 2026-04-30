import React from 'react';
import { UserPlus, UserCheck, AlertTriangle, Users } from 'lucide-react';
import type { PatientType } from './types';

interface TypeOption {
  key: PatientType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge: string;
  color: string;
  bg: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    key: 'nouveau', label: 'Nouveau patient',
    desc: "Première visite, création du profil avec pièce d'identité",
    icon: <UserPlus size={28} />, badge: 'NEW',
    color: 'var(--c-accent)', bg: 'var(--c-accent-bg)',
  },
  {
    key: 'ancien', label: 'Ancien patient',
    desc: 'Recherche par IPP ou nom dans le système',
    icon: <UserCheck size={28} />, badge: 'EXISTANT',
    color: 'var(--c-green)', bg: 'var(--c-green-bg)',
  },
  {
    key: 'critique', label: 'État critique',
    desc: 'Prise en charge immédiate, procédure administrative différée',
    icon: <AlertTriangle size={28} />, badge: 'URGENCE',
    color: 'var(--c-red)', bg: 'var(--c-red-bg)',
  },
];

export const TypeSelector: React.FC<{
  selected: PatientType;
  onSelect: (t: PatientType) => void;
}> = ({ selected, onSelect }) => (
  <div className="adm-card">
    <div className="adm-card-head">
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: 'var(--c-accent-bg)', color: 'var(--c-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Users size={16} />
      </div>
      <div>
        <p className="adm-card-title">Accueil d'un patient</p>
        <p className="adm-card-sub">Sélectionnez la situation du patient</p>
      </div>
    </div>
    <div className="adm-card-body">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {TYPE_OPTIONS.map(t => {
          const isSelected = selected === t.key;
          return (
            <div
              key={t.key}
              onClick={() => onSelect(isSelected ? null : t.key)}
              style={{
                background: isSelected ? t.bg : 'var(--c-surf2)',
                border: `2px solid ${isSelected ? t.color : 'var(--c-bdr)'}`,
                borderRadius: 10, padding: '24px 20px', textAlign: 'center',
                cursor: 'pointer', position: 'relative',
                transition: 'border-color .15s, background .15s',
              }}
            >
              <span style={{
                position: 'absolute', top: 10, right: 10,
                fontSize: 10, fontWeight: 700, letterSpacing: '.5px',
                padding: '2px 6px', borderRadius: 4,
                background: isSelected ? t.color : 'var(--c-surf3)',
                color: isSelected ? '#fff' : 'var(--c-t3)',
              }}>
                {t.badge}
              </span>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: isSelected ? t.bg : 'var(--c-surf3)',
                color: isSelected ? t.color : 'var(--c-t2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', transition: 'all .15s',
              }}>
                {t.icon}
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-t0)', marginBottom: 6 }}>{t.label}</p>
              <p style={{ fontSize: 12, color: 'var(--c-t2)', lineHeight: 1.5 }}>{t.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
