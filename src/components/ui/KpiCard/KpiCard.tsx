type KpiColor = 'teal' | 'blue' | 'amber' | 'red';

interface Props {
  label: string;
  value: string | number;
  note: string;
  noteType: 'up' | 'down' | 'neutral';
  color: KpiColor;
}

export const KpiCard = ({ label, value, note, noteType, color }: Props) => (
  <div className={`kpi kpi-${color}`}>
    <div className="kpi-label">{label}</div>
    <div className="kpi-val">{value}</div>
    <div className={`kpi-note ${noteType}`}>{note}</div>
  </div>
);