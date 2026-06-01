import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin/plans',     icon: '📋', label: 'Plans' },
  { to: '/admin/users',     icon: '👥', label: 'Team' },
  { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setOpen(false);

  return (
    <div className="app-shell">
      {/* Overlay */}
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={close} />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">SubsApp</div>
          <div className="sidebar-brand-sub">Admin Portal</div>
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
            <div className="sidebar-user-role">OrgAdmin</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Mobile topbar */}
        <header className="topbar">
          <button className="topbar-menu-btn" onClick={() => setOpen(true)}>☰</button>
          <span className="topbar-brand">SubsApp</span>
          <div className="topbar-right">
            <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
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
