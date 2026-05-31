import { useState, useEffect } from 'react';
import { getPlans, createPlan, deactivatePlan } from '../../api/plans';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', billingCycle: 'monthly', features: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      const { data } = await getPlans();
      setPlans(data);
    } catch {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPlan({
        ...form,
        price: Number(form.price),
        features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      });
      setForm({ name: '', price: '', billingCycle: 'monthly', features: '' });
      setShowForm(false);
      fetchPlans();
    } catch {
      setError('Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this plan?')) return;
    try {
      await deactivatePlan(id);
      fetchPlans();
    } catch {
      setError('Failed to deactivate plan');
    }
  };

  if (loading) return <div style={styles.center}>Loading plans...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Plans</h2>
        <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} name="name" placeholder="Plan name" value={form.name} onChange={handleChange} required />
          <input style={styles.input} name="price" type="number" placeholder="Price (USD)" value={form.price} onChange={handleChange} required />
          <select style={styles.input} name="billingCycle" value={form.billingCycle} onChange={handleChange}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
          <input style={styles.input} name="features" placeholder="Features (comma separated)" value={form.features} onChange={handleChange} />
          <button style={styles.btn} type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Plan'}
          </button>
        </form>
      )}

      {plans.length === 0 ? (
        <p style={{ color: '#888' }}>No plans yet. Create one above.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['Name', 'Price', 'Billing', 'Features', 'Status', 'Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan._id}>
                <td style={styles.td}>{plan.name}</td>
                <td style={styles.td}>${plan.price}</td>
                <td style={styles.td}>{plan.billingCycle}</td>
                <td style={styles.td}>{plan.features?.join(', ') || '—'}</td>
                <td style={styles.td}>
                  <span style={{ color: plan.isActive ? '#16a34a' : '#dc2626' }}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  {plan.isActive && (
                    <button style={styles.dangerBtn} onClick={() => handleDeactivate(plan._id)}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  form: { background: '#f9fafb', padding: 20, borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' },
  input: { padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, minWidth: 160 },
  btn: { padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  dangerBtn: { padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', fontSize: 13 },
  td: { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 14 },
  error: { color: '#dc2626', marginBottom: 12 },
  center: { padding: 40, textAlign: 'center', color: '#888' },
};
