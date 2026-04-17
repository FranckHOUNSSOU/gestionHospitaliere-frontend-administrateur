import { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/agent/ui/Badge';
import { appointments } from '../../../data/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import type { AppointmentStatus } from '../../../types/index';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function AppointmentList() {
  const { navigate } = useNavigation();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
  );

  function getCalendarDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (number | null)[] = Array(startOffset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function getApptForDay(day: number) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return appointments.filter((a) => a.date === dateStr);
  }

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <List size={15} />
            Liste
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <CalendarDays size={15} />
            Calendrier
          </button>
        </div>
        <button
          onClick={() => navigate('appointment-new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nouveau rendez-vous
        </button>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher patient, médecin, service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Planifié</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date / Heure</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Médecin</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Service</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">Aucun rendez-vous trouvé</td>
                  </tr>
                ) : (
                  sorted.map((appt) => {
                    const { variant, label } = statusBadge(appt.status);
                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{appt.time}</p>
                          <p className="text-xs text-slate-400">{new Date(appt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => navigate('patient-detail', appt.patientId)}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {appt.patientName}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 text-xs">{appt.doctorName}</td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-slate-600 text-xs">{appt.department}</td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{appt.type}</span>
                        </td>
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
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[80px]" />;
              const dayAppts = getApptForDay(day);
              const isToday =
                day === 17 &&
                currentDate.getMonth() === 3 &&
                currentDate.getFullYear() === 2026;
              return (
                <div
                  key={i}
                  className={`min-h-[80px] rounded-lg p-1.5 border transition-colors ${
                    isToday
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>{day}</p>
                  {dayAppts.slice(0, 2).map((a) => {
                    const statusColor =
                      a.status === 'confirmed' ? 'bg-blue-500' :
                      a.status === 'completed' ? 'bg-emerald-500' :
                      a.status === 'cancelled' ? 'bg-red-400' :
                      'bg-slate-400';
                    return (
                      <div key={a.id} className={`${statusColor} text-white text-[9px] font-medium rounded px-1 py-0.5 mb-0.5 truncate`}>
                        {a.time} {a.patientName.split(' ')[0]}
                      </div>
                    );
                  })}
                  {dayAppts.length > 2 && (
                    <p className="text-[9px] text-slate-400">+{dayAppts.length - 2} autres</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
