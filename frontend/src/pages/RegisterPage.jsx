import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ orgName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/register', form);
      loginUser(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create your organization</h2>
        <p className="auth-sub">Get started - it only takes a minute.</p>
        <form className="auth-stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Organization name</label>
            <input className="input" name="orgName" placeholder="Acme Corp" value={form.orgName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Your name</label>
            <input className="input" name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" name="email" type="email" placeholder="jane@acme.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
