import { ArrowLeft, Printer, CheckCircle2, Receipt } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/agent/ui/Badge';
import { invoices, patients } from '../../../data/mockData';
import { useNavigation } from '../../../context/NavigationContext';

export default function InvoiceDetail() {
  const { navigate, nav } = useNavigation();
  const invoice = invoices.find((i) => i.id === nav.selectedId);
  if (!invoice) return <p className="text-slate-500">Facture introuvable.</p>;

  const patient = patients.find((p) => p.id === invoice.patientId);
  const { variant, label } = statusBadge(invoice.status);
  const balance = invoice.total - invoice.paid;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('billing')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">{invoice.invoiceNumber}</h2>
          <p className="text-sm text-slate-500">Détail de la facture</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-100 transition-colors">
          <Printer size={15} />
          Imprimer
        </button>
        {invoice.status !== 'paid' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
            <CheckCircle2 size={15} />
            Marquer payée
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Receipt size={20} />
                <span className="font-bold text-lg">HôpitalGH</span>
              </div>
              <p className="text-blue-100 text-sm">Système de gestion hospitalière</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-xl">{invoice.invoiceNumber}</p>
              <p className="text-blue-100 text-sm">Émise le {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
              <div className="mt-2">
                <Badge variant={variant}>{label}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Facturé à</p>
              <p className="font-semibold text-slate-800">{invoice.patientName}</p>
              {patient && (
                <>
                  <p className="text-sm text-slate-500">{patient.phone}</p>
                  <p className="text-sm text-slate-500">{patient.city}</p>
                  {patient.insurance && <p className="text-sm text-slate-500">Assurance: {patient.insurance}</p>}
                  {patient.insuranceNumber && <p className="text-sm text-slate-500">{patient.insuranceNumber}</p>}
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Détails</p>
              <p className="text-sm text-slate-600">Date: <span className="font-medium text-slate-800">{new Date(invoice.date).toLocaleDateString('fr-FR')}</span></p>
              <p className="text-sm text-slate-600">Échéance: <span className={`font-medium ${invoice.status === 'overdue' ? 'text-red-600' : 'text-slate-800'}`}>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span></p>
              {invoice.paymentMethod && <p className="text-sm text-slate-600">Paiement: <span className="font-medium text-slate-800">{invoice.paymentMethod}</span></p>}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Qté</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Prix unit.</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{item.description}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.unitPrice.toLocaleString('fr-FR')} GNF</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{item.total.toLocaleString('fr-FR')} GNF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sous-total</span>
                <span className="font-medium text-slate-700">{invoice.subtotal.toLocaleString('fr-FR')} GNF</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Remise</span>
                  <span>-{invoice.discount.toLocaleString('fr-FR')} GNF</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-bold text-xl text-slate-800">{invoice.total.toLocaleString('fr-FR')} GNF</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Montant payé</span>
                <span className="font-semibold">{invoice.paid.toLocaleString('fr-FR')} GNF</span>
              </div>
              <div className={`flex justify-between pt-2 border-t border-slate-200 text-sm ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                <span className="font-bold">Solde restant</span>
                <span className="font-bold text-base">{balance.toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
