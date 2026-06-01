import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../../api/analytics';

const MetricCard = ({ title, value, sub, color = '#2563eb' }) => (
  <div className="card" style={{ flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 34, fontWeight: 800, color, letterSpacing: '-1px' }}>{value}</div>
    {sub && <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="state-center">Loading analytics...</div>;
  if (error) return <div className="state-center" style={{ color: '#dc2626' }}>{error}</div>;

  return (
    <div className="page">
      <h1 className="page-title">Analytics</h1>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <MetricCard
          title="Active Subscribers"
          value={data.totalActiveSubscribers}
          sub={data.subscribersByPlan.map(p => `${p.plan}: ${p.count}`).join(' · ') || 'No active subscriptions'}
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`${data.mrr.currency} ${data.mrr.amount.toLocaleString()}`}
          sub="Current month estimate"
          color="#16a34a"
        />
        <MetricCard
          title="Churn (Last 30 days)"
          value={data.churnLast30Days}
          sub="Cancelled subscriptions"
          color={data.churnLast30Days > 0 ? '#dc2626' : '#16a34a'}
        />
      </div>

      {/* Subscribers by plan breakdown */}
      {data.subscribersByPlan.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Subscribers by Plan</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {data.subscribersByPlan.map(p => (
              <div key={p.plan} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{p.count}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{p.plan}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly trend chart */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>New Subscribers — Last 6 Months</h3>
        {data.monthlyTrend.length === 0 ? (
          <div className="state-center" style={{ padding: 40 }}>No subscription data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyTrend} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(v) => [v, 'New Subscribers']}
              />
              <Bar dataKey="newSubscribers" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
