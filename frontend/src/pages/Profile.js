import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/services';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Helper function to get full image URL
    const getImageUrl = (path, name = 'User') => {
        if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
        if (path.startsWith('http')) return path;
        // Remove /api from the URL since uploads are served at root level
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');
        return `${baseUrl}${path}`;
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile();
            setProfile(response.data);
            setFormData({
                phone: response.data.phone || '',
                address: response.data.address || {},
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({
            phone: profile.phone || '',
            address: profile.address || {},
        });
    };

    const handleSave = async () => {
        try {
            await userService.updateProfile(formData);
            alert('✅ Profile updated successfully!');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData({
                ...formData,
                address: {
                    ...formData.address,
                    [addressField]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const response = await userService.uploadProfilePicture(file);
            alert('✅ Profile picture updated!');
            fetchProfile();
            updateUser({ ...user, profilePicture: response.data.profilePicture });
        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
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
                        <h1 className="dashboard-welcome">My Profile</h1>
                        <p className="dashboard-subtitle">View and manage your personal information</p>
                    </div>
                </div>

                <div className="container">

                    <div className="profile-grid">
                        {/* Sidebar */}
                        <div className="profile-sidebar">
                            <div className="profile-card">
                                <img
                                    src={getImageUrl(profile?.profilePicture, `${profile?.firstName} ${profile?.lastName}`)}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                                <h2 className="profile-name">
                                    {profile?.firstName} {profile?.lastName}
                                </h2>
                                <p className="profile-role">{profile?.role}</p>
                                <span className="badge badge-primary">{profile?.employeeId}</span>

                                <input
                                    type="file"
                                    id="profilePicture"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfilePictureUpload}
                                />
                                <button
                                    className="btn btn-secondary upload-btn"
                                    onClick={() => document.getElementById('profilePicture').click()}
                                >
                                    Change Photo
                                </button>
                            </div>

                            <div className="info-section">
                                <h3 className="section-title" style={{ fontSize: '1.125rem' }}>
                                    Leave Balance
                                </h3>
                                <div className="info-item">
                                    <span className="info-label">Paid Leave</span>
                                    <span className="info-value">{profile?.leaveBalance?.paidLeave || 0} days</span>
                                </div>
                                <div className="info-item" style={{ marginTop: '1rem' }}>
                                    <span className="info-label">Sick Leave</span>
                                    <span className="info-value">{profile?.leaveBalance?.sickLeave || 0} days</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="profile-main">
                            {/* Personal Information */}
                            <div className="info-section">
                                <div className="section-header">
                                    <h3 className="section-title" style={{ margin: 0 }}>Personal Information</h3>
                                    {!editing ? (
                                        <button className="btn btn-primary" onClick={handleEdit}>
                                            Edit
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-success" onClick={handleSave}>
                                                Save
                                            </button>
                                            <button className="btn btn-outline" onClick={handleCancel}>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">First Name</span>
                                        <span className="info-value">{profile?.firstName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Last Name</span>
                                        <span className="info-value">{profile?.lastName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{profile?.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone</span>
                                        {editing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-input"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            <span className="info-value">{profile?.phone || 'Not provided'}</span>
                                        )}
                                    </div>
                                </div>

                                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Address</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Street</span>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="address.street"
                                                className="form-input"
                                                value={formData.address?.street || ''}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            <span className="info-value">{profile?.address?.street || 'Not provided'}</span>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">City</span>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="address.city"
                                                className="form-input"
                                                value={formData.address?.city || ''}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            <span className="info-value">{profile?.address?.city || 'Not provided'}</span>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">State</span>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="address.state"
                                                className="form-input"
                                                value={formData.address?.state || ''}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            <span className="info-value">{profile?.address?.state || 'Not provided'}</span>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Zip Code</span>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="address.zipCode"
                                                className="form-input"
                                                value={formData.address?.zipCode || ''}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            <span className="info-value">{profile?.address?.zipCode || 'Not provided'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Job Information */}
                            <div className="info-section">
                                <h3 className="section-title">Job Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Department</span>
                                        <span className="info-value">{profile?.department}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Designation</span>
                                        <span className="info-value">{profile?.designation}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Employment Type</span>
                                        <span className="info-value">{profile?.employmentType}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Joining Date</span>
                                        <span className="info-value">
                                            {new Date(profile?.joiningDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Salary Information */}
                            <div className="info-section">
                                <h3 className="section-title">Salary Information</h3>
                                <div className="salary-breakdown">
                                    <div className="salary-item">
                                        <div className="salary-label">Basic Salary</div>
                                        <div className="salary-amount">
                                            ₹{profile?.salary?.basicSalary?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <div className="salary-item">
                                        <div className="salary-label">Allowances</div>
                                        <div className="salary-amount">
                                            ₹{profile?.salary?.allowances?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <div className="salary-item">
                                        <div className="salary-label">Deductions</div>
                                        <div className="salary-amount">
                                            ₹{profile?.salary?.deductions?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <div className="salary-item" style={{ background: 'var(--success-light)' }}>
                                        <div className="salary-label">Net Salary</div>
                                        <div className="salary-amount" style={{ color: 'var(--success-color)' }}>
                                            ₹{profile?.salary?.netSalary?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
