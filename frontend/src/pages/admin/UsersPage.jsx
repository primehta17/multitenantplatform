import { useState, useEffect } from 'react';
import { getUsers, inviteUser, changeRole } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [roleLoading, setRoleLoading] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await inviteUser(form);
      setForm({ email: '', name: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    setRoleLoading(id);
    setError('');
    try {
      await changeRole(id, role);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    } finally {
      setRoleLoading('');
    }
  };

  if (loading) return <div className="state-center">Loading users...</div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Team Members</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Invite User'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Invite a team member</h3>
          <form onSubmit={handleInvite}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="label">Name</label>
                <input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Email address</label>
                <input className="input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              An invite link would be sent by email in production. For now the user is created with status <strong>invited</strong>.
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Inviting...' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ fontWeight: 600 }}>
                  {u.name}
                  {u._id === currentUser?.id && <span className="badge badge-blue" style={{ marginLeft: 8 }}>You</span>}
                </td>
                <td style={{ color: '#64748b' }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'OrgAdmin' ? 'badge-blue' : 'badge-gray'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ color: '#64748b' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td>
                  {u._id !== currentUser?.id && (
                    <select
                      className="input"
                      style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                      value={u.role}
                      disabled={roleLoading === u._id}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="OrgMember">OrgMember</option>
                      <option value="OrgAdmin">OrgAdmin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="state-center">No users yet. Invite your first team member.</div>}
      </div>
    </div>
  );
}
