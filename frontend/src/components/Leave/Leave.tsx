import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import './Leave.css';

const Leave: React.FC = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves/my-leaves');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leaves/apply', formData);
      setMessage('Leave request submitted successfully');
      setShowForm(false);
      setFormData({
        leaveType: 'paid',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  return (
    <div className="leave-container">
      <div className="leave-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h2>Leave Management</h2>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="leave-actions">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Apply for Leave'}
        </button>
      </div>

      {showForm && (
        <div className="leave-form">
          <h3>Apply for Leave</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Leave Type</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                required
              >
                <option value="paid">Paid Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>
            <button type="submit" className="btn-submit">
              Submit Leave Request
            </button>
          </form>
        </div>
      )}

      <div className="leave-list">
        <h3>My Leave Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td className="leave-type">{leave.leaveType}</td>
                <td>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</td>
                <td>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</td>
                <td>{leave.reason || '-'}</td>
                <td>
                  <span className={`status-badge status-${leave.status}`}>
                    {leave.status}
                  </span>
                </td>
                <td>{leave.approverComments || '-'}</td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No leave requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leave;
