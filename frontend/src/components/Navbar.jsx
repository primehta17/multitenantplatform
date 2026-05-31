import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'OrgAdmin';

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#fff' : '#94a3b8',
    fontWeight: isActive ? 600 : 400,
    fontSize: 14,
    textDecoration: 'none',
    padding: '4px 0',
    borderBottom: isActive ? '2px solid #60a5fa' : '2px solid transparent',
  });

  return (
    <>
      <nav style={styles.nav}>
        <span style={styles.brand}>SubsApp</span>
        <div style={styles.links}>
          {isAdmin ? (
            <>
              <NavLink style={linkStyle} to="/admin/plans">Plans</NavLink>
              <NavLink style={linkStyle} to="/admin/users">Users</NavLink>
              <NavLink style={linkStyle} to="/admin/analytics">Analytics</NavLink>
            </>
          ) : (
            <>
              <NavLink style={linkStyle} to="/member/plans">Plans</NavLink>
              <NavLink style={linkStyle} to="/member/invoices">Invoices</NavLink>
            </>
          )}
        </div>
        <div style={styles.right}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{user?.role}</div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div style={{ minHeight: 'calc(100vh - 60px)', background: '#f1f5f9' }}>
        <Outlet />
      </div>
    </>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', padding: '0 28px', height: 60, background: '#0f172a', gap: 32, position: 'sticky', top: 0, zIndex: 100 },
  brand: { color: '#60a5fa', fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', marginRight: 8 },
  links: { display: 'flex', gap: 28, flex: 1 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  logoutBtn: { padding: '6px 14px', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginLeft: 4 },
};
