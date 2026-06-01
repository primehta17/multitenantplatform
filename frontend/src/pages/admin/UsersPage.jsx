import { useState, useEffect } from 'react';
import { getUsers, inviteUser, changeRole } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [roleLoading, setRoleLoading] = useState('');

  const load = async () => {
    try { const { data } = await getUsers(); setUsers(data); }
    catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try { await inviteUser(form); setForm({ name: '', email: '', password: '' }); setShowForm(false); load(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to invite user'); }
    finally { setSubmitting(false); }
  };

  const handleRoleChange = async (id, role) => {
    setRoleLoading(id); setError('');
    try { await changeRole(id, role); load(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to change role'); }
    finally { setRoleLoading(''); }
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-state-icon">⏳</div>
      <div className="empty-state-title">Loading team...</div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''} in your organization</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Invite Member'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Invite a team member</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            In production an email would be sent. Share the temporary password with the member directly.
          </p>
          <form onSubmit={handleInvite}>
            <div className="form-grid-3" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="label">Name</label>
                <input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Temporary password</label>
                <input className="input" type="password" placeholder="Share with member" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Inviting...' : 'Send Invite'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card card-table">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Member</th><th>Role</th><th>Status</th><th>Joined</th><th>Change Role</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name}
                          {u._id === me?.id && <span className="badge badge-blue" style={{ fontSize: 10 }}>You</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${u.role === 'OrgAdmin' ? 'badge-purple' : 'badge-gray'}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{u.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>
                    {u._id !== me?.id ? (
                      <select className="input" style={{ width: 140, padding: '7px 10px', fontSize: 13 }} value={u.role} disabled={roleLoading === u._id} onChange={e => handleRoleChange(u._id, e.target.value)}>
                        <option value="OrgMember">OrgMember</option>
                        <option value="OrgAdmin">OrgAdmin</option>
                      </select>
                    ) : <span style={{ color: 'var(--text-subtle)', fontSize: 13 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No team members yet</div>
              <div className="empty-state-sub">Invite your first team member to get started.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
