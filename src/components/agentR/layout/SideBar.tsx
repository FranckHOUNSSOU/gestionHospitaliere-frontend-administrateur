import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const Item = ({ to, icon, label, count, countCls, minimized,fontSize }: {
  to: string; icon: ReactNode; label: string; fontSize?: number;
  count?: string; countCls?: string; minimized?: boolean;
}) => (
  <NavLink
    to={to}
    end={to === '/admin'}
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

export const SideBar = ({ minimized }: { minimized: boolean }) => {
  return (
    <div className={`adm-sidebar${minimized ? ' adm-sidebar--min' : ''}`}>

      <div className="adm-nav-sec">Principal</div>
        <div style={{fontSize:14}}>
          <Item to="/agentR/AccueilPatient" minimized={minimized} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 10L12 3l9 7"/>
                <path d="M5 10v10h14V10"/>
            </svg>
            } label ="Accueil Patient" count="" countCls="adm-nb-blue" fontSize={13}/>
        </div>  
            <Item to="/agentR/RechercheDossier" minimized={minimized} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
            </svg>
            }label="Recherche Dossier" fontSize={13}/>
            <Item to="/agentR/file" minimized={minimized} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
            </svg>
            }label="File d'attente" fontSize={13}/>

      <div className="adm-nav-sec">Journée</div>
            <Item to="/agentR/Registre" minimized={minimized} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="4" y="3" width="16" height="18" rx="2"/>
                <path d="M8 7h8"/>
                <path d="M8 11h8"/>
                <path d="M8 15h5"/>
            </svg>
            } label="Régistre du Jour" count="" countCls="adm-nb-red" fontSize={13} />
             <Item to="/agentR/Statistiques" minimized={minimized} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 20V10"/>
                <path d="M10 20V4"/>
                <path d="M16 20v-6"/>
                <path d="M22 20V14"/>
            </svg>
            } label="Statistiques" fontSize={13} />

      

      
    </div>
  );
};
