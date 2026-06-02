import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { loginUser, token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ orgName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to={user?.role === 'OrgAdmin' ? '/admin' : '/member'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post('/auth/register', form);
      loginUser(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <div className="auth-left-headline">Everything your team needs to manage subscriptions</div>
          <div className="auth-left-sub">Set up in minutes. Create plans, invite your team, and track revenue - all from one dashboard.</div>
        </div>
        <div className="auth-left-quote">
          "Multi-tenant by design - every organization's data is fully isolated. One platform, unlimited organizations."
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Create your organization</h1>
          <p className="auth-sub">Get started for free - no credit card required</p>

          <form className="auth-stack" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Organization name</label>
              <input className="input" placeholder="Acme Corp" value={form.orgName} onChange={e => setForm({...form, orgName: e.target.value})} required autoFocus />
            </div>
            <div className="form-group">
              <label className="label">Your full name</label>
              <input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="label">Work email</label>
              <input className="input" type="email" placeholder="jane@acme.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 44, fontSize: 15, marginTop: 4 }}>
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
