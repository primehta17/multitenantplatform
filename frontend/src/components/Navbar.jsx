import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'OrgAdmin';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <nav className="nav">
        <span className="nav-brand">SubsApp</span>

        <div className="nav-links">
          {isAdmin ? (
            <>
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/admin/plans">Plans</NavLink>
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/admin/users">Users</NavLink>
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/admin/analytics">Analytics</NavLink>
            </>
          ) : (
            <>
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/member/plans">Plans</NavLink>
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/member/invoices">Invoices</NavLink>
            </>
          )}
        </div>

        <div className="nav-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="nav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="nav-user-name">{user?.name}</div>
              <div className="nav-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="nav-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--bg)' }}>
        <Outlet />
      </div>
    </>
  );
}
