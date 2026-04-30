import React from 'react';
import { UserPlus, UserCheck, AlertTriangle } from 'lucide-react';

interface KpiStats {
  enregistres: number;
  anciens: number;
  nouveaux: number;
  critiques: number;
}

export const KpiCards: React.FC<{ stats: KpiStats }> = ({ stats }) => (
  <div className="adm-kpi-grid">
    {[
      { val: stats.enregistres, label: "Patients enregistrés aujourd'hui", icon: <UserPlus size={16} />, cls: 'adm-kpi-blue' },
      { val: stats.anciens,     label: 'Anciens patients accueillis',       icon: <UserCheck size={16} />, cls: 'adm-kpi-green' },
      { val: stats.nouveaux,    label: 'Nouveaux patients créés',           icon: <UserPlus size={16} />, cls: 'adm-kpi-orange' },
      { val: stats.critiques,   label: 'Admissions critiques',              icon: <AlertTriangle size={16} />, cls: 'adm-kpi-danger' },
    ].map(s => (
      <div key={s.label} className={`adm-kpi ${s.cls}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{s.label}</p>
          <span style={{ opacity: 0.6 }}>{s.icon}</span>
        </div>
        <div className="adm-kpi-val">{s.val}</div>
      </div>
    ))}
  </div>
);
