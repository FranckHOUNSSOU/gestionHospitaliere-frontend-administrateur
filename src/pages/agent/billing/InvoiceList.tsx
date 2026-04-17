import { useState } from 'react';
import { Plus, Search, Eye, Download, TrendingUp } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/agent/ui/Badge';
import { invoices } from '../../../data/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import type { InvoiceStatus } from '../../../types/index';

export default function InvoiceList() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      inv.patientName.toLowerCase().includes(q) ||
      inv.invoiceNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending' || i.status === 'partial').reduce((s, i) => s + (i.total - i.paid), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total facturé', value: totalRevenue, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Encaissé', value: totalPaid, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'En attente', value: totalPending, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'En retard', value: totalOverdue, color: 'text-red-700 bg-red-50 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color.split(' ').slice(1).join(' ')}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${s.color.split(' ')[0]} opacity-70`}>{s.label}</p>
            <p className={`text-xl font-bold ${s.color.split(' ')[0]}`}>{(s.value / 1000).toFixed(0)}K GNF</p>
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
                placeholder="N° facture, patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="pending">En attente</option>
              <option value="partial">Partielle</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Download size={14} />
              Exporter
            </button>
            <button
              onClick={() => navigate('billing-new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Nouvelle facture
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">N° Facture</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Patient</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Échéance</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Montant</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Payé</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Solde</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Statut</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">Aucune facture trouvée</td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const { variant, label } = statusBadge(inv.status);
                  const balance = inv.total - inv.paid;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => navigate('billing-detail', inv.id)}
                          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate('patient-detail', inv.patientId)}
                          className="font-medium text-slate-700 hover:text-blue-600"
                        >
                          {inv.patientName}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-500 text-xs">
                        {new Date(inv.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-xs">
                        <span className={inv.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                          {new Date(inv.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                        {inv.total.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-right text-emerald-600 font-medium">
                        {inv.paid.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-right font-medium">
                        <span className={balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {balance.toLocaleString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate('billing-detail', inv.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <span>{filtered.length} facture{filtered.length > 1 ? 's' : ''}</span>
          <span>Total affiché: {filtered.reduce((s, i) => s + i.total, 0).toLocaleString('fr-FR')} GNF</span>
        </div>
      </div>
    </div>
  );
}
