import { useState } from 'react';
import { Search, Plus, Eye, CreditCard as Edit2, Filter, Download, Users } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/agent/ui/Badge';
import { patients as allPatients } from '../../../data/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import type { PatientStatus } from '../../../types/index';

export default function PatientList() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');

  const filtered = allPatients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.insuranceNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  function calcAge(dob: string) {
    const diff = new Date().getFullYear() - new Date(dob).getFullYear();
    return diff;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <Users size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{allPatients.length} patients enregistrés</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={15} />
            Exporter
          </button>
          <button
            onClick={() => navigate('patient-new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nouveau patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, numéro d'assurance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="hospitalized">Hospitalisé</option>
              <option value="discharged">Sorti</option>
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as 'all' | 'M' | 'F')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-600"
            >
              <option value="all">Tous</option>
              <option value="M">Hommes</option>
              <option value="F">Femmes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Patient</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Âge / Sexe</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Assurance</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Enregistré</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Statut</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const { variant, label } = statusBadge(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{p.lastName} {p.firstName}</p>
                            <p className="text-xs text-slate-400">Groupe {p.bloodType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-700">{calcAge(p.dateOfBirth)} ans</span>
                        <span className="ml-2 text-slate-400">{p.gender === 'M' ? 'H' : 'F'}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600">{p.phone}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-slate-700">{p.insurance}</p>
                        {p.insuranceNumber && <p className="text-xs text-slate-400">{p.insuranceNumber}</p>}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                        {new Date(p.registrationDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate('patient-detail', p.id)}
                            title="Voir le dossier"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate('patient-edit', p.id)}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {allPatients.length}</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 transition-colors disabled:opacity-40" disabled>
              Précédent
            </button>
            <button className="px-3 py-1 rounded border border-blue-500 bg-blue-600 text-white font-semibold">1</button>
            <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
