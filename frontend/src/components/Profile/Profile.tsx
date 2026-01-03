import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Employee } from '../../types';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, employee: authEmployee } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(authEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authEmployee) {
      setEmployee(authEmployee);
      setFormData({
        phone: authEmployee.personalDetails.phone || '',
        address: authEmployee.personalDetails.address || '',
      });
    }
  }, [authEmployee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${user?.employeeId}`, {
        personalDetails: formData,
      });
      setMessage('Profile updated successfully');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      setMessage('Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h2>My Profile</h2>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Details</h3>
          <div className="profile-field">
            <label>Employee ID:</label>
            <span>{employee?.employeeId}</span>
          </div>
          <div className="profile-field">
            <label>Name:</label>
            <span>
              {employee?.personalDetails.firstName} {employee?.personalDetails.lastName}
            </span>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>

          {!isEditing ? (
            <>
              <div className="profile-field">
                <label>Phone:</label>
                <span>{employee?.personalDetails.phone || 'Not set'}</span>
              </div>
              <div className="profile-field">
                <label>Address:</label>
                <span>{employee?.personalDetails.address || 'Not set'}</span>
              </div>
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h3>Job Details</h3>
          <div className="profile-field">
            <label>Designation:</label>
            <span>{employee?.jobDetails.designation || 'Not set'}</span>
          </div>
          <div className="profile-field">
            <label>Department:</label>
            <span>{employee?.jobDetails.department || 'Not set'}</span>
          </div>
          <div className="profile-field">
            <label>Employment Type:</label>
            <span>{employee?.jobDetails.employmentType || 'Not set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
