import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { ClipboardList, FolderOpen } from 'lucide-react';

export default function DashboardLayout() {
  return (
    <>
      <AppHeader title="Auditor App" />
      <div className="app-content">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} end>
          <ClipboardList size={22} />
          <span>New Audits</span>
        </NavLink>
        <NavLink to="/manage" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <FolderOpen size={22} />
          <span>Manage</span>
        </NavLink>
      </nav>
    </>
  );
}