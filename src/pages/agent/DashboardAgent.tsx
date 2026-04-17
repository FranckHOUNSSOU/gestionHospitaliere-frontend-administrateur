import {
  Users,
  CalendarDays,
  BedDouble,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import StatCard from '../../components/agent/ui/StatCard';
import Badge, { statusBadge } from '../../components/agent/ui/Badge';
import { patients, appointments, admissions, invoices } from '../../data/mockData';
import { useNavigation } from '../../context/NavigationContext';

export default function Dashboard() {
  const { navigate } = useNavigation();

  const today = '2026-04-17';
  const todayAppts = appointments.filter((a) => a.date === today);
  const activeAdmissions = admissions.filter((a) => a.status === 'active');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');
  const totalRevenue = invoices.reduce((s, i) => s + i.paid, 0);

  const upcomingAppts = appointments
    .filter((a) => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const recentPatients = [...patients]
    .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
    .slice(0, 5);

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Patients enregistrés"
          value={patients.length}
          subtitle="Total dans le système"
          icon={<Users size={22} />}
          color="blue"
          trend={{ value: '2 ce mois', up: true }}
        />
        <StatCard
          title="RDV aujourd'hui"
          value={todayAppts.length}
          subtitle={`${todayAppts.filter((a) => a.status === 'confirmed').length} confirmés`}
          icon={<CalendarDays size={22} />}
          color="cyan"
        />
        <StatCard
          title="Admissions actives"
          value={activeAdmissions.length}
          subtitle="Patients hospitalisés"
          icon={<BedDouble size={22} />}
          color="amber"
        />
        <StatCard
          title="Recettes (GNF)"
          value={`${(totalRevenue / 1000).toFixed(0)}K`}
          subtitle={`${pendingInvoices.length} factures en attente`}
          icon={<Receipt size={22} />}
          color="emerald"
          trend={{ value: '12% vs mois dernier', up: true }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Rendez-vous du jour</h2>
              <p className="text-xs text-slate-400">{todayAppts.length} rendez-vous planifiés</p>
            </div>
            <button
              onClick={() => navigate('appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {todayAppts.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Aucun rendez-vous aujourd'hui</p>
            ) : (
              todayAppts.map((appt) => {
                const { variant, label } = statusBadge(appt.status);
                return (
                  <div key={appt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-700">{appt.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{appt.patientName}</p>
                      <p className="text-xs text-slate-500 truncate">{appt.doctorName} · {appt.department}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={variant}>{label}</Badge>
                      <p className="text-xs text-slate-400 mt-1">{appt.type}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={() => navigate('appointment-new')}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <UserPlus size={16} />
              Ajouter un rendez-vous
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Occupation des services</h2>
            <div className="space-y-3">
              {[
                { name: 'Médecine interne', occ: 28, total: 35 },
                { name: 'Pédiatrie', occ: 22, total: 30 },
                { name: 'Chirurgie', occ: 18, total: 25 },
                { name: 'Cardiologie', occ: 14, total: 20 },
                { name: 'Gynécologie', occ: 11, total: 20 },
              ].map((dep) => {
                const pct = Math.round((dep.occ / dep.total) * 100);
                const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={dep.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">{dep.name}</span>
                      <span className="text-slate-500">{dep.occ}/{dep.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-3">Alertes</h2>
            <div className="space-y-2.5">
              {overdueInvoices.map((inv) => (
                <div key={inv.id} className="flex items-start gap-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">{inv.invoiceNumber}</p>
                    <p className="text-xs text-red-600">{inv.patientName} · {(inv.total / 1000).toFixed(0)}K GNF</p>
                  </div>
                </div>
              ))}
              {activeAdmissions.map((adm) => (
                <div key={adm.id} className="flex items-start gap-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <BedDouble size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700">{adm.patientName}</p>
                    <p className="text-xs text-blue-600">{adm.department} · {adm.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Patients récents</h2>
            <button
              onClick={() => navigate('patient-new')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={14} />
              Nouveau
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPatients.map((p) => {
              const { variant, label } = statusBadge(p.status);
              return (
                <div
                  key={p.id}
                  onClick={() => navigate('patient-detail', p.id)}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-500">{p.phone}</p>
                  </div>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Prochains rendez-vous</h2>
            <button
              onClick={() => navigate('appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Tous <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingAppts.map((appt) => {
              const { variant, label } = statusBadge(appt.status);
              return (
                <div key={appt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center w-10 shrink-0">
                    <span className="text-xs text-slate-400">{new Date(appt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                    <span className="text-sm font-bold text-blue-600">{appt.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{appt.patientName}</p>
                    <p className="text-xs text-slate-500 truncate">{appt.doctorName}</p>
                  </div>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <p className="font-semibold">Enregistrer</p>
              <p className="text-xs text-blue-100">un patient</p>
            </div>
          </div>
          <button
            onClick={() => navigate('patient-new')}
            className="w-full py-2 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Nouveau patient
          </button>
        </div>
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="font-semibold">Planifier</p>
              <p className="text-xs text-cyan-100">un rendez-vous</p>
            </div>
          </div>
          <button
            onClick={() => navigate('appointment-new')}
            className="w-full py-2 bg-white text-cyan-700 text-sm font-semibold rounded-lg hover:bg-cyan-50 transition-colors"
          >
            Nouveau RDV
          </button>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <p className="font-semibold">Créer</p>
              <p className="text-xs text-emerald-100">une facture</p>
            </div>
          </div>
          <button
            onClick={() => navigate('billing-new')}
            className="w-full py-2 bg-white text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Nouvelle facture
          </button>
        </div>
      </div>
    </div>
  );
}
