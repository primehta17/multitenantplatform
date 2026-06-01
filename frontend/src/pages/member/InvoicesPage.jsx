import { useState, useEffect } from 'react';
import { getMyInvoices } from '../../api/invoices';

const statusBadge = (s) => {
  const map = { paid: 'badge-green', pending: 'badge-yellow', failed: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyInvoices()
      .then(({ data }) => setInvoices(data))
      .catch(() => setError('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-state-icon">⏳</div>
      <div className="empty-state-title">Loading invoices...</div>
    </div>
  );

  if (error) return (
    <div className="page"><div className="alert alert-error">{error}</div></div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing History</h1>
          <p className="page-subtitle">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="card card-table">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <div className="empty-state-title">No invoices yet</div>
            <div className="empty-state-sub">Subscribe to a plan to see your billing history here.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Description</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inv.description || '—'}</td>
                    <td>{inv.planId?.name || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${inv.amount}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>{inv.currency}</span>
                    </td>
                    <td>{statusBadge(inv.status)}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(inv.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
