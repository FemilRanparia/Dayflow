import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, leavesRes] = await Promise.all([
          api.get('/employees/all'),
          api.get('/leaves/all?status=pending'),
        ]);
        setStats({
          totalEmployees: employeesRes.data.length,
          pendingLeaves: leavesRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>Dayflow HRMS - Admin</h1>
        <div className="nav-user">
          <span>{user?.employeeId} ({user?.role})</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Admin Dashboard</h2>
        <p className="subtitle">Manage your organization</p>

        <div className="stats-cards">
          <div className="stat-card">
            <h3>{stats.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingLeaves}</h3>
            <p>Pending Leave Requests</p>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('/admin/employees')}>
            <div className="card-icon">👥</div>
            <h3>Employees</h3>
            <p>Manage employee records</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/admin/attendance')}>
            <div className="card-icon">📊</div>
            <h3>Attendance Records</h3>
            <p>View all attendance</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/admin/leaves')}>
            <div className="card-icon">✅</div>
            <h3>Leave Approvals</h3>
            <p>Approve or reject leaves</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/admin/payroll')}>
            <div className="card-icon">💵</div>
            <h3>Payroll Management</h3>
            <p>Manage employee payroll</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
