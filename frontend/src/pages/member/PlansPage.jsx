import { useState, useEffect } from 'react';
import { getPlans } from '../../api/plans';
import { getMySubscription, subscribe, changePlan, cancelSubscription } from '../../api/subscriptions';

export default function MemberPlansPage() {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([getPlans(), getMySubscription()]);
      setPlans(plansRes.data.filter(p => p.isActive));
      setCurrentSub(subRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubscribe = async (planId) => {
    setActionLoading(planId); setError('');
    try { await subscribe(planId); await fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to subscribe'); }
    finally { setActionLoading(''); }
  };

  const handleChange = async (planId) => {
    setActionLoading(planId); setError('');
    try { await changePlan(currentSub._id, planId); await fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to change plan'); }
    finally { setActionLoading(''); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? This cannot be undone.')) return;
    setActionLoading('cancel');
    try { await cancelSubscription(currentSub._id); await fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to cancel'); }
    finally { setActionLoading(''); }
  };

  if (loading) return <div className="state-center"><div className="state-center-icon">⏳</div>Loading plans...</div>;

  const activePlanId = currentSub?.planId?._id;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plans</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {currentSub ? `Currently on ${currentSub.planId?.name}` : 'Choose a plan to get started'}
          </p>
        </div>
      </div>

      {currentSub && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>Current plan: </span>
            <span style={{ fontSize: 13, color: '#1e40af' }}>
              {currentSub.planId?.name} - ${currentSub.planId?.price}/{currentSub.planId?.billingCycle}
            </span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={actionLoading === 'cancel'}>
            {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel subscription'}
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {plans.length === 0 ? (
        <div className="state-center"><div className="state-center-icon">📋</div>No plans available yet.</div>
      ) : (
        <div className="plan-grid">
          {plans.map(plan => {
            const isActive = plan._id === activePlanId;
            return (
              <div key={plan._id} className={`card plan-card ${isActive ? 'plan-card-active' : ''}`}>
                {isActive && <div className="plan-current-badge">Current Plan</div>}

                <div style={{ marginBottom: 16 }}>
                  <div className="plan-name">{plan.name}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span className="plan-price">${plan.price}</span>
                    <span className="plan-cycle">/{plan.billingCycle}</span>
                  </div>
                </div>

                <div className="divider" style={{ marginBottom: 16 }} />

                <ul className="plan-features">
                  {plan.features?.length > 0
                    ? plan.features.map((f, i) => (
                        <li key={i} className="plan-feature">
                          <span className="plan-feature-check">✓</span> {f}
                        </li>
                      ))
                    : <li className="plan-feature" style={{ color: 'var(--text-muted)' }}>No features listed</li>
                  }
                </ul>

                {!isActive && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 8 }}
                    disabled={!!actionLoading}
                    onClick={() => currentSub ? handleChange(plan._id) : handleSubscribe(plan._id)}
                  >
                    {actionLoading === plan._id ? 'Processing...' : currentSub ? 'Switch to this plan' : 'Get started'}
                  </button>
                )}

                {isActive && (
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 8 }}>
                    ✓ Your current plan
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
