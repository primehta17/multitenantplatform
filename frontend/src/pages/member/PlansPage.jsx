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
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
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
    if (!confirm('Cancel your subscription? This will take effect immediately.')) return;
    setActionLoading('cancel');
    try { await cancelSubscription(currentSub._id); await fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to cancel'); }
    finally { setActionLoading(''); }
  };

  if (loading) return <div className="state-center">Loading plans...</div>;

  const activePlanId = currentSub?.planId?._id;

  return (
    <div className="page">
      <h1 className="page-title">Subscription Plans</h1>

      {currentSub && (
        <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <strong>Current plan:</strong> {currentSub.planId?.name} -{' '}
            ${currentSub.planId?.price}/{currentSub.planId?.billingCycle}
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={actionLoading === 'cancel'}>
            {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel subscription'}
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {plans.length === 0 ? (
        <div className="state-center">No plans available yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {plans.map(plan => {
            const isActive = plan._id === activePlanId;
            return (
              <div key={plan._id} className="card" style={{ border: isActive ? '2px solid #2563eb' : undefined, position: 'relative' }}>
                {isActive && (
                  <span className="badge badge-blue" style={{ position: 'absolute', top: -12, left: 20 }}>
                    Current Plan
                  </span>
                )}
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>${plan.price}</span>
                    <span style={{ fontSize: 14, color: '#94a3b8' }}>/{plan.billingCycle}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                  {plan.features?.map((f, i) => (
                    <li key={i} style={{ fontSize: 14, color: '#475569', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                {!isActive && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={!!actionLoading}
                    onClick={() => currentSub ? handleChange(plan._id) : handleSubscribe(plan._id)}
                  >
                    {actionLoading === plan._id ? 'Processing...' : currentSub ? 'Switch to this plan' : 'Subscribe'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
