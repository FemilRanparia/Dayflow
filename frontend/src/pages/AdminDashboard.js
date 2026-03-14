import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { reportService, leaveService, userService } from '../services/services';
import { FiUsers, FiCheckCircle, FiClock, FiHome, FiFileText, FiBarChart2, FiDownload } from 'react-icons/fi';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0,
        departments: [],
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            // Fetch dashboard statistics
            const dashboardData = await reportService.getDashboardStats();

            // Fetch pending leaves
            const leavesData = await leaveService.getAllLeaves({ status: 'Pending' });

            setStats({
                ...dashboardData.data,
                pendingLeaves: leavesData.count || 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportAttendance = async () => {
        try {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            const endDate = today.toISOString().split('T')[0];
            await reportService.exportAttendance({ startDate, endDate });
        } catch (error) {
            alert('Failed to export attendance. Please try again.');
        }
    };

    const handleExportLeaves = async () => {
        try {
            await reportService.exportLeaves({});
        } catch (error) {
            alert('Failed to export leaves. Please try again.');
        }
    };

    const handleExportPayroll = async () => {
        try {
            await reportService.exportPayroll({});
        } catch (error) {
            alert('Failed to export payroll. Please try again.');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="container">
                        <h1 className="dashboard-welcome">
                            {user?.role === 'HR' ? 'HR Dashboard' : 'Admin Dashboard'}
                        </h1>
                        <p className="dashboard-subtitle">
                            Manage your organization efficiently
                        </p>
                    </div>
                </div>

                <div className="container">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon">👥</div>
                            <div className="stat-label">Total Employees</div>
                            <div className="stat-value">{stats.totalEmployees}</div>
                        </div>

                        <div className="stat-card success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-label">Present Today</div>
                            <div className="stat-value">{stats.presentToday}</div>
                        </div>

                        <div className="stat-card warning">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-label">Pending Leave Requests</div>
                            <div className="stat-value">{stats.pendingLeaves}</div>
                        </div>

                        <div className="stat-card info">
                            <div className="stat-icon">🏢</div>
                            <div className="stat-label">Departments</div>
                            <div className="stat-value">{stats.departments?.length || 0}</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="actions-grid">
                            <div className="action-card" onClick={() => navigate('/employees')}>
                                <div className="action-icon">👥</div>
                                <div className="action-label">Manage Employees</div>
                            </div>

                            <div className="action-card" onClick={() => navigate('/leaves')}>
                                <div className="action-icon">📋</div>
                                <div className="action-label">Approve Leaves</div>
                            </div>

                            <div className="action-card" onClick={() => navigate('/attendance')}>
                                <div className="action-icon">📊</div>
                                <div className="action-label">View Attendance</div>
                            </div>

                            <div className="action-card" onClick={handleExportAttendance}>
                                <div className="action-icon">📥</div>
                                <div className="action-label">Export Attendance</div>
                            </div>

                            <div className="action-card" onClick={handleExportLeaves}>
                                <div className="action-icon">📥</div>
                                <div className="action-label">Export Leaves</div>
                            </div>

                            <div className="action-card" onClick={handleExportPayroll}>
                                <div className="action-icon">💰</div>
                                <div className="action-label">Export Payroll</div>
                            </div>
                        </div>
                    </div>

                    {/* Department Breakdown */}
                    {stats.departments && stats.departments.length > 0 && (
                        <div className="recent-activity">
                            <h2 className="section-title">Department Breakdown</h2>
                            {stats.departments.map((dept, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon info">🏢</div>
                                    <div className="activity-content">
                                        <div className="activity-title">{dept._id || 'Unassigned'}</div>
                                        <div className="activity-time">{dept.count} employee{dept.count > 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Alerts */}
                    {stats.pendingLeaves > 0 && (
                        <div className="alert alert-warning" style={{ marginTop: '2rem' }}>
                            <span>⚠️</span>
                            <strong>Action Required:</strong> You have {stats.pendingLeaves} pending leave request{stats.pendingLeaves > 1 ? 's' : ''} awaiting approval.
                            <button
                                className="btn btn-primary"
                                style={{ marginLeft: '1rem' }}
                                onClick={() => navigate('/leaves')}
                            >
                                Review Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;



