interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'blue';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variants = {
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  error: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  blue: 'bg-blue-100 text-blue-700 border border-blue-200',
};

export default function Badge({ variant, children, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
      } ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Actif' },
    hospitalized: { variant: 'blue', label: 'Hospitalisé' },
    discharged: { variant: 'neutral', label: 'Sorti' },
    scheduled: { variant: 'info', label: 'Planifié' },
    confirmed: { variant: 'blue', label: 'Confirmé' },
    completed: { variant: 'success', label: 'Terminé' },
    cancelled: { variant: 'error', label: 'Annulé' },
    no_show: { variant: 'warning', label: 'Absent' },
    transferred: { variant: 'warning', label: 'Transféré' },
    draft: { variant: 'neutral', label: 'Brouillon' },
    pending: { variant: 'warning', label: 'En attente' },
    paid: { variant: 'success', label: 'Payée' },
    overdue: { variant: 'error', label: 'En retard' },
    partial: { variant: 'info', label: 'Partielle' },
  };
  return map[status] ?? { variant: 'neutral' as const, label: status };
}
