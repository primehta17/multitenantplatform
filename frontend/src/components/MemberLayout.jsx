import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/member/plans',    icon: '📋', label: 'Plans' },
  { to: '/member/invoices', icon: '🧾', label: 'Invoices' },
];

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setOpen(false);

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={close} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">SubsApp</div>
          <div className="sidebar-brand-sub">Member Portal</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">Navigation</div>
            {NAV.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={close}
              >
                <span className="sidebar-link-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="sidebar-user-role">OrgMember</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>Out</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="topbar-menu-btn" onClick={() => setOpen(true)}>☰</button>
          <span className="topbar-brand">SubsApp</span>
          <div className="topbar-links">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}>{label}</NavLink>
            ))}
          </div>
          <div className="topbar-right">
            <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="topbar-user">
              <span className="topbar-user-name">{user?.name}</span>
              <span className="topbar-user-role">Member</span>
            </div>
            <button className="topbar-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
