import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './OrganizationSettings.css';

const API_URL = process.env.REACT_APP_API_URL;

const OrganizationSettings = () => {
    const { user } = useAuth();
    const { organization: contextOrg, updateOrganization: updateContextOrg } = useOrganization();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [organization, setOrganization] = useState({
        name: '',
        subdomain: '',
        contactEmail: '',
        contactPhone: '',
        logo: '',
        brandColor: '#667eea',
        plan: 'Free',
        maxEmployees: 10,
    });

    const [stats, setStats] = useState({
        currentEmployees: 0,
        maxEmployees: 10,
        trialDaysLeft: 0,
        isTrialActive: false,
    });

    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        contactPhone: '',
    });

    const [brandColor, setBrandColor] = useState('#667eea');
    const [headerColor, setHeaderColor] = useState('#667eea');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        fetchOrganizationData();
    }, []);

    const fetchOrganizationData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch organization details
            const orgResponse = await axios.get(`${API_URL}/organizations/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const orgData = orgResponse.data.data;
            setOrganization(orgData);
            setFormData({
                name: orgData.name,
                contactEmail: orgData.contactEmail,
                contactPhone: orgData.contactPhone || '',
            });
            setBrandColor(orgData.brandColor || '#667eea');
            setHeaderColor(orgData.headerColor || '#667eea');
            setLogoPreview(orgData.logo ? `${API_URL}${orgData.logo}` : '');

            // Fetch organization stats
            const statsResponse = await axios.get(`${API_URL}/organizations/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setStats(statsResponse.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load organization data');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/organizations/current`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setOrganization(response.data.data);
            setSuccess('Organization details updated successfully!');

            // Update context
            updateContextOrg(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update organization');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('File size must be less than 2MB');
                return;
            }

            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadLogo = async () => {
        if (!logoFile) {
            setError('Please select a logo file');
            return;
        }

        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('logo', logoFile);

            const response = await axios.post(
                `${API_URL}/organizations/logo`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const newLogoUrl = response.data.data.logo;
            setOrganization({ ...organization, logo: newLogoUrl });
            setLogoPreview(`${API_URL}${newLogoUrl}`);
            setLogoFile(null);
            setSuccess('Logo uploaded successfully!');

            // Update context
            updateContextOrg({ ...organization, logo: newLogoUrl });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload logo');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveLogo = async () => {
        if (!window.confirm('Are you sure you want to remove the logo?')) {
            return;
        }

        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/organizations/logo`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrganization({ ...organization, logo: null });
            setLogoPreview('');
            setLogoFile(null);
            setSuccess('Logo removed successfully!');

            // Update context
            updateContextOrg({ ...organization, logo: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove logo');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateBranding = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/organizations/branding`,
                { brandColor, headerColor },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const updatedOrg = { ...organization, brandColor, headerColor };
            setOrganization(updatedOrg);
            setSuccess('Branding updated successfully!');

            // Update context
            updateContextOrg(updatedOrg);

            // Apply colors globally via CSS variables
            document.documentElement.style.setProperty('--brand-color', brandColor);
            document.documentElement.style.setProperty('--primary-color', brandColor);
            document.documentElement.style.setProperty('--header-color', headerColor);

            // Update gradients
            document.documentElement.style.setProperty(
                '--primary-gradient',
                `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`
            );
            document.documentElement.style.setProperty(
                '--header-gradient',
                `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%)`
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update branding');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading organization settings...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div
                    className="dashboard-header"
                >
                    <div className="container">
                        <h1 className="dashboard-welcome">Organization Settings</h1>
                        <p className="dashboard-subtitle">Manage your organization profile & branding</p>
                    </div>
                </div>

                <div className="container">
                    {error && (
                        <div className="alert alert-error">
                            <span>❌</span> {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <span>✅</span> {success}
                        </div>
                    )}

                    <div className="settings-container">
                        {/* Tabs */}
                        <div className="settings-tabs">
                            <button
                                className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                📋 General
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'branding' ? 'active' : ''}`}
                                onClick={() => setActiveTab('branding')}
                            >
                                🎨 Branding
                            </button>
                            {user?.role !== 'SuperAdmin' && (
                                <button
                                    className={`tab-button ${activeTab === 'subscription' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('subscription')}
                                >
                                    💳 Subscription
                                </button>
                            )}
                        </div>

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="settings-content">
                                <div className="settings-card">
                                    <h2>Organization Details</h2>
                                    <form onSubmit={handleUpdateDetails}>
                                        <div className="form-group">
                                            <label>Organization Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Subdomain (Read-only)</label>
                                            <input
                                                type="text"
                                                value={organization.subdomain}
                                                disabled
                                                className="form-input"
                                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                            />
                                            <small className="form-hint">
                                                Your organization URL: {organization.subdomain}.dayflow.com
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>Contact Email *</label>
                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={formData.contactEmail}
                                                onChange={handleInputChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Contact Phone</label>
                                            <input
                                                type="tel"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? 'Updating...' : 'Update Details'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Branding Tab */}
                        {activeTab === 'branding' && (
                            <div className="settings-content">
                                <div className="settings-card">
                                    <h2>Organization Logo</h2>
                                    <div className="logo-section">
                                        {logoPreview && (
                                            <div className="logo-preview">
                                                <img src={logoPreview} alt="Organization Logo" />
                                            </div>
                                        )}

                                        <div className="logo-actions">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                id="logo-upload"
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="logo-upload" className="btn btn-secondary">
                                                Choose File
                                            </label>

                                            {logoFile && (
                                                <button
                                                    onClick={handleUploadLogo}
                                                    className="btn btn-primary"
                                                    disabled={saving}
                                                >
                                                    {saving ? 'Uploading...' : 'Upload Logo'}
                                                </button>
                                            )}

                                            {organization.logo && (
                                                <button
                                                    onClick={handleRemoveLogo}
                                                    className="btn btn-danger"
                                                    disabled={saving}
                                                >
                                                    Remove Logo
                                                </button>
                                            )}
                                        </div>

                                        <small className="form-hint">
                                            Supported formats: PNG, JPG, SVG. Max size: 2MB
                                        </small>
                                    </div>
                                </div>

                                <div className="settings-card">
                                    <h2>Brand Colors</h2>
                                    <div className="color-section">
                                        <div className="color-picker-group">
                                            <label>Primary Color</label>
                                            <div className="color-input-group">
                                                <input
                                                    type="color"
                                                    value={brandColor}
                                                    onChange={(e) => setBrandColor(e.target.value)}
                                                    className="color-picker"
                                                />
                                                <input
                                                    type="text"
                                                    value={brandColor}
                                                    onChange={(e) => setBrandColor(e.target.value)}
                                                    className="form-input"
                                                    placeholder="#667eea"
                                                    pattern="^#[A-Fa-f0-9]{6}$"
                                                />
                                            </div>
                                            <div
                                                className="color-preview"
                                                style={{ backgroundColor: brandColor }}
                                            ></div>
                                        </div>

                                        <div className="color-picker-group">
                                            <label>Header Color</label>
                                            <div className="color-input-group">
                                                <input
                                                    type="color"
                                                    value={headerColor}
                                                    onChange={(e) => setHeaderColor(e.target.value)}
                                                    className="color-picker"
                                                />
                                                <input
                                                    type="text"
                                                    value={headerColor}
                                                    onChange={(e) => setHeaderColor(e.target.value)}
                                                    className="form-input"
                                                    placeholder="#667eea"
                                                    pattern="^#[A-Fa-f0-9]{6}$"
                                                />
                                            </div>
                                            <div
                                                className="color-preview"
                                                style={{ backgroundColor: headerColor }}
                                            ></div>
                                        </div>

                                        <button
                                            onClick={handleUpdateBranding}
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? 'Updating...' : 'Update Colors'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Subscription Tab */}
                        {activeTab === 'subscription' && user?.role !== 'SuperAdmin' && (
                            <div className="settings-content">
                                <div className="settings-card">
                                    <h2>Subscription Details</h2>
                                    <div className="subscription-info">
                                        <div className="info-row">
                                            <span className="info-label">Current Plan:</span>
                                            <span className="info-value">
                                                <span className={`badge badge-${organization.plan.toLowerCase()}`}>
                                                    {organization.plan}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="info-row">
                                            <span className="info-label">Employee Usage:</span>
                                            <span className="info-value">
                                                {stats.currentEmployees} / {stats.maxEmployees} employees
                                            </span>
                                        </div>

                                        <div className="usage-bar">
                                            <div
                                                className="usage-fill"
                                                style={{
                                                    width: `${(stats.currentEmployees / stats.maxEmployees) * 100}%`,
                                                }}
                                            ></div>
                                        </div>

                                        {stats.isTrialActive && (
                                            <div className="trial-info">
                                                <div className="info-row">
                                                    <span className="info-label">Trial Status:</span>
                                                    <span className="info-value">
                                                        <span className="badge badge-warning">Active</span>
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Days Remaining:</span>
                                                    <span className="info-value">{stats.trialDaysLeft} days</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="settings-card">
                                    <h2>Plan Limits</h2>
                                    <div className="plan-limits">
                                        <div className="limit-item">
                                            <span className="limit-label">Max Employees:</span>
                                            <span className="limit-value">{stats.maxEmployees}</span>
                                        </div>
                                        <div className="limit-item">
                                            <span className="limit-label">Features:</span>
                                            <span className="limit-value">
                                                {organization.plan === 'Free' && 'Basic Features'}
                                                {organization.plan === 'Basic' && 'Standard Features'}
                                                {organization.plan === 'Premium' && 'All Features'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrganizationSettings;
