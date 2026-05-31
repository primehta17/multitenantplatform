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
    setActionLoading(planId);
    setError('');
    try {
      await subscribe(planId);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe');
    } finally {
      setActionLoading('');
    }
  };

  const handleChange = async (planId) => {
    setActionLoading(planId);
    setError('');
    try {
      await changePlan(currentSub._id, planId);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change plan');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return;
    setActionLoading('cancel');
    try {
      await cancelSubscription(currentSub._id);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;

  const activePlanId = currentSub?.planId?._id;

  return (
    <div style={styles.page}>
      <h2>Plans</h2>

      {currentSub && (
        <div style={styles.currentBanner}>
          <span>Current plan: <strong>{currentSub.planId?.name}</strong> (${currentSub.planId?.price}/{currentSub.planId?.billingCycle})</span>
          <button
            style={styles.cancelBtn}
            onClick={handleCancel}
            disabled={actionLoading === 'cancel'}
          >
            {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel subscription'}
          </button>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        {plans.map(plan => {
          const isActive = plan._id === activePlanId;
          return (
            <div key={plan._id} style={{ ...styles.card, ...(isActive ? styles.activeCard : {}) }}>
              {isActive && <div style={styles.badge}>Current Plan</div>}
              <h3 style={{ margin: '0 0 8px' }}>{plan.name}</h3>
              <p style={styles.price}>${plan.price}<span style={styles.cycle}>/{plan.billingCycle}</span></p>
              <ul style={styles.features}>
                {plan.features?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              {!isActive && (
                <button
                  style={styles.btn}
                  disabled={!!actionLoading}
                  onClick={() => currentSub ? handleChange(plan._id) : handleSubscribe(plan._id)}
                >
                  {actionLoading === plan._id
                    ? 'Processing...'
                    : currentSub ? 'Switch to this plan' : 'Subscribe'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24 },
  grid: { display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 20 },
  card: { border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, minWidth: 220, background: '#fff', position: 'relative' },
  activeCard: { border: '2px solid #2563eb' },
  badge: { position: 'absolute', top: -12, left: 16, background: '#2563eb', color: '#fff', fontSize: 11, padding: '2px 10px', borderRadius: 20 },
  price: { fontSize: 28, fontWeight: 700, margin: '8px 0' },
  cycle: { fontSize: 14, fontWeight: 400, color: '#888' },
  features: { paddingLeft: 18, color: '#555', fontSize: 14, marginBottom: 16 },
  btn: { width: '100%', padding: '9px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  currentBanner: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cancelBtn: { padding: '7px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  error: { color: '#dc2626', marginBottom: 12 },
  center: { padding: 40, textAlign: 'center', color: '#888' },
};
