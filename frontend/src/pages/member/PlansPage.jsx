import { useState, useEffect } from 'react';
import { getPlans } from '../../api/plans';

export default function MemberPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlans()
      .then(({ data }) => setPlans(data.filter(p => p.isActive)))
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.center}>Loading plans...</div>;
  if (error) return <div style={{ ...styles.center, color: '#dc2626' }}>{error}</div>;

  return (
    <div style={styles.page}>
      <h2>Available Plans</h2>
      {plans.length === 0 ? (
        <p style={{ color: '#888' }}>No plans available yet.</p>
      ) : (
        <div style={styles.grid}>
          {plans.map(plan => (
            <div key={plan._id} style={styles.card}>
              <h3 style={{ margin: '0 0 8px' }}>{plan.name}</h3>
              <p style={styles.price}>${plan.price}<span style={styles.cycle}>/{plan.billingCycle}</span></p>
              <ul style={styles.features}>
                {plan.features?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 24 },
  grid: { display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 20 },
  card: { border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, minWidth: 220, background: '#fff' },
  price: { fontSize: 28, fontWeight: 700, margin: '8px 0' },
  cycle: { fontSize: 14, fontWeight: 400, color: '#888' },
  features: { paddingLeft: 18, color: '#555', fontSize: 14 },
  center: { padding: 40, textAlign: 'center', color: '#888' },
};
