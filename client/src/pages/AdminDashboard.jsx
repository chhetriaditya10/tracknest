import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/ContextProvider';
import '../styles/AdminDashboard.css';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
const roleOptions = ['free', 'premium', 'admin'];

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users.map((u) => ({ ...u, selectedRole: u.role })));
    } catch (err) {
      console.error('Admin load failed:', err.response?.data || err.message);
      setError('Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleRoleChange = (userId, newRole) => {
    setUsers((current) =>
      current.map((row) =>
        row._id === userId ? { ...row, selectedRole: newRole } : row
      )
    );
  };

  const handleUpdateRole = async (userRow) => {
    if (!token) return;
    setUpdatingUserId(userRow._id);
    setError('');
    try {
      const payload = { role: userRow.selectedRole, isAdmin: userRow.selectedRole === 'admin' };
      const response = await axios.put(
        `${BASE_URL}/api/admin/users/${userRow._id}/role`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers((current) =>
        current.map((row) =>
          row._id === userRow._id
            ? { ...row, role: response.data.user.role, selectedRole: response.data.user.role, isAdmin: response.data.user.isAdmin }
            : row
        )
      );
    } catch (err) {
      console.error('Role update failed:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!user?.role || user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  if (loading) {
    return <div className="admin-dashboard">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>🛡️ Admin Panel</h1>
          <p>Welcome back, <strong>@{user?.username}</strong></p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats?.totalUsers ?? '—'}</p>
        </div>
        <div className="stat-card">
          <h3>Active Premium</h3>
          <p className="stat-number">{stats?.premiumUsers ?? '—'}</p>
        </div>
        <div className="stat-card">
          <h3>Active Ultra</h3>
          <p className="stat-number">{stats?.ultraPlanUsers ?? '—'}</p>
        </div>
        <div className="stat-card">
          <h3>Active Subs</h3>
          <p className="stat-number">{stats?.activeSubscriptions ?? '—'}</p>
        </div>
        <div className="stat-card">
          <h3>Canceled Subs</h3>
          <p className="stat-number">{stats?.canceledSubscriptions ?? '—'}</p>
        </div>
      </section>

      <section className="admin-users-section">
        <h2>User Accounts</h2>
        <div className="admin-users-table">
          <div className="admin-table-header">
            <span>Username</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Plan</span>
            <span>Expires</span>
            <span>Action</span>
          </div>
          {users.map((userRow) => (
            <div key={userRow._id} className="admin-table-row">
              <span>{userRow.username}</span>
              <span>{userRow.email}</span>
              <span>
                <select
                  value={userRow.selectedRole}
                  onChange={(e) => handleRoleChange(userRow._id, e.target.value)}
                  disabled={userRow._id === user._id}
                >
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </span>
              <span>{userRow.subscriptionStatus}</span>
              <span>{userRow.plan || 'free'}</span>
              <span>
                {userRow.subscriptionEndDate
                  ? new Date(userRow.subscriptionEndDate).toLocaleDateString()
                  : '—'}
              </span>
              <span>
                <button
                  className="action-btn secondary"
                  disabled={userRow._id === user._id || userRow.selectedRole === userRow.role || updatingUserId === userRow._id}
                  onClick={() => handleUpdateRole(userRow)}
                >
                  {updatingUserId === userRow._id ? 'Saving…' : 'Update'}
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

