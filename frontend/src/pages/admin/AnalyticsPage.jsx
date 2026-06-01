import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../../api/analytics';

const MetricCard = ({ label, value, sub, color = 'var(--primary)' }) => (
  <div className="card metric-card">
    <div className="metric-label">{label}</div>
    <div className="metric-value" style={{ color }}>{value}</div>
    {sub && <div className="metric-sub">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--primary)' }}>{payload[0].value} new subscribers</div>
    </div>
  );
};

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

  if (loading) return <div className="state-center"><div className="state-center-icon">📊</div>Loading analytics...</div>;
  if (error) return <div className="state-center" style={{ color: 'var(--danger)' }}>{error}</div>;

  const churnColor = data.churnLast30Days > 0 ? 'var(--danger)' : '#16a34a';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Live metrics for your organization</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="metric-grid">
        <MetricCard
          label="Active Subscribers"
          value={data.totalActiveSubscribers}
          sub={data.subscribersByPlan.length > 0 ? data.subscribersByPlan.map(p => `${p.plan}: ${p.count}`).join(' · ') : 'No active subscriptions'}
          color="var(--primary)"
        />
        <MetricCard
          label="Monthly Recurring Revenue"
          value={`${data.mrr.currency} ${data.mrr.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="Estimated for current month"
          color="#16a34a"
        />
        <MetricCard
          label="Churn - Last 30 Days"
          value={data.churnLast30Days}
          sub={data.churnLast30Days === 0 ? 'No cancellations' : `${data.churnLast30Days} cancellation${data.churnLast30Days > 1 ? 's' : ''}`}
          color={churnColor}
        />
      </div>

      {/* Plan breakdown */}
      {data.subscribersByPlan.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16 }}>Subscribers by Plan</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {data.subscribersByPlan.map(p => (
              <div key={p.plan} style={{ background: 'var(--primary-light)', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 24px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', letterSpacing: -1 }}>{p.count}</div>
                <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, marginTop: 2 }}>{p.plan}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly trend chart */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>New Subscribers per Month</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Last 6 months</div>
        {data.monthlyTrend.length === 0 ? (
          <div className="state-center" style={{ padding: 48 }}>
            <div className="state-center-icon">📈</div>
            No subscription data yet - subscribe to a plan to start tracking.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyTrend} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="newSubscribers" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
