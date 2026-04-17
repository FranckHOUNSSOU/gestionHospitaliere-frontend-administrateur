import { useState } from 'react';
import { ArrowLeft, Save, CalendarDays, Clock } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patients, doctors, departments } from '../../../data/mockData';

const timeSlots = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const appointmentTypes = ['Consultation', 'Suivi', 'Contrôle', 'Examen', 'Pré-opératoire', 'Urgence', 'Vaccination', 'Autre'];

export default function AppointmentForm() {
  const { navigate } = useNavigation();
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    date: '',
    time: '',
    duration: '30',
    type: 'Consultation',
    notes: '',
  });
  const [saved, setSaved] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'department') updated.doctorId = '';
      return updated;
    });
  }

  const filteredDoctors = form.department ? doctors.filter((d) => d.department === form.department) : doctors;
  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('appointments'), 1000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('appointments')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Nouveau rendez-vous</h2>
          <p className="text-sm text-slate-500">Planifier un rendez-vous médical</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <Save size={16} />
          Rendez-vous enregistré avec succès !
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Patient & Médecin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient *</label>
                <select
                  value={form.patientId}
                  onChange={(e) => handleChange('patientId', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service *</label>
                <select
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Sélectionner un service</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Médecin *</label>
                <select
                  value={form.doctorId}
                  onChange={(e) => handleChange('doctorId', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Sélectionner un médecin</option>
                  {filteredDoctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={16} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-700">Date et heure</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Durée (minutes)</label>
                <select
                  value={form.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 heure</option>
                  <option value="90">1h30</option>
                  <option value="120">2 heures</option>
                </select>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-600 mb-2">Créneau horaire *</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange('time', t)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    form.time === t
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Détails du rendez-vous</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type de consultation</label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  {appointmentTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes / Motif</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                  placeholder="Motif de consultation, symptômes..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {selectedPatient && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <p className="text-xs font-semibold text-blue-600 mb-2">Patient sélectionné</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p className="text-xs text-blue-600">{selectedPatient.phone}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-600 mb-3">Récapitulatif RDV</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Médecin</span><span className="font-medium text-right text-slate-700 text-xs">{selectedDoctor?.name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium text-slate-700 text-xs">{form.date ? new Date(form.date).toLocaleDateString('fr-FR') : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Heure</span><span className="font-medium text-slate-700">{form.time || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Durée</span><span className="font-medium text-slate-700">{form.duration} min</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium text-slate-700">{form.type}</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              Confirmer le rendez-vous
            </button>
            <button
              onClick={() => navigate('appointments')}
              className="w-full py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
