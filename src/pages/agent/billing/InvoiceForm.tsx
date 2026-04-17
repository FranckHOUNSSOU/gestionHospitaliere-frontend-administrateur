import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Receipt } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patients, admissions } from '../../../data/mockData';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const serviceCategories = [
  { label: 'Consultation médecin', price: 50000 },
  { label: 'Consultation spécialiste', price: 75000 },
  { label: 'Chambre standard (par jour)', price: 20000 },
  { label: 'Chambre privée (par jour)', price: 35000 },
  { label: 'Salle d\'opération', price: 200000 },
  { label: 'Frais d\'admission', price: 50000 },
  { label: 'Examens biologiques', price: 45000 },
  { label: 'Radiologie (radio)', price: 40000 },
  { label: 'Radiologie (scanner)', price: 80000 },
  { label: 'Radiologie (IRM)', price: 150000 },
  { label: 'Médicaments', price: 25000 },
  { label: 'Soins infirmiers', price: 15000 },
  { label: 'Kinésithérapie (séance)', price: 20000 },
  { label: 'Autre', price: 0 },
];

export default function InvoiceForm() {
  const { navigate } = useNavigation();
  const [form, setForm] = useState({
    patientId: '',
    admissionId: '',
    dueDate: '',
    paymentMethod: '',
    notes: '',
    discount: 0,
  });
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [saved, setSaved] = useState(false);

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const patientAdmissions = admissions.filter((a) => a.patientId === form.patientId && a.status === 'active');

  function addItem() {
    setItems((prev) => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function applyPreset(id: string, preset: { label: string; price: number }) {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, description: preset.label, unitPrice: preset.price } : item
    ));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal - form.discount;

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('billing'), 1000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('billing')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Nouvelle facture</h2>
          <p className="text-sm text-slate-500">Créer une facture pour un patient</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <Receipt size={16} />
          Facture créée avec succès !
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Informations de facturation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient *</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value, admissionId: '' }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              {form.patientId && patientAdmissions.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lier à une admission</label>
                  <select
                    value={form.admissionId}
                    onChange={(e) => setForm((f) => ({ ...f, admissionId: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  >
                    <option value="">Aucune admission</option>
                    {patientAdmissions.map((a) => (
                      <option key={a.id} value={a.id}>{a.department} — {a.room} (entrée: {new Date(a.admissionDate).toLocaleDateString('fr-FR')})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date d'échéance</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mode de paiement</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Sélectionner</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="insurance">Assurance</option>
                  <option value="transfer">Virement</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Lignes de facturation</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus size={13} />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <label className="block text-xs text-slate-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        list={`presets-${item.id}`}
                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                        placeholder="Prestation..."
                      />
                      <datalist id={`presets-${item.id}`}>
                        {serviceCategories.map((p) => (
                          <option key={p.label} value={p.label} />
                        ))}
                      </datalist>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Qté</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-slate-400 mb-1">Prix unitaire</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col justify-end">
                      <label className="block text-xs text-slate-400 mb-1">Total</label>
                      <div className="px-2.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg text-right">
                        {(item.quantity * item.unitPrice).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="mt-5 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sous-total</span>
                  <span className="font-medium text-slate-700">{subtotal.toLocaleString('fr-FR')} GNF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Remise</span>
                  <input
                    type="number"
                    min="0"
                    value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: parseInt(e.target.value) || 0 }))}
                    className="w-28 px-2 py-1 text-sm border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">TOTAL</span>
                  <span className="font-bold text-xl text-blue-600">{total.toLocaleString('fr-FR')} GNF</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Notes</h3>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
              placeholder="Informations complémentaires, modalités de paiement..."
            />
          </div>
        </div>

        <div className="space-y-5">
          {selectedPatient && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 mb-2">Patient</p>
              <p className="text-sm font-bold text-blue-800">{selectedPatient.firstName} {selectedPatient.lastName}</p>
              <p className="text-xs text-blue-600">{selectedPatient.insurance || 'Non assuré'}</p>
              <p className="text-xs text-blue-600">{selectedPatient.phone}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Résumé</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Lignes</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sous-total</span>
                <span className="font-medium">{subtotal.toLocaleString('fr-FR')} GNF</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Remise</span>
                  <span>-{form.discount.toLocaleString('fr-FR')} GNF</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-bold text-blue-600 text-base">{total.toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              Créer la facture
            </button>
            <button
              onClick={() => navigate('billing')}
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
