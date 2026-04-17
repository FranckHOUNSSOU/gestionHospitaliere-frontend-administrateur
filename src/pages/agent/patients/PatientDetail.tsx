import { useState } from 'react';
import { ArrowLeft, CreditCard as Edit2, Phone, Mail, MapPin, Shield, Heart, AlertTriangle, CalendarDays, BedDouble, Receipt, UserCheck, Plus } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/agent/ui/Badge';
import { patients, appointments, admissions, invoices } from '../../../data/mockData';
import { useNavigation } from '../../../context/NavigationContext';

const tabs = ['Aperçu', 'Rendez-vous', 'Admissions', 'Factures'];

export default function PatientDetail() {
  const { navigate, nav } = useNavigation();
  const [activeTab, setActiveTab] = useState(0);

  const patient = patients.find((p) => p.id === nav.selectedId);
  if (!patient) return <p className="text-slate-500">Patient introuvable.</p>;

  const patientAppts = appointments.filter((a) => a.patientId === patient.id);
  const patientAdmissions = admissions.filter((a) => a.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const { variant, label } = statusBadge(patient.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('patients')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">Dossier patient</h2>
          <p className="text-sm text-slate-500">Informations complètes et historique</p>
        </div>
        <button
          onClick={() => navigate('patient-edit', patient.id)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Edit2 size={15} />
          Modifier
        </button>
        <button
          onClick={() => navigate('appointment-new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          Nouveau RDV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-slate-800">{patient.firstName} {patient.lastName}</h3>
              <Badge variant={variant}>{label}</Badge>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Groupe {patient.bloodType}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{age} ans · {patient.gender === 'M' ? 'Masculin' : 'Féminin'} · Enregistré le {new Date(patient.registrationDate).toLocaleDateString('fr-FR')}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" />{patient.phone}</span>
              {patient.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" />{patient.email}</span>}
              {patient.city && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" />{patient.city}</span>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              { label: 'RDV', value: patientAppts.length, icon: <CalendarDays size={16} />, color: 'text-cyan-600 bg-cyan-50' },
              { label: 'Séjours', value: patientAdmissions.length, icon: <BedDouble size={16} />, color: 'text-amber-600 bg-amber-50' },
              { label: 'Factures', value: patientInvoices.length, icon: <Receipt size={16} />, color: 'text-emerald-600 bg-emerald-50' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-xl p-3 text-center ${stat.color.split(' ')[1]}`}>
                <div className={`${stat.color.split(' ')[0]} flex justify-center mb-1`}>{stat.icon}</div>
                <p className={`text-xl font-bold ${stat.color.split(' ')[0]}`}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-100">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === i
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Informations personnelles</h4>
                <InfoRow label="Date de naissance" value={new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')} />
                <InfoRow label="Sexe" value={patient.gender === 'M' ? 'Masculin' : 'Féminin'} />
                <InfoRow label="Groupe sanguin" value={patient.bloodType} />
                <InfoRow label="Ville" value={patient.city} />
                <InfoRow label="Adresse" value={patient.address} />
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</h4>
                <InfoRow label="Téléphone" value={patient.phone} />
                <InfoRow label="Email" value={patient.email || '—'} />
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact d'urgence</h4>
                  <InfoRow label="Nom" value={patient.emergencyContact} />
                  <InfoRow label="Téléphone" value={patient.emergencyPhone} />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assurance</h4>
                <InfoRow label="Organisme" value={patient.insurance || 'Non assuré'} />
                {patient.insuranceNumber && <InfoRow label="N° police" value={patient.insuranceNumber} />}
                {patient.notes && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">{patient.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-3">
              {patientAppts.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Aucun rendez-vous</p>
              ) : (
                patientAppts.map((appt) => {
                  const { variant, label } = statusBadge(appt.status);
                  return (
                    <div key={appt.id} className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center">
                        <span className="text-xs text-blue-700 font-bold">{appt.time}</span>
                        <span className="text-xs text-slate-400">{new Date(appt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{appt.type} · {appt.department}</p>
                        <p className="text-xs text-slate-500">{appt.doctorName}</p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-3">
              {patientAdmissions.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Aucune admission</p>
              ) : (
                patientAdmissions.map((adm) => {
                  const { variant, label } = statusBadge(adm.status);
                  return (
                    <div key={adm.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{adm.reason}</p>
                          <p className="text-xs text-slate-500">{adm.department} · Salle {adm.room}, Lit {adm.bed}</p>
                        </div>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Entrée: {new Date(adm.admissionDate).toLocaleDateString('fr-FR')}</span>
                        {adm.actualDischargeDate && <span>Sortie: {new Date(adm.actualDischargeDate).toLocaleDateString('fr-FR')}</span>}
                        <span>Médecin: {adm.doctorName}</span>
                      </div>
                      {adm.diagnosis && <p className="mt-2 text-xs text-slate-600 font-medium">Diagnostic: {adm.diagnosis}</p>}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-3">
              {patientInvoices.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Aucune facture</p>
              ) : (
                patientInvoices.map((inv) => {
                  const { variant, label } = statusBadge(inv.status);
                  return (
                    <div
                      key={inv.id}
                      onClick={() => navigate('billing-detail', inv.id)}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{inv.invoiceNumber}</p>
                        <p className="text-xs text-slate-500">Émise le {new Date(inv.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{inv.total.toLocaleString('fr-FR')} GNF</p>
                        <p className="text-xs text-slate-500">Payé: {inv.paid.toLocaleString('fr-FR')} GNF</p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value}</span>
    </div>
  );
}
