import { BarChart3, TrendingUp, Users, CalendarDays, BedDouble, Receipt, Download } from 'lucide-react';
import { patients, appointments, admissions, invoices, departments } from '../../../data/mockData';

const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const monthlyPatients = [12, 18, 15, 22, 8, 14, 19, 25, 17, 21, 16, 24];
const monthlyRevenue = [1200, 1850, 1400, 2100, 800, 1600, 1900, 2400, 1700, 2000, 1500, 2300];
const monthlyAppointments = [45, 62, 55, 78, 38, 52, 65, 88, 60, 75, 58, 82];

const maxPatients = Math.max(...monthlyPatients);
const maxRevenue = Math.max(...monthlyRevenue);
const maxAppts = Math.max(...monthlyAppointments);

function BarGroup({ values, max, color }: { values: number[]; max: number; color: string }) {
  return (
    <div className="flex items-end gap-1.5 h-32">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
          <div
            className={`w-full rounded-t-sm ${color} transition-all`}
            style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: '4px' }}
            title={`${monthLabels[i]}: ${v}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

  const apptByDept = departments.map((d) => ({
    name: d.name,
    count: appointments.filter((a) => a.department === d.name).length,
  })).sort((a, b) => b.count - a.count);

  const maxDeptCount = Math.max(...apptByDept.map((d) => d.count), 1);

  const statusCounts = {
    active: patients.filter((p) => p.status === 'active').length,
    hospitalized: patients.filter((p) => p.status === 'hospitalized').length,
    discharged: patients.filter((p) => p.status === 'discharged').length,
  };

  const apptStatusCounts = {
    completed: appointments.filter((a) => a.status === 'completed').length,
    scheduled: appointments.filter((a) => a.status === 'scheduled').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Vue globale — Avril 2026</h2>
          <p className="text-sm text-slate-500">Statistiques de l'activité hospitalière</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-100 transition-colors">
          <Download size={15} />
          Exporter le rapport
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total patients', value: patients.length, sub: `+2 ce mois`, icon: <Users size={18} />, color: 'blue' },
          { label: 'RDV ce mois', value: appointments.length, sub: `${apptStatusCounts.completed} terminés`, icon: <CalendarDays size={18} />, color: 'cyan' },
          { label: 'Taux d\'occupation', value: `${Math.round((departments.reduce((s, d) => s + d.occupiedBeds, 0) / departments.reduce((s, d) => s + d.beds, 0)) * 100)}%`, sub: `${departments.reduce((s, d) => s + d.occupiedBeds, 0)} lits occupés`, icon: <BedDouble size={18} />, color: 'amber' },
          { label: 'Taux de recouvrement', value: `${collectionRate}%`, sub: `${(totalPaid / 1000).toFixed(0)}K GNF encaissés`, icon: <Receipt size={18} />, color: 'emerald' },
        ].map((stat) => {
          const colors: Record<string, string> = {
            blue: 'border-blue-200 bg-blue-50 text-blue-700',
            cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
            amber: 'border-amber-200 bg-amber-50 text-amber-700',
            emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
          };
          return (
            <div key={stat.label} className={`rounded-xl border p-4 ${colors[stat.color]}`}>
              <div className="flex items-center gap-2 mb-2 opacity-70">
                {stat.icon}
                <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-70 mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Nouveaux patients / mois</h3>
          <p className="text-xs text-slate-400 mb-4">Année 2026</p>
          <BarGroup values={monthlyPatients} max={maxPatients} color="bg-blue-500" />
          <div className="flex justify-between mt-2">
            {monthLabels.map((m) => (
              <span key={m} className="flex-1 text-center text-[10px] text-slate-400">{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Rendez-vous / mois</h3>
          <p className="text-xs text-slate-400 mb-4">Année 2026</p>
          <BarGroup values={monthlyAppointments} max={maxAppts} color="bg-cyan-500" />
          <div className="flex justify-between mt-2">
            {monthLabels.map((m) => (
              <span key={m} className="flex-1 text-center text-[10px] text-slate-400">{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Recettes (K GNF) / mois</h3>
          <p className="text-xs text-slate-400 mb-4">Année 2026</p>
          <BarGroup values={monthlyRevenue} max={maxRevenue} color="bg-emerald-500" />
          <div className="flex justify-between mt-2">
            {monthLabels.map((m) => (
              <span key={m} className="flex-1 text-center text-[10px] text-slate-400">{m}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">RDV par service</h3>
          <div className="space-y-3">
            {apptByDept.filter((d) => d.count > 0).map((dep) => (
              <div key={dep.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{dep.name}</span>
                  <span className="text-slate-500 font-semibold">{dep.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.round((dep.count / maxDeptCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Répartition des patients</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Par statut</p>
              {[
                { label: 'Actifs', value: statusCounts.active, color: 'bg-emerald-500', total: patients.length },
                { label: 'Hospitalisés', value: statusCounts.hospitalized, color: 'bg-blue-500', total: patients.length },
                { label: 'Sortis', value: statusCounts.discharged, color: 'bg-slate-400', total: patients.length },
              ].map((s) => (
                <div key={s.label} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{s.label}</span>
                    <span className="text-slate-500">{s.value} ({Math.round((s.value / s.total) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.round((s.value / s.total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rendez-vous par statut</p>
              {[
                { label: 'Terminés', value: apptStatusCounts.completed, color: 'bg-emerald-500' },
                { label: 'Confirmés', value: apptStatusCounts.confirmed, color: 'bg-blue-500' },
                { label: 'Planifiés', value: apptStatusCounts.scheduled, color: 'bg-cyan-500' },
                { label: 'Annulés', value: apptStatusCounts.cancelled, color: 'bg-red-400' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 mb-1.5">
                  <div className={`w-3 h-3 rounded-full ${s.color} shrink-0`} />
                  <span className="text-xs text-slate-600 flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Situation financière</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total facturé', value: totalRevenue, color: 'text-slate-700' },
            { label: 'Encaissé', value: totalPaid, color: 'text-emerald-600' },
            { label: 'En attente', value: invoices.filter((i) => i.status === 'pending' || i.status === 'partial').reduce((s, i) => s + (i.total - i.paid), 0), color: 'text-amber-600' },
            { label: 'En retard', value: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0), color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
              <p className={`text-xl font-bold ${s.color}`}>{(s.value / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label} (GNF)</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Taux de recouvrement</span>
            <span className="font-semibold text-slate-700">{collectionRate}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
