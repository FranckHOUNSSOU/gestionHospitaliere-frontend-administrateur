import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import client from '../api/clients';
import { doctors as mockDoctors } from '../data/mockData';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
}

interface DoctorContextType {
  doctors: Doctor[];
  loading: boolean;
  refresh: () => void;
}

const DoctorContext = createContext<DoctorContextType | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [loading, setLoading] = useState(false);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const { data } = await client.get<Array<{
        id: string;
        nom: string;
        prenom: string;
        pole?: { id: string; nom: string } | null;
        service?: { id: string; nom: string } | null;
      }>>('/auth/users?role=MEDECIN');

      if (Array.isArray(data) && data.length > 0) {
        const POLE_LABELS: Record<string, string> = {
          'POLE MERE': 'Pôle Mère',
          'POLE ENFANT': 'Pôle Enfant',
          'POLE DES SERVICES COMMUNS': 'Pôle des Services Communs',
        };
        const mapped: Doctor[] = data.map((u) => ({
          id:         u.id,
          name:       `Dr. ${u.prenom} ${u.nom}`,
          specialty:  u.service?.nom ?? (u.pole ? (POLE_LABELS[u.pole.nom] ?? u.pole.nom) : 'Médecine générale'),
          department: u.pole ? (POLE_LABELS[u.pole.nom] ?? u.pole.nom) : 'Médecine générale',
        }));
        // Fusionner : médecins API en premier, puis mockData en fallback
        const mockNotInApi = mockDoctors.filter(
          (m) => !mapped.some((a) => a.name === m.name)
        );
        setDoctors([...mapped, ...mockNotInApi]);
      }
    } catch {
      // Si l'API échoue, on garde les mockDoctors déjà chargés
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <DoctorContext.Provider value={{ doctors, loading, refresh: fetchDoctors }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctors() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctors must be used within DoctorProvider');
  return ctx;
}