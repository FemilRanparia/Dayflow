import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { authService } from '../services/services';
import './Auth.css';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const { updateOrganization } = useOrganization();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const data = await authService.verifyEmail(token);

                // Update auth context with user data
                if (data.user) {
                    updateUser(data.user);
                }

                // Update organization context if user has organization
                if (data.user && data.user.organization) {
                    updateOrganization(data.user.organization);
                }

                setStatus('success');
                setMessage('Email verified successfully! Redirecting to dashboard...');
                setTimeout(() => navigate('/dashboard'), 2000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Invalid or expired token.');
            }
        };

        verifyEmail();
    }, [token, navigate, updateUser, updateOrganization]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        {status === 'verifying' && '⏳'}
                        {status === 'success' && '✅'}
                        {status === 'error' && '❌'}
                    </div>
                    <h1 className="auth-title">
                        {status === 'verifying' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>
                    <p className="auth-subtitle">{message}</p>
                </div>

                {status === 'verifying' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
