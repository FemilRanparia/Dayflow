import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { attendanceService, leaveService } from '../services/services';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiFileText, FiUser, FiLogIn, FiLogOut, FiBarChart2, FiInfo } from 'react-icons/fi';
import './Dashboard.css';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayAttendance: null,
        leaveBalance: { paidLeave: 0, sickLeave: 0 },
        pendingLeaves: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch today's attendance
            const todayData = await attendanceService.getTodayAttendance();

            // Fetch leave stats
            const leaveStats = await leaveService.getLeaveStats();

            // Fetch pending leaves count
            const myLeaves = await leaveService.getMyLeaves();
            const pending = myLeaves.data.filter(l => l.status === 'Pending').length;

            setStats({
                todayAttendance: todayData.data,
                leaveBalance: leaveStats.data.leaveBalance,
                pendingLeaves: pending,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            await attendanceService.checkIn();
            alert('✅ Checked in successfully!');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await attendanceService.checkOut();
            alert('✅ Checked out successfully!');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failed');
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
                            Welcome back, {user?.firstName}!
                        </h1>
                        <p className="dashboard-subtitle">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="container">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon"><FiCalendar /></div>
                            <div className="stat-label">Today's Status</div>
                            <div className="stat-value">
                                {stats.todayAttendance?.status || 'Not Checked In'}
                            </div>
                        </div>

                        <div className="stat-card success">
                            <div className="stat-icon"><FiCalendar /></div>
                            <div className="stat-label">Paid Leave Balance</div>
                            <div className="stat-value">{stats.leaveBalance.paidLeave} days</div>
                        </div>

                        <div className="stat-card warning">
                            <div className="stat-icon"><FiAlertCircle /></div>
                            <div className="stat-label">Sick Leave Balance</div>
                            <div className="stat-value">{stats.leaveBalance.sickLeave} days</div>
                        </div>

                        <div className="stat-card info">
                            <div className="stat-icon"><FiClock /></div>
                            <div className="stat-label">Pending Requests</div>
                            <div className="stat-value">{stats.pendingLeaves}</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="actions-grid">
                            <div
                                className="action-card"
                                onClick={handleCheckIn}
                                style={{ opacity: stats.todayAttendance?.checkIn ? 0.5 : 1 }}
                            >
                                <div className="action-icon"><FiLogIn /></div>
                                <div className="action-label">Check In</div>
                            </div>

                            <div
                                className="action-card"
                                onClick={handleCheckOut}
                                style={{ opacity: stats.todayAttendance?.checkOut ? 0.5 : 1 }}
                            >
                                <div className="action-icon"><FiLogOut /></div>
                                <div className="action-label">Check Out</div>
                            </div>

                            <div className="action-card" onClick={() => navigate('/leaves')}>
                                <div className="action-icon"><FiFileText /></div>
                                <div className="action-label">Apply Leave</div>
                            </div>

                            <div className="action-card" onClick={() => navigate('/attendance')}>
                                <div className="action-icon"><FiBarChart2 /></div>
                                <div className="action-label">View Attendance</div>
                            </div>

                            <div className="action-card" onClick={() => navigate('/profile')}>
                                <div className="action-icon"><FiUser /></div>
                                <div className="action-label">My Profile</div>
                            </div>

                            <div className="action-card" onClick={() => navigate('/leaves')}>
                                <div className="action-icon"><FiFileText /></div>
                                <div className="action-label">Leave History</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="recent-activity">
                        <h2 className="section-title">Recent Activity</h2>

                        {stats.todayAttendance?.checkIn && (
                            <div className="activity-item">
                                <div className="activity-icon success"><FiCheckCircle /></div>
                                <div className="activity-content">
                                    <div className="activity-title">Checked In</div>
                                    <div className="activity-time">
                                        {new Date(stats.todayAttendance.checkIn).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {stats.todayAttendance?.checkOut && (
                            <div className="activity-item">
                                <div className="activity-icon success">✓</div>
                                <div className="activity-content">
                                    <div className="activity-title">Checked Out</div>
                                    <div className="activity-time">
                                        {new Date(stats.todayAttendance.checkOut).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {stats.pendingLeaves > 0 && (
                            <div className="activity-item">
                                <div className="activity-icon warning"><FiClock /></div>
                                <div className="activity-content">
                                    <div className="activity-title">
                                        {stats.pendingLeaves} Leave Request{stats.pendingLeaves > 1 ? 's' : ''} Pending
                                    </div>
                                    <div className="activity-time">Awaiting HR approval</div>
                                </div>
                            </div>
                        )}

                        {!stats.todayAttendance?.checkIn && !stats.pendingLeaves && (
                            <div className="activity-item">
                                <div className="activity-icon info"><FiInfo /></div>
                                <div className="activity-content">
                                    <div className="activity-title">No recent activity</div>
                                    <div className="activity-time">Start by checking in for today</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmployeeDashboard;

