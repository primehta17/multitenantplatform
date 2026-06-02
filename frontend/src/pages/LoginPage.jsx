import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginUser, token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to={user?.role === 'OrgAdmin' ? '/admin' : '/member'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', form);
      loginUser(data.token, data.user);
      navigate(data.user.role === 'OrgAdmin' ? '/admin' : '/member');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div>
          <div className="auth-left-brand">SubsApp</div>
          <div className="auth-left-tag">Subscription Management</div>
        </div>
        <div>
          <div className="auth-left-headline">Manage subscriptions at scale</div>
          <div className="auth-left-sub">Multi-tenant platform for organizations to manage plans, users, and billing analytics in one place.</div>
        </div>
        <div className="auth-left-quote">
          "Built with a clean layered architecture - routes, controllers, services, and models - so every feature is easy to reason about and extend."
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your organization account</p>

          <form className="auth-stack" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required autoFocus />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 44, fontSize: 15, marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an organization? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
