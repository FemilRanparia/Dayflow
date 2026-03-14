import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Organizations.css';

const API_URL = process.env.REACT_APP_API_URL;

const Organizations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
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

    // Helper function to get full logo URL
    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        // Remove /api from the URL since uploads are served at root level
        const baseUrl = (API_URL || 'http://localhost:5000').replace('/api', '');
        return `${baseUrl}${logoPath}`;
    };

    useEffect(() => {
        if (user?.role !== 'SuperAdmin') {
            navigate('/dashboard');
            return;
        }
        fetchOrganizations();
    }, [user, navigate]);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/super-admin/organizations');
            setOrganizations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            alert('Failed to fetch organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Auto-generate subdomain
        if (name === 'name') {
            const subdomain = value
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                subdomain: subdomain.substring(0, 20),
            }));
        }
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
        setModalStep(1);
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

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setModalStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/super-admin/organizations', {
                name: formData.name,
                subdomain: formData.subdomain,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                plan: formData.plan,
                adminFirstName: formData.firstName,
                adminLastName: formData.lastName,
                adminEmail: formData.email,
                adminPassword: formData.password,
            });
            alert('Organization created successfully!');
            handleModalClose();
            fetchOrganizations();
        } catch (error) {
            console.error('Error creating organization:', error);
            alert(error.response?.data?.message || 'Failed to create organization');
        }
    };

    const handleViewDetails = async (org) => {
        try {
            const response = await api.get(`/super-admin/organizations/${org._id}`);
            setSelectedOrg(response.data.data);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching organization details:', error);
            alert('Failed to fetch organization details');
        }
    };

    const handleToggleStatus = async (orgId, currentStatus) => {
        try {
            await api.put(`/super-admin/organizations/${orgId}`, {
                isActive: !currentStatus,
            });
            alert(`Organization ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            fetchOrganizations();
        } catch (error) {
            console.error('Error updating organization:', error);
            alert('Failed to update organization status');
        }
    };

    const handleDeleteOrganization = async (org) => {
        const confirmMessage = `Are you sure you want to delete "${org.name}"?\n\nThis will permanently delete:\n- ${org.employeeCount || 0} users\n- All attendance records\n- All leave records\n\nThis action CANNOT be undone!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await api.delete(`/super-admin/organizations/${org._id}`);
            alert('Organization and all associated data deleted successfully!');
            fetchOrganizations();
        } catch (error) {
            console.error('Error deleting organization:', error);
            alert(error.response?.data?.message || 'Failed to delete organization');
        }
    };

    const getPlanBadgeClass = (plan) => {
        const classes = {
            Free: 'badge-free',
            Basic: 'badge-basic',
            Premium: 'badge-premium',
            Enterprise: 'badge-enterprise',
        };
        return classes[plan] || 'badge-basic';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading organizations...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="super-admin-dashboard">
                <div className="dashboard-header">
                    <h1>Organizations Management</h1>
                    <p>Manage all organizations and their administrators</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-primary">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-content">
                            <h3>{organizations.length}</h3>
                            <p>Total Organizations</p>
                        </div>
                    </div>
                    <div className="stat-card stat-success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>{organizations.filter(org => org.isActive).length}</h3>
                            <p>Active Organizations</p>
                        </div>
                    </div>
                    <div className="stat-card stat-warning">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <h3>{organizations.filter(org => !org.isActive).length}</h3>
                            <p>Inactive Organizations</p>
                        </div>
                    </div>
                </div>

                {/* Organizations Section */}
                <div className="organizations-section">
                    <div className="section-header">
                        <h2>Organizations</h2>
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            + Add Organization
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="organizations-table">
                            <thead>
                                <tr>
                                    <th>ORGANIZATION</th>
                                    <th>SUBDOMAIN</th>
                                    <th>PLAN</th>
                                    <th>EMPLOYEES</th>
                                    <th>STATUS</th>
                                    <th>CREATED</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            No organizations found. Create your first organization!
                                        </td>
                                    </tr>
                                ) : (
                                    organizations.map((org) => (
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
                                                            style={{ backgroundColor: org.brandColor || '#667eea' }}
                                                        >
                                                            {org.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong>{org.name}</strong>
                                                        <br />
                                                        <small>{org.adminEmail || '-'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <code>{org.subdomain}.dayflow.com</code>
                                            </td>
                                            <td>
                                                <span className={`badge ${getPlanBadgeClass(org.plan || 'Free')}`}>
                                                    {org.plan || 'BASIC'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="employee-count">
                                                    {org.employeeCount || 0} / {org.maxEmployees || 50}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${org.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {org.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(org.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-view"
                                                        onClick={() => handleViewDetails(org)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${org.isActive ? 'btn-warning' : 'btn-success'}`}
                                                        onClick={() => handleToggleStatus(org._id, org.isActive)}
                                                    >
                                                        {org.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteOrganization(org)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Organization Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={handleModalClose}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Create New Organization</h2>
                                <button className="modal-close" onClick={handleModalClose}>
                                    ✕
                                </button>
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
                                            onChange={handleInputChange}
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
                                                onChange={handleInputChange}
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
                                            onChange={handleInputChange}
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
                                            onChange={handleInputChange}
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
                                            onChange={handleInputChange}
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
                                                onChange={handleInputChange}
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
                                                onChange={handleInputChange}
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
                                            onChange={handleInputChange}
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
                                            onChange={handleInputChange}
                                            required
                                            minLength="6"
                                        />
                                        <small className="form-help">Admin will use this email and password to login</small>
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
                                        >
                                            Create Organization & Admin
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Organization Details Modal */}
                {showDetailsModal && selectedOrg && (
                    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{selectedOrg.name}</h2>
                                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="org-details">
                                <div className="details-section">
                                    <h3>Organization Information</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <label>Name:</label>
                                            <span>{selectedOrg.name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Subdomain:</label>
                                            <span><code>{selectedOrg.subdomain}</code></span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Status:</label>
                                            <span className={`status-badge ${selectedOrg.isActive ? 'active' : 'inactive'}`}>
                                                {selectedOrg.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Created:</label>
                                            <span>{new Date(selectedOrg.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="details-section">
                                    <h3>Administrator</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <label>Name:</label>
                                            <span>{selectedOrg.admin?.firstName} {selectedOrg.admin?.lastName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email:</label>
                                            <span>{selectedOrg.admin?.email}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Employee ID:</label>
                                            <span>{selectedOrg.admin?.employeeId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Phone:</label>
                                            <span>{selectedOrg.admin?.phone || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="details-section">
                                    <h3>Statistics</h3>
                                    <div className="stats-grid-small">
                                        <div className="stat-card-small">
                                            <div className="stat-label">Total Employees</div>
                                            <div className="stat-value">{selectedOrg.stats?.totalEmployees || 0}</div>
                                        </div>
                                        <div className="stat-card-small">
                                            <div className="stat-label">Admins</div>
                                            <div className="stat-value">{selectedOrg.stats?.admins || 0}</div>
                                        </div>
                                        <div className="stat-card-small">
                                            <div className="stat-label">HR</div>
                                            <div className="stat-value">{selectedOrg.stats?.hr || 0}</div>
                                        </div>
                                        <div className="stat-card-small">
                                            <div className="stat-label">Employees</div>
                                            <div className="stat-value">{selectedOrg.stats?.employees || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedOrg.brandColor && (
                                    <div className="details-section">
                                        <h3>Branding</h3>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <label>Brand Color:</label>
                                                <span>
                                                    <div className="color-preview" style={{ backgroundColor: selectedOrg.brandColor }}></div>
                                                    {selectedOrg.brandColor}
                                                </span>
                                            </div>
                                            {selectedOrg.logo && (
                                                <div className="detail-item">
                                                    <label>Logo:</label>
                                                    <img src={getLogoUrl(selectedOrg.logo)} alt="Logo" className="org-logo-preview" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Organizations;
