import { useState } from 'react';
import { ArrowLeft, Save, BedDouble, User, Stethoscope } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patients, departments } from '../../../data/mockData';
import { useDoctors } from '../../../context/DoctorContext';

export default function AdmissionForm() {
  const { navigate } = useNavigation();
  const { doctors } = useDoctors();
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    room: '',
    bed: '',
    admissionDate: new Date().toISOString().split('T')[0],
    expectedDischargeDate: '',
    reason: '',
    notes: '',
  });
  const [saved, setSaved] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'department') {
        updated.doctorId = '';
      }
      return updated;
    });
  }

  const filteredDoctors = form.department
    ? doctors.filter((d) => d.department === form.department)
    : doctors;

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('admissions'), 1000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('admissions')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Nouvelle admission</h2>
          <p className="text-sm text-slate-500">Enregistrer l'hospitalisation d'un patient</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <Save size={16} />
          Admission enregistrée avec succès !
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <User size={15} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Sélection du patient</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient *</label>
              <select
                value={form.patientId}
                onChange={(e) => handleChange('patientId', e.target.value)}
                className="adm-input"
              >
                <option value="">Sélectionner un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.phone}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <BedDouble size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Hébergement</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service *</label>
                <select
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="adm-input"
                >
                  <option value="">Sélectionner un service</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.beds - d.occupiedBeds} lits disponibles)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Numéro de chambre *</label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  className="adm-input"
                  placeholder="Ex: C-204"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Numéro de lit *</label>
                <input
                  type="text"
                  value={form.bed}
                  onChange={(e) => handleChange('bed', e.target.value)}
                  className="adm-input"
                  placeholder="Ex: B1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Stethoscope size={15} className="text-cyan-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Informations médicales</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Médecin responsable *</label>
                <select
                  value={form.doctorId}
                  onChange={(e) => handleChange('doctorId', e.target.value)}
                  className="adm-input"
                >
                  <option value="">Sélectionner un médecin</option>
                  {filteredDoctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Motif d'admission *</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  className="adm-input"
                  placeholder="Motif d'hospitalisation"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date d'admission *</label>
                <input
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) => handleChange('admissionDate', e.target.value)}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sortie prévue</label>
                <input
                  type="date"
                  value={form.expectedDischargeDate}
                  onChange={(e) => handleChange('expectedDischargeDate', e.target.value)}
                  className="adm-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="adm-input"
                  placeholder="Informations supplémentaires..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Récapitulatif</h3>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Patient" value={form.patientId ? patients.find((p) => p.id === form.patientId)?.firstName + ' ' + patients.find((p) => p.id === form.patientId)?.lastName : '—'} />
              <SummaryRow label="Service" value={form.department || '—'} />
              <SummaryRow label="Chambre" value={form.room || '—'} />
              <SummaryRow label="Lit" value={form.bed || '—'} />
              <SummaryRow label="Médecin" value={form.doctorId ? doctors.find((d) => d.id === form.doctorId)?.name ?? '—' : '—'} />
              <SummaryRow label="Date entrée" value={form.admissionDate ? new Date(form.admissionDate).toLocaleDateString('fr-FR') : '—'} />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              Enregistrer l'admission
            </button>
            <button
              onClick={() => navigate('admissions')}
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700 text-right">{value}</span>
    </div>
  );
}
