import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import OrganizationSelector from '../components/OrganizationSelector';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Organization, 3: Password
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        organizationId: null,
    });
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { updateOrganization } = useOrganization();
    const navigate = useNavigate();

    // Helper function to get full logo URL
    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        // Remove /api from the URL since uploads are served at root level
        const baseUrl = (API_URL || 'http://localhost:5000').replace('/api', '');
        return `${baseUrl}${logoPath}`;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email) {
            setError('Please enter your email');
            return;
        }

        // Move to organization selection
        setStep(2);
    };

    const handleOrganizationSelect = (organization) => {
        setSelectedOrganization(organization);
        setFormData({
            ...formData,
            organizationId: organization.id,
        });
        // Move to password step
        setStep(3);
    };

    const handleBackToEmail = () => {
        setStep(1);
        setSelectedOrganization(null);
        setFormData({
            ...formData,
            organizationId: null,
        });
    };

    const handleBackToOrganization = () => {
        setStep(2);
        setFormData({
            ...formData,
            password: '',
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loginData = await login(formData);

            // Update organization context
            if (loginData.user.organization) {
                updateOrganization(loginData.user.organization);
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    {selectedOrganization ? (
                        <>
                            {selectedOrganization.logo ? (
                                <img
                                    src={getLogoUrl(selectedOrganization.logo)}
                                    alt={selectedOrganization.name}
                                    className="auth-logo-img"
                                />
                            ) : (
                                <div
                                    className="auth-logo"
                                    style={{ backgroundColor: selectedOrganization.brandColor }}
                                >
                                    {selectedOrganization.name.charAt(0)}
                                </div>
                            )}
                            <h1 className="auth-title">{selectedOrganization.name}</h1>
                            <p className="auth-subtitle">Sign in to continue</p>
                        </>
                    ) : (
                        <>
                            <div className="auth-logo">⚡</div>
                            <h1 className="auth-title">Welcome Back</h1>
                            <p className="auth-subtitle">Sign in to access your account</p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>❌</span> {error}
                    </div>
                )}

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Continue →
                        </button>
                    </form>
                )}

                {/* Step 2: Organization Selection */}
                {step === 2 && (
                    <OrganizationSelector
                        email={formData.email}
                        onSelect={handleOrganizationSelect}
                        onBack={handleBackToEmail}
                    />
                )}

                {/* Step 3: Password Input */}
                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                Email
                            </label>
                            <div className="form-input-readonly">
                                {formData.email}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <button
                            type="button"
                            onClick={handleBackToOrganization}
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            ← Back
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Don't have an account?
                        <Link to="/register" className="auth-footer-link">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
