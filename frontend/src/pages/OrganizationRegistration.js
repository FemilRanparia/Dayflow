import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './OrganizationRegistration.css';

const OrganizationRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Organization, 2: Admin User, 3: Success
    const [formData, setFormData] = useState({
        // Organization details
        organizationName: '',
        subdomain: '',
        contactEmail: '',
        contactPhone: '',
        plan: 'Free',

        // Admin user details
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdOrg, setCreatedOrg] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Auto-generate subdomain from organization name
        if (name === 'organizationName') {
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
        setError('');

        // Validation
        if (!formData.organizationName || !formData.subdomain || !formData.contactEmail) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.subdomain.length < 3) {
            setError('Subdomain must be at least 3 characters');
            return;
        }

        setStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Create organization and admin user
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/register-organization`,
                {
                    organization: {
                        name: formData.organizationName,
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
                }
            );

            if (response.data.success) {
                setCreatedOrg(response.data.data);
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="org-registration-container">
            <div className="org-registration-card">
                {/* Header */}
                <div className="org-registration-header">
                    <div className="org-registration-logo">🏢</div>
                    <h1>Create Your Organization</h1>
                    <p>Start your free trial today - no credit card required</p>
                </div>

                {/* Progress Indicator */}
                {step < 3 && (
                    <div className="progress-indicator">
                        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                            <div className="progress-number">1</div>
                            <span>Organization</span>
                        </div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                            <div className="progress-number">2</div>
                            <span>Admin User</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        <span>❌</span> {error}
                    </div>
                )}

                {/* Step 1: Organization Details */}
                {step === 1 && (
                    <form onSubmit={handleStep1Submit} className="org-registration-form">
                        <div className="form-group">
                            <label htmlFor="organizationName" className="form-label">
                                Organization Name *
                            </label>
                            <input
                                type="text"
                                id="organizationName"
                                name="organizationName"
                                className="form-input"
                                placeholder="Acme Corporation"
                                value={formData.organizationName}
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
                                    title="Subdomain must be 3-20 lowercase letters or numbers"
                                />
                                <span className="subdomain-suffix">.dayflow.com</span>
                            </div>
                            <small className="form-hint">
                                Your organization will be accessible at {formData.subdomain || 'your-subdomain'}.dayflow.com
                            </small>
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
                                Select Plan
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

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Continue →
                        </button>
                    </form>
                )}

                {/* Step 2: Admin User Details */}
                {step === 2 && (
                    <form onSubmit={handleStep2Submit} className="org-registration-form">
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
                                Email Address *
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Organization...' : 'Create Organization'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            ← Back
                        </button>
                    </form>
                )}

                {/* Step 3: Success */}
                {step === 3 && createdOrg && (
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Organization Created Successfully!</h2>
                        <p>Welcome to Dayflow HRMS</p>

                        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                            <span>📧</span>
                            <div>
                                <strong>Email Verification Required</strong>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                                    We've sent a verification email to <strong>{createdOrg.admin.email}</strong>.
                                    Please verify your email before logging in.
                                </p>
                            </div>
                        </div>

                        <div className="success-details">
                            <div className="success-detail">
                                <strong>Organization:</strong> {createdOrg.organization.name}
                            </div>
                            <div className="success-detail">
                                <strong>Subdomain:</strong> {createdOrg.organization.subdomain}.dayflow.com
                            </div>
                            <div className="success-detail">
                                <strong>Plan:</strong> {createdOrg.organization.plan}
                            </div>
                            <div className="success-detail">
                                <strong>Admin Email:</strong> {createdOrg.admin.email}
                            </div>
                        </div>

                        <div className="success-actions">
                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="org-registration-footer">
                    <p>
                        Already have an account?
                        <Link to="/login" className="footer-link">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegistration;
