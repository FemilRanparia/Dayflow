import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './LeaveManagement.css';

const API_URL = process.env.REACT_APP_API_URL;

const LeaveManagement = () => {
    const { user, isAdmin, isHR } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [formData, setFormData] = useState({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    useEffect(() => {
        filterLeaves();
    }, [statusFilter, typeFilter, leaves]);

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = isAdmin || isHR ? '/leaves' : '/leaves/my-leaves';
            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaves(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leaves');
            setLoading(false);
        }
    };

    const filterLeaves = () => {
        let filtered = leaves;

        if (statusFilter) {
            filtered = filtered.filter((leave) => leave.status === statusFilter);
        }

        if (typeFilter) {
            filtered = filtered.filter((leave) => leave.leaveType === typeFilter);
        }

        setFilteredLeaves(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/leaves`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Leave application submitted successfully!');
            setShowModal(false);
            fetchLeaves();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave application');
        }
    };

    const handleUpdateStatus = async (leaveId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/leaves/${leaveId}/status`,
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSuccess(`Leave ${status.toLowerCase()} successfully!`);
            fetchLeaves();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update leave status');
        }
    };

    const handleCancelLeave = async (leaveId) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/leaves/${leaveId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Leave request cancelled successfully!');
            fetchLeaves();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel leave request');
        }
    };

    const resetForm = () => {
        setFormData({
            leaveType: 'Paid',
            startDate: '',
            endDate: '',
            reason: '',
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved':
                return '';
            case 'Rejected':
                return '';
            case 'Pending':
                return '';
            default:
                return '';
        }
    };

    const getLeaveTypeIcon = (type) => {
        switch (type) {
            case 'Paid Leave':
                return '💰';
            case 'Sick Leave':
                return '🤒';
            case 'Unpaid Leave':
                return '📅';
            default:
                return '📋';
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading leave requests...</p>
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
                        <h1 className="dashboard-welcome">Leave Management</h1>
                        <p className="dashboard-subtitle">Apply for and manage your leave requests</p>
                    </div>
                </div>

                <div className="container">
                    <div className="actions-header">
                        <button className="btn-apply" onClick={() => setShowModal(true)}>
                            ➕ Apply for Leave
                        </button>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Leave Balance */}
                    <div className="leave-balance-section">
                        <h2>📊 Your Leave Balance</h2>
                        <div className="balance-cards">
                            <div className="balance-card paid">
                                <div className="balance-icon">💰</div>
                                <div className="balance-info">
                                    <h3>Paid Leave</h3>
                                    <p className="balance-count">{user?.leaveBalance?.paidLeave || 0} days</p>
                                </div>
                            </div>
                            <div className="balance-card sick">
                                <div className="balance-icon">🤒</div>
                                <div className="balance-info">
                                    <h3>Sick Leave</h3>
                                    <p className="balance-count">{user?.leaveBalance?.sickLeave || 0} days</p>
                                </div>
                            </div>
                            <div className="balance-card unpaid">
                                <div className="balance-icon">📅</div>
                                <div className="balance-info">
                                    <h3>Unpaid Leave</h3>
                                    <p className="balance-count">{user?.leaveBalance?.unpaidLeave || 0} days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="leave-filters" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div className="filter-group">
                            <label>Filter by Status:</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Filter by Type:</label>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="">All Types</option>
                                <option value="Paid">Paid Leave</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Unpaid">Unpaid Leave</option>
                            </select>
                        </div>
                    </div>

                    {/* Leave Requests Table */}
                    <div className="leave-table-container">
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    {(isAdmin || isHR) && <th>Employee</th>}
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaves.map((leave) => (
                                    <tr key={leave._id}>
                                        {(isAdmin || isHR) && (
                                            <td>
                                                <div className="employee-cell">
                                                    <strong>
                                                        {leave.user?.firstName} {leave.user?.lastName}
                                                    </strong>
                                                    <br />
                                                    <small>{leave.user?.employeeId}</small>
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <span className="leave-type">
                                                {getLeaveTypeIcon(leave.leaveType)} {leave.leaveType}
                                            </span>
                                        </td>
                                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className="days-badge">{leave.numberOfDays}</span>
                                        </td>
                                        <td>
                                            <div 
                                                className="reason-cell clickable"
                                                onClick={() => {
                                                    setSelectedReason(leave.reason);
                                                    setShowReasonModal(true);
                                                }}
                                                title="Click to view full reason"
                                            >
                                                {leave.reason}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                                                {getStatusIcon(leave.status)} {leave.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {(isAdmin || isHR) && leave.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                                            title="Approve"
                                                        >
                                                            ✅
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                                            title="Reject"
                                                        >
                                                            ❌
                                                        </button>
                                                    </>
                                                )}
                                                {!isAdmin &&
                                                    !isHR &&
                                                    leave.status === 'Pending' &&
                                                    leave.user?._id === user?._id && (
                                                        <button
                                                            className="btn-cancel"
                                                            onClick={() => handleCancelLeave(leave._id)}
                                                            title="Cancel"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredLeaves.length === 0 && (
                            <div className="no-data">
                                <p>No leave requests found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🏖️ Apply for Leave</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✖️
                            </button>
                        </div>
                        <form onSubmit={handleSubmitLeave}>
                            <div className="form-group">
                                <label>Leave Type *</label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Paid">💰 Paid Leave</option>
                                    <option value="Sick">🤒 Sick Leave</option>
                                    <option value="Unpaid">📅 Unpaid Leave</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date *</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason *</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Please provide a reason for your leave..."
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Reason Modal */}
            {showReasonModal && (
                <div className="modal-overlay" onClick={() => setShowReasonModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📝 Leave Reason</h2>
                            <button className="modal-close" onClick={() => setShowReasonModal(false)}>
                                ✖️
                            </button>
                        </div>
                        <div style={{ padding: '1rem', lineHeight: '1.6', color: '#4a5568', whiteSpace: 'pre-wrap' }}>
                            {selectedReason}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-submit" onClick={() => setShowReasonModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LeaveManagement;
