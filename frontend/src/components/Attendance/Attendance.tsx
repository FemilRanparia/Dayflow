import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import './Attendance.css';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkedOutToday, setCheckedOutToday] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/${user?.employeeId}`);
      setAttendance(response.data);

      // Check if already checked in today
      const today = new Date().toDateString();
      const todayRecord = response.data.find(
        (record: any) => new Date(record.date).toDateString() === today
      );
      if (todayRecord) {
        setCheckedInToday(true);
        if (todayRecord.checkOut) {
          setCheckedOutToday(true);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin');
      setMessage('Checked in successfully');
      fetchAttendance();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout');
      setMessage('Checked out successfully');
      fetchAttendance();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to check out');
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h2>My Attendance</h2>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="attendance-actions">
        <button
          onClick={handleCheckIn}
          disabled={checkedInToday}
          className="btn-checkin"
        >
          {checkedInToday ? 'Already Checked In' : 'Check In'}
        </button>
        <button
          onClick={handleCheckOut}
          disabled={!checkedInToday || checkedOutToday}
          className="btn-checkout"
        >
          {checkedOutToday ? 'Already Checked Out' : 'Check Out'}
        </button>
      </div>

      <div className="attendance-list">
        <h3>Attendance History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record._id}>
                <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                <td>
                  {record.checkIn
                    ? format(new Date(record.checkIn), 'hh:mm a')
                    : '-'}
                </td>
                <td>
                  {record.checkOut
                    ? format(new Date(record.checkOut), 'hh:mm a')
                    : '-'}
                </td>
                <td>
                  <span className={`status-badge status-${record.status}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.remarks || '-'}</td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
