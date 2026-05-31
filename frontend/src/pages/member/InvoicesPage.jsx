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

  if (loading) return <div style={styles.center}>Loading invoices...</div>;
  if (error) return <div style={{ ...styles.center, color: '#dc2626' }}>{error}</div>;

  return (
    <div style={styles.page}>
      <h2>My Invoices</h2>
      {invoices.length === 0 ? (
        <p style={{ color: '#888' }}>No invoices yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['Description', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv._id}>
                <td style={styles.td}>{inv.description || '—'}</td>
                <td style={styles.td}>{inv.planId?.name || '—'}</td>
                <td style={styles.td}>${inv.amount} {inv.currency}</td>
                <td style={styles.td}>
                  <span style={{ color: inv.status === 'paid' ? '#16a34a' : '#f59e0b' }}>
                    {inv.status}
                  </span>
                </td>
                <td style={styles.td}>{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 24 },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 16 },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', fontSize: 13 },
  td: { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 14 },
  center: { padding: 40, textAlign: 'center', color: '#888' },
};
