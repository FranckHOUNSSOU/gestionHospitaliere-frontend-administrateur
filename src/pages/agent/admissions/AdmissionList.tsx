import { useState } from 'react';
import { Plus, Search, BedDouble, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/agent/ui/Badge';
import { admissions, departments } from '../../../data/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import type { AdmissionStatus } from '../../../types/index';

export default function AdmissionList() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'all'>('all');

  const filtered = admissions.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.patientName.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.room.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active = admissions.filter((a) => a.status === 'active');
  const discharged = admissions.filter((a) => a.status === 'discharged');
  const transferred = admissions.filter((a) => a.status === 'transferred');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Admissions actives', value: active.length, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: <BedDouble size={18} className="text-blue-500" /> },
          { label: 'Sorties récentes', value: discharged.length, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <CheckCircle2 size={18} className="text-emerald-500" /> },
          { label: 'Transférés', value: transferred.length, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <ArrowRight size={18} className="text-amber-500" /> },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 rounded-xl border p-4 ${s.color}`}>
            {s.icon}
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 border-b border-slate-100">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Patient, service, salle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdmissionStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="discharged">Sorti</option>
              <option value="transferred">Transféré</option>
            </select>
          </div>
          <button
            onClick={() => navigate('admission-new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} />
            Nouvelle admission
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Patient</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Service / Salle</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Médecin</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Entrée</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Sortie prévue</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Motif</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">Aucune admission trouvée</td>
                </tr>
              ) : (
                filtered.map((adm) => {
                  const { variant, label } = statusBadge(adm.status);
                  const days = adm.status === 'active'
                    ? Math.floor((new Date().getTime() - new Date(adm.admissionDate).getTime()) / 86400000)
                    : null;
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {adm.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <button
                              onClick={() => navigate('patient-detail', adm.patientId)}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {adm.patientName}
                            </button>
                            {days !== null && <p className="text-xs text-slate-400">{days} jour{days > 1 ? 's' : ''} d'hospitalisation</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-700">{adm.department}</p>
                        <p className="text-xs text-slate-400">Salle {adm.room} · Lit {adm.bed}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 text-xs">{adm.doctorName}</td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">{new Date(adm.admissionDate).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                        {adm.expectedDischargeDate ? new Date(adm.expectedDischargeDate).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-slate-600 text-xs max-w-[150px] truncate">{adm.reason}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Occupation des lits par service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dep) => {
            const pct = Math.round((dep.occupiedBeds / dep.beds) * 100);
            const color = pct >= 90 ? 'text-red-600 bg-red-100' : pct >= 70 ? 'text-amber-600 bg-amber-100' : 'text-emerald-600 bg-emerald-100';
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <div key={dep.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600 truncate pr-2">{dep.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mb-2">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-400">{dep.occupiedBeds} / {dep.beds} lits</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
