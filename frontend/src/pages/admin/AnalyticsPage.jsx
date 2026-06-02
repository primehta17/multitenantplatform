import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../../api/analytics';
import axios from '../../api/axios';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED'];

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
  const [currency, setCurrency] = useState('USD');
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getAnalytics()
      .then(({ data }) => {
        setData(data);
        setCurrency(data.mrr.currency);
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCurrencyChange = async (newCurrency) => {
    setCurrencyLoading(true);
    try {
      await axios.patch('/organizations/currency', { currency: newCurrency });
      setCurrency(newCurrency);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-state-icon">📊</div>
      <div className="empty-state-title">Loading analytics...</div>
    </div>
  );
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const churnColor = data.churnLast30Days > 0 ? 'var(--danger)' : '#16a34a';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Live metrics for your organization</p>
        </div>

        {/* Currency selector — this is where the ExchangeRate API is triggered */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            💱 MRR Currency
          </span>
          <select
            className="input"
            style={{ border: 'none', padding: '2px 6px', fontSize: 14, fontWeight: 600, width: 80, cursor: 'pointer' }}
            value={currency}
            disabled={currencyLoading}
            onChange={e => handleCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {currencyLoading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Converting...</span>}
        </div>
      </div>

      {/* Metric cards */}
      <div className="metric-grid">
        <MetricCard
          label="Active Subscribers"
          value={data.totalActiveSubscribers}
          sub={data.subscribersByPlan.length > 0
            ? data.subscribersByPlan.map(p => `${p.plan}: ${p.count}`).join(' · ')
            : 'No active subscriptions'}
          color="var(--primary)"
        />
        <MetricCard
          label={`MRR (${data.mrr.currency})`}
          value={`${data.mrr.currency} ${data.mrr.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={data.mrr.currency === 'USD' ? 'No conversion needed' : `Converted from USD via ExchangeRate-API`}
          color="#16a34a"
        />
        <MetricCard
          label="Churn — Last 30 Days"
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
              <div key={p.plan} style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 10, padding: '14px 24px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', letterSpacing: -1 }}>{p.count}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{p.plan}</div>
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
          <div className="empty-state" style={{ padding: 48 }}>
            <div className="empty-state-icon">📈</div>
            <div className="empty-state-title">No data yet</div>
            <div className="empty-state-sub">Subscribe to a plan to start tracking monthly trends.</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyTrend} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="newSubscribers" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
