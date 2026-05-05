const MAP: Record<string, string> = {
  active: 'green', online: 'green', active_svc: 'green',
  inactive: 'gray', blocked: 'red',
  admin: 'red', doctor: 'blue', agent: 'amber',
};

export const Tag = ({ value, label }: { value: string; label: string }) => (
  <span className={`tag t-${MAP[value] ?? 'gray'}`}>{label}</span>
);