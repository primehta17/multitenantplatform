import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', form);
      loginUser(data.token, data.user);
      navigate(data.user.role === 'OrgAdmin' ? '/admin' : '/member');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to your organization.</p>
        <form className="auth-stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" name="email" type="email" placeholder="jane@acme.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">New here? <Link to="/register">Create an organization</Link></p>
      </div>
    </div>
  );
}
