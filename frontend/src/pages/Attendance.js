import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/services';
import { FiLogIn, FiLogOut, FiCheckCircle, FiX, FiClock, FiCalendar, FiAlertCircle, FiFolder } from 'react-icons/fi';
import './Attendance.css';

const Attendance = () => {
    const { user, isAdmin, isHR } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-attendance'); // 'my-attendance' or 'all-employees'
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [allEmployeesAttendance, setAllEmployeesAttendance] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchAttendanceData();
    }, [dateRange, activeTab, selectedEmployee]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);

            // Fetch today's attendance (for my attendance tab)
            if (activeTab === 'my-attendance') {
                const todayData = await attendanceService.getTodayAttendance();
                setTodayAttendance(todayData.data);

                // Fetch my attendance records
                const recordsData = await attendanceService.getMyAttendance(
                    dateRange.startDate,
                    dateRange.endDate
                );
                setAttendanceRecords(recordsData.data || []);
            } else if (activeTab === 'all-employees' && (isAdmin || isHR)) {
                // Fetch all employees' attendance
                const params = {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                };

                if (selectedEmployee !== 'all') {
                    params.userId = selectedEmployee;
                }

                const allData = await attendanceService.getAllAttendance(params);
                setAllEmployeesAttendance(allData.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            await attendanceService.checkIn();
            alert('✅ Checked in successfully!');
            fetchAttendanceData();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await attendanceService.checkOut();
            alert('✅ Checked out successfully!');
            fetchAttendanceData();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failed');
        }
    };

    const handleDateChange = (e) => {
        setDateRange({
            ...dateRange,
            [e.target.name]: e.target.value,
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Present':
                return 'badge-success';
            case 'Absent':
                return 'badge-error';
            case 'Half-day':
                return 'badge-warning';
            case 'Leave':
                return 'badge-info';
            default:
                return 'badge-secondary';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';
        const diff = new Date(checkOut) - new Date(checkIn);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading attendance...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="attendance-container">
                <div className="attendance-header">
                    <div className="container">
                        <h1 className="dashboard-welcome">Attendance Management </h1>
                        <p className="dashboard-subtitle">Track your daily attendance and work hours</p>
                    </div>
                </div>

                <div className="container">
                    {/* Tabs for Admin/HR */}
                    {(isAdmin || isHR) && (
                        <div className="attendance-tabs">
                            <button
                                className={`tab-button ${activeTab === 'my-attendance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('my-attendance')}
                            >
                                📊 My Attendance
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'all-employees' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all-employees')}
                            >
                                👥 All Employees
                            </button>
                        </div>
                    )}

                    {/* My Attendance Tab */}
                    {activeTab === 'my-attendance' && (
                        <>
                            {/* Check-in/Check-out Section */}
                            <div className="attendance-card">
                                <h2 className="section-title">Today's Attendance</h2>

                                <div className="check-buttons">
                                    <button
                                        className="check-btn check-in"
                                        onClick={handleCheckIn}
                                        disabled={todayAttendance?.checkIn}
                                    >
                                        <span>🟢</span>
                                        {todayAttendance?.checkIn ? 'Checked In' : 'Check In'}
                                    </button>
                                    <button
                                        className="check-btn check-out"
                                        onClick={handleCheckOut}
                                        disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut}
                                    >
                                        <span>🔴</span>
                                        {todayAttendance?.checkOut ? 'Checked Out' : 'Check Out'}
                                    </button>
                                </div>

                                {todayAttendance && (
                                    <div className="current-status">
                                        <div className="status-item">
                                            <span className="status-label">Check In</span>
                                            <span className="status-value">
                                                {formatTime(todayAttendance.checkIn)}
                                            </span>
                                        </div>
                                        <div className="status-item">
                                            <span className="status-label">Check Out</span>
                                            <span className="status-value">
                                                {formatTime(todayAttendance.checkOut)}
                                            </span>
                                        </div>
                                        <div className="status-item">
                                            <span className="status-label">Work Hours</span>
                                            <span className="status-value">
                                                {todayAttendance.workHours?.toFixed(2) || '0.00'} hrs
                                            </span>
                                        </div>
                                        <div className="status-item">
                                            <span className="status-label">Status</span>
                                            <span className={`badge ${getStatusBadgeClass(todayAttendance.status)}`}>
                                                {todayAttendance.status}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attendance History */}
                            <div className="attendance-card">
                                <div className="section-header">
                                    <h2 className="section-title" style={{ margin: 0 }}>Attendance History</h2>
                                </div>

                                <div className="filters">
                                    <div className="filter-group">
                                        <label className="form-label">From:</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            className="form-input"
                                            value={dateRange.startDate}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label className="form-label">To:</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            className="form-input"
                                            value={dateRange.endDate}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                </div>

                                {attendanceRecords.length > 0 ? (
                                    <div className="attendance-table-wrapper">
                                        <table className="attendance-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Check In</th>
                                                    <th>Check Out</th>
                                                    <th>Work Hours</th>
                                                    <th>Status</th>
                                                    <th>Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceRecords.map((record) => (
                                                    <tr key={record._id}>
                                                        <td>{formatDate(record.date)}</td>
                                                        <td>
                                                            <span className="time-badge">
                                                                {formatTime(record.checkIn)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="time-badge">
                                                                {formatTime(record.checkOut)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="hours-badge">
                                                                {record.workHours?.toFixed(2) || '0.00'} hrs
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td>{record.remarks || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">📭</div>
                                        <p>No attendance records found for the selected date range</p>
                                    </div>
                                )}
                            </div>

                            {/* Statistics */}
                            {attendanceRecords.length > 0 && (
                                <div className="stats-grid">
                                    <div className="stat-card success">
                                        <div className="stat-icon">✅</div>
                                        <div className="stat-label">Present Days</div>
                                        <div className="stat-value">
                                            {attendanceRecords.filter(r => r.status === 'Present').length}
                                        </div>
                                    </div>
                                    <div className="stat-card warning">
                                        <div className="stat-icon">⏰</div>
                                        <div className="stat-label">Half Days</div>
                                        <div className="stat-value">
                                            {attendanceRecords.filter(r => r.status === 'Half-day').length}
                                        </div>
                                    </div>
                                    <div className="stat-card error">
                                        <div className="stat-icon">❌</div>
                                        <div className="stat-label">Absent Days</div>
                                        <div className="stat-value">
                                            {attendanceRecords.filter(r => r.status === 'Absent').length}
                                        </div>
                                    </div>
                                    <div className="stat-card info">
                                        <div className="stat-icon">🏖️</div>
                                        <div className="stat-label">Leave Days</div>
                                        <div className="stat-value">
                                            {attendanceRecords.filter(r => r.status === 'Leave').length}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* All Employees Tab */}
                    {activeTab === 'all-employees' && (isAdmin || isHR) && (
                        <div className="attendance-card">
                            <h2 className="section-title">All Employees Attendance History</h2>

                            {/* Date Range Filter */}
                            <div className="date-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label>From:</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>To:</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Attendance Table */}
                            {allEmployeesAttendance.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Employee</th>
                                                <th>Date</th>
                                                <th>Check In</th>
                                                <th>Check Out</th>
                                                <th>Hours Worked</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allEmployeesAttendance.map((record) => (
                                                <tr key={record._id}>
                                                    <td>
                                                        <div className="employee-info">
                                                            <strong>{record.user?.firstName} {record.user?.lastName}</strong>
                                                            <small>{record.user?.employeeId}</small>
                                                        </div>
                                                    </td>
                                                    <td>{formatDate(record.date)}</td>
                                                    <td>
                                                        <span className="time-badge">
                                                            {formatTime(record.checkIn)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="time-badge">
                                                            {formatTime(record.checkOut)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="hours-badge">
                                                            {calculateHours(record.checkIn, record.checkOut)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <p>No attendance records found for the selected date range</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Attendance;
