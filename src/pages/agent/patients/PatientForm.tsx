import { useState } from 'react';
import { ArrowLeft, Save, User, Phone, MapPin, Shield, AlertTriangle } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patients } from '../../../data/mockData';

export default function PatientForm() {
  const { navigate, nav } = useNavigation();
  const isEdit = nav.page === 'patient-edit';
  const existing = isEdit && nav.selectedId ? patients.find((p) => p.id === nav.selectedId) : null;

  const [form, setForm] = useState({
    firstName: existing?.firstName ?? '',
    lastName: existing?.lastName ?? '',
    dateOfBirth: existing?.dateOfBirth ?? '',
    gender: existing?.gender ?? 'M',
    phone: existing?.phone ?? '',
    email: existing?.email ?? '',
    address: existing?.address ?? '',
    city: existing?.city ?? '',
    bloodType: existing?.bloodType ?? 'A+',
    insurance: existing?.insurance ?? '',
    insuranceNumber: existing?.insuranceNumber ?? '',
    emergencyContact: existing?.emergencyContact ?? '',
    emergencyPhone: existing?.emergencyPhone ?? '',
    notes: existing?.notes ?? '',
  });

  const [saved, setSaved] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      navigate('patients');
    }, 1000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('patients')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Modifier le dossier patient' : 'Enregistrer un nouveau patient'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEdit ? `Modification de ${existing?.firstName} ${existing?.lastName}` : 'Remplissez toutes les informations requises'}
          </p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <Save size={16} />
          Patient {isEdit ? 'mis à jour' : 'enregistré'} avec succès ! Redirection...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <User size={15} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Informations personnelles</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prénom *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="adm-input"
                  placeholder="Prénom du patient"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="adm-input"
                  placeholder="Nom de famille"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date de naissance *</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sexe *</label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="adm-input"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Phone size={15} className="text-cyan-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Coordonnées</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Téléphone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="adm-input"
                  placeholder="+229 01 XX XX XX XX"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="adm-input"
                  placeholder="emailexemple@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="adm-input"
                  placeholder="Adresse complète"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ville</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="adm-input"
                  placeholder="Cotonou, Calavi, ..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle size={15} className="text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Contact d'urgence</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom complet</label>
                <input
                  type="text"
                  value={form.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  className="adm-input"
                  placeholder="Nom du contact d'urgence"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  className="adm-input"
                  placeholder="+229 01 XX XX XX XX"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Shield size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Assurance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organisme</label>
                <select
                  value={form.insurance}
                  onChange={(e) => handleChange('insurance', e.target.value)}
                  className="adm-input"
                >
                  <option value="">Non assuré</option>
                  <option value="CNSS">Assuré</option>
                  
                </select>
              </div> <br></br>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom de l'assurance</label>
                <input
                  type="text"
                  value={form.insuranceNumber}
                  onChange={(e) => handleChange('insuranceNumber', e.target.value)}
                  className="adm-input"
                  placeholder="Nom de l'assurance"
                />
              </div><br></br>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">N° police</label>
                <input
                  type="text"
                  value={form.insuranceNumber}
                  onChange={(e) => handleChange('insuranceNumber', e.target.value)}
                  className="adm-input"
                  placeholder="Numéro d'assurance"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Notes médicales</h3>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={5}
              className="adm-input"
              placeholder="Allergies, antécédents, informations importantes..."
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              {isEdit ? 'Mettre à jour' : 'Enregistrer le patient'}
            </button>
            <button
              onClick={() => navigate('patients')}
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
