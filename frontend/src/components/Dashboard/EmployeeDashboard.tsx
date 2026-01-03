import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const EmployeeDashboard: React.FC = () => {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>Dayflow HRMS</h1>
        <div className="nav-user">
          <span>
            {employee?.personalDetails.firstName} {employee?.personalDetails.lastName}
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Welcome, {employee?.personalDetails.firstName}!</h2>
        <p className="subtitle">Employee ID: {user?.employeeId}</p>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('/profile')}>
            <div className="card-icon">👤</div>
            <h3>Profile</h3>
            <p>View and update your profile</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/attendance')}>
            <div className="card-icon">📅</div>
            <h3>Attendance</h3>
            <p>Track your attendance</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/leave')}>
            <div className="card-icon">🏖️</div>
            <h3>Leave Requests</h3>
            <p>Apply and manage leaves</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/payroll')}>
            <div className="card-icon">💰</div>
            <h3>Payroll</h3>
            <p>View your salary details</p>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Quick Actions</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span>Check-in for today</span>
              <button onClick={() => navigate('/attendance')} className="btn-action">
                Go to Attendance
              </button>
            </div>
            <div className="activity-item">
              <span>Apply for leave</span>
              <button onClick={() => navigate('/leave')} className="btn-action">
                Apply Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
