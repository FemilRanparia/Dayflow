import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrganizationSelector.css';

const OrganizationSelector = ({ email, onSelect, onBack }) => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrganizations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/organizations-by-email`,
                { email }
            );

            if (response.data.success) {
                setOrganizations(response.data.data);

                // Auto-select if only one organization
                if (response.data.data.length === 1) {
                    onSelect(response.data.data[0]);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch organizations');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="org-selector-container">
                <div className="org-selector-loading">
                    <div className="spinner"></div>
                    <p>Loading organizations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="org-selector-container">
                <div className="alert alert-error">
                    <span>❌</span> {error}
                </div>
                <button onClick={onBack} className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                    ← Back to Email
                </button>
            </div>
        );
    }

    if (organizations.length === 0) {
        return (
            <div className="org-selector-container">
                <div className="alert alert-warning">
                    <span>⚠️</span> No organizations found for this email
                </div>
                <button onClick={onBack} className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                    ← Try Different Email
                </button>
            </div>
        );
    }

    return (
        <div className="org-selector-container">
            <div className="org-selector-header">
                <h3>Select Your Organization</h3>
                <p>Choose the organization you want to access</p>
            </div>

            <div className="org-list">
                {organizations.map((org) => (
                    <div
                        key={org.id}
                        className="org-card"
                        onClick={() => onSelect(org)}
                        style={{ borderColor: org.brandColor }}
                    >
                        <div className="org-card-header">
                            {org.logo ? (
                                <img src={org.logo} alt={org.name} className="org-logo" />
                            ) : (
                                <div
                                    className="org-logo-placeholder"
                                    style={{ backgroundColor: org.brandColor }}
                                >
                                    {org.name.charAt(0)}
                                </div>
                            )}
                            <div className="org-info">
                                <h4>{org.name}</h4>
                                <p className="org-subdomain">{org.subdomain}.dayflow.com</p>
                            </div>
                        </div>
                        <div className="org-card-footer">
                            <span className="org-role" style={{ backgroundColor: `${org.brandColor}20`, color: org.brandColor }}>
                                {org.userRole}
                            </span>
                            <span className="org-arrow">→</span>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onBack} className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                ← Back to Email
            </button>
        </div>
    );
};

export default OrganizationSelector;
