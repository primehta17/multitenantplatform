import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'OrgAdmin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.brand}>SubscriptionApp</div>
        <div style={styles.links}>
          {isAdmin ? (
            <>
              <Link style={styles.link} to="/admin/plans">Plans</Link>
              <Link style={styles.link} to="/admin/users">Users</Link>
              <Link style={styles.link} to="/admin/analytics">Analytics</Link>
            </>
          ) : (
            <>
              <Link style={styles.link} to="/member/plans">Plans</Link>
              <Link style={styles.link} to="/member/invoices">Invoices</Link>
            </>
          )}
        </div>
        <div style={styles.right}>
          <span style={{ fontSize: 14, color: '#555' }}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div style={styles.content}>
        <Outlet />
      </div>
    </>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, background: '#1e293b', gap: 32 },
  brand: { color: '#fff', fontWeight: 700, fontSize: 16, marginRight: 16 },
  links: { display: 'flex', gap: 24, flex: 1 },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: 14 },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  logoutBtn: { padding: '6px 14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  content: { minHeight: 'calc(100vh - 56px)', background: '#f8fafc' },
};
