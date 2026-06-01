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
    setError('');
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

  if (loading) return <div className="state-center">Loading plans...</div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Plans</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>New Plan</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="label">Plan name</label>
                <input className="input" name="name" placeholder="e.g. Pro" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="label">Price (USD)</label>
                <input className="input" name="price" type="number" placeholder="29" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="label">Billing cycle</label>
                <select className="input" name="billingCycle" value={form.billingCycle} onChange={handleChange}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Features (comma separated)</label>
              <input className="input" name="features" placeholder="Unlimited users, API access, Priority support" value={form.features} onChange={handleChange} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Plan'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {plans.length === 0 ? (
          <div className="state-center">No plans yet. Create your first plan above.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Billing</th>
                <th>Features</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan._id}>
                  <td style={{ fontWeight: 600 }}>{plan.name}</td>
                  <td>${plan.price}</td>
                  <td style={{ textTransform: 'capitalize' }}>{plan.billingCycle}</td>
                  <td style={{ color: '#64748b', maxWidth: 280 }}>{plan.features?.join(', ') || '-'}</td>
                  <td>
                    <span className={`badge ${plan.isActive ? 'badge-green' : 'badge-red'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {plan.isActive && (
                      <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDeactivate(plan._id)}>
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
    </div>
  );
}
