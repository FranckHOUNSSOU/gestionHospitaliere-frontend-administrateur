import React from 'react';

export const AVATAR_COLORS = ['#388bfd', '#3fb950', '#7c3aed', '#d29922', '#f85149'];

export const initials = (n: string, p: string) =>
  `${n[0] ?? '?'}${p[0] ?? ''}`.toUpperCase();

export const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label, required, children,
}) => (
  <div className="adm-form-field">
    <label className="adm-label">
      {label}{required && <span style={{ color: 'var(--c-red)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

export const SectionHeader: React.FC<{
  num: string; color: string; title: string; right?: React.ReactNode;
}> = ({ num, color, title, right }) => (
  <div className="adm-form-section-head">
    <span style={{
      width: 24, height: 24, borderRadius: 6, background: color, color: '#fff',
      fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>{num}</span>
    <p className="adm-card-title">{title}</p>
    {right && <span style={{ marginLeft: 'auto' }}>{right}</span>}
  </div>
);
