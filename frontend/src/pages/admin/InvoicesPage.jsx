import { useEffect, useState } from 'react';
import { getAllInvoices } from '../../api/invoices';

const statusBadge = (status) => {
  const map = { paid: 'badge-green', pending: 'badge-yellow', failed: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllInvoices()
      .then(({ data }) => setInvoices(data))
      .catch(() => setError('Failed to load organization invoices'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-title">Loading organization invoices...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organization Invoices</h1>
          <p className="page-subtitle">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} across your organization</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card card-table">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <div className="empty-state-title">No invoices found</div>
            <div className="empty-state-sub">Invoices will appear here as members subscribe, switch, or cancel plans.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{invoice.userId || 'N/A'}</td>
                    <td>{invoice.planId?.name || 'N/A'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${invoice.amount}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>{invoice.currency}</span>
                    </td>
                    <td>{statusBadge(invoice.status)}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
