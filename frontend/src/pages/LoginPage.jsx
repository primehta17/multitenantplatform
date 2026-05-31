import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginUser, user } = useAuth();
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{ marginTop: 16 }}>New here? <Link to="/register">Create an organization</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: 32, borderRadius: 8, width: 380, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  input: { display: 'block', width: '100%', padding: '10px 12px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  button: { width: '100%', padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 8 },
};
