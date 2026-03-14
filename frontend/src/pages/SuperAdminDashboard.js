import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './SuperAdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL;

const SuperAdminDashboard = () => {
    const { isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState([]);
    const [stats, setStats] = useState({
        totalOrganizations: 0,
        activeOrganizations: 0,
        totalUsers: 0,
        trialOrganizations: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1); // 1: Organization, 2: Admin User
    const [formData, setFormData] = useState({
        // Organization
        name: '',
        subdomain: '',
        contactEmail: '',
        contactPhone: '',
        plan: 'Free',
        // Admin User
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    // Helper function to get full logo URL
    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        // Remove /api from the URL since uploads are served at root level
        const baseUrl = (API_URL || 'http://localhost:5000').replace('/api', '');
        return `${baseUrl}${logoPath}`;
    };

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchDashboardData();
    }, [isSuperAdmin, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch all organizations
            const orgsResponse = await axios.get(
                `${process.env.REACT_APP_API_URL}/super-admin/organizations`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (orgsResponse.data.success) {
                const orgs = orgsResponse.data.data;
                setOrganizations(orgs);

                // Calculate stats
                setStats({
                    totalOrganizations: orgs.length,
                    activeOrganizations: orgs.filter(o => o.isActive).length,
                    totalUsers: orgs.reduce((sum, o) => sum + (o.employeeCount || 0), 0),
                    trialOrganizations: orgs.filter(o => o.isTrialActive && !o.subscriptionEndDate).length,
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Auto-generate subdomain
        if (name === 'name') {
            const subdomain = value
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 20);
            setFormData(prev => ({
                ...prev,
                subdomain,
            }));
        }
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setModalError('');

        if (!formData.name || !formData.subdomain || !formData.contactEmail) {
            setModalError('Please fill in all required fields');
            return;
        }

        setModalStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalLoading(true);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setModalError('Please fill in all admin user fields');
            setModalLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Create organization with admin user
            await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/register-organization`,
                {
                    organization: {
                        name: formData.name,
                        subdomain: formData.subdomain,
                        contactEmail: formData.contactEmail,
                        contactPhone: formData.contactPhone,
                        plan: formData.plan,
                    },
                    admin: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                    },
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Reset form and close modal
            setFormData({
                name: '',
                subdomain: '',
                contactEmail: '',
                contactPhone: '',
                plan: 'Free',
                firstName: '',
                lastName: '',
                email: '',
                password: '',
            });
            setModalStep(1);
            setShowModal(false);

            // Refresh data
            fetchDashboardData();

            alert('✅ Organization and admin user created successfully!\n📧 Verification email sent to ' + formData.email + '\n\nThe admin must verify their email before logging in.');
        } catch (err) {
            setModalError(err.response?.data?.message || 'Failed to create organization');
        } finally {
            setModalLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setModalStep(1);
        setModalError('');
        setFormData({
            name: '',
            subdomain: '',
            contactEmail: '',
            contactPhone: '',
            plan: 'Free',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    const toggleOrganizationStatus = async (orgId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/super-admin/organizations/${orgId}/toggle-status`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh data
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update organization status');
        }
    };

    const getPlanBadgeClass = (plan) => {
        const classes = {
            Free: 'badge-free',
            Basic: 'badge-basic',
            Premium: 'badge-premium',
            Enterprise: 'badge-enterprise',
        };
        return classes[plan] || 'badge-free';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="super-admin-dashboard">
                <div className="dashboard-header">
                    <h1>Super Admin Dashboard</h1>
                    <p>Platform Management & Analytics</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>❌</span> {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-primary">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-content">
                            <h3>{stats.totalOrganizations}</h3>
                            <p>Total Organizations</p>
                        </div>
                    </div>
                    <div className="stat-card stat-success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>{stats.activeOrganizations}</h3>
                            <p>Active Organizations</p>
                        </div>
                    </div>
                    <div className="stat-card stat-info">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>{stats.totalUsers}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div className="stat-card stat-warning">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-content">
                            <h3>{stats.trialOrganizations}</h3>
                            <p>Trial Organizations</p>
                        </div>
                    </div>
                </div>

                {/* Organizations Table */}
                <div className="organizations-section">
                    <div className="section-header">
                        <h2>Organizations</h2>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            + Add Organization
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="organizations-table">
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>Subdomain</th>
                                    <th>Plan</th>
                                    <th>Employees</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.map((org) => (
                                    <tr key={org._id}>
                                        <td>
                                            <div className="org-cell">
                                                {org.logo ? (
                                                    <img
                                                        src={getLogoUrl(org.logo)}
                                                        alt={org.name}
                                                        className="org-logo-small"
                                                    />
                                                ) : (
                                                    <div
                                                        className="org-icon-small"
                                                        style={{ backgroundColor: org.brandColor }}
                                                    >
                                                        {org.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>{org.name}</strong>
                                                    <br />
                                                    <small>{org.contactEmail}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <code>{org.subdomain}.dayflow.com</code>
                                        </td>
                                        <td>
                                            <span className={`badge ${getPlanBadgeClass(org.plan)}`}>
                                                {org.plan}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="employee-count">
                                                {org.employeeCount || 0} / {org.maxEmployees}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${org.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {org.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className={`btn btn-sm ${org.isActive ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => toggleOrganizationStatus(org._id, org.isActive)}
                                                >
                                                    {org.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Organization Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Organization</h2>
                            <button className="modal-close" onClick={handleModalClose}>×</button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="progress-indicator">
                            <div className={`progress-step ${modalStep >= 1 ? 'active' : ''}`}>
                                <div className="progress-number">1</div>
                                <span>Organization</span>
                            </div>
                            <div className="progress-line"></div>
                            <div className={`progress-step ${modalStep >= 2 ? 'active' : ''}`}>
                                <div className="progress-number">2</div>
                                <span>Admin User</span>
                            </div>
                        </div>

                        {modalError && (
                            <div className="alert alert-error">
                                <span>❌</span> {modalError}
                            </div>
                        )}

                        {/* Step 1: Organization Details */}
                        {modalStep === 1 && (
                            <form onSubmit={handleStep1Submit}>
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">
                                        Organization Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        placeholder="Acme Corporation"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subdomain" className="form-label">
                                        Subdomain *
                                    </label>
                                    <div className="subdomain-input">
                                        <input
                                            type="text"
                                            id="subdomain"
                                            name="subdomain"
                                            className="form-input"
                                            placeholder="acme"
                                            value={formData.subdomain}
                                            onChange={handleChange}
                                            required
                                            pattern="[a-z0-9]{3,20}"
                                        />
                                        <span className="subdomain-suffix">.dayflow.com</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contactEmail" className="form-label">
                                        Contact Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="contactEmail"
                                        name="contactEmail"
                                        className="form-input"
                                        placeholder="admin@acme.com"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contactPhone" className="form-label">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id="contactPhone"
                                        name="contactPhone"
                                        className="form-input"
                                        placeholder="+1 (555) 123-4567"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="plan" className="form-label">
                                        Plan
                                    </label>
                                    <select
                                        id="plan"
                                        name="plan"
                                        className="form-input"
                                        value={formData.plan}
                                        onChange={handleChange}
                                    >
                                        <option value="Free">Free - Up to 10 employees</option>
                                        <option value="Basic">Basic - Up to 50 employees</option>
                                        <option value="Premium">Premium - Up to 1000 employees</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleModalClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Next: Admin User →
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 2: Admin User Details */}
                        {modalStep === 2 && (
                            <form onSubmit={handleStep2Submit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className="form-input"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className="form-input"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Admin Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="john@acme.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="form-input"
                                        placeholder="At least 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                    />
                                    <small className="form-hint">
                                        Admin will use this email and password to login
                                    </small>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setModalStep(1)}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={modalLoading}
                                    >
                                        {modalLoading ? 'Creating...' : 'Create Organization & Admin'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SuperAdminDashboard;
