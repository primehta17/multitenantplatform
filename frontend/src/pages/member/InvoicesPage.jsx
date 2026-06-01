import { useState, useEffect } from 'react';
import { getMyInvoices } from '../../api/invoices';

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

  if (loading) return <div className="state-center">Loading invoices...</div>;
  if (error) return <div className="state-center" style={{ color: '#dc2626' }}>{error}</div>;

  const statusBadge = (s) => {
    const map = { paid: 'badge-green', pending: 'badge-yellow', failed: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <div className="page">
      <h1 className="page-title">Invoices</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {invoices.length === 0 ? (
          <div className="state-center">No invoices yet. Subscribe to a plan to get started.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.description || '-'}</td>
                  <td>{inv.planId?.name || '-'}</td>
                  <td style={{ fontWeight: 600 }}>${inv.amount} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{inv.currency}</span></td>
                  <td>{statusBadge(inv.status)}</td>
                  <td style={{ color: '#64748b' }}>{new Date(inv.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
