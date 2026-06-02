import { useState, useEffect } from 'react';
import { getPlans, createPlan, deactivatePlan } from '../../api/plans';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', billingCycle: 'monthly', features: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try { const { data } = await getPlans(); setPlans(data); }
    catch { setError('Failed to load plans'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await createPlan({ ...form, price: Number(form.price), features: form.features.split(',').map(f => f.trim()).filter(Boolean) });
      setForm({ name: '', price: '', billingCycle: 'monthly', features: '' });
      setShowForm(false); load();
    } catch { setError('Failed to create plan'); }
    finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this plan?')) return;
    try { await deactivatePlan(id); load(); }
    catch { setError('Failed to deactivate plan'); }
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-state-icon">⏳</div>
      <div className="empty-state-title">Loading plans...</div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plans</h1>
          <p className="page-subtitle">{plans.length} plan{plans.length !== 1 ? 's' : ''} in your organization</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Plan'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>New Plan</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="label">Name</label>
                <input className="input" placeholder="Pro" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Price (USD)</label>
                <input className="input" type="number" min="0" placeholder="49" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Billing cycle</label>
                <select className="input" value={form.billingCycle} onChange={e => setForm({...form, billingCycle: e.target.value})}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Features <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(comma separated)</span></label>
              <input className="input" placeholder="Unlimited users, API access, Priority support" value={form.features} onChange={e => setForm({...form, features: e.target.value})} />
            </div>
            <div className="action-row">
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Plan'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card card-table">
        {plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No plans yet</div>
            <div className="empty-state-sub">Create your first subscription plan to get started.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Plan</th><th>Price</th><th>Billing</th><th>Features</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td><span style={{ fontWeight: 700, fontSize: 15 }}>${p.price}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.billingCycle}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 260 }}>{p.features?.join(' · ') || '—'}</td>
                    <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {p.isActive && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeactivate(p._id)}>
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
