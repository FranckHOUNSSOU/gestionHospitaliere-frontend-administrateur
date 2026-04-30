import React, { useState } from 'react';
import type { PatientType } from './accueilPatient/types';
import { KpiCards } from './accueilPatient/KpiCards';
import { TypeSelector } from './accueilPatient/TypeSelector';
import { NouveauPatientForm } from './accueilPatient/NouveauPatientForm';
import { AncienPatientSection } from './accueilPatient/AncienPatientSection';
import { CritiqueFormSection } from './accueilPatient/CritiqueFormSection';

const AccueilPatient: React.FC = () => {
  const [patientType, setPatientType] = useState<PatientType>(null);
  const [stats, setStats] = useState({ enregistres: 24, anciens: 18, nouveaux: 6, critiques: 2 });

  const handleSuccess = () => {
    setStats(s => ({
      ...s,
      enregistres: s.enregistres + 1,
      nouveaux:  patientType === 'nouveau'  ? s.nouveaux  + 1 : s.nouveaux,
      critiques: patientType === 'critique' ? s.critiques + 1 : s.critiques,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Accueil Patient</p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', margin: '4px 0 0' }}>
          Enregistrement et prise en charge des patients entrants
        </p>
      </div>
      <KpiCards stats={stats} />
      <TypeSelector selected={patientType} onSelect={setPatientType} />
      {patientType === 'nouveau'  && <NouveauPatientForm  onSuccess={handleSuccess} />}
      {patientType === 'ancien'   && <AncienPatientSection />}
      {patientType === 'critique' && <CritiqueFormSection onSuccess={handleSuccess} />}
    </div>
  );
};

export default AccueilPatient;
