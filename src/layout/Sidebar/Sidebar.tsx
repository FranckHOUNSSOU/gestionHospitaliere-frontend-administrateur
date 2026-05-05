import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import type { ReactNode } from 'react';

const Item = ({ to, icon, label, count, countCls, minimized,fontSize }: {
  to: string; icon: ReactNode; label: string; fontSize?: number;
  count?: string; countCls?: string; minimized?: boolean;
}) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
    title={minimized ? label : undefined}
  >
    <span className="adm-nav-icon">{icon}</span>
    <span className="adm-nav-label" style={{ fontSize }}>
      {label}
    </span>
    {count && <span className={`adm-nav-badge ${countCls}`}>{count}</span>}
  </NavLink>
);

export const Sidebar = ({ minimized }: { minimized: boolean }) => {
  return (
    <div className={`adm-sidebar${minimized ? ' adm-sidebar--min' : ''}`}>

      <div className="adm-nav-sec">Tableau de bord</div>
      <Item to="/dashboard" minimized={minimized}  icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      } label="Vue d'ensemble" fontSize={13}/>

      <div className="adm-nav-sec">Personnels & Chambres</div>
        <div style={{fontSize:14}}>
          <Item to="/users" minimized={minimized} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          } label ="Comptes utilisateurs" count="" countCls="adm-nb-blue" fontSize={13}/>
        </div>
      <Item to="/GestionChambres" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      } label="Gestion des Chambres" fontSize={13}/>

      <div className="adm-nav-sec">Sécurité</div>
      <Item to="/logs" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      } label="Journaux d'activité" count="" countCls="adm-nb-red" fontSize={13} />
      <Item to="/security" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      } label="Sécurité plateforme" fontSize={13} />
      <Item to="/attempts" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      } label="Tentatives de connexion" fontSize={13}/>

      <div className="adm-nav-sec">Système</div>
      <Item to="/settings" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      } label="Paramètres généraux" fontSize={13} />
      <Item to="/backups" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      } label="Sauvegardes" count="" countCls="adm-nb-green" fontSize={13} />
      <Item to="/stats" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      } label="Rapports & statistiques" fontSize={13} />

      <div className="adm-nav-sec">Paramètres</div>
      <Item to="/notifications" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      } label="Notifications" fontSize={13} />
      <Item to="/profil" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      } label="Mon profil" fontSize={13} />
      <Item to="/confidentialite" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      } label="Confidentialité" fontSize={13} />

    </div>
  );
};
